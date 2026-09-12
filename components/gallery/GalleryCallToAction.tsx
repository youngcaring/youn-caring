"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MessageCircle,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";
import { galleryImages } from "@/data/gallery";

export default function GalleryCallToAction() {
  const { language } = useLanguage();

  const content =
    language === "fr"
      ? {
          label: "Agissons ensemble",
          titleStart: "Derrière chaque image,",
          titleHighlight: "une action concrète",
          description:
            "Découvrez les interventions de Young Caring et contactez notre équipe pour contribuer aux prochaines actions.",
          actionsButton: "Voir nos actions",
          contactButton: "Nous contacter",
          imageAlt:
            "Une action de solidarité menée par Young Caring",
        }
      : {
          label: "Let’s act together",
          titleStart: "Behind every picture,",
          titleHighlight: "there is real action",
          description:
            "Discover Young Caring’s initiatives and contact our team to contribute to future activities.",
          actionsButton: "View our actions",
          contactButton: "Contact us",
          imageAlt:
            "A solidarity initiative carried out by Young Caring",
        };

  return (
    <section className="bg-white px-4 py-10 sm:px-0 sm:py-14">
      <div className="site-container">
        <div className="relative isolate overflow-hidden rounded-[32px] bg-[#091719] px-6 py-12 text-white shadow-[0_22px_55px_rgba(7,31,33,0.16)] sm:px-10 lg:px-14 lg:py-16">
          <Image
            src={galleryImages.callToAction}
            alt={content.imageAlt}
            fill
            sizes="100vw"
            className="-z-20 object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,19,21,0.97)_0%,rgba(4,19,21,0.87)_55%,rgba(0,151,167,0.58)_100%)]"
          />

          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.1em] text-[#f36c16]">
              {content.label}
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              {content.titleStart}{" "}
              <span className="text-[#f36c16]">
                {content.titleHighlight}
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
              {content.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={siteConfig.navigation.actions}
                className="button-primary"
              >
                <Heart
                  aria-hidden="true"
                  size={18}
                  fill="currentColor"
                />

                {content.actionsButton}

                <ArrowRight
                  aria-hidden="true"
                  size={18}
                />
              </Link>

              <Link
                href={siteConfig.navigation.contact}
                className="button-dark"
              >
                <MessageCircle
                  aria-hidden="true"
                  size={18}
                />

                {content.contactButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}