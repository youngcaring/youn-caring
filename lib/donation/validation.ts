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

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN =
  /^[0-9+\s().-]+$/;

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

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function normalizeText(
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

function normalizeEmail(
  value: unknown
): string {
  return normalizeText(
    value,
    MAX_EMAIL_LENGTH
  ).toLowerCase();
}

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

function isValidOptionalPhone(
  phone: string
): boolean {
  if (phone.length === 0) {
    return true;
  }

  if (!PHONE_PATTERN.test(phone)) {
    return false;
  }

  const digits =
    phone.replace(/\D/g, "");

  return (
    digits.length >= 6 &&
    digits.length <= 20
  );
}

/*
 * Valide complètement les données reçues
 * par la route de paiement.
 *
 * Toutes les valeurs provenant du navigateur
 * sont considérées comme inconnues avant validation.
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

  const donorValue = input.donor;

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

  const firstName = normalizeText(
    donorValue.firstName,
    MAX_FIRST_NAME_LENGTH
  );

  const lastName = normalizeText(
    donorValue.lastName,
    MAX_LAST_NAME_LENGTH
  );

  const email = normalizeEmail(
    donorValue.email
  );

  const phone = normalizeText(
    donorValue.phone,
    MAX_PHONE_LENGTH
  );

  const country = normalizeText(
    donorValue.country,
    MAX_COUNTRY_LENGTH
  );

  /*
   * Chaque valeur inconnue devient :
   * - une valeur correctement typée ;
   * - ou null lorsqu’elle est invalide.
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

  /*
   * Validation des informations personnelles.
   */
  if (firstName.length < 2) {
    errors.firstName =
      "Le prénom est obligatoire.";
  }

  if (lastName.length < 2) {
    errors.lastName =
      "Le nom est obligatoire.";
  }

  if (
    email.length === 0 ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(email)
  ) {
    errors.email =
      "L’adresse email est invalide.";
  }

  if (!isValidOptionalPhone(phone)) {
    errors.phone =
      "Le numéro de téléphone est invalide.";
  }

  /*
   * Validation de la fréquence.
   */
  if (frequency === null) {
    errors.frequency =
      "La fréquence du don est invalide.";
  }

  /*
   * Validation de la devise.
   */
  if (currency === null) {
    errors.currency =
      "La devise sélectionnée est invalide.";
  }

  /*
   * Validation du montant.
   *
   * TypeScript sait ici que currency est une
   * DonationCurrency et que amount est un nombre
   * lorsque les deux valeurs ne sont pas null.
   */
  if (amount === null) {
    errors.amount =
      "Le montant du don est invalide.";
  } else if (currency !== null) {
    const limits =
      getDonationLimits(currency);

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

  /*
   * Validation du domaine soutenu.
   */
  if (allocation === null) {
    errors.allocation =
      "Le domaine sélectionné est invalide.";
  }

  /*
   * Validation du consentement.
   */
  if (donorValue.consent !== true) {
    errors.consent =
      "Le consentement est obligatoire.";
  }

  /*
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

  /*
   * Cette vérification explicite permet également
   * à TypeScript de garantir tous les types utilisés
   * pour construire les données validées.
   *
   * Elle constitue une sécurité supplémentaire,
   * même si les erreurs précédentes ont déjà été
   * contrôlées.
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

/*
 * Version destinée aux appels internes déjà typés.
 *
 * La validation complète reste exécutée pour ne jamais
 * faire confiance uniquement aux types TypeScript.
 */
export function validateTypedDonationCheckout(
  input: DonationCheckoutRequest
): DonationValidationResult {
  return validateDonationCheckout(
    input
  );
}