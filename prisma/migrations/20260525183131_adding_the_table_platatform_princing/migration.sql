-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('PROPERTY_SALE', 'PROPERTY_RENT', 'FEATURED_PROPERTY');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "Featured_Property_Status" AS ENUM ('ACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "price" SET DATA TYPE BIGINT;

-- CreateTable
CREATE TABLE "platform_pricing" (
    "id" SERIAL NOT NULL,
    "type" "PricingType" NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "pricing_model" "PricingModel" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_properties" (
    "id" SERIAL NOT NULL,
    "property_listing_id" INTEGER NOT NULL,
    "status" "Featured_Property_Status" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "featured_properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "platform_pricing_type_is_active_idx" ON "platform_pricing"("type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "featured_properties_id_key" ON "featured_properties"("id");

-- AddForeignKey
ALTER TABLE "platform_pricing" ADD CONSTRAINT "platform_pricing_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_properties" ADD CONSTRAINT "featured_properties_property_listing_id_fkey" FOREIGN KEY ("property_listing_id") REFERENCES "propertyListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
