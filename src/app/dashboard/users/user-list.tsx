"use client";

import * as React from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { UserForm } from "./user-form";
import { getColumns } from "./columns";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@convex/_generated/api";

interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "EMPLOYER" | "ADMIN";
  enabled?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export function UserList() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<BetterAuthUser | null>(null);

  const { results, status, loadMore } = usePaginatedQuery(
    api.users.list,
    {},
    { initialNumItems: 10 }
  );

  const createUser = useMutation(api.users.create);
  const updateUser = useMutation(api.users.update);
  const deleteUser = useMutation(api.users.deleteUser);

  const columns = React.useMemo(
    () =>
      getColumns(
        (user) => {
          setEditingUser(user);
          setIsDialogOpen(true);
        },
        (userId) => deleteUser({ userId })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteUser]
  );

  const handleFormSubmit = async (
    data: Omit<BetterAuthUser, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingUser) {
        await updateUser({ userId: editingUser.id, ...data });
        toast.success("User updated!");
      } else {
        await createUser(data);
        toast.success("User created!");
      }
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const isLoading = status === "LoadingFirstPage";

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingUser(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={handleFormSubmit}
              defaultValues={editingUser ?? undefined}
              isPending={false} // You might want to derive this from mutation statuses
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={results ?? []}
        onLoadMore={loadMore}
        isDone={status !== "CanLoadMore"}
      />
    </div>
  );
}