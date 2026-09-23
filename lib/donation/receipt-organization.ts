import "server-only";

import type {
  DonationReceiptOrganization,
} from "@/lib/donation/donation-receipt-pdf";

export class DonationReceiptOrganizationError
  extends Error {
  readonly code =
    "DONATION_RECEIPT_ORGANIZATION_NOT_CONFIGURED";

  constructor(
    message: string
  ) {
    super(message);

    this.name =
      "DonationReceiptOrganizationError";

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}

function readRequiredValue(
  name: string
): string {
  const value =
    process.env[name]
      ?.trim();

  if (!value) {
    throw new DonationReceiptOrganizationError(
      `${name} est absente.`
    );
  }

  return value;
}

function readOptionalValue(
  name: string
): string | null {
  const value =
    process.env[name]
      ?.trim();

  return value &&
    value.length > 0
    ? value
    : null;
}

function normalizeWebsite(
  value: string
): string {
  let url: URL;

  try {
    url =
      new URL(value);
  } catch {
    throw new DonationReceiptOrganizationError(
      "NEXT_PUBLIC_SITE_URL est invalide."
    );
  }

  if (
    url.protocol !== "https:" &&
    (
      process.env.NODE_ENV ===
        "production" ||
      url.protocol !== "http:"
    )
  ) {
    throw new DonationReceiptOrganizationError(
      "Le protocole du site Young Caring est invalide."
    );
  }

  if (
    url.username.length > 0 ||
    url.password.length > 0
  ) {
    throw new DonationReceiptOrganizationError(
      "L’adresse du site contient des identifiants interdits."
    );
  }

  return url.origin;
}

export function getDonationReceiptOrganization():
  DonationReceiptOrganization {
  const website =
    normalizeWebsite(
      readRequiredValue(
        "NEXT_PUBLIC_SITE_URL"
      )
    );

  return {
    name:
      readRequiredValue(
        "DONATION_RECEIPT_ORGANIZATION_NAME"
      ),

    address:
      readRequiredValue(
        "DONATION_RECEIPT_ORGANIZATION_ADDRESS"
      ),

    email:
      readRequiredValue(
        "DONATION_RECEIPT_ORGANIZATION_EMAIL"
      ),

    phone:
      readOptionalValue(
        "DONATION_RECEIPT_ORGANIZATION_PHONE"
      ),

    website,

    /**
     * Le générateur affichera le symbole YC.
     * Le logo pourra être intégré plus tard sous
     * forme de Data URL sans dépendance distante.
     */
    logoDataUrl:
      null,
  };
}

export default
  getDonationReceiptOrganization;