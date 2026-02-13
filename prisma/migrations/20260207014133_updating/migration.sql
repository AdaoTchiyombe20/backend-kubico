/*
  Warnings:

  - You are about to drop the column `bi_number` on the `owners` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "DocType" ADD VALUE 'NIF';

-- DropIndex
DROP INDEX "owners_bi_number_key";

-- AlterTable
ALTER TABLE "owners" DROP COLUMN "bi_number";

-- AlterTable
ALTER TABLE "userMidias" ADD COLUMN     "document_number" TEXT;
