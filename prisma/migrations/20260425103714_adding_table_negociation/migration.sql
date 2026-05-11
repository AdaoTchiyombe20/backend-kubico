-- CreateEnum
CREATE TYPE "NegociationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NegociationEventType" AS ENUM ('PROPOSAL', 'ACCEPTANCE', 'REJECTION', 'CANCELLATION', 'OTHER');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "is_negotiable" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "negociation" (
    "id" SERIAL NOT NULL,
    "property_listing_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "proposed_price" DECIMAL(65,30) NOT NULL,
    "accepted_value" DECIMAL(65,30),
    "status" "NegociationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negociation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiationEvent" (
    "id" SERIAL NOT NULL,
    "nogiciation_id" INTEGER NOT NULL,
    "profile_role_id" INTEGER NOT NULL,
    "event_type" "NegociationEventType" NOT NULL,
    "event_description" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negotiationEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "negociation" ADD CONSTRAINT "negociation_property_listing_id_fkey" FOREIGN KEY ("property_listing_id") REFERENCES "propertyListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociation" ADD CONSTRAINT "negociation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiationEvent" ADD CONSTRAINT "negotiationEvent_nogiciation_id_fkey" FOREIGN KEY ("nogiciation_id") REFERENCES "negociation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiationEvent" ADD CONSTRAINT "negotiationEvent_profile_role_id_fkey" FOREIGN KEY ("profile_role_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
