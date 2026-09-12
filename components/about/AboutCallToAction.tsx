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
import { aboutImages } from "@/data/about";

export default function AboutCallToAction() {
  const { language } = useLanguage();

  const texts =
    language === "fr"
      ? {
          label: "Agissons ensemble",
          titleStart: "Chaque geste peut",
          titleHighlight: "faire une différence",
          description:
            "Découvrez les actions de Young Caring et contactez notre équipe pour participer, collaborer ou soutenir les prochaines interventions.",
          actionsButton: "Découvrir nos actions",
          contactButton: "Nous contacter",
          imageAlt:
            "Une action solidaire de Young Caring auprès des communautés",
        }
      : {
          label: "Let’s act together",
          titleStart: "Every action can",
          titleHighlight: "make a difference",
          description:
            "Discover Young Caring’s work and contact our team to participate, collaborate or support upcoming initiatives.",
          actionsButton: "Discover our actions",
          contactButton: "Contact us",
          imageAlt:
            "A Young Caring solidarity initiative alongside communities",
        };

  return (
    <section className="bg-[#f7f9f9] px-4 py-10 sm:px-0 sm:py-14">
      <div className="site-container">
        <div className="relative isolate overflow-hidden rounded-[32px] bg-[#091719] px-6 py-12 text-white shadow-[0_22px_55px_rgba(7,31,33,0.16)] sm:px-10 lg:px-14 lg:py-16">
          <Image
            src={aboutImages.community}
            alt={texts.imageAlt}
            fill
            sizes="100vw"
            className="-z-20 object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,19,21,0.97)_0%,rgba(4,19,21,0.88)_55%,rgba(0,151,167,0.62)_100%)]"
          />

          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.1em] text-[#f36c16]">
              {texts.label}
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              {texts.titleStart}{" "}
              <span className="text-[#f36c16]">
                {texts.titleHighlight}
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
              {texts.description}
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

                {texts.actionsButton}

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

                {texts.contactButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}