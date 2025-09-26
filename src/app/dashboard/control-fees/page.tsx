import { api } from "@convex/_generated/api";
import { ControlFeeListClient } from "./control-fee-list-client";
import { preloadQuery } from "convex/nextjs";
import { getToken } from "@/lib/auth-server";

export default async function ControlFeesPage() {
  const preloadedControlFees = await preloadQuery(api.controlFees.list, {
    paginationOpts: { numItems: 20, cursor: null },
    townId: undefined,
    violationId: undefined,
  }, { token: await getToken() });

  return <ControlFeeListClient preloadedControlFees={preloadedControlFees} />;
}