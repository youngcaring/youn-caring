import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Info,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import {
  normalizeDonationReference,
} from "@/lib/donation/payment-reference";

export const dynamic =
  "force-dynamic";

export const metadata: Metadata = {
  title: "Don interrompu",

  description:
    "La tentative de don à Young Caring a été interrompue.",

  robots: {
    index: false,
    follow: false,
  },
};

type DonationCancelledPageProps =
  Readonly<{
    searchParams: Promise<
      Record<
        string,
        string | string[] | undefined
      >
    >;
  }>;

function getSingleSearchParameter(
  value: string | string[] | undefined
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (
    Array.isArray(value) &&
    typeof value[0] === "string"
  ) {
    return value[0];
  }

  return null;
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
            "mx-auto max-w-2xl",
            "rounded-[30px] border",
            "border-[#e0e8e9]",
            "bg-white px-6 py-10",
            "text-center",
            "shadow-[0_20px_55px_rgba(7,31,33,0.10)]",
            "sm:px-10 sm:py-14",
          ].join(" ")}
        >
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#fff4e9] text-[#d85c12]">
            <ArrowLeft
              aria-hidden="true"
              size={38}
            />
          </span>

          <p className="section-label mt-6">
            Young Caring
          </p>

          <h1
            id="cancelled-donation-title"
            className={[
              "mt-3 text-3xl font-black",
              "leading-tight tracking-[-0.035em]",
              "text-[#101719]",
              "sm:text-4xl",
            ].join(" ")}
          >
            Le parcours de don a été interrompu
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-[#5f6d70]">
            Vous avez quitté la page de paiement
            avant la fin du processus. Cette page
            ne confirme ni un paiement ni un débit.
          </p>

          {reference && (
            <div className="mt-7 rounded-[20px] bg-[#f3f7f7] p-5">
              <p className="text-xs font-black uppercase tracking-[0.08em] text-[#647275]">
                Référence de la tentative
              </p>

              <p className="mt-2 break-all font-black text-[#101719]">
                {reference}
              </p>
            </div>
          )}

          <div className="mt-7 flex items-start gap-3 rounded-[18px] bg-[#eaf8f9] p-4 text-left text-sm leading-6 text-[#315d62]">
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

          <div className="mt-4 flex items-start gap-3 rounded-[18px] bg-[#f7f9f9] p-4 text-left text-xs leading-5 text-[#5f6d70]">
            <ShieldCheck
              aria-hidden="true"
              size={18}
              className="mt-0.5 shrink-0 text-[#0097a7]"
            />

            <p>
              Ne communiquez jamais votre numéro
              de carte, votre code secret ou votre
              mot de passe à une personne.
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
              "transition hover:text-[#f36c16]",
              "focus-visible:rounded-md",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#0097a7]/20",
            ].join(" ")}
          >
            Signaler un problème
          </Link>
        </div>
      </div>
    </section>
  );
}