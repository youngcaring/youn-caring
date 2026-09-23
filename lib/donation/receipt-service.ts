

import { createHash } from "node:crypto";

import { Prisma } from "@/generated/prisma/client";
import { getDonationAllocationLabel } from "@/data/donation";
import { generateDonationReceiptPdf } from "@/lib/donation/donation-receipt-pdf";
import type {
  DonationReceiptOrganization,
  GeneratedDonationReceiptPdf,
} from "@/lib/donation/donation-receipt-pdf";
import {
  DonationReceiptEmailError,
  sendDonationReceiptEmail,
} from "@/lib/donation/donation-receipt-email";
import {
  generateDonationReceiptReference,
  maskDonationReceiptReference,
} from "@/lib/donation/receipt-reference";
import { normalizeDonationReference } from "@/lib/donation/payment-reference";
import { db } from "@/lib/db";
import type {
  DonationAllocationId,
  DonationCurrency,
  DonationFrequency,
  DonationPaymentProviderName,
} from "@/types/donation";

const MAX_RECEIPT_CREATION_ATTEMPTS = 5;
const MAX_STORAGE_KEY_LENGTH = 500;
const MAX_ERROR_MESSAGE_LENGTH = 500;
const MAX_PDF_SIZE_BYTES = 10_000_000;
const PDF_CONTENT_TYPE = "application/pdf" as const;
const STORAGE_KEY_PATTERN = /^[A-Za-z0-9/_\-.]+$/;

export type DonationReceiptLanguage = "fr" | "en";

export interface DonationReceiptPrivateStorage {
  save(
    input: Readonly<{
      key: string;
      content: Buffer;
      contentType: typeof PDF_CONTENT_TYPE;
      sha256: string;
    }>
  ): Promise<void>;
}

export type IssueDonationReceiptInput = Readonly<{
  paymentReference: string;
  language?: DonationReceiptLanguage;
  organization: DonationReceiptOrganization;
  storage: DonationReceiptPrivateStorage;
}>;

export type DonationReceiptServiceState = "completed" | "processing";

export type DonationReceiptServiceResult = Readonly<{
  state: DonationReceiptServiceState;
  receiptId: string;
  receiptReference: string;
  paymentReference: string;
  pdfStatus: "pending" | "generating" | "ready" | "failed";
  emailStatus: "pending" | "sending" | "sent" | "failed";
  pdfStorageKey: string | null;
  pdfSha256: string | null;
  emailProviderMessageId: string | null;
}>;

type ReceiptPayment = Readonly<{
  id: string;
  reference: string;
  provider: DonationPaymentProviderName;
  providerReference: string | null;
  amount: number;
  currency: DonationCurrency;
  frequency: DonationFrequency;
  allocation: DonationAllocationId;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  anonymous: boolean;
  status: string;
  paidAt: Date | null;
}>;

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
  anonymous: true,
  status: true,
  paidAt: true,
} satisfies Prisma.DonationPaymentSelect;

const RECEIPT_SELECT = {
  id: true,
  receiptNumber: true,
  paymentId: true,
  language: true,
  status: true,
  pdfStorageKey: true,
  pdfSha256: true,
  pdfSizeBytes: true,
  pdfGeneratedAt: true,
  generationError: true,
  emailStatus: true,
  emailRecipient: true,
  emailProviderMessageId: true,
  emailAttemptCount: true,
  emailLastAttemptAt: true,
  emailSentAt: true,
  emailLastError: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DonationReceiptSelect;

type StoredReceipt = Prisma.DonationReceiptGetPayload<{
  select: typeof RECEIPT_SELECT;
}>;

export class DonationReceiptServiceError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly retryable: boolean;

  constructor(
    code: string,
    message: string,
    statusCode = 500,
    retryable = false,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "DonationReceiptServiceError";
    this.code = code;
    this.statusCode = statusCode;
    this.retryable = retryable;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function isUniqueConstraintError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function sanitizeErrorMessage(error: unknown): string {
  const rawMessage =
    error instanceof Error ? error.message : "Erreur technique inconnue.";

  const sanitized = rawMessage
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "[DATABASE_URL_REDACTED]")
    .replace(/bearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/re_[A-Za-z0-9_-]+/g, "[RESEND_KEY_REDACTED]")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (sanitized || "Erreur technique inconnue.").slice(
    0,
    MAX_ERROR_MESSAGE_LENGTH
  );
}

function normalizeLanguage(
  value: DonationReceiptLanguage | undefined
): DonationReceiptLanguage {
  return value === "en" ? "en" : "fr";
}

function normalizeStorageKey(value: string): string {
  const normalized = value
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+/, "")
    .trim();

  if (
    normalized.length === 0 ||
    normalized.length > MAX_STORAGE_KEY_LENGTH ||
    normalized.includes("..") ||
    !STORAGE_KEY_PATTERN.test(normalized)
  ) {
    throw new DonationReceiptServiceError(
      "INVALID_RECEIPT_STORAGE_KEY",
      "La clé privée du reçu PDF est invalide."
    );
  }

  return normalized;
}

function createStorageKey(receiptReference: string, issuedAt: Date): string {
  const year = issuedAt.getUTCFullYear().toString().padStart(4, "0");
  const month = (issuedAt.getUTCMonth() + 1).toString().padStart(2, "0");

  return normalizeStorageKey(
    ["donation-receipts", year, month, `${receiptReference}.pdf`].join("/")
  );
}

function calculatePdfSha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function assertGeneratedPdf(
  generated: GeneratedDonationReceiptPdf,
  expectedReceiptReference: string
): void {
  if (!Buffer.isBuffer(generated.buffer) || generated.buffer.length === 0) {
    throw new DonationReceiptServiceError(
      "EMPTY_GENERATED_RECEIPT",
      "Le reçu PDF généré est vide.",
      500,
      true
    );
  }

  if (generated.buffer.length > MAX_PDF_SIZE_BYTES) {
    throw new DonationReceiptServiceError(
      "GENERATED_RECEIPT_TOO_LARGE",
      "Le reçu PDF dépasse la taille autorisée."
    );
  }

  const hasPdfSignature =
    generated.buffer.length >= 5 &&
    generated.buffer[0] === 0x25 &&
    generated.buffer[1] === 0x50 &&
    generated.buffer[2] === 0x44 &&
    generated.buffer[3] === 0x46 &&
    generated.buffer[4] === 0x2d;

  if (!hasPdfSignature) {
    throw new DonationReceiptServiceError(
      "INVALID_GENERATED_RECEIPT",
      "Le document généré n’est pas un PDF valide."
    );
  }

  if (generated.mimeType !== PDF_CONTENT_TYPE) {
    throw new DonationReceiptServiceError(
      "INVALID_RECEIPT_MIME_TYPE",
      "Le type du reçu généré est invalide."
    );
  }

  if (generated.receiptReference !== expectedReceiptReference) {
    throw new DonationReceiptServiceError(
      "RECEIPT_REFERENCE_MISMATCH",
      "La référence du PDF ne correspond pas au reçu."
    );
  }
}

function toServiceResult(
  receipt: StoredReceipt,
  paymentReference: string
): DonationReceiptServiceResult {
  return {
    state:
      receipt.status === "ready" && receipt.emailStatus === "sent"
        ? "completed"
        : "processing",
    receiptId: receipt.id,
    receiptReference: receipt.receiptNumber,
    paymentReference,
    pdfStatus: receipt.status,
    emailStatus: receipt.emailStatus,
    pdfStorageKey: receipt.pdfStorageKey,
    pdfSha256: receipt.pdfSha256,
    emailProviderMessageId: receipt.emailProviderMessageId,
  };
}

async function findConfirmedPayment(
  paymentReference: string
): Promise<ReceiptPayment> {
  const normalizedReference = normalizeDonationReference(paymentReference);

  if (!normalizedReference) {
    throw new DonationReceiptServiceError(
      "INVALID_DONATION_REFERENCE",
      "La référence du paiement est invalide.",
      400
    );
  }

  const payment = await db.donationPayment.findUnique({
    where: { reference: normalizedReference },
    select: PAYMENT_SELECT,
  });

  if (!payment) {
    throw new DonationReceiptServiceError(
      "DONATION_PAYMENT_NOT_FOUND",
      "Le paiement demandé est introuvable.",
      404
    );
  }

  if (payment.status !== "paid" || payment.paidAt === null) {
    throw new DonationReceiptServiceError(
      "DONATION_PAYMENT_NOT_CONFIRMED",
      "Le reçu ne peut être créé que pour un paiement confirmé.",
      409
    );
  }

  if (!payment.providerReference) {
    throw new DonationReceiptServiceError(
      "PAYMENT_PROVIDER_REFERENCE_MISSING",
      "La référence du prestataire est absente du paiement confirmé.",
      409
    );
  }

  return payment;
}

async function findOrCreateReceipt(
  payment: ReceiptPayment,
  language: DonationReceiptLanguage
): Promise<StoredReceipt> {
  const existingReceipt = await db.donationReceipt.findUnique({
    where: { paymentId: payment.id },
    select: RECEIPT_SELECT,
  });

  if (existingReceipt) {
    return existingReceipt;
  }

  if (!payment.paidAt) {
    throw new DonationReceiptServiceError(
      "DONATION_PAYMENT_DATE_MISSING",
      "La date de confirmation du paiement est absente.",
      409
    );
  }

  const paidAt = payment.paidAt;

  for (
    let attempt = 1;
    attempt <= MAX_RECEIPT_CREATION_ATTEMPTS;
    attempt += 1
  ) {
    const receiptNumber = generateDonationReceiptReference(paidAt);

    try {
      return await db.donationReceipt.create({
        data: {
          receiptNumber,
          payment: { connect: { id: payment.id } },
          language,
          status: "pending",
          pdfStorageKey: null,
          pdfSha256: null,
          pdfSizeBytes: null,
          pdfGeneratedAt: null,
          generationError: null,
          emailStatus: "pending",
          emailRecipient: payment.donorEmail,
          emailProviderMessageId: null,
          emailAttemptCount: 0,
          emailLastAttemptAt: null,
          emailSentAt: null,
          emailLastError: null,
        },
        select: RECEIPT_SELECT,
      });
    } catch (error: unknown) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      const concurrentReceipt = await db.donationReceipt.findUnique({
        where: { paymentId: payment.id },
        select: RECEIPT_SELECT,
      });

      if (concurrentReceipt) {
        return concurrentReceipt;
      }

      if (attempt === MAX_RECEIPT_CREATION_ATTEMPTS) {
        throw new DonationReceiptServiceError(
          "RECEIPT_REFERENCE_COLLISION",
          "Une référence unique de reçu n’a pas pu être générée.",
          503,
          true
        );
      }
    }
  }

  throw new DonationReceiptServiceError(
    "RECEIPT_CREATION_FAILED",
    "Le reçu n’a pas pu être créé.",
    500,
    true
  );
}

async function claimPdfGeneration(receiptId: string): Promise<boolean> {
  const result = await db.donationReceipt.updateMany({
    where: { id: receiptId, status: { in: ["pending", "failed"] } },
    data: { status: "generating", generationError: null },
  });

  return result.count === 1;
}

async function markPdfGenerationFailed(
  receiptId: string,
  error: unknown
): Promise<void> {
  await db.donationReceipt.updateMany({
    where: { id: receiptId, status: "generating" },
    data: { status: "failed", generationError: sanitizeErrorMessage(error) },
  });
}

async function generateReceiptPdf(
  receipt: StoredReceipt,
  payment: ReceiptPayment,
  organization: DonationReceiptOrganization
): Promise<GeneratedDonationReceiptPdf> {
  if (!payment.paidAt) {
    throw new DonationReceiptServiceError(
      "DONATION_PAYMENT_NOT_CONFIRMED",
      "La date de confirmation du paiement est absente.",
      409
    );
  }

  const generated = await generateDonationReceiptPdf({
    receiptReference: receipt.receiptNumber,
    donationReference: payment.reference,
    paymentStatus: "paid",
    amount: payment.amount,
    currency: payment.currency,
    frequency: payment.frequency,
    allocationLabel: getDonationAllocationLabel(
      payment.allocation,
      receipt.language
    ),
    issuedAt: receipt.createdAt,
    paidAt: payment.paidAt,
    donor: {
      firstName: payment.donorFirstName,
      lastName: payment.donorLastName,
      email: payment.donorEmail,
      anonymous: payment.anonymous,
    },
    organization,
    language: receipt.language,
  });

  assertGeneratedPdf(generated, receipt.receiptNumber);
  return generated;
}

async function generateAndStoreReceiptPdf(
  receipt: StoredReceipt,
  payment: ReceiptPayment,
  organization: DonationReceiptOrganization,
  storage: DonationReceiptPrivateStorage
): Promise<{
  generated: GeneratedDonationReceiptPdf;
  receipt: StoredReceipt;
}> {
  const generated = await generateReceiptPdf(receipt, payment, organization);
  const pdfSha256 = calculatePdfSha256(generated.buffer);
  const storageKey = createStorageKey(receipt.receiptNumber, receipt.createdAt);

  await storage.save({
    key: storageKey,
    content: generated.buffer,
    contentType: PDF_CONTENT_TYPE,
    sha256: pdfSha256,
  });

  const updatedReceipt = await db.donationReceipt.update({
    where: { id: receipt.id },
    data: {
      status: "ready",
      pdfStorageKey: storageKey,
      pdfSha256,
      pdfSizeBytes: generated.buffer.length,
      pdfGeneratedAt: new Date(),
      generationError: null,
    },
    select: RECEIPT_SELECT,
  });

  return { generated, receipt: updatedReceipt };
}

async function regenerateReadyPdf(
  receipt: StoredReceipt,
  payment: ReceiptPayment,
  organization: DonationReceiptOrganization
): Promise<GeneratedDonationReceiptPdf> {
  const generated = await generateReceiptPdf(receipt, payment, organization);
  const regeneratedHash = calculatePdfSha256(generated.buffer);

  if (receipt.pdfSha256 && regeneratedHash !== receipt.pdfSha256) {
    throw new DonationReceiptServiceError(
      "RECEIPT_PDF_INTEGRITY_MISMATCH",
      "Le PDF régénéré ne correspond pas au reçu enregistré."
    );
  }

  return generated;
}

async function claimEmailSending(receiptId: string): Promise<boolean> {
  const result = await db.donationReceipt.updateMany({
    where: {
      id: receiptId,
      status: "ready",
      emailStatus: { in: ["pending", "failed"] },
    },
    data: {
      emailStatus: "sending",
      emailAttemptCount: { increment: 1 },
      emailLastAttemptAt: new Date(),
      emailLastError: null,
    },
  });

  return result.count === 1;
}

async function markEmailFailed(receiptId: string, error: unknown): Promise<void> {
  await db.donationReceipt.updateMany({
    where: { id: receiptId, emailStatus: "sending" },
    data: { emailStatus: "failed", emailLastError: sanitizeErrorMessage(error) },
  });
}

async function sendReceiptEmail(
  receipt: StoredReceipt,
  payment: ReceiptPayment,
  generated: GeneratedDonationReceiptPdf
): Promise<StoredReceipt> {
  if (!payment.paidAt) {
    throw new DonationReceiptServiceError(
      "DONATION_PAYMENT_NOT_CONFIRMED",
      "La date de confirmation du paiement est absente.",
      409
    );
  }

  const donorName =
    [payment.donorFirstName, payment.donorLastName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ") || null;

  const emailResult = await sendDonationReceiptEmail({
    donationReference: payment.reference,
    receiptReference: receipt.receiptNumber,
    donorName,
    donorEmail: payment.donorEmail,
    amount: payment.amount,
    currency: payment.currency,
    paidAt: payment.paidAt,
    pdfBytes: generated.buffer,
    pdfFileName: generated.fileName,
    language: receipt.language,
  });

  return db.donationReceipt.update({
    where: { id: receipt.id },
    data: {
      emailStatus: "sent",
      emailProviderMessageId: emailResult.emailId,
      emailSentAt: new Date(),
      emailLastError: null,
    },
    select: RECEIPT_SELECT,
  });
}

export async function issueDonationReceipt(
  input: IssueDonationReceiptInput
): Promise<DonationReceiptServiceResult> {
  const language = normalizeLanguage(input.language);
  let payment: ReceiptPayment;
  let receipt: StoredReceipt;

  try {
    payment = await findConfirmedPayment(input.paymentReference);
    receipt = await findOrCreateReceipt(payment, language);
  } catch (error: unknown) {
    if (error instanceof DonationReceiptServiceError) {
      throw error;
    }

    console.error("Donation receipt initialization failed:", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    throw new DonationReceiptServiceError(
      "RECEIPT_INITIALIZATION_FAILED",
      "L’initialisation du reçu de don a échoué.",
      500,
      true,
      { cause: error }
    );
  }

  if (receipt.status === "ready" && receipt.emailStatus === "sent") {
    return toServiceResult(receipt, payment.reference);
  }

  let generated: GeneratedDonationReceiptPdf;

  if (receipt.status === "pending" || receipt.status === "failed") {
    const generationClaimed = await claimPdfGeneration(receipt.id);

    if (!generationClaimed) {
      const currentReceipt = await db.donationReceipt.findUnique({
        where: { id: receipt.id },
        select: RECEIPT_SELECT,
      });

      if (!currentReceipt) {
        throw new DonationReceiptServiceError(
          "DONATION_RECEIPT_NOT_FOUND",
          "Le reçu de don est introuvable.",
          404
        );
      }

      return toServiceResult(currentReceipt, payment.reference);
    }

    receipt = { ...receipt, status: "generating", generationError: null };

    try {
      const result = await generateAndStoreReceiptPdf(
        receipt,
        payment,
        input.organization,
        input.storage
      );
      generated = result.generated;
      receipt = result.receipt;
    } catch (error: unknown) {
      await markPdfGenerationFailed(receipt.id, error);
      console.error("Donation receipt generation failed:", {
        receipt: maskDonationReceiptReference(receipt.receiptNumber),
        errorName: error instanceof Error ? error.name : "UnknownError",
      });

      if (error instanceof DonationReceiptServiceError) {
        throw error;
      }

      throw new DonationReceiptServiceError(
        "RECEIPT_PDF_PROCESSING_FAILED",
        "La génération ou le stockage du reçu PDF a échoué.",
        500,
        true,
        { cause: error }
      );
    }
  } else if (receipt.status === "generating") {
    return toServiceResult(receipt, payment.reference);
  } else if (receipt.status === "ready") {
    try {
      generated = await regenerateReadyPdf(
        receipt,
        payment,
        input.organization
      );
    } catch (error: unknown) {
      console.error("Donation receipt regeneration failed:", {
        receipt: maskDonationReceiptReference(receipt.receiptNumber),
        errorName: error instanceof Error ? error.name : "UnknownError",
      });

      if (error instanceof DonationReceiptServiceError) {
        throw error;
      }

      throw new DonationReceiptServiceError(
        "RECEIPT_REGENERATION_FAILED",
        "Le reçu n’a pas pu être préparé pour un nouvel envoi.",
        500,
        true,
        { cause: error }
      );
    }
  } else {
    throw new DonationReceiptServiceError(
      "INVALID_RECEIPT_STATUS",
      "Le statut du reçu de don est invalide.",
      500,
      true
    );
  }

  if (receipt.emailStatus === "sent" || receipt.emailStatus === "sending") {
    return toServiceResult(receipt, payment.reference);
  }

  const emailClaimed = await claimEmailSending(receipt.id);

  if (!emailClaimed) {
    const currentReceipt = await db.donationReceipt.findUnique({
      where: { id: receipt.id },
      select: RECEIPT_SELECT,
    });

    if (!currentReceipt) {
      throw new DonationReceiptServiceError(
        "DONATION_RECEIPT_NOT_FOUND",
        "Le reçu de don est introuvable.",
        404
      );
    }

    return toServiceResult(currentReceipt, payment.reference);
  }

  try {
    receipt = await sendReceiptEmail(receipt, payment, generated);
    return toServiceResult(receipt, payment.reference);
  } catch (error: unknown) {
    await markEmailFailed(receipt.id, error);
    console.error("Donation receipt email failed:", {
      receipt: maskDonationReceiptReference(receipt.receiptNumber),
      errorCode:
        error instanceof DonationReceiptEmailError
          ? error.code
          : error instanceof DonationReceiptServiceError
            ? error.code
            : "UNKNOWN_EMAIL_ERROR",
    });

    if (error instanceof DonationReceiptServiceError) {
      throw error;
    }

    if (error instanceof DonationReceiptEmailError) {
      throw new DonationReceiptServiceError(
        "RECEIPT_EMAIL_FAILED",
        "Le reçu a été créé, mais son envoi par e-mail a échoué.",
        error.statusCode,
        true,
        { cause: error }
      );
    }

    throw new DonationReceiptServiceError(
      "RECEIPT_EMAIL_FAILED",
      "Le reçu a été créé, mais son envoi par e-mail a échoué.",
      502,
      true,
      { cause: error }
    );
  }
}

export default issueDonationReceipt;
