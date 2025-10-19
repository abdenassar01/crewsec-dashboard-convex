"use client";

import * as React from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleForm } from "./vehicle-form";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

export default function VehicleList() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] = React.useState<Doc<"vehicles"> | null>(null);

  const vehicles = useQuery(api.vehicles.list);

  const createVehicle = useMutation(api.vehicles.create);
  const updateVehicle = useMutation(api.vehicles.update);
  const deleteVehicle = useMutation(api.vehicles.deleteVehicle);

  const handleDelete = (vehicleId: Doc<"vehicles">["_id"]) => {
    deleteVehicle({ id: vehicleId })
      .then(() => toast.success("Vehicle deleted."))
      .catch((err) => toast.error(err.message));
  };

  const columns = React.useMemo(
    () =>
      getColumns(
        (vehicle) => {
          setEditingVehicle(vehicle);
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
        if (!editingVehicle) return;
        await updateVehicle({
          id: editingVehicle._id,
          ...data,
        });
        toast.success("Vehicle updated successfully!");
      } else {
        await createVehicle({
          ...data,
        });
        toast.success("New vehicle created!");
      }
      setIsDialogOpen(false);
      setEditingVehicle(null);
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    }
  };

  if (vehicles === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="space-y-4 mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicle Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingVehicle(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Vehicle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80svh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Create New Vehicle"}</DialogTitle>
            </DialogHeader>
            <VehicleForm
              onSubmit={handleFormSubmit}
              defaultValues={editingVehicle ?? undefined}
              isPending={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {vehicles && (
        <DataTable
        columns={columns}
        data={vehicles.page}
        pageCount={(vehicles?.length / 10) + 1}
        pageIndex={Math.floor(vehicles?.length / 10) - 1}
        pageSize={100}
        setPagination={() => {}} // Not needed with loadMore
        isLoading={vehicles === undefined}
      />
      )}
    </div>
  );
}