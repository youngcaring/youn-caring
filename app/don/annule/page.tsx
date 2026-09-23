import "server-only";

import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  Home,
  Info,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import {
  DonationPaymentStoreError,
  donationPaymentStore,
} from "@/lib/donation/payment-store";

import {
  normalizeDonationReference,
} from "@/lib/donation/payment-reference";

/**
 * ============================================================================
 * YOUNG CARING
 * PAGE D’ANNULATION DU PARCOURS DE DON
 * ============================================================================
 *
 * Cette page :
 *
 * - valide strictement la référence Young Caring ;
 * - ne fait confiance à aucune donnée venant du navigateur ;
 * - ne modifie jamais le statut d’un paiement ;
 * - ne considère jamais une redirection comme une annulation définitive ;
 * - vérifie le statut connu dans PostgreSQL ;
 * - redirige vers la page de résultat si le paiement est déjà confirmé ;
 * - n’affiche aucune information personnelle du donateur ;
 * - permet de reprendre un nouveau parcours de don.
 *
 * Seul le webhook vérifié ou une vérification directe auprès
 * du prestataire peut modifier et confirmer le statut du paiement.
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
    "Don interrompu",

  description:
    "La tentative de don à Young Caring a été interrompue.",

  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

type SearchParameter =
  | string
  | string[]
  | undefined;

type DonationCancelledPageProps =
  Readonly<{
    searchParams: Promise<
      Record<
        string,
        SearchParameter
      >
    >;
  }>;

/**
 * Accepte uniquement un paramètre unique.
 *
 * Si le même paramètre est présent plusieurs fois,
 * la valeur est considérée comme ambiguë.
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
 * Vérifie si le paiement possède déjà un statut
 * qui doit être présenté par la page de résultat.
 *
 * Cette fonction ne modifie aucune donnée.
 */
async function shouldRedirectToResult(
  reference: string
): Promise<boolean> {
  try {
    const payment =
      await donationPaymentStore
        .findByReference(
          reference
        );

    if (!payment) {
      return false;
    }

    return (
      payment.status === "paid" ||
      payment.status === "refunded"
    );
  } catch (error: unknown) {
    if (
      error instanceof
      DonationPaymentStoreError
    ) {
      console.error(
        "Donation cancellation status lookup failed:",
        {
          code:
            error.code,
        }
      );
    } else {
      console.error(
        "Unexpected donation cancellation lookup error:",
        {
          name:
            error instanceof Error
              ? error.name
              : "UnknownError",
        }
      );
    }

    /**
     * Une indisponibilité de la base ne doit pas
     * produire une fausse confirmation.
     */
    return false;
  }
}

export default async function DonationCancelledPage({
  searchParams,
}: DonationCancelledPageProps) {
  const parameters =
    await searchParams;

  const reference =
    normalizeDonationReference(
      getSingleSearchParameter(
        parameters.reference
      )
    );

  /**
   * La page de retour « annulation » peut être
   * atteinte alors que le paiement a été confirmé
   * quelques secondes auparavant.
   *
   * Dans ce cas, on affiche la véritable page
   * de résultat au lieu d’annoncer une interruption.
   */
  if (
    reference &&
    await shouldRedirectToResult(
      reference
    )
  ) {
    redirect(
      `/don/succes?reference=${encodeURIComponent(
        reference
      )}`
    );
  }

  return (
    <section
      aria-labelledby="cancelled-donation-title"
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
              "bg-[#f36c16]/[0.07]",
              "blur-3xl",
            ].join(" ")}
          />

          <div className="relative">
            <span
              aria-hidden="true"
              className={[
                "mx-auto grid h-20 w-20",
                "place-items-center",
                "rounded-full",
                "bg-[#fff4e9]",
                "text-[#d85c12]",
                "shadow-[0_10px_28px_rgba(7,31,33,0.08)]",
              ].join(" ")}
            >
              <ArrowLeft
                size={38}
                strokeWidth={2.2}
              />
            </span>

            <p className="section-label mt-6">
              Young Caring
            </p>

            <h1
              id="cancelled-donation-title"
              className={[
                "mt-3 text-3xl",
                "font-black leading-tight",
                "tracking-[-0.035em]",
                "text-[#101719]",
                "sm:text-4xl",
              ].join(" ")}
            >
              Le parcours de don a été interrompu
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#5f6d70]">
              Vous avez quitté la page du prestataire
              avant la fin du processus. Cette page
              ne confirme ni un paiement ni un débit.
            </p>

            {reference ? (
              <div
                className={[
                  "mt-7 rounded-[20px]",
                  "border border-[#e0e8e9]",
                  "bg-[#f3f7f7] p-5",
                ].join(" ")}
              >
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[#647275]">
                  Référence de la tentative
                </p>

                <p className="mt-2 break-all font-black text-[#101719]">
                  {reference}
                </p>
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
                Si vous pensez avoir été débité,
                ne recommencez pas immédiatement.
                Contactez Young Caring en indiquant
                uniquement la référence affichée.
              </p>
            </div>

            <div
              className={[
                "mt-4 flex items-start",
                "gap-3 rounded-[18px]",
                "border border-[#e0e8e9]",
                "bg-[#f7f9f9] p-4",
                "text-left text-xs",
                "leading-5 text-[#5f6d70]",
              ].join(" ")}
            >
              <ShieldCheck
                aria-hidden="true"
                size={18}
                className="mt-0.5 shrink-0 text-[#0097a7]"
              />

              <p>
                Ne communiquez jamais votre numéro
                de carte, votre code secret, votre
                code Mobile Money ou votre mot de
                passe à une personne.
              </p>
            </div>

            {!reference ? (
              <div
                role="status"
                className={[
                  "mt-4 rounded-[18px]",
                  "border border-amber-200",
                  "bg-amber-50 p-4",
                  "text-left text-sm",
                  "font-semibold leading-6",
                  "text-amber-900",
                ].join(" ")}
              >
                La référence de cette tentative est
                absente ou invalide. Si vous avez
                besoin d’assistance, contactez Young
                Caring sans transmettre de données
                bancaires.
              </div>
            ) : null}

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
                href="/don#formulaire-don"
                className="button-primary"
              >
                <RotateCcw
                  aria-hidden="true"
                  size={18}
                />

                Reprendre le don
              </Link>
            </div>

            <Link
              href="/contact"
              className={[
                "mt-6 inline-flex",
                "text-sm font-extrabold",
                "text-[#007d88]",
                "transition-colors",
                "hover:text-[#f36c16]",
                "focus-visible:rounded-md",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-[#0097a7]/20",
                "motion-reduce:transition-none",
              ].join(" ")}
            >
              Signaler un problème
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}