"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import { ImageUpload } from "@/components/common/forms/ImageUpload";
import { useImageUrl } from "@/hooks/use-image-url";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { ParkingWithUser } from "./columns";

type FormValues = {
  // User fields (for creation only)
  email?: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  // Parking fields
  parkingName: string;
  parkingDescription: string;
  parkingLocation: string;
  parkingWebsite: string;
  parkingAddress: string;
  userId?: string;
  parkingImage?: File | null;
};

type ParkingFormProps = {
  onSubmit: (data: FormValues, isEdit: boolean) => void;
  defaultValues?: ParkingWithUser;
  isPending: boolean;
};

export function ParkingForm({ onSubmit, defaultValues, isPending }: ParkingFormProps) {
  const isEditMode = !!defaultValues;
  const { getUrl } = useImageUrl();
  const deleteImage = useMutation(api.parkings.deleteImage);
  const [currentImage, setCurrentImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultValues?.imageStorageId ? getUrl(defaultValues.imageStorageId) : null
  );

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      parkingName: defaultValues?.name ?? "",
      parkingDescription: defaultValues?.description ?? "",
      parkingLocation: defaultValues?.location ?? "",
      parkingWebsite: defaultValues?.website ?? "",
      parkingAddress: defaultValues?.address ?? "",
      userId: defaultValues?.userId,
      parkingImage: null,
    },
    onSubmit: async ({ value }) => {
      // Handle image upload if needed
      if (currentImage) {
        // The parent component will handle the actual upload
        onSubmit({ ...value, parkingImage: currentImage }, isEditMode);
      } else {
        onSubmit(value, isEditMode);
      }
    },
  });

  const handleImageChange = (file: File | null) => {
    setCurrentImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(defaultValues?.imageStorageId ? getUrl(defaultValues.imageStorageId) : null);
    }
  };

  const handleImageRemove = async () => {
    if (defaultValues?.imageStorageId) {
      await deleteImage({ storageId: defaultValues.imageStorageId });
    }
    setCurrentImage(null);
    setPreviewUrl(null);
  };

  return (
    <FormContext.Provider value={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {!isEditMode && (
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-lg font-semibold">New User Details</h3>
            <FieldInput  name="email" label="Email" placeholder="user@example.com" type="email" form={form} />
            <FieldInput name="password" label="Password" type="password" placeholder="••••••••" form={form} />
          </div>
        )}

        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-semibold">Parking Details</h3>
          <ImageUpload
            value={previewUrl}
            onChange={handleImageChange}
            onRemove={handleImageRemove}
            disabled={isPending}
          />
          <FieldInput name="parkingName" label="Parking Name" placeholder="Main Street Parking" form={form} />
          <FieldInput name="parkingAddress" label="Address" placeholder="123 Main St" form={form} />
          <FieldInput name="parkingLocation" label="Location (e.g., City)" placeholder="Metropolis" form={form} />
          <FieldInput name="parkingWebsite" label="Website URL" placeholder="https://parking.com" form={form} />
          <FieldInput name="parkingDescription" label="Description" placeholder="A short description..." form={form} />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create User & Parking"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}