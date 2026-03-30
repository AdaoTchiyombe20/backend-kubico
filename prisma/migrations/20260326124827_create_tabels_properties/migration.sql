/*
  Warnings:

  - The values [SELFIE_WITH_BI,COMPROVANTE_RESIDENCIA,CERTIDAO_PREDIAL,CADERNETA_PREDIAL,LICENCA_UTILIZACAO,CERTIDAO_NEGATIVA_ONUS,CONTRATO_PROMESSA,CERTIDAO_COMERCIAL,BI_REPRESENTANTE,COMPROVATIVO_TITULARIDADE_CONTA_BANCARIA,DOC_COMPROVANTE_REPRESENTANTE_LEGAL_EMPRESA] on the enum `DocType` will be removed. If these variants are still used in the database, this will fail.
  - The values [NORMAL] on the enum `ProfileRoles` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bank_account` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `nameOfLegalRepresentative` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `nif` on the `company_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `public_id` on the `profile_medias` table. All the data in the column will be lost.
  - You are about to drop the column `uploaded_at` on the `profile_medias` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `profile_medias` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `profile_roles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type,document_number]` on the table `profile_medias` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminsName` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Made the column `document_number` on table `profile_medias` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TypeProperties" AS ENUM ('APARTAMENTO', 'VIVENDA', 'ESCRITORIO', 'FAZENDA', 'TERRENO');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DISPONIVEL', 'RESERVADO', 'ALUGADO', 'VENDIDO', 'INATIVO');

-- CreateEnum
CREATE TYPE "MediaTypes" AS ENUM ('IMAGEM', 'VIDEO');

-- CreateEnum
CREATE TYPE "CompartmentsTypes" AS ENUM ('QUARTO', 'SALA_DE_ESTAR', 'SALA_DE_LAZER', 'ESCRITORIO', 'QUARTO_DE_BANHO', 'COZINHA', 'LAVANDARIA', 'GARAGEM');

-- AlterEnum
BEGIN;
CREATE TYPE "DocType_new" AS ENUM ('BI', 'NIF', 'CONTA_BANCARIA', 'PROFILE_PHOTO', 'CONTRATO_VENDA', 'CONTRATO_ARRENDAMENTO');
ALTER TABLE "profile_medias" ALTER COLUMN "type" TYPE "DocType_new" USING ("type"::text::"DocType_new");
ALTER TYPE "DocType" RENAME TO "DocType_old";
ALTER TYPE "DocType_new" RENAME TO "DocType";
DROP TYPE "public"."DocType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProfileRoles_new" AS ENUM ('CLIENT', 'OWNER', 'ADMIN');
ALTER TABLE "roles" ALTER COLUMN "role" TYPE "ProfileRoles_new" USING ("role"::text::"ProfileRoles_new");
ALTER TYPE "ProfileRoles" RENAME TO "ProfileRoles_old";
ALTER TYPE "ProfileRoles_new" RENAME TO "ProfileRoles";
DROP TYPE "public"."ProfileRoles_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "profile_roles" DROP CONSTRAINT "profile_roles_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropIndex
DROP INDEX "company_profiles_nif_key";

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "adminsName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "company_profiles" DROP COLUMN "bank_account",
DROP COLUMN "nameOfLegalRepresentative",
DROP COLUMN "nif";

-- AlterTable
ALTER TABLE "profile_medias" DROP COLUMN "public_id",
DROP COLUMN "uploaded_at",
DROP COLUMN "url",
ADD COLUMN     "inserted_in" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "document_number" SET NOT NULL;

-- AlterTable
ALTER TABLE "profile_roles" DROP COLUMN "approved_by";

-- CreateTable
CREATE TABLE "properties" (
    "id" SERIAL NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type_of_property" "TypeProperties" NOT NULL,
    "description" TEXT NOT NULL,
    "status_property" "PropertyStatus" NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" INTEGER NOT NULL,
    "total_area" INTEGER,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyHistory" (
    "id" SERIAL NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "id_property" INTEGER NOT NULL,
    "last_status" "PropertyStatus" NOT NULL,
    "new_status" "PropertyStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "propertyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertiyMedia" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "type" "MediaTypes" NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propertiyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyLocalization" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "latitude" INTEGER NOT NULL,
    "longitude" INTEGER NOT NULL,
    "address_info" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,

    CONSTRAINT "propertyLocalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyCompartments" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "CompartmentsTypes" NOT NULL,

    CONSTRAINT "propertyCompartments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_medias_type_document_number_key" ON "profile_medias"("type", "document_number");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyHistory" ADD CONSTRAINT "propertyHistory_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyHistory" ADD CONSTRAINT "propertyHistory_id_property_fkey" FOREIGN KEY ("id_property") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertiyMedia" ADD CONSTRAINT "propertiyMedia_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyLocalization" ADD CONSTRAINT "propertyLocalization_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyCompartments" ADD CONSTRAINT "propertyCompartments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
