"use client";

import Image from "next/image";
import { ArrowDown, Images } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { galleryImages } from "@/data/gallery";

export default function GalleryHero() {
  const { language } = useLanguage();

  const content =
    language === "fr"
      ? {
          label: "Notre galerie",
          titleStart: "Nos actions",
          titleHighlight: "en images",
          description:
            "Découvrez les moments de partage, de solidarité et d’engagement vécus aux côtés des enfants, des familles et des communautés.",
          button: "Découvrir les photos",
          imageAlt:
            "Une action solidaire organisée par Young Caring",
        }
      : {
          label: "Our gallery",
          titleStart: "Our work",
          titleHighlight: "in pictures",
          description:
            "Discover moments of sharing, solidarity and commitment alongside children, families and communities.",
          button: "Discover the photos",
          imageAlt:
            "A solidarity initiative organised by Young Caring",
        };

  return (
    <section
      aria-labelledby="gallery-hero-title"
      className="relative isolate min-h-[480px] overflow-hidden bg-[#091719] text-white md:min-h-[540px]"
    >
      <Image
        src={galleryImages.heroDesktop}
        alt={content.imageAlt}
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center md:block"
      />

      <Image
        src={galleryImages.heroMobile}
        alt={content.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center md:hidden"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-0 bg-[linear-gradient(90deg,rgba(4,19,21,0.96)_0%,rgba(4,19,21,0.76)_55%,rgba(4,19,21,0.28)_100%)]"
      />

      <div className="site-container relative z-10 flex min-h-[480px] items-end pb-14 pt-28 md:min-h-[540px] md:items-center md:py-20">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] text-[#f36c16]">
            <Images
              aria-hidden="true"
              size={18}
            />

            {content.label}
          </p>

          <h1
            id="gallery-hero-title"
            className="mt-4 text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[0.95] tracking-[-0.05em]"
          >
            {content.titleStart}{" "}
            <span className="text-[#f36c16]">
              {content.titleHighlight}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg md:leading-8">
            {content.description}
          </p>

          <a
            href="#gallery-list"
            className="button-primary mt-8"
          >
            {content.button}

            <ArrowDown
              aria-hidden="true"
              size={18}
            />
          </a>
        </div>
      </div>
    </section>
  );
}