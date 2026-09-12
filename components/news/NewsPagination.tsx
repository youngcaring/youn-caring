"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

type NewsPaginationProps = Readonly<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>;

/*
 * Limite l’affichage à cinq numéros de page.
 * Cela évite une pagination trop large sur téléphone.
 */

function createVisiblePages(
  currentPage: number,
  totalPages: number
): readonly number[] {
  if (totalPages <= 5) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  const firstVisiblePage = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4)
  );

  return Array.from(
    { length: 5 },
    (_, index) => firstVisiblePage + index
  );
}

export default function NewsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: NewsPaginationProps) {
  const { language } = useLanguage();

  if (
    !Number.isInteger(totalPages) ||
    totalPages <= 1
  ) {
    return null;
  }

  const safeCurrentPage = Math.min(
    Math.max(Math.trunc(currentPage), 1),
    totalPages
  );

  const visiblePages = createVisiblePages(
    safeCurrentPage,
    totalPages
  );

  const changePage = (nextPage: number): void => {
    if (
      !Number.isInteger(nextPage) ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === safeCurrentPage
    ) {
      return;
    }

    onPageChange(nextPage);

    document
      .getElementById("news-list")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const navigationLabel =
    language === "fr"
      ? "Pagination des actualités"
      : "News pagination";

  const previousLabel =
    language === "fr"
      ? "Page précédente"
      : "Previous page";

  const nextLabel =
    language === "fr"
      ? "Page suivante"
      : "Next page";

  const pageLabel = (page: number): string =>
    language === "fr"
      ? `Aller à la page ${page}`
      : `Go to page ${page}`;

  const navigationButtonClasses = [
    "grid h-10 w-10 shrink-0",
    "place-items-center rounded-full",
    "border border-[#dfe7e8]",
    "bg-white text-[#101719]",
    "transition-all duration-200",
    "hover:border-[#0097a7]",
    "hover:text-[#007d88]",
    "focus-visible:outline-none",
    "focus-visible:ring-4",
    "focus-visible:ring-[#0097a7]/20",
    "disabled:cursor-not-allowed",
    "disabled:opacity-35",
    "disabled:hover:border-[#dfe7e8]",
    "disabled:hover:text-[#101719]",
  ].join(" ");

  return (
    <nav
      aria-label={navigationLabel}
      className={[
        "mt-10 flex items-center",
        "justify-center gap-2",
      ].join(" ")}
    >
      <button
        type="button"
        disabled={safeCurrentPage === 1}
        onClick={() =>
          changePage(safeCurrentPage - 1)
        }
        aria-label={previousLabel}
        className={navigationButtonClasses}
      >
        <ChevronLeft
          aria-hidden="true"
          size={18}
        />
      </button>

      {visiblePages.map((page) => {
        const active =
          page === safeCurrentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => changePage(page)}
            aria-label={pageLabel(page)}
            aria-current={
              active ? "page" : undefined
            }
            className={[
              "grid h-10 min-w-10",
              "place-items-center rounded-full",
              "px-3 text-sm font-extrabold",
              "transition-all duration-200",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#0097a7]/20",
              active
                ? [
                    "bg-[#0097a7]",
                    "text-white",
                    "shadow-[0_7px_18px_rgba(0,151,167,0.22)]",
                  ].join(" ")
                : [
                    "border border-[#dfe7e8]",
                    "bg-white text-[#101719]",
                    "hover:border-[#0097a7]",
                    "hover:text-[#007d88]",
                  ].join(" "),
            ].join(" ")}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={
          safeCurrentPage === totalPages
        }
        onClick={() =>
          changePage(safeCurrentPage + 1)
        }
        aria-label={nextLabel}
        className={navigationButtonClasses}
      >
        <ChevronRight
          aria-hidden="true"
          size={18}
        />
      </button>
    </nav>
  );
}