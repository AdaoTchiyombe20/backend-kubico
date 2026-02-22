/*
  Warnings:

  - The values [BI_FRONT,BI_BACK] on the enum `DocType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `foundation_date` on the `company_profiles` table. All the data in the column will be lost.
  - Added the required column `nameOfRepresentative` to the `company_profiles` table without a default value. This is not possible if the table is not empty.
  - Made the column `bank_account` on table `company_profiles` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `role` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProfileRoles" AS ENUM ('CLIENT', 'OWNER', 'NORMAL', 'ADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "DocType_new" AS ENUM ('BI', 'NIF', 'SELFIE_WITH_BI', 'COMPROVANTE_RESIDENCIA', 'CERTIDAO_PREDIAL', 'CADERNETA_PREDIAL', 'LICENCA_UTILIZACAO', 'CERTIDAO_NEGATIVA_ONUS', 'CONTRATO_PROMESSA', 'CONTRATO_ARRENDAMENTO', 'PROFILE_PHOTO', 'CERTIDAO_COMERCIAL');
ALTER TABLE "profile_medias" ALTER COLUMN "type" TYPE "DocType_new" USING ("type"::text::"DocType_new");
ALTER TYPE "DocType" RENAME TO "DocType_old";
ALTER TYPE "DocType_new" RENAME TO "DocType";
DROP TYPE "public"."DocType_old";
COMMIT;

-- AlterTable
ALTER TABLE "company_profiles" DROP COLUMN "foundation_date",
ADD COLUMN     "nameOfRepresentative" TEXT NOT NULL,
ALTER COLUMN "bank_account" SET NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "role",
ADD COLUMN     "role" "ProfileRoles" NOT NULL;

-- DropEnum
DROP TYPE "UserRoles";

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_key" ON "roles"("role");
