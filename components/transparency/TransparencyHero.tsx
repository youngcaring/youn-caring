"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  Heart,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  getLocalizedTransparencyText,
  transparencyPageData,
} from "@/data/transparency";

export default function TransparencyHero() {
  const { language } = useLanguage();

  const content =
    transparencyPageData.hero;

  const label =
    getLocalizedTransparencyText(
      content.label,
      language
    );

  const title =
    getLocalizedTransparencyText(
      content.title,
      language
    );

  const description =
    getLocalizedTransparencyText(
      content.description,
      language
    );

  const primaryButton =
    getLocalizedTransparencyText(
      content.primaryButton,
      language
    );

  const secondaryButton =
    getLocalizedTransparencyText(
      content.secondaryButton,
      language
    );

  const assurance =
    getLocalizedTransparencyText(
      content.assurance,
      language
    );

  return (
    <section
      aria-labelledby="transparency-hero-title"
      className={[
        "relative isolate overflow-hidden",
        "bg-[#091719] text-white",
      ].join(" ")}
    >
      {/*
       * L’image est décorative : les informations
       * importantes sont déjà présentes dans le texte.
       */}
      <Image
        src={transparencyPageData.images.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className={[
          "-z-20",
          "object-cover object-center",
        ].join(" ")}
      />

      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 -z-10",
          "bg-[linear-gradient(90deg,rgba(4,19,21,0.97)_0%,rgba(4,19,21,0.84)_48%,rgba(4,19,21,0.42)_100%)]",
        ].join(" ")}
      />

      <div
        className={[
          "site-container",
          "relative z-10",
          "flex min-h-[520px]",
          "items-end pb-14 pt-28",
          "md:min-h-[600px]",
          "md:items-center md:py-24",
        ].join(" ")}
      >
        <div className="max-w-3xl">
          <p className="section-label !text-[#f36c16]">
            {label}
          </p>

          <h1
            id="transparency-hero-title"
            className={[
              "mt-4",
              "text-[clamp(2.7rem,7vw,5.5rem)]",
              "font-black leading-[0.96]",
              "tracking-[-0.05em]",
            ].join(" ")}
          >
            {title}
          </h1>

          <p
            className={[
              "mt-6 max-w-2xl",
              "text-base leading-7",
              "text-white/80",
              "md:text-lg",
            ].join(" ")}
          >
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#faire-un-don"
              className="button-primary"
            >
              <Heart
                aria-hidden="true"
                size={18}
                fill="currentColor"
              />

              {primaryButton}
            </Link>

            <Link
              href="#engagements"
              className={[
                "inline-flex min-h-12",
                "items-center justify-center",
                "gap-2 rounded-full",
                "border border-white/40",
                "px-6 text-sm font-extrabold",
                "text-white transition",
                "hover:border-white",
                "hover:bg-white/10",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-white/25",
              ].join(" ")}
            >
              <ArrowDown
                aria-hidden="true"
                size={18}
              />

              {secondaryButton}
            </Link>
          </div>

          <div
            className={[
              "mt-8 flex",
              "max-w-2xl items-start",
              "gap-3 text-sm",
              "leading-6 text-white/75",
            ].join(" ")}
          >
            <ShieldCheck
              aria-hidden="true"
              size={20}
              className={[
                "mt-0.5 shrink-0",
                "text-[#42d1dc]",
              ].join(" ")}
            />

            <p>{assurance}</p>
          </div>
        </div>
      </div>
    </section>
  );
}