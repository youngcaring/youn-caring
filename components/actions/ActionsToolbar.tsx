"use client";

"use client";

import type { ChangeEvent } from "react";
import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { ActionSortOption } from "@/types/action";

type ActionsToolbarProps = Readonly<{
  search: string;
  sort: ActionSortOption;
  resultsCount: number;
  onSearchChange: (value: string) => void;
  onSortChange: (value: ActionSortOption) => void;
}>;

const MAX_SEARCH_LENGTH = 80;

function isSortOption(
  value: string
): value is ActionSortOption {
  return (
    value === "newest" ||
    value === "oldest" ||
    value === "titleAscending"
  );
}

export default function ActionsToolbar({
  search,
  sort,
  resultsCount,
  onSearchChange,
  onSortChange,
}: ActionsToolbarProps) {
  const { t } = useLanguage();

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    onSearchChange(
      event.target.value.slice(0, MAX_SEARCH_LENGTH)
    );
  };

  const handleSortChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    if (isSortOption(event.target.value)) {
      onSortChange(event.target.value);
    }
  };

  return (
    <div
      className={[
        "flex flex-col gap-3",
        "md:flex-row md:items-center",
        "md:justify-between",
      ].join(" ")}
    >
      <p
        aria-live="polite"
        className="text-sm font-semibold text-[#5f6d70]"
      >
        {t("ActionsPage.toolbar.results", {
          count: resultsCount,
        })}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative block sm:w-[310px]">
          <span className="sr-only">
            {t("ActionsPage.toolbar.searchLabel")}
          </span>

          <Search
            aria-hidden="true"
            size={18}
            className={[
              "pointer-events-none absolute",
              "left-4 top-1/2 -translate-y-1/2",
              "text-[#647275]",
            ].join(" ")}
          />

          <input
            type="search"
            name="action-search"
            value={search}
            onChange={handleSearchChange}
            maxLength={MAX_SEARCH_LENGTH}
            autoComplete="off"
            placeholder={t(
              "ActionsPage.toolbar.searchPlaceholder"
            )}
            className={[
              "h-12 w-full rounded-full",
              "border border-[#dfe7e8] bg-white",
              "pl-11 pr-4 text-sm text-[#101719]",
              "outline-none transition",
              "placeholder:text-[#7d898b]",
              "focus:border-[#0097a7]",
              "focus:ring-4 focus:ring-[#0097a7]/10",
            ].join(" ")}
          />
        </label>

        <label className="relative block sm:w-[190px]">
          <span className="sr-only">
            {t("ActionsPage.toolbar.sortLabel")}
          </span>

          <SlidersHorizontal
            aria-hidden="true"
            size={17}
            className={[
              "pointer-events-none absolute",
              "left-4 top-1/2 -translate-y-1/2",
              "text-[#647275]",
            ].join(" ")}
          />

          <select
            name="action-sort"
            value={sort}
            onChange={handleSortChange}
            className={[
              "h-12 w-full appearance-none",
              "rounded-full border",
              "border-[#dfe7e8] bg-white",
              "pl-11 pr-9 text-sm font-semibold",
              "text-[#101719] outline-none",
              "transition focus:border-[#0097a7]",
              "focus:ring-4 focus:ring-[#0097a7]/10",
            ].join(" ")}
          >
            <option value="newest">
              {t("ActionsPage.toolbar.newest")}
            </option>

            <option value="oldest">
              {t("ActionsPage.toolbar.oldest")}
            </option>

            <option value="titleAscending">
              {t(
                "ActionsPage.toolbar.titleAscending"
              )}
            </option>
          </select>

          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute",
              "right-4 top-1/2 -translate-y-1/2",
              "text-xs text-[#647275]",
            ].join(" ")}
          >
            ▼
          </span>
        </label>
      </div>
    </div>
  );
}