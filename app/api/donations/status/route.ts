import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  hasRegisteredPaymentProvider,
  PaymentConfigurationError,
  PaymentProviderError,
  registerPaymentProvider,
  verifyPayment,
} from "@/lib/donation/payment-provider";

import {
  DonationPaymentStoreError,
  donationPaymentStore,
} from "@/lib/donation/payment-store";

import {
  monerooPaymentProvider,
} from "@/lib/donation/providers/moneroo-provider";

import type {
  DonationPaymentRecord,
  DonationPaymentStatus,
  PaymentVerificationResult,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * ROUTE DE VÉRIFICATION D’UN PAIEMENT
 * ============================================================================
 *
 * Cette route :
 *
 * - accepte uniquement une référence prestataire valide ;
 * - recherche d’abord le paiement dans PostgreSQL ;
 * - interroge directement le prestataire ;
 * - compare toutes les données critiques ;
 * - empêche les changements de montant ou de devise ;
 * - met à jour le statut interne ;
 * - ne considère jamais la redirection comme une preuve ;
 * - ne retourne aucune donnée privée du donateur.
 * ============================================================================
 */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const MAX_PROVIDER_REFERENCE_LENGTH =
  200;

const PROVIDER_REFERENCE_PATTERN =
  /^[A-Za-z0-9._:-]+$/;

/**
 * Enregistre l’adaptateur Moneroo une seule fois.
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
 * Retourne une réponse JSON non mise en cache.
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

        ...additionalHeaders,
      },
    }
  );
}

/**
 * Nettoie et valide une référence prestataire
 * provenant de l’URL.
 */
function normalizeProviderReference(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  if (
    value.length >
    MAX_PROVIDER_REFERENCE_LENGTH + 20
  ) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.length < 3 ||
    normalized.length >
      MAX_PROVIDER_REFERENCE_LENGTH ||
    !PROVIDER_REFERENCE_PATTERN.test(
      normalized
    )
  ) {
    return null;
  }

  return normalized;
}

/**
 * Vérifie que les informations retournées
 * correspondent au paiement enregistré.
 */
function assertPaymentMatches(
  storedPayment:
    DonationPaymentRecord,
  verifiedPayment:
    PaymentVerificationResult
): void {
  if (
    verifiedPayment.reference !==
    storedPayment.reference
  ) {
    throw new PaymentProviderError(
      "PAYMENT_REFERENCE_MISMATCH",
      "La référence interne du paiement ne correspond pas.",
      409
    );
  }

  if (
    verifiedPayment.provider !==
    storedPayment.provider
  ) {
    throw new PaymentProviderError(
      "PAYMENT_PROVIDER_MISMATCH",
      "Le prestataire du paiement ne correspond pas.",
      409
    );
  }

  if (
    verifiedPayment
      .providerReference !==
    storedPayment
      .providerReference
  ) {
    throw new PaymentProviderError(
      "PROVIDER_REFERENCE_MISMATCH",
      "La référence du prestataire ne correspond pas.",
      409
    );
  }

  if (
    verifiedPayment.amount !==
    storedPayment.amount
  ) {
    throw new PaymentProviderError(
      "PAYMENT_AMOUNT_MISMATCH",
      "Le montant vérifié ne correspond pas au montant attendu.",
      409
    );
  }

  if (
    verifiedPayment.currency !==
    storedPayment.currency
  ) {
    throw new PaymentProviderError(
      "PAYMENT_CURRENCY_MISMATCH",
      "La devise vérifiée ne correspond pas à la devise attendue.",
      409
    );
  }
}

/**
 * Empêche qu’une réponse temporaire du prestataire
 * dégrade un paiement déjà confirmé ou définitivement
 * clôturé.
 */
function resolveStatusUpdate(
  currentStatus:
    DonationPaymentStatus,
  verifiedStatus:
    DonationPaymentStatus
): DonationPaymentStatus {
  if (
    currentStatus === "paid"
  ) {
    return verifiedStatus ===
      "refunded"
      ? "refunded"
      : "paid";
  }

  if (
    currentStatus ===
      "refunded" ||
    currentStatus ===
      "failed" ||
    currentStatus ===
      "cancelled" ||
    currentStatus ===
      "expired"
  ) {
    return currentStatus;
  }

  return verifiedStatus;
}

/**
 * Vérifie le paiement auprès du prestataire.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const providerReference =
    normalizeProviderReference(
      request.nextUrl
        .searchParams
        .get(
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
    /**
     * Le paiement doit exister dans la base
     * avant tout appel au prestataire.
     */
    const storedPayment =
      await donationPaymentStore
        .findByProviderReference(
          providerReference
        );

    if (!storedPayment) {
      return jsonResponse(
        {
          success: false,
          error:
            "PAYMENT_NOT_FOUND",
        },
        404
      );
    }

    /**
     * Le statut réel est récupéré directement
     * auprès du prestataire.
     */
    const verifiedPayment =
      await verifyPayment(
        providerReference
      );

    /**
     * Toutes les données critiques doivent
     * correspondre à l’enregistrement interne.
     */
    assertPaymentMatches(
      storedPayment,
      verifiedPayment
    );

    const nextStatus =
      resolveStatusUpdate(
        storedPayment.status,
        verifiedPayment.status
      );

    /**
     * La date paidAt est créée par le stockage
     * uniquement lors du premier passage à paid.
     */
    const updatedPayment =
      await donationPaymentStore
        .updateByReference(
          storedPayment.reference,
          {
            status:
              nextStatus,
          }
        );

    return jsonResponse(
      {
        success: true,

        payment: {
          reference:
            updatedPayment.reference,

          providerReference:
            updatedPayment
              .providerReference,

          amount:
            updatedPayment.amount,

          currency:
            updatedPayment.currency,

          status:
            updatedPayment.status,

          paidAt:
            updatedPayment.paidAt
              ?.toISOString() ??
            null,
        },
      },
      200
    );
  } catch (error: unknown) {
    if (
      error instanceof
      PaymentConfigurationError
    ) {
      console.error(
        "Payment configuration error:",
        {
          code:
            error.code,
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
        "Payment verification error:",
        {
          code:
            error.code,
        }
      );

      const status =
        error.statusCode >= 400 &&
        error.statusCode <= 599
          ? error.statusCode
          : 502;

      return jsonResponse(
        {
          success: false,
          error:
            "PAYMENT_VERIFICATION_FAILED",
        },
        status
      );
    }

    if (
      error instanceof
      DonationPaymentStoreError
    ) {
      console.error(
        "Payment storage error:",
        {
          code:
            error.code,
        }
      );

      const status =
        error.statusCode >= 400 &&
        error.statusCode <= 599
          ? error.statusCode
          : 500;

      return jsonResponse(
        {
          success: false,
          error:
            error.code ===
            "PAYMENT_NOT_FOUND"
              ? "PAYMENT_NOT_FOUND"
              : "PAYMENT_STORAGE_ERROR",
        },
        status
      );
    }

    console.error(
      "Unexpected payment verification error:",
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
          "PAYMENT_VERIFICATION_FAILED",
      },
      500
    );
  }
}

/**
 * Cette route n’accepte pas POST.
 */
export function POST():
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
        "GET",
    }
  );
}