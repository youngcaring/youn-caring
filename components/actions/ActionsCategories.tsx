"use client";

import {
  Apple,
  BookOpen,
  Droplets,
  HeartPulse,
  PackageOpen,
  ShieldPlus,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { actionCategories } from "@/data/actions";
import type { ActionCategoryId } from "@/types/action";

type ActionsCategoriesProps = Readonly<{
  selectedCategory: ActionCategoryId;
  onSelectCategory: (
    category: ActionCategoryId
  ) => void;
}>;

const categoryIcons: Record<
  ActionCategoryId,
  LucideIcon
> = {
  all: Sparkles,
  education: BookOpen,
  foodSupport: Apple,
  health: HeartPulse,
  clothing: PackageOpen,
  children: Users,
  womenFamilies: Users,
  waterHygiene: Droplets,
  emergency: ShieldPlus,
};

export default function ActionsCategories({
  selectedCategory,
  onSelectCategory,
}: ActionsCategoriesProps) {
  const { t } = useLanguage();

  const sectionLabel = t(
    "ActionsPage.categories.sectionLabel"
  );

  return (
    <div className="relative">
      <div
        role="group"
        aria-label={sectionLabel}
        className={[
          "flex gap-2 overflow-x-auto pb-2",
          "scroll-smooth",
          "[scrollbar-width:none]",
          "[&::-webkit-scrollbar]:hidden",
          "lg:flex-wrap lg:overflow-visible",
        ].join(" ")}
      >
        {actionCategories.map((category) => {
          const Icon =
            categoryIcons[category.id];

          const active =
            selectedCategory === category.id;

          const categoryLabel = t(
            category.translationKey
          );

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              aria-label={categoryLabel}
              onClick={() =>
                onSelectCategory(category.id)
              }
              className={[
                "inline-flex min-h-11 shrink-0",
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
                      "shadow-[0_8px_20px_rgba(0,151,167,0.22)]",
                    ].join(" ")
                  : [
                      "border-[#dfe7e8]",
                      "bg-white",
                      "text-[#334144]",
                      "hover:border-[#0097a7]",
                      "hover:bg-[#eaf8f9]",
                      "hover:text-[#007d88]",
                    ].join(" "),
              ].join(" ")}
            >
              <Icon
                aria-hidden="true"
                size={16}
                strokeWidth={2}
                className="shrink-0"
              />

              <span>{categoryLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}