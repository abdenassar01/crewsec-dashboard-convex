"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ControlFeeForm } from "./control-fee-form";
import { getColumns } from "./columns";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FilterState = {
  townId: Id<"towns"> | undefined;
  violationId: Id<"violations"> | undefined;
};

export default function ControlFeeList() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingControlFee, setEditingControlFee] = React.useState<Doc<"controlFees"> | null>(null);
  const [filters, setFilters] = React.useState<FilterState>({
    townId: undefined,
    violationId: undefined,
  });

  // Fetch towns and violations for selects
  const towns = useQuery(api.towns.list);
  const violations = useQuery(api.violations.list);

  // Fetch all control fees by default, apply filters when selected
  const controlFees = useQuery(api.controlFees.listAll, {
    townId: filters.townId,
    violationId: filters.violationId
  });

  const createControlFee = useMutation(api.controlFees.create);
  const updateControlFee = useMutation(api.controlFees.update);
  const deleteControlFee = useMutation(api.controlFees.deleteFee);

  const handleDelete = (feeId: Doc<"controlFees">["_id"]) => {
    deleteControlFee({ id: feeId })
      .then(() => toast.success("Control fee deleted."))
      .catch((err) => toast.error(err.message));
  };

  const handleTownChange = (value: string) => {
    const townId = value === "all" ? undefined : value as Id<"towns">;
    setFilters(prev => ({ ...prev, townId }));
  };

  const handleViolationChange = (value: string) => {
    const violationId = value === "all" ? undefined : value as Id<"violations">;
    setFilters(prev => ({ ...prev, violationId }));
  };

  const handleResetFilters = () => {
    setFilters({
      townId: undefined,
      violationId: undefined,
    });
  };

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

  return (
    <div className="space-y-6 mt-10">
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

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Town</label>
              <Select value={filters.townId || ""} onValueChange={handleTownChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select town" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Towns</SelectItem>
                  {towns?.map((town) => (
                    <SelectItem key={town._id} value={town._id}>
                      {town.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Violation</label>
              <Select value={filters.violationId || ""} onValueChange={handleViolationChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select violation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Violations</SelectItem>
                  {violations?.map((violation) => (
                    <SelectItem key={violation._id} value={violation._id}>
                      {violation.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Control Fees Table */}
      {controlFees === undefined ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={controlFees}
          pageCount={(controlFees.length / 10) + 1}
          pageIndex={Math.floor(controlFees.length / 10) - 1}
          pageSize={100}
          setPagination={() => {}} // Not needed with loadMore
          isLoading={controlFees === undefined}
        />
      )}
    </div>
  );
}