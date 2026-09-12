"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  homeContent,
  homeImageMetadata,
} from "@/data/home";

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <section
      id="a-propos"
      aria-labelledby="about-section-title"
      className="site-section relative overflow-hidden bg-white"
    >
      {/* Décoration discrète */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 top-10 h-72 w-72 rounded-full bg-[#eaf8f9] blur-3xl"
      />

      <div className="site-container relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          {/* Contenu */}

          <div className="order-1">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf8f9] text-[#007d88]">
                <HeartHandshake
                  aria-hidden="true"
                  size={18}
                  strokeWidth={2.2}
                />
              </span>

              <p className="section-label">
                {t("About.label")}
              </p>
            </div>

            <h2
              id="about-section-title"
              className="section-title max-w-[680px]"
            >
              {t("About.titleStart")}{" "}

              <span className="text-[#0097a7]">
                {t("About.titleHighlight")}
              </span>
            </h2>

            <p className="section-description max-w-[620px]">
              {t("About.description")}
            </p>

            <Link
              href={homeContent.links.about}
              className="button-secondary group mt-7"
              aria-label={t("About.button")}
            >
              <span>{t("About.button")}</span>

              <ArrowRight
                aria-hidden="true"
                size={18}
                strokeWidth={2.2}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Image réelle Young Caring */}

          <div className="order-2">
            <div className="relative mx-auto max-w-[680px]">
              <div
                aria-hidden="true"
                className="absolute -bottom-5 -left-5 h-28 w-28 rounded-[30px] bg-[#0097a7] max-sm:-bottom-3 max-sm:-left-3 max-sm:h-20 max-sm:w-20"
              />

              <div
                aria-hidden="true"
                className="absolute -right-3 -top-3 grid grid-cols-4 gap-2 opacity-45 md:-right-5 md:-top-5"
              >
                {Array.from({ length: 16 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1.5 w-1.5 rounded-full bg-[#f36c16]"
                  />
                ))}
              </div>

              <figure className="relative aspect-[4/3] overflow-hidden rounded-[34px_34px_78px_34px] border border-[#e3e9ea] bg-[#f7f9f9] shadow-[0_22px_55px_rgba(7,31,33,0.12)] sm:rounded-[42px_42px_90px_42px]">
                <Image
                  src={homeImageMetadata.about.src}
                  alt={t("About.imageAlt")}
                  fill
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  quality={88}
                  className="object-cover object-center transition-transform duration-700 hover:scale-[1.025]"
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent"
                />

                <figcaption className="sr-only">
                  {t("About.imageAlt")}
                </figcaption>
              </figure>

              <div
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-20 w-20 rounded-tl-[50px] bg-[#0097a7] sm:h-24 sm:w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}