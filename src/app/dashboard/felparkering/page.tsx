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

type Felparkering = Doc<"canceledViolations">;

export default function FelparkeringList() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingFelparkering, setEditingFelparkering] = React.useState<Felparkering | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const felparkeringar = useQuery(api.canceledViolations.listForCause, { cause: "FELPARKERING" });
  const createFelparkering = useMutation(api.canceledViolations.create);
  const updateFelparkering = useMutation(api.canceledViolations.update);
  const deleteFelparkering = useMutation(api.canceledViolations.remove);

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    setIsPending(true);
    try {
      if (isEdit) {
        if (!editingFelparkering) return;
        await updateFelparkering({ id: editingFelparkering._id, ...data });
        toast.success("Felparkering updated successfully!");
      } else {
        await createFelparkering(data);
        toast.success("New felparkering created!");
      }
      setIsDialogOpen(false);
      setEditingFelparkering(null);
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: Doc<"canceledViolations">["_id"]) => {
    if (confirm("Are you sure you want to delete this felparkering?")) {
      try {
        await deleteFelparkering({ id });
        toast.success("Felparkering deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "An error occurred.");
      }
    }
  };

  const columns = React.useMemo(
    () =>
      getColumns(
        (felparkering) => {
          setEditingFelparkering(felparkering);
          setIsDialogOpen(true);
        },
        handleDelete
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (felparkeringar === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Felparkering Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingFelparkering(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Felparkering</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingFelparkering ? "Edit Felparkering" : "Create Felparkering"}
              </DialogTitle>
            </DialogHeader>
            <CanceledViolationsForm
              onSubmit={handleFormSubmit}
              defaultValues={editingFelparkering}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={felparkeringar || []}
        pageCount={(felparkeringar?.length || 0 / 10) + 1}
        pageIndex={Math.floor((felparkeringar?.length || 0) / 10) - 1}
        pageSize={100}
        setPagination={() => {}} // Not needed with loadMore
        isLoading={felparkeringar === undefined}
      />
    </div>
  );
}