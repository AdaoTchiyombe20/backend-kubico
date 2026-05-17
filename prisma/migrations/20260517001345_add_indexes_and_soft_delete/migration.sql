/*
  Warnings:

  - You are about to drop the column `create_at` on the `properties` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `properties` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - A unique constraint covering the columns `[id_owner,id]` on the table `properties` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `propertyMedia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[property_id,order]` on the table `propertyMedia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "create_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "price" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE INDEX "properties_status_property_idx" ON "properties"("status_property");

-- CreateIndex
CREATE INDEX "properties_created_at_idx" ON "properties"("created_at");

-- CreateIndex
CREATE INDEX "properties_deleted_at_idx" ON "properties"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "properties_id_owner_id_key" ON "properties"("id_owner", "id");

-- CreateIndex
CREATE INDEX "propertyCompartments_property_id_idx" ON "propertyCompartments"("property_id");

-- CreateIndex
CREATE INDEX "propertyHistory_id_property_started_at_idx" ON "propertyHistory"("id_property", "started_at");

-- CreateIndex
CREATE INDEX "propertyHistory_id_owner_started_at_idx" ON "propertyHistory"("id_owner", "started_at");

-- CreateIndex
CREATE INDEX "propertyListing_status_delisted_at_id_idx" ON "propertyListing"("status", "delisted_at", "id");

-- CreateIndex
CREATE INDEX "propertyListing_listed_at_idx" ON "propertyListing"("listed_at");

-- CreateIndex
CREATE INDEX "propertyListing_delisted_at_idx" ON "propertyListing"("delisted_at");

-- CreateIndex
CREATE INDEX "propertyLocalization_municipality_neighborhood_idx" ON "propertyLocalization"("municipality", "neighborhood");

-- CreateIndex
CREATE INDEX "propertyLocalization_latitude_longitude_idx" ON "propertyLocalization"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "propertyMedia_public_id_key" ON "propertyMedia"("public_id");

-- CreateIndex
CREATE INDEX "propertyMedia_property_id_type_idx" ON "propertyMedia"("property_id", "type");

-- CreateIndex
CREATE INDEX "propertyMedia_uploaded_at_idx" ON "propertyMedia"("uploaded_at");

-- CreateIndex
CREATE UNIQUE INDEX "propertyMedia_property_id_order_key" ON "propertyMedia"("property_id", "order");
