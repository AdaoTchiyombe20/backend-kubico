/*
  Warnings:

  - Added the required column `property_purchase` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Property_purchase" AS ENUM ('VENDIDO', 'RESERVADO', 'ALUGADO');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "property_purchase" "Property_purchase" NOT NULL;
