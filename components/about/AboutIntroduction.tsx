"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";
import {
  aboutImages,
  getLocalizedPresentation,
} from "@/data/about";

export default function AboutIntroduction() {
  const { language } = useLanguage();
  const content =
    getLocalizedPresentation(language);

  const texts =
    language === "fr"
      ? {
          label: "Notre engagement",
          titleStart: "Une présence humaine",
          titleHighlight: "auprès des plus vulnérables",
          imageAlt:
            "Un membre de Young Caring échangeant avec un enfant",
          commitments: [
            "Agir avec bienveillance et respect",
            "Apporter un accompagnement adapté",
            "Favoriser l’éducation et l’autonomie",
          ],
          button: "Découvrir nos actions",
        }
      : {
          label: "Our commitment",
          titleStart: "A caring presence",
          titleHighlight:
            "alongside vulnerable people",
          imageAlt:
            "A Young Caring member speaking with a child",
          commitments: [
            "Act with kindness and respect",
            "Provide appropriate support",
            "Promote education and independence",
          ],
          button: "Discover our actions",
        };

  return (
    <section className="site-section bg-white">
      <div className="site-container grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[36px_36px_80px_36px] bg-[#eaf1f2] shadow-[0_22px_55px_rgba(7,31,33,0.12)]">
            <Image
              src={aboutImages.introduction}
              alt={texts.imageAlt}
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          <div className="absolute -bottom-5 right-5 max-w-[250px] rounded-[22px] border border-white/30 bg-[#0097a7] p-5 text-white shadow-[0_16px_35px_rgba(0,151,167,0.25)] sm:right-8">
            <p className="text-sm font-bold leading-6">
              {content.commitment}
            </p>
          </div>
        </div>

        <div className="pt-8 lg:pt-0">
          <p className="section-label">
            {texts.label}
          </p>

          <h2 className="section-title">
            {texts.titleStart}{" "}
            <span className="text-[#0097a7]">
              {texts.titleHighlight}
            </span>
          </h2>

          <p className="mt-5 text-base leading-8 text-[#5f6d70]">
            {content.description}
          </p>

          <ul className="mt-7 space-y-4">
            {texts.commitments.map((commitment) => (
              <li
                key={commitment}
                className="flex items-start gap-3 text-base font-bold text-[#263336]"
              >
                <CheckCircle2
                  aria-hidden="true"
                  size={21}
                  className="mt-0.5 shrink-0 text-[#f36c16]"
                />

                {commitment}
              </li>
            ))}
          </ul>

          <Link
            href={siteConfig.navigation.actions}
            className="button-secondary mt-8"
          >
            {texts.button}

            <ArrowRight
              aria-hidden="true"
              size={18}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}