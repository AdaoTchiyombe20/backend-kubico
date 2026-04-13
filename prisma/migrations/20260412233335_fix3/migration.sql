/*
  Warnings:

  - The values [VENDIDO,RESERVADO,ALUGADO] on the enum `Property_purchase` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Property_purchase_new" AS ENUM ('FOR_SALE', 'FOR_RENT');
ALTER TABLE "properties" ALTER COLUMN "type_property_purchase" TYPE "Property_purchase_new" USING ("type_property_purchase"::text::"Property_purchase_new");
ALTER TYPE "Property_purchase" RENAME TO "Property_purchase_old";
ALTER TYPE "Property_purchase_new" RENAME TO "Property_purchase";
DROP TYPE "public"."Property_purchase_old";
COMMIT;
