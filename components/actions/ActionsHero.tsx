"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";
import { actionsPageImages } from "@/data/actions";

export default function ActionsHero() {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="actions-hero-title"
      className={[
        "relative isolate overflow-hidden",
        "min-h-[520px] bg-[#091719] text-white",
        "md:min-h-[430px]",
      ].join(" ")}
    >
      <Image
        src={actionsPageImages.heroDesktop}
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="hidden object-cover object-center md:block"
      />

      <Image
        src={actionsPageImages.heroMobile}
        alt=""
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-center md:hidden"
      />

      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 -z-0",
          "bg-[linear-gradient(90deg,rgba(4,19,21,0.94)_0%,rgba(4,19,21,0.72)_52%,rgba(4,19,21,0.28)_100%)]",
          "md:bg-[linear-gradient(90deg,rgba(4,19,21,0.93)_0%,rgba(4,19,21,0.66)_48%,rgba(4,19,21,0.15)_100%)]",
        ].join(" ")}
      />

      <div
        className={[
          "site-container relative z-10",
          "flex min-h-[520px] items-end",
          "pb-12 pt-24",
          "md:min-h-[430px] md:items-center md:py-16",
        ].join(" ")}
      >
        <div className="max-w-[680px] animate-fade-up">
          <p
            className={[
              "inline-flex items-center gap-2",
              "text-xs font-black uppercase",
              "tracking-[0.12em] text-white",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className="h-0.5 w-8 rounded-full bg-[#f36c16]"
            />

            {t("ActionsPage.hero.label")}
          </p>

          <h1
            id="actions-hero-title"
            className={[
              "mt-4 max-w-[650px]",
              "text-[clamp(2.5rem,6vw,4.8rem)]",
              "font-black leading-[0.98]",
              "tracking-[-0.045em]",
            ].join(" ")}
          >
            {t("ActionsPage.hero.titleStart")}{" "}
            <span className="text-[#f36c16]">
              {t("ActionsPage.hero.titleHighlight")}
            </span>
          </h1>

          <p className="mt-5 max-w-[580px] text-base leading-7 text-white/85 md:text-lg">
            {t("ActionsPage.hero.description")}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#actions-list"
              className="button-primary"
            >
              {t("ActionsPage.hero.discoverButton")}

              <ArrowRight
                aria-hidden="true"
                size={18}
              />
            </Link>

            <Link
              href={siteConfig.navigation.donation}
              className="button-dark"
            >
              <Heart
                aria-hidden="true"
                size={18}
                fill="currentColor"
              />

              {t("ActionsPage.hero.donateButton")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}