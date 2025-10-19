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
  onEdit: (locationViolation: Doc<"locationViolations"> & {location: Doc<'locations'> | null, violation: Doc<'violations'> | null}) => void
): ColumnDef<Doc<"locationViolations"> & {location: Doc<'locations'> | null, violation: Doc<'violations'> | null}>[] => [
  {
    accessorKey: "violation",
    header: "Violation",
    cell: ({ row }) => {
      const violation = row.getValue("violation") as Doc<"violations"> | null;
      return <div className="font-medium">{violation?.label || "Unknown Violation"}</div>;
    },
  },
  {
    accessorKey: "locationName",
    header: "Location Name",
    cell: ({ row }) => {
      const location = row.getValue("location") as Doc<"locations"> | null;
      return <div className="font-medium">{location?.label || "Unknown Location"}</div>;
    },
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