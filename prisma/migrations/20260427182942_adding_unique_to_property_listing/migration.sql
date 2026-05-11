/*
  Warnings:

  - A unique constraint covering the columns `[property_id]` on the table `propertyListing` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "propertyListing_property_id_key" ON "propertyListing"("property_id");
