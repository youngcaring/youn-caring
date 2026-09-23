import "server-only";

import { Resend } from "resend";

import type {
  DonationCurrency,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * ENVOI DU REÇU DE DON PAR E-MAIL
 * ============================================================================
 *
 * Ce fichier :
 *
 * - envoie le message de confirmation du don ;
 * - joint le reçu PDF généré côté serveur ;
 * - protège les en-têtes et les données affichées ;
 * - ne contient aucune donnée bancaire ;
 * - ne confirme jamais lui-même un paiement ;
 * - ne doit être appelé qu’après confirmation du paiement ;
 * - reste exclusivement côté serveur.
 * ============================================================================
 */

const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 120;
const MAX_REFERENCE_LENGTH = 200;
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTROL_CHARACTERS_PATTERN =
  /[\u0000-\u001F\u007F]/g;

const HEADER_CONTROL_CHARACTERS_PATTERN =
  /[\r\n\u0000-\u001F\u007F]/g;

const ALLOWED_CURRENCIES:
  readonly DonationCurrency[] = [
    "XOF",
    "EUR",
    "USD",
  ];

export type DonationReceiptEmailLanguage =
  | "fr"
  | "en";

export type SendDonationReceiptEmailInput =
  Readonly<{
    /**
     * Référence interne Young Caring.
     */
    donationReference: string;

    /**
     * Référence unique du reçu.
     */
    receiptReference: string;

    /**
     * Nom utilisé dans le message.
     *
     * Pour un don anonyme, il est possible
     * de transmettre null.
     */
    donorName: string | null;

    donorEmail: string;

    amount: number;
    currency: DonationCurrency;

    /**
     * Date réelle de confirmation du paiement.
     */
    paidAt: Date;

    /**
     * Contenu du reçu PDF déjà généré.
     */
    pdfBytes: Uint8Array;

    /**
     * Nom du fichier sans chemin.
     *
     * Lorsque ce champ est absent, un nom sûr
     * est généré depuis la référence du reçu.
     */
    pdfFileName?: string;

    language?: DonationReceiptEmailLanguage;
  }>;

export type DonationReceiptEmailResult =
  Readonly<{
    success: true;
    emailId: string;
    recipient: string;
  }>;

type DonationReceiptEmailConfiguration =
  Readonly<{
    apiKey: string;
    from: string;
    replyTo: string | null;
    organizationName: string;
    organizationEmail: string | null;
    websiteUrl: string | null;
  }>;

/**
 * Erreur contrôlée du service d’e-mail.
 */
export class DonationReceiptEmailError
  extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(
    code: string,
    message: string,
    statusCode = 500,
    options?: ErrorOptions
  ) {
    super(message, options);

    this.name =
      "DonationReceiptEmailError";

    this.code = code;
    this.statusCode = statusCode;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}

function normalizeRequiredText(
  value: string,
  fieldName: string,
  maximumLength: number
): string {
  const normalized =
    value
      .replace(
        CONTROL_CHARACTERS_PATTERN,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();

  if (
    normalized.length === 0 ||
    normalized.length > maximumLength
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_RECEIPT_EMAIL_DATA",
      `${fieldName} est invalide.`,
      400
    );
  }

  return normalized;
}

function normalizeOptionalText(
  value: string | null | undefined,
  maximumLength: number
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized =
    value
      .replace(
        CONTROL_CHARACTERS_PATTERN,
        ""
      )
      .replace(/\s+/g, " ")
      .trim();

  if (normalized.length === 0) {
    return null;
  }

  if (
    normalized.length > maximumLength
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_RECEIPT_EMAIL_DATA",
      "Une information du reçu est trop longue.",
      400
    );
  }

  return normalized;
}

/**
 * Nettoie une valeur destinée à un en-tête
 * d’e-mail afin d’empêcher toute injection.
 */
function normalizeHeaderValue(
  value: string,
  fieldName: string,
  maximumLength: number
): string {
  const normalized =
    value
      .replace(
        HEADER_CONTROL_CHARACTERS_PATTERN,
        ""
      )
      .trim();

  if (
    normalized.length === 0 ||
    normalized.length > maximumLength
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_EMAIL_HEADER",
      `${fieldName} est invalide.`,
      400
    );
  }

  return normalized;
}

function normalizeEmailAddress(
  value: string,
  fieldName: string
): string {
  const normalized =
    normalizeHeaderValue(
      value,
      fieldName,
      MAX_EMAIL_LENGTH
    ).toLowerCase();

  if (!EMAIL_PATTERN.test(normalized)) {
    throw new DonationReceiptEmailError(
      "INVALID_EMAIL_ADDRESS",
      `${fieldName} est invalide.`,
      400
    );
  }

  return normalized;
}

function normalizeReference(
  value: string,
  fieldName: string
): string {
  const normalized =
    normalizeRequiredText(
      value,
      fieldName,
      MAX_REFERENCE_LENGTH
    );

  if (
    !/^[A-Za-z0-9._:-]+$/.test(
      normalized
    )
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_RECEIPT_REFERENCE",
      `${fieldName} est invalide.`,
      400
    );
  }

  return normalized;
}

function normalizeCurrency(
  value: DonationCurrency
): DonationCurrency {
  if (
    !ALLOWED_CURRENCIES.includes(value)
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_RECEIPT_CURRENCY",
      "La devise du reçu est invalide.",
      400
    );
  }

  return value;
}

function normalizePaidAt(
  value: Date
): Date {
  if (
    !(value instanceof Date) ||
    Number.isNaN(value.getTime())
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_RECEIPT_DATE",
      "La date du paiement est invalide.",
      400
    );
  }

  const now = Date.now();

  if (
    value.getTime() >
    now + 5 * 60 * 1000
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_RECEIPT_DATE",
      "La date du paiement ne peut pas être future.",
      400
    );
  }

  return new Date(value.getTime());
}

function normalizePdfBytes(
  value: Uint8Array
): Uint8Array {
  if (
    !(value instanceof Uint8Array) ||
    value.byteLength === 0
  ) {
    throw new DonationReceiptEmailError(
      "EMPTY_RECEIPT_PDF",
      "Le reçu PDF est vide.",
      400
    );
  }

  if (
    value.byteLength >
    MAX_PDF_SIZE_BYTES
  ) {
    throw new DonationReceiptEmailError(
      "RECEIPT_PDF_TOO_LARGE",
      "Le reçu PDF dépasse la taille autorisée.",
      400
    );
  }

  /*
   * Signature standard d’un document PDF.
   */
  const isPdf =
    value.byteLength >= 5 &&
    value[0] === 0x25 &&
    value[1] === 0x50 &&
    value[2] === 0x44 &&
    value[3] === 0x46 &&
    value[4] === 0x2d;

  if (!isPdf) {
    throw new DonationReceiptEmailError(
      "INVALID_RECEIPT_PDF",
      "Le document généré n’est pas un PDF valide.",
      400
    );
  }

  return value;
}

function createSafePdfFileName(
  value: string | undefined,
  receiptReference: string
): string {
  const source =
    typeof value === "string"
      ? value.trim()
      : `recu-don-${receiptReference}.pdf`;

  const withoutPath =
    source
      .replace(/\\/g, "/")
      .split("/")
      .pop() ?? "";

  const sanitized =
    withoutPath
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        HEADER_CONTROL_CHARACTERS_PATTERN,
        ""
      )
      .replace(
        /[^A-Za-z0-9._-]/g,
        "-"
      )
      .replace(/-+/g, "-")
      .replace(/^\.+/, "")
      .slice(0, 150);

  const baseName =
    sanitized.length > 0
      ? sanitized
      : `recu-don-${receiptReference}`;

  return baseName
    .toLowerCase()
    .endsWith(".pdf")
    ? baseName
    : `${baseName}.pdf`;
}

function normalizeWebsiteUrl(
  value: string | undefined
): string | null {
  if (!value) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new DonationReceiptEmailError(
      "INVALID_ORGANIZATION_URL",
      "L’adresse du site de Young Caring est invalide."
    );
  }

  const isProduction =
    process.env.NODE_ENV ===
    "production";

  if (
    isProduction &&
    url.protocol !== "https:"
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_ORGANIZATION_URL",
      "L’adresse du site doit utiliser HTTPS en production."
    );
  }

  if (
    !isProduction &&
    url.protocol !== "https:" &&
    url.protocol !== "http:"
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_ORGANIZATION_URL",
      "Le protocole du site est invalide."
    );
  }

  url.username = "";
  url.password = "";

  return url.toString();
}

function getConfiguration():
  DonationReceiptEmailConfiguration {
  const apiKey =
    process.env.RESEND_API_KEY
      ?.trim();

  const from =
    process.env.DONATION_EMAIL_FROM
      ?.trim();

  const replyToValue =
    process.env.DONATION_EMAIL_REPLY_TO
      ?.trim();

  const organizationName =
    process.env
      .DONATION_ORGANIZATION_NAME
      ?.trim() ||
    "Young Caring";

  const organizationEmail =
    process.env
      .DONATION_ORGANIZATION_EMAIL
      ?.trim();

  const websiteUrl =
    normalizeWebsiteUrl(
      process.env.NEXT_PUBLIC_SITE_URL
    );

  if (!apiKey) {
    throw new DonationReceiptEmailError(
      "RESEND_API_KEY_MISSING",
      "RESEND_API_KEY est absente.",
      503
    );
  }

  if (!from) {
    throw new DonationReceiptEmailError(
      "DONATION_EMAIL_FROM_MISSING",
      "DONATION_EMAIL_FROM est absente.",
      503
    );
  }

  return {
    apiKey,
    from: normalizeHeaderValue(
      from,
      "DONATION_EMAIL_FROM",
      320
    ),

    replyTo: replyToValue
      ? normalizeEmailAddress(
          replyToValue,
          "DONATION_EMAIL_REPLY_TO"
        )
      : null,

    organizationName:
      normalizeHeaderValue(
        organizationName,
        "DONATION_ORGANIZATION_NAME",
        120
      ),

    organizationEmail:
      organizationEmail
        ? normalizeEmailAddress(
            organizationEmail,
            "DONATION_ORGANIZATION_EMAIL"
          )
        : null,

    websiteUrl,
  };
}

function escapeHtml(
  value: string
): string {
  return value.replace(
    /[&<>"']/g,
    (character) => {
      switch (character) {
        case "&":
          return "&amp;";

        case "<":
          return "&lt;";

        case ">":
          return "&gt;";

        case '"':
          return "&quot;";

        case "'":
          return "&#039;";

        default:
          return character;
      }
    }
  );
}

function formatAmount(
  amount: number,
  currency: DonationCurrency,
  language:
    DonationReceiptEmailLanguage
): string {
  const locale =
    language === "fr"
      ? "fr-FR"
      : "en-US";

  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency,
      currencyDisplay: "code",
      maximumFractionDigits: 0,
    }
  ).format(amount);
}

function formatDate(
  value: Date,
  language:
    DonationReceiptEmailLanguage
): string {
  return new Intl.DateTimeFormat(
    language === "fr"
      ? "fr-FR"
      : "en-US",
    {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Africa/Porto-Novo",
    }
  ).format(value);
}

type EmailContentInput =
  Readonly<{
    organizationName: string;
    donorName: string | null;
    donationReference: string;
    receiptReference: string;
    formattedAmount: string;
    formattedDate: string;
    websiteUrl: string | null;
    organizationEmail: string | null;
    language:
      DonationReceiptEmailLanguage;
  }>;

function createEmailSubject(
  organizationName: string,
  receiptReference: string,
  language:
    DonationReceiptEmailLanguage
): string {
  return language === "fr"
    ? `Merci pour votre don — reçu ${receiptReference} — ${organizationName}`
    : `Thank you for your donation — receipt ${receiptReference} — ${organizationName}`;
}

function createTextContent(
  input: EmailContentInput
): string {
  const greeting =
    input.donorName
      ? input.language === "fr"
        ? `Bonjour ${input.donorName},`
        : `Hello ${input.donorName},`
      : input.language === "fr"
        ? "Bonjour,"
        : "Hello,";

  const lines =
    input.language === "fr"
      ? [
          greeting,
          "",
          `Toute l’équipe de ${input.organizationName} vous remercie sincèrement pour votre don.`,
          "",
          `Montant : ${input.formattedAmount}`,
          `Date de confirmation : ${input.formattedDate}`,
          `Référence du don : ${input.donationReference}`,
          `Référence du reçu : ${input.receiptReference}`,
          "",
          "Votre reçu de don est joint à cet e-mail au format PDF.",
          "",
          "Votre générosité contribue directement à soutenir les actions de Young Caring auprès des personnes et communautés accompagnées.",
          "",
          "Conservez ce message et son document joint dans vos archives.",
          "",
          "Avec toute notre gratitude,",
          `L’équipe ${input.organizationName}`,
        ]
      : [
          greeting,
          "",
          `The entire ${input.organizationName} team sincerely thanks you for your donation.`,
          "",
          `Amount: ${input.formattedAmount}`,
          `Confirmation date: ${input.formattedDate}`,
          `Donation reference: ${input.donationReference}`,
          `Receipt reference: ${input.receiptReference}`,
          "",
          "Your donation receipt is attached to this email as a PDF document.",
          "",
          "Your generosity directly supports Young Caring’s work with the people and communities we serve.",
          "",
          "Please keep this email and its attachment for your records.",
          "",
          "With our sincere gratitude,",
          `The ${input.organizationName} team`,
        ];

  if (input.organizationEmail) {
    lines.push(
      "",
      input.language === "fr"
        ? `Contact : ${input.organizationEmail}`
        : `Contact: ${input.organizationEmail}`
    );
  }

  if (input.websiteUrl) {
    lines.push(
      input.language === "fr"
        ? `Site : ${input.websiteUrl}`
        : `Website: ${input.websiteUrl}`
    );
  }

  return lines.join("\n");
}

function createHtmlContent(
  input: EmailContentInput
): string {
  const organizationName =
    escapeHtml(
      input.organizationName
    );

  const donorName =
    input.donorName
      ? escapeHtml(input.donorName)
      : null;

  const donationReference =
    escapeHtml(
      input.donationReference
    );

  const receiptReference =
    escapeHtml(
      input.receiptReference
    );

  const formattedAmount =
    escapeHtml(
      input.formattedAmount
    );

  const formattedDate =
    escapeHtml(
      input.formattedDate
    );

  const greeting =
    donorName
      ? input.language === "fr"
        ? `Bonjour ${donorName},`
        : `Hello ${donorName},`
      : input.language === "fr"
        ? "Bonjour,"
        : "Hello,";

  const title =
    input.language === "fr"
      ? "Merci pour votre générosité"
      : "Thank you for your generosity";

  const introduction =
    input.language === "fr"
      ? `Toute l’équipe de ${organizationName} vous remercie sincèrement pour votre don.`
      : `The entire ${organizationName} team sincerely thanks you for your donation.`;

  const impactMessage =
    input.language === "fr"
      ? "Votre générosité contribue directement à soutenir nos actions auprès des personnes et communautés accompagnées."
      : "Your generosity directly supports our work with the people and communities we serve.";

  const attachmentMessage =
    input.language === "fr"
      ? "Votre reçu officiel est joint à cet e-mail au format PDF. Conservez ce message et sa pièce jointe dans vos archives."
      : "Your official receipt is attached to this email as a PDF. Please keep this email and its attachment for your records.";

  const amountLabel =
    input.language === "fr"
      ? "Montant du don"
      : "Donation amount";

  const dateLabel =
    input.language === "fr"
      ? "Date de confirmation"
      : "Confirmation date";

  const donationReferenceLabel =
    input.language === "fr"
      ? "Référence du don"
      : "Donation reference";

  const receiptReferenceLabel =
    input.language === "fr"
      ? "Référence du reçu"
      : "Receipt reference";

  const closing =
    input.language === "fr"
      ? "Avec toute notre gratitude,"
      : "With our sincere gratitude,";

  const websiteLink =
    input.websiteUrl
      ? `
        <p style="margin:16px 0 0;">
          <a
            href="${escapeHtml(input.websiteUrl)}"
            style="color:#007d88;text-decoration:none;font-weight:700;"
          >
            ${input.language === "fr"
              ? "Visiter le site de Young Caring"
              : "Visit the Young Caring website"}
          </a>
        </p>
      `
      : "";

  const contactLine =
    input.organizationEmail
      ? `
        <p style="margin:8px 0 0;color:#667477;font-size:12px;">
          ${input.language === "fr"
            ? "Contact"
            : "Contact"} :
          <a
            href="mailto:${escapeHtml(input.organizationEmail)}"
            style="color:#007d88;text-decoration:none;"
          >
            ${escapeHtml(input.organizationEmail)}
          </a>
        </p>
      `
      : "";

  return `<!doctype html>
<html lang="${input.language}">
  <head>
    <meta charset="utf-8">
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    >
    <title>${title}</title>
  </head>

  <body style="margin:0;padding:0;background:#f3f7f7;color:#102023;font-family:Arial,Helvetica,sans-serif;">
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="width:100%;background:#f3f7f7;"
    >
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="width:100%;max-width:620px;background:#ffffff;border:1px solid #dfe9ea;border-radius:24px;overflow:hidden;"
          >
            <tr>
              <td style="padding:30px;background:#092124;text-align:center;">
                <p style="margin:0;color:#42d1dc;font-size:13px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">
                  ${organizationName}
                </p>

                <h1 style="margin:12px 0 0;color:#ffffff;font-size:28px;line-height:1.25;">
                  ${title}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 28px;">
                <p style="margin:0;color:#102023;font-size:17px;font-weight:700;">
                  ${greeting}
                </p>

                <p style="margin:16px 0 0;color:#536467;font-size:15px;line-height:1.75;">
                  ${introduction}
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="margin-top:24px;width:100%;background:#f4f9f9;border:1px solid #dcebec;border-radius:18px;"
                >
                  <tr>
                    <td style="padding:22px;text-align:center;">
                      <p style="margin:0;color:#647477;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">
                        ${amountLabel}
                      </p>

                      <p style="margin:8px 0 0;color:#007d88;font-size:30px;font-weight:900;">
                        ${formattedAmount}
                      </p>
                    </td>
                  </tr>
                </table>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="margin-top:20px;width:100%;border-collapse:collapse;"
                >
                  <tr>
                    <td style="padding:12px 0;color:#647477;font-size:13px;border-bottom:1px solid #e7eeee;">
                      ${dateLabel}
                    </td>

                    <td align="right" style="padding:12px 0;color:#102023;font-size:13px;font-weight:700;border-bottom:1px solid #e7eeee;">
                      ${formattedDate}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:12px 0;color:#647477;font-size:13px;border-bottom:1px solid #e7eeee;">
                      ${donationReferenceLabel}
                    </td>

                    <td align="right" style="padding:12px 0;color:#102023;font-size:13px;font-weight:700;border-bottom:1px solid #e7eeee;word-break:break-all;">
                      ${donationReference}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:12px 0;color:#647477;font-size:13px;">
                      ${receiptReferenceLabel}
                    </td>

                    <td align="right" style="padding:12px 0;color:#102023;font-size:13px;font-weight:700;word-break:break-all;">
                      ${receiptReference}
                    </td>
                  </tr>
                </table>

                <div style="margin-top:24px;padding:18px;background:#eaf8f9;border-radius:16px;color:#315d62;font-size:14px;line-height:1.7;">
                  ${impactMessage}
                </div>

                <p style="margin:24px 0 0;color:#536467;font-size:14px;line-height:1.7;">
                  ${attachmentMessage}
                </p>

                <p style="margin:26px 0 0;color:#102023;font-size:14px;line-height:1.7;">
                  ${closing}<br>
                  <strong>${organizationName}</strong>
                </p>

                ${websiteLink}
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px;background:#f7f9f9;text-align:center;">
                <p style="margin:0;color:#7a888a;font-size:11px;line-height:1.6;">
                  ${
                    input.language === "fr"
                      ? "Cet e-mail concerne un don confirmé. Young Caring ne demande jamais un numéro de carte, un code secret ou un mot de passe par e-mail."
                      : "This email concerns a confirmed donation. Young Caring never requests card details, secret codes or passwords by email."
                  }
                </p>

                ${contactLine}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Envoie le reçu d’un don confirmé.
 *
 * Cette fonction ne doit être appelée qu’après :
 *
 * 1. vérification du paiement auprès du prestataire ;
 * 2. comparaison du montant, de la devise et des références ;
 * 3. passage durable du paiement au statut "paid" ;
 * 4. génération réussie du reçu PDF.
 */
export async function sendDonationReceiptEmail(
  input: SendDonationReceiptEmailInput
): Promise<DonationReceiptEmailResult> {
  const configuration =
    getConfiguration();

  const donationReference =
    normalizeReference(
      input.donationReference,
      "donationReference"
    );

  const receiptReference =
    normalizeReference(
      input.receiptReference,
      "receiptReference"
    );

  const donorEmail =
    normalizeEmailAddress(
      input.donorEmail,
      "donorEmail"
    );

  const donorName =
    normalizeOptionalText(
      input.donorName,
      MAX_NAME_LENGTH
    );

  if (
    !Number.isSafeInteger(input.amount) ||
    input.amount <= 0
  ) {
    throw new DonationReceiptEmailError(
      "INVALID_RECEIPT_AMOUNT",
      "Le montant du reçu est invalide.",
      400
    );
  }

  const currency =
    normalizeCurrency(
      input.currency
    );

  const paidAt =
    normalizePaidAt(
      input.paidAt
    );

  const pdfBytes =
    normalizePdfBytes(
      input.pdfBytes
    );

  const language =
    input.language === "en"
      ? "en"
      : "fr";

  const pdfFileName =
    createSafePdfFileName(
      input.pdfFileName,
      receiptReference
    );

  const emailContent:
    EmailContentInput = {
    organizationName:
      configuration.organizationName,

    donorName,
    donationReference,
    receiptReference,

    formattedAmount:
      formatAmount(
        input.amount,
        currency,
        language
      ),

    formattedDate:
      formatDate(
        paidAt,
        language
      ),

    websiteUrl:
      configuration.websiteUrl,

    organizationEmail:
      configuration.organizationEmail,

    language,
  };

  const resend =
    new Resend(
      configuration.apiKey
    );

  try {
    const response =
      await resend.emails.send({
        from: configuration.from,
        to: [donorEmail],

        replyTo:
          configuration.replyTo ??
          undefined,

        subject:
          createEmailSubject(
            configuration
              .organizationName,
            receiptReference,
            language
          ),

        text:
          createTextContent(
            emailContent
          ),

        html:
          createHtmlContent(
            emailContent
          ),

        attachments: [
          {
            filename: pdfFileName,

            content:
              Buffer.from(
                pdfBytes
              ),

            contentType:
              "application/pdf",
          },
        ],

        headers: {
          "X-Entity-Ref-ID":
            receiptReference,
        },

        tags: [
          {
            name:
              "email_category",

            value:
              "donation_receipt",
          },
        ],
      });

    if (
      response.error ||
      !response.data?.id
    ) {
      console.error(
        "Donation receipt email rejected:",
        {
          receiptReference,
          errorName:
            response.error?.name ??
            "UnknownResendError",
        }
      );

      throw new DonationReceiptEmailError(
        "DONATION_RECEIPT_EMAIL_REJECTED",
        "Le service d’e-mail a refusé l’envoi du reçu.",
        502
      );
    }

    return {
      success: true,
      emailId:
        response.data.id,
      recipient:
        donorEmail,
    };
  } catch (error: unknown) {
    if (
      error instanceof
      DonationReceiptEmailError
    ) {
      throw error;
    }

    console.error(
      "Donation receipt email failed:",
      {
        receiptReference,
        error:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );

    throw new DonationReceiptEmailError(
      "DONATION_RECEIPT_EMAIL_FAILED",
      "L’envoi du reçu de don a échoué.",
      502,
      {
        cause: error,
      }
    );
  }
}

export default
  sendDonationReceiptEmail;