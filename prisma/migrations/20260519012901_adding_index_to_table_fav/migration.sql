-- CreateIndex
CREATE INDEX "favorites_owner_id_idx" ON "favorites"("owner_id");

-- CreateIndex
CREATE INDEX "favorites_property_id_idx" ON "favorites"("property_id");

-- CreateIndex
CREATE INDEX "favorites_owner_id_property_id_idx" ON "favorites"("owner_id", "property_id");
