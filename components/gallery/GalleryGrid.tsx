"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Images,
  SearchX,
} from "lucide-react";

import GalleryCard from "@/components/gallery/GalleryCard";
import GalleryCategories from "@/components/gallery/GalleryCategories";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import GalleryPagination from "@/components/gallery/GalleryPagination";
import GalleryToolbar from "@/components/gallery/GalleryToolbar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { filterGalleryItems } from "@/data/gallery";
import type { GalleryCategoryId } from "@/types/gallery";

const ITEMS_PER_PAGE = 9;

export default function GalleryGrid() {
  const { language } = useLanguage();

  const [selectedCategory, setSelectedCategory] =
    useState<GalleryCategoryId>("all");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedImageIndex, setSelectedImageIndex] =
    useState<number | null>(null);

  const filteredItems = useMemo(
    () =>
      filterGalleryItems(
        selectedCategory,
        search
      ),
    [selectedCategory, search]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredItems.length / ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const pageStart =
    (safePage - 1) * ITEMS_PER_PAGE;

  const displayedItems = filteredItems.slice(
    pageStart,
    pageStart + ITEMS_PER_PAGE
  );

  const texts =
    language === "fr"
      ? {
          label: "Photos de terrain",
          titleStart: "Découvrez nos",
          titleHighlight: "moments en images",
          description:
            "Parcourez les photographies des actions, des rencontres et des mobilisations de Young Caring.",
          emptyTitle:
            "Aucune photographie disponible",
          emptyDescription:
            "Aucune photographie ne correspond actuellement à votre recherche ou à la catégorie sélectionnée.",
          reset: "Réinitialiser les filtres",
        }
      : {
          label: "Field photographs",
          titleStart: "Discover our",
          titleHighlight: "moments in pictures",
          description:
            "Browse photographs of Young Caring’s activities, meetings and community initiatives.",
          emptyTitle: "No photographs available",
          emptyDescription:
            "No photograph currently matches your search or the selected category.",
          reset: "Reset filters",
        };

  const selectCategory = (
    category: GalleryCategoryId
  ) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setSelectedImageIndex(null);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
    setSelectedImageIndex(null);
  };

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
    setSelectedImageIndex(null);
  };

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearch("");
    setCurrentPage(1);
    setSelectedImageIndex(null);
  };

  const closeLightbox = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const showPreviousImage =
    useCallback(() => {
      setSelectedImageIndex(
        (currentIndex) => {
          if (
            currentIndex === null ||
            displayedItems.length === 0
          ) {
            return null;
          }

          return (
            currentIndex -
            1 +
            displayedItems.length
          ) % displayedItems.length;
        }
      );
    }, [displayedItems.length]);

  const showNextImage = useCallback(() => {
    setSelectedImageIndex(
      (currentIndex) => {
        if (
          currentIndex === null ||
          displayedItems.length === 0
        ) {
          return null;
        }

        return (
          currentIndex + 1
        ) % displayedItems.length;
      }
    );
  }, [displayedItems.length]);

  const changePage = (page: number) => {
    setCurrentPage(page);
    setSelectedImageIndex(null);
  };

  return (
    <section
      id="gallery-list"
      aria-labelledby="gallery-list-title"
      className="site-section scroll-mt-28 bg-[#f7f9f9]"
    >
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="section-label">
            {texts.label}
          </p>

          <h2
            id="gallery-list-title"
            className="section-title"
          >
            {texts.titleStart}{" "}
            <span className="text-[#0097a7]">
              {texts.titleHighlight}
            </span>
          </h2>

          <p className="section-description">
            {texts.description}
          </p>
        </div>

        <div className="mt-8">
          <GalleryCategories
            selectedCategory={selectedCategory}
            onSelectCategory={selectCategory}
          />
        </div>

        <div className="mt-5">
          <GalleryToolbar
            search={search}
            resultCount={filteredItems.length}
            onSearchChange={changeSearch}
            onClearSearch={clearSearch}
          />
        </div>

        {displayedItems.length > 0 ? (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {displayedItems.map(
                (item, index) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    onOpen={() =>
                      setSelectedImageIndex(index)
                    }
                  />
                )
              )}
            </div>

            <GalleryPagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={changePage}
            />
          </>
        ) : (
          <div className="mt-8 flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#cfdadb] bg-white px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#eaf8f9] text-[#007d88]">
              <SearchX
                aria-hidden="true"
                size={30}
              />
            </span>

            <h3 className="mt-5 text-xl font-black text-[#101719]">
              {texts.emptyTitle}
            </h3>

            <p className="mt-3 max-w-lg text-sm leading-6 text-[#5f6d70]">
              {texts.emptyDescription}
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="button-secondary mt-6"
            >
              <Images
                aria-hidden="true"
                size={18}
              />

              {texts.reset}
            </button>
          </div>
        )}
      </div>

      <GalleryLightbox
        open={selectedImageIndex !== null}
        items={displayedItems}
        selectedIndex={selectedImageIndex ?? 0}
        onClose={closeLightbox}
        onPrevious={showPreviousImage}
        onNext={showNextImage}
      />
    </section>
  );
}