"use client";

import {
  ImageIcon,
  Search,
  X,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

type GalleryToolbarProps = Readonly<{
  search: string;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}>;

const MAX_SEARCH_LENGTH = 80;

export default function GalleryToolbar({
  search,
  resultCount,
  onSearchChange,
  onClearSearch,
}: GalleryToolbarProps) {
  const { language } = useLanguage();

  const content =
    language === "fr"
      ? {
          searchLabel:
            "Rechercher une photographie",
          placeholder:
            "Rechercher dans la galerie…",
          clear: "Effacer la recherche",
          singular: "photographie disponible",
          plural: "photographies disponibles",
        }
      : {
          searchLabel: "Search photographs",
          placeholder: "Search the gallery…",
          clear: "Clear search",
          singular: "photograph available",
          plural: "photographs available",
        };

  const resultLabel =
    resultCount === 1
      ? content.singular
      : content.plural;

  return (
    <div className="flex flex-col gap-4 border-y border-[#dfe7e8] py-5 md:flex-row md:items-center md:justify-between">
      <p
        aria-live="polite"
        className="flex items-center gap-2 text-sm font-bold text-[#526164]"
      >
        <ImageIcon
          aria-hidden="true"
          size={18}
          className="text-[#0097a7]"
        />

        <strong className="text-[#101719]">
          {resultCount}
        </strong>{" "}
        {resultLabel}
      </p>

      <label className="relative block w-full md:w-[340px]">
        <span className="sr-only">
          {content.searchLabel}
        </span>

        <Search
          aria-hidden="true"
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#647275]"
        />

        <input
          type="search"
          value={search}
          maxLength={MAX_SEARCH_LENGTH}
          onChange={(event) =>
            onSearchChange(
              event.target.value.slice(
                0,
                MAX_SEARCH_LENGTH
              )
            )
          }
          placeholder={content.placeholder}
          className="h-12 w-full rounded-full border border-[#dfe7e8] bg-white pl-11 pr-12 text-base text-[#101719] outline-none transition placeholder:text-[#7d898b] focus:border-[#0097a7] focus:ring-4 focus:ring-[#0097a7]/10"
        />

        {search.length > 0 && (
          <button
            type="button"
            onClick={onClearSearch}
            aria-label={content.clear}
            className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[#647275] transition hover:bg-[#eaf8f9] hover:text-[#007d88] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0097a7]/20"
          >
            <X
              aria-hidden="true"
              size={17}
            />
          </button>
        )}
      </label>
    </div>
  );
}