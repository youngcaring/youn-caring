"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getLocalizedObjectives } from "@/data/about";
import type { AboutObjectiveId } from "@/types/about";

const objectiveIcons: Record<
  AboutObjectiveId,
  LucideIcon
> = {
  materialSupport: HandHeart,
  education: BookOpen,
  widowsTraining: GraduationCap,
  reintegration: BriefcaseBusiness,
  rightsProtection: Scale,
  discriminationPrevention: ShieldCheck,
  economicDevelopment: Building2,
  institutionalCooperation: Users,
  solidarityValues: HeartHandshake,
};

export default function ObjectivesSection() {
  const { language } = useLanguage();
  const objectives =
    getLocalizedObjectives(language);

  const texts =
    language === "fr"
      ? {
          label: "Nos objectifs",
          titleStart: "Des engagements",
          titleHighlight: "concrets et durables",
          description:
            "Ces objectifs sont issus du récépissé de déclaration de Young Caring / Jeune Bienveillant.",
        }
      : {
          label: "Our objectives",
          titleStart: "Practical and",
          titleHighlight:
            "sustainable commitments",
          description:
            "These objectives are based on the declaration receipt of Young Caring / Jeune Bienveillant.",
        };

  return (
    <section
      aria-labelledby="objectives-title"
      className="site-section bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">
            {texts.label}
          </p>

          <h2
            id="objectives-title"
            className="section-title"
          >
            {texts.titleStart}{" "}
            <span className="text-[#0097a7]">
              {texts.titleHighlight}
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5f6d70]">
            {texts.description}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {objectives.map((objective, index) => {
            const Icon =
              objectiveIcons[objective.id];

            return (
              <article
                key={objective.id}
                className="rounded-[26px] border border-[#e1e9ea] bg-white p-6 shadow-[0_12px_32px_rgba(7,31,33,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(7,31,33,0.1)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={[
                      "grid h-13 w-13 place-items-center",
                      "rounded-2xl text-white",
                      index % 3 === 1
                        ? "bg-[#f36c16]"
                        : "bg-[#0097a7]",
                    ].join(" ")}
                  >
                    <Icon
                      aria-hidden="true"
                      size={23}
                    />
                  </span>

                  <span className="text-3xl font-black text-[#e3e9ea]">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-black leading-tight text-[#101719]">
                  {objective.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#5f6d70]">
                  {objective.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}