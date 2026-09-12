import {
  getDonationLimits,
  isDonationCurrency,
} from "@/data/donation";
import type {
  CreatePaymentSessionInput,
  DonationPaymentProvider,
  DonationPaymentProviderName,
  DonationPaymentStatus,
  PaymentSessionResult,
  PaymentVerificationResult,
} from "@/types/donation";

/*
 * Cette couche empêche le site de fabriquer
 * ou de confirmer lui-même un faux paiement.
 *
 * Tant qu’un véritable adaptateur n’est pas installé,
 * toutes les tentatives sont refusées proprement.
 */

const SUPPORTED_PROVIDERS:
  readonly DonationPaymentProviderName[] = [
  "fedapay",
  "kkiapay",
  "paydunya",
  "stripe",
];

const VALID_PAYMENT_STATUSES:
  readonly DonationPaymentStatus[] = [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "expired",
  "refunded",
];

const INTERNAL_REFERENCE_PATTERN =
  /^YC-\d{8}-[A-F0-9]{12}$/;

const MIN_PROVIDER_REFERENCE_LENGTH = 3;
const MAX_PROVIDER_REFERENCE_LENGTH = 200;
const MAX_WEBHOOK_SIZE = 1_000_000;
const MAX_SIGNATURE_LENGTH = 1_000;

export class PaymentConfigurationError extends Error {
  readonly code =
    "PAYMENT_PROVIDER_NOT_CONFIGURED";

  constructor(
    message =
      "Le prestataire de paiement n’est pas configuré."
  ) {
    super(message);

    this.name =
      "PaymentConfigurationError";
  }
}

export class PaymentProviderError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(
    code: string,
    message: string,
    statusCode = 502
  ) {
    super(message);

    this.name =
      "PaymentProviderError";

    this.code = code;

    this.statusCode =
      statusCode >= 400 &&
      statusCode <= 599
        ? statusCode
        : 502;
  }
}

export type PaymentProviderConfiguration =
  Readonly<{
    name:
      DonationPaymentProviderName;
    secretKey: string;
    webhookSecret: string;
  }>;

/*
 * Vérifie le nom du prestataire à l’exécution.
 */
export function isSupportedPaymentProvider(
  value: unknown
): value is DonationPaymentProviderName {
  return (
    typeof value === "string" &&
    SUPPORTED_PROVIDERS.includes(
      value as
        DonationPaymentProviderName
    )
  );
}

/*
 * Charge les secrets uniquement côté serveur.
 *
 * Ce fichier ne doit jamais être importé dans
 * un composant contenant "use client".
 */
export function getPaymentProviderConfiguration():
  PaymentProviderConfiguration {
  const provider =
    process.env.PAYMENT_PROVIDER
      ?.trim()
      .toLowerCase();

  const secretKey =
    process.env.PAYMENT_SECRET_KEY
      ?.trim();

  const webhookSecret =
    process.env.PAYMENT_WEBHOOK_SECRET
      ?.trim();

  if (
    !isSupportedPaymentProvider(
      provider
    )
  ) {
    throw new PaymentConfigurationError(
      "PAYMENT_PROVIDER est absent ou invalide."
    );
  }

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
    name: provider,
    secretKey,
    webhookSecret,
  };
}

/*
 * Registre privé des adaptateurs installés.
 */
const providerRegistry =
  new Map<
    DonationPaymentProviderName,
    DonationPaymentProvider
  >();

/*
 * Enregistre un adaptateur une seule fois.
 */
export function registerPaymentProvider(
  provider: DonationPaymentProvider
): void {
  if (
    !isSupportedPaymentProvider(
      provider.name
    )
  ) {
    throw new PaymentConfigurationError(
      "Le nom de l’adaptateur de paiement est invalide."
    );
  }

  if (
    providerRegistry.has(
      provider.name
    )
  ) {
    throw new PaymentConfigurationError(
      `Le prestataire ${provider.name} est déjà enregistré.`
    );
  }

  providerRegistry.set(
    provider.name,
    provider
  );
}

/*
 * Retourne uniquement l’adaptateur correspondant
 * au prestataire configuré dans les variables
 * d’environnement.
 */
export function getPaymentProvider():
  DonationPaymentProvider {
  const configuration =
    getPaymentProviderConfiguration();

  const provider =
    providerRegistry.get(
      configuration.name
    );

  if (!provider) {
    throw new PaymentConfigurationError(
      `L’adaptateur ${configuration.name} n’est pas encore installé.`
    );
  }

  if (
    provider.name !==
    configuration.name
  ) {
    throw new PaymentConfigurationError(
      "L’adaptateur enregistré ne correspond pas au prestataire configuré."
    );
  }

  return provider;
}

/*
 * Crée une session chez le véritable
 * prestataire de paiement.
 *
 * Le montant et la devise ont déjà été validés par
 * lib/donation/validation.ts, mais ils sont contrôlés
 * une seconde fois avant l’appel externe.
 */
export async function createPaymentSession(
  input: CreatePaymentSessionInput
): Promise<PaymentSessionResult> {
  validatePaymentSessionInput(input);
  validatePaymentSessionUrls(input);

  const provider =
    getPaymentProvider();

  let result: PaymentSessionResult;

  try {
    result =
      await provider.createPaymentSession(
        input
      );
  } catch (error) {
    if (
      error instanceof
        PaymentConfigurationError ||
      error instanceof
        PaymentProviderError
    ) {
      throw error;
    }

    throw new PaymentProviderError(
      "PAYMENT_SESSION_CREATION_FAILED",
      "Le prestataire n’a pas pu créer la session de paiement."
    );
  }

  validatePaymentSessionResult(
    result,
    input,
    provider.name
  );

  return result;
}

/*
 * Vérifie une transaction directement
 * auprès du prestataire.
 *
 * Le site ne considère jamais une simple redirection
 * du navigateur comme une preuve de paiement.
 */
export async function verifyPayment(
  providerReference: string
): Promise<PaymentVerificationResult> {
  const normalizedReference =
    normalizeProviderReference(
      providerReference
    );

  const provider =
    getPaymentProvider();

  let result:
    PaymentVerificationResult;

  try {
    result =
      await provider.verifyPayment(
        normalizedReference
      );
  } catch (error) {
    if (
      error instanceof
        PaymentConfigurationError ||
      error instanceof
        PaymentProviderError
    ) {
      throw error;
    }

    throw new PaymentProviderError(
      "PAYMENT_VERIFICATION_FAILED",
      "La transaction n’a pas pu être vérifiée auprès du prestataire."
    );
  }

  validatePaymentVerificationResult(
    result,
    normalizedReference,
    provider.name
  );

  return result;
}

/*
 * Vérifie la signature d’un webhook.
 *
 * La vérification réelle doit obligatoirement
 * être effectuée par l’adaptateur du prestataire
 * avec son secret officiel.
 */
export async function verifyPaymentWebhook(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const normalizedSignature =
    signature.trim();

  if (
    rawBody.length === 0 ||
    rawBody.length >
      MAX_WEBHOOK_SIZE ||
    normalizedSignature.length === 0 ||
    normalizedSignature.length >
      MAX_SIGNATURE_LENGTH
  ) {
    return false;
  }

  const provider =
    getPaymentProvider();

  try {
    return await provider
      .verifyWebhookSignature(
        rawBody,
        normalizedSignature
      );
  } catch (error) {
    if (
      error instanceof
        PaymentConfigurationError ||
      error instanceof
        PaymentProviderError
    ) {
      throw error;
    }

    return false;
  }
}

/*
 * Valide le montant et la devise juste avant
 * l’appel au prestataire.
 *
 * Aucune conversion de devise n’est effectuée ici.
 */
function validatePaymentSessionInput(
  input: CreatePaymentSessionInput
): void {
  if (
    !INTERNAL_REFERENCE_PATTERN.test(
      input.reference
    )
  ) {
    throw new PaymentProviderError(
      "INVALID_PAYMENT_REFERENCE",
      "La référence interne du paiement est invalide.",
      400
    );
  }

  const { amount, currency } =
    input.donation;

  if (
    !isDonationCurrency(currency)
  ) {
    throw new PaymentProviderError(
      "UNSUPPORTED_CURRENCY",
      "La devise du paiement n’est pas autorisée.",
      400
    );
  }

  if (
    !Number.isSafeInteger(amount)
  ) {
    throw new PaymentProviderError(
      "INVALID_PAYMENT_AMOUNT",
      "Le montant du paiement est invalide.",
      400
    );
  }

  const limits =
    getDonationLimits(currency);

  if (
    amount < limits.minimum ||
    amount > limits.maximum
  ) {
    throw new PaymentProviderError(
      "PAYMENT_AMOUNT_OUT_OF_RANGE",
      "Le montant ne respecte pas les limites de la devise sélectionnée.",
      400
    );
  }
}

/*
 * Vérifie le résultat retourné lors de la création
 * d’une session de paiement.
 */
function validatePaymentSessionResult(
  result: PaymentSessionResult,
  input: CreatePaymentSessionInput,
  expectedProvider:
    DonationPaymentProviderName
): void {
  if (
    result.provider !==
    expectedProvider
  ) {
    throw new PaymentProviderError(
      "PAYMENT_PROVIDER_MISMATCH",
      "Le prestataire retourné ne correspond pas au prestataire configuré."
    );
  }

  if (
    result.reference !==
    input.reference
  ) {
    throw new PaymentProviderError(
      "PAYMENT_REFERENCE_MISMATCH",
      "La référence retournée par le prestataire est invalide."
    );
  }

  if (result.status !== "pending") {
    throw new PaymentProviderError(
      "INVALID_INITIAL_PAYMENT_STATUS",
      "Le statut initial du paiement est invalide."
    );
  }

  normalizeProviderReference(
    result.providerReference
  );

  validateCheckoutUrl(
    result.checkoutUrl
  );
}

/*
 * Vérifie qu’une confirmation reçue du prestataire
 * possède un format cohérent.
 */
function validatePaymentVerificationResult(
  result: PaymentVerificationResult,
  requestedProviderReference: string,
  expectedProvider:
    DonationPaymentProviderName
): void {
  if (
    result.provider !==
    expectedProvider
  ) {
    throw new PaymentProviderError(
      "PAYMENT_PROVIDER_MISMATCH",
      "Le résultat appartient à un prestataire inattendu."
    );
  }

  if (
    !INTERNAL_REFERENCE_PATTERN.test(
      result.reference
    )
  ) {
    throw new PaymentProviderError(
      "INVALID_PAYMENT_REFERENCE",
      "La référence interne retournée est invalide."
    );
  }

  if (
    result.providerReference !== null
  ) {
    const returnedReference =
      normalizeProviderReference(
        result.providerReference
      );

    if (
      returnedReference !==
      requestedProviderReference
    ) {
      throw new PaymentProviderError(
        "PROVIDER_REFERENCE_MISMATCH",
        "La référence de transaction retournée ne correspond pas à la transaction demandée."
      );
    }
  }

  if (
    !Number.isSafeInteger(
      result.amount
    ) ||
    result.amount <= 0
  ) {
    throw new PaymentProviderError(
      "INVALID_VERIFIED_AMOUNT",
      "Le montant retourné par le prestataire est invalide."
    );
  }

  if (
    !isDonationCurrency(
      result.currency
    )
  ) {
    throw new PaymentProviderError(
      "INVALID_VERIFIED_CURRENCY",
      "La devise retournée par le prestataire est invalide."
    );
  }

  if (
    !VALID_PAYMENT_STATUSES.includes(
      result.status
    )
  ) {
    throw new PaymentProviderError(
      "INVALID_PAYMENT_STATUS",
      "Le statut retourné par le prestataire est invalide."
    );
  }
}

/*
 * Nettoie et valide une référence externe.
 */
function normalizeProviderReference(
  value: string
): string {
  const normalizedValue =
    value.trim();

  if (
    normalizedValue.length <
      MIN_PROVIDER_REFERENCE_LENGTH ||
    normalizedValue.length >
      MAX_PROVIDER_REFERENCE_LENGTH ||
    /[\u0000-\u001F\u007F]/.test(
      normalizedValue
    )
  ) {
    throw new PaymentProviderError(
      "INVALID_PROVIDER_REFERENCE",
      "La référence du prestataire est invalide.",
      400
    );
  }

  return normalizedValue;
}

/*
 * Empêche une redirection vers un protocole
 * dangereux ou une URL contenant des identifiants.
 */
function validateCheckoutUrl(
  value: string
): void {
  let checkoutUrl: URL;

  try {
    checkoutUrl = new URL(value);
  } catch {
    throw new PaymentProviderError(
      "INVALID_CHECKOUT_URL",
      "L’adresse de paiement retournée est invalide."
    );
  }

  if (
    checkoutUrl.protocol !== "https:"
  ) {
    throw new PaymentProviderError(
      "INSECURE_CHECKOUT_URL",
      "La page de paiement doit utiliser HTTPS."
    );
  }

  if (
    checkoutUrl.username.length > 0 ||
    checkoutUrl.password.length > 0
  ) {
    throw new PaymentProviderError(
      "UNSAFE_CHECKOUT_URL",
      "L’adresse de paiement retournée contient des informations interdites."
    );
  }
}

/*
 * Vérifie les URL de succès et d’annulation
 * créées par le site.
 */
function validatePaymentSessionUrls(
  input: CreatePaymentSessionInput
): void {
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ?.trim();

  if (!configuredSiteUrl) {
    throw new PaymentConfigurationError(
      "NEXT_PUBLIC_SITE_URL est absente."
    );
  }

  let siteUrl: URL;
  let successUrl: URL;
  let cancelUrl: URL;

  try {
    siteUrl =
      new URL(configuredSiteUrl);

    successUrl =
      new URL(input.successUrl);

    cancelUrl =
      new URL(input.cancelUrl);
  } catch {
    throw new PaymentConfigurationError(
      "Une adresse de redirection est invalide."
    );
  }

  if (
    successUrl.origin !==
      siteUrl.origin ||
    cancelUrl.origin !==
      siteUrl.origin
  ) {
    throw new PaymentConfigurationError(
      "Les redirections de paiement doivent appartenir au site Young Caring."
    );
  }

  if (
    successUrl.pathname !==
      "/don/succes" ||
    cancelUrl.pathname !==
      "/don/annule"
  ) {
    throw new PaymentConfigurationError(
      "Les chemins de redirection du paiement sont invalides."
    );
  }

  if (
    successUrl.username.length > 0 ||
    successUrl.password.length > 0 ||
    cancelUrl.username.length > 0 ||
    cancelUrl.password.length > 0
  ) {
    throw new PaymentConfigurationError(
      "Les adresses de redirection contiennent des informations interdites."
    );
  }

  const isProduction =
    process.env.NODE_ENV ===
    "production";

  if (
    isProduction &&
    (siteUrl.protocol !== "https:" ||
      successUrl.protocol !== "https:" ||
      cancelUrl.protocol !== "https:")
  ) {
    throw new PaymentConfigurationError(
      "HTTPS est obligatoire en production."
    );
  }

  if (
    !isProduction &&
    !["http:", "https:"].includes(
      siteUrl.protocol
    )
  ) {
    throw new PaymentConfigurationError(
      "Le protocole du site est invalide."
    );
  }
}