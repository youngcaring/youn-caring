export type GalleryCategoryId =
  | "all"
  | "education"
  | "children"
  | "solidarity"
  | "health"
  | "community"
  | "volunteers";

export type SpecificGalleryCategoryId = Exclude<
  GalleryCategoryId,
  "all"
>;

export type GalleryCategory = Readonly<{
  id: GalleryCategoryId;
  labelFr: string;
  labelEn: string;
}>;

export type GalleryItem = Readonly<{
  id: string;
  category: SpecificGalleryCategoryId;

  titleFr: string;
  titleEn: string;

  descriptionFr: string;
  descriptionEn: string;

  image: string;
  imageAltFr: string;
  imageAltEn: string;

  published: boolean;
  featured: boolean;
  sortOrder: number;
}>;

export type PublishedGalleryItem =
  GalleryItem &
    Readonly<{
      published: true;
    }>;

export type LocalizedGalleryItem = Readonly<{
  id: string;
  category: SpecificGalleryCategoryId;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  featured: boolean;
}>;

export type GalleryImages = Readonly<{
  heroDesktop: string;
  heroMobile: string;
  callToAction: string;
}>;

export type GalleryFilters = Readonly<{
  category: GalleryCategoryId;
  search: string;
}>;

export type GalleryPaginationState = Readonly<{
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}>;

export type GalleryLightboxState = Readonly<{
  open: boolean;
  selectedIndex: number | null;
}>;