/* =========================================================
   TYPES
   ========================================================= */

export type SupportedLanguage = "fr" | "en";

export type SocialNetwork =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "linkedin";

export type ImpactStatisticId =
  | "peopleHelped"
  | "projectsCompleted"
  | "fundsDistributed"
  | "communitiesReached";

export type SiteSocialLink = Readonly<{
  name: SocialNetwork;
  label: string;
  username: string | null;
  url: string | null;
  enabled: boolean;
}>;

export type PaymentMethod = Readonly<{
  id: string;
  name: string;
  enabled: boolean;
}>;

export type ImpactStatistic = Readonly<{
  id: ImpactStatisticId;
  value: number | null;
}>;

/* =========================================================
   COORDONNÉES OFFICIELLES
   ========================================================= */

/*
 * Ces informations sont publiques.
 * Aucune clé secrète ou information de paiement
 * ne doit être enregistrée dans ce fichier.
 */

const phoneDisplay = "+229 01 57 77 46 73";
const phoneInternational = "+2290157774673";
const whatsappNumber = "2290157774673";

const emailAddress = "contact@young-caring.org";

const physicalAddress = "Abomey-Calavi, Bénin";

/* =========================================================
   RÉSEAUX SOCIAUX
   ========================================================= */

/*
 * Cette déclaration séparée élargit correctement les types.
 * Une plateforme désactivée ne doit pas être affichée.
 */

const socialLinks: readonly SiteSocialLink[] = [
  {
    name: "facebook",
    label: "Facebook",
    username: "Young Caring",
    url: "https://www.facebook.com/share/14nQGMcNn3f/",
    enabled: true,
  },
  {
    name: "instagram",
    label: "Instagram",
    username: "@ong.youngcaring",
    url: "https://www.instagram.com/ong.youngcaring/",
    enabled: true,
  },
  {
    name: "tiktok",
    label: "TikTok",
    username: "@ong.young.caring",
    url: "https://www.tiktok.com/@ong.young.caring",
    enabled: true,
  },
  {
    name: "youtube",
    label: "YouTube",
    username: null,
    url: null,
    enabled: false,
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    username: null,
    url: null,
    enabled: false,
  },
];

/* =========================================================
   MOYENS DE PAIEMENT
   ========================================================= */

/*
 * La liste reste vide tant qu’aucun véritable moyen
 * de paiement n’est connecté et confirmé.
 *
 * Le type explicite empêche TypeScript de transformer
 * cette liste vide en never[].
 */

const paymentMethods: readonly PaymentMethod[] = [];

/*
 * Exemple à utiliser uniquement lorsqu’un véritable
 * service de paiement sera connecté :
 *
 * const paymentMethods: readonly PaymentMethod[] = [
 *   {
 *     id: "mobile-money",
 *     name: "Mobile Money",
 *     enabled: true,
 *   },
 * ];
 */

/* =========================================================
   STATISTIQUES D’IMPACT
   ========================================================= */

/*
 * Les valeurs restent null tant que Young Caring
 * n’a pas fourni les chiffres officiels.
 *
 * Le type ImpactStatistic[] permet de remplacer plus tard
 * une valeur null par un nombre sans erreur TypeScript.
 */

const impactStatistics: readonly ImpactStatistic[] = [
  {
    id: "peopleHelped",
    value: null,
  },
  {
    id: "projectsCompleted",
    value: null,
  },
  {
    id: "fundsDistributed",
    value: null,
  },
  {
    id: "communitiesReached",
    value: null,
  },
];

/* =========================================================
   CONFIGURATION PUBLIQUE DU SITE
   ========================================================= */

export const siteConfig = {
  organization: {
    name: "Young Caring",
    legalName: "Young Caring",
    logo: "/logo/logo.png",

    defaultLanguage: "fr" as SupportedLanguage,

    supportedLanguages: [
      "fr",
      "en",
    ] as const satisfies readonly SupportedLanguage[],
  },

  contact: {
    phone: {
      display: phoneDisplay,
      international: phoneInternational,
      href: `tel:${phoneInternational}`,
    },

    whatsapp: {
      display: phoneDisplay,
      number: whatsappNumber,
      href: `https://wa.me/${whatsappNumber}`,
    },

    email: {
      display: emailAddress,
      href: `mailto:${emailAddress}`,
    },

    address: {
      display: physicalAddress,
      city: "Abomey-Calavi",
      country: "Bénin",
      countryCode: "BJ",

      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=Abomey-Calavi%2C%20B%C3%A9nin",
    },
  },

  navigation: {
    home: "/",
    about: "/a-propos",
    actions: "/actions",
    campaigns: "/campagnes",
    transparency: "/transparence",
    gallery: "/galerie",
    news: "/actualites",
    contact: "/contact",
    donation: "/don",
    volunteer: "/benevolat",
    partnership: "/partenariat",
  },

  legalPages: {
    legalNotice: "/mentions-legales",
    privacyPolicy: "/politique-de-confidentialite",
    donationTerms: "/conditions-de-don",
  },

  socialLinks,

  paymentMethods,

  donation: {
    currency: "XOF",
    currencyLabel: "FCFA",

    suggestedAmounts: [
      5000,
      10000,
      25000,
      50000,
      100000,
    ] as const,

    minimumAmount: 500,
  },

  impactStatistics,

  security: {
    externalLinksRel: "noopener noreferrer",

    allowedLanguages: [
      "fr",
      "en",
    ] as const satisfies readonly SupportedLanguage[],
  },
} as const;

export type SiteConfig = typeof siteConfig;