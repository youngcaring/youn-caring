import "server-only";

import {
  randomBytes,
} from "node:crypto";

/**
 * ============================================================================
 * YOUNG CARING
 * GÉNÉRATION DES RÉFÉRENCES DE REÇUS DE DON
 * ============================================================================
 *
 * Ce fichier :
 *
 * - génère une référence imprévisible pour chaque reçu ;
 * - utilise une source aléatoire cryptographiquement sûre ;
 * - valide strictement les références reçues ;
 * - normalise les références provenant d’une URL ou d’une route ;
 * - ne contient aucune information personnelle du donateur ;
 * - ne contient ni montant, ni e-mail, ni numéro de téléphone ;
 * - reste exclusivement côté serveur.
 *
 * Format :
 *
 * YCR-AAAAMMJJ-XXXXXXXXXXXXXXXX
 *
 * Exemple :
 *
 * YCR-20260923-8F14A9C037D2E6B1
 *
 * YCR signifie :
 *
 * Young Caring Receipt.
 *
 * La contrainte d’unicité définitive doit également être
 * appliquée dans PostgreSQL avec Prisma.
 * ============================================================================
 */

const RECEIPT_REFERENCE_PREFIX =
  "YCR";

const RECEIPT_RANDOM_BYTE_LENGTH =
  8;

const RECEIPT_RANDOM_HEX_LENGTH =
  RECEIPT_RANDOM_BYTE_LENGTH * 2;

const RECEIPT_REFERENCE_LENGTH =
  RECEIPT_REFERENCE_PREFIX.length +
  1 +
  8 +
  1 +
  RECEIPT_RANDOM_HEX_LENGTH;

const RECEIPT_REFERENCE_PATTERN =
  /^YCR-\d{8}-[A-F0-9]{16}$/;

const DATE_PART_PATTERN =
  /^\d{8}$/;

/**
 * Erreur contrôlée associée aux références
 * de reçus de don.
 */
export class DonationReceiptReferenceError
  extends Error {
  readonly code: string;

  constructor(
    code: string,
    message: string
  ) {
    super(message);

    this.name =
      "DonationReceiptReferenceError";

    this.code =
      code;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}

/**
 * Formate une valeur numérique sur
 * deux caractères.
 */
function padTwoDigits(
  value: number
): string {
  return value
    .toString()
    .padStart(
      2,
      "0"
    );
}

/**
 * Vérifie qu’une date peut être utilisée
 * pour créer une référence.
 */
function assertValidDate(
  value: Date
): void {
  if (
    !(value instanceof Date) ||
    Number.isNaN(
      value.getTime()
    )
  ) {
    throw new DonationReceiptReferenceError(
      "INVALID_RECEIPT_REFERENCE_DATE",
      "La date utilisée pour générer la référence du reçu est invalide."
    );
  }

  /**
   * Limites défensives permettant d’éviter
   * des années incompatibles avec le format
   * fixe AAAAMMJJ.
   */
  const year =
    value.getUTCFullYear();

  if (
    year < 2000 ||
    year > 9999
  ) {
    throw new DonationReceiptReferenceError(
      "UNSUPPORTED_RECEIPT_REFERENCE_DATE",
      "La date utilisée pour générer la référence du reçu n’est pas autorisée."
    );
  }
}

/**
 * Construit la partie AAAAMMJJ à partir
 * d’une date UTC.
 *
 * UTC évite qu’un changement de fuseau horaire
 * produise deux dates différentes pour le même
 * instant.
 */
function createUtcDatePart(
  date: Date
): string {
  assertValidDate(
    date
  );

  const datePart = [
    date
      .getUTCFullYear()
      .toString()
      .padStart(
        4,
        "0"
      ),

    padTwoDigits(
      date.getUTCMonth() + 1
    ),

    padTwoDigits(
      date.getUTCDate()
    ),
  ].join("");

  if (
    !DATE_PART_PATTERN.test(
      datePart
    )
  ) {
    throw new DonationReceiptReferenceError(
      "INVALID_RECEIPT_DATE_PART",
      "La date de la référence du reçu n’a pas pu être générée."
    );
  }

  return datePart;
}

/**
 * Vérifie qu’une partie AAAAMMJJ représente
 * une véritable date du calendrier.
 */
function isValidDatePart(
  value: string
): boolean {
  if (
    !DATE_PART_PATTERN.test(
      value
    )
  ) {
    return false;
  }

  const year =
    Number(
      value.slice(
        0,
        4
      )
    );

  const month =
    Number(
      value.slice(
        4,
        6
      )
    );

  const day =
    Number(
      value.slice(
        6,
        8
      )
    );

  if (
    year < 2000 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return false;
  }

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return (
    date.getUTCFullYear() ===
      year &&
    date.getUTCMonth() ===
      month - 1 &&
    date.getUTCDate() ===
      day
  );
}

/**
 * Génère une référence de reçu imprévisible.
 *
 * La partie aléatoire contient 64 bits d’entropie.
 *
 * La base de données doit néanmoins posséder
 * une contrainte unique sur cette référence.
 */
export function generateDonationReceiptReference(
  date: Date = new Date()
): string {
  const datePart =
    createUtcDatePart(
      date
    );

  let randomPart:
    string;

  try {
    randomPart =
      randomBytes(
        RECEIPT_RANDOM_BYTE_LENGTH
      )
        .toString("hex")
        .toUpperCase();
  } catch {
    throw new DonationReceiptReferenceError(
      "RECEIPT_REFERENCE_GENERATION_FAILED",
      "La référence du reçu n’a pas pu être générée."
    );
  }

  if (
    randomPart.length !==
      RECEIPT_RANDOM_HEX_LENGTH ||
    !/^[A-F0-9]+$/.test(
      randomPart
    )
  ) {
    throw new DonationReceiptReferenceError(
      "INVALID_RECEIPT_RANDOM_PART",
      "La partie aléatoire de la référence du reçu est invalide."
    );
  }

  const reference =
    `${RECEIPT_REFERENCE_PREFIX}-${datePart}-${randomPart}`;

  /**
   * Contrôle défensif final.
   */
  if (
    !isValidDonationReceiptReference(
      reference
    )
  ) {
    throw new DonationReceiptReferenceError(
      "INVALID_GENERATED_RECEIPT_REFERENCE",
      "La référence du reçu générée est invalide."
    );
  }

  return reference;
}

/**
 * Vérifie qu’une valeur respecte entièrement
 * le format d’une référence de reçu.
 */
export function isValidDonationReceiptReference(
  value: unknown
): value is string {
  if (
    typeof value !== "string" ||
    value.length !==
      RECEIPT_REFERENCE_LENGTH ||
    !RECEIPT_REFERENCE_PATTERN.test(
      value
    )
  ) {
    return false;
  }

  const datePart =
    value.slice(
      RECEIPT_REFERENCE_PREFIX.length +
        1,
      RECEIPT_REFERENCE_PREFIX.length +
        1 +
        8
    );

  return isValidDatePart(
    datePart
  );
}

/**
 * Nettoie et valide une référence provenant
 * d’une URL, d’un paramètre ou d’une route.
 *
 * Retourne null lorsque la valeur est absente,
 * ambiguë ou invalide.
 */
export function normalizeDonationReceiptReference(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .toUpperCase();

  if (
    !isValidDonationReceiptReference(
      normalized
    )
  ) {
    return null;
  }

  return normalized;
}

/**
 * Valide une référence lorsqu’une erreur contrôlée
 * est préférable à une valeur null.
 *
 * Cette fonction est adaptée aux services internes
 * qui exigent obligatoirement une référence valide.
 */
export function assertDonationReceiptReference(
  value: unknown
): string {
  const reference =
    normalizeDonationReceiptReference(
      value
    );

  if (!reference) {
    throw new DonationReceiptReferenceError(
      "INVALID_DONATION_RECEIPT_REFERENCE",
      "La référence du reçu de don est invalide."
    );
  }

  return reference;
}

/**
 * Extrait la date UTC inscrite dans la référence.
 *
 * Cette date sert uniquement à l’organisation
 * et à l’affichage. La date officielle du reçu
 * reste toujours celle enregistrée en base.
 */
export function getDonationReceiptReferenceDate(
  value: unknown
): Date | null {
  const reference =
    normalizeDonationReceiptReference(
      value
    );

  if (!reference) {
    return null;
  }

  const datePart =
    reference.slice(
      RECEIPT_REFERENCE_PREFIX.length +
        1,
      RECEIPT_REFERENCE_PREFIX.length +
        1 +
        8
    );

  const year =
    Number(
      datePart.slice(
        0,
        4
      )
    );

  const month =
    Number(
      datePart.slice(
        4,
        6
      )
    );

  const day =
    Number(
      datePart.slice(
        6,
        8
      )
    );

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );
}

/**
 * Retourne une version partiellement masquée
 * adaptée aux journaux techniques.
 *
 * La référence complète ne doit être journalisée
 * que lorsque cela est réellement nécessaire.
 */
export function maskDonationReceiptReference(
  value: unknown
): string {
  const reference =
    normalizeDonationReceiptReference(
      value
    );

  if (!reference) {
    return "INVALID_RECEIPT_REFERENCE";
  }

  const randomPart =
    reference.slice(
      reference.lastIndexOf("-") +
        1
    );

  return [
    RECEIPT_REFERENCE_PREFIX,
    "********",
    `${randomPart.slice(0, 4)}********${randomPart.slice(-4)}`,
  ].join("-");
}