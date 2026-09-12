import {
  contactFormLimits,
  isContactSubjectId,
} from "@/data/contact";
import type {
  ContactFieldErrors,
  ContactLanguage,
  ContactSubmissionRequest,
  ContactValidationResult,
  ValidatedContactMessage,
} from "@/types/contact";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^[0-9+\s()./-]+$/;

const CONTROL_CHARACTERS_PATTERN =
  /[\u0000-\u001F\u007F]/g;

const VALID_LANGUAGES:
  readonly ContactLanguage[] = [
  "fr",
  "en",
];

type MutableContactFieldErrors = {
  -readonly [
    Key in keyof ContactFieldErrors
  ]?: string;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isContactLanguage(
  value: unknown
): value is ContactLanguage {
  return (
    typeof value === "string" &&
    VALID_LANGUAGES.includes(
      value as ContactLanguage
    )
  );
}

function normalizeSingleLineText(
  value: unknown,
  maximumLength: number
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(
      CONTROL_CHARACTERS_PATTERN,
      ""
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximumLength);
}

function normalizeMultilineText(
  value: unknown,
  maximumLength: number
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n?/g, "\n")
    .replace(
      CONTROL_CHARACTERS_PATTERN,
      ""
    )
    .replace(/[ \t]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maximumLength);
}

function normalizeEmail(
  value: unknown
): string {
  return normalizeSingleLineText(
    value,
    contactFormLimits.email.maximum
  ).toLowerCase();
}

function getRequestedLanguage(
  input: Record<string, unknown>
): ContactLanguage {
  return isContactLanguage(
    input.language
  )
    ? input.language
    : "fr";
}

export function validateContactMessage(
  input: unknown
): ContactValidationResult {
  if (!isRecord(input)) {
    return {
      success: false,
      data: null,

      errors: {
        general:
          "Les données reçues sont invalides.",
      },
    };
  }

  const language =
    getRequestedLanguage(input);

  const errors:
    MutableContactFieldErrors = {};

  const rawFullName =
    typeof input.fullName === "string"
      ? input.fullName
      : "";

  const rawEmail =
    typeof input.email === "string"
      ? input.email
      : "";

  const rawPhone =
    typeof input.phone === "string"
      ? input.phone
      : "";

  const rawSubject =
    typeof input.subject === "string"
      ? input.subject
      : "";

  const rawMessage =
    typeof input.message === "string"
      ? input.message
      : "";

  const rawWebsite =
    typeof input.website === "string"
      ? input.website
      : "";

  const fullName =
    normalizeSingleLineText(
      rawFullName,
      contactFormLimits.fullName
        .maximum
    );

  const email =
    normalizeEmail(rawEmail);

  const phone =
    normalizeSingleLineText(
      rawPhone,
      contactFormLimits.phone.maximum
    );

  const message =
    normalizeMultilineText(
      rawMessage,
      contactFormLimits.message
        .maximum
    );

  const website =
    normalizeSingleLineText(
      rawWebsite,
      contactFormLimits.website
        .maximum
    );

  /*
   * Champ invisible anti-robot.
   */
  if (website.length > 0) {
    errors.website =
      language === "en"
        ? "The submission could not be accepted."
        : "La soumission n’a pas pu être acceptée.";
  }

  /*
   * Validation du nom.
   */
  if (
    rawFullName.length >
    contactFormLimits.fullName.maximum
  ) {
    errors.fullName =
      language === "en"
        ? "The full name is too long."
        : "Le nom complet est trop long.";
  } else if (
    fullName.length <
    contactFormLimits.fullName.minimum
  ) {
    errors.fullName =
      language === "en"
        ? "Please enter your full name."
        : "Veuillez saisir votre nom complet.";
  }

  /*
   * Validation de l’adresse email.
   */
  if (
    rawEmail.length >
      contactFormLimits.email.maximum ||
    email.length === 0 ||
    !EMAIL_PATTERN.test(email)
  ) {
    errors.email =
      language === "en"
        ? "Please enter a valid email address."
        : "Veuillez saisir une adresse email valide.";
  }

  /*
   * Validation du téléphone facultatif.
   */
  if (
    rawPhone.length >
    contactFormLimits.phone.maximum
  ) {
    errors.phone =
      language === "en"
        ? "The phone number is too long."
        : "Le numéro de téléphone est trop long.";
  } else if (
    phone.length > 0 &&
    (
      phone.length <
        contactFormLimits.phone.minimum ||
      !PHONE_PATTERN.test(phone)
    )
  ) {
    errors.phone =
      language === "en"
        ? "Please enter a valid phone number."
        : "Veuillez saisir un numéro de téléphone valide.";
  }

  /*
   * Le sujet doit correspondre exactement
   * à l’un des identifiants de data/contact.ts.
   */
  if (
    !isContactSubjectId(rawSubject)
  ) {
    errors.subject =
      language === "en"
        ? "Please select a valid subject."
        : "Veuillez sélectionner un sujet valide.";
  }

  /*
   * Validation du message.
   */
  if (
    rawMessage.length >
    contactFormLimits.message.maximum
  ) {
    errors.message =
      language === "en"
        ? `Your message cannot exceed ${contactFormLimits.message.maximum} characters.`
        : `Votre message ne peut pas dépasser ${contactFormLimits.message.maximum} caractères.`;
  } else if (
    message.length <
    contactFormLimits.message.minimum
  ) {
    errors.message =
      language === "en"
        ? `Your message must contain at least ${contactFormLimits.message.minimum} characters.`
        : `Votre message doit contenir au moins ${contactFormLimits.message.minimum} caractères.`;
  }

  if (
    Object.keys(errors).length > 0
  ) {
    return {
      success: false,
      data: null,
      errors,
    };
  }

  /*
   * Cette vérification supplémentaire permet
   * à TypeScript de comprendre que rawSubject
   * est désormais un ContactSubjectId.
   */
  if (
    !isContactSubjectId(rawSubject)
  ) {
    return {
      success: false,
      data: null,

      errors: {
        subject:
          language === "en"
            ? "Please select a valid subject."
            : "Veuillez sélectionner un sujet valide.",
      },
    };
  }

  const validatedData:
    ValidatedContactMessage = {
    fullName,
    email,

    phone:
      phone.length > 0
        ? phone
        : null,

    subject:
      rawSubject,

    message,
    language,
  };

  return {
    success: true,
    data: validatedData,
    errors: {},
  };
}

export function validateTypedContactMessage(
  input: ContactSubmissionRequest
): ContactValidationResult {
  return validateContactMessage(
    input
  );
}