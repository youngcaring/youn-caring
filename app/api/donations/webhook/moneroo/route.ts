import "server-only";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { DonationReceiptOrganization } from "@/lib/donation/donation-receipt-pdf";
import {
  DonationPaymentStoreError,
  donationPaymentStore,
} from "@/lib/donation/payment-store";
import {
  PaymentConfigurationError,
  PaymentProviderError,
  hasRegisteredPaymentProvider,
  registerPaymentProvider,
  verifyPayment,
} from "@/lib/donation/payment-provider";
import { monerooPaymentProvider } from "@/lib/donation/providers/moneroo-provider";
import {
  DonationReceiptServiceError,
  issueDonationReceipt,
} from "@/lib/donation/receipt-service";
import { donationReceiptStorage } from "@/lib/donation/receipt-storage";
import {
  DonationWebhookSecurityError,
  verifyDonationWebhookRequest,
} from "@/lib/donation/webhook-security";
import type { VerifiedDonationWebhook } from "@/lib/donation/webhook-security";
import type {
  DonationPaymentRecord,
  DonationPaymentStatus,
  PaymentVerificationResult,
} from "@/types/donation";

/**
 * Webhook Moneroo sécurisé et idempotent.
 * Un événement n'est finalisé qu'après la mise à jour du paiement
 * et, pour un paiement confirmé, l'émission complète du reçu.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

if (!hasRegisteredPaymentProvider("moneroo")) {
  registerPaymentProvider(monerooPaymentProvider);
}

const MAX_STORED_ERROR_LENGTH = 500;

type StoredWebhookStatus =
  | "received"
  | "processing"
  | "processed"
  | "ignored"
  | "failed";

type StoredWebhookEvent = Readonly<{
  id: string;
  status: StoredWebhookStatus;
  attemptCount: number;
}>;

type WebhookClaimResult =
  | Readonly<{ action: "process"; event: StoredWebhookEvent }>
  | Readonly<{ action: "duplicate"; event: StoredWebhookEvent }>
  | Readonly<{ action: "processing"; event: StoredWebhookEvent }>;

class DonationReceiptConfigurationError extends Error {
  readonly code = "DONATION_RECEIPT_CONFIGURATION_ERROR";
  readonly statusCode = 503;

  constructor(message: string) {
    super(message);
    this.name = "DonationReceiptConfigurationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  additionalHeaders?: Readonly<Record<string, string>>
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      ...additionalHeaders,
    },
  });
}

function isUniqueConstraintError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function normalizeStoredError(value: string): string {
  const normalized = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_STORED_ERROR_LENGTH);

  return normalized || "UNKNOWN_WEBHOOK_ERROR";
}

function getRequiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new DonationReceiptConfigurationError(
      `${name} est absente ou vide.`
    );
  }

  return value;
}

function getOptionalEnvironmentValue(name: string): string | null {
  return process.env[name]?.trim() || null;
}

/** Charge uniquement les informations publiques imprimées sur le reçu. */
function getDonationReceiptOrganization(): DonationReceiptOrganization {
  const websiteValue = getRequiredEnvironmentValue("NEXT_PUBLIC_SITE_URL");
  const email =
    getOptionalEnvironmentValue("DONATION_RECEIPT_ORGANIZATION_EMAIL") ??
    getOptionalEnvironmentValue("CONTACT_FROM_EMAIL");

  if (!email) {
    throw new DonationReceiptConfigurationError(
      "DONATION_RECEIPT_ORGANIZATION_EMAIL ou CONTACT_FROM_EMAIL est requis."
    );
  }

  let website: URL;

  try {
    website = new URL(websiteValue);
  } catch {
    throw new DonationReceiptConfigurationError(
      "NEXT_PUBLIC_SITE_URL est invalide."
    );
  }

  if (
    website.protocol !== "https:" ||
    website.username.length > 0 ||
    website.password.length > 0
  ) {
    throw new DonationReceiptConfigurationError(
      "NEXT_PUBLIC_SITE_URL doit être une URL HTTPS publique."
    );
  }

  return {
    name:
      getOptionalEnvironmentValue("DONATION_RECEIPT_ORGANIZATION_NAME") ??
      "Young Caring",
    address: getRequiredEnvironmentValue(
      "DONATION_RECEIPT_ORGANIZATION_ADDRESS"
    ),
    email,
    phone: getOptionalEnvironmentValue(
      "DONATION_RECEIPT_ORGANIZATION_PHONE"
    ),
    website: website.origin,
    logoDataUrl: null,
  };
}

async function claimWebhookEvent(
  webhook: VerifiedDonationWebhook
): Promise<WebhookClaimResult> {
  try {
    const created = await db.donationWebhookEvent.create({
      data: {
        provider: webhook.event.provider,
        eventId: webhook.event.eventId,
        deduplicationKey: webhook.deduplicationKey,
        providerReference: webhook.event.providerReference,
        eventType: webhook.event.eventType,
        payloadHash: webhook.payloadHash,
        signatureVerified: true,
        status: "processing",
        attemptCount: 1,
        processingStartedAt: new Date(),
        processedAt: null,
        lastError: null,
      },
      select: {
        id: true,
        status: true,
        attemptCount: true,
      },
    });

    return { action: "process", event: created };
  } catch (error: unknown) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }
  }

  const existing = await db.donationWebhookEvent.findUnique({
    where: { deduplicationKey: webhook.deduplicationKey },
    select: {
      id: true,
      status: true,
      attemptCount: true,
      payloadHash: true,
      providerReference: true,
    },
  });

  if (!existing) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_IDEMPOTENCY_RECORD_NOT_FOUND",
      "L'enregistrement d'idempotence du webhook est introuvable.",
      500
    );
  }

  if (
    existing.payloadHash !== webhook.payloadHash ||
    existing.providerReference !== webhook.event.providerReference
  ) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_IDEMPOTENCY_CONFLICT",
      "L'événement webhook entre en conflit avec un événement existant.",
      409
    );
  }

  if (existing.status === "processed" || existing.status === "ignored") {
    return { action: "duplicate", event: existing };
  }

  if (existing.status === "processing") {
    return { action: "processing", event: existing };
  }

  const claimed = await db.donationWebhookEvent.updateMany({
    where: {
      id: existing.id,
      status: { in: ["received", "failed"] },
    },
    data: {
      status: "processing",
      attemptCount: { increment: 1 },
      processingStartedAt: new Date(),
      processedAt: null,
      lastError: null,
    },
  });

  if (claimed.count === 0) {
    const current = await db.donationWebhookEvent.findUnique({
      where: { id: existing.id },
      select: { id: true, status: true, attemptCount: true },
    });

    if (!current) {
      throw new DonationWebhookSecurityError(
        "WEBHOOK_RECORD_NOT_FOUND",
        "L'événement webhook est introuvable.",
        500
      );
    }

    if (current.status === "processed" || current.status === "ignored") {
      return { action: "duplicate", event: current };
    }

    return { action: "processing", event: current };
  }

  const updated = await db.donationWebhookEvent.findUnique({
    where: { id: existing.id },
    select: { id: true, status: true, attemptCount: true },
  });

  if (!updated) {
    throw new DonationWebhookSecurityError(
      "WEBHOOK_CLAIMED_RECORD_NOT_FOUND",
      "L'événement webhook pris en charge est introuvable.",
      500
    );
  }

  return { action: "process", event: updated };
}

function assertPaymentMatches(
  storedPayment: DonationPaymentRecord,
  verifiedPayment: PaymentVerificationResult
): void {
  if (verifiedPayment.provider !== storedPayment.provider) {
    throw new PaymentProviderError(
      "PAYMENT_PROVIDER_MISMATCH",
      "Le prestataire vérifié ne correspond pas au paiement enregistré.",
      409
    );
  }

  if (verifiedPayment.reference !== storedPayment.reference) {
    throw new PaymentProviderError(
      "PAYMENT_REFERENCE_MISMATCH",
      "La référence vérifiée ne correspond pas au paiement enregistré.",
      409
    );
  }

  if (
    !verifiedPayment.providerReference ||
    !storedPayment.providerReference ||
    verifiedPayment.providerReference !== storedPayment.providerReference
  ) {
    throw new PaymentProviderError(
      "PROVIDER_REFERENCE_MISMATCH",
      "La référence prestataire vérifiée ne correspond pas.",
      409
    );
  }

  if (verifiedPayment.amount !== storedPayment.amount) {
    throw new PaymentProviderError(
      "PAYMENT_AMOUNT_MISMATCH",
      "Le montant vérifié ne correspond pas au montant attendu.",
      409
    );
  }

  if (verifiedPayment.currency !== storedPayment.currency) {
    throw new PaymentProviderError(
      "PAYMENT_CURRENCY_MISMATCH",
      "La devise vérifiée ne correspond pas à la devise attendue.",
      409
    );
  }
}

function resolvePaymentStatus(
  currentStatus: DonationPaymentStatus,
  verifiedStatus: DonationPaymentStatus
): DonationPaymentStatus {
  if (currentStatus === "paid") {
    return verifiedStatus === "refunded" ? "refunded" : "paid";
  }

  if (
    currentStatus === "refunded" ||
    currentStatus === "failed" ||
    currentStatus === "cancelled" ||
    currentStatus === "expired"
  ) {
    return currentStatus;
  }

  if (currentStatus === "processing" && verifiedStatus === "pending") {
    return "processing";
  }

  return verifiedStatus;
}

async function issueReceiptForPaidPayment(
  payment: DonationPaymentRecord
): Promise<"completed" | "processing" | "not-applicable"> {
  if (payment.status !== "paid" || payment.paidAt === null) {
    return "not-applicable";
  }

  const result = await issueDonationReceipt({
    paymentReference: payment.reference,
    language: "fr",
    organization: getDonationReceiptOrganization(),
    storage: donationReceiptStorage,
  });

  return result.state;
}

async function recoverReceiptForDuplicateWebhook(
  providerReference: string
): Promise<"completed" | "processing" | "not-applicable"> {
  const payment = await donationPaymentStore.findByProviderReference(
    providerReference
  );

  if (!payment) {
    return "not-applicable";
  }

  return issueReceiptForPaidPayment(payment);
}

async function markWebhookProcessed(
  eventId: string,
  paymentId: string
): Promise<void> {
  await db.donationWebhookEvent.update({
    where: { id: eventId },
    data: {
      status: "processed",
      paymentId,
      processedAt: new Date(),
      lastError: null,
    },
  });
}

async function markWebhookIgnored(
  eventId: string,
  paymentId: string,
  reason: string
): Promise<void> {
  await db.donationWebhookEvent.update({
    where: { id: eventId },
    data: {
      status: "ignored",
      paymentId,
      processedAt: new Date(),
      lastError: normalizeStoredError(reason),
    },
  });
}

async function markWebhookFailed(
  eventId: string,
  errorCode: string
): Promise<void> {
  try {
    await db.donationWebhookEvent.update({
      where: { id: eventId },
      data: {
        status: "failed",
        lastError: normalizeStoredError(errorCode),
        processedAt: null,
      },
    });
  } catch (updateError: unknown) {
    console.error("Unable to mark webhook as failed:", {
      eventId,
      errorName:
        updateError instanceof Error ? updateError.name : "UnknownError",
    });
  }
}

function getSafeErrorCode(error: unknown): string {
  if (
    error instanceof DonationWebhookSecurityError ||
    error instanceof PaymentProviderError ||
    error instanceof PaymentConfigurationError ||
    error instanceof DonationPaymentStoreError ||
    error instanceof DonationReceiptServiceError ||
    error instanceof DonationReceiptConfigurationError
  ) {
    return error.code;
  }

  return "UNEXPECTED_WEBHOOK_ERROR";
}

function getSafeHttpStatus(value: number, fallback: number): number {
  return Number.isSafeInteger(value) && value >= 400 && value <= 599
    ? value
    : fallback;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let claimedEventId: string | null = null;

  try {
    const webhook = await verifyDonationWebhookRequest(
      request,
      monerooPaymentProvider
    );

    const claim = await claimWebhookEvent(webhook);

    if (claim.action === "duplicate") {
      /*
       * Reprise pour les anciens événements qui avaient été marqués comme
       * terminés avant que le service de reçu ne soit branché au webhook.
       */
      const receiptState = await recoverReceiptForDuplicateWebhook(
        webhook.event.providerReference
      );

      if (receiptState === "processing") {
        return jsonResponse(
          { received: true, duplicate: true, receiptProcessing: true },
          202,
          { "Retry-After": "5" }
        );
      }

      return jsonResponse(
        {
          received: true,
          duplicate: true,
          receiptProcessed: receiptState === "completed",
        },
        200
      );
    }

    if (claim.action === "processing") {
      return jsonResponse(
        { received: true, processing: true },
        202,
        { "Retry-After": "5" }
      );
    }

    claimedEventId = claim.event.id;

    const storedPayment =
      await donationPaymentStore.findByProviderReference(
        webhook.event.providerReference
      );

    if (!storedPayment) {
      await markWebhookFailed(claim.event.id, "PAYMENT_NOT_FOUND");
      claimedEventId = null;

      return jsonResponse(
        { received: false, error: "PAYMENT_NOT_FOUND" },
        503,
        { "Retry-After": "30" }
      );
    }

    const verifiedPayment = await verifyPayment(
      webhook.event.providerReference
    );

    assertPaymentMatches(storedPayment, verifiedPayment);

    const nextStatus = resolvePaymentStatus(
      storedPayment.status,
      verifiedPayment.status
    );

    if (nextStatus === storedPayment.status) {
      const receiptState = await issueReceiptForPaidPayment(storedPayment);

      if (receiptState === "processing") {
        throw new DonationReceiptServiceError(
          "DONATION_RECEIPT_PROCESSING",
          "Le reçu est déjà en cours de traitement.",
          503,
          true
        );
      }

      await markWebhookIgnored(
        claim.event.id,
        storedPayment.id,
        "PAYMENT_STATUS_UNCHANGED"
      );

      claimedEventId = null;

      return jsonResponse(
        {
          received: true,
          processed: true,
          ignored: true,
          receiptProcessed: receiptState === "completed",
        },
        200
      );
    }

    const updateInput: Readonly<{
      status: DonationPaymentStatus;
      paidAt?: Date;
    }> =
      nextStatus === "paid" && storedPayment.paidAt === null
        ? { status: nextStatus, paidAt: new Date() }
        : { status: nextStatus };

    const updatedPayment = await donationPaymentStore.updateByReference(
      storedPayment.reference,
      updateInput
    );

    const receiptState = await issueReceiptForPaidPayment(updatedPayment);

    if (receiptState === "processing") {
      throw new DonationReceiptServiceError(
        "DONATION_RECEIPT_PROCESSING",
        "Le reçu est déjà en cours de traitement.",
        503,
        true
      );
    }

    await markWebhookProcessed(claim.event.id, updatedPayment.id);
    claimedEventId = null;

    return jsonResponse(
      {
        received: true,
        processed: true,
        receiptProcessed: receiptState === "completed",
      },
      200
    );
  } catch (error: unknown) {
    const errorCode = getSafeErrorCode(error);

    if (claimedEventId) {
      await markWebhookFailed(claimedEventId, errorCode);
    }

    if (error instanceof DonationWebhookSecurityError) {
      console.warn("Moneroo webhook rejected:", { code: error.code });
      return jsonResponse(
        { received: false, error: "WEBHOOK_REJECTED" },
        getSafeHttpStatus(error.statusCode, 400)
      );
    }

    if (error instanceof DonationReceiptConfigurationError) {
      console.error("Donation receipt configuration error:", {
        code: error.code,
        message: error.message,
      });
      return jsonResponse(
        { received: false, error: "RECEIPT_SERVICE_NOT_CONFIGURED" },
        503,
        { "Retry-After": "60" }
      );
    }

    if (error instanceof DonationReceiptServiceError) {
      console.error("Donation receipt processing error:", {
        code: error.code,
        retryable: error.retryable,
      });
      return jsonResponse(
        { received: false, error: "RECEIPT_PROCESSING_FAILED" },
        error.retryable
          ? 503
          : getSafeHttpStatus(error.statusCode, 500),
        error.retryable ? { "Retry-After": "30" } : undefined
      );
    }

    if (error instanceof PaymentConfigurationError) {
      console.error("Moneroo webhook configuration error:", {
        code: error.code,
      });
      return jsonResponse(
        { received: false, error: "PAYMENT_SERVICE_NOT_CONFIGURED" },
        503
      );
    }

    if (error instanceof PaymentProviderError) {
      console.error("Moneroo webhook verification error:", {
        code: error.code,
      });
      return jsonResponse(
        { received: false, error: "PAYMENT_VERIFICATION_FAILED" },
        getSafeHttpStatus(error.statusCode, 502)
      );
    }

    if (error instanceof DonationPaymentStoreError) {
      console.error("Moneroo webhook storage error:", { code: error.code });
      return jsonResponse(
        { received: false, error: "PAYMENT_STORAGE_ERROR" },
        error.statusCode >= 500
          ? getSafeHttpStatus(error.statusCode, 500)
          : 500
      );
    }

    console.error("Unexpected Moneroo webhook error:", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return jsonResponse(
      { received: false, error: "WEBHOOK_PROCESSING_FAILED" },
      500
    );
  }
}

function methodNotAllowed(): NextResponse {
  return jsonResponse(
    { success: false, error: "METHOD_NOT_ALLOWED" },
    405,
    { Allow: "POST" }
  );
}

export function GET(): NextResponse {
  return methodNotAllowed();
}

export function PUT(): NextResponse {
  return methodNotAllowed();
}

export function PATCH(): NextResponse {
  return methodNotAllowed();
}

export function DELETE(): NextResponse {
  return methodNotAllowed();
}
