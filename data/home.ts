import { siteConfig } from "@/config/site";

/* =========================================================
   TYPES DE LA PAGE D’ACCUEIL
   ========================================================= */

export type HomeActionId =
  | "education"
  | "community"
  | "children";

export type HomeImageId =
  | "heroDesktop"
  | "heroMobile"
  | "about"
  | "education"
  | "community"
  | "children"
  | "donation"
  | "newsAction01"
  | "newsAction02"
  | "newsAction03";

export type HomeActionCard = Readonly<{
  id: HomeActionId;
  href: string;
  image: string;
}>;

export type HomeNewsItem = Readonly<{
  id: string;
  slug: string | null;
  titleFr: string | null;
  titleEn: string | null;
  date: string | null;
  location: string | null;
  image: string;
  published: boolean;
}>;

export type HomeCampaign = Readonly<{
  id: string;
  slug: string | null;
  titleFr: string | null;
  titleEn: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  collectedAmount: number | null;
  targetAmount: number | null;
  beneficiaries: number | null;
  image: string;
  active: boolean;
}>;

export type HomeImageMetadata = Readonly<{
  src: string;
  width: number;
  height: number;
}>;

/* =========================================================
   IMAGES DE LA PAGE D’ACCUEIL
   ========================================================= */

/*
 * Les images physiques doivent être enregistrées dans :
 *
 * public/images/home
 *
 * Dans les composants Next.js, les chemins commencent
 * directement par /images.
 */

export const homeImages = {
  heroDesktop: "/images/home/hero-desktop.jpg",
  heroMobile: "/images/home/hero-mobile.jpg",

  about: "/images/home/about-young-caring.jpg",

  education: "/images/home/action-education.jpg",
  community: "/images/home/action-community.jpg",
  children: "/images/home/action-children.jpg",

  donation: "/images/home/donation-background.jpg",

  newsAction01: "/images/home/news-action-01.jpg",
  newsAction02: "/images/home/news-action-02.jpg",
  newsAction03: "/images/home/news-action-03.jpg",

  /*
   * Ce tableau reste disponible pour être compatible
   * avec LatestNewsSection.tsx.
   */
  news: [
    "/images/home/news-action-01.jpg",
    "/images/home/news-action-02.jpg",
    "/images/home/news-action-03.jpg",
  ],
} as const satisfies Record<
  HomeImageId | "news",
  string | readonly string[]
>;

/* =========================================================
   DIMENSIONS DES IMAGES
   ========================================================= */

export const homeImageMetadata: Readonly<
  Record<HomeImageId, HomeImageMetadata>
> = {
  heroDesktop: {
    src: homeImages.heroDesktop,
    width: 1600,
    height: 900,
  },

  heroMobile: {
    src: homeImages.heroMobile,
    width: 900,
    height: 1200,
  },

  about: {
    src: homeImages.about,
    width: 1400,
    height: 933,
  },

  education: {
    src: homeImages.education,
    width: 1200,
    height: 800,
  },

  community: {
    src: homeImages.community,
    width: 1200,
    height: 800,
  },

  children: {
    src: homeImages.children,
    width: 900,
    height: 1200,
  },

  donation: {
    src: homeImages.donation,
    width: 1600,
    height: 900,
  },

  newsAction01: {
    src: homeImages.newsAction01,
    width: 1200,
    height: 800,
  },

  newsAction02: {
    src: homeImages.newsAction02,
    width: 1200,
    height: 800,
  },

  newsAction03: {
    src: homeImages.newsAction03,
    width: 1200,
    height: 800,
  },
};

/* =========================================================
   CARTES DES DOMAINES D’ACTION
   ========================================================= */

export const homeActionCards: readonly HomeActionCard[] = [
  {
    id: "education",
    href: "/actions/education",
    image: homeImages.education,
  },
  {
    id: "community",
    href: "/actions",
    image: homeImages.community,
  },
  {
    id: "children",
    href: "/actions",
    image: homeImages.children,
  },
];

/* =========================================================
   ACTUALITÉS
   ========================================================= */

/*
 * Les informations encore inconnues restent null.
 *
 * Lorsqu’une actualité est complète et officiellement publiée,
 * remplacer published par true et fournir :
 *
 * - le slug ;
 * - les titres français et anglais ;
 * - la date officielle ;
 * - le lieu, s’il est connu.
 */

export const homeNewsItems: readonly HomeNewsItem[] = [
  {
    id: "action-01",
    slug: null,
    titleFr: null,
    titleEn: null,
    date: null,
    location: null,
    image: homeImages.newsAction01,
    published: false,
  },
  {
    id: "action-02",
    slug: null,
    titleFr: null,
    titleEn: null,
    date: null,
    location: null,
    image: homeImages.newsAction02,
    published: false,
  },
  {
    id: "action-03",
    slug: null,
    titleFr: null,
    titleEn: null,
    date: null,
    location: null,
    image: homeImages.newsAction03,
    published: false,
  },
];

/* =========================================================
   CAMPAGNE MISE EN AVANT
   ========================================================= */

/*
 * Cette campagne reste inactive jusqu’à la réception
 * des informations officielles.
 *
 * Ne pas remplacer les valeurs null par des données inventées.
 */

export const featuredCampaign: HomeCampaign = {
  id: "featured-campaign",
  slug: null,
  titleFr: null,
  titleEn: null,
  descriptionFr: null,
  descriptionEn: null,
  collectedAmount: null,
  targetAmount: null,
  beneficiaries: null,
  image: homeImages.donation,
  active: false,
};

/* =========================================================
   CONFIGURATION GÉNÉRALE DE L’ACCUEIL
   ========================================================= */

export const homeContent = {
  /*
   * Conservé pour être compatible avec ActionsSection.tsx.
   */
  actionCards: homeActionCards,

  /*
   * Les montants proviennent de config/site.ts.
   * Ils ne sont donc pas répétés dans plusieurs fichiers.
   */
  donationAmounts: siteConfig.donation.suggestedAmounts,

  links: {
    about: siteConfig.navigation.about,
    actions: siteConfig.navigation.actions,
    campaigns: siteConfig.navigation.campaigns,
    transparency: siteConfig.navigation.transparency,
    news: siteConfig.navigation.news,
    donation: siteConfig.navigation.donation,
    contact: siteConfig.navigation.contact,
  },

  sections: {
    hero: {
      enabled: true,
    },

    impact: {
      enabled: true,
      hideWhenEmpty: true,
    },

    about: {
      enabled: true,
    },

    actions: {
      enabled: true,
    },

    donation: {
      enabled: true,
    },

    latestNews: {
      enabled: true,
      maximumItems: 3,
    },

    transparency: {
      enabled: true,
    },

    newsletter: {
      enabled: true,
    },
  },
} as const;

/* =========================================================
   FONCTIONS DE VALIDATION
   ========================================================= */

/*
 * Retourne uniquement les actualités complètes
 * et officiellement publiées.
 */

export function getPublishedHomeNews(): readonly HomeNewsItem[] {
  return homeNewsItems.filter((item) => {
    const hasRequiredInformation =
      item.slug !== null &&
      item.titleFr !== null &&
      item.titleEn !== null &&
      item.date !== null;

    return item.published && hasRequiredInformation;
  });
}

/*
 * Vérifie si la campagne possède toutes les informations
 * nécessaires avant son affichage public.
 */

export function hasActiveFeaturedCampaign(): boolean {
  const hasTitles =
    featuredCampaign.titleFr !== null &&
    featuredCampaign.titleEn !== null;

  const hasDescription =
    featuredCampaign.descriptionFr !== null &&
    featuredCampaign.descriptionEn !== null;

  const hasAmounts =
    featuredCampaign.collectedAmount !== null &&
    featuredCampaign.targetAmount !== null &&
    featuredCampaign.targetAmount > 0;

  return (
    featuredCampaign.active &&
    featuredCampaign.slug !== null &&
    hasTitles &&
    hasDescription &&
    hasAmounts
  );
}

/*
 * Calcule la progression d’une campagne.
 *
 * La valeur retournée reste toujours comprise
 * entre 0 et 100.
 */

export function calculateCampaignProgress(
  collectedAmount: number,
  targetAmount: number
): number {
  if (
    !Number.isFinite(collectedAmount) ||
    !Number.isFinite(targetAmount) ||
    collectedAmount < 0 ||
    targetAmount <= 0
  ) {
    return 0;
  }

  const percentage = (collectedAmount / targetAmount) * 100;

  return Math.min(Math.max(percentage, 0), 100);
}