"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";

type ActionsPaginationProps = Readonly<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>;

function createPageNumbers(
  currentPage: number,
  totalPages: number
): readonly number[] {
  if (totalPages <= 5) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  const startPage = Math.max(
    1,
    Math.min(currentPage - 2, totalPages - 4)
  );

  return Array.from(
    { length: 5 },
    (_, index) => startPage + index
  );
}

export default function ActionsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ActionsPaginationProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = createPageNumbers(
    currentPage,
    totalPages
  );

  const changePage = (page: number): void => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    onPageChange(page);

    document
      .getElementById("actions-list")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <nav
      aria-label={t(
        "ActionsPage.pagination.navigationLabel"
      )}
      className={[
        "mt-10 flex items-center",
        "justify-center gap-2",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t(
          "ActionsPage.pagination.previous"
        )}
        className={[
          "grid h-10 w-10 place-items-center",
          "rounded-full border border-[#dfe7e8]",
          "bg-white text-[#101719]",
          "transition-colors",
          "hover:border-[#0097a7]",
          "hover:text-[#007d88]",
          "focus-visible:outline-none",
          "focus-visible:ring-4",
          "focus-visible:ring-[#0097a7]/20",
          "disabled:cursor-not-allowed",
          "disabled:opacity-35",
        ].join(" ")}
      >
        <ChevronLeft
          aria-hidden="true"
          size={18}
        />
      </button>

      {pageNumbers.map((page) => {
        const active = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            onClick={() => changePage(page)}
            aria-current={active ? "page" : undefined}
            aria-label={t(
              "ActionsPage.pagination.page",
              { page }
            )}
            className={[
              "grid h-10 min-w-10 place-items-center",
              "rounded-full px-3 text-sm font-extrabold",
              "transition-colors",
              "focus-visible:outline-none",
              "focus-visible:ring-4",
              "focus-visible:ring-[#0097a7]/20",
              active
                ? "bg-[#0097a7] text-white"
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
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t("ActionsPage.pagination.next")}
        className={[
          "grid h-10 w-10 place-items-center",
          "rounded-full border border-[#dfe7e8]",
          "bg-white text-[#101719]",
          "transition-colors",
          "hover:border-[#0097a7]",
          "hover:text-[#007d88]",
          "focus-visible:outline-none",
          "focus-visible:ring-4",
          "focus-visible:ring-[#0097a7]/20",
          "disabled:cursor-not-allowed",
          "disabled:opacity-35",
        ].join(" ")}
      >
        <ChevronRight
          aria-hidden="true"
          size={18}
        />
      </button>
    </nav>
  );
}