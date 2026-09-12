"use client";

import {
  Earth,
  HandHeart,
  Landmark,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { siteConfig } from "@/config/site";

type ImpactId =
  | "peopleHelped"
  | "projectsCompleted"
  | "fundsDistributed"
  | "communitiesReached";

type ImpactPresentation = Readonly<{
  icon: LucideIcon;
  accent: "turquoise" | "orange";
}>;

type VerifiedImpactStatistic = Readonly<{
  id: ImpactId;
  value: number;
}>;

const impactPresentations: Record<
  ImpactId,
  ImpactPresentation
> = {
  peopleHelped: {
    icon: Users,
    accent: "turquoise",
  },

  projectsCompleted: {
    icon: HandHeart,
    accent: "orange",
  },

  fundsDistributed: {
    icon: Landmark,
    accent: "turquoise",
  },

  communitiesReached: {
    icon: Earth,
    accent: "orange",
  },
};

export default function ImpactSection() {
  const { language, t } = useLanguage();

  const locale = language === "fr" ? "fr-FR" : "en-US";

  /*
   * Seules les valeurs officielles, positives et valides
   * peuvent apparaître sur le site.
   */

  const verifiedStatistics: VerifiedImpactStatistic[] =
    siteConfig.impactStatistics.flatMap((statistic) => {
      if (
        typeof statistic.value !== "number" ||
        !Number.isFinite(statistic.value) ||
        statistic.value < 0
      ) {
        return [];
      }

      return [
        {
          id: statistic.id,
          value: statistic.value,
        },
      ];
    });

  /*
   * La section n’apparaît pas tant qu’aucune statistique
   * réelle n’est enregistrée dans config/site.ts.
   */

  if (verifiedStatistics.length === 0) {
    return null;
  }

  const formatValue = (
    id: ImpactId,
    value: number
  ): string => {
    const formattedValue = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(value);

    if (id === "fundsDistributed") {
      return formattedValue;
    }

    return `${formattedValue}+`;
  };

  const getCardBorders = (index: number): string => {
    const mobileBorders = [
      "",
      "border-l border-[#e3e9ea]",
      "border-t border-[#e3e9ea]",
      "border-l border-t border-[#e3e9ea]",
    ];

    const desktopBorders = [
      "lg:border-0",
      "lg:border-l lg:border-t-0 lg:border-[#e3e9ea]",
      "lg:border-l lg:border-t-0 lg:border-[#e3e9ea]",
      "lg:border-l lg:border-t-0 lg:border-[#e3e9ea]",
    ];

    return `${mobileBorders[index] ?? ""} ${
      desktopBorders[index] ?? ""
    }`;
  };

  return (
    <section
      id="notre-impact"
      aria-labelledby="impact-section-title"
      className="relative border-b border-[#e3e9ea] bg-white"
    >
      <h2 id="impact-section-title" className="sr-only">
        {t("Impact.label")}
      </h2>

      <div
        className={[
          "site-container grid grid-cols-2",
          "py-5 sm:py-7 lg:grid-cols-4 lg:py-6",
        ].join(" ")}
      >
        {verifiedStatistics.map((statistic, index) => {
          const presentation =
            impactPresentations[statistic.id];

          const Icon = presentation.icon;

          const iconStyles =
            presentation.accent === "orange"
              ? "bg-[#fff1e8] text-[#f36c16]"
              : "bg-[#eaf8f9] text-[#0097a7]";

          return (
            <article
              key={statistic.id}
              className={[
                "flex min-h-[125px] flex-col",
                "items-center justify-center gap-3",
                "px-3 py-5 text-center",
                "sm:min-h-[135px]",
                "lg:min-h-[120px] lg:flex-row",
                "lg:gap-4 lg:px-6 lg:text-left",
                getCardBorders(index),
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "grid h-12 w-12 shrink-0",
                  "place-items-center rounded-2xl",
                  "sm:h-14 sm:w-14",
                  iconStyles,
                ].join(" ")}
              >
                <Icon
                  size={27}
                  strokeWidth={2}
                />
              </span>

              <div>
                <strong className="block text-[1.55rem] font-black leading-none tracking-[-0.035em] text-[#101719] sm:text-2xl xl:text-[1.8rem]">
                  {formatValue(
                    statistic.id,
                    statistic.value
                  )}
                </strong>

                <span className="mt-2 block text-xs leading-5 text-[#5f6d70] sm:text-sm">
                  {t(`Impact.${statistic.id}`)}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}