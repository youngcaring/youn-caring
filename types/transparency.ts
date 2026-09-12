/*
 * Sections disponibles sur la page
 * « Dons & transparence ».
 */

export type TransparencySectionId =
  | "utilisation-des-dons"
  | "engagements"
  | "documents"
  | "identite-legale"
  | "faire-un-don"
  | "questions";

/*
 * Texte disponible en français et en anglais.
 */

export type TransparencyLocalizedText =
  Readonly<{
    fr: string;
    en: string;
  }>;

/*
 * Icônes autorisées dans les données.
 *
 * Les composants associeront ensuite ces identifiants
 * aux icônes correspondantes de lucide-react.
 */

export type TransparencyIconId =
  | "alert"
  | "apple"
  | "book"
  | "calendar"
  | "check"
  | "document"
  | "droplets"
  | "eye"
  | "handHeart"
  | "heart"
  | "health"
  | "help"
  | "location"
  | "lock"
  | "mail"
  | "package"
  | "scale"
  | "shield"
  | "users";

/*
 * Images principales de la page.
 */

export type TransparencyImages =
  Readonly<{
    hero: string;
    callToAction: string;
  }>;

/*
 * Lien de navigation interne.
 */

export type TransparencyQuickLink =
  Readonly<{
    id: TransparencySectionId;
    label: TransparencyLocalizedText;
    icon: TransparencyIconId;
  }>;

/*
 * Domaine dans lequel une contribution
 * peut soutenir une action.
 */

export type DonationUseId =
  | "education"
  | "foodSupport"
  | "health"
  | "children"
  | "clothing"
  | "waterHygiene"
  | "emergency";

export type DonationUseItem =
  Readonly<{
    id: DonationUseId;
    title: TransparencyLocalizedText;
    description: TransparencyLocalizedText;
    icon: TransparencyIconId;
    href: string;
  }>;

/*
 * Engagement public de Young Caring.
 */

export type TransparencyCommitmentId =
  | "verifiedInformation"
  | "clearCommunication"
  | "beneficiaryRespect"
  | "dataProtection"
  | "accessibleDocuments"
  | "continuousImprovement";

export type TransparencyCommitment =
  Readonly<{
    id: TransparencyCommitmentId;
    title: TransparencyLocalizedText;
    description: TransparencyLocalizedText;
    icon: TransparencyIconId;
  }>;

/*
 * Types de documents officiels.
 */

export type TransparencyDocumentId =
  | "registrationReceipt"
  | "statutes"
  | "internalRules"
  | "activityReport"
  | "financialReport";

export type TransparencyDocument =
  Readonly<{
    id: TransparencyDocumentId;
    title: TransparencyLocalizedText;
    description: TransparencyLocalizedText;
    fileType: "PDF";
    href: string | null;
    available: boolean;
    official: boolean;
    download: boolean;
  }>;

/*
 * Informations relatives à l’identité légale.
 */

export type LegalIdentityId =
  | "officialName"
  | "abbreviation"
  | "registrationNumber"
  | "headquarters"
  | "constitutiveAssembly"
  | "receiptDate";

export type LegalIdentityItem =
  Readonly<{
    id: LegalIdentityId;
    label: TransparencyLocalizedText;
    value: TransparencyLocalizedText;
    icon: TransparencyIconId;
  }>;

/*
 * Responsables officiels de l’organisation.
 */

export type GovernanceRoleId =
  | "president"
  | "generalSecretary"
  | "generalTreasurer";

export type GovernanceMember =
  Readonly<{
    id: GovernanceRoleId;
    role: TransparencyLocalizedText;
    fullName: string;
  }>;

/*
 * Manières de soutenir Young Caring.
 */

export type SupportMethodId =
  | "donation"
  | "volunteer"
  | "partnership"
  | "contact";

export type SupportMethod =
  Readonly<{
    id: SupportMethodId;
    title: TransparencyLocalizedText;
    description: TransparencyLocalizedText;
    buttonLabel: TransparencyLocalizedText;
    href: string;
    icon: TransparencyIconId;
    primary: boolean;
  }>;

/*
 * Question fréquente.
 */

export type TransparencyFaqItem =
  Readonly<{
    id: string;
    question: TransparencyLocalizedText;
    answer: TransparencyLocalizedText;
  }>;

/*
 * Contenus principaux du hero.
 */

export type TransparencyHeroContent =
  Readonly<{
    label: TransparencyLocalizedText;
    title: TransparencyLocalizedText;
    description: TransparencyLocalizedText;
    primaryButton: TransparencyLocalizedText;
    secondaryButton: TransparencyLocalizedText;
    assurance: TransparencyLocalizedText;
  }>;

/*
 * Contenus de l’appel à l’action final.
 */

export type TransparencyCallToActionContent =
  Readonly<{
    label: TransparencyLocalizedText;
    title: TransparencyLocalizedText;
    description: TransparencyLocalizedText;
    primaryButton: TransparencyLocalizedText;
    secondaryButton: TransparencyLocalizedText;
  }>;

/*
 * Structure complète et centralisée de la page.
 */

export type TransparencyPageData =
  Readonly<{
    images: TransparencyImages;
    hero: TransparencyHeroContent;
    quickLinks: readonly TransparencyQuickLink[];
    donationUses: readonly DonationUseItem[];
    commitments: readonly TransparencyCommitment[];
    documents: readonly TransparencyDocument[];
    legalIdentity: readonly LegalIdentityItem[];
    governance: readonly GovernanceMember[];
    supportMethods: readonly SupportMethod[];
    faq: readonly TransparencyFaqItem[];
    callToAction: TransparencyCallToActionContent;
  }>;

/*
 * Types localisés utilisables directement
 * dans les composants React.
 */

export type LocalizedTransparencyQuickLink =
  Readonly<
    Omit<TransparencyQuickLink, "label"> & {
      label: string;
    }
  >;

export type LocalizedDonationUseItem =
  Readonly<
    Omit<
      DonationUseItem,
      "title" | "description"
    > & {
      title: string;
      description: string;
    }
  >;

export type LocalizedTransparencyCommitment =
  Readonly<
    Omit<
      TransparencyCommitment,
      "title" | "description"
    > & {
      title: string;
      description: string;
    }
  >;

export type LocalizedTransparencyDocument =
  Readonly<
    Omit<
      TransparencyDocument,
      "title" | "description"
    > & {
      title: string;
      description: string;
    }
  >;

export type LocalizedLegalIdentityItem =
  Readonly<
    Omit<
      LegalIdentityItem,
      "label" | "value"
    > & {
      label: string;
      value: string;
    }
  >;

export type LocalizedGovernanceMember =
  Readonly<
    Omit<GovernanceMember, "role"> & {
      role: string;
    }
  >;

export type LocalizedSupportMethod =
  Readonly<
    Omit<
      SupportMethod,
      | "title"
      | "description"
      | "buttonLabel"
    > & {
      title: string;
      description: string;
      buttonLabel: string;
    }
  >;

export type LocalizedTransparencyFaqItem =
  Readonly<
    Omit<
      TransparencyFaqItem,
      "question" | "answer"
    > & {
      question: string;
      answer: string;
    }
  >;