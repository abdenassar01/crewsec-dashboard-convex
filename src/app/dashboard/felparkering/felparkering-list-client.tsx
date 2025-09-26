"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { getColumns } from "./columns";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { CanceledViolationsForm } from "./canceled-violations-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Doc } from "@convex/_generated/dataModel";

type Felparkering = Doc<"canceledViolations">;

export function FelparkeringListClient() {
  const felparkeringar = useQuery(api.canceledViolations.listForCause, { cause: "FELPARKERING" });
  const createFelparkering = useMutation(api.canceledViolations.create);
  const updateFelparkering = useMutation(api.canceledViolations.update);
  const deleteFelparkering = useMutation(api.canceledViolations.remove);

  const [editingFelparkering, setEditingFelparkering] = useState<Felparkering | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleCreate = async (data: any) => {
    setIsPending(true);
    try {
      await createFelparkering(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating felparkering:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdate = async (data: any, isEdit: boolean) => {
    setIsPending(true);
    try {
      if (isEdit && editingFelparkering) {
        await updateFelparkering({ id: editingFelparkering._id, ...data });
        setEditingFelparkering(null);
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Error updating felparkering:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this felparkering?")) {
      try {
        await deleteFelparkering({ id });
      } catch (error) {
        console.error("Error deleting felparkering:", error);
      }
    }
  };

  const handleEdit = (felparkering: Felparkering) => {
    setEditingFelparkering(felparkering);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Felparkering</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
              onSubmit={editingFelparkering ? handleUpdate : handleCreate}
              defaultValues={editingFelparkering}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={getColumns(handleEdit, handleDelete)}
        data={felparkeringar || []}
      />
    </div>
  );
}