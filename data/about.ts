import type { SupportedLanguage } from "@/config/site";

import type {
  AboutBeneficiary,
  AboutImages,
  AboutLegalIdentity,
  AboutMissionVision,
  AboutObjective,
  AboutPageData,
  AboutPresentation,
  AboutValue,
  BilingualText,
  GovernanceMember,
  LocalizedAboutBeneficiary,
  LocalizedAboutObjective,
  LocalizedAboutText,
  LocalizedAboutValue,
  LocalizedGovernanceMember,
  LocalizedMissionVision,
} from "@/types/about";

/**
 * Images déjà disponibles dans le projet.
 *
 * Aucun nouveau dossier d’images n’est nécessaire
 * pour construire la page À propos.
 */
export const aboutImages = {
  heroDesktop: "/images/home/hero-desktop.jpg",
  heroMobile: "/images/home/hero-mobile.jpg",
  introduction: "/images/home/about-young-caring.jpg",
  children: "/images/actions/action-children.jpg",
  education: "/images/actions/action-education.jpg",
  womenFamilies:
    "/images/actions/action-women-families.jpg",
  community: "/images/home/action-community.jpg",
} as const satisfies AboutImages;

/**
 * Informations officielles relevées sur le récépissé
 * de déclaration d’association.
 *
 * Le siège légal est conservé séparément de l’adresse
 * opérationnelle présente dans config/site.ts.
 */
export const aboutLegalIdentity = {
  legalName: "Young Caring",
  frenchName: "Jeune Bienveillant",
  abbreviation: "YC/JB",

  organizationType: {
    fr: "Organisation non gouvernementale déclarée en République du Bénin",
    en: "Non-governmental organisation declared in the Republic of Benin",
  },

  registrationNumber:
    "2026/4173/DEP-LIT/SG/SAG-ASSOC",

  constitutiveAssemblyDate: "2025-10-16",
  declarationReceiptDate: "2026-01-28",

  country: {
    fr: "République du Bénin",
    en: "Republic of Benin",
  },

  department: {
    fr: "Département du Littoral",
    en: "Littoral Department",
  },

  municipality: "Cotonou",

  district: {
    fr: "13e arrondissement",
    en: "13th district",
  },

  neighborhood: "Agla",

  registeredOffice: {
    fr: "Agla, 13e arrondissement, commune de Cotonou, département du Littoral, République du Bénin",
    en: "Agla, 13th district, municipality of Cotonou, Littoral Department, Republic of Benin",
  },
} as const satisfies AboutLegalIdentity;

/**
 * Présentation générale.
 *
 * Ce texte résume les objectifs du récépissé sans ajouter
 * de chiffres, de résultats ou d’activités non vérifiés.
 */
export const aboutPresentation = {
  label: {
    fr: "Qui sommes-nous ?",
    en: "Who are we?",
  },

  title: {
    fr: "Une organisation engagée au service des personnes vulnérables",
    en: "An organisation committed to supporting vulnerable people",
  },

  description: {
    fr: "Young Caring, également dénommée Jeune Bienveillant, est une organisation béninoise qui agit en faveur des enfants orphelins, des veuves vulnérables, des familles et des communautés. Ses interventions reposent sur l’accompagnement, la solidarité, l’éducation, la dignité et l’autonomisation.",
    en: "Young Caring, also known as Jeune Bienveillant, is a Beninese organisation working alongside orphaned children, vulnerable widows, families and communities. Its work is based on support, solidarity, education, dignity and empowerment.",
  },

  commitment: {
    fr: "Young Caring développe des actions adaptées aux réalités des bénéficiaires et encourage la coopération avec les institutions publiques, les organisations de la société civile et les partenaires.",
    en: "Young Caring develops initiatives adapted to the realities of beneficiaries and encourages cooperation with public institutions, civil society organisations and partners.",
  },
} as const satisfies AboutPresentation;

/**
 * Mission et vision synthétisées à partir des objectifs
 * officiellement déclarés par l’organisation.
 */
export const aboutMissionVision = {
  mission: {
    title: {
      fr: "Notre mission",
      en: "Our mission",
    },

    description: {
      fr: "Apporter un accompagnement matériel, alimentaire, sanitaire, éducatif, social et psychologique aux personnes vulnérables, tout en favorisant leur protection, leur insertion et leur autonomie.",
      en: "To provide material, food, health, educational, social and psychological support to vulnerable people while promoting their protection, inclusion and independence.",
    },
  },

  vision: {
    title: {
      fr: "Notre vision",
      en: "Our vision",
    },

    description: {
      fr: "Contribuer à une société plus bienveillante, inclusive et solidaire, dans laquelle les enfants, les veuves et les familles vulnérables peuvent vivre dignement et construire leur avenir.",
      en: "To contribute to a kinder, more inclusive and supportive society in which children, widows and vulnerable families can live with dignity and build their future.",
    },
  },
} as const satisfies AboutMissionVision;

/**
 * Principaux publics concernés par les objectifs
 * déclarés de Young Caring.
 */
export const aboutBeneficiaries = [
  {
    id: "children",

    title: {
      fr: "Enfants",
      en: "Children",
    },

    description: {
      fr: "Accompagner les enfants dans un environnement bienveillant favorisant leur protection, leur éducation et leur développement.",
      en: "Supporting children in a caring environment that promotes their protection, education and development.",
    },

    image: aboutImages.children,
  },

  {
    id: "orphans",

    title: {
      fr: "Enfants orphelins",
      en: "Orphaned children",
    },

    description: {
      fr: "Faciliter leur accès à l’éducation et leur apporter un soutien matériel, sanitaire, social et psychologique adapté.",
      en: "Facilitating their access to education and providing suitable material, health, social and psychological support.",
    },

    image: aboutImages.education,
  },

  {
    id: "widows",

    title: {
      fr: "Veuves vulnérables",
      en: "Vulnerable widows",
    },

    description: {
      fr: "Favoriser leur formation, leur autonomie économique, leur inclusion sociale et la défense de leurs droits.",
      en: "Promoting their training, economic independence, social inclusion and protection of their rights.",
    },

    image: aboutImages.womenFamilies,
  },

  {
    id: "families",

    title: {
      fr: "Familles vulnérables",
      en: "Vulnerable families",
    },

    description: {
      fr: "Soutenir les familles confrontées à des difficultés matérielles, alimentaires, sanitaires ou sociales.",
      en: "Supporting families facing material, food, health or social difficulties.",
    },

    image: aboutImages.womenFamilies,
  },

  {
    id: "communities",

    title: {
      fr: "Communautés",
      en: "Communities",
    },

    description: {
      fr: "Encourager les actions collectives, le développement durable, le partage et l’entraide au sein des communautés.",
      en: "Encouraging collective action, sustainable development, sharing and mutual support within communities.",
    },

    image: aboutImages.community,
  },
] as const satisfies readonly AboutBeneficiary[];

/**
 * Objectifs issus du récépissé de déclaration.
 *
 * Les formulations ont été adaptées pour une lecture web
 * tout en conservant le sens du document officiel.
 */
export const aboutObjectives = [
  {
    id: "materialSupport",

    title: {
      fr: "Soutien essentiel",
      en: "Essential support",
    },

    description: {
      fr: "Apporter un soutien matériel, alimentaire, sanitaire et psychologique aux enfants orphelins et aux femmes veuves vulnérables.",
      en: "Provide material, food, health and psychological support to orphaned children and vulnerable widows.",
    },
  },

  {
    id: "education",

    title: {
      fr: "Accès à l’éducation",
      en: "Access to education",
    },

    description: {
      fr: "Faciliter l’accès des enfants orphelins à l’éducation et favoriser leur maintien dans un parcours d’apprentissage.",
      en: "Facilitate access to education for orphaned children and support their continued learning.",
    },
  },

  {
    id: "widowsTraining",

    title: {
      fr: "Formation et autonomie",
      en: "Training and independence",
    },

    description: {
      fr: "Promouvoir la formation des veuves afin de favoriser leur autonomie économique et sociale.",
      en: "Promote training for widows to support their economic and social independence.",
    },
  },

  {
    id: "reintegration",

    title: {
      fr: "Réinsertion",
      en: "Reintegration",
    },

    description: {
      fr: "Mettre en place des programmes adaptés de réinsertion scolaire, professionnelle et sociale.",
      en: "Develop suitable educational, professional and social reintegration programmes.",
    },
  },

  {
    id: "rightsProtection",

    title: {
      fr: "Défense des droits",
      en: "Protection of rights",
    },

    description: {
      fr: "Défendre les droits des enfants orphelins et des femmes veuves.",
      en: "Defend the rights of orphaned children and widows.",
    },
  },

  {
    id: "discriminationPrevention",

    title: {
      fr: "Lutte contre les discriminations",
      en: "Fighting discrimination",
    },

    description: {
      fr: "Lutter contre la stigmatisation, la marginalisation et les différentes formes de discrimination.",
      en: "Fight stigma, marginalisation and the different forms of discrimination.",
    },
  },

  {
    id: "economicDevelopment",

    title: {
      fr: "Développement économique et durable",
      en: "Economic and sustainable development",
    },

    description: {
      fr: "Initier des projets générateurs de revenus et des actions de développement durable au bénéfice des familles et des communautés.",
      en: "Develop income-generating projects and sustainable development initiatives for families and communities.",
    },
  },

  {
    id: "institutionalCooperation",

    title: {
      fr: "Coopération",
      en: "Cooperation",
    },

    description: {
      fr: "Collaborer avec les institutions publiques, les organisations de la société civile et les partenaires internationaux afin de renforcer l’impact des actions.",
      en: "Work with public institutions, civil society organisations and international partners to strengthen the impact of initiatives.",
    },
  },

  {
    id: "solidarityValues",

    title: {
      fr: "Bienveillance et entraide",
      en: "Kindness and mutual support",
    },

    description: {
      fr: "Encourager les valeurs de bienveillance, de partage et d’entraide entre les membres de la société.",
      en: "Encourage kindness, sharing and mutual support among members of society.",
    },
  },
] as const satisfies readonly AboutObjective[];

/**
 * Valeurs directement liées aux objectifs
 * déclarés de l’organisation.
 */
export const aboutValues = [
  {
    id: "kindness",

    title: {
      fr: "Bienveillance",
      en: "Kindness",
    },

    description: {
      fr: "Accueillir, écouter et accompagner chaque personne avec attention et humanité.",
      en: "Welcome, listen to and support every person with care and humanity.",
    },
  },

  {
    id: "solidarity",

    title: {
      fr: "Solidarité",
      en: "Solidarity",
    },

    description: {
      fr: "Unir les efforts pour apporter des réponses concrètes aux personnes et aux communautés.",
      en: "Bring efforts together to provide practical support to people and communities.",
    },
  },

  {
    id: "dignity",

    title: {
      fr: "Dignité",
      en: "Dignity",
    },

    description: {
      fr: "Respecter les droits, la valeur et l’histoire de chaque personne accompagnée.",
      en: "Respect the rights, worth and personal journey of every person supported.",
    },
  },

  {
    id: "sharing",

    title: {
      fr: "Partage",
      en: "Sharing",
    },

    description: {
      fr: "Créer des liens durables fondés sur l’écoute, l’entraide et la transmission.",
      en: "Build lasting relationships based on listening, mutual support and knowledge sharing.",
    },
  },

  {
    id: "inclusion",

    title: {
      fr: "Inclusion",
      en: "Inclusion",
    },

    description: {
      fr: "Agir contre la marginalisation, la stigmatisation et les discriminations.",
      en: "Act against marginalisation, stigma and discrimination.",
    },
  },

  {
    id: "responsibility",

    title: {
      fr: "Responsabilité",
      en: "Responsibility",
    },

    description: {
      fr: "Mener les actions avec sérieux, transparence et respect des engagements de l’organisation.",
      en: "Carry out initiatives with professionalism, transparency and respect for the organisation’s commitments.",
    },
  },
] as const satisfies readonly AboutValue[];

/**
 * Conseil d’administration mentionné sur le récépissé.
 */
export const governanceMembers = [
  {
    id: "aubin-saturnin-agbonon",
    fullName: "AGBONON Aubin Saturnin",
    role: "president",

    roleLabel: {
      fr: "Président",
      en: "President",
    },
  },

  {
    id: "messanh-drewes-hounsougan",
    fullName: "HOUNSOUGAN Messanh Drewes",
    role: "secretaryGeneral",

    roleLabel: {
      fr: "Secrétaire général",
      en: "Secretary General",
    },
  },

  {
    id: "agbetchekpo-borice-tchikpe",
    fullName: "TCHIKPE Agbètchèkpo Borice",
    role: "treasurerGeneral",

    roleLabel: {
      fr: "Trésorier général",
      en: "General Treasurer",
    },
  },
] as const satisfies readonly GovernanceMember[];

/**
 * Configuration complète et centralisée de la page.
 */
export const aboutPageData = {
  images: aboutImages,
  legalIdentity: aboutLegalIdentity,
  presentation: aboutPresentation,
  missionVision: aboutMissionVision,
  beneficiaries: aboutBeneficiaries,
  objectives: aboutObjectives,
  values: aboutValues,
  governance: governanceMembers,
} as const satisfies AboutPageData;

/**
 * Retourne un texte dans la langue demandée.
 *
 * Le français est utilisé comme solution de secours
 * si une langue non reconnue arrive accidentellement.
 */
export function getLocalizedAboutText(
  text: BilingualText,
  language: SupportedLanguage
): string {
  return language === "en" ? text.en : text.fr;
}

export function getLocalizedPresentation(
  language: SupportedLanguage
): LocalizedAboutText & {
  commitment: string;
} {
  return {
    label: getLocalizedAboutText(
      aboutPresentation.label,
      language
    ),
    title: getLocalizedAboutText(
      aboutPresentation.title,
      language
    ),
    description: getLocalizedAboutText(
      aboutPresentation.description,
      language
    ),
    commitment: getLocalizedAboutText(
      aboutPresentation.commitment,
      language
    ),
  };
}

export function getLocalizedMissionVision(
  language: SupportedLanguage
): LocalizedMissionVision {
  return {
    mission: {
      title: getLocalizedAboutText(
        aboutMissionVision.mission.title,
        language
      ),
      description: getLocalizedAboutText(
        aboutMissionVision.mission.description,
        language
      ),
    },

    vision: {
      title: getLocalizedAboutText(
        aboutMissionVision.vision.title,
        language
      ),
      description: getLocalizedAboutText(
        aboutMissionVision.vision.description,
        language
      ),
    },
  };
}

export function getLocalizedBeneficiaries(
  language: SupportedLanguage
): readonly LocalizedAboutBeneficiary[] {
  return aboutBeneficiaries.map((beneficiary) => ({
    id: beneficiary.id,
    title: getLocalizedAboutText(
      beneficiary.title,
      language
    ),
    description: getLocalizedAboutText(
      beneficiary.description,
      language
    ),
    image: beneficiary.image,
  }));
}

export function getLocalizedObjectives(
  language: SupportedLanguage
): readonly LocalizedAboutObjective[] {
  return aboutObjectives.map((objective) => ({
    id: objective.id,
    title: getLocalizedAboutText(
      objective.title,
      language
    ),
    description: getLocalizedAboutText(
      objective.description,
      language
    ),
  }));
}

export function getLocalizedValues(
  language: SupportedLanguage
): readonly LocalizedAboutValue[] {
  return aboutValues.map((value) => ({
    id: value.id,
    title: getLocalizedAboutText(
      value.title,
      language
    ),
    description: getLocalizedAboutText(
      value.description,
      language
    ),
  }));
}

export function getLocalizedGovernance(
  language: SupportedLanguage
): readonly LocalizedGovernanceMember[] {
  return governanceMembers.map((member) => ({
    id: member.id,
    fullName: member.fullName,
    role: member.role,
    roleLabel: getLocalizedAboutText(
      member.roleLabel,
      language
    ),
  }));
}

/**
 * Formate une date officielle sans dépendre
 * du fuseau horaire de l’appareil.
 */
export function formatOfficialDate(
  date: string,
  language: SupportedLanguage
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const parsedDate = new Date(
    `${date}T00:00:00.000Z`
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(
    language === "fr" ? "fr-FR" : "en-US",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(parsedDate);
}
