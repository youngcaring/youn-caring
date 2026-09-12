"use client";

import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BookOpen,
  HandHeart,
  HeartPulse,
  Images,
  Users,
  UsersRound,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { galleryCategories } from "@/data/gallery";
import type { GalleryCategoryId } from "@/types/gallery";

type GalleryCategoriesProps = Readonly<{
  selectedCategory: GalleryCategoryId;
  onSelectCategory: (
    category: GalleryCategoryId
  ) => void;
}>;

const categoryIcons: Record<
  GalleryCategoryId,
  LucideIcon
> = {
  all: Images,
  education: BookOpen,
  children: Baby,
  solidarity: HandHeart,
  health: HeartPulse,
  community: Users,
  volunteers: UsersRound,
};

export default function GalleryCategories({
  selectedCategory,
  onSelectCategory,
}: GalleryCategoriesProps) {
  const { language } = useLanguage();

  const accessibilityLabel =
    language === "fr"
      ? "Filtrer les photographies par catégorie"
      : "Filter photographs by category";

  return (
    <div
      role="group"
      aria-label={accessibilityLabel}
      className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {galleryCategories.map((category) => {
        const Icon = categoryIcons[category.id];
        const active =
          selectedCategory === category.id;

        const label =
          language === "fr"
            ? category.labelFr
            : category.labelEn;

        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onSelectCategory(category.id)
            }
            className={[
              "inline-flex min-h-11 shrink-0",
              "items-center justify-center gap-2",
              "rounded-full border px-4",
              "text-sm font-extrabold",
              "transition duration-200",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#0097a7]/20",
              active
                ? "border-[#0097a7] bg-[#0097a7] text-white shadow-[0_8px_20px_rgba(0,151,167,0.2)]"
                : "border-[#dfe7e8] bg-white text-[#334144] hover:border-[#0097a7] hover:text-[#007d88]",
            ].join(" ")}
          >
            <Icon
              aria-hidden="true"
              size={16}
            />

            {label}
          </button>
        );
      })}
    </div>
  );
}