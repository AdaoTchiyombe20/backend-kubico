/*
  Warnings:

  - You are about to drop the column `property_id` on the `favorites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[owner_id,listed_property_id]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `listed_property_id` to the `favorites` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DIRECT_PURCHASE', 'NEGOCIATED_PURCHASE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'HELD', 'RELEASED', 'CANCELLED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_property_id_fkey";

-- DropIndex
DROP INDEX "favorites_owner_id_property_id_idx";

-- DropIndex
DROP INDEX "favorites_owner_id_property_id_key";

-- DropIndex
DROP INDEX "favorites_property_id_idx";

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "property_id",
ADD COLUMN     "listed_property_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "property_listing_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "negociation_id" INTEGER,
    "payment_type" "PaymentType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "platform_fee" DECIMAL(65,30),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "property_title" TEXT NOT NULL,
    "property_price" DECIMAL(65,30) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "transaction_reference" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_negociation_id_key" ON "payments"("negociation_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_reference_key" ON "payments"("transaction_reference");

-- CreateIndex
CREATE INDEX "payments_client_id_idx" ON "payments"("client_id");

-- CreateIndex
CREATE INDEX "payments_owner_id_idx" ON "payments"("owner_id");

-- CreateIndex
CREATE INDEX "payments_property_listing_id_idx" ON "payments"("property_listing_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "favorites_listed_property_id_idx" ON "favorites"("listed_property_id");

-- CreateIndex
CREATE INDEX "favorites_owner_id_listed_property_id_idx" ON "favorites"("owner_id", "listed_property_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_owner_id_listed_property_id_key" ON "favorites"("owner_id", "listed_property_id");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listed_property_id_fkey" FOREIGN KEY ("listed_property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_property_listing_id_fkey" FOREIGN KEY ("property_listing_id") REFERENCES "propertyListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profile_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profile_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_negociation_id_fkey" FOREIGN KEY ("negociation_id") REFERENCES "negociation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
