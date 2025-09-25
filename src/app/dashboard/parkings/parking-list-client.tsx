"use client";
import { useMutation, usePreloadedQuery } from "convex/react";
import { ParkingList } from "./parking-list";
import { api } from "@convex/_generated/api";
import type { Preloaded } from "convex/react";

export function ParkingListClient({
  preloadedResults,
  preloadedAvailability,
}: {
  preloadedResults: Preloaded<typeof api.parkings.list>;
  preloadedAvailability: Preloaded<typeof api.parkings.getAvailabilityByDateRange>;
}) {
  const { page: results, isDone, continueCursor  } = usePreloadedQuery(preloadedResults);
  const availabilityData = usePreloadedQuery(preloadedAvailability);

  const createUserAndParking = useMutation(api.parkings.createUserAndParking);
  const updateParking = useMutation(api.parkings.update);
  const anonymizeParking = useMutation(api.parkings.anonymizeParking);

  // Create a wrapper function that matches the expected interface
  const getAvailabilityByDateRange = async (args: { startDate: number; endDate: number; parkingId?: string }) => {
    // For SSR, we return the preloaded data. In a real app, you might want to
    // fetch fresh data when the arguments change
    return availabilityData;
  };

  return <ParkingList
    results={results}
    status={isDone ? "done" : "loading"}
    loadMore={async () => { }}
    createUserAndParking={createUserAndParking}
    updateParking={updateParking}
    anonymizeParking={anonymizeParking}
    getAvailabilityByDateRange={getAvailabilityByDateRange}
  />;
}