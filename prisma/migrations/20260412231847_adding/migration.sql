/*
  Warnings:

  - You are about to drop the column `property_purchase` on the `properties` table. All the data in the column will be lost.
  - Added the required column `type_property_purchase` to the `properties` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "property_purchase",
ADD COLUMN     "type_property_purchase" "Property_purchase" NOT NULL;
