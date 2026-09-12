/*
 * Catégories disponibles sur la page « Nos actions ».
 *
 * "all" est utilisé uniquement dans les filtres.
 * Les actions individuelles utilisent une catégorie précise.
 */

export type ActionCategoryId =
  | "all"
  | "education"
  | "foodSupport"
  | "health"
  | "clothing"
  | "children"
  | "womenFamilies"
  | "waterHygiene"
  | "emergency";

export type SpecificActionCategoryId = Exclude<
  ActionCategoryId,
  "all"
>;

/*
 * Statistiques pouvant être affichées sur la page.
 * Leur valeur reste facultative afin de ne pas inventer
 * de chiffres non confirmés.
 */

export type ActionStatisticId =
  | "peopleHelped"
  | "projectsCompleted"
  | "communitiesReached"
  | "familiesHelped";

/*
 * Options de tri.
 *
 * "recommended" conserve l’ordre défini par Young Caring.
 * Les deux autres options trient les titres.
 *
 * Les tris par date sont supprimés, car une action peut
 * être publiée sans date obligatoire.
 */

export type ActionSortOption =
  | "recommended"
  | "titleAscending"
  | "titleDescending";

/*
 * Catégorie affichée dans la barre des filtres.
 */

export type ActionCategory = Readonly<{
  id: ActionCategoryId;
  translationKey: string;
  image: string | null;
}>;

/*
 * Statistique publique.
 */

export type ActionStatistic = Readonly<{
  id: ActionStatisticId;
  translationKey: string;
  value: number | null;
  suffix: string;
}>;

/*
 * Structure générale d’une action.
 *
 * Les textes et le slug peuvent rester null uniquement
 * pendant la préparation d’une action non publiée.
 *
 * La date et le lieu sont facultatifs, même après publication.
 */

export type ActionItem = Readonly<{
  id: string;
  slug: string | null;
  category: SpecificActionCategoryId;

  titleFr: string | null;
  titleEn: string | null;

  descriptionFr: string | null;
  descriptionEn: string | null;

  /*
   * Format recommandé lorsqu’une date existe :
   * YYYY-MM-DD
   *
   * Exemple : 2026-08-25
   */
  date: string | null;

  location: string | null;
  image: string;

  /*
   * Texte alternatif correspondant à la photographie.
   * Il améliore l’accessibilité sans inventer de résultat.
   */
  imageAltFr: string | null;
  imageAltEn: string | null;

  /*
   * Ordre manuel d’affichage.
   * Les nombres les plus petits apparaissent en premier.
   */
  sortOrder: number;

  /*
   * published doit être true pour rendre l’action visible.
   */
  published: boolean;

  /*
   * Permet de mettre une action en avant ultérieurement.
   */
  featured: boolean;
}>;

/*
 * Structure garantie après validation d’une action publiée.
 *
 * Le slug, les titres, les descriptions et les textes
 * alternatifs deviennent obligatoirement des chaînes.
 *
 * La date et le lieu restent facultatifs.
 */

export type PublishedActionItem = Readonly<{
  id: string;
  slug: string;
  category: SpecificActionCategoryId;

  titleFr: string;
  titleEn: string;

  descriptionFr: string;
  descriptionEn: string;

  date: string | null;
  location: string | null;
  image: string;

  imageAltFr: string;
  imageAltEn: string;

  sortOrder: number;

  published: true;
  featured: boolean;
}>;

/*
 * Images principales utilisées par la page.
 */

export type ActionsPageImages = Readonly<{
  heroDesktop: string;
  heroMobile: string;
  donationBanner: string;
}>;

/*
 * Filtres utilisables par la grille des actions.
 */

export type ActionsPageFilters = Readonly<{
  category?: ActionCategoryId;
  search?: string;
  sort?: ActionSortOption;
}>;

/*
 * Contenu traduit d’une action selon la langue active.
 */

export type LocalizedActionContent = Readonly<{
  title: string;
  description: string;
  imageAlt: string;
}>;

/*
 * Paramètres de pagination.
 */

export type ActionsPaginationState = Readonly<{
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}>;