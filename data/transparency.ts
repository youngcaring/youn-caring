import type { SupportedLanguage } from "@/config/site";

import type {
  LocalizedDonationUseItem,
  LocalizedGovernanceMember,
  LocalizedLegalIdentityItem,
  LocalizedSupportMethod,
  LocalizedTransparencyCommitment,
  LocalizedTransparencyFaqItem,
  LocalizedTransparencyQuickLink,
  TransparencyLocalizedText,
  TransparencyPageData,
  TransparencySectionId,
} from "@/types/transparency";

/*
 * Données publiques de la page
 * « Dons & transparence ».
 *
 * Règles de sécurité :
 *
 * - aucun document administratif téléchargeable ;
 * - aucun numéro d’enregistrement public ;
 * - aucune signature ;
 * - aucun cachet ;
 * - aucune information bancaire ;
 * - aucune identité personnelle de responsable ;
 * - aucun document confidentiel.
 */

export const transparencyPageData: TransparencyPageData =
  {
    images: {
      hero:
        "/images/home/donation-background.jpg",

      callToAction:
        "/images/actions/actions-donation-banner.jpg",
    },

    hero: {
      label: {
        fr: "Dons & transparence",
        en: "Donations & transparency",
      },

      title: {
        fr: "Votre confiance guide chacune de nos actions",
        en: "Your trust guides every action we take",
      },

      description: {
        fr: "Young Caring présente ses engagements, ses domaines d’intervention et les différentes manières de soutenir ses actions.",
        en: "Young Caring presents its commitments, areas of intervention and the different ways to support its actions.",
      },

      primaryButton: {
        fr: "Soutenir Young Caring",
        en: "Support Young Caring",
      },

      secondaryButton: {
        fr: "Découvrir nos engagements",
        en: "Discover our commitments",
      },

      assurance: {
        fr: "Une communication responsable, respectueuse et accessible.",
        en: "Responsible, respectful and accessible communication.",
      },
    },

    quickLinks: [
      {
        id: "utilisation-des-dons",
        label: {
          fr: "Domaines soutenus",
          en: "Supported areas",
        },
        icon: "handHeart",
      },
      {
        id: "engagements",
        label: {
          fr: "Nos engagements",
          en: "Our commitments",
        },
        icon: "shield",
      },
      {
        id: "identite-legale",
        label: {
          fr: "Notre organisation",
          en: "Our organisation",
        },
        icon: "scale",
      },
      {
        id: "faire-un-don",
        label: {
          fr: "Nous soutenir",
          en: "Support us",
        },
        icon: "heart",
      },
      {
        id: "questions",
        label: {
          fr: "Questions fréquentes",
          en: "Frequently asked questions",
        },
        icon: "help",
      },
    ],

    donationUses: [
      {
        id: "education",
        title: {
          fr: "Éducation",
          en: "Education",
        },
        description: {
          fr: "Soutien aux activités éducatives et aux besoins scolaires des enfants.",
          en: "Support for educational activities and children’s school needs.",
        },
        icon: "book",
        href:
          "/actions?category=education",
      },
      {
        id: "foodSupport",
        title: {
          fr: "Aide alimentaire",
          en: "Food support",
        },
        description: {
          fr: "Préparation et distribution de vivres aux personnes accompagnées.",
          en: "Preparation and distribution of food to supported people.",
        },
        icon: "apple",
        href:
          "/actions?category=foodSupport",
      },
      {
        id: "health",
        title: {
          fr: "Santé",
          en: "Health",
        },
        description: {
          fr: "Soutien aux initiatives liées à la santé et au bien-être.",
          en: "Support for health and well-being initiatives.",
        },
        icon: "health",
        href:
          "/actions?category=health",
      },
      {
        id: "children",
        title: {
          fr: "Enfance",
          en: "Children",
        },
        description: {
          fr: "Accompagnement, écoute et activités adaptées aux enfants.",
          en: "Support, listening and activities adapted to children.",
        },
        icon: "users",
        href:
          "/actions?category=children",
      },
      {
        id: "clothing",
        title: {
          fr: "Vêtements et kits",
          en: "Clothing and kits",
        },
        description: {
          fr: "Collecte et remise de vêtements, de kits et de produits essentiels.",
          en: "Collection and distribution of clothing, kits and essential supplies.",
        },
        icon: "package",
        href:
          "/actions?category=clothing",
      },
      {
        id: "waterHygiene",
        title: {
          fr: "Eau et hygiène",
          en: "Water and hygiene",
        },
        description: {
          fr: "Actions favorisant l’accès à l’eau et aux produits d’hygiène.",
          en: "Initiatives supporting access to water and hygiene products.",
        },
        icon: "droplets",
        href:
          "/actions?category=waterHygiene",
      },
      {
        id: "emergency",
        title: {
          fr: "Urgences",
          en: "Emergencies",
        },
        description: {
          fr: "Mobilisation selon les besoins urgents identifiés sur le terrain.",
          en: "Mobilisation according to urgent needs identified in the field.",
        },
        icon: "alert",
        href:
          "/actions?category=emergency",
      },
    ],

    commitments: [
      {
        id: "verifiedInformation",
        title: {
          fr: "Informations vérifiées",
          en: "Verified information",
        },
        description: {
          fr: "Les informations importantes sont vérifiées avant leur publication.",
          en: "Important information is verified before publication.",
        },
        icon: "check",
      },
      {
        id: "clearCommunication",
        title: {
          fr: "Communication claire",
          en: "Clear communication",
        },
        description: {
          fr: "Les actions sont présentées de manière claire, compréhensible et responsable.",
          en: "Actions are presented clearly, understandably and responsibly.",
        },
        icon: "eye",
      },
      {
        id: "beneficiaryRespect",
        title: {
          fr: "Respect des bénéficiaires",
          en: "Respect for beneficiaries",
        },
        description: {
          fr: "La dignité, l’image et la vie privée des personnes accompagnées sont respectées.",
          en: "The dignity, image and privacy of supported people are respected.",
        },
        icon: "users",
      },
      {
        id: "dataProtection",
        title: {
          fr: "Protection des données",
          en: "Data protection",
        },
        description: {
          fr: "Les informations personnelles et les documents sensibles ne sont pas publiés.",
          en: "Personal information and sensitive documents are not published.",
        },
        icon: "lock",
      },
      {
        id: "continuousImprovement",
        title: {
          fr: "Amélioration continue",
          en: "Continuous improvement",
        },
        description: {
          fr: "Young Caring améliore continuellement ses pratiques et sa communication.",
          en: "Young Caring continuously improves its practices and communication.",
        },
        icon: "shield",
      },
    ],

    /*
     * Aucun document administratif n’est rendu public.
     *
     * Les demandes légitimes doivent être étudiées
     * directement par l’organisation.
     */
    documents: [],

    /*
     * Seules des informations générales et non sensibles
     * concernant l’organisation sont publiées.
     */
    legalIdentity: [
      {
        id: "officialName",
        label: {
          fr: "Nom de l’organisation",
          en: "Organisation name",
        },
        value: {
          fr: "Young Caring",
          en: "Young Caring",
        },
        icon: "check",
      },
      {
        id: "abbreviation",
        label: {
          fr: "Dénomination",
          en: "Designation",
        },
        value: {
          fr: "Young Caring / Jeune Bienveillant",
          en: "Young Caring / Jeune Bienveillant",
        },
        icon: "scale",
      },
      {
        id: "headquarters",
        label: {
          fr: "Zone d’intervention principale",
          en: "Main area of intervention",
        },
        value: {
          fr: "Cotonou, Bénin",
          en: "Cotonou, Benin",
        },
        icon: "location",
      },
    ],

    /*
     * Les noms et coordonnées personnelles
     * des responsables ne sont pas publiés.
     */
    governance: [],

    supportMethods: [
      {
        id: "donation",
        title: {
          fr: "Faire un don",
          en: "Make a donation",
        },
        description: {
          fr: "Contribuez au financement des prochaines actions de Young Caring.",
          en: "Contribute to funding Young Caring’s future actions.",
        },
        buttonLabel: {
          fr: "Contacter Young Caring",
          en: "Contact Young Caring",
        },
        href:
          "/contact?subject=donation",
        icon: "heart",
        primary: true,
      },
      {
        id: "volunteer",
        title: {
          fr: "Devenir bénévole",
          en: "Become a volunteer",
        },
        description: {
          fr: "Mettez votre temps et vos compétences au service des actions.",
          en: "Use your time and skills to support our actions.",
        },
        buttonLabel: {
          fr: "Devenir bénévole",
          en: "Become a volunteer",
        },
        href:
          "/contact?subject=volunteer",
        icon: "users",
        primary: false,
      },
      {
        id: "partnership",
        title: {
          fr: "Proposer un partenariat",
          en: "Propose a partnership",
        },
        description: {
          fr: "Construisons ensemble un partenariat utile et responsable.",
          en: "Let us build a useful and responsible partnership together.",
        },
        buttonLabel: {
          fr: "Proposer un partenariat",
          en: "Propose a partnership",
        },
        href:
          "/contact?subject=partnership",
        icon: "handHeart",
        primary: false,
      },
      {
        id: "contact",
        title: {
          fr: "Contacter l’organisation",
          en: "Contact the organisation",
        },
        description: {
          fr: "Posez vos questions directement à l’équipe Young Caring.",
          en: "Ask your questions directly to the Young Caring team.",
        },
        buttonLabel: {
          fr: "Nous contacter",
          en: "Contact us",
        },
        href: "/contact",
        icon: "mail",
        primary: false,
      },
    ],

    faq: [
      {
        id: "donation-use",
        question: {
          fr: "Comment les contributions sont-elles utilisées ?",
          en: "How are contributions used?",
        },
        answer: {
          fr: "Les contributions permettent de préparer et de soutenir les actions de Young Caring selon les besoins identifiés et les moyens disponibles.",
          en: "Contributions help prepare and support Young Caring’s actions according to identified needs and available resources.",
        },
      },
      {
        id: "specific-action",
        question: {
          fr: "Puis-je soutenir une action particulière ?",
          en: "Can I support a particular action?",
        },
        answer: {
          fr: "Oui. Vous pouvez contacter Young Caring afin de préciser l’action ou le domaine que vous souhaitez soutenir.",
          en: "Yes. You can contact Young Caring to specify the action or area you would like to support.",
        },
      },
      {
        id: "official-information",
        question: {
          fr: "Comment obtenir une information officielle sur l’organisation ?",
          en: "How can I obtain official information about the organisation?",
        },
        answer: {
          fr: "Pour protéger l’organisation contre les utilisations frauduleuses, les documents administratifs ne sont pas publiés en ligne. Toute demande légitime peut être adressée directement à Young Caring.",
          en: "To protect the organisation against fraudulent use, administrative documents are not published online. Any legitimate request can be sent directly to Young Caring.",
        },
      },
      {
        id: "payment-information",
        question: {
          fr: "Où obtenir les informations officielles pour faire un don ?",
          en: "Where can I obtain official donation information?",
        },
        answer: {
          fr: "Les informations nécessaires sont communiquées uniquement par les canaux officiels de Young Caring. Vérifiez toujours l’identité du contact avant toute contribution.",
          en: "The necessary information is only communicated through Young Caring’s official channels. Always verify the contact’s identity before making a contribution.",
        },
      },
      {
        id: "volunteering",
        question: {
          fr: "Comment devenir bénévole ?",
          en: "How can I become a volunteer?",
        },
        answer: {
          fr: "Utilisez la page Contact et choisissez le sujet lié au bénévolat pour présenter votre disponibilité.",
          en: "Use the Contact page and choose the volunteering subject to present your availability.",
        },
      },
      {
        id: "partnership",
        question: {
          fr: "Comment proposer un partenariat ?",
          en: "How can I propose a partnership?",
        },
        answer: {
          fr: "Présentez votre organisation, votre proposition et vos coordonnées à travers la page Contact.",
          en: "Present your organisation, proposal and contact details through the Contact page.",
        },
      },
    ],

    callToAction: {
      label: {
        fr: "Construisons la confiance",
        en: "Building trust",
      },

      title: {
        fr: "Une question sur nos actions ou notre organisation ?",
        en: "A question about our actions or organisation?",
      },

      description: {
        fr: "Notre équipe reste disponible pour vous renseigner et étudier votre proposition de soutien.",
        en: "Our team is available to answer your questions and review your support proposal.",
      },

      primaryButton: {
        fr: "Soutenir nos actions",
        en: "Support our actions",
      },

      secondaryButton: {
        fr: "Nous contacter",
        en: "Contact us",
      },
    },
  };

/*
 * Retourne un texte selon la langue active.
 */

export function getLocalizedTransparencyText(
  text: TransparencyLocalizedText,
  language: SupportedLanguage
): string {
  return language === "en"
    ? text.en
    : text.fr;
}

/*
 * Vérifie qu’une valeur correspond à une section
 * réellement disponible sur la page.
 */

export function isTransparencySectionId(
  value: unknown
): value is TransparencySectionId {
  if (typeof value !== "string") {
    return false;
  }

  return transparencyPageData.quickLinks.some(
    (item) => item.id === value
  );
}

/*
 * Retourne les liens rapides dans la langue active.
 */

export function getLocalizedTransparencyQuickLinks(
  language: SupportedLanguage
): readonly LocalizedTransparencyQuickLink[] {
  return transparencyPageData.quickLinks.map(
    (item) => ({
      ...item,

      label:
        getLocalizedTransparencyText(
          item.label,
          language
        ),
    })
  );
}

/*
 * Retourne les domaines soutenus.
 */

export function getLocalizedDonationUses(
  language: SupportedLanguage
): readonly LocalizedDonationUseItem[] {
  return transparencyPageData.donationUses.map(
    (item) => ({
      ...item,

      title:
        getLocalizedTransparencyText(
          item.title,
          language
        ),

      description:
        getLocalizedTransparencyText(
          item.description,
          language
        ),
    })
  );
}

/*
 * Retourne les engagements de transparence.
 */

export function getLocalizedTransparencyCommitments(
  language: SupportedLanguage
): readonly LocalizedTransparencyCommitment[] {
  return transparencyPageData.commitments.map(
    (item) => ({
      ...item,

      title:
        getLocalizedTransparencyText(
          item.title,
          language
        ),

      description:
        getLocalizedTransparencyText(
          item.description,
          language
        ),
    })
  );
}

/*
 * Retourne les informations générales
 * et non sensibles de l’organisation.
 */

export function getLocalizedLegalIdentity(
  language: SupportedLanguage
): readonly LocalizedLegalIdentityItem[] {
  return transparencyPageData.legalIdentity.map(
    (item) => ({
      ...item,

      label:
        getLocalizedTransparencyText(
          item.label,
          language
        ),

      value:
        getLocalizedTransparencyText(
          item.value,
          language
        ),
    })
  );
}

/*
 * Cette fonction reste disponible pour les composants,
 * mais le tableau est volontairement vide afin de ne pas
 * publier les identités personnelles des responsables.
 */

export function getLocalizedGovernance(
  language: SupportedLanguage
): readonly LocalizedGovernanceMember[] {
  return transparencyPageData.governance.map(
    (member) => ({
      ...member,

      role:
        getLocalizedTransparencyText(
          member.role,
          language
        ),
    })
  );
}

/*
 * Retourne les manières de soutenir l’organisation.
 */

export function getLocalizedSupportMethods(
  language: SupportedLanguage
): readonly LocalizedSupportMethod[] {
  return transparencyPageData.supportMethods.map(
    (method) => ({
      ...method,

      title:
        getLocalizedTransparencyText(
          method.title,
          language
        ),

      description:
        getLocalizedTransparencyText(
          method.description,
          language
        ),

      buttonLabel:
        getLocalizedTransparencyText(
          method.buttonLabel,
          language
        ),
    })
  );
}

/*
 * Retourne les questions fréquentes.
 */

export function getLocalizedTransparencyFaq(
  language: SupportedLanguage
): readonly LocalizedTransparencyFaqItem[] {
  return transparencyPageData.faq.map(
    (item) => ({
      ...item,

      question:
        getLocalizedTransparencyText(
          item.question,
          language
        ),

      answer:
        getLocalizedTransparencyText(
          item.answer,
          language
        ),
    })
  );
}