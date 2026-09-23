import "server-only";

import {
  getDonationLimits,
  isDonationAllocationId,
  isDonationCurrency,
} from "@/data/donation";

import type {
  DonationCheckoutRequest,
  DonationFieldErrors,
  DonationFrequency,
  DonationValidationResult,
  ValidatedDonationCheckout,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * VALIDATION SERVEUR DES DONS
 * ============================================================================
 *
 * Ce fichier :
 *
 * - considère toutes les données reçues comme inconnues ;
 * - nettoie les textes ;
 * - valide le donateur ;
 * - valide le montant selon la devise ;
 * - valide la fréquence et le domaine soutenu ;
 * - exige le consentement ;
 * - ne traite aucune donnée bancaire ;
 * - retourne uniquement des données sûres et typées.
 *
 * Cette validation doit être exécutée côté serveur,
 * même si le formulaire possède déjà une validation
 * côté navigateur.
 * ============================================================================
 */

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^\+?[0-9\s().-]+$/;

const CONTROL_CHARACTERS_PATTERN =
  /[\u0000-\u001F\u007F]/g;

const VALID_FREQUENCIES:
  readonly DonationFrequency[] = [
    "once",
    "monthly",
  ];

const MAX_FIRST_NAME_LENGTH = 60;
const MAX_LAST_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 30;
const MAX_COUNTRY_LENGTH = 80;

type MutableDonationFieldErrors =
  Partial<
    Record<
      keyof DonationFieldErrors,
      string
    >
  >;

/**
 * Vérifie qu’une valeur inconnue est
 * un objet non nul et non-tableau.
 */
function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Nettoie une valeur textuelle sans
 * la tronquer silencieusement.
 *
 * La longueur est vérifiée séparément afin
 * de pouvoir retourner une véritable erreur.
 */
function normalizeText(
  value: unknown
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKC")
    .replace(
      CONTROL_CHARACTERS_PATTERN,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/**
 * Nettoie et normalise une adresse e-mail.
 */
function normalizeEmail(
  value: unknown
): string {
  return normalizeText(
    value
  ).toLowerCase();
}

/**
 * Vérifie qu’un texte respecte une longueur
 * minimale et maximale.
 */
function isValidTextLength(
  value: string,
  minimumLength: number,
  maximumLength: number
): boolean {
  return (
    value.length >= minimumLength &&
    value.length <= maximumLength
  );
}

/**
 * Analyse une fréquence de don.
 */
function parseDonationFrequency(
  value: unknown
): DonationFrequency | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  if (
    !VALID_FREQUENCIES.includes(
      value as DonationFrequency
    )
  ) {
    return null;
  }

  return value as DonationFrequency;
}

/**
 * Analyse un montant.
 *
 * Les montants doivent être des entiers sûrs.
 */
function parseDonationAmount(
  value: unknown
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value)
  ) {
    return null;
  }

  return value;
}

/**
 * Vérifie un numéro de téléphone optionnel.
 *
 * Le signe + est autorisé uniquement au début
 * et une seule fois.
 */
function isValidOptionalPhone(
  phone: string
): boolean {
  if (phone.length === 0) {
    return true;
  }

  if (
    phone.length >
    MAX_PHONE_LENGTH
  ) {
    return false;
  }

  if (
    !PHONE_PATTERN.test(phone)
  ) {
    return false;
  }

  const plusCount =
    (
      phone.match(/\+/g) ??
      []
    ).length;

  if (
    plusCount > 1 ||
    (
      plusCount === 1 &&
      !phone.startsWith("+")
    )
  ) {
    return false;
  }

  const digits =
    phone.replace(
      /\D/g,
      ""
    );

  return (
    digits.length >= 6 &&
    digits.length <= 20
  );
}

/**
 * Valide complètement les données reçues
 * par la route de création du paiement.
 *
 * Toutes les valeurs provenant du navigateur
 * sont considérées comme inconnues.
 */
export function validateDonationCheckout(
  input: unknown
): DonationValidationResult {
  const errors:
    MutableDonationFieldErrors = {};

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

  const donorValue =
    input.donor;

  if (!isRecord(donorValue)) {
    return {
      success: false,
      data: null,
      errors: {
        general:
          "Les informations du donateur sont invalides.",
      },
    };
  }

  const firstName =
    normalizeText(
      donorValue.firstName
    );

  const lastName =
    normalizeText(
      donorValue.lastName
    );

  const email =
    normalizeEmail(
      donorValue.email
    );

  const phone =
    normalizeText(
      donorValue.phone
    );

  const country =
    normalizeText(
      donorValue.country
    );

  /**
   * Chaque valeur inconnue devient soit une
   * valeur correctement typée, soit null.
   */
  const frequency =
    parseDonationFrequency(
      input.frequency
    );

  const currency =
    isDonationCurrency(
      input.currency
    )
      ? input.currency
      : null;

  const amount =
    parseDonationAmount(
      input.amount
    );

  const allocation =
    isDonationAllocationId(
      input.allocation
    )
      ? input.allocation
      : null;

  const anonymous =
    typeof donorValue.anonymous ===
    "boolean"
      ? donorValue.anonymous
      : null;

  /**
   * Validation du prénom.
   */
  if (
    !isValidTextLength(
      firstName,
      2,
      MAX_FIRST_NAME_LENGTH
    )
  ) {
    errors.firstName =
      firstName.length === 0
        ? "Le prénom est obligatoire."
        : `Le prénom doit contenir entre 2 et ${MAX_FIRST_NAME_LENGTH} caractères.`;
  }

  /**
   * Validation du nom.
   */
  if (
    !isValidTextLength(
      lastName,
      2,
      MAX_LAST_NAME_LENGTH
    )
  ) {
    errors.lastName =
      lastName.length === 0
        ? "Le nom est obligatoire."
        : `Le nom doit contenir entre 2 et ${MAX_LAST_NAME_LENGTH} caractères.`;
  }

  /**
   * Validation de l’adresse e-mail.
   */
  if (
    email.length === 0 ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(email)
  ) {
    errors.email =
      "L’adresse e-mail est invalide.";
  }

  /**
   * Validation du téléphone optionnel.
   */
  if (
    !isValidOptionalPhone(
      phone
    )
  ) {
    errors.phone =
      "Le numéro de téléphone est invalide.";
  }

  /**
   * Validation du pays optionnel.
   */
  if (
    country.length >
    MAX_COUNTRY_LENGTH
  ) {
    errors.country =
      `Le pays ne doit pas dépasser ${MAX_COUNTRY_LENGTH} caractères.`;
  }

  /**
   * Validation de la fréquence.
   */
  if (frequency === null) {
    errors.frequency =
      "La fréquence du don est invalide.";
  }

  /**
   * Validation de la devise.
   */
  if (currency === null) {
    errors.currency =
      "La devise sélectionnée est invalide.";
  }

  /**
   * Validation du montant.
   */
  if (amount === null) {
    errors.amount =
      "Le montant du don est invalide.";
  } else if (currency !== null) {
    const limits =
      getDonationLimits(
        currency
      );

    if (
      amount < limits.minimum ||
      amount > limits.maximum
    ) {
      errors.amount =
        `Le montant doit être compris entre ${limits.minimum.toLocaleString(
          "fr-FR"
        )} et ${limits.maximum.toLocaleString(
          "fr-FR"
        )} ${currency}.`;
    }
  }

  /**
   * Validation du domaine soutenu.
   */
  if (allocation === null) {
    errors.allocation =
      "Le domaine sélectionné est invalide.";
  }

  /**
   * Validation du consentement.
   */
  if (
    donorValue.consent !== true
  ) {
    errors.consent =
      "Le consentement est obligatoire.";
  }

  /**
   * Validation du choix d’anonymat.
   */
  if (anonymous === null) {
    errors.general =
      "Le choix d’anonymat est invalide.";
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

  /**
   * Cette vérification finale garantit les types
   * utilisés pour construire le résultat validé.
   */
  if (
    frequency === null ||
    currency === null ||
    amount === null ||
    allocation === null ||
    anonymous === null
  ) {
    return {
      success: false,
      data: null,
      errors: {
        general:
          "La validation des données a échoué.",
      },
    };
  }

  const validatedData:
    ValidatedDonationCheckout = {
    frequency,
    amount,
    currency,
    allocation,

    donor: {
      firstName,
      lastName,
      email,

      phone:
        phone.length > 0
          ? phone
          : null,

      country:
        country.length > 0
          ? country
          : null,

      anonymous,
      consent: true,
    },
  };

  return {
    success: true,
    data: validatedData,
    errors: {},
  };
}

/**
 * Version destinée aux appels internes
 * déjà typés.
 *
 * La validation complète reste exécutée afin
 * de ne jamais faire confiance uniquement aux
 * types TypeScript.
 */
export function validateTypedDonationCheckout(
  input: DonationCheckoutRequest
): DonationValidationResult {
  return validateDonationCheckout(
    input
  );
}