"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns, type ParkingWithUser } from "./columns";
import { ParkingForm } from "./parking-form";
import { ParkingFilters, type ParkingFilters as ParkingFiltersType } from "./parking-filters";
import type { Doc } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";

interface ParkingListProps {
  results: ParkingWithUser[];
  status: string;
  loadMore?: () => void;
  createUserAndParking: (args: any) => Promise<any>;
  updateParking: (args: any) => Promise<any>;
  anonymizeParking: (args: any) => Promise<any>;
  getAvailabilityByDateRange: (args: { startDate: number; endDate: number; parkingId?: string }) => Promise<any>;
}

export function ParkingList({
  results,
  status,
  loadMore,
  createUserAndParking,
  updateParking,
  anonymizeParking,
  getAvailabilityByDateRange
}: ParkingListProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingParking, setEditingParking] = React.useState<ParkingWithUser | null>(null);
  const [filters, setFilters] = React.useState<ParkingFiltersType>({
    searchTerm: "",
    location: "",
    startDate: undefined,
    endDate: undefined,
    availableOnly: false,
    unresolvedIssues: false,
  });

  const handleFiltersChange = (newFilters: ParkingFiltersType) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      availableOnly: false,
      unresolvedIssues: false,
    });
  };

  // Filter results based on filters
  const filteredResults = React.useMemo(() => {
    return results.filter((parking) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          parking.name.toLowerCase().includes(searchLower) ||
          parking.address.toLowerCase().includes(searchLower) ||
          parking.description.toLowerCase().includes(searchLower) ||
          parking.location.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Location filter
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        if (!parking.location.toLowerCase().includes(locationLower)) {
          return false;
        }
      }

      // Available only filter
      if (filters.availableOnly) {
        const hasUnresolvedIssues =
          (parking.unresolvedMarkuleras > 0) ||
          (parking.unresolvedFelparkering > 0);
        if (hasUnresolvedIssues) return false;
      }

      // Unresolved issues filter
      if (filters.unresolvedIssues) {
        const hasUnresolvedIssues =
          (parking.unresolvedMarkuleras > 0) ||
          (parking.unresolvedFelparkering > 0);
        if (!hasUnresolvedIssues) return false;
      }

      // Date range filter
      if (filters.startDate || filters.endDate) {
        const startDate = filters.startDate ? new Date(filters.startDate).getTime() : 0;
        const endDate = filters.endDate ? new Date(filters.endDate).getTime() : Date.now();

        // Check if parking has availability in the specified date range
        // This is a simplified check - in a real implementation you'd query the availability
        // For now, we'll assume all parkings are available if they have no unresolved issues
        if (filters.availableOnly) {
          const hasUnresolvedIssues =
            (parking.unresolvedMarkuleras > 0) ||
            (parking.unresolvedFelparkering > 0);
          if (hasUnresolvedIssues) return false;
        }
      }

      return true;
    });
  }, [results, filters]);

  const filtersComponent = (
    <ParkingFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onReset={handleResetFilters}
    />
  );

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    try {
      if (isEdit) {
        if (!editingParking) return;
        await updateParking({
          id: editingParking._id,
          name: data.parkingName,
          description: data.parkingDescription,
          location: data.parkingLocation,
          website: data.parkingWebsite,
          address: data.parkingAddress,
          userId: data.userId, // This should already be set from defaultValues
        });
        toast.success("Parking updated successfully!");
      } else {
        await createUserAndParking({
          email: data.email,
          password: data.password,
          role: "CLIENT", // Default role for new parkings, or make it a form field
          parkingName: data.parkingName,
          parkingDescription: data.parkingDescription,
          parkingLocation: data.parkingLocation,
          parkingWebsite: data.parkingWebsite,
          parkingAddress: data.parkingAddress,
        });
        toast.success("New user and parking created!");
      }
      setIsDialogOpen(false);
      setEditingParking(null);
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    }
  };

  const handleAnonymize = (parkingId: Doc<"parkings">["_id"]) => {
    if (window.confirm("Are you sure you want to anonymize and close this parking? This cannot be undone.")) {
      anonymizeParking({ id: parkingId })
        .then(() => toast.success("Parking anonymized."))
        .catch((err) => toast.error(err.message));
    }
  };

  const columns = React.useMemo(
    () => getColumns(
        (parking) => {
          setEditingParking(parking);
          setIsDialogOpen(true);
        },
        handleAnonymize
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const isLoading = status === "LoadingFirstPage";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Parking Management</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingParking(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New Parking</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80svh] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>{editingParking ? "Edit Parking" : "Create New Parking & User"}</DialogTitle>
            </DialogHeader>
            <ParkingForm
              onSubmit={handleFormSubmit}
              defaultValues={editingParking ?? undefined}
              isPending={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredResults}
          pageCount={status === "CanLoadMore" || status === "LoadingMore" ? (filteredResults.length / 10) + 1 : (filteredResults.length / 10)}
          pageIndex={Math.floor(filteredResults.length / 10) - 1}
          pageSize={10}
          setPagination={() => {}} // Not needed with loadMore
          loadMore={status === "CanLoadMore" ? loadMore : undefined}
          isLoading={isLoading}
          filters={filtersComponent}
        />
      )}
    </div>
  );
}