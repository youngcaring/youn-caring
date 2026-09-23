import "server-only";

import {
  createHash,
} from "node:crypto";

import type {
  DonationPaymentProvider,
  DonationPaymentProviderName,
  DonationPaymentWebhookEvent,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * SÉCURITÉ DES WEBHOOKS DE PAIEMENT
 * ============================================================================
 *
 * Ce fichier :
 *
 * - impose la méthode POST ;
 * - vérifie le Content-Type JSON ;
 * - limite la taille du corps reçu ;
 * - lit le corps brut une seule fois ;
 * - récupère la signature dans un en-tête contrôlé ;
 * - délègue la vérification cryptographique au prestataire ;
 * - analyse le JSON uniquement après validation de la signature ;
 * - extrait une référence prestataire contrôlée ;
 * - calcule une empreinte SHA-256 ;
 * - construit une clé d’idempotence ;
 * - ne journalise jamais le corps brut ni la signature.
 *
 * Important :
 *
 * Un webhook valide ne confirme jamais directement un paiement.
 * Après sa réception, le serveur doit toujours appeler l’API
 * du prestataire afin de vérifier :
 *
 * - la référence interne ;
 * - la référence prestataire ;
 * - le montant ;
 * - la devise ;
 * - le statut réel.
 * ============================================================================
 */

const DEFAULT_SIGNATURE_HEADER =
  "x-moneroo-signature";

const MAX_WEBHOOK_BODY_SIZE =
  1_000_000;

const MAX_EVENT_ID_LENGTH =
  200;

const MAX_EVENT_TYPE_LENGTH =
  150;

const MAX_PROVIDER_REFERENCE_LENGTH =
  200;

const MAX_JSON_DEPTH =
  20;

const HEADER_NAME_PATTERN =
  /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

const PROVIDER_REFERENCE_PATTERN =
  /^[A-Za-z0-9._:-]+$/;

const SAFE_IDENTIFIER_PATTERN =
  /^[A-Za-z0-9._:/-]+$/;

type UnknownRecord =
  Record<string, unknown>;

/**
 * Résultat sécurisé retourné après
 * vérification complète de la requête.
 */
export type VerifiedDonationWebhook =
  Readonly<{
    event:
      DonationPaymentWebhookEvent;

    /**
     * Empreinte SHA-256 du corps brut.
     *
     * Le corps complet ne doit pas être
     * enregistré en base.
     */
    payloadHash: string;

    /**
     * Clé utilisée pour empêcher le traitement
     * multiple du même événement.
     */
    deduplicationKey: string;

    /**
     * Corps JSON déjà analysé.
     *
     * Il reste de type unknown afin d’obliger
     * les consommateurs à valider chaque champ.
     */
    payload: unknown;

    /**
     * Taille réelle du corps en octets.
     */
    bodySize: number;

    signatureVerified: true;
  }>;

/**
 * Erreur contrôlée lors de la validation
 * d’un webhook.
 */
export class DonationWebhookSecurityError
  extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(
    code: string,
    message: string,
    statusCode = 400
  ) {
    super(message);

    this.name =
      "DonationWebhookSecurityError";

    this.code =
      code;

    this.statusCode =
      statusCode;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}

/**
 * Vérifie qu’une valeur inconnue est
 * un objet JSON simple.
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
 * Retourne une chaîne nettoyée,
 * ou null si elle est absente.
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
 * Retourne le premier objet valide.
 */
function firstRecord(
  ...values: readonly unknown[]
): UnknownRecord | null {
  for (const value of values) {
    if (isRecord(value)) {
      return value;
    }
  }

  return null;
}

/**
 * Retourne la première chaîne non vide.
 */
function firstString(
  ...values: readonly unknown[]
): string | null {
  for (const value of values) {
    const result =
      readString(value);

    if (result) {
      return result;
    }
  }

  return null;
}

/**
 * Charge et vérifie le nom de l’en-tête
 * contenant la signature.
 */
export function getWebhookSignatureHeaderName():
  string {
  const configuredHeader =
    process.env
      .PAYMENT_WEBHOOK_SIGNATURE_HEADER
      ?.trim()
      .toLowerCase();

  const headerName =
    configuredHeader ||
    DEFAULT_SIGNATURE_HEADER;

  if (
    headerName.length > 100 ||
    !HEADER_NAME_PATTERN.test(
      headerName
    )
  ) {
    throw new DonationWebhookSecurityError(
      "INVALID_WEBHOOK_CONFIGURATION",
      "La configuration de la signature webhook est invalide.",
      500
    );
  }

  return headerName;
}

/**
 * Vérifie le Content-Type.
 *
 * Les types application/json et les variantes
 * se terminant par +json sont acceptés.
 */
function assertJsonContentType(
  request: Request
): void {
  const rawContentType =
    request.headers.get(
      "content-type"
    );

  if (!rawContentType) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_CONTENT_TYPE_MISSING",
      "Le type de contenu du webhook est absent.",
      415
    );
  }

  const contentType =
    rawContentType
      .split(";", 1)[0]
      ?.trim()
      .toLowerCase();

  const isJson =
    contentType ===
      "application/json" ||
    Boolean(
      contentType?.endsWith(
        "+json"
      )
    );

  if (!isJson) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_CONTENT_TYPE_REJECTED",
      "Le webhook doit contenir des données JSON.",
      415
    );
  }
}

/**
 * Vérifie Content-Length lorsqu’il est fourni.
 *
 * La taille réelle reste contrôlée pendant
 * la lecture du flux.
 */
function assertContentLength(
  request: Request
): void {
  const rawContentLength =
    request.headers.get(
      "content-length"
    );

  if (!rawContentLength) {
    return;
  }

  if (!/^\d+$/.test(rawContentLength)) {
    throw new DonationWebhookSecurityError(
      "INVALID_WEBHOOK_CONTENT_LENGTH",
      "La taille annoncée du webhook est invalide.",
      400
    );
  }

  const contentLength =
    Number(rawContentLength);

  if (
    !Number.isSafeInteger(
      contentLength
    ) ||
    contentLength <= 0
  ) {
    throw new DonationWebhookSecurityError(
      "INVALID_WEBHOOK_CONTENT_LENGTH",
      "La taille annoncée du webhook est invalide.",
      400
    );
  }

  if (
    contentLength >
    MAX_WEBHOOK_BODY_SIZE
  ) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_BODY_TOO_LARGE",
      "Le webhook dépasse la taille autorisée.",
      413
    );
  }
}

/**
 * Lit le corps brut avec une limite réelle.
 *
 * request.json() ne doit pas être appelé avant
 * cette fonction, car la signature doit porter
 * sur le corps brut exact.
 */
async function readRawBody(
  request: Request
): Promise<
  Readonly<{
    rawBody: string;
    bodySize: number;
  }>
> {
  if (!request.body) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_BODY_MISSING",
      "Le corps du webhook est absent.",
      400
    );
  }

  const reader =
    request.body.getReader();

  const chunks:
    Uint8Array[] = [];

  let totalSize = 0;

  try {
    while (true) {
      const result =
        await reader.read();

      if (result.done) {
        break;
      }

      if (!result.value) {
        continue;
      }

      totalSize +=
        result.value.byteLength;

      if (
        totalSize >
        MAX_WEBHOOK_BODY_SIZE
      ) {
        await reader.cancel();

        throw new DonationWebhookSecurityError(
          "WEBHOOK_BODY_TOO_LARGE",
          "Le webhook dépasse la taille autorisée.",
          413
        );
      }

      chunks.push(
        result.value
      );
    }
  } finally {
    reader.releaseLock();
  }

  if (totalSize === 0) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_BODY_EMPTY",
      "Le corps du webhook est vide.",
      400
    );
  }

  const bodyBuffer =
    Buffer.concat(
      chunks.map(
        (chunk) =>
          Buffer.from(
            chunk.buffer,
            chunk.byteOffset,
            chunk.byteLength
          )
      ),
      totalSize
    );

  const rawBody =
    bodyBuffer.toString(
      "utf8"
    );

  if (
    rawBody.trim().length === 0
  ) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_BODY_EMPTY",
      "Le corps du webhook est vide.",
      400
    );
  }

  return {
    rawBody,
    bodySize:
      totalSize,
  };
}

/**
 * Récupère la signature sans jamais
 * l’écrire dans les journaux.
 */
function readWebhookSignature(
  request: Request
): string {
  const headerName =
    getWebhookSignatureHeaderName();

  const signature =
    request.headers
      .get(headerName)
      ?.trim();

  if (!signature) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_SIGNATURE_MISSING",
      "La signature du webhook est absente.",
      401
    );
  }

  if (
    signature.length > 1_000 ||
    signature.includes(",") ||
    /[\r\n]/.test(signature)
  ) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_SIGNATURE_INVALID",
      "La signature du webhook est invalide.",
      401
    );
  }

  return signature;
}

/**
 * Vérifie que le JSON n’est pas excessivement
 * profond.
 */
function assertJsonDepth(
  value: unknown,
  depth = 0
): void {
  if (depth > MAX_JSON_DEPTH) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_JSON_TOO_DEEP",
      "La structure du webhook est trop complexe.",
      400
    );
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      assertJsonDepth(
        item,
        depth + 1
      );
    }

    return;
  }

  if (isRecord(value)) {
    for (
      const nestedValue of
      Object.values(value)
    ) {
      assertJsonDepth(
        nestedValue,
        depth + 1
      );
    }
  }
}

/**
 * Analyse le JSON après vérification
 * de la signature.
 */
function parseWebhookPayload(
  rawBody: string
): unknown {
  let payload: unknown;

  try {
    payload =
      JSON.parse(
        rawBody
      ) as unknown;
  } catch {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_JSON_INVALID",
      "Le webhook contient un JSON invalide.",
      400
    );
  }

  if (!isRecord(payload)) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_PAYLOAD_INVALID",
      "Le contenu du webhook est invalide.",
      400
    );
  }

  assertJsonDepth(payload);

  return payload;
}

/**
 * Vérifie et normalise un identifiant.
 */
function normalizeIdentifier(
  value: unknown,
  fieldName: string,
  maximumLength: number,
  required: true
): string;

function normalizeIdentifier(
  value: unknown,
  fieldName: string,
  maximumLength: number,
  required: false
): string | null;

function normalizeIdentifier(
  value: unknown,
  fieldName: string,
  maximumLength: number,
  required: boolean
): string | null {
  const normalized =
    readString(value);

  if (!normalized) {
    if (required) {
      throw new DonationWebhookSecurityError(
        "WEBHOOK_IDENTIFIER_MISSING",
        `${fieldName} est absent du webhook.`,
        400
      );
    }

    return null;
  }

  if (
    normalized.length >
      maximumLength ||
    !SAFE_IDENTIFIER_PATTERN.test(
      normalized
    )
  ) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_IDENTIFIER_INVALID",
      `${fieldName} est invalide.`,
      400
    );
  }

  return normalized;
}

/**
 * Vérifie spécifiquement une référence
 * de transaction prestataire.
 */
function normalizeProviderReference(
  value: unknown
): string {
  const normalized =
    readString(value);

  if (
    !normalized ||
    normalized.length >
      MAX_PROVIDER_REFERENCE_LENGTH ||
    !PROVIDER_REFERENCE_PATTERN.test(
      normalized
    )
  ) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_PAYMENT_REFERENCE_INVALID",
      "La référence du paiement est absente ou invalide.",
      400
    );
  }

  return normalized;
}

/**
 * Extrait les différents objets pouvant
 * contenir les informations de transaction.
 */
function getPayloadRecords(
  payload: UnknownRecord
): Readonly<{
  data: UnknownRecord;
  payment: UnknownRecord | null;
  transaction: UnknownRecord | null;
}> {
  const data =
    isRecord(payload.data)
      ? payload.data
      : payload;

  const payment =
    firstRecord(
      data.payment,
      payload.payment
    );

  const transaction =
    firstRecord(
      data.transaction,
      payload.transaction
    );

  return {
    data,
    payment,
    transaction,
  };
}

/**
 * Extrait la référence de transaction.
 *
 * Plusieurs structures sont prises en charge,
 * mais chaque valeur reste strictement validée.
 */
function extractProviderReference(
  payload: UnknownRecord
): string {
  const {
    data,
    payment,
    transaction,
  } = getPayloadRecords(payload);

  const candidate =
    firstString(
      payment?.id,
      payment?.payment_id,
      payment?.paymentId,

      transaction?.id,
      transaction?.payment_id,
      transaction?.paymentId,

      data.payment_id,
      data.paymentId,
      data.transaction_id,
      data.transactionId,

      /**
       * Certaines réponses utilisent directement
       * data.id comme identifiant du paiement.
       */
      data.id
    );

  return normalizeProviderReference(
    candidate
  );
}

/**
 * Extrait l’identifiant unique de l’événement,
 * lorsqu’il est fourni.
 */
function extractEventId(
  payload: UnknownRecord
): string | null {
  const event =
    firstRecord(
      payload.event,
      payload.webhook
    );

  const candidate =
    firstString(
      payload.event_id,
      payload.eventId,
      event?.id,
      event?.event_id,
      event?.eventId
    );

  return normalizeIdentifier(
    candidate,
    "eventId",
    MAX_EVENT_ID_LENGTH,
    false
  );
}

/**
 * Extrait le type brut de l’événement.
 */
function extractEventType(
  payload: UnknownRecord
): string | null {
  const event =
    firstRecord(
      payload.event,
      payload.webhook
    );

  const candidate =
    firstString(
      payload.event_type,
      payload.eventType,
      payload.type,
      event?.type,
      event?.name
    );

  return normalizeIdentifier(
    candidate,
    "eventType",
    MAX_EVENT_TYPE_LENGTH,
    false
  );
}

/**
 * Calcule l’empreinte du corps brut.
 */
export function hashWebhookPayload(
  rawBody: string
): string {
  return createHash("sha256")
    .update(
      rawBody,
      "utf8"
    )
    .digest("hex");
}

/**
 * Construit une clé d’idempotence.
 *
 * Si le prestataire fournit un identifiant
 * d’événement, il est utilisé en priorité.
 *
 * Sinon, l’empreinte du corps brut est utilisée.
 */
function createDeduplicationKey(
  provider:
    DonationPaymentProviderName,
  eventId: string | null,
  payloadHash: string
): string {
  if (eventId) {
    return [
      provider,
      "event",
      eventId,
    ].join(":");
  }

  return [
    provider,
    "payload",
    payloadHash,
  ].join(":");
}

/**
 * Vérifie qu’un adaptateur porte
 * un nom de prestataire exploitable.
 */
function assertProviderName(
  provider:
    DonationPaymentProvider
): DonationPaymentProviderName {
  const name =
    readString(provider.name);

  if (!name) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_PROVIDER_INVALID",
      "Le prestataire du webhook est invalide.",
      500
    );
  }

  return provider.name;
}

/**
 * Vérifie complètement une requête webhook.
 *
 * Cette fonction doit être appelée avant :
 *
 * - toute écriture en base ;
 * - toute mise à jour d’un paiement ;
 * - toute génération de reçu ;
 * - tout envoi d’e-mail.
 */
export async function verifyDonationWebhookRequest(
  request: Request,
  provider:
    DonationPaymentProvider
): Promise<VerifiedDonationWebhook> {
  if (
    request.method.toUpperCase() !==
    "POST"
  ) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_METHOD_NOT_ALLOWED",
      "La méthode utilisée pour le webhook est interdite.",
      405
    );
  }

  assertJsonContentType(request);
  assertContentLength(request);

  const signature =
    readWebhookSignature(
      request
    );

  const {
    rawBody,
    bodySize,
  } = await readRawBody(
    request
  );

  let signatureVerified = false;

  try {
    signatureVerified =
      await provider
        .verifyWebhookSignature(
          rawBody,
          signature
        );
  } catch {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_SIGNATURE_VERIFICATION_FAILED",
      "La vérification de la signature du webhook a échoué.",
      401
    );
  }

  if (!signatureVerified) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_SIGNATURE_REJECTED",
      "La signature du webhook est invalide.",
      401
    );
  }

  const payload =
    parseWebhookPayload(
      rawBody
    );

  if (!isRecord(payload)) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_PAYLOAD_INVALID",
      "Le contenu du webhook est invalide.",
      400
    );
  }

  const providerName =
    assertProviderName(
      provider
    );

  const providerReference =
    extractProviderReference(
      payload
    );

  const eventId =
    extractEventId(
      payload
    );

  const eventType =
    extractEventType(
      payload
    );

  const payloadHash =
    hashWebhookPayload(
      rawBody
    );

  const deduplicationKey =
    createDeduplicationKey(
      providerName,
      eventId,
      payloadHash
    );

  return {
    event: {
      provider:
        providerName,
      eventId,
      providerReference,
      eventType,
    },

    payloadHash,
    deduplicationKey,
    payload,
    bodySize,
    signatureVerified: true,
  };
}