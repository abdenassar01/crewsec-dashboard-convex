"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "EMPLOYER" | "ADMIN";
  enabled?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export const getColumns = (
  onEdit: (user: BetterAuthUser) => void,
  onDelete: (userId: string) => void
): ColumnDef<BetterAuthUser>[] => [
  {
    accessorKey: "id",
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
    cell: () => "N/A", // Better Auth users might not have phone number
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
                onDelete(user.id);
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