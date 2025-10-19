"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { CanceledViolationsForm } from "./canceled-violations-form";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

type Makuleras = Doc<"canceledViolations">;

export default function MakulerasList() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingMakuleras, setEditingMakuleras] = React.useState<Makuleras | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const makulerasList = useQuery(api.canceledViolations.listForCause, { cause: "MAKULERA" });
  const createMakuleras = useMutation(api.canceledViolations.create);
  const updateMakuleras = useMutation(api.canceledViolations.update);
  const deleteMakuleras = useMutation(api.canceledViolations.remove);

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    setIsPending(true);
    try {
      if (isEdit) {
        if (!editingMakuleras) return;
        await updateMakuleras({ id: editingMakuleras._id, ...data });
        toast.success("Makuleras updated successfully!");
      } else {
        await createMakuleras(data);
        toast.success("New makuleras created!");
      }
      setIsDialogOpen(false);
      setEditingMakuleras(null);
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: Doc<"canceledViolations">["_id"]) => {
    if (confirm("Are you sure you want to delete this makuleras?")) {
      try {
        await deleteMakuleras({ id });
        toast.success("Makuleras deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "An error occurred.");
      }
    }
  };

  const columns = React.useMemo(
    () =>
      getColumns(
        (makuleras) => {
          setEditingMakuleras(makuleras);
          setIsDialogOpen(true);
        },
        handleDelete
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (makulerasList === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Makuleras Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingMakuleras(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Makuleras</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMakuleras ? "Edit Makuleras" : "Create Makuleras"}
              </DialogTitle>
            </DialogHeader>
            <CanceledViolationsForm
              onSubmit={handleFormSubmit}
              defaultValues={editingMakuleras}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={makulerasList || []}
        pageCount={(makulerasList?.length || 0 / 10) + 1}
        pageIndex={Math.floor((makulerasList?.length || 0) / 10) - 1}
        pageSize={100}
        setPagination={() => {}} // Not needed with loadMore
        isLoading={makulerasList === undefined}
      />
    </div>
  );
}