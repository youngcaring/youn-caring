"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  getGalleryCategoryLabel,
  getLocalizedGalleryItem,
} from "@/data/gallery";
import type { GalleryItem } from "@/types/gallery";

type GalleryLightboxProps = Readonly<{
  open: boolean;
  items: readonly GalleryItem[];
  selectedIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}>;

export default function GalleryLightbox({
  open,
  items,
  selectedIndex,
  onClose,
  onPrevious,
  onNext,
}: GalleryLightboxProps) {
  const { language } = useLanguage();
  const closeButtonRef =
    useRef<HTMLButtonElement>(null);

  const selectedItem =
    items[selectedIndex] ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (
        event.key === "ArrowLeft" &&
        items.length > 1
      ) {
        onPrevious();
      }

      if (
        event.key === "ArrowRight" &&
        items.length > 1
      ) {
        onNext();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    items.length,
    onClose,
    onNext,
    onPrevious,
  ]);

  if (!open || !selectedItem) {
    return null;
  }

  const content = getLocalizedGalleryItem(
    selectedItem,
    language
  );

  const categoryLabel = getGalleryCategoryLabel(
    selectedItem.category,
    language
  );

  const texts =
    language === "fr"
      ? {
          dialogLabel:
            "Aperçu de la photographie",
          close: "Fermer l’aperçu",
          previous: "Photographie précédente",
          next: "Photographie suivante",
          counter: "Photographie",
          of: "sur",
        }
      : {
          dialogLabel: "Photograph preview",
          close: "Close preview",
          previous: "Previous photograph",
          next: "Next photograph",
          counter: "Photograph",
          of: "of",
        };

  const hasMultipleItems = items.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={texts.dialogLabel}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020b0c]/95 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#091719] text-white shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-black">
              {content.title}
            </p>

            <p className="mt-1 text-xs text-white/55">
              {texts.counter} {selectedIndex + 1}{" "}
              {texts.of} {items.length}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={texts.close}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
          >
            <X
              aria-hidden="true"
              size={22}
            />
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="relative h-[55vh] min-h-[280px] w-full sm:h-[62vh]">
            <Image
              src={selectedItem.image}
              alt={content.imageAlt}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {hasMultipleItems && (
            <>
              <button
                type="button"
                onClick={onPrevious}
                aria-label={texts.previous}
                className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#0097a7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:left-5"
              >
                <ChevronLeft
                  aria-hidden="true"
                  size={25}
                />
              </button>

              <button
                type="button"
                onClick={onNext}
                aria-label={texts.next}
                className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-[#0097a7] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 sm:right-5"
              >
                <ChevronRight
                  aria-hidden="true"
                  size={25}
                />
              </button>
            </>
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4 sm:px-7 sm:py-5">
          <span className="inline-flex rounded-full bg-[#0097a7] px-3 py-1.5 text-xs font-extrabold text-white">
            {categoryLabel}
          </span>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
            {content.description}
          </p>
        </div>
      </div>
    </div>
  );
}