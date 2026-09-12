"use client";

import {
  BookOpen,
  Boxes,
  HandHeart,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { newsCategories } from "@/data/news";
import type { NewsCategoryId } from "@/types/news";

type NewsCategoriesProps = Readonly<{
  selected: NewsCategoryId;
  onSelect: (category: NewsCategoryId) => void;
}>;

const categoryIcons: Record<
  NewsCategoryId,
  LucideIcon
> = {
  all: Newspaper,
  children: Users,
  donations: Boxes,
  community: HandHeart,
  volunteers: Users,
  education: BookOpen,
};

export default function NewsCategories({
  selected,
  onSelect,
}: NewsCategoriesProps) {
  const { language } = useLanguage();

  const navigationLabel =
    language === "fr"
      ? "Catégories des actualités"
      : "News categories";

  return (
    <nav aria-label={navigationLabel}>
      <ul
        className={[
          "flex gap-2 overflow-x-auto pb-2",
          "scroll-smooth",
          "overscroll-x-contain",
          "[scrollbar-width:none]",
          "[&::-webkit-scrollbar]:hidden",
          "lg:flex-wrap lg:overflow-visible",
        ].join(" ")}
      >
        {newsCategories.map((category) => {
          const active =
            selected === category.id;

          const Icon =
            categoryIcons[category.id];

          const categoryLabel =
            language === "fr"
              ? category.labelFr
              : category.labelEn;

          return (
            <li
              key={category.id}
              className="shrink-0"
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onSelect(category.id)
                }
                className={[
                  "inline-flex min-h-11",
                  "items-center justify-center gap-2",
                  "whitespace-nowrap rounded-full",
                  "border px-4",
                  "text-xs font-extrabold",
                  "transition-all duration-200",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4",
                  "focus-visible:ring-[#0097a7]/20",
                  active
                    ? [
                        "border-[#0097a7]",
                        "bg-[#0097a7]",
                        "text-white",
                        "shadow-[0_8px_20px_rgba(0,151,167,0.20)]",
                      ].join(" ")
                    : [
                        "border-[#dfe7e8]",
                        "bg-white",
                        "text-[#334144]",
                        "hover:border-[#0097a7]",
                        "hover:bg-[#f4fbfb]",
                        "hover:text-[#007d88]",
                      ].join(" "),
                ].join(" ")}
              >
                <Icon
                  aria-hidden="true"
                  size={16}
                  strokeWidth={active ? 2.4 : 2}
                />

                <span>{categoryLabel}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}