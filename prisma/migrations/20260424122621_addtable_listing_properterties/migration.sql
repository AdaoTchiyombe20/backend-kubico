-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('RESERVADO', 'VENDIDO', 'ALUGADO', 'DISPONIVEL');

-- CreateTable
CREATE TABLE "propertyListing" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "listed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delisted_at" TIMESTAMP(3),
    "status" "ListingStatus" NOT NULL,

    CONSTRAINT "propertyListing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "propertyListing" ADD CONSTRAINT "propertyListing_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
