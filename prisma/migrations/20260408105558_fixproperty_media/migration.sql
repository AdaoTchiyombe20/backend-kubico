/*
  Warnings:

  - You are about to drop the `propertiyMedia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "propertiyMedia" DROP CONSTRAINT "propertiyMedia_property_id_fkey";

-- DropTable
DROP TABLE "propertiyMedia";

-- CreateTable
CREATE TABLE "propertyMedia" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "type" "MediaTypes" NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propertyMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "propertyMedia" ADD CONSTRAINT "propertyMedia_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
