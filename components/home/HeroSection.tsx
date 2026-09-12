"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  homeContent,
  homeImageMetadata,
} from "@/data/home";

export default function HeroSection() {
  const { language, t } = useLanguage();

  return (
    <section
      id="accueil"
      aria-labelledby="hero-title"
      className={[
        "relative isolate overflow-hidden",
        "min-h-[700px] bg-[#091719] text-white",
        "md:min-h-[620px]",
        "lg:min-h-[650px]",
      ].join(" ")}
    >
      {/* Image pour ordinateur */}

      <Image
        src={homeImageMetadata.heroDesktop.src}
        alt={t("Hero.imageAlt")}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={90}
        className="-z-30 hidden object-cover object-center md:block"
      />

      {/* Image spécialement cadrée pour mobile */}

      <Image
        src={homeImageMetadata.heroMobile.src}
        alt={t("Hero.imageAlt")}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        quality={90}
        className="-z-30 object-cover object-center md:hidden"
      />

      {/* Overlay mobile */}

      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 -z-20 md:hidden",
          "bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.35)_32%,rgba(0,0,0,0.90)_100%)]",
        ].join(" ")}
      />

      {/* Overlay ordinateur */}

      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 -z-20 hidden md:block",
          "bg-[linear-gradient(90deg,rgba(0,0,0,0.90)_0%,rgba(0,0,0,0.70)_42%,rgba(0,0,0,0.24)_72%,rgba(0,0,0,0.08)_100%)]",
        ].join(" ")}
      />

      {/* Léger assombrissement général */}

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[#091719]/10"
      />

      {/* Contenu principal */}

      <div
        className={[
          "site-container relative z-10 flex",
          "min-h-[700px] items-end pb-20 pt-24",
          "md:min-h-[620px] md:items-center md:py-20",
          "lg:min-h-[650px]",
        ].join(" ")}
      >
        <div className="animate-fade-up w-full max-w-[680px]">
          {/* Petit indicateur institutionnel */}

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-4 py-2 text-xs font-extrabold tracking-[0.1em] text-white/90 uppercase backdrop-blur-md">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[#f36c16]"
            />

            <span>{t("Hero.organizationLabel")}</span>
          </div>

          {/* Titre */}

          <h1
            id="hero-title"
            className={[
              "max-w-[650px] font-black uppercase",
              "text-[clamp(2.75rem,12vw,4.5rem)]",
              "leading-[0.94] tracking-[-0.055em]",
              "drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]",
              "md:text-[clamp(4rem,6.5vw,6rem)]",
            ].join(" ")}
          >
            <span className="block">
              {t("Hero.titleFirstLine")}
            </span>

            <span className="block">
              {t("Hero.titleSecondLine")}
            </span>

            <span className="block text-[#f36c16]">
              {t("Hero.titleHighlight")}
            </span>
          </h1>

          {/* Description */}

          <p className="mt-6 max-w-[550px] text-[1rem] leading-7 text-white/88 drop-shadow-md sm:text-[1.05rem] sm:leading-8 md:text-lg">
            {t("Hero.description")}
          </p>

          {/* Boutons */}

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={homeContent.links.donation}
              className="button-primary group w-full sm:w-auto"
            >
              <Heart
                aria-hidden="true"
                size={18}
                fill="currentColor"
              />

              <span>{t("Hero.donateButton")}</span>

              <ArrowRight
                aria-hidden="true"
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            <Link
              href={homeContent.links.actions}
              className="button-dark group w-full sm:w-auto"
            >
              <span>
                {t("Hero.discoverActionsButton")}
              </span>

              <ArrowRight
                aria-hidden="true"
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Élément de confiance */}

          <div className="mt-7 flex max-w-lg items-start gap-3 text-sm leading-6 text-white/72">
            <ShieldCheck
              aria-hidden="true"
              size={20}
              className="mt-0.5 shrink-0 text-[#50d0d8]"
            />

            <span>
              {language === "fr"
                ? "Des actions réelles, documentées et menées au plus près des communautés."
                : "Real, documented actions carried out alongside local communities."}
            </span>
          </div>
        </div>
      </div>

      {/* Courbe blanche inférieure visible sur la maquette mobile */}

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute -bottom-1 left-1/2 z-20",
          "h-8 w-[115%] -translate-x-1/2",
          "rounded-[50%_50%_0_0/100%_100%_0_0]",
          "bg-white",
          "sm:h-10 md:hidden",
        ].join(" ")}
      />
    </section>
  );
}