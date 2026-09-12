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
  ShieldCheck,
} from "lucide-react";

import {
  formatDonationAmount,
} from "@/data/donation";
import {
  PaymentConfigurationError,
  PaymentProviderError,
  verifyPayment,
} from "@/lib/donation/payment-provider";
import {
  normalizeDonationReference,
} from "@/lib/donation/payment-reference";
import type {
  DonationCurrency,
} from "@/types/donation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vérification du don",

  description:
    "Vérification sécurisée du statut de votre contribution à Young Caring.",

  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

type SearchParameter =
  string |
  string[] |
  undefined;

type DonationSuccessPageProps =
  Readonly<{
    searchParams: Promise<
      Record<
        string,
        SearchParameter
      >
    >;
  }>;

type VerificationState =
  | Readonly<{
      status: "paid";
      reference: string;
      amount: number;
      currency: DonationCurrency;
    }>
  | Readonly<{
      status: "pending";
      reference: string;
      amount: null;
      currency: null;
    }>
  | Readonly<{
      status: "invalid";
      reference: null;
      amount: null;
      currency: null;
    }>;

/*
 * Accepte uniquement un paramètre unique.
 *
 * Lorsqu’un même paramètre apparaît plusieurs fois,
 * la requête est considérée comme ambiguë et refusée.
 */
function getSingleSearchParameter(
  value: SearchParameter
): string | null {
  if (typeof value === "string") {
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

/*
 * Nettoie la référence externe avant
 * de la transmettre au prestataire.
 */
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
    normalized.length > 200 ||
    !/^[A-Za-z0-9._:-]+$/.test(
      normalized
    )
  ) {
    return null;
  }

  return normalized;
}

/*
 * Vérifie le paiement directement
 * auprès du prestataire configuré.
 *
 * Une redirection vers cette page ne suffit
 * jamais à confirmer une contribution.
 */
async function verifyDonation(
  internalReference: string | null,
  providerReference: string | null
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

  /*
   * Sans référence externe, aucune vérification
   * ne peut être demandée au prestataire.
   */
  if (!providerReference) {
    return {
      status: "pending",
      reference,
      amount: null,
      currency: null,
    };
  }

  try {
    const payment =
      await verifyPayment(
        providerReference
      );

    /*
     * Le paiement n’est confirmé que si :
     * - le prestataire indique paid ;
     * - la référence interne correspond ;
     * - le montant est un entier positif ;
     * - la devise a été validée par la couche
     *   payment-provider.
     */
    if (
      payment.status === "paid" &&
      payment.reference === reference &&
      Number.isSafeInteger(
        payment.amount
      ) &&
      payment.amount > 0
    ) {
      return {
        status: "paid",
        reference,
        amount: payment.amount,
        currency: payment.currency,
      };
    }

    return {
      status: "pending",
      reference,
      amount: null,
      currency: null,
    };
  } catch (error: unknown) {
    if (
      error instanceof
        PaymentConfigurationError ||
      error instanceof
        PaymentProviderError
    ) {
      console.error(
        "Donation verification unavailable:",
        error.code
      );
    } else {
      console.error(
        "Unexpected donation verification error."
      );
    }

    return {
      status: "pending",
      reference,
      amount: null,
      currency: null,
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

  const providerReference =
    normalizeProviderReference(
      getSingleSearchParameter(
        parameters.providerReference
      )
    );

  const verification =
    await verifyDonation(
      internalReference,
      providerReference
    );

  const confirmed =
    verification.status === "paid";

  const invalid =
    verification.status === "invalid";

  const confirmedAmount =
    confirmed
      ? formatDonationAmount(
          verification.amount,
          "fr",
          verification.currency
        )
      : null;

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
                : invalid
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
                confirmed
                  ? "bg-[#e7f8ee] text-[#167340]"
                  : invalid
                    ? "bg-red-50 text-red-700"
                    : "bg-[#fff4e9] text-[#d85c12]",
              ].join(" ")}
            >
              {confirmed ? (
                <CheckCircle2
                  aria-hidden="true"
                  size={38}
                  strokeWidth={2.2}
                />
              ) : invalid ? (
                <CircleAlert
                  aria-hidden="true"
                  size={36}
                  strokeWidth={2.2}
                />
              ) : (
                <Clock3
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
              {confirmed
                ? "Votre don est confirmé"
                : invalid
                  ? "Référence invalide"
                  : "Vérification en cours"}
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#5f6d70]">
              {confirmed
                ? "Merci pour votre générosité. Votre contribution a été vérifiée directement auprès du prestataire de paiement."
                : invalid
                  ? "Cette adresse ne contient pas une référence de don valide. Aucun paiement ne peut être confirmé depuis cette page."
                  : "Votre retour depuis la page de paiement a bien été reçu. La contribution ne sera confirmée qu’après sa vérification sécurisée auprès du prestataire."}
            </p>

            {verification.reference && (
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

                {confirmed &&
                  confirmedAmount && (
                    <>
                      <div className="my-5 h-px bg-[#dce5e6]" />

                      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#647275]">
                        Montant confirmé
                      </p>

                      <p
                        className={[
                          "mt-2 break-words",
                          "text-3xl font-black",
                          "tracking-[-0.035em]",
                          "text-[#0097a7]",
                        ].join(" ")}
                      >
                        {confirmedAmount}
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
                  )}

                {!confirmed &&
                  !invalid && (
                    <>
                      <div className="my-5 h-px bg-[#dce5e6]" />

                      <p className="inline-flex items-center gap-2 text-sm font-bold text-[#b95313]">
                        <Clock3
                          aria-hidden="true"
                          size={17}
                        />

                        Confirmation en attente
                      </p>
                    </>
                  )}
              </div>
            )}

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
              <ShieldCheck
                aria-hidden="true"
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p>
                Young Caring ne vous demandera
                jamais votre numéro de carte,
                votre code secret ou votre mot
                de passe par email, téléphone
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}