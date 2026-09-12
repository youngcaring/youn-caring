"use client";

import {
  CheckCircle2,
  Eye,
  FileCheck2,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

const commitments = [
  {
    titleFr: "Informations vérifiées",
    titleEn: "Verified information",
    descriptionFr:
      "Les informations importantes sont vérifiées avant leur publication.",
    descriptionEn:
      "Important information is verified before publication.",
    icon: FileCheck2,
  },
  {
    titleFr: "Communication claire",
    titleEn: "Clear communication",
    descriptionFr:
      "Les actions sont présentées de manière compréhensible et responsable.",
    descriptionEn:
      "Actions are presented clearly and responsibly.",
    icon: Eye,
  },
  {
    titleFr: "Respect des bénéficiaires",
    titleEn: "Respect for beneficiaries",
    descriptionFr:
      "La dignité, l’image et la vie privée des personnes sont respectées.",
    descriptionEn:
      "People’s dignity, image and privacy are respected.",
    icon: Users,
  },
  {
    titleFr: "Protection des données",
    titleEn: "Data protection",
    descriptionFr:
      "Les informations personnelles ne sont pas publiées sans justification.",
    descriptionEn:
      "Personal information is not published without justification.",
    icon: Lock,
  },
  {
    titleFr: "Documents accessibles",
    titleEn: "Accessible documents",
    descriptionFr:
      "Les documents officiels disponibles peuvent être consultés clairement.",
    descriptionEn:
      "Available official documents can be accessed clearly.",
    icon: ShieldCheck,
  },
  {
    titleFr: "Amélioration continue",
    titleEn: "Continuous improvement",
    descriptionFr:
      "Les pratiques de l’organisation évoluent avec ses responsabilités.",
    descriptionEn:
      "The organisation’s practices evolve with its responsibilities.",
    icon: CheckCircle2,
  },
] as const;

export default function TransparencyCommitments() {
  const { language } = useLanguage();
  const isFrench = language === "fr";

  return (
    <section
      id="engagements"
      aria-labelledby="commitments-title"
      className="site-section scroll-mt-32 bg-white"
    >
      <div className="site-container">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="section-label">
              {isFrench
                ? "Nos engagements"
                : "Our commitments"}
            </p>

            <h2
              id="commitments-title"
              className="section-title"
            >
              {isFrench
                ? "Une transparence fondée sur "
                : "Transparency based on "}

              <span className="text-[#0097a7]">
                {isFrench
                  ? "des principes clairs"
                  : "clear principles"}
              </span>
            </h2>

            <p className="section-description">
              {isFrench
                ? "Young Caring souhaite construire une relation durable avec les donateurs, bénévoles, partenaires et communautés."
                : "Young Caring aims to build lasting relationships with donors, volunteers, partners and communities."}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {commitments.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.titleFr}
                  className={[
                    "rounded-[24px]",
                    "border border-[#e0e8e9]",
                    "bg-[#f9fbfb] p-5",
                  ].join(" ")}
                >
                  <Icon
                    aria-hidden="true"
                    size={23}
                    className="text-[#0097a7]"
                  />

                  <h3 className="mt-4 font-black text-[#101719]">
                    {isFrench
                      ? item.titleFr
                      : item.titleEn}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#5f6d70]">
                    {isFrench
                      ? item.descriptionFr
                      : item.descriptionEn}
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