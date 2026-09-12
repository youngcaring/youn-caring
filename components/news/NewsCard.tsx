"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  getLocalizedNews,
  newsCategories,
} from "@/data/news";
import type { PublishedNewsItem } from "@/types/news";

type NewsCardProps = Readonly<{
  item: PublishedNewsItem;
}>;

function formatNewsDate(
  date: string | null,
  language: "fr" | "en"
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

  return new Intl.DateTimeFormat(
    language === "fr" ? "fr-FR" : "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(parsedDate);
}

export default function NewsCard({
  item,
}: NewsCardProps) {
  const { language, t } = useLanguage();

  const localizedContent = getLocalizedNews(
    item,
    language
  );

  const category = newsCategories.find(
    (entry) => entry.id === item.category
  );

  const categoryLabel = category
    ? language === "fr"
      ? category.labelFr
      : category.labelEn
    : null;

  const formattedDate = formatNewsDate(
    item.date,
    language
  );

  const hasInformation =
    formattedDate !== null ||
    item.location !== null;

  const articleHref = `/actualites/${encodeURIComponent(
    item.slug
  )}`;

  return (
    <article
      id={`actualite-${item.slug}`}
      className={[
        "content-card group flex h-full",
        "scroll-mt-32 flex-col overflow-hidden",
        "bg-white",
      ].join(" ")}
    >
      {/* Image */}

      <div className="relative aspect-[3/2] overflow-hidden bg-[#eaf1f2]">
        <Image
          src={item.image}
          alt={localizedContent.imageAlt}
          fill
          quality={86}
          sizes={[
            "(max-width: 767px) 100vw",
            "(max-width: 1199px) 50vw",
            "33vw",
          ].join(", ")}
          className={[
            "object-cover object-center",
            "transition-transform duration-500",
            "group-hover:scale-[1.04]",
          ].join(" ")}
        />

        <div
          aria-hidden="true"
          className={[
            "absolute inset-0",
            "bg-gradient-to-t",
            "from-[#071f21]/35",
            "via-transparent to-transparent",
          ].join(" ")}
        />

        {categoryLabel && (
          <span
            className={[
              "absolute bottom-4 left-4",
              "max-w-[calc(100%-2rem)]",
              "rounded-full bg-[#0097a7]",
              "px-3 py-1.5",
              "text-[0.68rem] font-extrabold",
              "text-white",
              "shadow-[0_6px_18px_rgba(7,31,33,0.22)]",
            ].join(" ")}
          >
            {categoryLabel}
          </span>
        )}

        {item.featured && (
          <span
            className={[
              "absolute right-4 top-4",
              "rounded-full bg-[#f36c16]",
              "px-3 py-1.5",
              "text-[0.68rem] font-extrabold",
              "text-white",
              "shadow-[0_6px_18px_rgba(7,31,33,0.22)]",
            ].join(" ")}
          >
            {t("NewsPage.featuredLabel")}
          </span>
        )}
      </div>

      {/* Contenu */}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {hasInformation && (
          <div
            className={[
              "flex flex-wrap gap-x-4 gap-y-2",
              "text-xs text-[#647275]",
            ].join(" ")}
          >
            {formattedDate !== null &&
              item.date !== null && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays
                    aria-hidden="true"
                    size={14}
                  />

                  <time dateTime={item.date}>
                    {formattedDate}
                  </time>
                </span>
              )}

            {item.location !== null && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin
                  aria-hidden="true"
                  size={14}
                />

                {item.location}
              </span>
            )}
          </div>
        )}

        <h2
          className={[
            hasInformation ? "mt-4" : "mt-1",
            "text-xl font-black leading-tight",
            "tracking-[-0.025em] text-[#101719]",
          ].join(" ")}
        >
          {localizedContent.title}
        </h2>

        <p
          className={[
            "mt-3 line-clamp-3",
            "text-sm leading-6 text-[#5f6d70]",
          ].join(" ")}
        >
          {localizedContent.excerpt}
        </p>

        <Link
          href={articleHref}
          aria-label={`${t(
            "NewsPage.readArticle"
          )} : ${localizedContent.title}`}
          className={[
            "mt-auto inline-flex items-center",
            "gap-2 self-start pt-5",
            "text-sm font-extrabold",
            "text-[#007d88]",
            "transition-colors duration-200",
            "hover:text-[#f36c16]",
            "focus-visible:rounded-md",
            "focus-visible:outline-none",
            "focus-visible:ring-4",
            "focus-visible:ring-[#0097a7]/20",
          ].join(" ")}
        >
          {t("NewsPage.readArticle")}

          <ArrowRight
            aria-hidden="true"
            size={16}
            className={[
              "transition-transform duration-200",
              "group-hover:translate-x-1",
            ].join(" ")}
          />
        </Link>
      </div>
    </article>
  );
}