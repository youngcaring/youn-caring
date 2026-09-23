import "server-only";

/*
 * Le composant Image utilisé dans ce fichier provient de
 * @react-pdf/renderer et non du DOM HTML.
 *
 * ImageProps de React-PDF ne possède pas de propriété alt.
 * Cette règle d’accessibilité HTML ne s’applique donc pas
 * aux éléments dessinés dans le document PDF.
 */
/* eslint-disable jsx-a11y/alt-text */

import React from "react";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import {
  assertDonationReceiptReference,
} from "@/lib/donation/receipt-reference";

import {
  normalizeDonationReference,
} from "@/lib/donation/payment-reference";

import type {
  DonationCurrency,
  DonationFrequency,
  DonationPaymentStatus,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * GÉNÉRATION DU REÇU PDF DE DON
 * ============================================================================
 *
 * Ce fichier :
 *
 * - fonctionne exclusivement côté serveur ;
 * - refuse de générer un reçu si le paiement n’est pas paid ;
 * - vérifie les références du paiement et du reçu ;
 * - génère un PDF A4 professionnel ;
 * - affiche le logo de l’ONG lorsqu’il est fourni ;
 * - affiche les coordonnées officielles de l’ONG ;
 * - affiche les informations vérifiées du don ;
 * - ne contient aucune information bancaire ;
 * - ne charge aucune ressource distante ;
 * - retourne un Buffer prêt à être joint à un e-mail Resend.
 *
 * Le logo doit être fourni sous forme de Data URL PNG ou JPEG :
 *
 * data:image/png;base64,...
 *
 * ============================================================================
 */

const PDF_MIME_TYPE =
  "application/pdf";

const MAX_ORGANIZATION_NAME_LENGTH =
  150;

const MAX_CONTACT_VALUE_LENGTH =
  250;

const MAX_DONOR_NAME_LENGTH =
  150;

const MAX_EMAIL_LENGTH =
  254;

const MAX_ALLOCATION_LABEL_LENGTH =
  150;

const MAX_LOGO_DATA_URL_LENGTH =
  3_000_000;

const CONTROL_CHARACTERS_PATTERN =
  /[\u0000-\u001F\u007F]/g;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_CURRENCIES:
  readonly DonationCurrency[] = [
  "XOF",
  "EUR",
  "USD",
];

const ALLOWED_FREQUENCIES:
  readonly DonationFrequency[] = [
  "once",
  "monthly",
];

/**
 * Coordonnées officielles affichées
 * dans le reçu.
 */
export type DonationReceiptOrganization =
  Readonly<{
    name: string;
    address: string;
    email: string;
    phone: string | null;
    website: string | null;

    /**
     * Logo PNG ou JPEG sous forme de Data URL.
     *
     * null permet de générer le reçu sans logo
     * si celui-ci est temporairement indisponible.
     */
    logoDataUrl: string | null;
  }>;

/**
 * Informations privées nécessaires au reçu.
 *
 * Aucune donnée bancaire ne doit être ajoutée ici.
 */
export type DonationReceiptDonor =
  Readonly<{
    firstName: string;
    lastName: string;
    email: string;
    anonymous: boolean;
  }>;

/**
 * Données vérifiées nécessaires à la création
 * du reçu PDF.
 */
export type GenerateDonationReceiptPdfInput =
  Readonly<{
    receiptReference: string;
    donationReference: string;

    paymentStatus:
      DonationPaymentStatus;

    amount: number;
    currency:
      DonationCurrency;

    frequency:
      DonationFrequency;

    /**
     * Libellé déjà traduit du domaine soutenu.
     */
    allocationLabel: string;

    /**
     * Date officielle d’émission du reçu.
     */
    issuedAt: Date;

    /**
     * Date à laquelle le paiement a été confirmé.
     */
    paidAt: Date;

    donor:
      DonationReceiptDonor;

    organization:
      DonationReceiptOrganization;

    language?: "fr" | "en";
  }>;

/**
 * Résultat prêt à être envoyé comme
 * pièce jointe.
 */
export type GeneratedDonationReceiptPdf =
  Readonly<{
    buffer: Buffer;
    fileName: string;
    mimeType: typeof PDF_MIME_TYPE;
    receiptReference: string;
  }>;

/**
 * Données internes entièrement normalisées.
 */
type NormalizedReceiptData =
  Readonly<{
    receiptReference: string;
    donationReference: string;
    amount: number;
    currency:
      DonationCurrency;
    frequency:
      DonationFrequency;
    allocationLabel: string;
    issuedAt: Date;
    paidAt: Date;
    donorName: string;
    donorEmail: string;
    anonymous: boolean;
    organizationName: string;
    organizationAddress: string;
    organizationEmail: string;
    organizationPhone: string | null;
    organizationWebsite: string | null;
    logoDataUrl: string | null;
    language: "fr" | "en";
  }>;

/**
 * Erreur contrôlée du générateur de reçus.
 */
export class DonationReceiptPdfError
  extends Error {
  readonly code: string;

  constructor(
    code: string,
    message: string
  ) {
    super(message);

    this.name =
      "DonationReceiptPdfError";

    this.code =
      code;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}

/**
 * Nettoie une chaîne sans tronquer silencieusement
 * une donnée trop longue.
 */
function normalizeRequiredText(
  value: string,
  fieldName: string,
  maximumLength: number
): string {
  if (
    typeof value !== "string"
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_DATA",
      `${fieldName} est invalide.`
    );
  }

  const normalized =
    value
      .replace(
        CONTROL_CHARACTERS_PATTERN,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();

  if (
    normalized.length === 0 ||
    normalized.length >
      maximumLength
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_DATA",
      `${fieldName} est invalide.`
    );
  }

  return normalized;
}

/**
 * Nettoie une chaîne optionnelle.
 */
function normalizeOptionalText(
  value: string | null,
  fieldName: string,
  maximumLength: number
): string | null {
  if (value === null) {
    return null;
  }

  const normalized =
    value
      .replace(
        CONTROL_CHARACTERS_PATTERN,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();

  if (
    normalized.length === 0
  ) {
    return null;
  }

  if (
    normalized.length >
    maximumLength
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_DATA",
      `${fieldName} est invalide.`
    );
  }

  return normalized;
}

/**
 * Vérifie une adresse e-mail.
 */
function normalizeEmail(
  value: string,
  fieldName: string
): string {
  const email =
    normalizeRequiredText(
      value,
      fieldName,
      MAX_EMAIL_LENGTH
    ).toLowerCase();

  if (
    !EMAIL_PATTERN.test(email)
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_EMAIL",
      `${fieldName} est invalide.`
    );
  }

  return email;
}

/**
 * Vérifie une date.
 */
function normalizeDate(
  value: Date,
  fieldName: string
): Date {
  if (
    !(value instanceof Date) ||
    Number.isNaN(
      value.getTime()
    )
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_DATE",
      `${fieldName} est invalide.`
    );
  }

  return new Date(
    value.getTime()
  );
}

/**
 * Autorise uniquement une image PNG ou JPEG
 * directement intégrée dans le document.
 *
 * Les URL distantes et chemins arbitraires
 * sont refusés pour éviter tout chargement externe.
 */
function normalizeLogoDataUrl(
  value: string | null
): string | null {
  if (value === null) {
    return null;
  }

  const normalized =
    value.trim();

  if (
    normalized.length === 0
  ) {
    return null;
  }

  if (
  normalized.length >
    MAX_LOGO_DATA_URL_LENGTH ||
  !/^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(
    normalized
  )
) {
  throw new DonationReceiptPdfError(
    "INVALID_RECEIPT_LOGO",
    "Le logo du reçu doit être une image PNG ou JPEG valide."
  );
}

  return normalized;
}

/**
 * Vérifie et normalise toutes les données
 * avant la création du document.
 */
function normalizeReceiptInput(
  input:
    GenerateDonationReceiptPdfInput
): NormalizedReceiptData {
  if (
    input.paymentStatus !==
    "paid"
  ) {
    throw new DonationReceiptPdfError(
      "PAYMENT_NOT_CONFIRMED",
      "Un reçu ne peut être généré que pour un paiement confirmé."
    );
  }

  const receiptReference =
    assertDonationReceiptReference(
      input.receiptReference
    );

  const donationReference =
    normalizeDonationReference(
      input.donationReference
    );

  if (!donationReference) {
    throw new DonationReceiptPdfError(
      "INVALID_DONATION_REFERENCE",
      "La référence du don est invalide."
    );
  }

  if (
    !Number.isSafeInteger(
      input.amount
    ) ||
    input.amount <= 0
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_AMOUNT",
      "Le montant du reçu est invalide."
    );
  }

  if (
    !ALLOWED_CURRENCIES.includes(
      input.currency
    )
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_CURRENCY",
      "La devise du reçu est invalide."
    );
  }

  if (
    !ALLOWED_FREQUENCIES.includes(
      input.frequency
    )
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_FREQUENCY",
      "La fréquence du don est invalide."
    );
  }

  const issuedAt =
    normalizeDate(
      input.issuedAt,
      "issuedAt"
    );

  const paidAt =
    normalizeDate(
      input.paidAt,
      "paidAt"
    );

  /**
   * Un reçu ne peut pas être émis avant
   * la confirmation du paiement.
   *
   * Une tolérance d’une minute absorbe
   * les petites différences d’horloge.
   */
  if (
    issuedAt.getTime() +
      60_000 <
    paidAt.getTime()
  ) {
    throw new DonationReceiptPdfError(
      "INVALID_RECEIPT_TIMELINE",
      "La date d’émission du reçu précède la confirmation du paiement."
    );
  }

  const firstName =
    normalizeRequiredText(
      input.donor.firstName,
      "donor.firstName",
      MAX_DONOR_NAME_LENGTH
    );

  const lastName =
    normalizeRequiredText(
      input.donor.lastName,
      "donor.lastName",
      MAX_DONOR_NAME_LENGTH
    );

  const donorName =
    `${firstName} ${lastName}`;

  const language =
    input.language === "en"
      ? "en"
      : "fr";

  return {
    receiptReference,
    donationReference,
    amount:
      input.amount,
    currency:
      input.currency,
    frequency:
      input.frequency,

    allocationLabel:
      normalizeRequiredText(
        input.allocationLabel,
        "allocationLabel",
        MAX_ALLOCATION_LABEL_LENGTH
      ),

    issuedAt,
    paidAt,
    donorName,

    donorEmail:
      normalizeEmail(
        input.donor.email,
        "donor.email"
      ),

    anonymous:
      input.donor.anonymous,

    organizationName:
      normalizeRequiredText(
        input.organization.name,
        "organization.name",
        MAX_ORGANIZATION_NAME_LENGTH
      ),

    organizationAddress:
      normalizeRequiredText(
        input.organization.address,
        "organization.address",
        MAX_CONTACT_VALUE_LENGTH
      ),

    organizationEmail:
      normalizeEmail(
        input.organization.email,
        "organization.email"
      ),

    organizationPhone:
      normalizeOptionalText(
        input.organization.phone,
        "organization.phone",
        MAX_CONTACT_VALUE_LENGTH
      ),

    organizationWebsite:
      normalizeOptionalText(
        input.organization.website,
        "organization.website",
        MAX_CONTACT_VALUE_LENGTH
      ),

    logoDataUrl:
      normalizeLogoDataUrl(
        input.organization.logoDataUrl
      ),

    language,
  };
}

/**
 * Formate un montant sans effectuer
 * de conversion de devise.
 */
function formatAmount(
  amount: number,
  currency:
    DonationCurrency,
  language: "fr" | "en"
): string {
  const locale =
    language === "en"
      ? "en-US"
      : "fr-FR";

  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency,
      currencyDisplay:
        "code",
      minimumFractionDigits:
        currency === "XOF"
          ? 0
          : 2,
      maximumFractionDigits:
        currency === "XOF"
          ? 0
          : 2,
    }
  ).format(amount);
}

/**
 * Formate une date UTC pour garantir un rendu
 * identique quel que soit le serveur.
 */
function formatDate(
  value: Date,
  language: "fr" | "en"
): string {
  return new Intl.DateTimeFormat(
    language === "en"
      ? "en-GB"
      : "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(value);
}

/**
 * Libellé de la fréquence.
 */
function getFrequencyLabel(
  frequency:
    DonationFrequency,
  language: "fr" | "en"
): string {
  if (
    frequency === "monthly"
  ) {
    return language === "en"
      ? "Monthly contribution"
      : "Contribution mensuelle";
  }

  return language === "en"
    ? "One-time contribution"
    : "Contribution ponctuelle";
}

const styles =
  StyleSheet.create({
    page: {
      paddingTop: 34,
      paddingRight: 38,
      paddingBottom: 48,
      paddingLeft: 38,
      fontFamily: "Helvetica",
      fontSize: 10,
      lineHeight: 1.45,
      color: "#1D2B2E",
      backgroundColor: "#FFFFFF",
    },

    topAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 9,
      backgroundColor: "#0097A7",
    },

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#DCE6E7",
    },

    identity: {
      width: "58%",
      flexDirection: "row",
      alignItems: "center",
    },

    logo: {
      width: 64,
      height: 64,
      marginRight: 14,
      objectFit: "contain",
    },

    logoPlaceholder: {
      width: 64,
      height: 64,
      marginRight: 14,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 32,
      backgroundColor: "#0097A7",
    },

    logoPlaceholderText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: 700,
    },

    organizationName: {
      marginBottom: 4,
      color: "#092124",
      fontSize: 18,
      fontWeight: 700,
    },

    organizationContact: {
      marginBottom: 2,
      color: "#5B6B6E",
      fontSize: 8.5,
    },

    receiptIdentity: {
      width: "38%",
      alignItems: "flex-end",
    },

    receiptLabel: {
      marginBottom: 5,
      color: "#F36C16",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },

    receiptReference: {
      color: "#092124",
      fontSize: 11,
      fontWeight: 700,
      textAlign: "right",
    },

    receiptDate: {
      marginTop: 5,
      color: "#68777A",
      fontSize: 8.5,
      textAlign: "right",
    },

    thankYouBox: {
      marginTop: 24,
      paddingTop: 18,
      paddingRight: 20,
      paddingBottom: 18,
      paddingLeft: 20,
      borderRadius: 10,
      backgroundColor: "#EAF8F9",
    },

    thankYouTitle: {
      marginBottom: 7,
      color: "#007D88",
      fontSize: 16,
      fontWeight: 700,
      textAlign: "center",
    },

    thankYouText: {
      color: "#315D62",
      fontSize: 10,
      lineHeight: 1.55,
      textAlign: "center",
    },

    section: {
      marginTop: 22,
    },

    sectionTitle: {
      marginBottom: 10,
      color: "#092124",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },

    donorBox: {
      padding: 14,
      borderWidth: 1,
      borderColor: "#DCE6E7",
      borderRadius: 8,
      backgroundColor: "#F8FAFA",
    },

    donorName: {
      color: "#182628",
      fontSize: 12,
      fontWeight: 700,
    },

    donorEmail: {
      marginTop: 4,
      color: "#607074",
      fontSize: 9,
    },

    anonymousNotice: {
      marginTop: 5,
      color: "#007D88",
      fontSize: 8.5,
    },

    table: {
      borderWidth: 1,
      borderColor: "#DCE6E7",
      borderRadius: 8,
      overflow: "hidden",
    },

    row: {
      minHeight: 35,
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#E5ECEC",
    },

    lastRow: {
      borderBottomWidth: 0,
    },

    rowLabel: {
      width: "42%",
      paddingVertical: 10,
      paddingHorizontal: 12,
      color: "#617174",
      fontSize: 9,
      backgroundColor: "#F6F9F9",
    },

    rowValue: {
      width: "58%",
      paddingVertical: 10,
      paddingHorizontal: 12,
      color: "#182628",
      fontSize: 9.5,
      fontWeight: 700,
      textAlign: "right",
    },

    amountBox: {
      marginTop: 20,
      paddingTop: 16,
      paddingRight: 18,
      paddingBottom: 16,
      paddingLeft: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 9,
      backgroundColor: "#092124",
    },

    amountLabel: {
      color: "#B8C7C9",
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
    },

    amountValue: {
      maxWidth: "65%",
      color: "#42D1DC",
      fontSize: 20,
      fontWeight: 700,
      textAlign: "right",
    },

    confirmationBox: {
      marginTop: 18,
      padding: 12,
      borderLeftWidth: 4,
      borderLeftColor: "#27A55F",
      backgroundColor: "#ECF9F1",
    },

    confirmationTitle: {
      marginBottom: 3,
      color: "#167340",
      fontSize: 10,
      fontWeight: 700,
    },

    confirmationText: {
      color: "#3D6650",
      fontSize: 8.5,
      lineHeight: 1.5,
    },

    legalNotice: {
      marginTop: 20,
      color: "#667679",
      fontSize: 8,
      lineHeight: 1.5,
      textAlign: "center",
    },

    footer: {
      position: "absolute",
      left: 38,
      right: 38,
      bottom: 22,
      paddingTop: 9,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: "#DCE6E7",
    },

    footerText: {
      maxWidth: "75%",
      color: "#788689",
      fontSize: 7.5,
    },

    pageNumber: {
      color: "#788689",
      fontSize: 7.5,
    },
  });

/**
 * Ligne du tableau récapitulatif.
 */
function ReceiptRow({
  label,
  value,
  last = false,
}: Readonly<{
  label: string;
  value: string;
  last?: boolean;
}>) {
  return (
    <View
      style={[
        styles.row,
        last
          ? styles.lastRow
          : {},
      ]}
    >
      <Text style={styles.rowLabel}>
        {label}
      </Text>

      <Text style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

/**
 * Document React-PDF.
 */
export function DonationReceiptDocument({
  data,
}: Readonly<{
  data:
    NormalizedReceiptData;
}>) {
  const isEnglish =
    data.language === "en";

  const displayedDonorName =
    data.anonymous
      ? isEnglish
        ? "Anonymous donor"
        : "Donateur anonyme"
      : data.donorName;

  return (
    <Document
      title={`${isEnglish ? "Donation receipt" : "Reçu de don"} ${data.receiptReference}`}
      author={data.organizationName}
      subject={
        isEnglish
          ? "Donation receipt"
          : "Reçu de contribution"
      }
      creator="Young Caring"
      producer="Young Caring"
      keywords={[
        "Young Caring",
        "donation",
        "receipt",
        data.receiptReference,
      ].join(", ")}
    >
      <Page
        size="A4"
        style={styles.page}
      >
        <View
          fixed
          style={styles.topAccent}
        />

        <View style={styles.header}>
          <View style={styles.identity}>
            {data.logoDataUrl ? (
              <Image
                src={data.logoDataUrl}
                style={styles.logo}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>
                  YC
                </Text>
              </View>
            )}

            <View>
              <Text style={styles.organizationName}>
                {data.organizationName}
              </Text>

              <Text style={styles.organizationContact}>
                {data.organizationAddress}
              </Text>

              <Text style={styles.organizationContact}>
                {data.organizationEmail}
              </Text>

              {data.organizationPhone ? (
                <Text style={styles.organizationContact}>
                  {data.organizationPhone}
                </Text>
              ) : null}

              {data.organizationWebsite ? (
                <Text style={styles.organizationContact}>
                  {data.organizationWebsite}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.receiptIdentity}>
            <Text style={styles.receiptLabel}>
              {isEnglish
                ? "Donation receipt"
                : "Reçu de don"}
            </Text>

            <Text style={styles.receiptReference}>
              {data.receiptReference}
            </Text>

            <Text style={styles.receiptDate}>
              {isEnglish
                ? "Issued on"
                : "Émis le"}{" "}
              {formatDate(
                data.issuedAt,
                data.language
              )}
            </Text>
          </View>
        </View>

        <View style={styles.thankYouBox}>
          <Text style={styles.thankYouTitle}>
            {isEnglish
              ? "Thank you for your support"
              : "Merci pour votre soutien"}
          </Text>

          <Text style={styles.thankYouText}>
            {isEnglish
              ? "Your contribution supports the actions carried out by Young Caring for the communities and people it assists."
              : "Votre contribution soutient les actions menées par Young Caring auprès des communautés et des personnes accompagnées."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish
              ? "Donor"
              : "Donateur"}
          </Text>

          <View style={styles.donorBox}>
            <Text style={styles.donorName}>
              {displayedDonorName}
            </Text>

            <Text style={styles.donorEmail}>
              {data.donorEmail}
            </Text>

            {data.anonymous ? (
              <Text style={styles.anonymousNotice}>
                {isEnglish
                  ? "The donor requested not to be publicly identified."
                  : "Le donateur a demandé à ne pas être identifié publiquement."}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEnglish
              ? "Contribution details"
              : "Détails de la contribution"}
          </Text>

          <View style={styles.table}>
            <ReceiptRow
              label={
                isEnglish
                  ? "Donation reference"
                  : "Référence du don"
              }
              value={
                data.donationReference
              }
            />

            <ReceiptRow
              label={
                isEnglish
                  ? "Payment date"
                  : "Date du paiement"
              }
              value={formatDate(
                data.paidAt,
                data.language
              )}
            />

            <ReceiptRow
              label={
                isEnglish
                  ? "Frequency"
                  : "Fréquence"
              }
              value={getFrequencyLabel(
                data.frequency,
                data.language
              )}
            />

            <ReceiptRow
              label={
                isEnglish
                  ? "Supported area"
                  : "Domaine soutenu"
              }
              value={
                data.allocationLabel
              }
            />

            <ReceiptRow
              label={
                isEnglish
                  ? "Currency"
                  : "Devise"
              }
              value={data.currency}
              last
            />
          </View>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>
            {isEnglish
              ? "Confirmed amount"
              : "Montant confirmé"}
          </Text>

          <Text style={styles.amountValue}>
            {formatAmount(
              data.amount,
              data.currency,
              data.language
            )}
          </Text>
        </View>

        <View style={styles.confirmationBox}>
          <Text style={styles.confirmationTitle}>
            {isEnglish
              ? "Payment confirmed"
              : "Paiement confirmé"}
          </Text>

          <Text style={styles.confirmationText}>
            {isEnglish
              ? "This receipt was generated after server-side confirmation of the payment. It contains no banking information."
              : "Ce reçu a été généré après confirmation du paiement côté serveur. Il ne contient aucune information bancaire."}
          </Text>
        </View>

        <Text style={styles.legalNotice}>
          {isEnglish
            ? "This document acknowledges the contribution referenced above. It does not, by itself, constitute a tax certificate or grant a tax benefit."
            : "Ce document atteste la contribution référencée ci-dessus. Il ne constitue pas, à lui seul, une attestation fiscale et n’accorde aucun avantage fiscal."}
        </Text>

        <View
          fixed
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            {data.organizationName} —{" "}
            {data.organizationEmail}
          </Text>

          <Text
            style={styles.pageNumber}
            render={({
              pageNumber,
              totalPages,
            }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

/**
 * Génère le reçu PDF en mémoire.
 *
 * Le Buffer retourné peut être transmis directement
 * à Resend comme contenu de pièce jointe.
 */
export async function generateDonationReceiptPdf(
  input:
    GenerateDonationReceiptPdfInput
): Promise<GeneratedDonationReceiptPdf> {
  const data =
    normalizeReceiptInput(
      input
    );

  try {
    const buffer =
      await renderToBuffer(
        <DonationReceiptDocument
          data={data}
        />
      );

    if (
      !Buffer.isBuffer(buffer) ||
      buffer.length === 0
    ) {
      throw new DonationReceiptPdfError(
        "EMPTY_RECEIPT_PDF",
        "Le PDF du reçu généré est vide."
      );
    }

    const maximumPdfSize =
      10_000_000;

    if (
      buffer.length >
      maximumPdfSize
    ) {
      throw new DonationReceiptPdfError(
        "RECEIPT_PDF_TOO_LARGE",
        "Le PDF du reçu dépasse la taille autorisée."
      );
    }

    return {
      buffer,
      fileName:
        `recu-don-${data.receiptReference}.pdf`,
      mimeType:
        PDF_MIME_TYPE,
      receiptReference:
        data.receiptReference,
    };
  } catch (error: unknown) {
    if (
      error instanceof
      DonationReceiptPdfError
    ) {
      throw error;
    }

    console.error(
      "Donation receipt PDF generation failed:",
      {
        name:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );

    throw new DonationReceiptPdfError(
      "RECEIPT_PDF_GENERATION_FAILED",
      "Le reçu PDF n’a pas pu être généré."
    );
  }
}

export default
  generateDonationReceiptPdf;