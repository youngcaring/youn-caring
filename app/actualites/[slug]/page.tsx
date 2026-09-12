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
  getNewsBySlug,
  getPublishedNews,
  newsCategories,
} from "@/data/news";

type NewsDetailsPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

/**
 * Empêche les slugs anormalement longs ou contenant
 * des caractères inattendus d’atteindre la recherche.
 */
function isSafeSlug(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 150 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}

function safelyDecodeSlug(value: string): string | null {
  try {
    const decodedValue = decodeURIComponent(value)
      .trim()
      .toLowerCase();

    return isSafeSlug(decodedValue)
      ? decodedValue
      : null;
  } catch {
    return null;
  }
}

function formatNewsDate(
  date: string | null,
  locale: "fr-FR" | "en-US"
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

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsedDate);
}

export const dynamicParams = true;

export function generateStaticParams() {
  return getPublishedNews().map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: NewsDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = safelyDecodeSlug(slug);

  if (!decodedSlug) {
    return {
      title: "Actualité introuvable | Young Caring",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const item = getNewsBySlug(decodedSlug);

  if (!item) {
    return {
      title: "Actualité introuvable | Young Caring",
      description:
        "Cette actualité n’est pas disponible.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${item.titleFr} | Young Caring`,
    description: item.excerptFr,
    alternates: {
      canonical: `/actualites/${item.slug}`,
    },
    openGraph: {
      title: item.titleFr,
      description: item.excerptFr,
      type: "article",
      images: [
        {
          url: item.image,
          alt: item.imageAltFr,
        },
      ],
    },
  };
}

export default async function NewsDetailsPage({
  params,
}: NewsDetailsPageProps) {
  const { slug } = await params;
  const decodedSlug = safelyDecodeSlug(slug);

  if (!decodedSlug) {
    notFound();
  }

  const item = getNewsBySlug(decodedSlug);

  if (!item) {
    notFound();
  }

  const category = newsCategories.find(
    (entry) => entry.id === item.category
  );

  const formattedDateFr = formatNewsDate(
    item.date,
    "fr-FR"
  );

  const formattedDateEn = formatNewsDate(
    item.date,
    "en-US"
  );

  const canonicalHref = `/actualites/${encodeURIComponent(
    item.slug
  )}`;

  return (
    <>
      {/*
       * Le fournisseur de langue modifie l’attribut lang de <html>.
       * Ces règles permettent à cette page serveur de réagir
       * immédiatement au changement FR/EN sans ajouter un autre fichier.
       */}
      <style>{`
        html[lang="fr"] .news-language-en {
          display: none;
        }

        html[lang="en"] .news-language-fr {
          display: none;
        }
      `}</style>

      <main id="main-content">
        <article
          itemScope
          itemType="https://schema.org/NewsArticle"
          className="bg-white"
        >
          <link
            itemProp="mainEntityOfPage"
            href={canonicalHref}
          />

          {/* Hero */}

          <header className="relative isolate min-h-[500px] overflow-hidden bg-[#091719] text-white md:min-h-[560px]">
            <Image
              src={item.image}
              alt={item.imageAltFr}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 -z-0 bg-[linear-gradient(90deg,rgba(4,19,21,0.95)_0%,rgba(4,19,21,0.73)_55%,rgba(4,19,21,0.30)_100%)]"
            />

            <div className="site-container relative z-10 flex min-h-[500px] items-end pb-12 pt-28 md:min-h-[560px] md:items-center md:py-20">
              <div className="max-w-3xl">
                <Link
                  href={siteConfig.navigation.news}
                  className="inline-flex items-center gap-2 rounded-md text-sm font-extrabold text-white/85 transition hover:text-[#f36c16] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
                >
                  <ArrowLeft
                    aria-hidden="true"
                    size={18}
                  />

                  <span className="news-language-fr">
                    Retour aux actualités
                  </span>

                  <span className="news-language-en">
                    Back to news
                  </span>
                </Link>

                {category && (
                  <span className="mt-7 inline-flex rounded-full bg-[#0097a7] px-4 py-2 text-xs font-extrabold">
                    <span className="news-language-fr">
                      {category.labelFr}
                    </span>

                    <span className="news-language-en">
                      {category.labelEn}
                    </span>
                  </span>
                )}

                <h1
                  itemProp="headline"
                  className="mt-5 text-[clamp(2.4rem,6vw,5rem)] font-black leading-[0.98] tracking-[-0.045em]"
                >
                  <span className="news-language-fr">
                    {item.titleFr}
                  </span>

                  <span className="news-language-en">
                    {item.titleEn}
                  </span>
                </h1>

                {(formattedDateFr ||
                  formattedDateEn ||
                  item.location) && (
                  <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/80">
                    {item.date &&
                      (formattedDateFr ||
                        formattedDateEn) && (
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays
                            aria-hidden="true"
                            size={17}
                          />

                          <time
                            itemProp="datePublished"
                            dateTime={item.date}
                          >
                            {formattedDateFr && (
                              <span className="news-language-fr">
                                {formattedDateFr}
                              </span>
                            )}

                            {formattedDateEn && (
                              <span className="news-language-en">
                                {formattedDateEn}
                              </span>
                            )}
                          </time>
                        </span>
                      )}

                    {item.location && (
                      <span
                        itemProp="contentLocation"
                        className="inline-flex items-center gap-2"
                      >
                        <MapPin
                          aria-hidden="true"
                          size={17}
                        />

                        {item.location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Contenu */}

          <section
            aria-labelledby="news-content-title"
            className="site-section bg-white"
          >
            <div className="site-container">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
                <div className="max-w-3xl">
                  <p className="section-label">
                    <span className="news-language-fr">
                      Actualité Young Caring
                    </span>

                    <span className="news-language-en">
                      Young Caring news
                    </span>
                  </p>

                  <h2
                    id="news-content-title"
                    className="section-title"
                  >
                    <span className="news-language-fr">
                      Notre engagement{" "}
                      <span className="text-[#0097a7]">
                        sur le terrain
                      </span>
                    </span>

                    <span className="news-language-en">
                      Our commitment{" "}
                      <span className="text-[#0097a7]">
                        in the field
                      </span>
                    </span>
                  </h2>

                  <div
                    itemProp="articleBody"
                    className="mt-6 whitespace-pre-line text-base leading-8 text-[#4f5e61] sm:text-lg"
                  >
                    <p className="news-language-fr">
                      {item.contentFr}
                    </p>

                    <p
                      lang="en"
                      className="news-language-en"
                    >
                      {item.contentEn}
                    </p>
                  </div>
                </div>

                {/* Soutien */}

                <aside
                  aria-label="Soutenir les actions de Young Caring"
                  className="h-fit rounded-[28px] bg-[#092124] p-7 text-white shadow-[0_18px_45px_rgba(7,31,33,0.14)]"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#f36c16] text-white">
                    <Heart
                      aria-hidden="true"
                      size={25}
                      fill="currentColor"
                    />
                  </span>

                  <h2 className="mt-5 text-2xl font-black">
                    <span className="news-language-fr">
                      Soutenez nos actions
                    </span>

                    <span className="news-language-en">
                      Support our actions
                    </span>
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/75">
                    <span className="news-language-fr">
                      Votre contribution aide Young Caring à
                      poursuivre ses interventions auprès des
                      enfants, des familles et des communautés.
                    </span>

                    <span className="news-language-en">
                      Your contribution helps Young Caring
                      continue its work alongside children,
                      families and communities.
                    </span>
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

                    <span className="news-language-fr">
                      Faire un don
                    </span>

                    <span className="news-language-en">
                      Donate
                    </span>
                  </Link>
                </aside>
              </div>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}