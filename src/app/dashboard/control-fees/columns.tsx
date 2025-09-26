"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontalIcon,  Edit01FreeIcons, Delete01FreeIcons } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Doc } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { HugeiconsIcon } from "@hugeicons/react";

const statusColors = {
  AWAITING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  CONFLICT: "bg-orange-100 text-orange-800",
};

export const getColumns = (
  onEdit: (fee: Doc<"controlFees">) => void,
  onDelete: (feeId: Doc<"controlFees">["_id"]) => void
): ColumnDef<Doc<"controlFees">>[] => [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("reference")}</div>
    ),
  },
  {
    accessorKey: "mark",
    header: "Mark",
    cell: ({ row }) => (
      <div>{row.getValue("mark")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusColors;
      return (
        <Badge className={statusColors[status]}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "townId",
    header: "Town",
    cell: ({ row }) => {
      const towns = useQuery(api.towns.list);
      const town = towns?.find(t => t._id === row.getValue("townId"));
      return <div>{town?.label || "N/A"}</div>;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("startDate")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("endDate")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "isSignsChecked",
    header: "Signs Checked",
    cell: ({ row }) => (
      <div>{row.getValue("isSignsChecked") ? "Yes" : "No"}</div>
    ),
  },
  {
    accessorKey: "isPhotosTaken",
    header: "Photos Taken",
    cell: ({ row }) => (
      <div>{row.getValue("isPhotosTaken") ? "Yes" : "No"}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fee = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
        <HugeiconsIcon  icon={MoreHorizontalIcon} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onEdit(fee)}
            >
              <HugeiconsIcon icon={Edit01FreeIcons} className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(fee._id)}
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