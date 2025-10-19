"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Doc } from "@convex/_generated/dataModel";
import { Edit01FreeIcons, Delete01FreeIcons, MoreHorizontalFreeIcons } from "@hugeicons/core-free-icons";

const statusColors = {
  true: "bg-green-100 text-green-800",
  false: "bg-red-100 text-red-800",
};

export const getColumns = (
  onEdit: (makuleras: Doc<"canceledViolations">) => void,
  onDelete: (makulerasId: Doc<"canceledViolations">["_id"]) => void
): ColumnDef<Doc<"canceledViolations">>[] => [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("reference")}</div>
    ),
  },
  {
    accessorKey: "cause",
    header: "Cause",
    cell: ({ row }) => (
      <div>{row.getValue("cause")}</div>
    ),
  },
  {
    accessorKey: "resolved",
    header: "Status",
    cell: ({ row }) => {
      const resolved = row.getValue("resolved") as boolean;
      return (
        <Badge className={resolved ? statusColors.true : statusColors.false}>
          {resolved ? "Resolved" : "Unresolved"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "parking",
    header: "Parking",
    cell: ({ row }) => {
      const parking = row.getValue("parking") as Doc<"parkings">;
      return <div className="font-mono text-sm">{parking.name}</div>;
    },
  },
  {
    accessorKey: "_creationTime",
    header: "Created Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("_creationTime")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "cause",
    header: "Cause Type",
    cell: ({ row }) => (
      <div>{row.getValue("cause")}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const makuleras = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon icon={MoreHorizontalFreeIcons} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onEdit(makuleras)}
            >
              <HugeiconsIcon icon={Edit01FreeIcons} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(makuleras._id)}
              className="text-destructive"
            >
              <HugeiconsIcon icon={Delete01FreeIcons} className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];