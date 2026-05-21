/*
  Warnings:

  - You are about to drop the column `property_ban_status` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `user_ban_status` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties" DROP COLUMN "property_ban_status";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_ban_status";

-- CreateTable
CREATE TABLE "userRestrictionsHistory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "new_ban_status" "UserBanStatus" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "userRestrictionsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyRestrictionsHistory" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "new_ban_status" "ListingRestrictionStatus" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "propertyRestrictionsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userRestrictionsHistory_user_id_changed_at_idx" ON "userRestrictionsHistory"("user_id", "changed_at");

-- CreateIndex
CREATE INDEX "propertyRestrictionsHistory_property_id_changed_at_idx" ON "propertyRestrictionsHistory"("property_id", "changed_at");

-- AddForeignKey
ALTER TABLE "userRestrictionsHistory" ADD CONSTRAINT "userRestrictionsHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyRestrictionsHistory" ADD CONSTRAINT "propertyRestrictionsHistory_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
