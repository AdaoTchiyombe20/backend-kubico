-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_owner_id_property_id_key" ON "favorites"("owner_id", "property_id");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
