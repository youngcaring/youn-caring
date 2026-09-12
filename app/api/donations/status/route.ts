import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PaymentConfigurationError,
  PaymentProviderError,
  verifyPayment,
} from "@/lib/donation/payment-provider";

const MAX_PROVIDER_REFERENCE_LENGTH =
  200;

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

function normalizeProviderReference(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.length < 3 ||
    normalized.length >
      MAX_PROVIDER_REFERENCE_LENGTH ||
    !/^[A-Za-z0-9._:-]+$/.test(
      normalized
    )
  ) {
    return null;
  }

  return normalized;
}

export async function GET(
  request: NextRequest
) {
  const providerReference =
    normalizeProviderReference(
      request.nextUrl.searchParams.get(
        "providerReference"
      )
    );

  if (!providerReference) {
    return jsonResponse(
      {
        success: false,
        error:
          "INVALID_PROVIDER_REFERENCE",
      },
      400
    );
  }

  try {
    /*
     * Le statut est demandé directement
     * au prestataire de paiement.
     */
    const payment =
      await verifyPayment(
        providerReference
      );

    return jsonResponse(
      {
        success: true,

        payment: {
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
        },
      },
      200
    );
  } catch (error) {
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
        "Payment verification error:",
        error.code
      );

      return jsonResponse(
        {
          success: false,
          error:
            "PAYMENT_VERIFICATION_FAILED",
        },
        error.statusCode >= 400 &&
          error.statusCode <= 599
          ? error.statusCode
          : 502
      );
    }

    console.error(
      "Unexpected payment verification error:",
      error
    );

    return jsonResponse(
      {
        success: false,
        error:
          "PAYMENT_VERIFICATION_FAILED",
      },
      500
    );
  }
}

export function POST() {
  return jsonResponse(
    {
      success: false,
      error: "METHOD_NOT_ALLOWED",
    },
    405
  );
}