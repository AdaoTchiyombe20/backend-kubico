/*
  Warnings:

  - You are about to drop the column `PROPERTY_SALE` on the `platform_pricing` table. All the data in the column will be lost.
  - Added the required column `name` to the `platform_pricing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "platform_pricing" DROP COLUMN "PROPERTY_SALE",
ADD COLUMN     "name" "PricingNameDescription" NOT NULL;
