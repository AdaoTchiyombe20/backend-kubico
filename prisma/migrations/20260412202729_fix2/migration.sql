-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CompartmentsTypes" ADD VALUE 'VARANDA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'CLOSET';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'DESPENSA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'HALL_DE_ENTRADA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'SALA_DE_JANTAR';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'BIBLIOTECA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'QUARTO_DE_VISITAS';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'SUITE_PRINCIPAL';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'ADEGA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'QUARTO_DE_EMPREGADOS';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'RECEPCAO';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'SALA_DE_REUNIOES';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'AUDITORIO';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'LOJA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'ARMAZEM';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'CANTINA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'GINASIO';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'SPA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'PISCINA';
ALTER TYPE "CompartmentsTypes" ADD VALUE 'TERRAÇO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyStatus" ADD VALUE 'EM_CONSTRUCAO';
ALTER TYPE "PropertyStatus" ADD VALUE 'EM_RENOVACAO';
ALTER TYPE "PropertyStatus" ADD VALUE 'EM_NEGOCIACAO';
ALTER TYPE "PropertyStatus" ADD VALUE 'PENDENTE_DOCUMENTACAO';
ALTER TYPE "PropertyStatus" ADD VALUE 'AGUARDANDO_PAGAMENTO';
ALTER TYPE "PropertyStatus" ADD VALUE 'EM_LEILAO';
ALTER TYPE "PropertyStatus" ADD VALUE 'HIPOTECADO';
ALTER TYPE "PropertyStatus" ADD VALUE 'BLOQUEADO';
ALTER TYPE "PropertyStatus" ADD VALUE 'DESATIVADO_TEMPORARIAMENTE';
ALTER TYPE "PropertyStatus" ADD VALUE 'PUBLICADO';
ALTER TYPE "PropertyStatus" ADD VALUE 'NAO_PUBLICADO';
ALTER TYPE "PropertyStatus" ADD VALUE 'EM_ANALISE';
ALTER TYPE "PropertyStatus" ADD VALUE 'CANCELADO';
ALTER TYPE "PropertyStatus" ADD VALUE 'TRANSFERIDO';
ALTER TYPE "PropertyStatus" ADD VALUE 'OCUPADO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TypeProperties" ADD VALUE 'LOJA';
ALTER TYPE "TypeProperties" ADD VALUE 'ARMAZEM';
ALTER TYPE "TypeProperties" ADD VALUE 'HOTEL';
ALTER TYPE "TypeProperties" ADD VALUE 'PENTHOUSE';
ALTER TYPE "TypeProperties" ADD VALUE 'DUPLEX';
ALTER TYPE "TypeProperties" ADD VALUE 'TRIPLEX';
ALTER TYPE "TypeProperties" ADD VALUE 'QUARTO';
ALTER TYPE "TypeProperties" ADD VALUE 'SUITE';
ALTER TYPE "TypeProperties" ADD VALUE 'CONDOMINIO';
ALTER TYPE "TypeProperties" ADD VALUE 'RESORT';
ALTER TYPE "TypeProperties" ADD VALUE 'HOSPITAL';
ALTER TYPE "TypeProperties" ADD VALUE 'ESCOLA';
ALTER TYPE "TypeProperties" ADD VALUE 'RESTAURANTE';
ALTER TYPE "TypeProperties" ADD VALUE 'CINEMA';
ALTER TYPE "TypeProperties" ADD VALUE 'SHOPPING';

-- DropForeignKey
ALTER TABLE "propertyCompartments" DROP CONSTRAINT "propertyCompartments_property_id_fkey";

-- DropForeignKey
ALTER TABLE "propertyLocalization" DROP CONSTRAINT "propertyLocalization_property_id_fkey";

-- DropForeignKey
ALTER TABLE "propertyMedia" DROP CONSTRAINT "propertyMedia_property_id_fkey";

-- AlterTable
ALTER TABLE "propertyLocalization" ALTER COLUMN "latitude" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "longitude" SET DATA TYPE DECIMAL(65,30);

-- AddForeignKey
ALTER TABLE "propertyMedia" ADD CONSTRAINT "propertyMedia_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyLocalization" ADD CONSTRAINT "propertyLocalization_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyCompartments" ADD CONSTRAINT "propertyCompartments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
