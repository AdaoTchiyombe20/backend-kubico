/*
  Warnings:

  - The values [CERTIDAO_ESTADO_CIVIL,ESCRITURA_PUBLICA,COMPROVANTE_PAGAMENTO_TAXAS,CONTRATO_ARRIAMENTO] on the enum `DocType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bi_number` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `nif` on the `owners` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocType_new" AS ENUM ('BI', 'NIF', 'SELFIE_WITH_BI', 'COMPROVANTE_RESIDENCIA', 'CERTIDAO_PREDIAL', 'CADERNETA_PREDIAL', 'LICENCA_UTILIZACAO', 'CERTIDAO_NEGATIVA_ONUS', 'CONTRATO_PROMESSA', 'CONTRATO_ARRENDAMENTO');
ALTER TABLE "userMidias" ALTER COLUMN "type_midia" TYPE "DocType_new" USING ("type_midia"::text::"DocType_new");
ALTER TYPE "DocType" RENAME TO "DocType_old";
ALTER TYPE "DocType_new" RENAME TO "DocType";
DROP TYPE "public"."DocType_old";
COMMIT;

-- DropIndex
DROP INDEX "clients_bi_number_key";

-- DropIndex
DROP INDEX "owners_nif_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "bi_number";

-- AlterTable
ALTER TABLE "owners" DROP COLUMN "nif";
