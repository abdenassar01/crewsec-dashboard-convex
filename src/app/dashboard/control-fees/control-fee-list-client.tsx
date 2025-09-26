"use client";

import * as React from "react";
import { useMutation, usePreloadedQuery } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ControlFeeForm } from "./control-fee-form";
import { getColumns } from "./columns";
import { ControlFeeFilters, type ControlFeeFilters as ControlFeeFiltersType } from "./control-fee-filters";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { Preloaded } from "convex/react";

export function ControlFeeListClient({ preloadedControlFees }: { preloadedControlFees: Preloaded<typeof api.controlFees.list> }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingControlFee, setEditingControlFee] = React.useState<Doc<"controlFees"> | null>(null);
  const [filters, setFilters] = React.useState<ControlFeeFiltersType>({
    townId: "",
    violationId: "",
  });

  const controlFeesData = usePreloadedQuery(preloadedControlFees);
  const loadMore = async () => {};

  const createControlFee = useMutation(api.controlFees.create);
  const updateControlFee = useMutation(api.controlFees.update);
  const deleteControlFee = useMutation(api.controlFees.deleteFee);

  const handleDelete = (feeId: Doc<"controlFees">["_id"]) => {
    deleteControlFee({ id: feeId })
      .then(() => toast.success("Control fee deleted."))
      .catch((err) => toast.error(err.message));
  };

  const handleFiltersChange = (newFilters: ControlFeeFiltersType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      townId: "",
      violationId: "",
    });
  };

  // Filter results based on filters
  const filteredResults = React.useMemo(() => {
    const fees = Array.isArray(controlFeesData) ? controlFeesData : controlFeesData?.page || [];
    return fees.filter((fee) => {
      // Town filter
      if (filters.townId && fee.townId !== filters.townId) {
        return false;
      }

      // Violation filter
      if (filters.violationId && fee.locationViolationId !== filters.violationId) {
        return false;
      }

      return true;
    });
  }, [controlFeesData, filters]);

  const filtersComponent = (
    <ControlFeeFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onReset={handleResetFilters}
    />
  );

  const columns = React.useMemo(
    () =>
      getColumns(
        (fee) => {
          setEditingControlFee(fee);
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
        if (!editingControlFee) return;
        await updateControlFee({
          id: editingControlFee._id,
          ...data,
        });
        toast.success("Control fee updated successfully!");
      } else {
        await createControlFee({
          ...data,
        });
        toast.success("New control fee created!");
      }
      setIsDialogOpen(false);
      setEditingControlFee(null);
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    }
  };

  const isLoading = !Array.isArray(controlFeesData) && !controlFeesData?.page.length;

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
        <h1 className="text-2xl font-semibold">Control Fee Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingControlFee(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Control Fee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80svh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>{editingControlFee ? "Edit Control Fee" : "Create New Control Fee"}</DialogTitle>
            </DialogHeader>
            <ControlFeeForm
              onSubmit={handleFormSubmit}
              defaultValues={editingControlFee ?? undefined}
              isPending={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={filteredResults}
        pageCount={Math.ceil(filteredResults.length / 10)}
        pageIndex={0}
        pageSize={10}
        setPagination={() => {}}
        isLoading={isLoading}
        filters={filtersComponent}
      />
    </div>
  );
}