import {
  createHash,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";
import type {
  NextRequest,
} from "next/server";

import {
  ContactEmailConfigurationError,
  ContactEmailDeliveryError,
  sendContactEmails,
} from "@/lib/contact/email";
import {
  generateContactReference,
} from "@/lib/contact/reference";
import {
  validateContactMessage,
} from "@/lib/contact/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_SIZE = 32_000;

const RATE_LIMIT_WINDOW =
  10 * 60 * 1_000;

const RATE_LIMIT_MAX_REQUESTS = 5;

const MAX_RATE_LIMIT_ENTRIES = 10_000;

type RateLimitEntry = Readonly<{
  count: number;
  expiresAt: number;
}>;

type RateLimitResult = Readonly<{
  limited: boolean;
  remaining: number;
  retryAfter: number;
}>;

const rateLimitStore = new Map<
  string,
  RateLimitEntry
>();

function jsonResponse(
  body: Readonly<
    Record<string, unknown>
  >,
  status: number,
  additionalHeaders?: HeadersInit
): NextResponse {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control":
        "no-store, max-age=0",

      Pragma: "no-cache",

      "X-Content-Type-Options":
        "nosniff",

      "Referrer-Policy":
        "strict-origin-when-cross-origin",

      ...additionalHeaders,
    },
  });
}

/*
 * Détermine l’adresse officielle autorisée.
 *
 * NEXT_PUBLIC_SITE_URL est obligatoire
 * en production.
 */
function getAllowedOrigin(
  request: NextRequest
): string | null {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ?.trim();

  if (configuredUrl) {
    try {
      const siteUrl =
        new URL(configuredUrl);

      const protocolIsValid =
        siteUrl.protocol === "https:" ||
        (
          process.env.NODE_ENV !==
            "production" &&
          siteUrl.protocol === "http:"
        );

      if (!protocolIsValid) {
        return null;
      }

      return siteUrl.origin;
    } catch {
      return null;
    }
  }

  if (
    process.env.NODE_ENV !== "production"
  ) {
    return request.nextUrl.origin;
  }

  return null;
}

/*
 * Empêche les soumissions provenant
 * d’un autre site.
 */
function hasValidRequestOrigin(
  request: NextRequest,
  allowedOrigin: string
): boolean {
  const origin =
    request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    if (
      new URL(origin).origin !==
      allowedOrigin
    ) {
      return false;
    }
  } catch {
    return false;
  }

  const fetchSite =
    request.headers.get(
      "sec-fetch-site"
    );

  if (
    fetchSite &&
    fetchSite !== "same-origin" &&
    fetchSite !== "same-site"
  ) {
    return false;
  }

  return true;
}

/*
 * Récupère l’adresse réseau communiquée
 * par la plateforme d’hébergement.
 */
function getClientAddress(
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
      return firstAddress.slice(
        0,
        100
      );
    }
  }

  const realIp =
    request.headers
      .get("x-real-ip")
      ?.trim();

  if (realIp) {
    return realIp.slice(0, 100);
  }

  const userAgent =
    request.headers
      .get("user-agent")
      ?.slice(0, 150) ??
    "unknown-agent";

  return `unknown:${userAgent}`;
}

/*
 * L’adresse IP brute n’est pas conservée
 * dans la Map temporaire.
 */
function createRateLimitIdentifier(
  request: NextRequest
): string {
  return createHash("sha256")
    .update(
      getClientAddress(request)
    )
    .digest("hex");
}

function cleanRateLimitStore(
  currentTime: number
): void {
  for (
    const [
      identifier,
      entry,
    ] of rateLimitStore.entries()
  ) {
    if (
      entry.expiresAt <= currentTime
    ) {
      rateLimitStore.delete(
        identifier
      );
    }
  }

  if (
    rateLimitStore.size <=
    MAX_RATE_LIMIT_ENTRIES
  ) {
    return;
  }

  const excess =
    rateLimitStore.size -
    MAX_RATE_LIMIT_ENTRIES;

  let removed = 0;

  for (
    const identifier of
    rateLimitStore.keys()
  ) {
    rateLimitStore.delete(
      identifier
    );

    removed += 1;

    if (removed >= excess) {
      break;
    }
  }
}

function checkRateLimit(
  identifier: string
): RateLimitResult {
  const currentTime = Date.now();

  cleanRateLimitStore(
    currentTime
  );

  const currentEntry =
    rateLimitStore.get(identifier);

  if (
    !currentEntry ||
    currentEntry.expiresAt <=
      currentTime
  ) {
    rateLimitStore.set(identifier, {
      count: 1,

      expiresAt:
        currentTime +
        RATE_LIMIT_WINDOW,
    });

    return {
      limited: false,

      remaining:
        RATE_LIMIT_MAX_REQUESTS - 1,

      retryAfter: Math.ceil(
        RATE_LIMIT_WINDOW / 1_000
      ),
    };
  }

  const retryAfter = Math.max(
    1,
    Math.ceil(
      (
        currentEntry.expiresAt -
        currentTime
      ) / 1_000
    )
  );

  if (
    currentEntry.count >=
    RATE_LIMIT_MAX_REQUESTS
  ) {
    return {
      limited: true,
      remaining: 0,
      retryAfter,
    };
  }

  const nextCount =
    currentEntry.count + 1;

  rateLimitStore.set(identifier, {
    count: nextCount,
    expiresAt:
      currentEntry.expiresAt,
  });

  return {
    limited: false,

    remaining: Math.max(
      0,
      RATE_LIMIT_MAX_REQUESTS -
        nextCount
    ),

    retryAfter,
  };
}

function getRateLimitHeaders(
  rateLimit: RateLimitResult
): HeadersInit {
  return {
    "X-RateLimit-Limit": String(
      RATE_LIMIT_MAX_REQUESTS
    ),

    "X-RateLimit-Remaining":
      String(rateLimit.remaining),
  };
}

function hasJsonContentType(
  request: NextRequest
): boolean {
  const contentType =
    request.headers
      .get("content-type")
      ?.toLowerCase() ?? "";

  return contentType.startsWith(
    "application/json"
  );
}

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
    )
  ) {
    return false;
  }

  return (
    declaredLength >
    MAX_REQUEST_SIZE
  );
}

function getRequestedLanguage(
  input: unknown
): "fr" | "en" {
  if (
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    "language" in input &&
    input.language === "en"
  ) {
    return "en";
  }

  return "fr";
}

/*
 * Le champ website est invisible.
 * Un visiteur normal doit le laisser vide.
 */
function isHoneypotFilled(
  input: unknown
): boolean {
  if (
    typeof input !== "object" ||
    input === null ||
    Array.isArray(input) ||
    !("website" in input)
  ) {
    return false;
  }

  return (
    typeof input.website === "string" &&
    input.website.trim().length > 0
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const allowedOrigin =
    getAllowedOrigin(request);

  if (!allowedOrigin) {
    console.error(
      "Contact configuration error: invalid NEXT_PUBLIC_SITE_URL."
    );

    return jsonResponse(
      {
        success: false,

        error:
          "CONTACT_SERVICE_NOT_CONFIGURED",
      },
      503
    );
  }

  if (
    !hasValidRequestOrigin(
      request,
      allowedOrigin
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

  if (!hasJsonContentType(request)) {
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

  const identifier =
    createRateLimitIdentifier(
      request
    );

  const rateLimit =
    checkRateLimit(identifier);

  if (rateLimit.limited) {
    return jsonResponse(
      {
        success: false,

        error:
          "TOO_MANY_CONTACT_REQUESTS",

        message:
          "Trop de tentatives. Veuillez patienter avant de réessayer.",
      },
      429,
      {
        ...getRateLimitHeaders(
          rateLimit
        ),

        "Retry-After": String(
          rateLimit.retryAfter
        ),
      }
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
      400,
      getRateLimitHeaders(
        rateLimit
      )
    );
  }

  if (rawBody.length === 0) {
    return jsonResponse(
      {
        success: false,

        error:
          "EMPTY_REQUEST_BODY",
      },
      400,
      getRateLimitHeaders(
        rateLimit
      )
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
      413,
      getRateLimitHeaders(
        rateLimit
      )
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
      400,
      getRateLimitHeaders(
        rateLimit
      )
    );
  }

  /*
   * Le serveur simule une réussite lorsqu’un
   * robot remplit le champ invisible.
   *
   * Aucun email n’est envoyé.
   */
  if (isHoneypotFilled(input)) {
    return jsonResponse(
      {
        success: true,

        reference:
          generateContactReference(),

        acknowledgementEmailSent:
          false,
      },
      200,
      getRateLimitHeaders(
        rateLimit
      )
    );
  }

  const language =
    getRequestedLanguage(input);

  const validation =
    validateContactMessage(input);

  if (!validation.success) {
    return jsonResponse(
      {
        success: false,

        error:
          "CONTACT_VALIDATION_FAILED",

        fieldErrors:
          validation.errors,
      },
      400,
      getRateLimitHeaders(
        rateLimit
      )
    );
  }

  const reference =
    generateContactReference();

  try {
    const emailResult =
      await sendContactEmails({
        reference,

        contact:
          validation.data,

        receivedAt:
          new Date(),
      });

    return jsonResponse(
      {
        success: true,

        reference,

        acknowledgementEmailSent:
          emailResult
            .acknowledgementEmailSent,

        message:
          language === "en"
            ? "Your message has been received."
            : "Votre message a bien été reçu.",
      },
      200,
      getRateLimitHeaders(
        rateLimit
      )
    );
  } catch (error: unknown) {
    if (
      error instanceof
      ContactEmailConfigurationError
    ) {
      console.error(
        "Contact email configuration error:",
        error.message
      );

      return jsonResponse(
        {
          success: false,

          error:
            "CONTACT_SERVICE_NOT_CONFIGURED",

          message:
            language === "en"
              ? "The contact service is temporarily unavailable."
              : "Le service de contact est temporairement indisponible.",
        },
        503,
        getRateLimitHeaders(
          rateLimit
        )
      );
    }

    if (
      error instanceof
      ContactEmailDeliveryError
    ) {
      console.error(
        "Contact email delivery error:",
        error.code
      );

      return jsonResponse(
        {
          success: false,

          error:
            "CONTACT_MESSAGE_DELIVERY_FAILED",

          message:
            language === "en"
              ? "Your message could not be sent. Please try again later."
              : "Votre message n’a pas pu être envoyé. Veuillez réessayer plus tard.",
        },
        502,
        getRateLimitHeaders(
          rateLimit
        )
      );
    }

    console.error(
      "Unexpected contact submission error:",
      error instanceof Error
        ? error.name
        : "UNKNOWN_ERROR"
    );

    return jsonResponse(
      {
        success: false,

        error:
          "CONTACT_SUBMISSION_FAILED",

        message:
          language === "en"
            ? "An unexpected error occurred. Please try again later."
            : "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
      },
      500,
      getRateLimitHeaders(
        rateLimit
      )
    );
  }
}

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
      Allow: "POST",
    }
  );
}

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