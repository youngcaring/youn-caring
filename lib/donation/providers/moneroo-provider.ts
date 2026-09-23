import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import {
  PaymentConfigurationError,
  PaymentProviderError,
} from "@/lib/donation/payment-provider";

import type {
  CreatePaymentSessionInput,
  DonationCurrency,
  DonationPaymentProvider,
  DonationPaymentStatus,
  PaymentSessionResult,
  PaymentVerificationResult,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * ADAPTATEUR DE PAIEMENT MONEROO
 * ============================================================================
 *
 * Ce fichier :
 *
 * - initialise les paiements auprès de Moneroo ;
 * - retourne uniquement une URL HTTPS Moneroo ;
 * - vérifie les paiements directement auprès de Moneroo ;
 * - vérifie les signatures HMAC-SHA256 des webhooks ;
 * - normalise les statuts reçus ;
 * - ne fait confiance à aucune donnée provenant du navigateur ;
 * - ne transmet aucune information bancaire.
 *
 * Ce fichier doit rester exclusivement côté serveur.
 * ============================================================================
 */

const MONEROO_API_BASE_URL =
  "https://api.moneroo.io";

const MONEROO_INITIALIZE_PATH =
  "/v1/payments/initialize";

const MONEROO_REQUEST_TIMEOUT_MS =
  15_000;

const MONEROO_MAX_RESPONSE_SIZE =
  500_000;

const MONEROO_MAX_WEBHOOK_SIZE =
  1_000_000;

const MAX_PROVIDER_REFERENCE_LENGTH =
  200;

const MONEROO_CHECKOUT_DOMAIN =
  "moneroo.io";

const MONEROO_SIGNATURE_PATTERN =
  /^[A-Fa-f0-9]{64}$/;

const MONEROO_REFERENCE_PATTERN =
  /^[A-Za-z0-9._:-]+$/;

const ALLOWED_CURRENCIES:
  readonly DonationCurrency[] = [
  "XOF",
  "EUR",
  "USD",
];

/**
 * Valeurs brutes pouvant être retournées
 * dans une réponse JSON.
 */
type UnknownRecord =
  Record<string, unknown>;

/**
 * Configuration privée Moneroo.
 */
type MonerooConfiguration =
  Readonly<{
    secretKey: string;
    webhookSecret: string;
  }>;

/**
 * Réponse normalisée d’une requête API.
 */
type MonerooApiResponse =
  Readonly<{
    status: number;
    body: unknown;
  }>;

/**
 * Données normalisées après
 * l’initialisation d’un paiement.
 */
type MonerooInitializedPayment =
  Readonly<{
    providerReference: string;
    checkoutUrl: string;
  }>;

/**
 * Données normalisées après
 * la vérification d’un paiement.
 */
type MonerooVerifiedPayment =
  Readonly<{
    providerReference: string;
    reference: string;
    amount: number;
    currency: DonationCurrency;
    status: DonationPaymentStatus;
  }>;

/**
 * Vérifie qu’une valeur est un objet JSON.
 */
function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Retourne une chaîne non vide,
 * ou null lorsque la valeur est invalide.
 */
function readString(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : null;
}

/**
 * Retourne un nombre fini.
 *
 * Moneroo peut retourner un montant
 * sous forme de nombre ou de chaîne.
 */
function readNumber(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    const parsed =
      Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

/**
 * Vérifie qu’une devise est autorisée.
 */
function isAllowedCurrency(
  value: unknown
): value is DonationCurrency {
  return (
    typeof value === "string" &&
    ALLOWED_CURRENCIES.includes(
      value as DonationCurrency
    )
  );
}

/**
 * Charge les secrets uniquement lorsqu’une
 * opération serveur est exécutée.
 */
function getMonerooConfiguration():
  MonerooConfiguration {
  const secretKey =
    process.env.PAYMENT_SECRET_KEY
      ?.trim();

  const webhookSecret =
    process.env.PAYMENT_WEBHOOK_SECRET
      ?.trim();

  if (!secretKey) {
    throw new PaymentConfigurationError(
      "PAYMENT_SECRET_KEY est absente."
    );
  }

  if (!webhookSecret) {
    throw new PaymentConfigurationError(
      "PAYMENT_WEBHOOK_SECRET est absent."
    );
  }

  return {
    secretKey,
    webhookSecret,
  };
}

/**
 * Vérifie et normalise une référence Moneroo.
 */
function normalizeProviderReference(
  value: unknown
): string {
  const normalized =
    readString(value);

  if (
    !normalized ||
    normalized.length < 3 ||
    normalized.length >
      MAX_PROVIDER_REFERENCE_LENGTH ||
    !MONEROO_REFERENCE_PATTERN.test(
      normalized
    )
  ) {
    throw new PaymentProviderError(
      "INVALID_MONEROO_REFERENCE",
      "La référence Moneroo est invalide.",
      400
    );
  }

  return normalized;
}

/**
 * Vérifie qu’une URL retournée par Moneroo
 * utilise HTTPS et appartient à Moneroo.
 */
function normalizeCheckoutUrl(
  value: unknown
): string {
  const rawUrl =
    readString(value);

  if (!rawUrl) {
    throw new PaymentProviderError(
      "MONEROO_CHECKOUT_URL_MISSING",
      "Moneroo n’a pas retourné de page de paiement."
    );
  }

  let checkoutUrl: URL;

  try {
    checkoutUrl =
      new URL(rawUrl);
  } catch {
    throw new PaymentProviderError(
      "MONEROO_CHECKOUT_URL_INVALID",
      "Moneroo a retourné une page de paiement invalide."
    );
  }

  const hostname =
    checkoutUrl.hostname.toLowerCase();

  const belongsToMoneroo =
    hostname === MONEROO_CHECKOUT_DOMAIN ||
    hostname.endsWith(
      `.${MONEROO_CHECKOUT_DOMAIN}`
    );

  if (
    checkoutUrl.protocol !== "https:" ||
    !belongsToMoneroo ||
    checkoutUrl.username.length > 0 ||
    checkoutUrl.password.length > 0
  ) {
    throw new PaymentProviderError(
      "MONEROO_CHECKOUT_URL_REJECTED",
      "La page de paiement Moneroo n’est pas autorisée."
    );
  }

  return checkoutUrl.toString();
}

/**
 * Extrait l’objet data d’une réponse Moneroo.
 *
 * Une réponse directe est également acceptée
 * afin de rester compatible avec plusieurs
 * formes de réponses du prestataire.
 */
function getResponseData(
  body: unknown
): UnknownRecord {
  if (!isRecord(body)) {
    throw new PaymentProviderError(
      "MONEROO_INVALID_RESPONSE",
      "La réponse reçue de Moneroo est invalide."
    );
  }

  if (isRecord(body.data)) {
    return body.data;
  }

  return body;
}

/**
 * Extrait un message technique limité.
 *
 * Il est destiné uniquement aux journaux serveur.
 */
function getMonerooErrorMessage(
  body: unknown
): string {
  if (!isRecord(body)) {
    return "Réponse Moneroo invalide.";
  }

  const directMessage =
    readString(body.message);

  if (directMessage) {
    return directMessage.slice(
      0,
      300
    );
  }

  const directError =
    readString(body.error);

  if (directError) {
    return directError.slice(
      0,
      300
    );
  }

  if (isRecord(body.error)) {
    const nestedMessage =
      readString(
        body.error.message
      );

    if (nestedMessage) {
      return nestedMessage.slice(
        0,
        300
      );
    }
  }

  return "La requête Moneroo a échoué.";
}

/**
 * Construit les en-têtes de la requête sans
 * supposer que init.headers est un objet simple.
 */
function createMonerooHeaders(
  secretKey: string,
  headers?: HeadersInit
): Headers {
  const result =
    new Headers(headers);

  result.set(
    "Accept",
    "application/json"
  );

  result.set(
    "Authorization",
    `Bearer ${secretKey}`
  );

  result.set(
    "Content-Type",
    "application/json"
  );

  return result;
}

/**
 * Effectue une requête vers l’API Moneroo.
 */
async function requestMoneroo(
  path: string,
  init: RequestInit
): Promise<MonerooApiResponse> {
  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    throw new PaymentConfigurationError(
      "Le chemin de l’API Moneroo est invalide."
    );
  }

  const { secretKey } =
    getMonerooConfiguration();

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      MONEROO_REQUEST_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        `${MONEROO_API_BASE_URL}${path}`,
        {
          ...init,

          headers:
            createMonerooHeaders(
              secretKey,
              init.headers
            ),

          cache: "no-store",
          redirect: "error",
          signal: controller.signal,
        }
      );

    const rawResponse =
      await response.text();

    if (
      rawResponse.length >
      MONEROO_MAX_RESPONSE_SIZE
    ) {
      throw new PaymentProviderError(
        "MONEROO_RESPONSE_TOO_LARGE",
        "La réponse Moneroo dépasse la taille autorisée."
      );
    }

    let body: unknown = {};

    if (
      rawResponse.trim().length > 0
    ) {
      try {
        body =
          JSON.parse(
            rawResponse
          ) as unknown;
      } catch {
        throw new PaymentProviderError(
          "MONEROO_INVALID_JSON",
          "Moneroo a retourné une réponse JSON invalide."
        );
      }
    }

    return {
      status: response.status,
      body,
    };
  } catch (error: unknown) {
    if (
      error instanceof
        PaymentProviderError ||
      error instanceof
        PaymentConfigurationError
    ) {
      throw error;
    }

    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new PaymentProviderError(
        "MONEROO_TIMEOUT",
        "Moneroo n’a pas répondu dans le délai prévu.",
        504
      );
    }

    throw new PaymentProviderError(
      "MONEROO_NETWORK_ERROR",
      "La connexion au service Moneroo a échoué.",
      502
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Vérifie que la réponse HTTP indique
 * une opération réussie.
 */
function assertSuccessfulResponse(
  response: MonerooApiResponse,
  operation: string
): void {
  if (
    response.status >= 200 &&
    response.status < 300
  ) {
    return;
  }

  const providerMessage =
    getMonerooErrorMessage(
      response.body
    );

  console.error(
    "Moneroo API request failed:",
    {
      operation,
      status: response.status,
      message: providerMessage,
    }
  );

  const publicStatus =
    response.status === 429
      ? 503
      : response.status >= 500
        ? 503
        : 502;

  throw new PaymentProviderError(
    "MONEROO_API_ERROR",
    "Le service de paiement n’a pas pu traiter la demande.",
    publicStatus
  );
}

/**
 * Extrait la référence interne Young Caring
 * depuis les métadonnées Moneroo.
 */
function extractInternalReference(
  data: UnknownRecord
): string {
  const metadata =
    data.metadata;

  if (isRecord(metadata)) {
    const reference =
      readString(
        metadata.reference
      ) ??
      readString(
        metadata.order_id
      ) ??
      readString(
        metadata.donation_reference
      );

    if (reference) {
      return reference;
    }
  }

  if (Array.isArray(metadata)) {
    for (const item of metadata) {
      if (!isRecord(item)) {
        continue;
      }

      const key =
        readString(item.key);

      const value =
        readString(item.value);

      if (
        value &&
        (
          key === "reference" ||
          key === "order_id" ||
          key ===
            "donation_reference"
        )
      ) {
        return value;
      }
    }
  }

  throw new PaymentProviderError(
    "MONEROO_REFERENCE_MISSING",
    "La référence Young Caring est absente de la transaction Moneroo."
  );
}

/**
 * Extrait une devise depuis une réponse Moneroo.
 */
function extractCurrency(
  value: unknown
): DonationCurrency {
  const directCurrency =
    readString(value);

  const nestedCurrency =
    isRecord(value)
      ? (
          readString(value.code) ??
          readString(value.id) ??
          readString(value.currency)
        )
      : null;

  const currency =
    (
      directCurrency ??
      nestedCurrency ??
      ""
    ).toUpperCase();

  if (!isAllowedCurrency(currency)) {
    throw new PaymentProviderError(
      "MONEROO_CURRENCY_INVALID",
      "La devise retournée par Moneroo n’est pas autorisée."
    );
  }

  return currency;
}

/**
 * Normalise les statuts Moneroo vers
 * les statuts internes Young Caring.
 */
function normalizePaymentStatus(
  value: unknown
): DonationPaymentStatus {
  const status =
    readString(value)
      ?.toLowerCase();

  switch (status) {
    case "success":
    case "successful":
    case "succeeded":
    case "completed":
    case "paid":
      return "paid";

    case "processing":
    case "in_progress":
      return "processing";

    case "failed":
    case "failure":
    case "declined":
      return "failed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "refunded":
    case "refund":
      return "refunded";

    case "initiated":
    case "pending":
    default:
      return "pending";
  }
}

/**
 * Extrait le montant réellement payé.
 */
function extractVerifiedAmount(
  data: UnknownRecord
): number {
  const capture =
    isRecord(data.capture)
      ? data.capture
      : null;

  const rawAmount =
    capture
      ? (
          readNumber(
            capture.amount
          ) ??
          readNumber(
            data.amount
          )
        )
      : readNumber(
          data.amount
        );

  if (
    rawAmount === null ||
    !Number.isSafeInteger(
      rawAmount
    ) ||
    rawAmount <= 0
  ) {
    throw new PaymentProviderError(
      "MONEROO_AMOUNT_INVALID",
      "Le montant retourné par Moneroo est invalide."
    );
  }

  return rawAmount;
}

/**
 * Extrait la devise réellement capturée.
 */
function extractVerifiedCurrency(
  data: UnknownRecord
): DonationCurrency {
  const capture =
    isRecord(data.capture)
      ? data.capture
      : null;

  if (
    capture &&
    capture.currency !== undefined
  ) {
    return extractCurrency(
      capture.currency
    );
  }

  return extractCurrency(
    data.currency
  );
}

/**
 * Vérifie les URLs de redirection fournies
 * à l’adaptateur.
 */
function assertRedirectUrl(
  value: string,
  fieldName: string
): string {
  let url: URL;

  try {
    url =
      new URL(value);
  } catch {
    throw new PaymentConfigurationError(
      `${fieldName} est invalide.`
    );
  }

  if (
    url.username.length > 0 ||
    url.password.length > 0
  ) {
    throw new PaymentConfigurationError(
      `${fieldName} ne doit pas contenir d’identifiants.`
    );
  }

  const isProduction =
    process.env.NODE_ENV ===
    "production";

  if (
    isProduction &&
    url.protocol !== "https:"
  ) {
    throw new PaymentConfigurationError(
      `${fieldName} doit utiliser HTTPS en production.`
    );
  }

  if (
    !isProduction &&
    url.protocol !== "https:" &&
    url.protocol !== "http:"
  ) {
    throw new PaymentConfigurationError(
      `${fieldName} utilise un protocole interdit.`
    );
  }

  return url.toString();
}

/**
 * Construit les informations du donateur
 * transmises au prestataire.
 */
function createCustomerPayload(
  input: CreatePaymentSessionInput
): UnknownRecord {
  const donor =
    input.donation.donor;

  const customer: UnknownRecord = {
    email: donor.email,
    first_name: donor.firstName,
    last_name: donor.lastName,
  };

  if (donor.phone) {
    customer.phone =
      donor.phone;
  }

  if (donor.country) {
    customer.country =
      donor.country;
  }

  return customer;
}

/**
 * Construit le contenu transmis à Moneroo.
 *
 * Aucun identifiant bancaire n’est transmis.
 */
function createMonerooPayload(
  input: CreatePaymentSessionInput
): UnknownRecord {
  const successUrl =
    assertRedirectUrl(
      input.successUrl,
      "successUrl"
    );

  const cancelUrl =
    assertRedirectUrl(
      input.cancelUrl,
      "cancelUrl"
    );

  if (
    !Number.isSafeInteger(
      input.donation.amount
    ) ||
    input.donation.amount <= 0
  ) {
    throw new PaymentProviderError(
      "INVALID_PAYMENT_AMOUNT",
      "Le montant du paiement est invalide.",
      400
    );
  }

  if (
    !isAllowedCurrency(
      input.donation.currency
    )
  ) {
    throw new PaymentProviderError(
      "INVALID_PAYMENT_CURRENCY",
      "La devise du paiement est invalide.",
      400
    );
  }

  const reference =
    readString(
      input.reference
    );

  if (!reference) {
    throw new PaymentProviderError(
      "INVALID_DONATION_REFERENCE",
      "La référence du don est invalide.",
      400
    );
  }

  return {
    amount:
      input.donation.amount,

    currency:
      input.donation.currency,

    description:
      `Don Young Caring - ${reference}`,

    return_url:
      successUrl,

    customer:
      createCustomerPayload(
        input
      ),

    metadata: {
      reference,
      donation_reference:
        reference,
      frequency:
        input.donation.frequency,
      allocation:
        input.donation.allocation,
      cancel_url:
        cancelUrl,
    },
  };
}

/**
 * Analyse la réponse d’initialisation.
 */
function parseInitializationResponse(
  body: unknown
): MonerooInitializedPayment {
  const data =
    getResponseData(body);

  const providerReference =
    normalizeProviderReference(
      data.id ??
      data.payment_id ??
      data.reference
    );

  const checkoutUrl =
    normalizeCheckoutUrl(
      data.checkout_url ??
      data.checkoutUrl ??
      data.payment_url
    );

  return {
    providerReference,
    checkoutUrl,
  };
}

/**
 * Analyse la réponse de vérification.
 */
function parseVerificationResponse(
  body: unknown
): MonerooVerifiedPayment {
  const data =
    getResponseData(body);

  return {
    providerReference:
      normalizeProviderReference(
        data.id ??
        data.payment_id
      ),

    reference:
      extractInternalReference(
        data
      ),

    amount:
      extractVerifiedAmount(
        data
      ),

    currency:
      extractVerifiedCurrency(
        data
      ),

    status:
      normalizePaymentStatus(
        data.status
      ),
  };
}

/**
 * Initialise une session de paiement Moneroo.
 */
async function createMonerooPaymentSession(
  input: CreatePaymentSessionInput
): Promise<PaymentSessionResult> {
  const payload =
    createMonerooPayload(
      input
    );

  const response =
    await requestMoneroo(
      MONEROO_INITIALIZE_PATH,
      {
        method: "POST",
        body:
          JSON.stringify(
            payload
          ),
      }
    );

  assertSuccessfulResponse(
    response,
    "initialize-payment"
  );

  const payment =
    parseInitializationResponse(
      response.body
    );

  return {
    provider: "moneroo",
    reference:
      input.reference,
    providerReference:
      payment.providerReference,
    checkoutUrl:
      payment.checkoutUrl,
    status: "pending",
  };
}

/**
 * Vérifie une transaction directement
 * auprès de l’API Moneroo.
 */
async function verifyMonerooPayment(
  providerReference: string
): Promise<PaymentVerificationResult> {
  const normalizedReference =
    normalizeProviderReference(
      providerReference
    );

  const encodedReference =
    encodeURIComponent(
      normalizedReference
    );

  const response =
    await requestMoneroo(
      `/v1/payments/${encodedReference}/verify`,
      {
        method: "GET",
      }
    );

  assertSuccessfulResponse(
    response,
    "verify-payment"
  );

  const payment =
    parseVerificationResponse(
      response.body
    );

  if (
    payment.providerReference !==
    normalizedReference
  ) {
    throw new PaymentProviderError(
      "MONEROO_REFERENCE_MISMATCH",
      "La référence retournée par Moneroo ne correspond pas à la transaction demandée."
    );
  }

  return {
    provider: "moneroo",
    reference:
      payment.reference,
    providerReference:
      payment.providerReference,
    amount:
      payment.amount,
    currency:
      payment.currency,
    status:
      payment.status,
  };
}

/**
 * Normalise la signature reçue.
 *
 * Les formats suivants sont acceptés :
 *
 * - signature hexadécimale directe ;
 * - sha256=signature.
 */
function normalizeWebhookSignature(
  signature: string
): string | null {
  const normalized =
    signature
      .trim()
      .replace(
        /^sha256=/i,
        ""
      );

  if (
    !MONEROO_SIGNATURE_PATTERN.test(
      normalized
    )
  ) {
    return null;
  }

  return normalized.toLowerCase();
}

/**
 * Vérifie la signature HMAC-SHA256
 * d’un webhook Moneroo.
 */
async function verifyMonerooWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  if (
    typeof rawBody !== "string" ||
    rawBody.length === 0 ||
    rawBody.length >
      MONEROO_MAX_WEBHOOK_SIZE
  ) {
    return false;
  }

  if (
    typeof signature !== "string"
  ) {
    return false;
  }

  const normalizedSignature =
    normalizeWebhookSignature(
      signature
    );

  if (!normalizedSignature) {
    return false;
  }

  let webhookSecret: string;

  try {
    webhookSecret =
      getMonerooConfiguration()
        .webhookSecret;
  } catch {
    return false;
  }

  const expectedSignature =
    createHmac(
      "sha256",
      webhookSecret
    )
      .update(
        rawBody,
        "utf8"
      )
      .digest("hex");

  const receivedBuffer =
    Buffer.from(
      normalizedSignature,
      "hex"
    );

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "hex"
    );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    receivedBuffer,
    expectedBuffer
  );
}

/**
 * Adaptateur utilisé par le registre
 * des prestataires de paiement.
 */
export const monerooPaymentProvider:
  DonationPaymentProvider = {
  name: "moneroo",

  createPaymentSession:
    createMonerooPaymentSession,

  verifyPayment:
    verifyMonerooPayment,

  verifyWebhookSignature:
    verifyMonerooWebhookSignature,
};

export default
  monerooPaymentProvider;