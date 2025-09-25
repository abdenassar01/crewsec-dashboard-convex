"use client";

import * as React from "react";
import { useMutation, usePreloadedQuery } from "convex/react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { Preloaded } from "convex/react";

export function UserListClient({ preloadedUsers }: { preloadedUsers: Preloaded<typeof api.usersAdmin.list> }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<Doc<"users"> | null>(
    null
  );

  const { page, isDone, loadMore } = usePreloadedQuery(preloadedUsers);

  const createUser = useMutation(api.usersAdmin.create);
  const updateUser = useMutation(api.usersAdmin.update);
  const deleteUser = useMutation(api.usersAdmin.deleteUser);

  const columns = React.useMemo(
    () =>
      getColumns(
        (user) => {
          setEditingUser(user);
          setIsDialogOpen(true);
        },
        (userId) => deleteUser({ id: userId })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteUser]
  );

  const handleFormSubmit = async (
    data: Omit<Doc<"users">, "_id" | "_creationTime" | "enabled">
  ) => {
    try {
      if (editingUser) {
        await updateUser({ id: editingUser._id, ...data });
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

  const isLoading = !isDone && page.length === 0;

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
              isPending={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={page ?? []}
        loadMore={loadMore}
        isDone={isDone}
      />
    </div>
  );
}

// Import the getColumns function to keep it local
import { getColumns } from "./columns";