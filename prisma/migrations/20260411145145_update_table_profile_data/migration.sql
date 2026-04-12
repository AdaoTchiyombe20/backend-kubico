/*
  Warnings:

  - You are about to drop the `profile_medias` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `company_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `person_profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "profile_medias" DROP CONSTRAINT "profile_medias_profile_id_fkey";

-- DropTable
DROP TABLE "profile_medias";

-- CreateTable
CREATE TABLE "profile_data" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "type" "DocType" NOT NULL,
    "document_number" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "inserted_in" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "profile_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_data_profile_id_type_idx" ON "profile_data"("profile_id", "type");

-- CreateIndex
CREATE INDEX "profile_data_profile_id_type_is_current_idx" ON "profile_data"("profile_id", "type", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "profile_data_type_document_number_key" ON "profile_data"("type", "document_number");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_phone_key" ON "company_profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "person_profiles_phone_key" ON "person_profiles"("phone");

-- AddForeignKey
ALTER TABLE "profile_data" ADD CONSTRAINT "profile_data_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
