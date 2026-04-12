/*
  Warnings:

  - Added the required column `public_id` to the `propertyMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "propertyMedia" ADD COLUMN     "public_id" TEXT NOT NULL;
