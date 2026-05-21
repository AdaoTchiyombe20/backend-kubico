-- DropForeignKey
ALTER TABLE "negotiation" DROP CONSTRAINT "negotiation_owner_id_fkey";

-- AlterTable
ALTER TABLE "userRestrictionsHistory" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "negotiation" ADD CONSTRAINT "negotiation_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
