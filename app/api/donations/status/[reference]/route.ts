import "server-only";

import {
  NextResponse,
} from "next/server";

import {
  DonationPaymentStoreError,
  donationPaymentStore,
} from "@/lib/donation/payment-store";

import {
  normalizeDonationReference,
} from "@/lib/donation/payment-reference";

import type {
  DonationPaymentStatusResponse,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * CONSULTATION PUBLIQUE DU STATUT D’UN DON
 * ============================================================================
 *
 * Route :
 *
 * GET /api/donations/status/[reference]
 *
 * Cette route :
 *
 * - valide strictement la référence Young Caring ;
 * - consulte uniquement le stockage durable PostgreSQL ;
 * - retourne uniquement les informations publiques du paiement ;
 * - ne retourne aucune information personnelle du donateur ;
 * - ne fait jamais confiance à un statut provenant du navigateur ;
 * - ne confirme jamais elle-même un paiement ;
 * - empêche la mise en cache des informations de paiement.
 *
 * Le véritable statut du paiement est mis à jour côté serveur :
 *
 * - par le webhook Moneroo vérifié ;
 * - ou par une vérification directe auprès de Moneroo.
 *
 * ============================================================================
 */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/**
 * Contexte fourni par Next.js 16
 * pour une route dynamique.
 */
type DonationStatusRouteContext =
  Readonly<{
    params: Promise<
      Readonly<{
        reference: string;
      }>
    >;
  }>;

/**
 * Crée une réponse JSON sans mise en cache.
 */
function jsonResponse(
  body: DonationPaymentStatusResponse,
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
          "no-store, no-cache, max-age=0, must-revalidate",

        Pragma:
          "no-cache",

        Expires:
          "0",

        "Content-Type":
          "application/json; charset=utf-8",

        "X-Content-Type-Options":
          "nosniff",

        "Referrer-Policy":
          "no-referrer",

        ...additionalHeaders,
      },
    }
  );
}

/**
 * Retourne une réponse 405 pour les méthodes
 * non autorisées sur cette route.
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
        "GET, HEAD",
    }
  );
}

/**
 * Retourne le statut public d’un paiement.
 *
 * Aucune donnée privée du donateur n’est exposée.
 */
export async function GET(
  _request: Request,
  context:
    DonationStatusRouteContext
): Promise<NextResponse> {
  try {
    const parameters =
      await context.params;

    const reference =
      normalizeDonationReference(
        parameters.reference
      );

    if (!reference) {
      return jsonResponse(
        {
          success: false,
          error:
            "INVALID_DONATION_REFERENCE",
        },
        400
      );
    }

    const payment =
      await donationPaymentStore
        .findByReference(
          reference
        );

    if (!payment) {
      return jsonResponse(
        {
          success: false,
          error:
            "DONATION_PAYMENT_NOT_FOUND",
        },
        404
      );
    }

    /**
     * Seules les informations nécessaires
     * à l’affichage public sont retournées.
     *
     * Ne jamais ajouter ici :
     *
     * - donorFirstName ;
     * - donorLastName ;
     * - donorEmail ;
     * - donorPhone ;
     * - donorCountry ;
     * - providerReference.
     */
    return jsonResponse(
      {
        success: true,
        reference:
          payment.reference,
        status:
          payment.status,
        amount:
          payment.amount,
        currency:
          payment.currency,
      },
      200
    );
  } catch (error: unknown) {
    if (
      error instanceof
      DonationPaymentStoreError
    ) {
      console.error(
        "Donation status storage error:",
        {
          code:
            error.code,
        }
      );

      return jsonResponse(
        {
          success: false,
          error:
            "DONATION_STATUS_UNAVAILABLE",
        },
        error.statusCode >= 500 &&
          error.statusCode <= 599
          ? error.statusCode
          : 500
      );
    }

    console.error(
      "Unexpected donation status error:",
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
          "DONATION_STATUS_UNAVAILABLE",
      },
      500
    );
  }
}

/**
 * HEAD permet de contrôler l’existence de la route
 * sans retourner le corps JSON du paiement.
 */
export async function HEAD(
  _request: Request,
  context:
    DonationStatusRouteContext
): Promise<NextResponse> {
  try {
    const parameters =
      await context.params;

    const reference =
      normalizeDonationReference(
        parameters.reference
      );

    if (!reference) {
      return new NextResponse(
        null,
        {
          status: 400,

          headers: {
            "Cache-Control":
              "no-store, no-cache, max-age=0, must-revalidate",

            Pragma:
              "no-cache",

            Expires:
              "0",

            "X-Content-Type-Options":
              "nosniff",

            "Referrer-Policy":
              "no-referrer",
          },
        }
      );
    }

    const payment =
      await donationPaymentStore
        .findByReference(
          reference
        );

    return new NextResponse(
      null,
      {
        status:
          payment
            ? 200
            : 404,

        headers: {
          "Cache-Control":
            "no-store, no-cache, max-age=0, must-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",

          "X-Content-Type-Options":
            "nosniff",

          "Referrer-Policy":
            "no-referrer",
        },
      }
    );
  } catch (error: unknown) {
    console.error(
      "Donation status HEAD error:",
      {
        code:
          error instanceof
            DonationPaymentStoreError
            ? error.code
            : "UNEXPECTED_ERROR",
      }
    );

    return new NextResponse(
      null,
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store, no-cache, max-age=0, must-revalidate",

          Pragma:
            "no-cache",

          Expires:
            "0",

          "X-Content-Type-Options":
            "nosniff",

          "Referrer-Policy":
            "no-referrer",
        },
      }
    );
  }
}

/**
 * Méthodes explicitement interdites.
 */
export function POST():
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