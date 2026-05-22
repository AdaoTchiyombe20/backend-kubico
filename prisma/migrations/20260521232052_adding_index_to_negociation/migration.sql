-- CreateIndex
CREATE INDEX "negociation_property_listing_id_idx" ON "negociation"("property_listing_id");

-- CreateIndex
CREATE INDEX "negociation_client_id_idx" ON "negociation"("client_id");

-- CreateIndex
CREATE INDEX "negociation_owner_id_client_id_idx" ON "negociation"("owner_id", "client_id");

-- CreateIndex
CREATE INDEX "negociation_property_listing_id_client_id_idx" ON "negociation"("property_listing_id", "client_id");
