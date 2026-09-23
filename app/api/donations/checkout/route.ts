import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  createPaymentSession,
  hasRegisteredPaymentProvider,
  PaymentConfigurationError,
  PaymentProviderError,
  registerPaymentProvider,
} from "@/lib/donation/payment-provider";

import {
  generateDonationReference,
} from "@/lib/donation/payment-reference";

import {
  monerooPaymentProvider,
} from "@/lib/donation/providers/moneroo-provider";

import {
  validateDonationCheckout,
} from "@/lib/donation/validation";

/**
 * ============================================================================
 * YOUNG CARING
 * CRÉATION D’UNE SESSION DE PAIEMENT
 * ============================================================================
 *
 * Cette route :
 *
 * - accepte uniquement les requêtes POST ;
 * - vérifie strictement l’origine de la requête ;
 * - autorise localhost uniquement en développement ;
 * - limite le nombre de requêtes par adresse IP ;
 * - contrôle le type et la taille du corps ;
 * - valide entièrement les données du don ;
 * - génère une référence Young Caring sécurisée ;
 * - crée une session de paiement auprès de Moneroo ;
 * - ne reçoit et ne conserve aucune donnée bancaire ;
 * - ne retourne aucun secret au navigateur.
 * ============================================================================
 */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const MAX_REQUEST_SIZE =
  32_000;

const RATE_LIMIT_WINDOW =
  60_000;

const RATE_LIMIT_MAX_REQUESTS =
  5;

const MAX_RATE_LIMIT_ENTRIES =
  10_000;

const DEVELOPMENT_HOSTNAMES =
  new Set<string>([
    "localhost",
    "127.0.0.1",
    "::1",
    "[::1]",
  ]);

type RateLimitEntry =
  Readonly<{
    count: number;
    expiresAt: number;
  }>;

type RateLimitResult =
  Readonly<{
    limited: boolean;
    retryAfter: number;
  }>;

/**
 * Limitation temporaire en mémoire.
 *
 * Dans une production utilisant plusieurs instances,
 * cette Map devra être remplacée par Redis, Upstash
 * ou une autre solution centralisée.
 */
const rateLimitStore =
  new Map<
    string,
    RateLimitEntry
  >();

/**
 * Enregistre l’adaptateur Moneroo une seule fois
 * dans le registre central des prestataires.
 */
if (
  !hasRegisteredPaymentProvider(
    "moneroo"
  )
) {
  registerPaymentProvider(
    monerooPaymentProvider
  );
}

/**
 * Retourne une réponse JSON sécurisée
 * et non mise en cache.
 */
function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  additionalHeaders?:
    Readonly<Record<string, string>>
): NextResponse {
  return NextResponse.json(
    body,
    {
      status,

      headers: {
        "Cache-Control":
          "no-store, max-age=0",

        Pragma:
          "no-cache",

        Expires:
          "0",

        "X-Content-Type-Options":
          "nosniff",

        "Referrer-Policy":
          "strict-origin-when-cross-origin",

        ...additionalHeaders,
      },
    }
  );
}

/**
 * Nettoie une valeur utilisée comme
 * identifiant de limitation.
 */
function normalizeClientIdentifier(
  value: string
): string | null {
  const normalized =
    value
      .replace(
        /[\u0000-\u001F\u007F]/g,
        ""
      )
      .trim()
      .slice(
        0,
        100
      );

  return normalized.length > 0
    ? normalized
    : null;
}

/**
 * Récupère l’adresse IP transmise
 * par le proxy d’hébergement.
 */
function getClientIp(
  request: NextRequest
): string {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for"
    );

  if (forwardedFor) {
    const firstAddress =
      forwardedFor
        .split(",")
        .at(0);

    if (firstAddress) {
      const normalizedAddress =
        normalizeClientIdentifier(
          firstAddress
        );

      if (normalizedAddress) {
        return normalizedAddress;
      }
    }
  }

  const realIp =
    request.headers.get(
      "x-real-ip"
    );

  if (realIp) {
    const normalizedAddress =
      normalizeClientIdentifier(
        realIp
      );

    if (normalizedAddress) {
      return normalizedAddress;
    }
  }

  /**
   * En développement local, aucune adresse
   * fournie par un proxy ne sera parfois disponible.
   */
  return "unknown";
}

/**
 * Supprime les entrées expirées
 * du stockage de limitation.
 */
function cleanExpiredRateLimitEntries(
  currentTime: number
): void {
  for (
    const [
      identifier,
      entry,
    ] of rateLimitStore
  ) {
    if (
      entry.expiresAt <=
      currentTime
    ) {
      rateLimitStore.delete(
        identifier
      );
    }
  }
}

/**
 * Vérifie la limite de requêtes
 * par minute et par adresse IP.
 */
function checkRateLimit(
  identifier: string
): RateLimitResult {
  const currentTime =
    Date.now();

  if (
    rateLimitStore.size >=
      MAX_RATE_LIMIT_ENTRIES ||
    (
      rateLimitStore.size > 0 &&
      rateLimitStore.size %
        100 ===
        0
    )
  ) {
    cleanExpiredRateLimitEntries(
      currentTime
    );
  }

  const currentEntry =
    rateLimitStore.get(
      identifier
    );

  if (
    !currentEntry ||
    currentEntry.expiresAt <=
      currentTime
  ) {
    if (
      !currentEntry &&
      rateLimitStore.size >=
        MAX_RATE_LIMIT_ENTRIES
    ) {
      return {
        limited: true,

        retryAfter:
          Math.ceil(
            RATE_LIMIT_WINDOW /
              1_000
          ),
      };
    }

    rateLimitStore.set(
      identifier,
      {
        count: 1,

        expiresAt:
          currentTime +
          RATE_LIMIT_WINDOW,
      }
    );

    return {
      limited: false,
      retryAfter: 0,
    };
  }

  const remainingMilliseconds =
    Math.max(
      0,
      currentEntry.expiresAt -
        currentTime
    );

  const retryAfter =
    Math.max(
      1,
      Math.ceil(
        remainingMilliseconds /
          1_000
      )
    );

  if (
    currentEntry.count >=
    RATE_LIMIT_MAX_REQUESTS
  ) {
    return {
      limited: true,
      retryAfter,
    };
  }

  rateLimitStore.set(
    identifier,
    {
      count:
        currentEntry.count + 1,

      expiresAt:
        currentEntry.expiresAt,
    }
  );

  return {
    limited: false,
    retryAfter: 0,
  };
}

/**
 * Charge et contrôle l’adresse publique
 * officielle configurée pour le site.
 *
 * NEXT_PUBLIC_SITE_URL doit conserver le domaine
 * public Young Caring, y compris pendant les
 * tests locaux.
 */
const OFFICIAL_PRODUCTION_SITE_URL =
  "https://young-caring.org";

function getConfiguredSiteUrl(): URL | null {
  const isProduction =
    process.env.NODE_ENV === "production";

  const fallbackUrl = isProduction
    ? OFFICIAL_PRODUCTION_SITE_URL
    : "http://localhost:3000";

  const candidates = [
    process.env.SITE_URL?.trim(),
    process.env.NEXT_PUBLIC_SITE_URL?.trim(),
    fallbackUrl,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      const siteUrl = new URL(candidate);

      const protocolIsAllowed =
        siteUrl.protocol === "https:" ||
        (
          !isProduction &&
          siteUrl.protocol === "http:"
        );

      if (
        !protocolIsAllowed ||
        siteUrl.username.length > 0 ||
        siteUrl.password.length > 0 ||
        siteUrl.search.length > 0 ||
        siteUrl.hash.length > 0
      ) {
        continue;
      }

      if (
        siteUrl.pathname !== "/" &&
        siteUrl.pathname !== ""
      ) {
        continue;
      }

      siteUrl.pathname = "/";

      return siteUrl;
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Vérifie l’origine de la requête.
 *
 * En production :
 *
 * - seule l’origine officielle configurée est autorisée.
 *
 * En développement :
 *
 * - l’origine officielle reste autorisée ;
 * - localhost est autorisé uniquement lorsqu’il
 *   correspond exactement à l’origine Next.js.
 */
function hasValidOrigin(
  request: NextRequest,
  siteUrl: URL
): boolean {
  const originHeader =
    request.headers.get(
      "origin"
    );

  if (!originHeader) {
    return false;
  }

  const fetchSite =
    request.headers
      .get("sec-fetch-site")
      ?.trim()
      .toLowerCase();

  if (
    fetchSite &&
    fetchSite !==
      "same-origin" &&
    fetchSite !==
      "same-site"
  ) {
    return false;
  }

  let submittedOrigin: URL;

  try {
    submittedOrigin =
      new URL(
        originHeader
      );
  } catch {
    return false;
  }

  if (
    submittedOrigin.username.length >
      0 ||
    submittedOrigin.password.length >
      0
  ) {
    return false;
  }

  if (
    submittedOrigin.origin ===
    siteUrl.origin
  ) {
    return true;
  }

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    return false;
  }

  if (
    !DEVELOPMENT_HOSTNAMES.has(
      submittedOrigin.hostname
    )
  ) {
    return false;
  }

  if (
    submittedOrigin.protocol !==
      "http:" &&
    submittedOrigin.protocol !==
      "https:"
  ) {
    return false;
  }

  return (
    submittedOrigin.origin ===
    request.nextUrl.origin
  );
}

/**
 * Vérifie que le corps utilise
 * le type application/json.
 */
function hasJsonContentType(
  request: NextRequest
): boolean {
  const contentType =
    request.headers
      .get("content-type")
      ?.split(";")
      .at(0)
      ?.trim()
      .toLowerCase();

  return (
    contentType ===
    "application/json"
  );
}

/**
 * Vérifie la taille annoncée dans
 * l’en-tête Content-Length.
 */
function requestIsTooLarge(
  request: NextRequest
): boolean {
  const contentLength =
    request.headers.get(
      "content-length"
    );

  if (!contentLength) {
    return false;
  }

  const declaredLength =
    Number(
      contentLength
    );

  if (
    !Number.isSafeInteger(
      declaredLength
    ) ||
    declaredLength < 0
  ) {
    return true;
  }

  return (
    declaredLength >
    MAX_REQUEST_SIZE
  );
}

/**
 * Retourne un statut HTTP pouvant être
 * exposé au navigateur sans révéler les
 * détails internes du prestataire.
 */
function getSafeProviderStatusCode(
  statusCode: number
): number {
  if (
    statusCode === 400 ||
    statusCode === 409 ||
    statusCode === 422 ||
    statusCode === 429
  ) {
    return statusCode;
  }

  return 502;
}

/**
 * Crée une session de paiement pour un don.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const siteUrl =
    getConfiguredSiteUrl();

  if (!siteUrl) {
    console.error(
      "Donation checkout configuration error:",
      {
        code:
          "INVALID_NEXT_PUBLIC_SITE_URL",
      }
    );

    return jsonResponse(
      {
        success: false,

        error:
          "PAYMENT_CONFIGURATION_ERROR",
      },
      503
    );
  }

  if (
    !hasValidOrigin(
      request,
      siteUrl
    )
  ) {
    return jsonResponse(
      {
        success: false,

        error:
          "INVALID_REQUEST_ORIGIN",
      },
      403
    );
  }

  const clientIp =
    getClientIp(
      request
    );

  const rateLimit =
    checkRateLimit(
      clientIp
    );

  if (rateLimit.limited) {
    return jsonResponse(
      {
        success: false,

        error:
          "TOO_MANY_PAYMENT_REQUESTS",
      },
      429,
      {
        "Retry-After":
          rateLimit
            .retryAfter
            .toString(),
      }
    );
  }

  if (
    !hasJsonContentType(
      request
    )
  ) {
    return jsonResponse(
      {
        success: false,

        error:
          "UNSUPPORTED_CONTENT_TYPE",
      },
      415
    );
  }

  if (
    requestIsTooLarge(
      request
    )
  ) {
    return jsonResponse(
      {
        success: false,

        error:
          "REQUEST_TOO_LARGE",
      },
      413
    );
  }

  let rawBody: string;

  try {
    rawBody =
      await request.text();
  } catch {
    return jsonResponse(
      {
        success: false,

        error:
          "INVALID_REQUEST_BODY",
      },
      400
    );
  }

  if (
    rawBody.trim().length ===
    0
  ) {
    return jsonResponse(
      {
        success: false,

        error:
          "EMPTY_REQUEST_BODY",
      },
      400
    );
  }

  /**
   * Content-Length peut être absent avec certains
   * proxies. La taille réelle du corps est donc
   * également contrôlée après sa lecture.
   */
  if (
    Buffer.byteLength(
      rawBody,
      "utf8"
    ) >
    MAX_REQUEST_SIZE
  ) {
    return jsonResponse(
      {
        success: false,

        error:
          "REQUEST_TOO_LARGE",
      },
      413
    );
  }

  let input: unknown;

  try {
    input =
      JSON.parse(
        rawBody
      ) as unknown;
  } catch {
    return jsonResponse(
      {
        success: false,

        error:
          "INVALID_JSON",
      },
      400
    );
  }

  /**
   * La validation vérifie notamment :
   *
   * - la fréquence ;
   * - le montant ;
   * - la devise XOF, EUR ou USD ;
   * - les limites propres à chaque devise ;
   * - le domaine soutenu ;
   * - les informations du donateur ;
   * - le consentement.
   */
  const validation =
    validateDonationCheckout(
      input
    );

  if (!validation.success) {
    return jsonResponse(
      {
        success: false,

        error:
          "DONATION_VALIDATION_FAILED",

        fieldErrors:
          validation.errors,
      },
      400
    );
  }

  let reference: string;

  try {
    reference =
      generateDonationReference();
  } catch (error: unknown) {
    console.error(
      "Donation reference generation failed:",
      {
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );

    return jsonResponse(
      {
        success: false,

        error:
          "PAYMENT_INITIALIZATION_FAILED",
      },
      500
    );
  }

  /**
   * Les URL de retour reposent toujours
   * sur le domaine public officiel.
   *
   * Moneroo ne doit jamais rediriger un utilisateur
   * réel vers une adresse localhost.
   */
  const successUrl =
    new URL(
      "/don/succes",
      siteUrl
    );

  successUrl.searchParams.set(
    "reference",
    reference
  );

  const cancelUrl =
    new URL(
      "/don/annule",
      siteUrl
    );

  cancelUrl.searchParams.set(
    "reference",
    reference
  );

  try {
    const paymentSession =
      await createPaymentSession({
        reference,

        donation:
          validation.data,

        successUrl:
          successUrl.toString(),

        cancelUrl:
          cancelUrl.toString(),
      });

    return jsonResponse(
      {
        success: true,

        reference,

        checkoutUrl:
          paymentSession.checkoutUrl,
      },
      201
    );
  } catch (error: unknown) {
    /**
     * Aucun secret, jeton ou contenu sensible
     * n’est retourné au navigateur.
     */
    if (
      error instanceof
      PaymentConfigurationError
    ) {
      console.error(
        "Payment configuration error:",
        {
          code:
            error.code,

          /**
           * Ce message indique seulement le nom
           * du paramètre invalide ou absent.
           */
          message:
            error.message,
        }
      );

      return jsonResponse(
        {
          success: false,

          error:
            "PAYMENT_SERVICE_NOT_CONFIGURED",
        },
        503
      );
    }

    if (
      error instanceof
      PaymentProviderError
    ) {
      console.error(
        "Payment provider error:",
        {
          code:
            error.code,

          statusCode:
            error.statusCode,
        }
      );

      const safeStatus =
        getSafeProviderStatusCode(
          error.statusCode
        );

      return jsonResponse(
        {
          success: false,

          error:
            safeStatus >= 400 &&
            safeStatus <= 499
              ? "PAYMENT_REQUEST_REJECTED"
              : "PAYMENT_SERVICE_UNAVAILABLE",
        },
        safeStatus
      );
    }

    console.error(
      "Unexpected payment initialization error:",
      {
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );

    return jsonResponse(
      {
        success: false,

        error:
          "PAYMENT_INITIALIZATION_FAILED",
      },
      500
    );
  }
}

/**
 * Réponse commune aux méthodes HTTP
 * qui ne sont pas autorisées.
 */
function methodNotAllowed():
  NextResponse {
  return jsonResponse(
    {
      success: false,

      error:
        "METHOD_NOT_ALLOWED",
    },
    405,
    {
      Allow:
        "POST",
    }
  );
}

/**
 * Cette route accepte uniquement POST.
 */
export function GET():
  NextResponse {
  return methodNotAllowed();
}

export function PUT():
  NextResponse {
  return methodNotAllowed();
}

export function PATCH():
  NextResponse {
  return methodNotAllowed();
}

export function DELETE():
  NextResponse {
  return methodNotAllowed();
}