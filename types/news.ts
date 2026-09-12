/**
 * Catégories disponibles sur la page des actualités.
 *
 * La catégorie "all" sert uniquement au filtrage et ne peut
 * pas être attribuée directement à une actualité.
 */
export type NewsCategoryId =
  | "all"
  | "children"
  | "donations"
  | "community"
  | "volunteers"
  | "education";

export type SpecificNewsCategoryId = Exclude<
  NewsCategoryId,
  "all"
>;

/**
 * Catégorie utilisée dans la barre de filtrage.
 */
export type NewsCategory = Readonly<{
  id: NewsCategoryId;
  labelFr: string;
  labelEn: string;
}>;

/**
 * Données brutes d’une actualité.
 *
 * Les informations éditoriales sont nullables afin qu’une
 * actualité incomplète puisse rester enregistrée sans être publiée.
 */
export type NewsItem = Readonly<{
  id: string;
  slug: string | null;
  category: SpecificNewsCategoryId;

  titleFr: string | null;
  titleEn: string | null;

  excerptFr: string | null;
  excerptEn: string | null;

  contentFr: string | null;
  contentEn: string | null;

  image: string;
  imageAltFr: string | null;
  imageAltEn: string | null;

  /**
   * Format recommandé : YYYY-MM-DD.
   * Une date absente ne bloque pas la publication.
   */
  date: string | null;

  /**
   * Le lieu est facultatif et n’est affiché que s’il existe.
   */
  location: string | null;

  published: boolean;
  featured: boolean;
  sortOrder: number;
}>;

/**
 * Actualité validée et officiellement affichable.
 *
 * Cette structure garantit que les titres, contenus, descriptions
 * d’images et redirections sont disponibles avant l’affichage.
 */
export type PublishedNewsItem = Readonly<{
  id: string;
  slug: string;
  category: SpecificNewsCategoryId;

  titleFr: string;
  titleEn: string;

  excerptFr: string;
  excerptEn: string;

  contentFr: string;
  contentEn: string;

  image: string;
  imageAltFr: string;
  imageAltEn: string;

  date: string | null;
  location: string | null;

  published: true;
  featured: boolean;
  sortOrder: number;
}>;

/**
 * Contenu déjà sélectionné selon la langue active.
 */
export type LocalizedNewsContent = Readonly<{
  title: string;
  excerpt: string;
  content: string;
  imageAlt: string;
}>;

/**
 * Filtres utilisables par la liste des actualités.
 */
export type NewsFilters = Readonly<{
  category?: NewsCategoryId;
  search?: string;
}>;

/**
 * Propriétés communes aux composants de pagination.
 */
export type NewsPaginationState = Readonly<{
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}>;