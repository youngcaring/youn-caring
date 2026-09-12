"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Images,
  MapPin,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";
import {
  getPublishedHomeNews,
  homeContent,
  homeImages,
  type HomeNewsItem,
} from "@/data/home";

type GalleryPreviewItem = Readonly<{
  id: string;
  image: string;
  titleFr: string;
  titleEn: string;
  imageAltFr: string;
  imageAltEn: string;
}>;

const galleryPreviewItems: readonly GalleryPreviewItem[] = [
  {
    id: "field-action-01",
    image: homeImages.newsAction01,
    titleFr: "Solidarité en action",
    titleEn: "Solidarity in action",
    imageAltFr:
      "Dons matériels réunis pendant une action de solidarité",
    imageAltEn:
      "Material donations gathered during a solidarity action",
  },
  {
    id: "field-action-02",
    image: homeImages.newsAction02,
    titleFr: "Young Caring sur le terrain",
    titleEn: "Young Caring in the field",
    imageAltFr:
      "Membres de Young Caring mobilisés pendant une action",
    imageAltEn:
      "Young Caring members mobilised during an action",
  },
  {
    id: "field-action-03",
    image: homeImages.newsAction03,
    titleFr: "Une équipe engagée",
    titleEn: "A committed team",
    imageAltFr:
      "Membres et bénévoles engagés auprès de Young Caring",
    imageAltEn:
      "Members and volunteers committed to Young Caring",
  },
];

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function getNewsLink(item: HomeNewsItem): string {
  if (!item.slug || !isValidSlug(item.slug)) {
    return siteConfig.navigation.news;
  }

  return `${siteConfig.navigation.news}/${item.slug}`;
}

export default function LatestNewsSection() {
  const { language, t } = useLanguage();

  const publishedNews = getPublishedHomeNews().slice(
    0,
    homeContent.sections.latestNews.maximumItems
  );

  const hasPublishedNews = publishedNews.length > 0;

  const sectionTitle =
    language === "fr"
      ? hasPublishedNews
        ? "Nos dernières actualités"
        : "Nos actions en images"
      : hasPublishedNews
        ? "Our latest news"
        : "Our actions in pictures";

  const sectionLabel = hasPublishedNews
    ? t("Common.news")
    : language === "fr"
      ? "Moments de terrain"
      : "Field moments";

  const mainLink = hasPublishedNews
    ? siteConfig.navigation.news
    : siteConfig.navigation.gallery;

  const mainLinkLabel = hasPublishedNews
    ? language === "fr"
      ? "Voir toutes les actualités"
      : "View all news"
    : language === "fr"
      ? "Voir toute la galerie"
      : "View the full gallery";

  const formatDate = (dateValue: string | null): string | null => {
    if (!dateValue) {
      return null;
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat(
      language === "fr" ? "fr-FR" : "en-US",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ).format(parsedDate);
  };

  return (
    <section
      id="actualites-recentes"
      aria-labelledby="latest-news-section-title"
      className="site-section relative overflow-hidden bg-[#f7f9f9]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-44 top-10 h-96 w-96 rounded-full bg-[#eaf8f9] blur-3xl"
      />

      <div className="site-container relative z-10">
        {/* En-tête */}

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2">
              <Images
                aria-hidden="true"
                size={18}
                className="text-[#0097a7]"
              />

              <p className="section-label">
                {sectionLabel}
              </p>
            </div>

            <h2
              id="latest-news-section-title"
              className="section-title"
            >
              {sectionTitle}
            </h2>
          </div>

          <Link
            href={mainLink}
            className="group hidden min-h-11 shrink-0 items-center gap-2 font-extrabold text-[#007d88] transition-colors hover:text-[#f36c16] sm:inline-flex"
          >
            <span>{mainLinkLabel}</span>

            <ArrowRight
              aria-hidden="true"
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Véritables actualités publiées */}

        {hasPublishedNews && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {publishedNews.map((item) => {
              const title =
                language === "fr"
                  ? item.titleFr
                  : item.titleEn;

              const formattedDate = formatDate(item.date);

              /*
               * Cette sécurité empêche l’affichage d’une carte
               * dont les informations essentielles manquent.
               */
              if (!title || !item.image) {
                return null;
              }

              const newsLink = getNewsLink(item);

              return (
                <article
                  key={item.id}
                  className="content-card group flex flex-col"
                >
                  <Link
                    href={newsLink}
                    aria-label={title}
                    className="relative block aspect-[3/2] overflow-hidden bg-[#eef4f4]"
                  >
                    <Image
                      src={item.image}
                      alt={title}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      quality={86}
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    {(formattedDate || item.location) && (
                      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#5f6d70]">
                        {formattedDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              aria-hidden="true"
                              size={14}
                              className="text-[#0097a7]"
                            />

                            {formattedDate}
                          </span>
                        )}

                        {item.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin
                              aria-hidden="true"
                              size={14}
                              className="text-[#f36c16]"
                            />

                            {item.location}
                          </span>
                        )}
                      </div>
                    )}

                    <h3 className="text-xl font-black leading-tight tracking-[-0.025em] text-[#101719]">
                      <Link
                        href={newsLink}
                        className="transition-colors hover:text-[#007d88]"
                      >
                        {title}
                      </Link>
                    </h3>

                    <Link
                      href={newsLink}
                      className="mt-6 inline-flex min-h-10 items-center gap-2 self-start text-sm font-extrabold text-[#007d88] transition-colors hover:text-[#f36c16]"
                    >
                      <span>{t("Common.readMore")}</span>

                      <ArrowRight
                        aria-hidden="true"
                        size={16}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Photos réelles lorsque les actualités ne sont pas encore renseignées */}

        {!hasPublishedNews && (
          <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {galleryPreviewItems.map((item) => {
              const title =
                language === "fr"
                  ? item.titleFr
                  : item.titleEn;

              const imageAlt =
                language === "fr"
                  ? item.imageAltFr
                  : item.imageAltEn;

              return (
                <article
                  key={item.id}
                  className="content-card group w-[84%] shrink-0 snap-start sm:w-[48%] md:w-auto md:shrink"
                >
                  <Link
                    href={siteConfig.navigation.gallery}
                    aria-label={title}
                    className="relative block aspect-[3/2] overflow-hidden bg-[#eef4f4]"
                  >
                    <Image
                      src={item.image}
                      alt={imageAlt}
                      fill
                      sizes="(max-width: 639px) 84vw, (max-width: 767px) 48vw, 33vw"
                      quality={86}
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                    />

                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                    />
                  </Link>

                  <div className="p-5">
                    <h3 className="text-lg font-black text-[#101719]">
                      {title}
                    </h3>

                    <Link
                      href={siteConfig.navigation.gallery}
                      className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#007d88] transition-colors hover:text-[#f36c16]"
                    >
                      <span>
                        {language === "fr"
                          ? "Voir les images"
                          : "View pictures"}
                      </span>

                      <ArrowRight
                        aria-hidden="true"
                        size={16}
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bouton mobile */}

        <Link
          href={mainLink}
          className="button-secondary mt-7 w-full sm:hidden"
        >
          <span>{mainLinkLabel}</span>

          <ArrowRight
            aria-hidden="true"
            size={17}
          />
        </Link>
      </div>
    </section>
  );
}