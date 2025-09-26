"use client";

import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

interface TownsListClientProps {
  onEdit: (town: Doc<"towns">) => void;
  onAdd: () => void;
}

export function TownsListClient({ onEdit, onAdd }: TownsListClientProps) {
  const towns = useQuery(api.towns.list);

  return (
    <DataTable
      columns={getColumns(onEdit)}
      data={towns || []}
    />
  );
}