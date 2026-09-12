import type {
  ContactLanguage,
  ContactMethod,
  ContactMethodId,
  ContactSubjectId,
  ContactSubjectOption,
} from "@/types/contact";

/*
 * Coordonnées officielles de Young Caring.
 *
 * Toutes les composantes de la page Contact
 * doivent utiliser ces informations afin
 * d’éviter les différences entre les sections.
 */

export const contactInformation = {
  organizationName: "Young Caring",

  phoneDisplay:
    "+229 01 57 77 46 73",

  phoneInternational:
    "+2290157774673",

  whatsappDisplay:
    "+229 01 57 77 46 73",

  whatsappInternational:
    "2290157774673",

  email:
    "contact@young-caring.org",

  address:
    "Abomey-Calavi, Bénin",

  country:
    "Bénin",
} as const;

/*
 * Liens externes sécurisés vers les différents
 * moyens de communication.
 */

export const contactLinks = {
  phone:
    `tel:${contactInformation.phoneInternational}`,

  whatsapp:
    `https://wa.me/${contactInformation.whatsappInternational}`,

  email:
    `mailto:${contactInformation.email}`,

  address:
    "https://www.google.com/maps/search/?api=1&query=Abomey-Calavi%2C%20B%C3%A9nin",
} as const;

/*
 * Sujets proposés dans le formulaire.
 *
 * Les identifiants sont envoyés à l’API.
 * Les libellés sont seulement utilisés
 * pour l’affichage et les emails.
 */

export const contactSubjects:
  readonly ContactSubjectOption[] = [
  {
    id: "general",
    labelFr:
      "Demande générale",
    labelEn:
      "General enquiry",
  },
  {
    id: "help",
    labelFr:
      "Demande d’aide",
    labelEn:
      "Request for assistance",
  },
  {
    id: "volunteer",
    labelFr:
      "Devenir bénévole",
    labelEn:
      "Become a volunteer",
  },
  {
    id: "partnership",
    labelFr:
      "Proposition de partenariat",
    labelEn:
      "Partnership proposal",
  },
  {
    id: "donation",
    labelFr:
      "Question concernant un don",
    labelEn:
      "Donation enquiry",
  },
  {
    id: "media",
    labelFr:
      "Médias et presse",
    labelEn:
      "Media and press",
  },
];

/*
 * Moyens de contact affichés sur la page.
 */

export const contactMethods:
  readonly ContactMethod[] = [
  {
    id: "phone",
    label: "Téléphone",
    value:
      contactInformation.phoneDisplay,
    href:
      contactLinks.phone,
    external: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value:
      contactInformation.whatsappDisplay,
    href:
      contactLinks.whatsapp,
    external: true,
  },
  {
    id: "email",
    label: "Adresse email",
    value:
      contactInformation.email,
    href:
      contactLinks.email,
    external: false,
  },
  {
    id: "address",
    label: "Adresse",
    value:
      contactInformation.address,
    href:
      contactLinks.address,
    external: true,
  },
];

/*
 * Textes généraux de la page Contact.
 */

export const contactPageContent = {
  hero: {
    labelFr:
      "Écrivez-nous",

    labelEn:
      "Write to us",

    titleStartFr:
      "Envoyez-nous",

    titleHighlightFr:
      "votre message",

    titleStartEn:
      "Send us",

    titleHighlightEn:
      "your message",

    descriptionFr:
      "Complétez le formulaire pour envoyer directement votre demande à l’équipe Young Caring.",

    descriptionEn:
      "Complete the form to send your request directly to the Young Caring team.",
  },

  form: {
    requiredNoticeFr:
      "Les champs marqués d’un astérisque sont obligatoires.",

    requiredNoticeEn:
      "Fields marked with an asterisk are required.",

    privacyNoticeFr:
      "Vos informations sont utilisées uniquement pour traiter votre demande et vous répondre.",

    privacyNoticeEn:
      "Your information is only used to process your request and reply to you.",

    responseNoticeFr:
      "Notre équipe vous répondra dans les meilleurs délais.",

    responseNoticeEn:
      "Our team will reply as soon as possible.",
  },

  success: {
    titleFr:
      "Votre message est bien reçu",

    titleEn:
      "Your message has been received",

    descriptionFr:
      "Merci de nous avoir contactés. Notre équipe va examiner votre demande et vous répondre dans les meilleurs délais.",

    descriptionEn:
      "Thank you for contacting us. Our team will review your request and reply as soon as possible.",

    referenceLabelFr:
      "Référence de votre demande",

    referenceLabelEn:
      "Your request reference",

    confirmationSentFr:
      "Un email de confirmation vous a été envoyé.",

    confirmationSentEn:
      "A confirmation email has been sent to you.",

    confirmationNotSentFr:
      "Votre message a bien été reçu, mais l’email de confirmation n’a pas pu être envoyé.",

    confirmationNotSentEn:
      "Your message was received, but the confirmation email could not be sent.",
  },

  security: {
    titleFr:
      "Protection de vos informations",

    titleEn:
      "Protection of your information",

    descriptionFr:
      "Young Caring ne vous demandera jamais votre mot de passe, votre code secret ou vos informations bancaires par email.",

    descriptionEn:
      "Young Caring will never ask for your password, security code or banking information by email.",
  },
} as const;

/*
 * Limites communes au formulaire.
 *
 * Elles doivent rester identiques aux limites
 * vérifiées dans lib/contact/validation.ts.
 */

export const contactFormLimits = {
  fullName: {
    minimum: 2,
    maximum: 120,
  },

  email: {
    maximum: 254,
  },

  phone: {
    minimum: 6,
    maximum: 30,
  },

  subject: {
    minimum: 2,
    maximum: 120,
  },

  message: {
    minimum: 10,
    maximum: 2_000,
  },

  website: {
    maximum: 200,
  },
} as const;

/*
 * Vérifie qu’une valeur correspond
 * à un sujet autorisé.
 */

export function isContactSubjectId(
  value: unknown
): value is ContactSubjectId {
  return (
    typeof value === "string" &&
    contactSubjects.some(
      (subject) =>
        subject.id === value
    )
  );
}

/*
 * Vérifie qu’une valeur correspond
 * à un moyen de contact connu.
 */

export function isContactMethodId(
  value: unknown
): value is ContactMethodId {
  return (
    typeof value === "string" &&
    contactMethods.some(
      (method) =>
        method.id === value
    )
  );
}

/*
 * Retourne les informations d’un sujet.
 */

export function getContactSubject(
  id: ContactSubjectId
): ContactSubjectOption | undefined {
  return contactSubjects.find(
    (subject) =>
      subject.id === id
  );
}

/*
 * Retourne le libellé traduit d’un sujet.
 */

export function getContactSubjectLabel(
  id: ContactSubjectId,
  language: ContactLanguage
): string {
  const subject =
    getContactSubject(id);

  if (!subject) {
    return "";
  }

  return language === "en"
    ? subject.labelEn
    : subject.labelFr;
}

/*
 * Retourne un moyen de contact précis.
 */

export function getContactMethod(
  id: ContactMethodId
): ContactMethod | undefined {
  return contactMethods.find(
    (method) =>
      method.id === id
  );
}

/*
 * Retourne un texte selon la langue active.
 */

export function getLocalizedContactText(
  frenchText: string,
  englishText: string,
  language: ContactLanguage
): string {
  return language === "en"
    ? englishText
    : frenchText;
}