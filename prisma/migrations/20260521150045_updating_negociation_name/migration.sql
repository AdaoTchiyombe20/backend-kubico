/*
  Warnings:

  - You are about to drop the column `negotiation_id` on the `negociationEvent` table. All the data in the column will be lost.
  - You are about to drop the `negotiation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `negociation_id` to the `negociationEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NegociationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "negociationEvent" DROP CONSTRAINT "negociationEvent_negotiation_id_fkey";

-- DropForeignKey
ALTER TABLE "negotiation" DROP CONSTRAINT "negotiation_client_id_fkey";

-- DropForeignKey
ALTER TABLE "negotiation" DROP CONSTRAINT "negotiation_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "negotiation" DROP CONSTRAINT "negotiation_property_listing_id_fkey";

-- AlterTable
ALTER TABLE "negociationEvent" DROP COLUMN "negotiation_id",
ADD COLUMN     "negociation_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "negotiation";

-- DropEnum
DROP TYPE "NegotiationStatus";

-- CreateTable
CREATE TABLE "negociation" (
    "id" SERIAL NOT NULL,
    "property_listing_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "proposed_price" DECIMAL(65,30) NOT NULL,
    "accepted_value" DECIMAL(65,30),
    "status" "NegociationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negociation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "negociation" ADD CONSTRAINT "negociation_property_listing_id_fkey" FOREIGN KEY ("property_listing_id") REFERENCES "propertyListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociation" ADD CONSTRAINT "negociation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociation" ADD CONSTRAINT "negociation_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociationEvent" ADD CONSTRAINT "negociationEvent_negociation_id_fkey" FOREIGN KEY ("negociation_id") REFERENCES "negociation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
