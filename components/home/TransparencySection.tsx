"use client";

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  FileCheck2,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { homeContent } from "@/data/home";

export default function TransparencySection() {
  const { language, t } = useLanguage();

  const content =
    language === "fr"
      ? {
          title: "La transparence au cœur de nos actions",
          description:
            "Young Caring s’engage à documenter ses actions et à publier les résultats disponibles afin de permettre aux donateurs, partenaires et communautés de suivre l’impact de leur soutien.",
          evidenceTitle: "Actions documentées",
          evidenceDescription:
            "Des photographies et informations réelles permettent de présenter le travail réalisé sur le terrain.",
          resultsTitle: "Résultats vérifiables",
          resultsDescription:
            "Les résultats confirmés sont communiqués sans inventer de chiffres, de partenaires ou de bénéficiaires.",
          reportsTitle: "Rapports accessibles",
          reportsDescription:
            "Les rapports et justificatifs sont rendus accessibles dès qu’ils sont vérifiés et publiés.",
          button: "Consulter la transparence",
          buttonLabel:
            "Consulter les rapports et les informations de transparence de Young Caring",
        }
      : {
          title: "Transparency at the heart of our actions",
          description:
            "Young Caring is committed to documenting its actions and publishing available results so that donors, partners and communities can follow the impact of their support.",
          evidenceTitle: "Documented actions",
          evidenceDescription:
            "Real photographs and information are used to present the work carried out in the field.",
          resultsTitle: "Verifiable results",
          resultsDescription:
            "Confirmed results are communicated without inventing figures, partners or beneficiaries.",
          reportsTitle: "Accessible reports",
          reportsDescription:
            "Reports and supporting documents are made available once they have been verified and published.",
          button: "View transparency",
          buttonLabel:
            "View Young Caring reports and transparency information",
        };

  const commitments = [
    {
      id: "documented-actions",
      icon: Camera,
      title: content.evidenceTitle,
      description: content.evidenceDescription,
      color: "turquoise",
    },
    {
      id: "verified-results",
      icon: ShieldCheck,
      title: content.resultsTitle,
      description: content.resultsDescription,
      color: "orange",
    },
    {
      id: "accessible-reports",
      icon: FileText,
      title: content.reportsTitle,
      description: content.reportsDescription,
      color: "turquoise",
    },
  ] as const;

  return (
    <section
      id="transparence"
      aria-labelledby="transparency-section-title"
      className="site-section relative overflow-hidden bg-white"
    >
      {/* Décoration discrète */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#eaf8f9] blur-3xl"
      />

      <div className="site-container relative z-10">
        <div
          className={[
            "relative overflow-hidden",
            "rounded-[28px] border border-[#e3e9ea]",
            "bg-white p-6",
            "shadow-[0_18px_50px_rgba(7,31,33,0.07)]",
            "sm:p-8 md:rounded-[34px] md:p-10",
            "lg:p-12",
          ].join(" ")}
        >
          {/* Accent supérieur */}

          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0097a7_0%,#0097a7_72%,#f36c16_72%,#f36c16_100%)]"
          />

          {/* Présentation */}

          <div className="grid gap-7 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
            <span
              aria-hidden="true"
              className="grid h-16 w-16 place-items-center rounded-2xl bg-[#eaf8f9] text-[#007d88] sm:h-[72px] sm:w-[72px]"
            >
              <ShieldCheck
                size={36}
                strokeWidth={1.9}
              />
            </span>

            <div>
              <p className="section-label">
                {t("Common.transparency")}
              </p>

              <h2
                id="transparency-section-title"
                className="mt-2 max-w-3xl text-2xl font-black leading-tight tracking-[-0.035em] text-[#101719] sm:text-3xl lg:text-4xl"
              >
                {content.title}
              </h2>

              <p className="mt-4 max-w-3xl text-[0.95rem] leading-7 text-[#5f6d70]">
                {content.description}
              </p>
            </div>

            <Link
              href={homeContent.links.transparency}
              aria-label={content.buttonLabel}
              className="button-secondary group w-full lg:w-auto"
            >
              <FileCheck2
                aria-hidden="true"
                size={18}
              />

              <span>{content.button}</span>

              <ArrowRight
                aria-hidden="true"
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Engagements de transparence */}

          <div className="mt-9 grid gap-4 border-t border-[#e3e9ea] pt-8 md:grid-cols-3">
            {commitments.map((commitment) => {
              const Icon = commitment.icon;

              const iconStyle =
                commitment.color === "orange"
                  ? "bg-[#fff1e8] text-[#f36c16]"
                  : "bg-[#eaf8f9] text-[#007d88]";

              return (
                <article
                  key={commitment.id}
                  className="rounded-2xl bg-[#f7f9f9] p-5"
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "grid h-11 w-11 place-items-center",
                      "rounded-xl",
                      iconStyle,
                    ].join(" ")}
                  >
                    <Icon
                      size={21}
                      strokeWidth={2}
                    />
                  </span>

                  <h3 className="mt-4 text-base font-black text-[#101719]">
                    {commitment.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#5f6d70]">
                    {commitment.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}