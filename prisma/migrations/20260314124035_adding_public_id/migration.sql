/*
  Warnings:

  - Added the required column `public_id` to the `profile_medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profile_medias" ADD COLUMN     "public_id" TEXT NOT NULL;
