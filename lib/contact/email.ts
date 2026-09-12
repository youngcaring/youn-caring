import "server-only";

import {
  createElement,
} from "react";
import {
  Resend,
} from "resend";

import ContactAcknowledgementEmail from "@/components/emails/ContactAcknowledgementEmail";
import ContactAdminNotificationEmail from "@/components/emails/ContactAdminNotificationEmail";
import {
  getContactSubjectLabel,
} from "@/data/contact";
import type {
  ContactLanguage,
  ValidatedContactMessage,
} from "@/types/contact";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_CONTACT_EMAIL =
  "contact@young-caring.org";

const DEFAULT_SITE_URL =
  "http://localhost:3000";

export type SendContactEmailsInput =
  Readonly<{
    reference: string;
    contact: ValidatedContactMessage;
    receivedAt?: Date;
  }>;

export type SendContactEmailsResult =
  Readonly<{
    adminEmailId: string;

    acknowledgementEmailId:
      | string
      | null;

    acknowledgementEmailSent:
      boolean;
  }>;

export class ContactEmailConfigurationError
  extends Error {
  readonly code =
    "CONTACT_EMAIL_CONFIGURATION_ERROR";

  constructor(message: string) {
    super(message);

    this.name =
      "ContactEmailConfigurationError";
  }
}

export class ContactEmailDeliveryError
  extends Error {
  readonly code:
    | "ADMIN_EMAIL_FAILED"
    | "ACKNOWLEDGEMENT_EMAIL_FAILED";

  constructor(
    code:
      | "ADMIN_EMAIL_FAILED"
      | "ACKNOWLEDGEMENT_EMAIL_FAILED",
    message: string
  ) {
    super(message);

    this.name =
      "ContactEmailDeliveryError";

    this.code = code;
  }
}

type ContactEmailConfiguration =
  Readonly<{
    apiKey: string;
    fromEmail: string;
    contactEmail: string;
    replyToEmail: string;
    siteUrl: string;
  }>;

function getRequiredEnvironmentValue(
  name: string
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new ContactEmailConfigurationError(
      `${name} est absente.`
    );
  }

  return value;
}

function extractEmailAddress(
  value: string
): string | null {
  const match =
    value.match(/<([^<>]+)>/);

  const email =
    (
      match?.[1] ??
      value
    )
      .trim()
      .toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return null;
  }

  return email;
}

function normalizeEmailAddress(
  value: string,
  variableName: string
): string {
  const normalized =
    value.trim().toLowerCase();

  if (
    !EMAIL_PATTERN.test(
      normalized
    )
  ) {
    throw new ContactEmailConfigurationError(
      `${variableName} est invalide.`
    );
  }

  return normalized;
}

function getConfiguredSiteUrl():
  string {
  const configuredValue =
    process.env.NEXT_PUBLIC_SITE_URL
      ?.trim() ||
    DEFAULT_SITE_URL;

  let siteUrl: URL;

  try {
    siteUrl =
      new URL(configuredValue);
  } catch {
    throw new ContactEmailConfigurationError(
      "NEXT_PUBLIC_SITE_URL est invalide."
    );
  }

  if (
    siteUrl.protocol !== "https:" &&
    siteUrl.protocol !== "http:"
  ) {
    throw new ContactEmailConfigurationError(
      "Le protocole de NEXT_PUBLIC_SITE_URL est invalide."
    );
  }

  if (
    process.env.NODE_ENV ===
      "production" &&
    siteUrl.protocol !== "https:"
  ) {
    throw new ContactEmailConfigurationError(
      "NEXT_PUBLIC_SITE_URL doit utiliser HTTPS en production."
    );
  }

  return siteUrl.origin;
}

function getEmailConfiguration():
  ContactEmailConfiguration {
  const apiKey =
    getRequiredEnvironmentValue(
      "RESEND_API_KEY"
    );

  const fromEmail =
    getRequiredEnvironmentValue(
      "CONTACT_FROM_EMAIL"
    );

  const contactEmail =
    normalizeEmailAddress(
      process.env.CONTACT_TO_EMAIL
        ?.trim() ||
        DEFAULT_CONTACT_EMAIL,
      "CONTACT_TO_EMAIL"
    );

  const replyToEmail =
    normalizeEmailAddress(
      process.env.CONTACT_REPLY_TO_EMAIL
        ?.trim() ||
        contactEmail,
      "CONTACT_REPLY_TO_EMAIL"
    );

  if (
    !extractEmailAddress(fromEmail)
  ) {
    throw new ContactEmailConfigurationError(
      "CONTACT_FROM_EMAIL est invalide."
    );
  }

  if (
    !apiKey.startsWith("re_") ||
    apiKey.length < 15 ||
    apiKey.includes("VOTRE_") ||
    apiKey.includes(
      "nouvelle_cle"
    )
  ) {
    throw new ContactEmailConfigurationError(
      "RESEND_API_KEY ne contient pas une clé Resend valide."
    );
  }

  return {
    apiKey,
    fromEmail,
    contactEmail,
    replyToEmail,

    siteUrl:
      getConfiguredSiteUrl(),
  };
}

function formatReceivedDate(
  date: Date
): string {
  if (
    Number.isNaN(date.getTime())
  ) {
    return new Date().toISOString();
  }

  try {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        dateStyle: "long",
        timeStyle: "short",

        timeZone:
          "Africa/Porto-Novo",
      }
    ).format(date);
  } catch {
    return date.toISOString();
  }
}

function buildAdminSubject(
  reference: string,
  subjectLabel: string
): string {
  const safeSubject =
    subjectLabel
      .replace(/[\r\n]+/g, " ")
      .trim()
      .slice(0, 100);

  return [
    "[Young Caring]",
    safeSubject,
    `(${reference})`,
  ].join(" ");
}

function buildAcknowledgementSubject(
  reference: string,
  language: ContactLanguage
): string {
  return language === "en"
    ? `We received your message — ${reference}`
    : `Nous avons reçu votre message — ${reference}`;
}

function getProviderErrorDetails(
  error: unknown
): Readonly<{
  name: string;
  message: string;
  statusCode: number | null;
}> {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return {
      name:
        "UNKNOWN_PROVIDER_ERROR",

      message:
        "No error details available.",

      statusCode: null,
    };
  }

  const name =
    "name" in error &&
    typeof error.name === "string"
      ? error.name.slice(0, 100)
      : "UNKNOWN_PROVIDER_ERROR";

  const message =
    "message" in error &&
    typeof error.message === "string"
      ? error.message.slice(0, 500)
      : "No provider message available.";

  const statusCode =
    "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : "status" in error &&
          typeof error.status === "number"
        ? error.status
        : null;

  return {
    name,
    message,
    statusCode,
  };
}

function logProviderError(
  context: string,
  error: unknown
): void {
  const details =
    getProviderErrorDetails(
      error
    );

  console.error(context, {
    name: details.name,
    message: details.message,

    statusCode:
      details.statusCode,
  });
}

export async function sendContactEmails({
  reference,
  contact,
  receivedAt = new Date(),
}: SendContactEmailsInput): Promise<SendContactEmailsResult> {
  const configuration =
    getEmailConfiguration();

  const resend =
    new Resend(
      configuration.apiKey
    );

  const formattedReceivedAt =
    formatReceivedDate(
      receivedAt
    );

  const subjectLabel =
    getContactSubjectLabel(
      contact.subject,
      contact.language
    );

  let adminEmailId: string;

  /*
   * Envoi de la notification principale
   * à Young Caring.
   */
  try {
    const adminResult =
      await resend.emails.send({
        from:
          configuration.fromEmail,

        to: [
          configuration.contactEmail,
        ],

        /*
         * Lorsque Young Caring clique sur
         * Répondre, la réponse est adressée
         * directement au visiteur.
         */
        replyTo:
          contact.email,

        subject:
          buildAdminSubject(
            reference,
            subjectLabel
          ),

        react: createElement(
          ContactAdminNotificationEmail,
          {
            reference,

            fullName:
              contact.fullName,

            email:
              contact.email,

            phone:
              contact.phone,

            subject:
              subjectLabel,

            message:
              contact.message,

            language:
              contact.language,

            receivedAt:
              formattedReceivedAt,
          }
        ),

        text: [
          "Nouveau message reçu depuis le site Young Caring.",
          "",
          `Référence : ${reference}`,
          `Nom : ${contact.fullName}`,
          `Email : ${contact.email}`,
          `Téléphone : ${contact.phone ?? "Non renseigné"}`,
          `Sujet : ${subjectLabel}`,
          `Langue : ${contact.language}`,
          `Date de réception : ${formattedReceivedAt}`,
          "",
          "Message :",
          contact.message,
        ].join("\n"),
      });

    if (
      adminResult.error ||
      !adminResult.data?.id
    ) {
      logProviderError(
        "Contact admin email rejected:",
        adminResult.error
      );

      throw new ContactEmailDeliveryError(
        "ADMIN_EMAIL_FAILED",
        "La notification destinée à Young Caring n’a pas pu être envoyée."
      );
    }

    adminEmailId =
      adminResult.data.id;
  } catch (error: unknown) {
    if (
      error instanceof
      ContactEmailDeliveryError
    ) {
      throw error;
    }

    logProviderError(
      "Contact admin email request failed:",
      error
    );

    throw new ContactEmailDeliveryError(
      "ADMIN_EMAIL_FAILED",
      "La notification destinée à Young Caring n’a pas pu être envoyée."
    );
  }

  /*
   * Envoi de l’accusé de réception
   * au visiteur.
   *
   * Si cet email échoue, le message principal
   * reste reçu par Young Caring.
   */
  try {
    const acknowledgementResult =
      await resend.emails.send({
        from:
          configuration.fromEmail,

        to: [
          contact.email,
        ],

        /*
         * Si le visiteur répond à la confirmation,
         * son email arrive chez Young Caring.
         */
        replyTo:
          configuration.replyToEmail,

        subject:
          buildAcknowledgementSubject(
            reference,
            contact.language
          ),

        react: createElement(
          ContactAcknowledgementEmail,
          {
            reference,

            fullName:
              contact.fullName,

            subject:
              subjectLabel,

            language:
              contact.language,

            siteUrl:
              configuration.siteUrl,

            contactEmail:
              configuration
                .replyToEmail,
          }
        ),

        text:
          contact.language === "en"
            ? [
                `Hello ${contact.fullName},`,
                "",
                "We have received your message.",
                "Our team will review it and reply as soon as possible.",
                "",
                `Reference: ${reference}`,
                `Subject: ${subjectLabel}`,
                "",
                "Young Caring will never ask for your password, security code or banking information by email.",
                "",
                "Kind regards,",
                "The Young Caring team",
              ].join("\n")
            : [
                `Bonjour ${contact.fullName},`,
                "",
                "Nous avons bien reçu votre message.",
                "Notre équipe va l’examiner et vous répondre dans les meilleurs délais.",
                "",
                `Référence : ${reference}`,
                `Sujet : ${subjectLabel}`,
                "",
                "Young Caring ne vous demandera jamais votre mot de passe, votre code secret ou vos informations bancaires par email.",
                "",
                "Avec toute notre considération,",
                "L’équipe Young Caring",
              ].join("\n"),
      });

    if (
      acknowledgementResult.error ||
      !acknowledgementResult.data?.id
    ) {
      logProviderError(
        "Contact acknowledgement email rejected:",
        acknowledgementResult.error
      );

      return {
        adminEmailId,

        acknowledgementEmailId:
          null,

        acknowledgementEmailSent:
          false,
      };
    }

    return {
      adminEmailId,

      acknowledgementEmailId:
        acknowledgementResult
          .data.id,

      acknowledgementEmailSent:
        true,
    };
  } catch (error: unknown) {
    logProviderError(
      "Contact acknowledgement email request failed:",
      error
    );

    return {
      adminEmailId,

      acknowledgementEmailId:
        null,

      acknowledgementEmailSent:
        false,
    };
  }
}