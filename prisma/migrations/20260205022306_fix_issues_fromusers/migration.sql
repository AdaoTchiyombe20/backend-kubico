/*
  Warnings:

  - The values [SUPERADMIN] on the enum `AccessLevel` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deleted_at` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `bi` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `bi` on the `owners` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `owners` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `owners` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `owners` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `user_roles` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `user_roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bi_number]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bi_number]` on the table `owners` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bi_number` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bi_url` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bank_acount` to the `owners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_type` to the `owners` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRoleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('BI_FRENTE', 'BI_VERSO', 'SELFIE_WITH_BI', 'COMPROVANTE_RESIDENCIA', 'CERTIDAO_ESTADO_CIVIL', 'CERTIDAO_PREDIAL', 'CADERNETA_PREDIAL', 'LICENCA_UTILIZACAO', 'CERTIDAO_NEGATIVA_ONUS', 'CONTRATO_PROMESSA', 'ESCRITURA_PUBLICA', 'COMPROVANTE_PAGAMENTO_TAXAS', 'CONTRATO_ARRIAMENTO');

-- AlterEnum
BEGIN;
CREATE TYPE "AccessLevel_new" AS ENUM ('NORMAL', 'SUPER_ADMIN');
ALTER TABLE "public"."admins" ALTER COLUMN "access_level" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "access_level" TYPE "AccessLevel_new" USING ("access_level"::text::"AccessLevel_new");
ALTER TYPE "AccessLevel" RENAME TO "AccessLevel_old";
ALTER TYPE "AccessLevel_new" RENAME TO "AccessLevel";
DROP TYPE "public"."AccessLevel_old";
ALTER TABLE "admins" ALTER COLUMN "access_level" SET DEFAULT 'NORMAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropIndex
DROP INDEX "admins_user_role_id_idx";

-- DropIndex
DROP INDEX "clients_bi_idx";

-- DropIndex
DROP INDEX "clients_bi_key";

-- DropIndex
DROP INDEX "clients_user_role_id_idx";

-- DropIndex
DROP INDEX "owners_bi_key";

-- DropIndex
DROP INDEX "owners_nif_idx";

-- DropIndex
DROP INDEX "owners_user_role_id_idx";

-- DropIndex
DROP INDEX "user_roles_role_id_idx";

-- DropIndex
DROP INDEX "user_roles_user_id_idx";

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "deleted_at",
DROP COLUMN "is_active";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "bi",
DROP COLUMN "deleted_at",
DROP COLUMN "is_active",
ADD COLUMN     "bi_number" TEXT NOT NULL,
ADD COLUMN     "bi_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "owners" DROP COLUMN "bi",
DROP COLUMN "deleted_at",
DROP COLUMN "is_active",
DROP COLUMN "tipo",
ADD COLUMN     "bank_acount" TEXT NOT NULL,
ADD COLUMN     "bi_number" TEXT,
ADD COLUMN     "bi_url" TEXT,
ADD COLUMN     "company_name" TEXT,
ADD COLUMN     "owner_type" "TypeOfOwner" NOT NULL;

-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "deleted_at",
DROP COLUMN "is_active",
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" INTEGER,
ADD COLUMN     "status" "UserRoleStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "userDocs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "doc_type" "DocType" NOT NULL,
    "url" TEXT NOT NULL,
    "create_At" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userDocs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_bi_number_key" ON "clients"("bi_number");

-- CreateIndex
CREATE UNIQUE INDEX "owners_bi_number_key" ON "owners"("bi_number");

-- AddForeignKey
ALTER TABLE "userDocs" ADD CONSTRAINT "userDocs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
