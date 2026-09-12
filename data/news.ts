import type { SupportedLanguage } from "@/config/site";

import type {
  LocalizedNewsContent,
  NewsCategory,
  NewsCategoryId,
  NewsItem,
  PublishedNewsItem,
} from "@/types/news";

/*
 * Images déjà disponibles dans le projet.
 *
 * Aucun nouveau dossier d’images n’est nécessaire.
 * Ces chemins utilisent les fichiers de la page Actions.
 */

export const newsImages = {
  heroDesktop:
    "/images/actions/actions-hero-desktop.jpg",

  heroMobile:
    "/images/actions/actions-hero-mobile.jpg",

  featured:
    "/images/actions/action-children.jpg",

  education:
    "/images/actions/action-education.jpg",

  donations:
    "/images/actions/action-food-support.jpg",

  support:
    "/images/actions/action-health.jpg",

  preparation:
    "/images/actions/action-clothing.jpg",

  families:
    "/images/actions/action-women-families.jpg",

  volunteers:
    "/images/actions/action-emergency.jpg",
} as const;

/*
 * Catégories disponibles dans les filtres.
 *
 * Les libellés sont directement bilingues afin d’éviter
 * de modifier les dictionnaires pour ces catégories.
 */

export const newsCategories:
  readonly NewsCategory[] = [
    {
      id: "all",
      labelFr: "Toutes les actualités",
      labelEn: "All news",
    },
    {
      id: "children",
      labelFr: "Enfance",
      labelEn: "Children",
    },
    {
      id: "donations",
      labelFr: "Dons",
      labelEn: "Donations",
    },
    {
      id: "community",
      labelFr: "Communautés",
      labelEn: "Communities",
    },
    {
      id: "volunteers",
      labelFr: "Bénévoles",
      labelEn: "Volunteers",
    },
    {
      id: "education",
      labelFr: "Éducation",
      labelEn: "Education",
    },
  ];

/*
 * Actualités présentées à partir des photographies
 * fournies par Young Caring.
 *
 * Les contenus décrivent uniquement ce qui est visible
 * et les domaines généraux d’intervention.
 *
 * Les dates et les lieux restent facultatifs.
 */

export const newsItems: readonly NewsItem[] = [
  {
    id: "children-sharing",

    slug:
      "des-moments-de-partage-avec-les-enfants",

    category: "children",

    titleFr:
      "Des moments de partage avec les enfants",

    titleEn:
      "Moments of sharing with children",

    excerptFr:
      "Young Caring crée des moments de proximité, de joie et d’écoute avec les enfants.",

    excerptEn:
      "Young Caring creates moments of connection, joy and listening with children.",

    contentFr:
      "À travers des activités collectives et des échanges, Young Caring renforce sa présence auprès des enfants et favorise des moments de partage dans un cadre bienveillant.",

    contentEn:
      "Through group activities and conversations, Young Caring strengthens its presence alongside children and encourages moments of sharing in a caring environment.",

    image: newsImages.featured,

    imageAltFr:
      "Des enfants réunis pendant une activité de Young Caring",

    imageAltEn:
      "Children gathered during a Young Caring activity",

    date: null,
    location: null,

    published: true,
    featured: true,
    sortOrder: 1,
  },

  {
    id: "education",

    slug:
      "education-et-activites-collectives",

    category: "education",

    titleFr:
      "Éducation et activités collectives",

    titleEn:
      "Education and group activities",

    excerptFr:
      "Des activités pour encourager l’apprentissage, l’expression et la participation des enfants.",

    excerptEn:
      "Activities that encourage children's learning, expression and participation.",

    contentFr:
      "Young Caring organise des activités adaptées aux enfants afin de soutenir l’apprentissage, l’expression et la confiance dans un environnement collectif.",

    contentEn:
      "Young Caring organises activities adapted to children to support learning, expression and confidence in a group environment.",

    image: newsImages.education,

    imageAltFr:
      "Des enfants participant à une activité éducative",

    imageAltEn:
      "Children taking part in an educational activity",

    date: null,
    location: null,

    published: true,
    featured: false,
    sortOrder: 2,
  },

  {
    id: "donations",

    slug:
      "des-dons-prepares-pour-les-communautes",

    category: "donations",

    titleFr:
      "Des dons préparés pour les communautés",

    titleEn:
      "Donations prepared for communities",

    excerptFr:
      "Des dons matériels sont rassemblés et organisés avant leur remise aux bénéficiaires.",

    excerptEn:
      "Material donations are collected and organised before being delivered to beneficiaries.",

    contentFr:
      "Les équipes rassemblent et préparent les dons avec attention afin de faciliter leur distribution aux enfants, aux familles et aux communautés accompagnées.",

    contentEn:
      "Teams carefully collect and prepare donations to make their distribution to supported children, families and communities easier.",

    image: newsImages.donations,

    imageAltFr:
      "Des sacs et des cartons de dons préparés pour une distribution",

    imageAltEn:
      "Bags and boxes of donations prepared for distribution",

    date: null,
    location: null,

    published: true,
    featured: false,
    sortOrder: 3,
  },

  {
    id: "support",

    slug:
      "une-presence-attentive-aupres-des-enfants",

    category: "children",

    titleFr:
      "Une présence attentive auprès des enfants",

    titleEn:
      "A caring presence alongside children",

    excerptFr:
      "L’écoute et la proximité humaine occupent une place centrale dans les actions de Young Caring.",

    excerptEn:
      "Listening and human connection are central to Young Caring's actions.",

    contentFr:
      "Chaque rencontre est une occasion d’écouter, d’accompagner et de créer une relation de confiance avec les enfants présents pendant les activités.",

    contentEn:
      "Every meeting is an opportunity to listen, provide support and build trust with the children present during activities.",

    image: newsImages.support,

    imageAltFr:
      "Une bénévole tenant un enfant dans ses bras",

    imageAltEn:
      "A volunteer holding a child in her arms",

    date: null,
    location: null,

    published: true,
    featured: false,
    sortOrder: 4,
  },

  {
    id: "donation-preparation",

    slug:
      "la-preparation-des-dons-en-images",

    category: "donations",

    titleFr:
      "La préparation des dons en images",

    titleEn:
      "Preparing donations in pictures",

    excerptFr:
      "Les dons sont regroupés et organisés avant les activités menées auprès des communautés.",

    excerptEn:
      "Donations are gathered and organised before activities carried out alongside communities.",

    contentFr:
      "La préparation constitue une étape importante des actions. Les équipes regroupent les différents dons et organisent leur acheminement avant leur remise aux personnes accompagnées.",

    contentEn:
      "Preparation is an important stage of each action. Teams gather the different donations and organise their delivery before they are handed to the people being supported.",

    image: newsImages.preparation,

    imageAltFr:
      "Plusieurs sacs de dons regroupés avant une action",

    imageAltEn:
      "Several bags of donations gathered before an action",

    date: null,
    location: null,

    published: true,
    featured: false,
    sortOrder: 5,
  },

  {
    id: "families",

    slug:
      "a-la-rencontre-des-familles",

    category: "community",

    titleFr:
      "À la rencontre des familles",

    titleEn:
      "Meeting with families",

    excerptFr:
      "Young Caring échange directement avec les familles et les membres des communautés.",

    excerptEn:
      "Young Caring speaks directly with families and community members.",

    contentFr:
      "La rencontre avec les familles permet de partager, d’écouter et de mieux comprendre les réalités des communautés auprès desquelles Young Caring intervient.",

    contentEn:
      "Meeting families creates opportunities to share, listen and better understand the realities of the communities Young Caring works alongside.",

    image: newsImages.families,

    imageAltFr:
      "Des bénévoles, des enfants et des familles réunis",

    imageAltEn:
      "Volunteers, children and families gathered together",

    date: null,
    location: null,

    published: true,
    featured: false,
    sortOrder: 6,
  },

  {
    id: "volunteers",

    slug:
      "les-benevoles-mobilises-sur-le-terrain",

    category: "volunteers",

    titleFr:
      "Les bénévoles mobilisés sur le terrain",

    titleEn:
      "Volunteers mobilised in the field",

    excerptFr:
      "Des bénévoles engagés préparent et accompagnent les activités de Young Caring.",

    excerptEn:
      "Committed volunteers prepare and support Young Caring activities.",

    contentFr:
      "La mobilisation des bénévoles permet de préparer les interventions, d’accueillir les participants et d’accompagner les activités organisées sur le terrain.",

    contentEn:
      "Volunteer mobilisation helps prepare interventions, welcome participants and support activities organised in the field.",

    image: newsImages.volunteers,

    imageAltFr:
      "Des bénévoles de Young Caring pendant une activité",

    imageAltEn:
      "Young Caring volunteers during an activity",

    date: null,
    location: null,

    published: true,
    featured: false,
    sortOrder: 7,
  },
];

/*
 * Vérifie qu’un slug possède un format sûr.
 */

function isValidSlug(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 150 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}

/*
 * Vérifie une date facultative.
 */

function isValidOptionalDate(
  value: string | null
): boolean {
  if (value === null) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(
    `${value}T00:00:00.000Z`
  );

  return !Number.isNaN(parsedDate.getTime());
}

/*
 * Vérifie qu’une actualité possède toutes les données
 * indispensables avant son affichage.
 *
 * La date et le lieu restent facultatifs.
 */

export function isPublishedNewsItem(
  item: NewsItem
): item is PublishedNewsItem {
  return (
    item.published === true &&
    typeof item.slug === "string" &&
    isValidSlug(item.slug) &&
    typeof item.titleFr === "string" &&
    item.titleFr.trim().length > 0 &&
    typeof item.titleEn === "string" &&
    item.titleEn.trim().length > 0 &&
    typeof item.excerptFr === "string" &&
    item.excerptFr.trim().length > 0 &&
    typeof item.excerptEn === "string" &&
    item.excerptEn.trim().length > 0 &&
    typeof item.contentFr === "string" &&
    item.contentFr.trim().length > 0 &&
    typeof item.contentEn === "string" &&
    item.contentEn.trim().length > 0 &&
    typeof item.image === "string" &&
    item.image.startsWith("/") &&
    typeof item.imageAltFr === "string" &&
    item.imageAltFr.trim().length > 0 &&
    typeof item.imageAltEn === "string" &&
    item.imageAltEn.trim().length > 0 &&
    isValidOptionalDate(item.date) &&
    Number.isFinite(item.sortOrder) &&
    item.sortOrder >= 0
  );
}

/*
 * Retourne toutes les actualités publiées
 * dans leur ordre recommandé.
 */

export function getPublishedNews():
  readonly PublishedNewsItem[] {
  return newsItems
    .filter(isPublishedNewsItem)
    .sort(
      (firstItem, secondItem) =>
        firstItem.sortOrder -
        secondItem.sortOrder
    );
}

/*
 * Retourne l’actualité mise en avant.
 */

export function getFeaturedNews():
  PublishedNewsItem | undefined {
  return getPublishedNews().find(
    (item) => item.featured
  );
}

/*
 * Recherche une actualité par son slug.
 */

export function getNewsBySlug(
  slug: string
): PublishedNewsItem | undefined {
  const cleanSlug = slug.trim().toLowerCase();

  if (!isValidSlug(cleanSlug)) {
    return undefined;
  }

  return getPublishedNews().find(
    (item) => item.slug === cleanSlug
  );
}

/*
 * Retourne le contenu dans la langue active.
 */

export function getLocalizedNews(
  item: PublishedNewsItem,
  language: SupportedLanguage
): LocalizedNewsContent {
  if (language === "en") {
    return {
      title: item.titleEn,
      excerpt: item.excerptEn,
      content: item.contentEn,
      imageAlt: item.imageAltEn,
    };
  }

  return {
    title: item.titleFr,
    excerpt: item.excerptFr,
    content: item.contentFr,
    imageAlt: item.imageAltFr,
  };
}

/*
 * Nettoie les textes utilisés par la recherche.
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
 * Vérifie qu’une catégorie reçue est autorisée.
 */

export function isNewsCategoryId(
  value: unknown
): value is NewsCategoryId {
  return (
    typeof value === "string" &&
    newsCategories.some(
      (category) => category.id === value
    )
  );
}

/*
 * Filtre les actualités selon la catégorie et la recherche.
 */

export function filterNews(
  category: NewsCategoryId,
  search: string
): readonly PublishedNewsItem[] {
  const safeCategory = isNewsCategoryId(category)
    ? category
    : "all";

  const normalizedSearch = normalizeSearchText(
    search.slice(0, 80)
  );

  return getPublishedNews().filter((item) => {
    const matchesCategory =
      safeCategory === "all" ||
      item.category === safeCategory;

    if (!matchesCategory) {
      return false;
    }

    if (normalizedSearch.length === 0) {
      return true;
    }

    const searchableContent =
      normalizeSearchText(
        [
          item.titleFr,
          item.titleEn,
          item.excerptFr,
          item.excerptEn,
          item.contentFr,
          item.contentEn,
          item.location ?? "",
        ].join(" ")
      );

    return searchableContent.includes(
      normalizedSearch
    );
  });
}