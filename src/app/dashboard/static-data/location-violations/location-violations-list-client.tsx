"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

interface LocationViolationsListClientProps {
  onEdit: (locationViolation: Doc<"locationViolations"> & {location: Doc<'locations'> | null, violation: Doc<'violations'> | null} ) => void;
  onAdd: () => void;
}

export function LocationViolationsListClient({ onEdit, onAdd }: LocationViolationsListClientProps) {
  const locationViolations = useQuery(api.locationViolations.list);

  return (
    <DataTable
      columns={getColumns(onEdit)}
      data={locationViolations || []}
    />
  );
}