"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
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
import { Delete01FreeIcons, Edit01FreeIcons, MoreHorizontalCircle01FreeIcons } from "@hugeicons/core-free-icons";

type VehicleWithParking = Doc<"vehicles"> & {
  parking?: Doc<"parkings">;
};

export const getColumns = (
  onEdit: (vehicle: VehicleWithParking) => void,
  onDelete: (vehicleId: Doc<"vehicles">["_id"]) => void
): ColumnDef<VehicleWithParking>[] => [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("reference")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Vehicle Name",
    cell: ({ row }) => (
      <div>{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "parking.name",
    header: "Parking",
    cell: ({ row }) => (
      <div>{row.original.parking?.name || "N/A"}</div>
    ),
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("joinDate")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "leaveDate",
    header: "Leave Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("leaveDate")).toLocaleDateString()}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vehicle = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <HugeiconsIcon icon={MoreHorizontalCircle01FreeIcons} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onEdit(vehicle)}
            >
              <HugeiconsIcon icon={Edit01FreeIcons} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(vehicle._id)}
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