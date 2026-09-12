import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Heart,
  MapPin,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import {
  getPublishedActionBySlug,
  getPublishedActions,
} from "@/data/actions";
import type {
  PublishedActionItem,
  SpecificActionCategoryId,
} from "@/types/action";

type ActionDetailsPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

type CategoryLabel = Readonly<{
  fr: string;
  en: string;
}>;

const categoryLabels: Record<
  SpecificActionCategoryId,
  CategoryLabel
> = {
  education: {
    fr: "Éducation",
    en: "Education",
  },
  foodSupport: {
    fr: "Aide et dons matériels",
    en: "Support and material donations",
  },
  health: {
    fr: "Accompagnement",
    en: "Support",
  },
  clothing: {
    fr: "Vêtements et kits",
    en: "Clothing and kits",
  },
  children: {
    fr: "Enfance",
    en: "Children",
  },
  womenFamilies: {
    fr: "Femmes et familles",
    en: "Women and families",
  },
  waterHygiene: {
    fr: "Action communautaire",
    en: "Community action",
  },
  emergency: {
    fr: "Mobilisation",
    en: "Mobilisation",
  },
};

export const dynamicParams = true;

/*
 * Prépare les adresses des actions publiées.
 */

export function generateStaticParams(): Array<{
  slug: string;
}> {
  return getPublishedActions().map((action) => ({
    slug: action.slug,
  }));
}

/*
 * Décode un slug sans laisser une adresse incorrecte
 * provoquer une erreur dans l’application.
 */

function safelyDecodeSlug(
  slug: string
): string | null {
  try {
    return decodeURIComponent(slug);
  } catch {
    return null;
  }
}

/*
 * Formate une date seulement lorsqu’elle est présente
 * et valide. Une action n’est pas obligée d’avoir une date.
 */

function formatActionDate(
  date: string | null
): string | null {
  if (
    date === null ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return null;
  }

  const parsedDate = new Date(
    `${date}T00:00:00.000Z`
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}

/*
 * Génère les informations utilisées par les moteurs
 * de recherche et les aperçus de partage.
 */

export async function generateMetadata({
  params,
}: ActionDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = safelyDecodeSlug(slug);

  const action =
    decodedSlug !== null
      ? getPublishedActionBySlug(decodedSlug)
      : undefined;

  if (!action) {
    return {
      title: "Action introuvable | Young Caring",
      description:
        "Cette action n’est pas disponible ou n’a pas encore été publiée.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${action.titleFr} | Young Caring`,
    description: action.descriptionFr,

    alternates: {
      canonical: `/actions/${action.slug}`,
    },

    openGraph: {
      title: action.titleFr,
      description: action.descriptionFr,
      type: "article",
      images: [
        {
          url: action.image,
          alt: action.imageAltFr,
        },
      ],
    },
  };
}

export default async function ActionDetailsPage({
  params,
}: ActionDetailsPageProps) {
  const { slug } = await params;
  const decodedSlug = safelyDecodeSlug(slug);

  if (decodedSlug === null) {
    notFound();
  }

  const action =
    getPublishedActionBySlug(decodedSlug);

  if (!action) {
    notFound();
  }

  return <ActionDetailsContent action={action} />;
}

type ActionDetailsContentProps = Readonly<{
  action: PublishedActionItem;
}>;

function ActionDetailsContent({
  action,
}: ActionDetailsContentProps) {
  const formattedDate = formatActionDate(
    action.date
  );

  const categoryLabel =
    categoryLabels[action.category].fr;

  const hasInformation =
    formattedDate !== null ||
    action.location !== null;

  return (
    <article className="bg-white">
      {/* Hero de l’action */}

      <header
        className={[
          "relative isolate overflow-hidden",
          "min-h-[500px] bg-[#091719]",
          "text-white md:min-h-[560px]",
        ].join(" ")}
      >
        <Image
          src={action.image}
          alt={action.imageAltFr}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />

        <div
          aria-hidden="true"
          className={[
            "absolute inset-0 z-0",
            "bg-[linear-gradient(90deg,rgba(4,19,21,0.94)_0%,rgba(4,19,21,0.72)_55%,rgba(4,19,21,0.30)_100%)]",
          ].join(" ")}
        />

        <div
          className={[
            "site-container relative z-10",
            "flex min-h-[500px] items-end",
            "pb-12 pt-28",
            "md:min-h-[560px] md:items-center",
            "md:py-20",
          ].join(" ")}
        >
          <div className="max-w-3xl">
            <Link
              href={siteConfig.navigation.actions}
              className={[
                "inline-flex items-center gap-2",
                "text-sm font-extrabold text-white/85",
                "transition-colors",
                "hover:text-[#f36c16]",
                "focus-visible:rounded-md",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-white/30",
              ].join(" ")}
            >
              <ArrowLeft
                aria-hidden="true"
                size={18}
              />

              Retour aux actions
            </Link>

            <span
              className={[
                "mt-7 inline-flex rounded-full",
                "bg-[#0097a7] px-4 py-2",
                "text-xs font-extrabold text-white",
                "shadow-[0_8px_20px_rgba(0,151,167,0.25)]",
              ].join(" ")}
            >
              {categoryLabel}
            </span>

            <h1
              className={[
                "mt-5 max-w-3xl",
                "text-[clamp(2.5rem,6vw,5rem)]",
                "font-black leading-[0.98]",
                "tracking-[-0.045em]",
              ].join(" ")}
            >
              {action.titleFr}
            </h1>

            {hasInformation && (
              <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/80">
                {formattedDate !== null &&
                  action.date !== null && (
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays
                        aria-hidden="true"
                        size={17}
                      />

                      <time dateTime={action.date}>
                        {formattedDate}
                      </time>
                    </span>
                  )}

                {action.location !== null && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin
                      aria-hidden="true"
                      size={17}
                    />

                    {action.location}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Présentation de l’action */}

      <section
        aria-labelledby="action-content-title"
        className="site-section bg-white"
      >
        <div className="site-container">
          <div
            className={[
              "grid gap-10",
              "lg:grid-cols-[minmax(0,1fr)_340px]",
              "lg:gap-16",
            ].join(" ")}
          >
            <div className="max-w-3xl">
              <p className="section-label">
                Notre intervention
              </p>

              <h2
                id="action-content-title"
                className="section-title"
              >
                Une action{" "}
                <span className="text-[#0097a7]">
                  concrète sur le terrain
                </span>
              </h2>

              <p
                className={[
                  "mt-6 whitespace-pre-line",
                  "text-base leading-8 text-[#4f5e61]",
                  "sm:text-lg",
                ].join(" ")}
              >
                {action.descriptionFr}
              </p>
            </div>

            {/* Appel au don */}

            <aside
              aria-label="Soutenir les actions de Young Caring"
              className={[
                "h-fit rounded-[28px]",
                "bg-[#092124] p-7 text-white",
                "shadow-[0_18px_45px_rgba(7,31,33,0.14)]",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-14 w-14",
                  "place-items-center rounded-full",
                  "bg-[#f36c16] text-white",
                ].join(" ")}
              >
                <Heart
                  aria-hidden="true"
                  size={25}
                  fill="currentColor"
                />
              </span>

              <h2 className="mt-5 text-2xl font-black">
                Soutenez nos prochaines actions
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Votre contribution aide Young Caring à
                poursuivre ses interventions auprès des
                personnes et des communautés qui en ont
                besoin.
              </p>

              <Link
                href={siteConfig.navigation.donation}
                className="button-primary mt-6 w-full"
              >
                <Heart
                  aria-hidden="true"
                  size={18}
                  fill="currentColor"
                />

                Faire un don
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </article>
  );
}