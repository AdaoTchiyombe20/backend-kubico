-- CreateTable
CREATE TABLE "Scheduling_visits" (
    "id" SERIAL NOT NULL,
    "property_listing_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheduling_visits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Scheduling_visits" ADD CONSTRAINT "Scheduling_visits_property_listing_id_fkey" FOREIGN KEY ("property_listing_id") REFERENCES "propertyListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scheduling_visits" ADD CONSTRAINT "Scheduling_visits_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
