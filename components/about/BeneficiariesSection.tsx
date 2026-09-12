"use client";

import Image from "next/image";
import {
  Baby,
  HeartHandshake,
  House,
  Users,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getLocalizedBeneficiaries } from "@/data/about";
import type { AboutBeneficiaryId } from "@/types/about";

const beneficiaryIcons: Record<
  AboutBeneficiaryId,
  LucideIcon
> = {
  children: Baby,
  orphans: HeartHandshake,
  widows: UserRound,
  families: House,
  communities: Users,
};

export default function BeneficiariesSection() {
  const { language } = useLanguage();
  const beneficiaries =
    getLocalizedBeneficiaries(language);

  const texts =
    language === "fr"
      ? {
          label: "Nos bénéficiaires",
          titleStart: "Agir aux côtés",
          titleHighlight:
            "des personnes et des communautés",
          description:
            "Young Caring concentre ses interventions sur les publics mentionnés dans les objectifs officiels de l’organisation.",
        }
      : {
          label: "Our beneficiaries",
          titleStart: "Working alongside",
          titleHighlight:
            "people and communities",
          description:
            "Young Caring focuses its work on the groups identified in the organisation’s official objectives.",
        };

  return (
    <section
      aria-labelledby="beneficiaries-title"
      className="site-section bg-white"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {texts.label}
          </p>

          <h2
            id="beneficiaries-title"
            className="section-title"
          >
            {texts.titleStart}{" "}
            <span className="text-[#0097a7]">
              {texts.titleHighlight}
            </span>
          </h2>

          <p className="section-description">
            {texts.description}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {beneficiaries.map(
            (beneficiary, index) => {
              const Icon =
                beneficiaryIcons[beneficiary.id];

              return (
                <article
                  key={beneficiary.id}
                  className={[
                    "content-card group overflow-hidden",
                    index === 0
                      ? "md:col-span-2 xl:col-span-1"
                      : "",
                  ].join(" ")}
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-[#eaf1f2]">
                    <Image
                      src={beneficiary.image}
                      alt={beneficiary.title}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                    />

                    <span
                      className={[
                        "absolute bottom-4 left-4",
                        "grid h-12 w-12 place-items-center",
                        "rounded-full text-white",
                        index % 2 === 0
                          ? "bg-[#0097a7]"
                          : "bg-[#f36c16]",
                      ].join(" ")}
                    >
                      <Icon
                        aria-hidden="true"
                        size={22}
                      />
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-black text-[#101719]">
                      {beneficiary.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#5f6d70]">
                      {beneficiary.description}
                    </p>
                  </div>
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}