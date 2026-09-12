import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PaymentConfigurationError,
  verifyPaymentWebhook,
} from "@/lib/donation/payment-provider";

const MAX_WEBHOOK_SIZE =
  1_000_000;

function jsonResponse(
  body: Record<string, unknown>,
  status: number
) {
  return NextResponse.json(body, {
    status,

    headers: {
      "Cache-Control":
        "no-store, max-age=0",
      "X-Content-Type-Options":
        "nosniff",
    },
  });
}

function getSignatureHeaderName():
  string {
  const configuredHeader =
    process.env
      .PAYMENT_WEBHOOK_SIGNATURE_HEADER
      ?.trim()
      .toLowerCase();

  if (
    configuredHeader &&
    /^[a-z0-9-]+$/.test(
      configuredHeader
    )
  ) {
    return configuredHeader;
  }

  return "x-payment-signature";
}

export async function POST(
  request: NextRequest
) {
  const declaredLength =
    Number(
      request.headers.get(
        "content-length"
      ) ?? "0"
    );

  if (
    Number.isFinite(
      declaredLength
    ) &&
    declaredLength >
      MAX_WEBHOOK_SIZE
  ) {
    return jsonResponse(
      {
        received: false,
        error:
          "WEBHOOK_TOO_LARGE",
      },
      413
    );
  }

  const signatureHeaderName =
    getSignatureHeaderName();

  const signature =
    request.headers
      .get(signatureHeaderName)
      ?.trim();

  if (
    !signature ||
    signature.length > 1_000
  ) {
    return jsonResponse(
      {
        received: false,
        error:
          "MISSING_WEBHOOK_SIGNATURE",
      },
      401
    );
  }

  let rawBody: string;

  try {
    /*
     * La signature doit être vérifiée
     * sur le contenu brut non transformé.
     */
    rawBody = await request.text();
  } catch {
    return jsonResponse(
      {
        received: false,
        error:
          "INVALID_WEBHOOK_BODY",
      },
      400
    );
  }

  if (
    rawBody.length === 0 ||
    rawBody.length >
      MAX_WEBHOOK_SIZE
  ) {
    return jsonResponse(
      {
        received: false,
        error:
          rawBody.length === 0
            ? "EMPTY_WEBHOOK_BODY"
            : "WEBHOOK_TOO_LARGE",
      },
      rawBody.length === 0
        ? 400
        : 413
    );
  }

  try {
    const validSignature =
      await verifyPaymentWebhook(
        rawBody,
        signature
      );

    if (!validSignature) {
      return jsonResponse(
        {
          received: false,
          error:
            "INVALID_WEBHOOK_SIGNATURE",
        },
        401
      );
    }

    /*
     * La signature est valide.
     *
     * Le futur adaptateur du prestataire
     * devra ensuite interpréter l’événement
     * et enregistrer son statut dans la base.
     *
     * Aucune donnée du webhook n’est renvoyée.
     */
    return jsonResponse(
      {
        received: true,
      },
      200
    );
  } catch (error) {
    if (
      error instanceof
      PaymentConfigurationError
    ) {
      console.error(
        "Webhook configuration error:",
        error.message
      );

      return jsonResponse(
        {
          received: false,
          error:
            "PAYMENT_SERVICE_NOT_CONFIGURED",
        },
        503
      );
    }

    console.error(
      "Unexpected webhook error:",
      error
    );

    return jsonResponse(
      {
        received: false,
        error:
          "WEBHOOK_PROCESSING_FAILED",
      },
      500
    );
  }
}

export function GET() {
  return jsonResponse(
    {
      received: false,
      error: "METHOD_NOT_ALLOWED",
    },
    405
  );
}