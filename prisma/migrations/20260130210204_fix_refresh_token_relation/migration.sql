/*
  Warnings:

  - You are about to drop the column `user_role_id` on the `refresh_tokens` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_user_role_id_fkey";

-- DropIndex
DROP INDEX "refresh_tokens_user_role_id_idx";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "user_role_id",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
