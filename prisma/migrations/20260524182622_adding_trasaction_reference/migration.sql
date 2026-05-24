/*
  Warnings:

  - Made the column `transaction_reference` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "released_amount" DECIMAL(65,30),
ADD COLUMN     "released_by" INTEGER,
ALTER COLUMN "transaction_reference" SET NOT NULL;
