import "server-only";

import {
  Prisma,
} from "@/generated/prisma/client";

import { db } from "@/lib/db";

import type {
  CreateDonationPaymentRecordInput,
  DonationPaymentRecord,
  DonationPaymentStatus,
  DonationPaymentStore,
  UpdateDonationPaymentRecordInput,
} from "@/types/donation";

/**
 * ============================================================================
 * YOUNG CARING
 * STOCKAGE DURABLE DES PAIEMENTS
 * ============================================================================
 *
 * Ce fichier :
 *
 * - crée les paiements avant la redirection vers Moneroo ;
 * - retrouve un paiement par sa référence interne ;
 * - retrouve un paiement par sa référence prestataire ;
 * - protège les références contre les doublons ;
 * - contrôle les transitions de statut ;
 * - empêche le remplacement d’une référence prestataire ;
 * - renseigne paidAt uniquement après confirmation ;
 * - utilise PostgreSQL à travers Prisma ;
 * - ne conserve aucune donnée bancaire.
 *
 * Ce fichier reste exclusivement côté serveur.
 * ============================================================================
 */

const MAX_REFERENCE_LENGTH = 100;
const MAX_PROVIDER_REFERENCE_LENGTH = 200;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 320;
const MAX_PHONE_LENGTH = 50;
const MAX_COUNTRY_LENGTH = 100;
const MAX_PAYMENT_AMOUNT = 10_000_000;
const MAX_TRANSACTION_RETRIES = 3;

const REFERENCE_PATTERN =
  /^[A-Za-z0-9._:-]+$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PAYMENT_SELECT = {
  id: true,
  reference: true,
  provider: true,
  providerReference: true,
  amount: true,
  currency: true,
  frequency: true,
  allocation: true,
  donorFirstName: true,
  donorLastName: true,
  donorEmail: true,
  donorPhone: true,
  donorCountry: true,
  anonymous: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  paidAt: true,
} satisfies Prisma.DonationPaymentSelect;

type StoredPayment =
  Prisma.DonationPaymentGetPayload<{
    select: typeof PAYMENT_SELECT;
  }>;

/**
 * Erreur contrôlée du stockage des paiements.
 */
export class DonationPaymentStoreError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(
    code: string,
    message: string,
    statusCode = 500
  ) {
    super(message);

    this.name = "DonationPaymentStoreError";
    this.code = code;
    this.statusCode = statusCode;

    Object.setPrototypeOf(
      this,
      new.target.prototype
    );
  }
}

/**
 * Vérifie qu’une valeur est une chaîne non vide
 * et qu’elle respecte une taille maximale.
 */
function normalizeRequiredString(
  value: string,
  fieldName: string,
  maximumLength: number
): string {
  if (typeof value !== "string") {
    throw new DonationPaymentStoreError(
      "INVALID_PAYMENT_DATA",
      `${fieldName} est invalide.`,
      400
    );
  }

  const normalized =
    value.trim();

  if (
    normalized.length === 0 ||
    normalized.length > maximumLength
  ) {
    throw new DonationPaymentStoreError(
      "INVALID_PAYMENT_DATA",
      `${fieldName} est invalide.`,
      400
    );
  }

  return normalized;
}

/**
 * Nettoie et valide une chaîne optionnelle.
 */
function normalizeOptionalString(
  value: string | null,
  fieldName: string,
  maximumLength: number
): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new DonationPaymentStoreError(
      "INVALID_PAYMENT_DATA",
      `${fieldName} est invalide.`,
      400
    );
  }

  const normalized =
    value.trim();

  if (normalized.length === 0) {
    return null;
  }

  if (
    normalized.length >
    maximumLength
  ) {
    throw new DonationPaymentStoreError(
      "INVALID_PAYMENT_DATA",
      `${fieldName} est invalide.`,
      400
    );
  }

  return normalized;
}

/**
 * Vérifie une référence interne ou une référence
 * retournée par le prestataire.
 */
function normalizeReference(
  value: string,
  fieldName: string,
  maximumLength: number
): string {
  const normalized =
    normalizeRequiredString(
      value,
      fieldName,
      maximumLength
    );

  if (
    !REFERENCE_PATTERN.test(
      normalized
    )
  ) {
    throw new DonationPaymentStoreError(
      "INVALID_PAYMENT_REFERENCE",
      `${fieldName} est invalide.`,
      400
    );
  }

  return normalized;
}

/**
 * Vérifie et normalise une adresse e-mail.
 */
function normalizeEmail(
  value: string
): string {
  const email =
    normalizeRequiredString(
      value,
      "donorEmail",
      MAX_EMAIL_LENGTH
    ).toLowerCase();

  if (
    !EMAIL_PATTERN.test(email)
  ) {
    throw new DonationPaymentStoreError(
      "INVALID_DONOR_EMAIL",
      "L’adresse e-mail du donateur est invalide.",
      400
    );
  }

  return email;
}

/**
 * Vérifie qu’une date est exploitable.
 */
function normalizeDate(
  value: Date | null
): Date | null {
  if (value === null) {
    return null;
  }

  if (
    !(value instanceof Date) ||
    Number.isNaN(value.getTime())
  ) {
    throw new DonationPaymentStoreError(
      "INVALID_PAYMENT_DATE",
      "La date du paiement est invalide.",
      400
    );
  }

  return new Date(
    value.getTime()
  );
}

/**
 * Vérifie le montant avant toute écriture.
 *
 * Le montant est stocké dans l’unité principale
 * de la devise utilisée par l’application.
 */
function assertValidAmount(
  amount: number
): void {
  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount > MAX_PAYMENT_AMOUNT
  ) {
    throw new DonationPaymentStoreError(
      "INVALID_PAYMENT_AMOUNT",
      "Le montant du paiement est invalide.",
      400
    );
  }
}

/**
 * Transforme un enregistrement Prisma en contrat
 * interne du système de dons.
 */
function toPaymentRecord(
  payment: StoredPayment
): DonationPaymentRecord {
  return {
    id: payment.id,
    reference: payment.reference,
    provider: payment.provider,
    providerReference:
      payment.providerReference,
    amount: payment.amount,
    currency: payment.currency,
    frequency: payment.frequency,
    allocation: payment.allocation,
    donorFirstName:
      payment.donorFirstName,
    donorLastName:
      payment.donorLastName,
    donorEmail: payment.donorEmail,
    donorPhone: payment.donorPhone,
    donorCountry:
      payment.donorCountry,
    anonymous: payment.anonymous,
    status: payment.status,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    paidAt: payment.paidAt,
  };
}

/**
 * Transitions de statut autorisées.
 *
 * Les statuts définitifs ne peuvent pas revenir
 * à pending ou processing.
 *
 * Un paiement paid peut uniquement rester paid
 * ou devenir refunded.
 */
const ALLOWED_STATUS_TRANSITIONS:
  Readonly<
    Record<
      DonationPaymentStatus,
      readonly DonationPaymentStatus[]
    >
  > = {
  pending: [
    "pending",
    "processing",
    "paid",
    "failed",
    "cancelled",
    "expired",
  ],

  processing: [
    "processing",
    "paid",
    "failed",
    "cancelled",
    "expired",
  ],

  paid: [
    "paid",
    "refunded",
  ],

  failed: [
    "failed",
  ],

  cancelled: [
    "cancelled",
  ],

  expired: [
    "expired",
  ],

  refunded: [
    "refunded",
  ],
};

/**
 * Vérifie qu’une transition de statut est autorisée.
 */
function assertStatusTransition(
  currentStatus: DonationPaymentStatus,
  nextStatus: DonationPaymentStatus
): void {
  const allowedStatuses =
    ALLOWED_STATUS_TRANSITIONS[
      currentStatus
    ];

  if (
    !allowedStatuses.includes(
      nextStatus
    )
  ) {
    throw new DonationPaymentStoreError(
      "INVALID_PAYMENT_STATUS_TRANSITION",
      `La transition de ${currentStatus} vers ${nextStatus} est interdite.`,
      409
    );
  }
}

/**
 * Détermine si une erreur Prisma correspond
 * à une contrainte unique.
 */
function isUniqueConstraintError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/**
 * Détermine si Prisma demande de recommencer
 * une transaction concurrente.
 */
function isRetryableTransactionError(
  error: unknown
): boolean {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

/**
 * Transforme une erreur Prisma en erreur contrôlée
 * du stockage.
 */
function rethrowStorageError(
  error: unknown
): never {
  if (
    error instanceof
    DonationPaymentStoreError
  ) {
    throw error;
  }

  if (
    isUniqueConstraintError(error)
  ) {
    throw new DonationPaymentStoreError(
      "PAYMENT_ALREADY_EXISTS",
      "Un paiement utilisant cette référence existe déjà.",
      409
    );
  }

  console.error(
    "Donation payment storage operation failed:",
    {
      error:
        error instanceof Error
          ? error.name
          : "UnknownError",
    }
  );

  throw new DonationPaymentStoreError(
    "PAYMENT_STORAGE_ERROR",
    "L’opération de stockage du paiement a échoué.",
    500
  );
}

/**
 * Crée un paiement avant la redirection vers
 * le prestataire.
 */
async function createPayment(
  input: CreateDonationPaymentRecordInput
): Promise<DonationPaymentRecord> {
  const reference =
    normalizeReference(
      input.reference,
      "reference",
      MAX_REFERENCE_LENGTH
    );

  assertValidAmount(
    input.amount
  );

  const donorFirstName =
    normalizeRequiredString(
      input.donorFirstName,
      "donorFirstName",
      MAX_NAME_LENGTH
    );

  const donorLastName =
    normalizeRequiredString(
      input.donorLastName,
      "donorLastName",
      MAX_NAME_LENGTH
    );

  const donorEmail =
    normalizeEmail(
      input.donorEmail
    );

  const donorPhone =
    normalizeOptionalString(
      input.donorPhone,
      "donorPhone",
      MAX_PHONE_LENGTH
    );

  const donorCountry =
    normalizeOptionalString(
      input.donorCountry,
      "donorCountry",
      MAX_COUNTRY_LENGTH
    );

  try {
    const payment =
      await db.donationPayment.create({
        data: {
          reference,
          provider: input.provider,
          providerReference: null,
          amount: input.amount,
          currency: input.currency,
          frequency: input.frequency,
          allocation: input.allocation,
          donorFirstName,
          donorLastName,
          donorEmail,
          donorPhone,
          donorCountry,
          anonymous: input.anonymous,
          status: "pending",
          paidAt: null,
        },

        select: PAYMENT_SELECT,
      });

    return toPaymentRecord(
      payment
    );
  } catch (error: unknown) {
    rethrowStorageError(error);
  }
}

/**
 * Recherche un paiement par sa référence interne
 * Young Caring.
 */
async function findPaymentByReference(
  reference: string
): Promise<DonationPaymentRecord | null> {
  const normalizedReference =
    normalizeReference(
      reference,
      "reference",
      MAX_REFERENCE_LENGTH
    );

  try {
    const payment =
      await db.donationPayment.findUnique({
        where: {
          reference:
            normalizedReference,
        },

        select: PAYMENT_SELECT,
      });

    return payment
      ? toPaymentRecord(payment)
      : null;
  } catch (error: unknown) {
    rethrowStorageError(error);
  }
}

/**
 * Recherche un paiement par la référence attribuée
 * par Moneroo ou un autre prestataire.
 */
async function findPaymentByProviderReference(
  providerReference: string
): Promise<DonationPaymentRecord | null> {
  const normalizedProviderReference =
    normalizeReference(
      providerReference,
      "providerReference",
      MAX_PROVIDER_REFERENCE_LENGTH
    );

  try {
    const payment =
      await db.donationPayment.findUnique({
        where: {
          providerReference:
            normalizedProviderReference,
        },

        select: PAYMENT_SELECT,
      });

    return payment
      ? toPaymentRecord(payment)
      : null;
  } catch (error: unknown) {
    rethrowStorageError(error);
  }
}

/**
 * Construit les données autorisées pour
 * la mise à jour d’un paiement.
 */
function createUpdateData(
  current: StoredPayment,
  input: UpdateDonationPaymentRecordInput
): Prisma.DonationPaymentUpdateInput {
  const data:
    Prisma.DonationPaymentUpdateInput = {};

  let normalizedProviderReference:
    string | undefined;

  if (
    input.providerReference !==
    undefined
  ) {
    normalizedProviderReference =
      normalizeReference(
        input.providerReference,
        "providerReference",
        MAX_PROVIDER_REFERENCE_LENGTH
      );

    if (
      current.providerReference !== null &&
      current.providerReference !==
        normalizedProviderReference
    ) {
      throw new DonationPaymentStoreError(
        "PROVIDER_REFERENCE_IMMUTABLE",
        "La référence du prestataire ne peut pas être remplacée.",
        409
      );
    }

    if (
      current.providerReference === null
    ) {
      data.providerReference =
        normalizedProviderReference;
    }
  }

  const nextStatus =
    input.status ??
    current.status;

  assertStatusTransition(
    current.status,
    nextStatus
  );

  if (
    input.status !== undefined &&
    input.status !== current.status
  ) {
    data.status =
      input.status;
  }

  const effectiveProviderReference =
    normalizedProviderReference ??
    current.providerReference;

  if (
    nextStatus === "paid" &&
    !effectiveProviderReference
  ) {
    throw new DonationPaymentStoreError(
      "PAID_PAYMENT_WITHOUT_PROVIDER_REFERENCE",
      "Un paiement ne peut pas être confirmé sans référence prestataire.",
      409
    );
  }

  if (
    input.paidAt !== undefined
  ) {
    const paidAt =
      normalizeDate(
        input.paidAt
      );

    if (
      paidAt !== null &&
      nextStatus !== "paid" &&
      nextStatus !== "refunded"
    ) {
      throw new DonationPaymentStoreError(
        "INVALID_PAID_AT",
        "paidAt ne peut être renseignée que pour un paiement confirmé.",
        409
      );
    }

    if (
      current.paidAt !== null &&
      paidAt === null
    ) {
      throw new DonationPaymentStoreError(
        "PAID_AT_IMMUTABLE",
        "La date de confirmation du paiement ne peut pas être supprimée.",
        409
      );
    }

    if (
      current.paidAt !== null &&
      paidAt !== null &&
      current.paidAt.getTime() !==
        paidAt.getTime()
    ) {
      throw new DonationPaymentStoreError(
        "PAID_AT_IMMUTABLE",
        "La date de confirmation du paiement ne peut pas être remplacée.",
        409
      );
    }

    if (
      current.paidAt === null
    ) {
      data.paidAt = paidAt;
    }
  } else if (
    nextStatus === "paid" &&
    current.paidAt === null
  ) {
    data.paidAt =
      new Date();
  }

  if (
    nextStatus === "refunded" &&
    current.paidAt === null &&
    input.paidAt === undefined
  ) {
    throw new DonationPaymentStoreError(
      "REFUNDED_PAYMENT_WITHOUT_PAID_AT",
      "Un paiement remboursé doit posséder une date de confirmation.",
      409
    );
  }

  return data;
}

/**
 * Met à jour un paiement par sa référence interne.
 *
 * Une transaction sérialisable empêche deux
 * traitements concurrents d’appliquer des
 * transitions incompatibles.
 */
async function updatePaymentByReference(
  reference: string,
  input: UpdateDonationPaymentRecordInput
): Promise<DonationPaymentRecord> {
  const normalizedReference =
    normalizeReference(
      reference,
      "reference",
      MAX_REFERENCE_LENGTH
    );

  for (
    let attempt = 1;
    attempt <= MAX_TRANSACTION_RETRIES;
    attempt += 1
  ) {
    try {
      const payment =
        await db.$transaction(
          async (
            transaction:
              Prisma.TransactionClient
          ) => {
            const current =
              await transaction
                .donationPayment
                .findUnique({
                  where: {
                    reference:
                      normalizedReference,
                  },

                  select:
                    PAYMENT_SELECT,
                });

            if (!current) {
              throw new DonationPaymentStoreError(
                "PAYMENT_NOT_FOUND",
                "Le paiement demandé est introuvable.",
                404
              );
            }

            const data =
              createUpdateData(
                current,
                input
              );

            if (
              Object.keys(data).length ===
              0
            ) {
              return current;
            }

            return transaction
              .donationPayment
              .update({
                where: {
                  id: current.id,
                },

                data,

                select:
                  PAYMENT_SELECT,
              });
          },
          {
            isolationLevel:
              Prisma
                .TransactionIsolationLevel
                .Serializable,
          }
        );

      return toPaymentRecord(
        payment
      );
    } catch (error: unknown) {
      if (
        isRetryableTransactionError(
          error
        ) &&
        attempt <
          MAX_TRANSACTION_RETRIES
      ) {
        continue;
      }

      rethrowStorageError(error);
    }
  }

  throw new DonationPaymentStoreError(
    "PAYMENT_TRANSACTION_FAILED",
    "La mise à jour du paiement a échoué après plusieurs tentatives.",
    503
  );
}

/**
 * Implémentation durable du contrat défini
 * dans types/donation.ts.
 */
export const donationPaymentStore:
  DonationPaymentStore = {
  create:
    createPayment,

  findByReference:
    findPaymentByReference,

  findByProviderReference:
    findPaymentByProviderReference,

  updateByReference:
    updatePaymentByReference,
};

export default donationPaymentStore;