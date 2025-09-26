"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Doc } from "@convex/_generated/dataModel";
import { Edit01FreeIcons } from "@hugeicons/core-free-icons";

export const getColumns = (
  onEdit: (locationViolation: Doc<"locationViolations">) => void
): ColumnDef<Doc<"locationViolations">>[] => [
  {
    accessorKey: "_id",
    header: "Location ID",
    cell: ({ row }) => (
      <div className="font-medium font-mono text-sm">{row.getValue("_id")}</div>
    ),
  },
  {
    accessorKey: "label",
    header: "Location Name",
    cell: ({ row }) => (
      <div>{row.getValue("label")}</div>
    ),
  },
  {
    accessorKey: "_creationTime",
    header: "Created",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("_creationTime")).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const locationViolation = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon icon={Edit01FreeIcons} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onEdit(locationViolation)}
            >
              <HugeiconsIcon icon={Edit01FreeIcons} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];