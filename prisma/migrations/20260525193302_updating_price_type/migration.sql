/*
  Warnings:

  - You are about to drop the column `name` on the `platform_pricing` table. All the data in the column will be lost.
  - Added the required column `PROPERTY_SALE` to the `platform_pricing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PricingNameDescription" AS ENUM ('COMISSÃO_DE_VENDA', 'TAXA_DE_ALUGUEL', 'DESTAQUE_DE_IMÓVEL');

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "platform_pricing" DROP COLUMN "name",
ADD COLUMN     "PROPERTY_SALE" "PricingNameDescription" NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);
