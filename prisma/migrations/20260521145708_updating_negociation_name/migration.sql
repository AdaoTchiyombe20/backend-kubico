/*
  Warnings:

  - You are about to drop the `negotiationEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NegociationEventType" AS ENUM ('PROPOSAL', 'ACCEPTANCE', 'REJECTION', 'CANCELLATION', 'OTHER');

-- DropForeignKey
ALTER TABLE "negotiationEvent" DROP CONSTRAINT "negotiationEvent_negotiation_id_fkey";

-- DropForeignKey
ALTER TABLE "negotiationEvent" DROP CONSTRAINT "negotiationEvent_profile_role_id_fkey";

-- DropTable
DROP TABLE "negotiationEvent";

-- DropEnum
DROP TYPE "NegotiationEventType";

-- CreateTable
CREATE TABLE "negociationEvent" (
    "id" SERIAL NOT NULL,
    "negotiation_id" INTEGER NOT NULL,
    "profile_role_id" INTEGER NOT NULL,
    "event_type" "NegociationEventType" NOT NULL,
    "event_description" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "negociationEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "negociationEvent" ADD CONSTRAINT "negociationEvent_negotiation_id_fkey" FOREIGN KEY ("negotiation_id") REFERENCES "negotiation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negociationEvent" ADD CONSTRAINT "negociationEvent_profile_role_id_fkey" FOREIGN KEY ("profile_role_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
