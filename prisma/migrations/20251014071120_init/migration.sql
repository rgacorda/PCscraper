-- CreateEnum
CREATE TYPE "PartCategory" AS ENUM ('CPU', 'GPU', 'MOTHERBOARD', 'RAM', 'STORAGE', 'PSU', 'CASE', 'COOLING', 'MONITOR', 'PERIPHERAL', 'OTHER');

-- CreateEnum
CREATE TYPE "Retailer" AS ENUM ('DATABLITZ', 'PCWORTH', 'BERMOR');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'LIMITED_STOCK', 'UNKNOWN');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "PartCategory" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "lowestPrice" DECIMAL(10,2),
    "highestPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_listings" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "retailer" "Retailer" NOT NULL,
    "retailerUrl" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stockStatus" "StockStatus" NOT NULL DEFAULT 'UNKNOWN',
    "lastScraped" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_builds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pc_builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pc_build_items" (
    "id" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pc_build_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_jobs" (
    "id" TEXT NOT NULL,
    "retailer" "Retailer" NOT NULL,
    "status" TEXT NOT NULL,
    "itemsScraped" INTEGER NOT NULL DEFAULT 0,
    "itemsUpdated" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "scrape_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_lowestPrice_idx" ON "products"("lowestPrice");

-- CreateIndex
CREATE INDEX "product_listings_retailer_idx" ON "product_listings"("retailer");

-- CreateIndex
CREATE INDEX "product_listings_price_idx" ON "product_listings"("price");

-- CreateIndex
CREATE INDEX "product_listings_lastScraped_idx" ON "product_listings"("lastScraped");

-- CreateIndex
CREATE UNIQUE INDEX "product_listings_productId_retailer_key" ON "product_listings"("productId", "retailer");

-- CreateIndex
CREATE UNIQUE INDEX "pc_build_items_buildId_productId_key" ON "pc_build_items"("buildId", "productId");

-- CreateIndex
CREATE INDEX "scrape_jobs_retailer_idx" ON "scrape_jobs"("retailer");

-- CreateIndex
CREATE INDEX "scrape_jobs_status_idx" ON "scrape_jobs"("status");

-- CreateIndex
CREATE INDEX "scrape_jobs_startedAt_idx" ON "scrape_jobs"("startedAt");

-- AddForeignKey
ALTER TABLE "product_listings" ADD CONSTRAINT "product_listings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pc_build_items" ADD CONSTRAINT "pc_build_items_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "pc_builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pc_build_items" ADD CONSTRAINT "pc_build_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
