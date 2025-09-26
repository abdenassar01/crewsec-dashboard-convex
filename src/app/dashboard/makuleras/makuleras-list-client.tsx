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

type Makuleras = Doc<"canceledViolations">;

export function MakulerasListClient() {
  const makulerasList = useQuery(api.canceledViolations.listForCause, { cause: "MAKULERA" });
  const createMakuleras = useMutation(api.canceledViolations.create);
  const updateMakuleras = useMutation(api.canceledViolations.update);
  const deleteMakuleras = useMutation(api.canceledViolations.remove);

  const [editingMakuleras, setEditingMakuleras] = useState<Makuleras | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleCreate = async (data: any) => {
    setIsPending(true);
    try {
      await createMakuleras(data);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error creating makuleras:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdate = async (data: any, isEdit: boolean) => {
    setIsPending(true);
    try {
      if (isEdit && editingMakuleras) {
        await updateMakuleras({ id: editingMakuleras._id, ...data });
        setEditingMakuleras(null);
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Error updating makuleras:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this makuleras?")) {
      try {
        await deleteMakuleras({ id });
      } catch (error) {
        console.error("Error deleting makuleras:", error);
      }
    }
  };

  const handleEdit = (makuleras: Makuleras) => {
    setEditingMakuleras(makuleras);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Makuleras</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
              onSubmit={editingMakuleras ? handleUpdate : handleCreate}
              defaultValues={editingMakuleras}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={getColumns(handleEdit, handleDelete)}
        data={makulerasList || []}
      />
    </div>
  );
}