import "server-only";

import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Heart,
  Home,
  Info,
  RotateCcw,
} from "lucide-react";

import {
  formatDonationAmount,
} from "@/data/donation";

import {
  DonationPaymentStoreError,
  donationPaymentStore,
} from "@/lib/donation/payment-store";

import {
  hasRegisteredPaymentProvider,
  PaymentConfigurationError,
  PaymentProviderError,
  registerPaymentProvider,
  verifyPayment,
} from "@/lib/donation/payment-provider";

import {
  normalizeDonationReference,
} from "@/lib/donation/payment-reference";

import {
  monerooPaymentProvider,
} from "@/lib/donation/providers/moneroo-provider";

import type {
  DonationCurrency,
  DonationPaymentRecord,
  DonationPaymentStatus,
  PaymentVerificationResult,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * PAGE DE RETOUR APRÈS PAIEMENT
 * ============================================================================
 *
 * Cette page :
 *
 * - accepte uniquement une référence interne Young Caring ;
 * - retrouve le paiement attendu dans PostgreSQL ;
 * - n’utilise jamais une référence Moneroo reçue du navigateur ;
 * - vérifie la transaction directement auprès de Moneroo ;
 * - compare le prestataire, les références, le montant et la devise ;
 * - met à jour le stockage durable après vérification ;
 * - ne confirme jamais un don grâce à une simple redirection ;
 * - ne retourne aucune information personnelle du donateur.
 *
 * Le reçu PDF et l’e-mail de confirmation doivent être déclenchés
 * séparément par un service idempotent après le statut paid.
 * ============================================================================
 */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export const metadata:
  Metadata = {
  title:
    "Vérification du don",

  description:
    "Consultation du statut de votre contribution à Young Caring.",

  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

/**
 * L’adaptateur doit être enregistré dans
 * le processus exécutant cette page.
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

type SearchParameter =
  | string
  | string[]
  | undefined;

type DonationSuccessPageProps =
  Readonly<{
    searchParams: Promise<
      Record<
        string,
        SearchParameter
      >
    >;
  }>;

type PublicVerificationStatus =
  | "paid"
  | "pending"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded"
  | "invalid";

type VerificationState =
  | Readonly<{
      status: "paid";
      reference: string;
      amount: number;
      currency:
        DonationCurrency;
    }>
  | Readonly<{
      status: Exclude<
        PublicVerificationStatus,
        "paid" | "invalid"
      >;
      reference: string;
      amount: number;
      currency:
        DonationCurrency;
    }>
  | Readonly<{
      status: "invalid";
      reference: null;
      amount: null;
      currency: null;
    }>;

/**
 * Accepte uniquement un paramètre unique.
 *
 * Plusieurs occurrences du même paramètre
 * rendent la demande ambiguë.
 */
function getSingleSearchParameter(
  value: SearchParameter
): string | null {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    Array.isArray(value) &&
    value.length === 1 &&
    typeof value[0] === "string"
  ) {
    return value[0];
  }

  return null;
}

/**
 * Transforme un statut interne en statut
 * utilisable par la page publique.
 */
function normalizePublicStatus(
  status:
    DonationPaymentStatus
): Exclude<
  PublicVerificationStatus,
  "invalid"
> {
  switch (status) {
    case "paid":
      return "paid";

    case "failed":
      return "failed";

    case "cancelled":
      return "cancelled";

    case "expired":
      return "expired";

    case "refunded":
      return "refunded";

    case "pending":
    case "processing":
    default:
      return "pending";
  }
}

/**
 * Transforme un paiement enregistré
 * en résultat public.
 */
function createStateFromPayment(
  payment:
    DonationPaymentRecord
): VerificationState {
  const status =
    normalizePublicStatus(
      payment.status
    );

  return {
    status,
    reference:
      payment.reference,
    amount:
      payment.amount,
    currency:
      payment.currency,
  };
}

/**
 * Vérifie que le résultat retourné par Moneroo
 * appartient exactement au paiement enregistré.
 */
function paymentMatchesStoredRecord(
  storedPayment:
    DonationPaymentRecord,
  verifiedPayment:
    PaymentVerificationResult
): boolean {
  return (
    verifiedPayment.provider ===
      storedPayment.provider &&
    verifiedPayment.reference ===
      storedPayment.reference &&
    verifiedPayment
      .providerReference !==
      null &&
    verifiedPayment
      .providerReference ===
      storedPayment
        .providerReference &&
    verifiedPayment.amount ===
      storedPayment.amount &&
    verifiedPayment.currency ===
      storedPayment.currency
  );
}

/**
 * Empêche la dégradation d’un statut déjà finalisé.
 */
function resolveNextStatus(
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
 * Vérifie le paiement en utilisant uniquement
 * les données déjà enregistrées côté serveur.
 */
async function verifyDonation(
  internalReference:
    string | null
): Promise<VerificationState> {
  const reference =
    normalizeDonationReference(
      internalReference
    );

  if (!reference) {
    return {
      status: "invalid",
      reference: null,
      amount: null,
      currency: null,
    };
  }

  try {
    const storedPayment =
      await donationPaymentStore
        .findByReference(
          reference
        );

    if (!storedPayment) {
      return {
        status: "invalid",
        reference: null,
        amount: null,
        currency: null,
      };
    }

    /**
     * Un paiement déjà confirmé peut être affiché
     * directement depuis le stockage durable.
     *
     * Sa confirmation a déjà été obtenue côté serveur.
     */
    if (
      storedPayment.status ===
        "paid" ||
      storedPayment.status ===
        "refunded"
    ) {
      return createStateFromPayment(
        storedPayment
      );
    }

    /**
     * Sans référence prestataire enregistrée,
     * la vérification externe n’est pas possible.
     */
    if (
      !storedPayment
        .providerReference
    ) {
      return createStateFromPayment(
        storedPayment
      );
    }

    let verifiedPayment:
      PaymentVerificationResult;

    try {
      verifiedPayment =
        await verifyPayment(
          storedPayment
            .providerReference
        );
    } catch (error: unknown) {
      if (
        error instanceof
          PaymentConfigurationError ||
        error instanceof
          PaymentProviderError
      ) {
        console.error(
          "Donation verification unavailable:",
          {
            code:
              error.code,
          }
        );
      } else {
        console.error(
          "Unexpected donation provider verification error:",
          {
            name:
              error instanceof Error
                ? error.name
                : "UnknownError",
          }
        );
      }

      /**
       * En cas d’indisponibilité de Moneroo,
       * le statut connu en base reste la référence.
       */
      return createStateFromPayment(
        storedPayment
      );
    }

    if (
      !paymentMatchesStoredRecord(
        storedPayment,
        verifiedPayment
      )
    ) {
      console.error(
        "Donation verification mismatch:",
        {
          reference:
            storedPayment.reference,
        }
      );

      return createStateFromPayment(
        storedPayment
      );
    }

    const nextStatus =
      resolveNextStatus(
        storedPayment.status,
        verifiedPayment.status
      );

    if (
      nextStatus ===
      storedPayment.status
    ) {
      return createStateFromPayment(
        storedPayment
      );
    }

    const updatedPayment =
      await donationPaymentStore
        .updateByReference(
          storedPayment.reference,
          {
            status:
              nextStatus,
          }
        );

    return createStateFromPayment(
      updatedPayment
    );
  } catch (error: unknown) {
    if (
      error instanceof
      DonationPaymentStoreError
    ) {
      console.error(
        "Donation storage verification error:",
        {
          code:
            error.code,
        }
      );
    } else {
      console.error(
        "Unexpected donation verification error:",
        {
          name:
            error instanceof Error
              ? error.name
              : "UnknownError",
        }
      );
    }

    /**
     * Une erreur technique ne doit jamais
     * produire une fausse confirmation.
     */
    return {
      status: "pending",
      reference,
      amount: 0,
      currency: "XOF",
    };
  }
}

/**
 * Contenu public correspondant à chaque statut.
 */
function getStatusContent(
  status:
    PublicVerificationStatus
) {
  switch (status) {
    case "paid":
      return {
        title:
          "Votre don est confirmé",

        description:
          "Merci pour votre générosité. Votre contribution a été confirmée après vérification du paiement.",

        detail:
          "Paiement confirmé",
      };

    case "failed":
      return {
        title:
          "Le paiement a échoué",

        description:
          "Le prestataire n’a pas confirmé le paiement. Aucun don n’a été enregistré comme payé.",

        detail:
          "Paiement échoué",
      };

    case "cancelled":
      return {
        title:
          "Paiement annulé",

        description:
          "L’opération a été annulée avant sa confirmation. Vous pouvez recommencer lorsque vous le souhaitez.",

        detail:
          "Paiement annulé",
      };

    case "expired":
      return {
        title:
          "Session expirée",

        description:
          "La session de paiement a expiré avant sa confirmation. Vous pouvez créer une nouvelle contribution.",

        detail:
          "Session expirée",
      };

    case "refunded":
      return {
        title:
          "Paiement remboursé",

        description:
          "Cette transaction a été marquée comme remboursée après sa confirmation initiale.",

        detail:
          "Paiement remboursé",
      };

    case "invalid":
      return {
        title:
          "Référence invalide",

        description:
          "Cette adresse ne contient pas une référence de don valide. Aucun paiement ne peut être confirmé depuis cette page.",

        detail:
          null,
      };

    case "pending":
    default:
      return {
        title:
          "Vérification en cours",

        description:
          "Votre retour depuis la page de paiement a bien été reçu. La contribution sera confirmée uniquement après vérification côté serveur.",

        detail:
          "Confirmation en attente",
      };
  }
}

export default async function DonationSuccessPage({
  searchParams,
}: DonationSuccessPageProps) {
  const parameters =
    await searchParams;

  const internalReference =
    getSingleSearchParameter(
      parameters.reference
    );

  /**
   * providerReference venant de l’URL est
   * volontairement ignorée.
   */
  const verification =
    await verifyDonation(
      internalReference
    );

  const status =
    verification.status;

  const confirmed =
    status === "paid";

  const invalid =
    status === "invalid";

  const pending =
    status === "pending";

  const content =
    getStatusContent(
      status
    );

  const formattedAmount =
    !invalid &&
    verification.amount > 0
      ? formatDonationAmount(
          verification.amount,
          "fr",
          verification.currency
        )
      : null;

  const statusColorClass =
    confirmed
      ? "bg-[#e7f8ee] text-[#167340]"
      : invalid ||
          status === "failed"
        ? "bg-red-50 text-red-700"
        : status === "refunded"
          ? "bg-[#eef0ff] text-[#4f46a5]"
          : "bg-[#fff4e9] text-[#d85c12]";

  return (
    <section
      aria-labelledby="donation-result-title"
      className={[
        "site-section",
        "min-h-[calc(100vh-180px)]",
        "bg-[#f7f9f9]",
      ].join(" ")}
    >
      <div className="site-container">
        <div
          className={[
            "relative mx-auto",
            "max-w-2xl overflow-hidden",
            "rounded-[30px] border",
            "border-[#e0e8e9]",
            "bg-white px-6 py-10",
            "text-center",
            "shadow-[0_20px_55px_rgba(7,31,33,0.10)]",
            "sm:px-10 sm:py-14",
          ].join(" ")}
        >
          <div
            aria-hidden="true"
            className={[
              "pointer-events-none",
              "absolute -right-20 -top-20",
              "h-48 w-48 rounded-full",
              confirmed
                ? "bg-green-500/[0.07]"
                : invalid ||
                    status === "failed"
                  ? "bg-red-500/[0.06]"
                  : "bg-[#f36c16]/[0.07]",
              "blur-3xl",
            ].join(" ")}
          />

          <div className="relative">
            <span
              className={[
                "mx-auto grid h-20 w-20",
                "place-items-center",
                "rounded-full",
                "shadow-[0_10px_28px_rgba(7,31,33,0.08)]",
                statusColorClass,
              ].join(" ")}
            >
              {confirmed ? (
                <CheckCircle2
                  aria-hidden="true"
                  size={38}
                  strokeWidth={2.2}
                />
              ) : invalid ||
                status === "failed" ? (
                <CircleAlert
                  aria-hidden="true"
                  size={36}
                  strokeWidth={2.2}
                />
              ) : pending ? (
                <Clock3
                  aria-hidden="true"
                  size={36}
                  strokeWidth={2.2}
                />
              ) : (
                <RotateCcw
                  aria-hidden="true"
                  size={36}
                  strokeWidth={2.2}
                />
              )}
            </span>

            <p className="section-label mt-6">
              Young Caring
            </p>

            <h1
              id="donation-result-title"
              className={[
                "mt-3 text-3xl",
                "font-black leading-tight",
                "tracking-[-0.035em]",
                "text-[#101719]",
                "sm:text-4xl",
              ].join(" ")}
            >
              {content.title}
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#5f6d70]">
              {content.description}
            </p>

            {verification.reference ? (
              <div
                className={[
                  "mt-7 rounded-[22px]",
                  "border border-[#e0e8e9]",
                  "bg-[#f3f7f7] p-5",
                ].join(" ")}
              >
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[#647275]">
                  Référence du don
                </p>

                <p className="mt-2 break-all font-black text-[#101719]">
                  {verification.reference}
                </p>

                {formattedAmount ? (
                  <>
                    <div className="my-5 h-px bg-[#dce5e6]" />

                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[#647275]">
                      {confirmed
                        ? "Montant confirmé"
                        : "Montant du don"}
                    </p>

                    <p
                      className={[
                        "mt-2 break-words",
                        "text-3xl font-black",
                        "tracking-[-0.035em]",
                        confirmed
                          ? "text-[#0097a7]"
                          : "text-[#48575a]",
                      ].join(" ")}
                    >
                      {formattedAmount}
                    </p>

                    <span
                      className={[
                        "mt-3 inline-flex",
                        "rounded-full",
                        "bg-[#e1f5f6]",
                        "px-3 py-1",
                        "text-xs font-extrabold",
                        "text-[#007d88]",
                      ].join(" ")}
                    >
                      {verification.currency}
                    </span>
                  </>
                ) : null}

                {content.detail ? (
                  <>
                    <div className="my-5 h-px bg-[#dce5e6]" />

                    <p
                      className={[
                        "inline-flex items-center",
                        "justify-center gap-2",
                        "text-sm font-bold",
                        confirmed
                          ? "text-[#167340]"
                          : invalid ||
                              status ===
                                "failed"
                            ? "text-red-700"
                            : "text-[#b95313]",
                      ].join(" ")}
                    >
                      {confirmed ? (
                        <CheckCircle2
                          aria-hidden="true"
                          size={17}
                        />
                      ) : invalid ||
                        status ===
                          "failed" ? (
                        <CircleAlert
                          aria-hidden="true"
                          size={17}
                        />
                      ) : (
                        <Clock3
                          aria-hidden="true"
                          size={17}
                        />
                      )}

                      {content.detail}
                    </p>
                  </>
                ) : null}
              </div>
            ) : null}

            <div
              className={[
                "mt-7 flex items-start",
                "gap-3 rounded-[18px]",
                "border border-[#ccebed]",
                "bg-[#eaf8f9] p-4",
                "text-left text-sm",
                "leading-6 text-[#315d62]",
              ].join(" ")}
            >
              <Info
                aria-hidden="true"
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p>
                Young Caring ne vous demandera
                jamais votre numéro de carte,
                votre code secret ou votre mot
                de passe par e-mail, téléphone
                ou messagerie.
              </p>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="button-secondary"
              >
                <Home
                  aria-hidden="true"
                  size={18}
                />

                Retour à l’accueil
              </Link>

              {confirmed ? (
                <Link
                  href="/actions"
                  className="button-primary"
                >
                  <Heart
                    aria-hidden="true"
                    size={18}
                  />

                  Découvrir nos actions
                </Link>
              ) : (
                <Link
                  href="/don"
                  className="button-primary"
                >
                  <RotateCcw
                    aria-hidden="true"
                    size={18}
                  />

                  Retour à la page de don
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}