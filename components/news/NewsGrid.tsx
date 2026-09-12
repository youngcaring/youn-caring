"use client";

import {
  type ChangeEvent,
  useMemo,
  useState,
} from "react";
import {
  Search,
  SearchX,
  X,
} from "lucide-react";

import NewsCard from "@/components/news/NewsCard";
import NewsCategories from "@/components/news/NewsCategories";
import NewsPagination from "@/components/news/NewsPagination";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { filterNews } from "@/data/news";
import type { NewsCategoryId } from "@/types/news";

const ITEMS_PER_PAGE = 6;
const MAX_SEARCH_LENGTH = 80;

export default function NewsGrid() {
  const { language, t } = useLanguage();

  const [selectedCategory, setSelectedCategory] =
    useState<NewsCategoryId>("all");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredNews = useMemo(
    () => filterNews(selectedCategory, search),
    [selectedCategory, search]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredNews.length / ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const displayedNews = useMemo(() => {
    const firstItemIndex =
      (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    return filteredNews.slice(
      firstItemIndex,
      firstItemIndex + ITEMS_PER_PAGE
    );
  }, [filteredNews, safeCurrentPage]);

  const handleCategoryChange = (
    category: NewsCategoryId
  ): void => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const value = event.target.value.slice(
      0,
      MAX_SEARCH_LENGTH
    );

    setSearch(value);
    setCurrentPage(1);
  };

  const clearSearch = (): void => {
    setSearch("");
    setCurrentPage(1);
  };

  const resetFilters = (): void => {
    setSelectedCategory("all");
    setSearch("");
    setCurrentPage(1);
  };

  const resultsLabel =
    language === "fr"
      ? `${filteredNews.length} actualité(s)`
      : `${filteredNews.length} news item(s)`;

  return (
    <section
      id="news-list"
      aria-labelledby="news-list-title"
      className={[
        "site-section scroll-mt-28",
        "bg-[#f7f9f9]",
      ].join(" ")}
    >
      <div className="site-container">
        {/* Titre et recherche */}

        <div
          className={[
            "flex flex-col justify-between gap-5",
            "md:flex-row md:items-end",
          ].join(" ")}
        >
          <div>
            <p className="section-label">
              {t("NewsPage.heroLabel")}
            </p>

            <h2
              id="news-list-title"
              className="section-title"
            >
              {t("NewsPage.latestTitle")}
            </h2>

            <p
              aria-live="polite"
              className="mt-3 text-sm font-semibold text-[#647275]"
            >
              {resultsLabel}
            </p>
          </div>

          <label className="relative block w-full md:w-[350px]">
            <span className="sr-only">
              {t("NewsPage.searchLabel")}
            </span>

            <Search
              aria-hidden="true"
              size={18}
              className={[
                "pointer-events-none absolute",
                "left-4 top-1/2",
                "-translate-y-1/2 text-[#647275]",
              ].join(" ")}
            />

            <input
              type="search"
              name="news-search"
              value={search}
              onChange={handleSearchChange}
              maxLength={MAX_SEARCH_LENGTH}
              autoComplete="off"
              placeholder={t(
                "NewsPage.searchPlaceholder"
              )}
              className={[
                "h-12 w-full rounded-full",
                "border border-[#dfe7e8]",
                "bg-white pl-11",
                search.length > 0
                  ? "pr-11"
                  : "pr-4",
                "text-sm text-[#101719]",
                "outline-none transition",
                "placeholder:text-[#7d898b]",
                "focus:border-[#0097a7]",
                "focus:ring-4",
                "focus:ring-[#0097a7]/10",
              ].join(" ")}
            />

            {search.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={
                  language === "fr"
                    ? "Effacer la recherche"
                    : "Clear search"
                }
                className={[
                  "absolute right-2 top-1/2",
                  "grid h-8 w-8",
                  "-translate-y-1/2",
                  "place-items-center rounded-full",
                  "text-[#647275]",
                  "transition-colors",
                  "hover:bg-[#eaf8f9]",
                  "hover:text-[#007d88]",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4",
                  "focus-visible:ring-[#0097a7]/20",
                ].join(" ")}
              >
                <X
                  aria-hidden="true"
                  size={17}
                />
              </button>
            )}
          </label>
        </div>

        {/* Catégories */}

        <div className="mt-7">
          <NewsCategories
            selected={selectedCategory}
            onSelect={handleCategoryChange}
          />
        </div>

        {/* Liste des actualités */}

        {displayedNews.length > 0 ? (
          <>
            <div
              className={[
                "mt-8 grid gap-5",
                "md:grid-cols-2",
                "xl:grid-cols-3",
              ].join(" ")}
            >
              {displayedNews.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>

            <NewsPagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div
            className={[
              "mt-8 flex min-h-[300px]",
              "flex-col items-center",
              "justify-center rounded-[28px]",
              "border border-dashed",
              "border-[#cfdadb] bg-white",
              "px-6 py-12 text-center",
            ].join(" ")}
          >
            <span
              className={[
                "grid h-16 w-16",
                "place-items-center rounded-full",
                "bg-[#eaf8f9] text-[#007d88]",
              ].join(" ")}
            >
              <SearchX
                aria-hidden="true"
                size={30}
              />
            </span>

            <h3 className="mt-5 text-xl font-black text-[#101719]">
              {t("NewsPage.noNews")}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#5f6d70]">
              {language === "fr"
                ? "Modifiez votre recherche ou sélectionnez une autre catégorie."
                : "Change your search or select another category."}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="button-secondary mt-6"
            >
              {language === "fr"
                ? "Réinitialiser les filtres"
                : "Reset filters"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}