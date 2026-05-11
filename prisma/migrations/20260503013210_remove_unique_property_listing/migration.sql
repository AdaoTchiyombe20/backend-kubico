-- DropIndex
DROP INDEX "propertyListing_property_id_key";

-- CreateIndex
CREATE INDEX "propertyListing_property_id_idx" ON "propertyListing"("property_id");

-- CreateIndex
CREATE INDEX "propertyListing_property_id_delisted_at_idx" ON "propertyListing"("property_id", "delisted_at");
