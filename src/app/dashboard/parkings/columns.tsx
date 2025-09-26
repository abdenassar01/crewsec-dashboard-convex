"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalFreeIcons } from "@hugeicons/core-free-icons";
import type { Doc } from "@convex/_generated/dataModel";

export type ParkingWithUser = Doc<"parkings"> & {
  user: Doc<"users"> | null;
};

export const getColumns = (
  onEdit: (parking: ParkingWithUser) => void,
  onAnonymize: (parkingId: Doc<"parkings">["_id"]) => void
): ColumnDef<ParkingWithUser>[] => [
  {
    accessorKey: "imageStorageId",
    header: "Image",
    cell: ({ row }) => {
      const parking = row.original;
      if (parking.imageStorageId) {
        return (
          <img
            src={`/api/storage/${parking.imageStorageId}`}
            alt={parking.name}
            className="w-12 h-12 object-cover rounded-md"
          />
        );
      }
      return (
        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
          No Image
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Parking Name",
  },
  {
    accessorFn: (row) => row.user?.email,
    header: "Assigned User",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
   {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => (
      <a href={row.original.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        Link
      </a>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const parking = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(parking._id)}>
              Copy Parking ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(parking)}>
              Edit Parking
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => onAnonymize(parking._id)}
            >
              Anonymize & Close
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];