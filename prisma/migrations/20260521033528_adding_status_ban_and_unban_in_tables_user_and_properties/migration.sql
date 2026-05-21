-- CreateEnum
CREATE TYPE "UserBanStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "ListingRestrictionStatus" AS ENUM ('UNBANNED', 'SUSPENDED', 'BANNED');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "property_ban_status" "ListingRestrictionStatus" NOT NULL DEFAULT 'UNBANNED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "user_ban_status" "UserBanStatus" NOT NULL DEFAULT 'ACTIVE';
