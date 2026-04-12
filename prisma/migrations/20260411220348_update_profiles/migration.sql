/*
  Warnings:

  - You are about to drop the column `phone` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `person_profiles` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "DocType" ADD VALUE 'PHONE';

-- DropIndex
DROP INDEX "company_profiles_phone_key";

-- DropIndex
DROP INDEX "person_profiles_phone_key";

-- AlterTable
ALTER TABLE "company_profiles" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "person_profiles" DROP COLUMN "phone";
