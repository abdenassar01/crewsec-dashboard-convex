"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Doc, Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export const getColumns = (
  onEdit: (user: Doc<"users">) => void,
  onDelete: (userId: Id<"users">) => void
): ColumnDef<Doc<"users">>[] => [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this user?")) {
                onDelete(user._id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];