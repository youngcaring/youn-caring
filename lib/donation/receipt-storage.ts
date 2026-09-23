import "server-only";

import {
  createHash,
  timingSafeEqual,
} from "node:crypto";

import type {
  DonationReceiptPrivateStorage,
} from "@/lib/donation/receipt-service";

/**
 * ============================================================================
 * YOUNG CARING
 * STOCKAGE PRIVÉ DES REÇUS DE DON
 * ============================================================================
 *
 * Ce fichier :
 *
 * - conserve les reçus PDF dans Supabase Storage ;
 * - utilise uniquement une clé secrète côté serveur ;
 * - refuse les buckets publics ;
 * - vérifie la taille et l’empreinte SHA-256 du PDF ;
 * - protège les chemins contre les traversées de répertoires ;
 * - écrase de manière idempotente un fichier ayant la même clé ;
 * - ne produit aucune URL publique permanente ;
 * - ne journalise jamais les secrets Supabase.
 *
 * Ce fichier doit rester exclusivement côté serveur.
 * ============================================================================
 */

const DEFAULT_REQUEST_TIMEOUT_MS =
  20_000;

const MAX_PDF_SIZE_BYTES =
  10_000_000;

const MAX_STORAGE_KEY_LENGTH =
  500;

const MAX_ERROR_RESPONSE_LENGTH =
  1_000;

const PDF_CONTENT_TYPE =
  "application/pdf" as const;

const SHA256_PATTERN =
  /^[a-f0-9]{64}$/;

const BUCKET_NAME_PATTERN =
  /^[a-z0-9](?:[a-z0-9._-]{1,61}[a-z0-9])?$/;

const STORAGE_KEY_PATTERN =
  /^[A-Za-z0-9/_.-]+$/;

type UnknownRecord =
  Record<string, unknown>;

type SupabaseStorageConfiguration =
  Readonly<{
    projectUrl: string;
    secretKey: string;
    bucketName: string;
    requestTimeoutMs: number;
  }>;

type SupabaseBucketInformation =
  Readonly<{
    id: string;
    name: string;
    public: boolean;
  }>;

export type SupabaseDonationReceiptStorageOptions =
  Readonly<{
    /**
     * URL du projet Supabase.
     *
     * Exemple :
     * https://abcdefgh.supabase.co
     */
    projectUrl?: string;

    /**
     * Clé secrète Supabase.
     *
     * Cette valeur ne doit jamais utiliser
     * le préfixe NEXT_PUBLIC_.
     */
    secretKey?: string;

    /**
     * Nom du bucket privé.
     */
    bucketName?: string;

    /**
     * Délai maximal d’une requête Storage.
     */
    requestTimeoutMs?: number;
  }>;

/**
 * Erreur contrôlée du stockage des reçus.
 */
export class DonationReceiptStorageError
  extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly retryable: boolean;

  constructor(
    code: string,
    message: string,
    statusCode = 500,
    retryable = false,
    options?: ErrorOptions
  ) {
    super(message, options);

    this.name =
      "DonationReceiptStorageError";

    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

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

function readBoolean(
  value: unknown
): boolean | null {
  return typeof value === "boolean"
    ? value
    : null;
}

function normalizeProjectUrl(
  value: string
): string {
  let url: URL;

  try {
    url =
      new URL(value.trim());
  } catch {
    throw new DonationReceiptStorageError(
      "INVALID_SUPABASE_URL",
      "L’adresse du projet Supabase est invalide.",
      500
    );
  }

  if (url.protocol !== "https:") {
    throw new DonationReceiptStorageError(
      "INVALID_SUPABASE_URL",
      "L’adresse du projet Supabase doit utiliser HTTPS.",
      500
    );
  }

  if (
    url.username.length > 0 ||
    url.password.length > 0
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_SUPABASE_URL",
      "L’adresse du projet Supabase contient des identifiants interdits.",
      500
    );
  }

  if (
    url.pathname !== "/" &&
    url.pathname !== ""
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_SUPABASE_URL",
      "L’adresse du projet Supabase ne doit pas contenir de chemin.",
      500
    );
  }

  url.pathname = "";
  url.search = "";
  url.hash = "";

  return url
    .toString()
    .replace(/\/+$/, "");
}

function normalizeSecretKey(
  value: string
): string {
  const normalized =
    value.trim();

  if (
    normalized.length < 20 ||
    normalized.length > 4_096 ||
    /[\r\n\u0000-\u001F\u007F]/.test(
      normalized
    )
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_SUPABASE_SECRET_KEY",
      "La clé secrète Supabase est invalide.",
      500
    );
  }

  return normalized;
}

function normalizeBucketName(
  value: string
): string {
  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    normalized.length < 3 ||
    normalized.length > 63 ||
    !BUCKET_NAME_PATTERN.test(
      normalized
    )
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_RECEIPT_BUCKET",
      "Le nom du bucket des reçus est invalide.",
      500
    );
  }

  return normalized;
}

function normalizeTimeout(
  value: number | undefined
): number {
  if (value === undefined) {
    return DEFAULT_REQUEST_TIMEOUT_MS;
  }

  if (
    !Number.isSafeInteger(value) ||
    value < 1_000 ||
    value > 60_000
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_STORAGE_TIMEOUT",
      "Le délai du stockage est invalide.",
      500
    );
  }

  return value;
}

function normalizeStorageKey(
  value: string
): string {
  const normalized =
    value
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(/^\/+/, "")
      .trim();

  if (
    normalized.length === 0 ||
    normalized.length >
      MAX_STORAGE_KEY_LENGTH ||
    normalized.startsWith(".") ||
    normalized.endsWith("/") ||
    normalized.includes("..") ||
    normalized.includes("//") ||
    !STORAGE_KEY_PATTERN.test(
      normalized
    )
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_RECEIPT_STORAGE_KEY",
      "La clé de stockage du reçu est invalide.",
      400
    );
  }

  const pathSegments =
    normalized.split("/");

  if (
    pathSegments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".." ||
        segment.startsWith(".")
    )
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_RECEIPT_STORAGE_KEY",
      "La clé de stockage du reçu contient un chemin interdit.",
      400
    );
  }

  if (
    !normalized
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_RECEIPT_FILE_EXTENSION",
      "Le fichier du reçu doit utiliser l’extension PDF.",
      400
    );
  }

  return normalized;
}

/**
 * Encode séparément chaque partie du chemin.
 *
 * Les barres obliques restent des séparateurs,
 * mais aucun segment ne peut modifier le chemin.
 */
function encodeStorageKey(
  value: string
): string {
  return value
    .split("/")
    .map((segment) =>
      encodeURIComponent(segment)
    )
    .join("/");
}

function calculateSha256(
  content: Buffer
): string {
  return createHash("sha256")
    .update(content)
    .digest("hex");
}

function compareSha256(
  expected: string,
  actual: string
): boolean {
  if (
    !SHA256_PATTERN.test(expected) ||
    !SHA256_PATTERN.test(actual)
  ) {
    return false;
  }

  const expectedBuffer =
    Buffer.from(
      expected,
      "hex"
    );

  const actualBuffer =
    Buffer.from(
      actual,
      "hex"
    );

  return (
    expectedBuffer.length ===
      actualBuffer.length &&
    timingSafeEqual(
      expectedBuffer,
      actualBuffer
    )
  );
}

function assertValidPdf(
  content: Buffer,
  expectedSha256: string
): string {
  if (
    !Buffer.isBuffer(content) ||
    content.length === 0
  ) {
    throw new DonationReceiptStorageError(
      "EMPTY_RECEIPT_PDF",
      "Le reçu PDF est vide.",
      400
    );
  }

  if (
    content.length >
    MAX_PDF_SIZE_BYTES
  ) {
    throw new DonationReceiptStorageError(
      "RECEIPT_PDF_TOO_LARGE",
      "Le reçu PDF dépasse la taille autorisée.",
      400
    );
  }

  const hasPdfSignature =
    content.length >= 5 &&
    content[0] === 0x25 &&
    content[1] === 0x50 &&
    content[2] === 0x44 &&
    content[3] === 0x46 &&
    content[4] === 0x2d;

  if (!hasPdfSignature) {
    throw new DonationReceiptStorageError(
      "INVALID_RECEIPT_PDF",
      "Le document reçu n’est pas un fichier PDF valide.",
      400
    );
  }

  const normalizedExpectedHash =
    expectedSha256
      .trim()
      .toLowerCase();

  if (
    !SHA256_PATTERN.test(
      normalizedExpectedHash
    )
  ) {
    throw new DonationReceiptStorageError(
      "INVALID_RECEIPT_SHA256",
      "L’empreinte du reçu PDF est invalide.",
      400
    );
  }

  const actualHash =
    calculateSha256(content);

  if (
    !compareSha256(
      normalizedExpectedHash,
      actualHash
    )
  ) {
    throw new DonationReceiptStorageError(
      "RECEIPT_SHA256_MISMATCH",
      "L’empreinte du reçu PDF ne correspond pas au fichier.",
      409
    );
  }

  return actualHash;
}

/**
 * Crée un ArrayBuffer indépendant et compatible
 * avec le type BodyInit attendu par fetch.
 *
 * Buffer utilise ArrayBufferLike dans les versions
 * récentes des types Node.js. Une copie explicite
 * évite toute incompatibilité avec SharedArrayBuffer.
 */
function createUploadBody(
  content: Buffer
): ArrayBuffer {
  const uploadBody =
    new ArrayBuffer(
      content.byteLength
    );

  new Uint8Array(
    uploadBody
  ).set(content);

  return uploadBody;
}

function getConfiguration(
  options:
    SupabaseDonationReceiptStorageOptions
): SupabaseStorageConfiguration {
  const projectUrl =
    options.projectUrl ??
    process.env.SUPABASE_URL ??
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  /*
   * SUPABASE_SECRET_KEY correspond aux nouvelles
   * clés secrètes sb_secret_...
   *
   * SUPABASE_SERVICE_ROLE_KEY reste accepté pour
   * les anciens projets utilisant la clé JWT
   * service_role.
   */
  const secretKey =
    options.secretKey ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

  const bucketName =
    options.bucketName ??
    process.env
      .DONATION_RECEIPTS_BUCKET ??
    "donation-receipts";

  if (!projectUrl) {
    throw new DonationReceiptStorageError(
      "SUPABASE_URL_MISSING",
      "SUPABASE_URL est absente.",
      503
    );
  }

  if (!secretKey) {
    throw new DonationReceiptStorageError(
      "SUPABASE_SECRET_KEY_MISSING",
      "La clé secrète Supabase est absente.",
      503
    );
  }

  return {
    projectUrl:
      normalizeProjectUrl(
        projectUrl
      ),

    secretKey:
      normalizeSecretKey(
        secretKey
      ),

    bucketName:
      normalizeBucketName(
        bucketName
      ),

    requestTimeoutMs:
      normalizeTimeout(
        options.requestTimeoutMs
      ),
  };
}

async function readLimitedResponse(
  response: Response
): Promise<string> {
  try {
    const text =
      await response.text();

    return text
      .replace(
        /[\u0000-\u001F\u007F]/g,
        " "
      )
      .replace(/\s+/g, " ")
      .trim()
      .slice(
        0,
        MAX_ERROR_RESPONSE_LENGTH
      );
  } catch {
    return "";
  }
}

function getSafeStorageErrorMessage(
  rawResponse: string
): string {
  if (!rawResponse) {
    return "Supabase Storage a refusé la requête.";
  }

  try {
    const parsed =
      JSON.parse(
        rawResponse
      ) as unknown;

    if (isRecord(parsed)) {
      const message =
        readString(parsed.message) ??
        readString(parsed.error) ??
        readString(parsed.code);

      if (message) {
        return message.slice(
          0,
          MAX_ERROR_RESPONSE_LENGTH
        );
      }
    }
  } catch {
    /*
     * La réponse n’est pas un objet JSON.
     */
  }

  return rawResponse.slice(
    0,
    MAX_ERROR_RESPONSE_LENGTH
  );
}

function getStorageStatusCode(
  status: number
): number {
  if (
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 408 ||
    status === 429
  ) {
    return 503;
  }

  if (
    status >= 500 &&
    status <= 599
  ) {
    return 503;
  }

  return 502;
}

function isRetryableStatus(
  status: number
): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

/**
 * Adaptateur Supabase Storage privé.
 */
export class SupabaseDonationReceiptStorage
  implements DonationReceiptPrivateStorage {
  private readonly configuration:
    SupabaseStorageConfiguration;

  private bucketValidationPromise:
    Promise<void> | null = null;

  constructor(
    options:
      SupabaseDonationReceiptStorageOptions = {}
  ) {
    this.configuration =
      getConfiguration(options);
  }

  /**
   * Construit les en-têtes d’administration.
   */
  private createAuthorizationHeaders():
    Record<string, string> {
    return {
      apikey:
        this.configuration.secretKey,

      Authorization:
        `Bearer ${this.configuration.secretKey}`,
    };
  }

  /**
   * Fusionne les en-têtes sans supposer que
   * RequestInit.headers est un simple objet.
   *
   * HeadersInit peut également être une instance
   * de Headers ou un tableau de paires.
   */
  private createRequestHeaders(
    initialHeaders:
      HeadersInit | undefined
  ): Headers {
    const headers =
      new Headers(initialHeaders);

    const authorizationHeaders =
      this.createAuthorizationHeaders();

    for (
      const [
        name,
        value,
      ] of Object.entries(
        authorizationHeaders
      )
    ) {
      headers.set(
        name,
        value
      );
    }

    return headers;
  }

  /**
   * Exécute une requête vers Supabase Storage
   * avec un délai maximal strict.
   */
  private async request(
    path: string,
    init: RequestInit
  ): Promise<Response> {
    if (
      !path.startsWith(
        "/storage/v1/"
      )
    ) {
      throw new DonationReceiptStorageError(
        "INVALID_STORAGE_API_PATH",
        "Le chemin de l’API Storage est invalide.",
        500
      );
    }

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),

        this.configuration
          .requestTimeoutMs
      );

    try {
      const headers =
        this.createRequestHeaders(
          init.headers
        );

      return await fetch(
        `${this.configuration.projectUrl}${path}`,
        {
          ...init,
          headers,
          cache:
            "no-store",
          redirect:
            "error",
          signal:
            controller.signal,
        }
      );
    } catch (error: unknown) {
      if (
        error instanceof
          DonationReceiptStorageError
      ) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new DonationReceiptStorageError(
          "SUPABASE_STORAGE_TIMEOUT",
          "Supabase Storage n’a pas répondu dans le délai prévu.",
          504,
          true,
          {
            cause: error,
          }
        );
      }

      throw new DonationReceiptStorageError(
        "SUPABASE_STORAGE_NETWORK_ERROR",
        "La connexion au stockage privé des reçus a échoué.",
        503,
        true,
        {
          cause: error,
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Vérifie une seule fois par instance que :
   *
   * - le bucket existe ;
   * - le bucket demandé est le bon ;
   * - le bucket n’est pas public.
   */
  private async validatePrivateBucket():
    Promise<void> {
    if (
      this.bucketValidationPromise
    ) {
      return this
        .bucketValidationPromise;
    }

    this.bucketValidationPromise =
      this.performBucketValidation();

    try {
      await this
        .bucketValidationPromise;
    } catch (error: unknown) {
      /*
       * Une validation échouée pourra être
       * retentée lors du prochain appel.
       */
      this.bucketValidationPromise =
        null;

      throw error;
    }
  }

  private async performBucketValidation():
    Promise<void> {
    const encodedBucket =
      encodeURIComponent(
        this.configuration
          .bucketName
      );

    const response =
      await this.request(
        `/storage/v1/bucket/${encodedBucket}`,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (!response.ok) {
      const rawError =
        await readLimitedResponse(
          response
        );

      console.error(
        "Donation receipt bucket validation failed:",
        {
          status:
            response.status,

          bucket:
            this.configuration
              .bucketName,

          providerMessage:
            getSafeStorageErrorMessage(
              rawError
            ),
        }
      );

      throw new DonationReceiptStorageError(
        response.status === 404
          ? "RECEIPT_BUCKET_NOT_FOUND"
          : "RECEIPT_BUCKET_VALIDATION_FAILED",

        response.status === 404
          ? "Le bucket privé des reçus est introuvable."
          : "Le bucket des reçus n’a pas pu être vérifié.",

        getStorageStatusCode(
          response.status
        ),

        isRetryableStatus(
          response.status
        )
      );
    }

    const rawBody =
      await response.text();

    let body: unknown;

    try {
      body =
        JSON.parse(
          rawBody
        ) as unknown;
    } catch {
      throw new DonationReceiptStorageError(
        "INVALID_BUCKET_RESPONSE",
        "Supabase a retourné une réponse de bucket invalide.",
        502,
        true
      );
    }

    if (!isRecord(body)) {
      throw new DonationReceiptStorageError(
        "INVALID_BUCKET_RESPONSE",
        "Les informations du bucket sont invalides.",
        502,
        true
      );
    }

    const bucket:
      SupabaseBucketInformation = {
      id:
        readString(body.id) ??
        "",

      name:
        readString(body.name) ??
        "",

      public:
        readBoolean(
          body.public
        ) ??
        true,
    };

    if (
      bucket.id !==
        this.configuration
          .bucketName &&
      bucket.name !==
        this.configuration
          .bucketName
    ) {
      throw new DonationReceiptStorageError(
        "RECEIPT_BUCKET_MISMATCH",
        "Le bucket retourné par Supabase ne correspond pas au bucket configuré.",
        502
      );
    }

    if (bucket.public) {
      throw new DonationReceiptStorageError(
        "PUBLIC_RECEIPT_BUCKET_REJECTED",
        "Le bucket des reçus doit obligatoirement être privé.",
        503
      );
    }
  }

  /**
   * Enregistre un reçu dans le bucket privé.
   *
   * x-upsert garantit qu’un second traitement
   * du même reçu réutilise la même clé.
   */
  async save(
    input: Readonly<{
      key: string;
      content: Buffer;
      contentType:
        typeof PDF_CONTENT_TYPE;
      sha256: string;
    }>
  ): Promise<void> {
    if (
      input.contentType !==
      PDF_CONTENT_TYPE
    ) {
      throw new DonationReceiptStorageError(
        "INVALID_RECEIPT_CONTENT_TYPE",
        "Le type du fichier reçu est invalide.",
        400
      );
    }

    const storageKey =
      normalizeStorageKey(
        input.key
      );

    const verifiedSha256 =
      assertValidPdf(
        input.content,
        input.sha256
      );

    await this
      .validatePrivateBucket();

    const encodedBucket =
      encodeURIComponent(
        this.configuration
          .bucketName
      );

    const encodedKey =
      encodeStorageKey(
        storageKey
      );

    /*
     * Correction de l’erreur :
     *
     * Buffer<ArrayBufferLike> n’est pas directement
     * compatible avec BodyInit dans cette version
     * de TypeScript.
     */
    const uploadBody =
      createUploadBody(
        input.content
      );

    const response =
      await this.request(
        `/storage/v1/object/${encodedBucket}/${encodedKey}`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              PDF_CONTENT_TYPE,

            "Cache-Control":
              "private, no-store, max-age=0",

            "x-upsert":
              "true",

            "x-metadata":
              JSON.stringify({
                sha256:
                  verifiedSha256,

                documentType:
                  "donation_receipt",
              }),
          },

          body:
            uploadBody,
        }
      );

    if (!response.ok) {
      const rawError =
        await readLimitedResponse(
          response
        );

      console.error(
        "Donation receipt upload failed:",
        {
          status:
            response.status,

          bucket:
            this.configuration
              .bucketName,

          /*
           * La clé complète n’est pas
           * journalisée.
           */
          fileName:
            storageKey
              .split("/")
              .pop() ??
            "unknown.pdf",

          providerMessage:
            getSafeStorageErrorMessage(
              rawError
            ),
        }
      );

      throw new DonationReceiptStorageError(
        "RECEIPT_STORAGE_UPLOAD_FAILED",
        "Le reçu PDF n’a pas pu être enregistré dans le stockage privé.",
        getStorageStatusCode(
          response.status
        ),
        isRetryableStatus(
          response.status
        )
      );
    }
  }
}

/**
 * Instance utilisée par le service des reçus.
 *
 * La configuration est chargée uniquement lors
 * de la première véritable opération serveur.
 */
let storageInstance:
  SupabaseDonationReceiptStorage |
  null = null;

export function getDonationReceiptStorage():
  DonationReceiptPrivateStorage {
  if (!storageInstance) {
    storageInstance =
      new SupabaseDonationReceiptStorage();
  }

  return storageInstance;
}

/**
 * Proxy évitant de charger les variables
 * d’environnement au chargement du module.
 */
export const donationReceiptStorage:
  DonationReceiptPrivateStorage = {
  async save(input): Promise<void> {
    await getDonationReceiptStorage()
      .save(input);
  },
};

export default
  donationReceiptStorage;