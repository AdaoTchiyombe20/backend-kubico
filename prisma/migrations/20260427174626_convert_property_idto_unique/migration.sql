/*
  Warnings:

  - A unique constraint covering the columns `[property_id]` on the table `propertyLocalization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "propertyLocalization_property_id_key" ON "propertyLocalization"("property_id");
