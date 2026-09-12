"use client";

import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

type GalleryPaginationProps = Readonly<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>;

type PaginationItem =
  | number
  | "ellipsis-start"
  | "ellipsis-end";

/**
 * Limite le nombre de pages affichées sur les petits écrans
 * tout en conservant la première et la dernière page.
 */
function getPaginationItems(
  currentPage: number,
  totalPages: number
): readonly PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "ellipsis-end",
      totalPages,
    ];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}

export default function GalleryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: GalleryPaginationProps) {
  const { language } = useLanguage();

  if (
    !Number.isInteger(totalPages) ||
    totalPages <= 1
  ) {
    return null;
  }

  const safeCurrentPage = Math.min(
    Math.max(
      Number.isInteger(currentPage)
        ? currentPage
        : 1,
      1
    ),
    totalPages
  );

  const content =
    language === "fr"
      ? {
          navigationLabel:
            "Pagination de la galerie",
          previousPage: "Page précédente",
          nextPage: "Page suivante",
          goToPage: "Aller à la page",
          currentPage: "Page actuelle",
          morePages: "Autres pages",
          pageInformation: `Page ${safeCurrentPage} sur ${totalPages}`,
        }
      : {
          navigationLabel:
            "Gallery pagination",
          previousPage: "Previous page",
          nextPage: "Next page",
          goToPage: "Go to page",
          currentPage: "Current page",
          morePages: "More pages",
          pageInformation: `Page ${safeCurrentPage} of ${totalPages}`,
        };

  const paginationItems = getPaginationItems(
    safeCurrentPage,
    totalPages
  );

  const changePage = (nextPage: number) => {
    if (
      !Number.isInteger(nextPage) ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === safeCurrentPage
    ) {
      return;
    }

    onPageChange(nextPage);

    /*
     * Le défilement est déclenché uniquement après
     * une action du visiteur et seulement dans le navigateur.
     */
    window.requestAnimationFrame(() => {
      document
        .getElementById("gallery-list")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  const previousDisabled =
    safeCurrentPage === 1;

  const nextDisabled =
    safeCurrentPage === totalPages;

  const navigationButtonClassName = [
    "grid h-11 w-11 shrink-0",
    "place-items-center rounded-full",
    "border border-[#dfe7e8] bg-white",
    "text-[#334144]",
    "transition duration-200",
    "hover:border-[#0097a7]",
    "hover:bg-[#eaf8f9]",
    "hover:text-[#007d88]",
    "disabled:cursor-not-allowed",
    "disabled:opacity-35",
    "disabled:hover:border-[#dfe7e8]",
    "disabled:hover:bg-white",
    "disabled:hover:text-[#334144]",
    "focus-visible:outline-none",
    "focus-visible:ring-4",
    "focus-visible:ring-[#0097a7]/20",
  ].join(" ");

  return (
    <nav
      aria-label={content.navigationLabel}
      className="mt-10"
    >
      <p
        aria-live="polite"
        className="mb-4 text-center text-sm font-bold text-[#647275]"
      >
        {content.pageInformation}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={previousDisabled}
          onClick={() =>
            changePage(safeCurrentPage - 1)
          }
          aria-label={content.previousPage}
          className={navigationButtonClassName}
        >
          <ChevronLeft
            aria-hidden="true"
            size={19}
          />
        </button>

        {paginationItems.map((item) => {
          if (typeof item !== "number") {
            return (
              <span
                key={item}
                aria-label={content.morePages}
                className="grid h-11 min-w-8 place-items-center text-[#718083]"
              >
                <MoreHorizontal
                  aria-hidden="true"
                  size={18}
                />
              </span>
            );
          }

          const active =
            item === safeCurrentPage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => changePage(item)}
              aria-current={
                active ? "page" : undefined
              }
              aria-label={
                active
                  ? `${content.currentPage}, ${item}`
                  : `${content.goToPage} ${item}`
              }
              className={[
                "grid h-11 min-w-11",
                "place-items-center rounded-full",
                "border px-3 text-sm",
                "font-extrabold",
                "transition duration-200",
                "focus-visible:outline-none",
                "focus-visible:ring-4",
                "focus-visible:ring-[#0097a7]/20",
                active
                  ? "border-[#0097a7] bg-[#0097a7] text-white shadow-[0_8px_20px_rgba(0,151,167,0.22)]"
                  : "border-[#dfe7e8] bg-white text-[#334144] hover:border-[#0097a7] hover:bg-[#eaf8f9] hover:text-[#007d88]",
              ].join(" ")}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          disabled={nextDisabled}
          onClick={() =>
            changePage(safeCurrentPage + 1)
          }
          aria-label={content.nextPage}
          className={navigationButtonClassName}
        >
          <ChevronRight
            aria-hidden="true"
            size={19}
          />
        </button>
      </div>
    </nav>
  );
}