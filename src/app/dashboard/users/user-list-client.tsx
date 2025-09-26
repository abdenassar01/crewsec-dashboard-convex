"use client";

import * as React from "react";
import { useMutation, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm } from "./user-form";
import { UserFilters, type UserFilters as UserFiltersType } from "./user-filters";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { Preloaded } from "convex/react";

export function UserListClient({ preloadedUsers }: { preloadedUsers: Preloaded<typeof api.users.list> }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<Doc<"users"> | null>(null);
  const [filters, setFilters] = React.useState<UserFiltersType>({
    searchTerm: "",
    role: "",
    enabled: null,
  });

  const { page, isDone, continueCursor } = usePreloadedQuery(preloadedUsers);
  const loadMore = async () => {};

  const createUser = useMutation(api.users.create);
  const updateUser = useMutation(api.users.update);
  const deleteUser = useMutation(api.users.deleteUser);

  const handleDelete = (userId: Doc<"users">["_id"]) => {
    deleteUser({ userId })
      .then(() => toast.success("User deleted."))
      .catch((err) => toast.error(err.message));
  };

  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      role: "",
      enabled: null,
    });
  };

  // Filter results based on filters
  const filteredResults = React.useMemo(() => {
    return page.filter((user) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          user.name?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Role filter
      if (filters.role && user.role !== filters.role) {
        return false;
      }

      // Enabled filter
      if (filters.enabled !== null && user.enabled !== filters.enabled) {
        return false;
      }

      return true;
    });
  }, [page, filters]);

  const filtersComponent = (
    <UserFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onReset={handleResetFilters}
    />
  );

  const columns = React.useMemo(
    () =>
      getColumns(
        (user) => {
          setEditingUser(user);
          setIsDialogOpen(true);
        },
        handleDelete
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    try {
      if (isEdit) {
        if (!editingUser) return;
        await updateUser({
          userId: editingUser._id,
          ...data,
        });
        toast.success("User updated successfully!");
      } else {
        await createUser({
          ...data,
        });
        toast.success("New user created!");
      }
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
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
            <Button>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80svh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
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
        data={filteredResults}
        pageCount={isDone ? (filteredResults.length / 10) : (filteredResults.length / 10) + 1}
        pageIndex={Math.floor(filteredResults.length / 10) - 1}
        pageSize={10}
        setPagination={() => {}} // Not needed with loadMore
        loadMore={!isDone ? loadMore : undefined}
        isLoading={isLoading}
        filters={filtersComponent}
      />
    </div>
  );
}