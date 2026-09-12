"use client";

import Link from "next/link";
import {
  ArrowRight,
  HandHeart,
  Heart,
  Mail,
  Users,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

const supportMethods = [
  {
    titleFr: "Faire un don",
    titleEn: "Make a donation",
    descriptionFr:
      "Contribuez au financement des prochaines actions de Young Caring.",
    descriptionEn:
      "Contribute to funding Young Caring’s future actions.",
    href: "/contact?subject=donation",
    icon: Heart,
    primary: true,
  },
  {
    titleFr: "Devenir bénévole",
    titleEn: "Become a volunteer",
    descriptionFr:
      "Mettez votre temps et vos compétences au service des actions.",
    descriptionEn:
      "Use your time and skills to support our actions.",
    href: "/contact?subject=volunteer",
    icon: Users,
    primary: false,
  },
  {
    titleFr: "Proposer un partenariat",
    titleEn: "Propose a partnership",
    descriptionFr:
      "Construisons ensemble un partenariat utile et responsable.",
    descriptionEn:
      "Let us build a useful and responsible partnership together.",
    href: "/contact?subject=partnership",
    icon: HandHeart,
    primary: false,
  },
  {
    titleFr: "Contacter l’organisation",
    titleEn: "Contact the organisation",
    descriptionFr:
      "Posez vos questions directement à l’équipe Young Caring.",
    descriptionEn:
      "Ask your questions directly to the Young Caring team.",
    href: "/contact",
    icon: Mail,
    primary: false,
  },
] as const;

export default function DonationMethodsSection() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      id="faire-un-don"
      aria-labelledby="support-methods-title"
      className="site-section scroll-mt-32 bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {isFrench
              ? "Agir avec nous"
              : "Take action with us"}
          </p>

          <h2
            id="support-methods-title"
            className="section-title"
          >
            {isFrench
              ? "Plusieurs manières de "
              : "Several ways to "}

            <span className="text-[#0097a7]">
              {isFrench
                ? "nous soutenir"
                : "support us"}
            </span>
          </h2>

          <p className="section-description">
            {isFrench
              ? "Choisissez la forme de contribution qui correspond à votre disponibilité et à vos possibilités."
              : "Choose the form of contribution that suits your availability and possibilities."}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {supportMethods.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.titleFr}
                className={[
                  "flex h-full flex-col",
                  "rounded-[26px] border p-6",
                  item.primary
                    ? "border-[#f36c16] bg-[#fff7f1]"
                    : "border-[#e0e8e9] bg-white",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-12 w-12",
                    "place-items-center rounded-2xl",
                    item.primary
                      ? "bg-[#f36c16] text-white"
                      : "bg-[#e8f7f8] text-[#007d88]",
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden="true"
                    size={23}
                    fill={
                      item.primary
                        ? "currentColor"
                        : "none"
                    }
                  />
                </span>

                <h3 className="mt-5 text-xl font-black text-[#101719]">
                  {isFrench
                    ? item.titleFr
                    : item.titleEn}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#5f6d70]">
                  {isFrench
                    ? item.descriptionFr
                    : item.descriptionEn}
                </p>

                <Link
                  href={item.href}
                  className={[
                    "mt-auto inline-flex",
                    "items-center gap-2 pt-6",
                    "text-sm font-extrabold",
                    "text-[#007d88]",
                    "transition hover:text-[#f36c16]",
                    "focus-visible:rounded-md",
                    "focus-visible:outline-none",
                    "focus-visible:ring-4",
                    "focus-visible:ring-[#0097a7]/20",
                  ].join(" ")}
                >
                  {isFrench
                    ? "Continuer"
                    : "Continue"}

                  <ArrowRight
                    aria-hidden="true"
                    size={17}
                  />
                </Link>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-sm leading-6 text-[#647275]">
          {isFrench
            ? "Les informations de paiement seront communiquées uniquement par les canaux officiels de Young Caring."
            : "Payment information will only be communicated through Young Caring’s official channels."}
        </p>
      </div>
    </section>
  );
}