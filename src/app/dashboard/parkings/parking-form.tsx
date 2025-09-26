"use client";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
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
};

type ParkingFormProps = {
  onSubmit: (data: FormValues, isEdit: boolean) => void;
  defaultValues?: ParkingWithUser;
  isPending: boolean;
};

export function ParkingForm({ onSubmit, defaultValues, isPending }: ParkingFormProps) {
  const isEditMode = !!defaultValues;

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
    },
    onSubmit: ({ value }) => onSubmit(value, isEditMode),
  });

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