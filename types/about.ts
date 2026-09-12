import type { SupportedLanguage } from "@/config/site";

/**
 * Texte disponible dans les deux langues du site.
 */
export type BilingualText = Readonly<{
  fr: string;
  en: string;
}>;

/**
 * Images utilisées exclusivement par la page À propos.
 *
 * Les images proviennent des dossiers déjà existants.
 */
export type AboutImages = Readonly<{
  heroDesktop: string;
  heroMobile: string;
  introduction: string;
  children: string;
  education: string;
  womenFamilies: string;
  community: string;
}>;

/**
 * Informations juridiques issues du récépissé
 * de déclaration de l’association.
 */
export type AboutLegalIdentity = Readonly<{
  legalName: string;
  frenchName: string;
  abbreviation: string;
  organizationType: BilingualText;
  registrationNumber: string;
  constitutiveAssemblyDate: string;
  declarationReceiptDate: string;
  country: BilingualText;
  department: BilingualText;
  municipality: string;
  district: BilingualText;
  neighborhood: string;
  registeredOffice: BilingualText;
}>;

export type AboutPresentation = Readonly<{
  label: BilingualText;
  title: BilingualText;
  description: BilingualText;
  commitment: BilingualText;
}>;

export type AboutMissionVision = Readonly<{
  mission: Readonly<{
    title: BilingualText;
    description: BilingualText;
  }>;

  vision: Readonly<{
    title: BilingualText;
    description: BilingualText;
  }>;
}>;

export type AboutBeneficiaryId =
  | "children"
  | "orphans"
  | "widows"
  | "families"
  | "communities";

export type AboutBeneficiary = Readonly<{
  id: AboutBeneficiaryId;
  title: BilingualText;
  description: BilingualText;
  image: string;
}>;

export type AboutObjectiveId =
  | "materialSupport"
  | "education"
  | "widowsTraining"
  | "reintegration"
  | "rightsProtection"
  | "discriminationPrevention"
  | "economicDevelopment"
  | "institutionalCooperation"
  | "solidarityValues";

export type AboutObjective = Readonly<{
  id: AboutObjectiveId;
  title: BilingualText;
  description: BilingualText;
}>;

export type AboutValueId =
  | "kindness"
  | "solidarity"
  | "dignity"
  | "sharing"
  | "inclusion"
  | "responsibility";

export type AboutValue = Readonly<{
  id: AboutValueId;
  title: BilingualText;
  description: BilingualText;
}>;

export type GovernanceRoleId =
  | "president"
  | "secretaryGeneral"
  | "treasurerGeneral";

export type GovernanceMember = Readonly<{
  id: string;
  fullName: string;
  role: GovernanceRoleId;
  roleLabel: BilingualText;
}>;

export type LocalizedAboutText = Readonly<{
  label: string;
  title: string;
  description: string;
}>;

export type LocalizedMissionVision = Readonly<{
  mission: Readonly<{
    title: string;
    description: string;
  }>;

  vision: Readonly<{
    title: string;
    description: string;
  }>;
}>;

export type LocalizedAboutBeneficiary = Readonly<{
  id: AboutBeneficiaryId;
  title: string;
  description: string;
  image: string;
}>;

export type LocalizedAboutObjective = Readonly<{
  id: AboutObjectiveId;
  title: string;
  description: string;
}>;

export type LocalizedAboutValue = Readonly<{
  id: AboutValueId;
  title: string;
  description: string;
}>;

export type LocalizedGovernanceMember = Readonly<{
  id: string;
  fullName: string;
  role: GovernanceRoleId;
  roleLabel: string;
}>;

/**
 * Structure générale des données de la page À propos.
 */
export type AboutPageData = Readonly<{
  images: AboutImages;
  legalIdentity: AboutLegalIdentity;
  presentation: AboutPresentation;
  missionVision: AboutMissionVision;
  beneficiaries: readonly AboutBeneficiary[];
  objectives: readonly AboutObjective[];
  values: readonly AboutValue[];
  governance: readonly GovernanceMember[];
}>;

/**
 * Type réutilisable par les fonctions qui sélectionnent
 * un contenu selon la langue active.
 */
export type AboutLanguage = SupportedLanguage;