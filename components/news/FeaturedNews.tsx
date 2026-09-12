"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Newspaper,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  getFeaturedNews,
  getLocalizedNews,
  newsCategories,
} from "@/data/news";

export default function FeaturedNews() {
  const { language, t } = useLanguage();

  const featuredNews = getFeaturedNews();

  /*
   * Si aucune actualité n’est définie comme featured,
   * la section est simplement masquée.
   */
  if (!featuredNews) {
    return null;
  }

  const localizedContent = getLocalizedNews(
    featuredNews,
    language
  );

  const category = newsCategories.find(
    (item) => item.id === featuredNews.category
  );

  const categoryLabel = category
    ? language === "fr"
      ? category.labelFr
      : category.labelEn
    : null;

  const articleHref = `/actualites/${encodeURIComponent(
    featuredNews.slug
  )}`;

  return (
    <section
      aria-labelledby="featured-news-title"
      className="site-section bg-white"
    >
      <div className="site-container">
        <article
          className={[
            "group grid overflow-hidden",
            "rounded-[30px] bg-[#092124]",
            "text-white",
            "shadow-[0_22px_55px_rgba(7,31,33,0.14)]",
            "sm:rounded-[34px]",
            "lg:grid-cols-2",
          ].join(" ")}
        >
          {/* Photographie */}

          <div
            className={[
              "relative min-h-[310px]",
              "overflow-hidden bg-[#102f32]",
              "sm:min-h-[380px]",
              "lg:min-h-[440px]",
            ].join(" ")}
          >
            <Image
              src={featuredNews.image}
              alt={localizedContent.imageAlt}
              fill
              quality={88}
              sizes={[
                "(max-width: 1023px) 100vw",
                "50vw",
              ].join(", ")}
              className={[
                "object-cover object-center",
                "transition-transform duration-700",
                "group-hover:scale-[1.03]",
              ].join(" ")}
            />

            <div
              aria-hidden="true"
              className={[
                "absolute inset-0",
                "bg-gradient-to-t",
                "from-[#092124]/55",
                "via-transparent to-transparent",
                "lg:bg-gradient-to-r",
                "lg:from-transparent",
                "lg:to-[#092124]/20",
              ].join(" ")}
            />

            {categoryLabel && (
              <span
                className={[
                  "absolute bottom-5 left-5",
                  "inline-flex items-center gap-2",
                  "rounded-full bg-[#0097a7]",
                  "px-4 py-2",
                  "text-xs font-extrabold text-white",
                  "shadow-[0_8px_22px_rgba(7,31,33,0.24)]",
                  "sm:bottom-6 sm:left-6",
                ].join(" ")}
              >
                <Newspaper
                  aria-hidden="true"
                  size={15}
                />

                {categoryLabel}
              </span>
            )}
          </div>

          {/* Contenu */}

          <div
            className={[
              "flex flex-col justify-center",
              "p-7 sm:p-10 lg:p-12",
            ].join(" ")}
          >
            <p
              className={[
                "text-xs font-black uppercase",
                "tracking-[0.1em] text-[#f36c16]",
              ].join(" ")}
            >
              {t("NewsPage.featuredLabel")}
            </p>

            <h2
              id="featured-news-title"
              className={[
                "mt-3 text-3xl font-black",
                "leading-[1.08]",
                "tracking-[-0.035em]",
                "sm:text-4xl",
              ].join(" ")}
            >
              {localizedContent.title}
            </h2>

            {featuredNews.location && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm text-white/65">
                <MapPin
                  aria-hidden="true"
                  size={16}
                />

                {featuredNews.location}
              </p>
            )}

            <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
              {localizedContent.excerpt}
            </p>

            <Link
              href={articleHref}
              aria-label={`${t(
                "NewsPage.readArticle"
              )} : ${localizedContent.title}`}
              className={[
                "button-primary mt-7 self-start",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-[#f36c16]/30",
              ].join(" ")}
            >
              {t("NewsPage.readArticle")}

              <ArrowRight
                aria-hidden="true"
                size={18}
                className={[
                  "transition-transform duration-200",
                  "group-hover:translate-x-1",
                ].join(" ")}
              />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}