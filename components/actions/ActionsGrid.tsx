"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  RotateCcw,
  SearchX,
} from "lucide-react";

import ActionCard from "@/components/actions/ActionCard";
import ActionsCategories from "@/components/actions/ActionsCategories";
import ActionsPagination from "@/components/actions/ActionsPagination";
import ActionsToolbar from "@/components/actions/ActionsToolbar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  actionsPageContent,
  filterPublishedActions,
} from "@/data/actions";
import type {
  ActionCategoryId,
  ActionSortOption,
} from "@/types/action";

const MAX_SEARCH_LENGTH = 80;

const DEFAULT_SORT: ActionSortOption =
  "recommended";

export default function ActionsGrid() {
  const { t } = useLanguage();

  const [selectedCategory, setSelectedCategory] =
    useState<ActionCategoryId>("all");

  const [search, setSearch] = useState("");

  const [sort, setSort] =
    useState<ActionSortOption>(DEFAULT_SORT);

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = Math.max(
    1,
    actionsPageContent.pagination.itemsPerPage
  );

  const filteredActions = useMemo(() => {
    return filterPublishedActions({
      category: selectedCategory,
      search: search.trim(),
      sort,
    });
  }, [search, selectedCategory, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredActions.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  const displayedActions = useMemo(() => {
    const firstItemIndex =
      (safeCurrentPage - 1) * itemsPerPage;

    return filteredActions.slice(
      firstItemIndex,
      firstItemIndex + itemsPerPage
    );
  }, [
    filteredActions,
    itemsPerPage,
    safeCurrentPage,
  ]);

  const filtersAreActive =
    selectedCategory !== "all" ||
    search.trim().length > 0 ||
    sort !== DEFAULT_SORT;

  const handleCategoryChange = (
    category: ActionCategoryId
  ): void => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (
    value: string
  ): void => {
    setSearch(
      value.slice(0, MAX_SEARCH_LENGTH)
    );

    setCurrentPage(1);
  };

  const handleSortChange = (
    nextSort: ActionSortOption
  ): void => {
    setSort(nextSort);
    setCurrentPage(1);
  };

  const handlePageChange = (
    nextPage: number
  ): void => {
    if (
      !Number.isInteger(nextPage) ||
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === safeCurrentPage
    ) {
      return;
    }

    setCurrentPage(nextPage);
  };

  const clearFilters = (): void => {
    setSelectedCategory("all");
    setSearch("");
    setSort(DEFAULT_SORT);
    setCurrentPage(1);
  };

  return (
    <section
      id="actions-list"
      aria-labelledby="actions-list-title"
      className="site-section scroll-mt-28 bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {t("ActionsPage.list.label")}
          </p>

          <h2
            id="actions-list-title"
            className="section-title"
          >
            {t(
              "ActionsPage.list.titleStart"
            )}{" "}
            <span className="text-[#0097a7]">
              {t(
                "ActionsPage.list.titleHighlight"
              )}
            </span>
          </h2>

          <p className="section-description">
            {t(
              "ActionsPage.list.description"
            )}
          </p>
        </div>

        <div className="mt-8">
          <ActionsCategories
            selectedCategory={
              selectedCategory
            }
            onSelectCategory={
              handleCategoryChange
            }
          />
        </div>

        <div className="mt-5 border-t border-[#e3e9ea] pt-5">
          <ActionsToolbar
            search={search}
            sort={sort}
            resultsCount={
              filteredActions.length
            }
            onSearchChange={
              handleSearchChange
            }
            onSortChange={
              handleSortChange
            }
          />
        </div>

        {displayedActions.length > 0 ? (
          <>
            <div
              className={[
                "mt-8 grid gap-5",
                "md:grid-cols-2",
                "xl:grid-cols-3",
              ].join(" ")}
            >
              {displayedActions.map(
                (action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                  />
                )
              )}
            </div>

            <ActionsPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={
                handlePageChange
              }
            />
          </>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className={[
              "mt-8 flex min-h-[300px]",
              "flex-col items-center",
              "justify-center",
              "rounded-[28px] border",
              "border-dashed",
              "border-[#cfdadb]",
              "bg-white px-6 py-12",
              "text-center",
            ].join(" ")}
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#eaf8f9] text-[#007d88]">
              <SearchX
                aria-hidden="true"
                size={30}
              />
            </span>

            <h3 className="mt-5 text-xl font-black text-[#101719]">
              {t(
                "ActionsPage.empty.title"
              )}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#5f6d70]">
              {t(
                "ActionsPage.empty.description"
              )}
            </p>

            {filtersAreActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="button-secondary mt-6"
              >
                <RotateCcw
                  aria-hidden="true"
                  size={17}
                />

                {t(
                  "ActionsPage.empty.clearFilters"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}