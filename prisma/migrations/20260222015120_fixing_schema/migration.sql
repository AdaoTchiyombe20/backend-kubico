/*
  Warnings:

  - You are about to drop the column `nameOfRepresentative` on the `company_profiles` table. All the data in the column will be lost.
  - Added the required column `nameOfLegalRepresentative` to the `company_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocType" ADD VALUE 'BI_REPRESENTANTE';
ALTER TYPE "DocType" ADD VALUE 'COMPROVATIVO_TITULARIDADE_CONTA_BANCARIA';

-- AlterTable
ALTER TABLE "company_profiles" DROP COLUMN "nameOfRepresentative",
ADD COLUMN     "nameOfLegalRepresentative" TEXT NOT NULL,
ALTER COLUMN "bank_account" DROP NOT NULL;
