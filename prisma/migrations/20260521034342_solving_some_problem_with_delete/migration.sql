-- DropForeignKey
ALTER TABLE "company_profiles" DROP CONSTRAINT "company_profiles_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "person_profiles" DROP CONSTRAINT "person_profiles_profile_id_fkey";

-- AddForeignKey
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
