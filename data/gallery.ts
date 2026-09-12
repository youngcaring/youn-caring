import type { SupportedLanguage } from "@/config/site";

import type {
  GalleryCategory,
  GalleryCategoryId,
  GalleryImages,
  GalleryItem,
  LocalizedGalleryItem,
  PublishedGalleryItem,
  SpecificGalleryCategoryId,
} from "@/types/gallery";

/**
 * Images principales utilisées par la page Galerie.
 *
 * Toutes ces images sont déjà présentes dans public/images.
 */
export const galleryImages = {
  heroDesktop:
    "/images/actions/actions-hero-desktop.jpg",

  heroMobile:
    "/images/actions/actions-hero-mobile.jpg",

  callToAction:
    "/images/actions/actions-donation-banner.jpg",
} as const satisfies GalleryImages;

/**
 * Catégories disponibles pour filtrer les photographies.
 */
export const galleryCategories = [
  {
    id: "all",
    labelFr: "Toutes les photos",
    labelEn: "All photographs",
  },
  {
    id: "education",
    labelFr: "Éducation",
    labelEn: "Education",
  },
  {
    id: "children",
    labelFr: "Enfance",
    labelEn: "Children",
  },
  {
    id: "solidarity",
    labelFr: "Solidarité",
    labelEn: "Solidarity",
  },
  {
    id: "health",
    labelFr: "Santé",
    labelEn: "Health",
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
] as const satisfies readonly GalleryCategory[];

/**
 * Photographies présentées dans la galerie.
 *
 * Les textes décrivent les domaines d’intervention visibles
 * sans inventer de date, de lieu ou de résultat chiffré.
 */
export const galleryItems = [
  {
    id: "children-group-activity",
    category: "children",

    titleFr:
      "Un moment partagé avec les enfants",
    titleEn:
      "A shared moment with children",

    descriptionFr:
      "Un moment de proximité, d’écoute et de partage avec les enfants pendant une activité collective.",

    descriptionEn:
      "A moment of connection, listening and sharing with children during a group activity.",

    image:
      "/images/actions/action-children.jpg",

    imageAltFr:
      "Des enfants réunis pendant une activité de Young Caring",

    imageAltEn:
      "Children gathered during a Young Caring activity",

    published: true,
    featured: true,
    sortOrder: 1,
  },

  {
    id: "education-activity",
    category: "education",

    titleFr:
      "Apprendre et grandir ensemble",
    titleEn:
      "Learning and growing together",

    descriptionFr:
      "Une activité consacrée à l’apprentissage, à l’expression et à la participation des enfants.",

    descriptionEn:
      "An activity dedicated to children’s learning, expression and participation.",

    image:
      "/images/actions/action-education.jpg",

    imageAltFr:
      "Des enfants participant à une activité éducative",

    imageAltEn:
      "Children participating in an educational activity",

    published: true,
    featured: true,
    sortOrder: 2,
  },

  {
    id: "food-support-preparation",
    category: "solidarity",

    titleFr:
      "Préparation de l’aide alimentaire",
    titleEn:
      "Preparing food assistance",

    descriptionFr:
      "Des vivres et des produits essentiels préparés avec attention avant leur remise aux bénéficiaires.",

    descriptionEn:
      "Food and essential supplies carefully prepared before being delivered to beneficiaries.",

    image:
      "/images/actions/action-food-support.jpg",

    imageAltFr:
      "Des vivres préparés pour une action solidaire",

    imageAltEn:
      "Food supplies prepared for a solidarity initiative",

    published: true,
    featured: true,
    sortOrder: 3,
  },

  {
    id: "health-support",
    category: "health",

    titleFr:
      "Prendre soin des plus vulnérables",
    titleEn:
      "Caring for vulnerable people",

    descriptionFr:
      "Une présence attentive consacrée au bien-être, à l’accompagnement et à la sensibilisation.",

    descriptionEn:
      "A caring presence focused on well-being, support and awareness.",

    image:
      "/images/actions/action-health.jpg",

    imageAltFr:
      "Une action d’accompagnement liée à la santé",

    imageAltEn:
      "A health-related support initiative",

    published: true,
    featured: false,
    sortOrder: 4,
  },

  {
    id: "clothing-and-essential-kits",
    category: "solidarity",

    titleFr:
      "Vêtements et produits essentiels",
    titleEn:
      "Clothing and essential supplies",

    descriptionFr:
      "Des vêtements, des kits et différents produits préparés pour répondre à des besoins essentiels.",

    descriptionEn:
      "Clothing, kits and other supplies prepared to meet essential needs.",

    image:
      "/images/actions/action-clothing.jpg",

    imageAltFr:
      "Des vêtements et produits essentiels destinés aux bénéficiaires",

    imageAltEn:
      "Clothing and essential supplies intended for beneficiaries",

    published: true,
    featured: false,
    sortOrder: 5,
  },

  {
    id: "women-and-families",
    category: "community",

    titleFr:
      "Aux côtés des femmes et des familles",
    titleEn:
      "Alongside women and families",

    descriptionFr:
      "Des échanges et des actions de proximité auprès des femmes, des familles et des communautés.",

    descriptionEn:
      "Conversations and community-based initiatives alongside women, families and communities.",

    image:
      "/images/actions/action-women-families.jpg",

    imageAltFr:
      "Des femmes et des familles réunies pendant une activité",

    imageAltEn:
      "Women and families gathered during an activity",

    published: true,
    featured: false,
    sortOrder: 6,
  },

  {
    id: "water-and-hygiene",
    category: "health",

    titleFr:
      "Eau, hygiène et dignité",
    titleEn:
      "Water, hygiene and dignity",

    descriptionFr:
      "Une action autour de l’accès à l’eau, de l’hygiène et des conditions essentielles de dignité.",

    descriptionEn:
      "An initiative focused on access to water, hygiene and essential conditions for dignity.",

    image:
      "/images/actions/action-water-hygiene.jpg",

    imageAltFr:
      "Une action de sensibilisation à l’eau et à l’hygiène",

    imageAltEn:
      "A water and hygiene awareness initiative",

    published: true,
    featured: false,
    sortOrder: 7,
  },

  {
    id: "volunteer-mobilisation",
    category: "volunteers",

    titleFr:
      "Une équipe mobilisée sur le terrain",
    titleEn:
      "A team mobilised in the field",

    descriptionFr:
      "Des bénévoles engagés dans la préparation et l’accompagnement des activités de Young Caring.",

    descriptionEn:
      "Volunteers committed to preparing and supporting Young Caring’s activities.",

    image:
      "/images/actions/action-emergency.jpg",

    imageAltFr:
      "Des bénévoles mobilisés pendant une activité de terrain",

    imageAltEn:
      "Volunteers mobilised during a field activity",

    published: true,
    featured: false,
    sortOrder: 8,
  },

  {
    id: "community-meeting",
    category: "community",

    titleFr:
      "À la rencontre des communautés",
    titleEn:
      "Meeting communities",

    descriptionFr:
      "Un moment de rencontre, d’écoute et de partage avec les membres d’une communauté.",

    descriptionEn:
      "A moment of meeting, listening and sharing with members of a community.",

    image:
      "/images/home/action-community.jpg",

    imageAltFr:
      "Une rencontre avec les membres d’une communauté",

    imageAltEn:
      "A meeting with community members",

    published: true,
    featured: false,
    sortOrder: 9,
  },

  {
    id: "children-solidarity",
    category: "children",

    titleFr:
      "Enfance et solidarité",
    titleEn:
      "Children and solidarity",

    descriptionFr:
      "Une présence bienveillante auprès des enfants pour favoriser le partage et la confiance.",

    descriptionEn:
      "A caring presence alongside children to encourage sharing and confidence.",

    image:
      "/images/home/action-children.jpg",

    imageAltFr:
      "Des enfants accompagnés pendant une action solidaire",

    imageAltEn:
      "Children supported during a solidarity initiative",

    published: true,
    featured: false,
    sortOrder: 10,
  },

  {
    id: "educational-support",
    category: "education",

    titleFr:
      "Soutenir l’éducation",
    titleEn:
      "Supporting education",

    descriptionFr:
      "Une action éducative destinée à encourager l’apprentissage et la participation des enfants.",

    descriptionEn:
      "An educational initiative encouraging children’s learning and participation.",

    image:
      "/images/home/action-education.jpg",

    imageAltFr:
      "Des enfants pendant une activité consacrée à l’éducation",

    imageAltEn:
      "Children during an education-focused activity",

    published: true,
    featured: false,
    sortOrder: 11,
  },

  {
    id: "material-donations",
    category: "solidarity",

    titleFr:
      "Des dons matériels préparés avec soin",
    titleEn:
      "Material donations prepared with care",

    descriptionFr:
      "Des produits rassemblés et organisés avant leur distribution aux personnes accompagnées.",

    descriptionEn:
      "Supplies collected and organised before being distributed to supported people.",

    image:
      "/images/home/news-action-01.jpg",

    imageAltFr:
      "Des dons matériels préparés pour une distribution",

    imageAltEn:
      "Material donations prepared for distribution",

    published: true,
    featured: false,
    sortOrder: 12,
  },

  {
    id: "field-mobilisation",
    category: "volunteers",

    titleFr:
      "Mobilisation pendant une action",
    titleEn:
      "Mobilisation during an activity",

    descriptionFr:
      "Les membres et les bénévoles participent à la préparation et au déroulement des actions sur le terrain.",

    descriptionEn:
      "Members and volunteers take part in preparing and carrying out field activities.",

    image:
      "/images/home/news-action-02.jpg",

    imageAltFr:
      "Une équipe mobilisée pendant une activité de Young Caring",

    imageAltEn:
      "A team mobilised during a Young Caring activity",

    published: true,
    featured: false,
    sortOrder: 13,
  },

  {
    id: "team-commitment",
    category: "volunteers",

    titleFr:
      "L’engagement de notre équipe",
    titleEn:
      "The commitment of our team",

    descriptionFr:
      "Une équipe unie autour des valeurs de bienveillance, de partage et d’entraide.",

    descriptionEn:
      "A team united around the values of kindness, sharing and mutual support.",

    image:
      "/images/home/news-action-03.jpg",

    imageAltFr:
      "Des membres de Young Caring réunis pendant une activité",

    imageAltEn:
      "Young Caring members gathered during an activity",

    published: true,
    featured: false,
    sortOrder: 14,
  },

  {
    id: "human-connection",
    category: "children",

    titleFr:
      "Créer des liens de confiance",
    titleEn:
      "Building trusting relationships",

    descriptionFr:
      "Les échanges humains occupent une place essentielle dans l’accompagnement des enfants.",

    descriptionEn:
      "Human connection plays an essential role in supporting children.",

    image:
      "/images/home/about-young-caring.jpg",

    imageAltFr:
      "Un membre de Young Caring échangeant avec un enfant",

    imageAltEn:
      "A Young Caring member speaking with a child",

    published: true,
    featured: false,
    sortOrder: 15,
  },
] as const satisfies readonly GalleryItem[];

/**
 * Vérifie qu’une valeur correspond
 * à une catégorie autorisée.
 */
export function isGalleryCategoryId(
  value: unknown
): value is GalleryCategoryId {
  return (
    typeof value === "string" &&
    galleryCategories.some(
      (category) => category.id === value
    )
  );
}

/**
 * Vérifie qu’une catégorie peut être attribuée
 * directement à une photographie.
 */
export function isSpecificGalleryCategoryId(
  value: unknown
): value is SpecificGalleryCategoryId {
  return (
    isGalleryCategoryId(value) &&
    value !== "all"
  );
}

/**
 * Vérifie qu’une photographie possède toutes
 * les informations nécessaires à son affichage.
 */
export function isPublishedGalleryItem(
  item: GalleryItem
): item is PublishedGalleryItem {
  return (
    item.published === true &&
    item.id.trim().length > 0 &&
    item.id.length <= 120 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      item.id
    ) &&
    isSpecificGalleryCategoryId(
      item.category
    ) &&
    item.titleFr.trim().length > 0 &&
    item.titleEn.trim().length > 0 &&
    item.descriptionFr.trim().length > 0 &&
    item.descriptionEn.trim().length > 0 &&
    item.image.startsWith("/") &&
    item.imageAltFr.trim().length > 0 &&
    item.imageAltEn.trim().length > 0 &&
    Number.isInteger(item.sortOrder) &&
    item.sortOrder >= 0
  );
}

/**
 * Retourne uniquement les photographies publiées
 * dans leur ordre d’affichage.
 */
export function getPublishedGalleryItems(): readonly PublishedGalleryItem[] {
  return galleryItems
    .filter(isPublishedGalleryItem)
    .sort(
      (firstItem, secondItem) =>
        firstItem.sortOrder -
        secondItem.sortOrder
    );
}

/**
 * Retourne le contenu d’une photographie
 * dans la langue active.
 */
export function getLocalizedGalleryItem(
  item: GalleryItem,
  language: SupportedLanguage
): LocalizedGalleryItem {
  if (language === "en") {
    return {
      id: item.id,
      category: item.category,
      title: item.titleEn,
      description: item.descriptionEn,
      image: item.image,
      imageAlt: item.imageAltEn,
      featured: item.featured,
    };
  }

  return {
    id: item.id,
    category: item.category,
    title: item.titleFr,
    description: item.descriptionFr,
    image: item.image,
    imageAlt: item.imageAltFr,
    featured: item.featured,
  };
}

/**
 * Retourne le nom d’une catégorie
 * dans la langue active.
 */
export function getGalleryCategoryLabel(
  categoryId: GalleryCategoryId,
  language: SupportedLanguage
): string {
  const category = galleryCategories.find(
    (item) => item.id === categoryId
  );

  if (!category) {
    return language === "fr"
      ? "Photographie"
      : "Photograph";
  }

  return language === "en"
    ? category.labelEn
    : category.labelFr;
}

/**
 * Normalise une valeur pour permettre une recherche
 * sans tenir compte des accents ou des majuscules.
 */
function normalizeSearchValue(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Filtre les photographies selon la catégorie
 * et le texte recherché.
 */
export function filterGalleryItems(
  category: GalleryCategoryId,
  search: string
): readonly PublishedGalleryItem[] {
  const safeCategory = isGalleryCategoryId(
    category
  )
    ? category
    : "all";

  const normalizedSearch =
    normalizeSearchValue(
      search.slice(0, 80)
    );

  return getPublishedGalleryItems().filter(
    (item) => {
      if (
        safeCategory !== "all" &&
        item.category !== safeCategory
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableContent =
        normalizeSearchValue(
          [
            item.titleFr,
            item.titleEn,
            item.descriptionFr,
            item.descriptionEn,
            getGalleryCategoryLabel(
              item.category,
              "fr"
            ),
            getGalleryCategoryLabel(
              item.category,
              "en"
            ),
          ].join(" ")
        );

      return searchableContent.includes(
        normalizedSearch
      );
    }
  );
}