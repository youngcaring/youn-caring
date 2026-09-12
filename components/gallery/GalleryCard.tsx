"use client";

import Image from "next/image";
import {
  Expand,
  Images,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  getGalleryCategoryLabel,
  getLocalizedGalleryItem,
} from "@/data/gallery";
import type { GalleryItem } from "@/types/gallery";

type GalleryCardProps = Readonly<{
  item: GalleryItem;
  onOpen: () => void;
}>;

export default function GalleryCard({
  item,
  onOpen,
}: GalleryCardProps) {
  const { language } = useLanguage();

  const content = getLocalizedGalleryItem(
    item,
    language
  );

  const categoryLabel = getGalleryCategoryLabel(
    item.category,
    language
  );

  const openLabel =
    language === "fr"
      ? `Agrandir la photographie : ${content.title}`
      : `Enlarge photograph: ${content.title}`;

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#e1e9ea] bg-white shadow-[0_14px_34px_rgba(7,31,33,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(7,31,33,0.12)]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={openLabel}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#0097a7]/30"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#eaf1f2]">
          <Image
            src={item.image}
            alt={content.imageAlt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#071f21]/70 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90"
          />

          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#0097a7] px-3 py-1.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(7,31,33,0.2)]">
            <Images
              aria-hidden="true"
              size={14}
            />

            {categoryLabel}
          </span>

          <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[#007d88] shadow-[0_10px_25px_rgba(7,31,33,0.25)] transition-transform duration-300 group-hover:scale-105">
            <Expand
              aria-hidden="true"
              size={19}
            />
          </span>

          <div className="absolute inset-x-0 bottom-0 p-5 pr-16 text-white">
            <h2 className="text-lg font-black leading-tight">
              {content.title}
            </h2>
          </div>
        </div>
      </button>

      <div className="p-5">
        <p className="text-sm leading-6 text-[#5f6d70]">
          {content.description}
        </p>
      </div>
    </article>
  );
}