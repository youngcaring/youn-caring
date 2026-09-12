"use client";

import {
  HandHeart,
  Home,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { getVerifiedActionStatistics } from "@/data/actions";
import type { ActionStatisticId } from "@/types/action";

const statisticIcons: Record<
  ActionStatisticId,
  LucideIcon
> = {
  peopleHelped: Users,
  projectsCompleted: HandHeart,
  communitiesReached: Home,
  familiesHelped: Users,
};

export default function ActionsStatistics() {
  const { language, t } = useLanguage();

  const statistics = getVerifiedActionStatistics();

  if (statistics.length === 0) {
    return null;
  }

  const locale =
    language === "fr" ? "fr-FR" : "en-US";

  return (
    <section
      aria-label={t(
        "ActionsPage.statistics.sectionLabel"
      )}
      className={[
        "relative z-20 bg-white",
        "border-b border-[#e3e9ea]",
        "shadow-[0_12px_30px_rgba(7,31,33,0.07)]",
      ].join(" ")}
    >
      <div
        className={[
          "site-container grid grid-cols-2",
          "py-3 sm:py-4 lg:grid-cols-4",
        ].join(" ")}
      >
        {statistics.map((statistic, index) => {
          const Icon = statisticIcons[statistic.id];

          return (
            <article
              key={statistic.id}
              className={[
                "flex min-w-0 items-center gap-3",
                "px-3 py-4 sm:px-5",
                index % 2 !== 0
                  ? "border-l border-[#e3e9ea]"
                  : "",
                index >= 2
                  ? "border-t border-[#e3e9ea] lg:border-t-0"
                  : "",
                index > 0
                  ? "lg:border-l lg:border-[#e3e9ea]"
                  : "",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-11 w-11 shrink-0",
                  "place-items-center rounded-2xl",
                  index % 2 === 0
                    ? "bg-[#eaf8f9] text-[#0097a7]"
                    : "bg-[#fff1e8] text-[#f36c16]",
                ].join(" ")}
              >
                <Icon
                  aria-hidden="true"
                  size={23}
                  strokeWidth={2}
                />
              </span>

              <div className="min-w-0">
                <strong className="block text-xl font-black leading-none text-[#101719] sm:text-2xl">
                  {new Intl.NumberFormat(locale).format(
                    statistic.value ?? 0
                  )}
                  {statistic.suffix}
                </strong>

                <span className="mt-1 block text-[0.7rem] leading-4 text-[#5f6d70] sm:text-xs">
                  {t(statistic.translationKey)}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}