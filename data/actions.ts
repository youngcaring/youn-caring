import { siteConfig } from "@/config/site";

import type {
  ActionCategory,
  ActionCategoryId,
  ActionItem,
  ActionSortOption,
  ActionStatistic,
  ActionsPageFilters,
  ActionsPageImages,
  LocalizedActionContent,
  PublishedActionItem,
} from "@/types/action";

import type { SupportedLanguage } from "@/config/site";

/*
 * Images principales de la page « Nos actions ».
 *
 * Les fichiers se trouvent physiquement dans :
 * public/images/actions
 *
 * Dans Next.js, leurs adresses commencent directement
 * par /images et jamais par /public/images.
 */

export const actionsPageImages: ActionsPageImages = {
  heroDesktop:
    "/images/actions/actions-hero-desktop.jpg",
  heroMobile:
    "/images/actions/actions-hero-mobile.jpg",
  donationBanner:
    "/images/actions/actions-donation-banner.jpg",
};

/*
 * Images utilisées par les cartes d’actions.
 */

export const actionCategoryImages = {
  education:
    "/images/actions/action-education.jpg",

  foodSupport:
    "/images/actions/action-food-support.jpg",

  health:
    "/images/actions/action-health.jpg",

  clothing:
    "/images/actions/action-clothing.jpg",

  children:
    "/images/actions/action-children.jpg",

  womenFamilies:
    "/images/actions/action-women-families.jpg",

  waterHygiene:
    "/images/actions/action-water-hygiene.jpg",

  emergency:
    "/images/actions/action-emergency.jpg",
} as const;

/*
 * Catégories affichées dans la barre de filtres.
 *
 * Les libellés sont lus dans messages/fr.json et
 * messages/en.json afin de respecter la langue active.
 */

export const actionCategories: readonly ActionCategory[] = [
  {
    id: "all",
    translationKey: "ActionsPage.categories.all",
    image: null,
  },
  {
    id: "education",
    translationKey:
      "ActionsPage.categories.education",
    image: actionCategoryImages.education,
  },
  {
    id: "foodSupport",
    translationKey:
      "ActionsPage.categories.foodSupport",
    image: actionCategoryImages.foodSupport,
  },
  {
    id: "health",
    translationKey:
      "ActionsPage.categories.health",
    image: actionCategoryImages.health,
  },
  {
    id: "clothing",
    translationKey:
      "ActionsPage.categories.clothing",
    image: actionCategoryImages.clothing,
  },
  {
    id: "children",
    translationKey:
      "ActionsPage.categories.children",
    image: actionCategoryImages.children,
  },
  {
    id: "womenFamilies",
    translationKey:
      "ActionsPage.categories.womenFamilies",
    image: actionCategoryImages.womenFamilies,
  },
  {
    id: "waterHygiene",
    translationKey:
      "ActionsPage.categories.waterHygiene",
    image: actionCategoryImages.waterHygiene,
  },
  {
    id: "emergency",
    translationKey:
      "ActionsPage.categories.emergency",
    image: actionCategoryImages.emergency,
  },
];

/*
 * Statistiques de la page.
 *
 * Seules les valeurs présentes dans config/site.ts sont lues.
 * Une statistique null est automatiquement masquée.
 */

export const actionStatistics:
  readonly ActionStatistic[] = [
    {
      id: "peopleHelped",
      translationKey:
        "ActionsPage.statistics.peopleHelped",
      value:
        siteConfig.impactStatistics.find(
          (statistic) =>
            statistic.id === "peopleHelped"
        )?.value ?? null,
      suffix: "+",
    },
    {
      id: "projectsCompleted",
      translationKey:
        "ActionsPage.statistics.projectsCompleted",
      value:
        siteConfig.impactStatistics.find(
          (statistic) =>
            statistic.id === "projectsCompleted"
        )?.value ?? null,
      suffix: "+",
    },
    {
      id: "communitiesReached",
      translationKey:
        "ActionsPage.statistics.communitiesReached",
      value:
        siteConfig.impactStatistics.find(
          (statistic) =>
            statistic.id === "communitiesReached"
        )?.value ?? null,
      suffix: "+",
    },
    {
      id: "familiesHelped",
      translationKey:
        "ActionsPage.statistics.familiesHelped",
      value: null,
      suffix: "+",
    },
  ];

/*
 * Actions présentées à partir des photographies fournies.
 *
 * Les contenus décrivent les domaines d’intervention
 * visibles sur les photographies.
 *
 * Les dates, lieux et statistiques restent facultatifs.
 * Aucun chiffre ni résultat non confirmé n’est ajouté.
 */

export const actionItems: readonly ActionItem[] = [
  {
    id: "education-and-sharing",
    slug: "education-et-moments-de-partage",
    category: "education",

    titleFr: "Éducation et moments de partage",
    titleEn: "Education and moments of sharing",

    descriptionFr:
      "Young Caring organise des activités éducatives et des moments de partage auprès des enfants afin de favoriser l’écoute, l’apprentissage et l’épanouissement.",

    descriptionEn:
      "Young Caring organises educational activities and moments of sharing with children to encourage listening, learning and personal development.",

    date: null,
    location: null,

    image: actionCategoryImages.education,

    imageAltFr:
      "Des enfants participant à une activité organisée par Young Caring",

    imageAltEn:
      "Children taking part in an activity organised by Young Caring",

    sortOrder: 1,
    published: true,
    featured: true,
  },

  {
    id: "material-donations",
    slug: "collecte-et-remise-de-dons",
    category: "foodSupport",

    titleFr: "Collecte et remise de dons",
    titleEn: "Collection and distribution of donations",

    descriptionFr:
      "Les équipes de Young Caring rassemblent et préparent des dons matériels destinés à soutenir les enfants, les familles et les communautés accompagnées.",

    descriptionEn:
      "Young Caring teams collect and prepare material donations intended to support children, families and the communities they assist.",

    date: null,
    location: null,

    image: actionCategoryImages.foodSupport,

    imageAltFr:
      "Des sacs et des cartons de dons préparés pour une action de Young Caring",

    imageAltEn:
      "Bags and boxes of donations prepared for a Young Caring action",

    sortOrder: 2,
    published: true,
    featured: false,
  },

  {
    id: "children-support",
    slug: "presence-et-accompagnement-des-enfants",
    category: "health",

    titleFr: "Présence et accompagnement des enfants",
    titleEn: "Care and support for children",

    descriptionFr:
      "Young Caring accorde une place essentielle à la présence, à l’écoute et à l’accompagnement humain des enfants pendant ses interventions.",

    descriptionEn:
      "Young Caring places great importance on presence, listening and compassionate support for children during its activities.",

    date: null,
    location: null,

    image: actionCategoryImages.health,

    imageAltFr:
      "Une bénévole de Young Caring tenant un enfant dans ses bras",

    imageAltEn:
      "A Young Caring volunteer holding a child in her arms",

    sortOrder: 3,
    published: true,
    featured: false,
  },

  {
    id: "donation-preparation",
    slug: "preparation-des-dons-materiels",
    category: "clothing",

    titleFr: "Préparation des dons matériels",
    titleEn: "Preparation of material donations",

    descriptionFr:
      "Avant chaque remise, les dons sont rassemblés et organisés afin de faciliter leur distribution aux personnes accompagnées.",

    descriptionEn:
      "Before distribution, donations are collected and organised to make their delivery to supported people easier.",

    date: null,
    location: null,

    image: actionCategoryImages.clothing,

    imageAltFr:
      "Plusieurs sacs de dons matériels préparés par Young Caring",

    imageAltEn:
      "Several bags of material donations prepared by Young Caring",

    sortOrder: 4,
    published: true,
    featured: false,
  },

  {
    id: "children-solidarity",
    slug: "enfance-et-solidarite",
    category: "children",

    titleFr: "Enfance et solidarité",
    titleEn: "Children and solidarity",

    descriptionFr:
      "À travers des activités collectives, Young Caring crée des moments de proximité, de joie et de solidarité avec les enfants.",

    descriptionEn:
      "Through group activities, Young Caring creates moments of connection, joy and solidarity with children.",

    date: null,
    location: null,

    image: actionCategoryImages.children,

    imageAltFr:
      "Un groupe d’enfants réuni pendant une activité de Young Caring",

    imageAltEn:
      "A group of children gathered during a Young Caring activity",

    sortOrder: 5,
    published: true,
    featured: false,
  },

  {
    id: "families-and-communities",
    slug: "rencontres-avec-les-familles",
    category: "womenFamilies",

    titleFr: "Rencontres avec les familles",
    titleEn: "Meeting with families",

    descriptionFr:
      "Young Caring va à la rencontre des familles et des communautés afin de partager, d’écouter et de mieux comprendre leurs réalités.",

    descriptionEn:
      "Young Caring meets with families and communities to share, listen and better understand their realities.",

    date: null,
    location: null,

    image: actionCategoryImages.womenFamilies,

    imageAltFr:
      "Des bénévoles, des enfants et des membres de familles réunis pendant une rencontre",

    imageAltEn:
      "Volunteers, children and family members gathered during a meeting",

    sortOrder: 6,
    published: true,
    featured: false,
  },

  {
    id: "community-awareness",
    slug: "animation-et-sensibilisation-communautaire",
    category: "waterHygiene",

    titleFr: "Animation et sensibilisation communautaire",
    titleEn: "Community activities and awareness",

    descriptionFr:
      "Les activités communautaires permettent de transmettre des messages utiles, de renforcer les liens et de créer un dialogue avec les enfants et les familles.",

    descriptionEn:
      "Community activities help share useful messages, strengthen relationships and create dialogue with children and families.",

    date: null,
    location: null,

    image: actionCategoryImages.waterHygiene,

    imageAltFr:
      "Des enfants réunis pendant une activité communautaire de Young Caring",

    imageAltEn:
      "Children gathered during a Young Caring community activity",

    sortOrder: 7,
    published: true,
    featured: false,
  },

  {
    id: "volunteer-mobilisation",
    slug: "mobilisation-des-benevoles",
    category: "emergency",

    titleFr: "Mobilisation des bénévoles",
    titleEn: "Volunteer mobilisation",

    descriptionFr:
      "Les bénévoles de Young Caring se mobilisent, préparent les activités et participent directement aux interventions menées auprès des communautés.",

    descriptionEn:
      "Young Caring volunteers mobilise, prepare activities and take part directly in field interventions alongside communities.",

    date: null,
    location: null,

    image: actionCategoryImages.emergency,

    imageAltFr:
      "Des bénévoles de Young Caring mobilisés pendant une activité de terrain",

    imageAltEn:
      "Young Caring volunteers mobilised during a field activity",

    sortOrder: 8,
    published: true,
    featured: false,
  },
];

/*
 * Configuration générale de la page.
 */

export const actionsPageContent = {
  images: actionsPageImages,
  categories: actionCategories,

  links: {
    actions: siteConfig.navigation.actions,
    donation: siteConfig.navigation.donation,
    contact: siteConfig.navigation.contact,
    transparency:
      siteConfig.navigation.transparency,
  },

  pagination: {
    itemsPerPage: 8,
  },

  sections: {
    hero: {
      enabled: true,
    },

    statistics: {
      enabled: true,
      hideWhenEmpty: true,
    },

    categories: {
      enabled: true,
    },

    actionsGrid: {
      enabled: true,
    },

    donationBanner: {
      enabled: true,
    },
  },
} as const;

/*
 * Vérifie qu’une valeur correspond à une catégorie autorisée.
 */

export function isActionCategoryId(
  value: unknown
): value is ActionCategoryId {
  return (
    typeof value === "string" &&
    actionCategories.some(
      (category) => category.id === value
    )
  );
}

/*
 * Vérifie qu’un slug peut être utilisé dans une adresse.
 */

function isValidSlug(
  value: string
): boolean {
  return (
    value.length > 0 &&
    value.length <= 150 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}

/*
 * Vérifie qu’une action possède toutes les informations
 * nécessaires à son affichage public.
 *
 * La date et le lieu ne sont pas obligatoires.
 */

export function isPublishedAction(
  action: ActionItem
): action is PublishedActionItem {
  return (
    action.published === true &&
    typeof action.slug === "string" &&
    isValidSlug(action.slug) &&
    typeof action.titleFr === "string" &&
    action.titleFr.trim().length > 0 &&
    typeof action.titleEn === "string" &&
    action.titleEn.trim().length > 0 &&
    typeof action.descriptionFr === "string" &&
    action.descriptionFr.trim().length > 0 &&
    typeof action.descriptionEn === "string" &&
    action.descriptionEn.trim().length > 0 &&
    typeof action.image === "string" &&
    action.image.startsWith("/") &&
    typeof action.imageAltFr === "string" &&
    action.imageAltFr.trim().length > 0 &&
    typeof action.imageAltEn === "string" &&
    action.imageAltEn.trim().length > 0 &&
    Number.isFinite(action.sortOrder) &&
    action.sortOrder >= 0
  );
}

/*
 * Retourne uniquement les actions complètes et publiées.
 */

export function getPublishedActions():
  readonly PublishedActionItem[] {
  return actionItems.filter(isPublishedAction);
}

/*
 * Recherche une action publiée à partir de son slug.
 */

export function getPublishedActionBySlug(
  slug: string
): PublishedActionItem | undefined {
  const cleanSlug = slug.trim().toLowerCase();

  if (!isValidSlug(cleanSlug)) {
    return undefined;
  }

  return getPublishedActions().find(
    (action) => action.slug === cleanSlug
  );
}

/*
 * Retourne les textes correspondant à la langue active.
 */

export function getLocalizedActionContent(
  action: PublishedActionItem,
  language: SupportedLanguage
): LocalizedActionContent {
  if (language === "en") {
    return {
      title: action.titleEn,
      description: action.descriptionEn,
      imageAlt: action.imageAltEn,
    };
  }

  return {
    title: action.titleFr,
    description: action.descriptionFr,
    imageAlt: action.imageAltFr,
  };
}

/*
 * Nettoie une recherche afin de gérer correctement
 * les accents, les majuscules et les espaces.
 */

function normalizeSearchText(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/*
 * Filtre et trie les actions sans modifier le tableau original.
 */

export function filterPublishedActions(
  filters: ActionsPageFilters = {}
): readonly PublishedActionItem[] {
  const category =
    filters.category &&
    isActionCategoryId(filters.category)
      ? filters.category
      : "all";

  const sort: ActionSortOption =
    filters.sort === "titleAscending" ||
    filters.sort === "titleDescending"
      ? filters.sort
      : "recommended";

  const search = normalizeSearchText(
    filters.search ?? ""
  );

  const filteredActions =
    getPublishedActions().filter((action) => {
      const matchesCategory =
        category === "all" ||
        action.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (search.length === 0) {
        return true;
      }

      const searchableText =
        normalizeSearchText(
          [
            action.titleFr,
            action.titleEn,
            action.descriptionFr,
            action.descriptionEn,
            action.location ?? "",
          ].join(" ")
        );

      return searchableText.includes(search);
    });

  return [...filteredActions].sort(
    (firstAction, secondAction) => {
      if (sort === "titleAscending") {
        return firstAction.titleFr.localeCompare(
          secondAction.titleFr,
          "fr",
          {
            sensitivity: "base",
          }
        );
      }

      if (sort === "titleDescending") {
        return secondAction.titleFr.localeCompare(
          firstAction.titleFr,
          "fr",
          {
            sensitivity: "base",
          }
        );
      }

      return (
        firstAction.sortOrder -
        secondAction.sortOrder
      );
    }
  );
}

/*
 * Retourne uniquement les statistiques ayant
 * une valeur numérique valide et officielle.
 */

export function getVerifiedActionStatistics():
  readonly ActionStatistic[] {
  return actionStatistics.filter(
    (statistic) =>
      typeof statistic.value === "number" &&
      Number.isFinite(statistic.value) &&
      statistic.value >= 0
  );
}