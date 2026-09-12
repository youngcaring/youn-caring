import "server-only";

import {
  randomBytes,
} from "node:crypto";

const CONTACT_REFERENCE_PATTERN =
  /^YC-MSG-\d{8}-[A-F0-9]{16}$/;

/*
 * Produit une référence sécurisée semblable à :
 * YC-MSG-20260912-A1B2C3D4E5F60718
 */
export function generateContactReference():
  string {
  const now = new Date();

  const year =
    now.getUTCFullYear();

  const month =
    String(
      now.getUTCMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getUTCDate()
    ).padStart(2, "0");

  const randomPart =
    randomBytes(8)
      .toString("hex")
      .toUpperCase();

  return [
    "YC-MSG",
    `${year}${month}${day}`,
    randomPart,
  ].join("-");
}

/*
 * Nettoie et vérifie une référence reçue.
 */
export function normalizeContactReference(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value.trim().toUpperCase();

  if (
    !CONTACT_REFERENCE_PATTERN.test(
      normalized
    )
  ) {
    return null;
  }

  return normalized;
}

/*
 * Vérifie qu’une valeur est une référence valide.
 */
export function isContactReference(
  value: unknown
): value is string {
  return (
    normalizeContactReference(value) !==
    null
  );
}