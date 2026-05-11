/*
  Warnings:

  - You are about to drop the column `nogiciation_id` on the `negotiationEvent` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `propertyListing` table. All the data in the column will be lost.
  - You are about to drop the `negociation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `negotiation_id` to the `negotiationEvent` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `event_type` on the `negotiationEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NegotiationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NegotiationEventType" AS ENUM ('PROPOSAL', 'ACCEPTANCE', 'REJECTION', 'CANCELLATION', 'OTHER');

-- DropForeignKey
ALTER TABLE "negociation" DROP CONSTRAINT "negociation_client_id_fkey";

-- DropForeignKey
ALTER TABLE "negociation" DROP CONSTRAINT "negociation_property_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "negotiationEvent" DROP CONSTRAINT "negotiationEvent_nogiciation_id_fkey";

-- AlterTable
ALTER TABLE "negotiationEvent" DROP COLUMN "nogiciation_id",
ADD COLUMN     "negotiation_id" INTEGER NOT NULL,
DROP COLUMN "event_type",
ADD COLUMN     "event_type" "NegotiationEventType" NOT NULL;

-- AlterTable
ALTER TABLE "propertyListing" DROP COLUMN "status";

-- DropTable
DROP TABLE "negociation";

-- DropEnum
DROP TYPE "ListingStatus";

-- DropEnum
DROP TYPE "NegociationEventType";

-- DropEnum
DROP TYPE "NegociationStatus";

-- CreateTable
CREATE TABLE "negotiation" (
    "id" SERIAL NOT NULL,
    "property_listing_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "proposed_price" DECIMAL(65,30) NOT NULL,
    "accepted_value" DECIMAL(65,30),
    "status" "NegotiationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negotiation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "negotiation" ADD CONSTRAINT "negotiation_property_listing_id_fkey" FOREIGN KEY ("property_listing_id") REFERENCES "propertyListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation" ADD CONSTRAINT "negotiation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation" ADD CONSTRAINT "negotiation_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profile_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiationEvent" ADD CONSTRAINT "negotiationEvent_negotiation_id_fkey" FOREIGN KEY ("negotiation_id") REFERENCES "negotiation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
