-- CreateEnum
CREATE TYPE "DonationCurrency" AS ENUM ('XOF', 'EUR', 'USD');

-- CreateEnum
CREATE TYPE "DonationFrequency" AS ENUM ('once', 'monthly');

-- CreateEnum
CREATE TYPE "DonationAllocation" AS ENUM ('priority', 'education', 'foodSupport', 'health', 'clothing', 'children', 'womenFamilies', 'waterHygiene', 'emergency');

-- CreateEnum
CREATE TYPE "DonationPaymentProvider" AS ENUM ('moneroo', 'fedapay', 'kkiapay', 'paydunya', 'stripe');

-- CreateEnum
CREATE TYPE "DonationPaymentStatus" AS ENUM ('pending', 'processing', 'paid', 'failed', 'cancelled', 'expired', 'refunded');

-- CreateEnum
CREATE TYPE "DonationWebhookStatus" AS ENUM ('received', 'processing', 'processed', 'ignored', 'failed');

-- CreateEnum
CREATE TYPE "DonationReceiptStatus" AS ENUM ('pending', 'generating', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "DonationReceiptEmailStatus" AS ENUM ('pending', 'sending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "DonationReceiptLanguage" AS ENUM ('fr', 'en');

-- CreateTable
CREATE TABLE "donation_payments" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "provider" "DonationPaymentProvider" NOT NULL,
    "providerReference" VARCHAR(200),
    "amount" INTEGER NOT NULL,
    "currency" "DonationCurrency" NOT NULL,
    "frequency" "DonationFrequency" NOT NULL,
    "allocation" "DonationAllocation" NOT NULL,
    "donorFirstName" VARCHAR(100) NOT NULL,
    "donorLastName" VARCHAR(100) NOT NULL,
    "donorEmail" VARCHAR(320) NOT NULL,
    "donorPhone" VARCHAR(50),
    "donorCountry" VARCHAR(100),
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "DonationPaymentStatus" NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMPTZ(3),
    "lastVerifiedAt" TIMESTAMPTZ(3),
    "verificationCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "donation_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" "DonationPaymentProvider" NOT NULL,
    "eventId" VARCHAR(200),
    "deduplicationKey" VARCHAR(255) NOT NULL,
    "providerReference" VARCHAR(200) NOT NULL,
    "eventType" VARCHAR(150),
    "payloadHash" CHAR(64) NOT NULL,
    "signatureVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "DonationWebhookStatus" NOT NULL DEFAULT 'received',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" VARCHAR(500),
    "paymentId" TEXT,
    "receivedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingStartedAt" TIMESTAMPTZ(3),
    "processedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "donation_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_receipts" (
    "id" TEXT NOT NULL,
    "receiptNumber" VARCHAR(100) NOT NULL,
    "paymentId" TEXT NOT NULL,
    "language" "DonationReceiptLanguage" NOT NULL DEFAULT 'fr',
    "status" "DonationReceiptStatus" NOT NULL DEFAULT 'pending',
    "pdfStorageKey" VARCHAR(500),
    "pdfSha256" CHAR(64),
    "pdfSizeBytes" INTEGER,
    "pdfGeneratedAt" TIMESTAMPTZ(3),
    "generationError" VARCHAR(500),
    "emailStatus" "DonationReceiptEmailStatus" NOT NULL DEFAULT 'pending',
    "emailRecipient" VARCHAR(320) NOT NULL,
    "emailProviderMessageId" VARCHAR(200),
    "emailAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "emailLastAttemptAt" TIMESTAMPTZ(3),
    "emailSentAt" TIMESTAMPTZ(3),
    "emailLastError" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "donation_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donation_payments_reference_key" ON "donation_payments"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "donation_payments_providerReference_key" ON "donation_payments"("providerReference");

-- CreateIndex
CREATE INDEX "donation_payments_status_createdAt_idx" ON "donation_payments"("status", "createdAt");

-- CreateIndex
CREATE INDEX "donation_payments_provider_status_idx" ON "donation_payments"("provider", "status");

-- CreateIndex
CREATE INDEX "donation_payments_donorEmail_createdAt_idx" ON "donation_payments"("donorEmail", "createdAt");

-- CreateIndex
CREATE INDEX "donation_payments_currency_status_idx" ON "donation_payments"("currency", "status");

-- CreateIndex
CREATE INDEX "donation_payments_paidAt_idx" ON "donation_payments"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "donation_webhook_events_deduplicationKey_key" ON "donation_webhook_events"("deduplicationKey");

-- CreateIndex
CREATE INDEX "donation_webhook_events_providerReference_idx" ON "donation_webhook_events"("providerReference");

-- CreateIndex
CREATE INDEX "donation_webhook_events_status_receivedAt_idx" ON "donation_webhook_events"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "donation_webhook_events_paymentId_idx" ON "donation_webhook_events"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "donation_webhook_events_provider_eventId_key" ON "donation_webhook_events"("provider", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "donation_receipts_receiptNumber_key" ON "donation_receipts"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "donation_receipts_paymentId_key" ON "donation_receipts"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "donation_receipts_emailProviderMessageId_key" ON "donation_receipts"("emailProviderMessageId");

-- CreateIndex
CREATE INDEX "donation_receipts_status_createdAt_idx" ON "donation_receipts"("status", "createdAt");

-- CreateIndex
CREATE INDEX "donation_receipts_emailStatus_createdAt_idx" ON "donation_receipts"("emailStatus", "createdAt");

-- CreateIndex
CREATE INDEX "donation_receipts_emailRecipient_createdAt_idx" ON "donation_receipts"("emailRecipient", "createdAt");

-- CreateIndex
CREATE INDEX "donation_receipts_pdfGeneratedAt_idx" ON "donation_receipts"("pdfGeneratedAt");

-- CreateIndex
CREATE INDEX "donation_receipts_emailSentAt_idx" ON "donation_receipts"("emailSentAt");

-- AddForeignKey
ALTER TABLE "donation_webhook_events" ADD CONSTRAINT "donation_webhook_events_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "donation_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_receipts" ADD CONSTRAINT "donation_receipts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "donation_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
