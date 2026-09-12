import { randomBytes } from "node:crypto";

const REFERENCE_PATTERN =
  /^YC-\d{8}-[A-F0-9]{12}$/;

/*
 * Formate une valeur numérique sur deux caractères.
 */

function pad(value: number): string {
  return value
    .toString()
    .padStart(2, "0");
}

/*
 * Génère une référence imprévisible.
 *
 * Exemple :
 * YC-20260911-8F14A9C037D2
 */

export function generateDonationReference(
  date: Date = new Date()
): string {
  if (
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      "INVALID_REFERENCE_DATE"
    );
  }

  const datePart = [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
  ].join("");

  const randomPart =
    randomBytes(6)
      .toString("hex")
      .toUpperCase();

  return `YC-${datePart}-${randomPart}`;
}

/*
 * Vérifie une référence reçue avant de l’utiliser
 * dans une requête ou une recherche en base.
 */

export function isValidDonationReference(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    REFERENCE_PATTERN.test(value)
  );
}

/*
 * Nettoie une référence provenant d’une URL.
 */

export function normalizeDonationReference(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue =
    value.trim().toUpperCase();

  return isValidDonationReference(
    normalizedValue
  )
    ? normalizedValue
    : null;
}