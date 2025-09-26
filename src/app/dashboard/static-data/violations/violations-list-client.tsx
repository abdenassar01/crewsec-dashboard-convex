"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

interface ViolationsListClientProps {
  onEdit: (violation: Doc<"violations">) => void;
  onAdd: () => void;
}

export function ViolationsListClient({ onEdit, onAdd }: ViolationsListClientProps) {
  const violations = useQuery(api.violations.list);

  return (
    <DataTable
      columns={getColumns(onEdit)}
      data={violations || []}
    />
  );
}