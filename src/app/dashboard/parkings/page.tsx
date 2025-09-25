import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { ParkingListClient } from "./parking-list-client";
import { getToken } from "@/lib/auth-server";

export default async function ParkingsPage() {

  const preloadedResults = await preloadQuery(api.parkings.list, { paginationOpts: { cursor: null, numItems: 20 } }, { token: await getToken() });

  const preloadedAvailability = await preloadQuery(api.parkings.getAvailabilityByDateRange, {
    endDate: Date.now(),
    startDate: Date.now() - 1000 * 60 * 60 * 24 * 30
  }, { token: await getToken() });

  return <ParkingListClient
    preloadedResults={preloadedResults}
    preloadedAvailability={preloadedAvailability}
  />;
}