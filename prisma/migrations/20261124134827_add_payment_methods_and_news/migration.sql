-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "accountNumber" VARCHAR(255) NOT NULL,
    "accountHolder" VARCHAR(200),
    "logoUrl" VARCHAR(1000),
    "descriptionFr" TEXT,
    "descriptionEn" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_posts" (
    "id" TEXT NOT NULL,
    "titleFr" VARCHAR(250) NOT NULL,
    "titleEn" VARCHAR(250),
    "descriptionFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "news_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_methods_isActive_displayOrder_idx" ON "payment_methods"("isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "news_posts_isPublished_publishedAt_idx" ON "news_posts"("isPublished", "publishedAt");
