"use client";

import * as React from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ParkingForm } from "./parking-form";
import { ParkingFilters, type ParkingFilters as ParkingFiltersType } from "./parking-filters";
import { getColumns, type ParkingWithUser } from "./columns";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

export default function ParkingList() {
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

  const parkings = useQuery(api.parkings.list, {query: ''});

  const createUserAndParking = useMutation(api.parkings.createUserAndParking);
  const updateParking = useMutation(api.parkings.update);
  const anonymizeParking = useMutation(api.parkings.anonymizeParking);
  const getUploadUrl = useMutation(api.parkings.getUploadUrl);

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
    return parkings?.filter((parking) => {
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
          ((parking.unresolvedMarkuleras || 0) > 0) ||
          ((parking.unresolvedFelparkering || 0) > 0);
        if (hasUnresolvedIssues) return false;
      }

      // Unresolved issues filter
      if (filters.unresolvedIssues) {
        const hasUnresolvedIssues =
          ((parking.unresolvedMarkuleras || 0) > 0) ||
          ((parking.unresolvedFelparkering || 0) > 0);
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
            ((parking?.unresolvedMarkuleras || 0) > 0) ||
            ((parking?.unresolvedFelparkering || 0) > 0);
          if (hasUnresolvedIssues) return false;
        }
      }

      return true;
    }) || [];
  }, [parkings, filters]);

  const filtersComponent = (
    <ParkingFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onReset={handleResetFilters}
    />
  );

  const columns = React.useMemo(
    () => getColumns(
        (parking) => {
          setEditingParking(parking);
          setIsDialogOpen(true);
        },
        (parkingId) => {
          if (window.confirm("Are you sure you want to anonymize and close this parking? This cannot be undone.")) {
            anonymizeParking({ id: parkingId })
              .then(() => toast.success("Parking anonymized."))
              .catch((err) => toast.error(err.message));
          }
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFormSubmit = async (data: any, isEdit: boolean) => {
    try {
      let imageStorageId: Id<'_storage'> | null = null;

      // Handle image upload if present
      if (data.parkingImage && data.parkingImage instanceof File) {
        // Get upload URL
        const uploadUrl = await getUploadUrl();

        // Upload file directly to the upload URL
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': data.parkingImage.type },
          body: data.parkingImage,
        });

        if (response.ok) {
          const { storageId } = await response.json();
          imageStorageId = storageId;
        } else {
          throw new Error('Failed to upload image');
        }
      }

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
          imageStorageId: imageStorageId || editingParking.imageStorageId as Id<'_storage'>,
        });
        toast.success("Parking updated successfully!");
      } else {
        // For create, use the updated createUserAndParking with image support
        await createUserAndParking({
          email: data.email,
          password: data.password,
          role: "CLIENT", // Default role for new parkings, or make it a form field
          parkingName: data.parkingName,
          parkingDescription: data.parkingDescription,
          parkingLocation: data.parkingLocation,
          parkingWebsite: data.parkingWebsite,
          parkingAddress: data.parkingAddress,
          imageStorageId: imageStorageId as Id<'_storage'>,
          name: data.name
        });

        toast.success("New user and parking created!");
      }
      setIsDialogOpen(false);
      setEditingParking(null);
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    }
  };

  if (parkings === undefined)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="space-y-4 mt-10">
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

      <DataTable
        columns={columns}
        data={filteredResults}
        pageCount={(filteredResults?.length / 10) + 1}
        pageIndex={Math.floor(filteredResults.length / 10) - 1}
        pageSize={100}
        setPagination={() => {}} // Not needed with loadMore
        isLoading={parkings === undefined}
        filters={filtersComponent}
      />
    </div>
  );
}