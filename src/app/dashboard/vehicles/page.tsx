import { api } from "@convex/_generated/api";
import { VehicleListClient } from "./vehicle-list-client";
import { preloadQuery } from "convex/nextjs";
import { getToken } from "@/lib/auth-server";

export default async function VehiclesPage() {
  const preloadedVehicles = await preloadQuery(api.vehicles.list, {
    paginationOpts: { numItems: 20, cursor: null },
  }, { token: await getToken() });

  return <VehicleListClient preloadedVehicles={preloadedVehicles} />;
}