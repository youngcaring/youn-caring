import "server-only";

import {
  randomBytes,
} from "node:crypto";

/**
 * ============================================================================
 * YOUNG CARING
 * GÉNÉRATION ET VALIDATION DES RÉFÉRENCES DE DON
 * ============================================================================
 *
 * Format officiel :
 *
 * YC-AAAAMMJJ-XXXXXXXXXXXX
 *
 * Exemple :
 *
 * YC-20260911-8F14A9C037D2
 *
 * Composition :
 *
 * - YC : préfixe Young Caring ;
 * - AAAAMMJJ : date UTC de création ;
 * - 12 caractères hexadécimaux aléatoires ;
 * - 48 bits d’aléatoire cryptographique.
 *
 * Ce fichier :
 *
 * - génère les références exclusivement côté serveur ;
 * - utilise node:crypto ;
 * - vérifie strictement leur format ;
 * - nettoie les références provenant des URL ;
 * - n’utilise jamais Math.random().
 * ============================================================================
 */

const DONATION_REFERENCE_PREFIX =
  "YC";

const DONATION_REFERENCE_RANDOM_BYTES =
  6;

const DONATION_REFERENCE_LENGTH =
  24;

const REFERENCE_PATTERN =
  /^YC-\d{8}-[A-F0-9]{12}$/;

/**
 * Formate une valeur entière positive
 * sur deux caractères.
 */
function pad(
  value: number
): string {
  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      "INVALID_REFERENCE_DATE_PART"
    );
  }

  return value
    .toString()
    .padStart(2, "0");
}

/**
 * Vérifie qu’une date est valide.
 */
function assertValidDate(
  date: Date
): void {
  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    throw new Error(
      "INVALID_REFERENCE_DATE"
    );
  }
}

/**
 * Génère une référence imprévisible
 * et unique pour un don.
 *
 * La date est exprimée en UTC afin que le format
 * reste identique quel que soit le serveur.
 *
 * Exemple :
 *
 * YC-20260911-8F14A9C037D2
 */
export function generateDonationReference(
  date: Date = new Date()
): string {
  assertValidDate(date);

  const datePart = [
    date.getUTCFullYear(),
    pad(
      date.getUTCMonth() + 1
    ),
    pad(
      date.getUTCDate()
    ),
  ].join("");

  const randomPart =
    randomBytes(
      DONATION_REFERENCE_RANDOM_BYTES
    )
      .toString("hex")
      .toUpperCase();

  const reference =
    `${DONATION_REFERENCE_PREFIX}-${datePart}-${randomPart}`;

  /**
   * Cette vérification protège contre une future
   * modification accidentelle du format.
   */
  if (
    !REFERENCE_PATTERN.test(
      reference
    )
  ) {
    throw new Error(
      "DONATION_REFERENCE_GENERATION_FAILED"
    );
  }

  return reference;
}

/**
 * Vérifie une référence avant son utilisation
 * dans une requête ou une recherche en base.
 *
 * Cette fonction n’effectue aucun nettoyage :
 * la valeur doit déjà respecter exactement
 * le format officiel.
 */
export function isValidDonationReference(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.length ===
      DONATION_REFERENCE_LENGTH &&
    REFERENCE_PATTERN.test(value)
  );
}

/**
 * Nettoie une référence provenant :
 *
 * - d’une URL ;
 * - d’un paramètre de route ;
 * - d’un formulaire ;
 * - d’une redirection de paiement.
 *
 * Une valeur invalide retourne null.
 */
export function normalizeDonationReference(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  /**
   * Une limite préalable évite de traiter
   * une chaîne anormalement volumineuse.
   */
  if (
    value.length >
    DONATION_REFERENCE_LENGTH + 20
  ) {
    return null;
  }

  const normalizedValue =
    value
      .trim()
      .toUpperCase();

  if (
    normalizedValue.length !==
    DONATION_REFERENCE_LENGTH
  ) {
    return null;
  }

  return isValidDonationReference(
    normalizedValue
  )
    ? normalizedValue
    : null;
}