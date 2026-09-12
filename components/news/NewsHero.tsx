"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  Newspaper,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { newsImages } from "@/data/news";

export default function NewsHero() {
  const { language, t } = useLanguage();

  const imageAlt =
    language === "fr"
      ? "Enfants et bénévoles réunis pendant une activité de Young Caring"
      : "Children and volunteers gathered during a Young Caring activity";

  return (
    <section
      aria-labelledby="news-hero-title"
      className={[
        "relative isolate overflow-hidden",
        "min-h-[500px] bg-[#091719]",
        "text-white",
        "md:min-h-[460px]",
      ].join(" ")}
    >
      {/* Image pour ordinateur */}

      <Image
        src={newsImages.heroDesktop}
        alt={imageAlt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className={[
          "hidden object-cover object-center",
          "md:block",
        ].join(" ")}
      />

      {/* Image pour téléphone */}

      <Image
        src={newsImages.heroMobile}
        alt={imageAlt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className={[
          "object-cover object-center",
          "md:hidden",
        ].join(" ")}
      />

      {/* Protection du texte */}

      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 z-0",
          "bg-[linear-gradient(90deg,rgba(4,19,21,0.94)_0%,rgba(4,19,21,0.75)_55%,rgba(4,19,21,0.32)_100%)]",
          "md:bg-[linear-gradient(90deg,rgba(4,19,21,0.94)_0%,rgba(4,19,21,0.68)_52%,rgba(4,19,21,0.18)_100%)]",
        ].join(" ")}
      />

      <div
        className={[
          "site-container relative z-10",
          "flex min-h-[500px] items-end",
          "pb-12 pt-28",
          "md:min-h-[460px]",
          "md:items-center md:py-16",
        ].join(" ")}
      >
        <div className="max-w-2xl animate-fade-up">
          <p
            className={[
              "inline-flex items-center gap-2",
              "text-xs font-black uppercase",
              "tracking-[0.12em]",
              "text-[#f36c16]",
            ].join(" ")}
          >
            <Newspaper
              aria-hidden="true"
              size={16}
            />

            {t("NewsPage.heroLabel")}
          </p>

          <h1
            id="news-hero-title"
            className={[
              "mt-4",
              "text-[clamp(2.7rem,6vw,5rem)]",
              "font-black leading-[0.98]",
              "tracking-[-0.045em]",
            ].join(" ")}
          >
            {t("NewsPage.heroTitle")}
          </h1>

          <p
            className={[
              "mt-5 max-w-xl",
              "text-base leading-7 text-white/85",
              "md:text-lg",
            ].join(" ")}
          >
            {t("NewsPage.heroDescription")}
          </p>

          <Link
            href="#news-list"
            className={[
              "button-primary mt-7",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#f36c16]/30",
            ].join(" ")}
          >
            {t("NewsPage.latestTitle")}

            <ArrowDown
              aria-hidden="true"
              size={18}
              className="transition-transform duration-200 group-hover:translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}