/*
  Warnings:

  - You are about to drop the column `seling_status` on the `properties` table. All the data in the column will be lost.
  - Added the required column `status` to the `propertyListing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('RESERVADO', 'VENDIDO', 'ALUGADO', 'DISPONIVEL');

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "seling_status";

-- AlterTable
ALTER TABLE "propertyListing" ADD COLUMN     "status" "ListingStatus" NOT NULL;
