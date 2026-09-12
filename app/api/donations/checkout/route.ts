import { NextResponse } from "next/server";
import type {
  NextRequest,
} from "next/server";

import {
  createPaymentSession,
  PaymentConfigurationError,
  PaymentProviderError,
} from "@/lib/donation/payment-provider";
import {
  generateDonationReference,
} from "@/lib/donation/payment-reference";
import {
  validateDonationCheckout,
} from "@/lib/donation/validation";

/*
 * Cette route utilise des fonctionnalités Node.js,
 * notamment pour la génération sécurisée des références.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_SIZE = 32_000;
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_RATE_LIMIT_ENTRIES = 10_000;

type RateLimitEntry = Readonly<{
  count: number;
  expiresAt: number;
}>;

type RateLimitResult = Readonly<{
  limited: boolean;
  retryAfter: number;
}>;

/*
 * Limitation temporaire en mémoire.
 *
 * Sur une production utilisant plusieurs serveurs,
 * cette Map devra être remplacée par Redis, Upstash
 * ou une autre solution centralisée.
 */
const rateLimitStore = new Map<
  string,
  RateLimitEntry
>();

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  additionalHeaders?: HeadersInit
): NextResponse {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control":
        "no-store, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options":
        "nosniff",
      ...additionalHeaders,
    },
  });
}

/*
 * Récupère l’adresse transmise par
 * le proxy d’hébergement.
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
        .at(0)
        ?.trim();

    if (firstAddress) {
      return firstAddress.slice(0, 100);
    }
  }

  const realIp =
    request.headers
      .get("x-real-ip")
      ?.trim();

  if (realIp) {
    return realIp.slice(0, 100);
  }

  /*
   * En développement local, aucune adresse
   * transmise par un proxy ne sera parfois disponible.
   */
  return "unknown";
}

/*
 * Supprime toutes les entrées expirées.
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
      entry.expiresAt <= currentTime
    ) {
      rateLimitStore.delete(identifier);
    }
  }
}

/*
 * Vérifie la limite de cinq tentatives
 * par minute et par adresse IP.
 */
function checkRateLimit(
  identifier: string
): RateLimitResult {
  const currentTime = Date.now();

  /*
   * Le nettoyage est exécuté régulièrement,
   * ainsi que lorsque la limite est atteinte.
   */
  if (
    rateLimitStore.size >=
      MAX_RATE_LIMIT_ENTRIES ||
    rateLimitStore.size % 100 === 0
  ) {
    cleanExpiredRateLimitEntries(
      currentTime
    );
  }

  const currentEntry =
    rateLimitStore.get(identifier);

  if (
    !currentEntry ||
    currentEntry.expiresAt <=
      currentTime
  ) {
    /*
     * Empêche la Map de dépasser sa limite
     * lorsqu’aucune ancienne entrée n’est expirée.
     */
    if (
      !currentEntry &&
      rateLimitStore.size >=
        MAX_RATE_LIMIT_ENTRIES
    ) {
      return {
        limited: true,
        retryAfter: 60,
      };
    }

    rateLimitStore.set(identifier, {
      count: 1,
      expiresAt:
        currentTime +
        RATE_LIMIT_WINDOW,
    });

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
        remainingMilliseconds / 1_000
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

  rateLimitStore.set(identifier, {
    count: currentEntry.count + 1,
    expiresAt:
      currentEntry.expiresAt,
  });

  return {
    limited: false,
    retryAfter: 0,
  };
}

/*
 * Charge et contrôle l’adresse officielle
 * configurée pour le site.
 */
function getConfiguredSiteUrl():
  URL | null {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ?.trim();

  if (!configuredUrl) {
    return null;
  }

  try {
    const siteUrl =
      new URL(configuredUrl);

    const isProduction =
      process.env.NODE_ENV ===
      "production";

    const protocolIsAllowed =
      siteUrl.protocol === "https:" ||
      (!isProduction &&
        siteUrl.protocol === "http:");

    if (
      !protocolIsAllowed ||
      siteUrl.username.length > 0 ||
      siteUrl.password.length > 0
    ) {
      return null;
    }

    return siteUrl;
  } catch {
    return null;
  }
}

/*
 * Refuse les requêtes provenant
 * d’un autre site.
 */
function hasValidOrigin(
  request: NextRequest,
  siteUrl: URL
): boolean {
  const origin =
    request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return (
      new URL(origin).origin ===
      siteUrl.origin
    );
  } catch {
    return false;
  }
}

/*
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
    Number(contentLength);

  if (
    !Number.isFinite(
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

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const siteUrl =
    getConfiguredSiteUrl();

  if (!siteUrl) {
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
    getClientIp(request);

  const rateLimit =
    checkRateLimit(clientIp);

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
          rateLimit.retryAfter.toString(),
      }
    );
  }

  const contentType =
    request.headers.get(
      "content-type"
    ) ?? "";

  if (
    !contentType
      .toLowerCase()
      .startsWith(
        "application/json"
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

  if (requestIsTooLarge(request)) {
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

  if (rawBody.length === 0) {
    return jsonResponse(
      {
        success: false,
        error:
          "EMPTY_REQUEST_BODY",
      },
      400
    );
  }

  if (
    rawBody.length >
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
      JSON.parse(rawBody) as unknown;
  } catch {
    return jsonResponse(
      {
        success: false,
        error: "INVALID_JSON",
      },
      400
    );
  }

  /*
   * La validation vérifie notamment :
   * - la fréquence ;
   * - le montant ;
   * - la devise XOF, EUR ou USD ;
   * - les limites propres à la devise ;
   * - les informations du donateur ;
   * - le consentement.
   */
  const validation =
    validateDonationCheckout(input);

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

  const reference =
    generateDonationReference();

  const successUrl = new URL(
    "/don/succes",
    siteUrl
  );

  successUrl.searchParams.set(
    "reference",
    reference
  );

  const cancelUrl = new URL(
    "/don/annule",
    siteUrl
  );

  cancelUrl.searchParams.set(
    "reference",
    reference
  );

  try {
    /*
     * validation.data contient directement la devise
     * choisie : XOF, EUR ou USD.
     */
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
    /*
     * Aucun secret et aucun détail interne
     * ne sont renvoyés au navigateur.
     */
    if (
      error instanceof
      PaymentConfigurationError
    ) {
      console.error(
        "Payment configuration error:",
        error.message
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
        error.code
      );

      const safeStatus =
        error.statusCode >= 400 &&
        error.statusCode <= 499
          ? error.statusCode
          : 502;

      return jsonResponse(
        {
          success: false,
          error:
            error.statusCode >= 400 &&
            error.statusCode <= 499
              ? "PAYMENT_REQUEST_REJECTED"
              : "PAYMENT_SERVICE_UNAVAILABLE",
        },
        safeStatus
      );
    }

    console.error(
      "Unexpected payment initialization error:",
      error
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

/*
 * Cette route accepte uniquement POST.
 */
export function GET(): NextResponse {
  return jsonResponse(
    {
      success: false,
      error: "METHOD_NOT_ALLOWED",
    },
    405,
    {
      Allow: "POST",
    }
  );
}