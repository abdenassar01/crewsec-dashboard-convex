"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

type LocationViolationFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"locationViolations">> | null;
  isPending: boolean;
};

const locationViolationSchema = z.object({
  price: z.number().min(0, "Price must be positive"),
  locationId: z.string().min(1, "Location is required"),
  violationId: z.string().min(1, "Violation is required"),
});

export function LocationViolationForm({ onSubmit, defaultValues, isPending }: LocationViolationFormProps) {
  const isEditMode = !!defaultValues?._id;
  const locations = useQuery(api.staticData.listLocations, { paginationOpts: { numItems: 100, cursor: null } });
  const violations = useQuery(api.staticData.listViolations, { paginationOpts: { numItems: 100, cursor: null } });

  const form = useForm({
    defaultValues: {
      price: defaultValues?.price ?? 0,
      locationId: defaultValues?.locationId ?? "",
      violationId: defaultValues?.violationId ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value, isEditMode);
    },
  });

  return (
    <FormContext.Provider value={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <FieldInput
          name="price"
          label="Price"
          type="number"
          placeholder="0.00"
          form={form}
          required
        />
        <form.Field
          name="locationId"
          validators={{ onChange: locationViolationSchema.shape.locationId }}
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="text-sm font-medium">Location</label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.page.map((location) => (
                    <SelectItem key={location._id} value={location._id}>
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
              )}
            </div>
          )}
        />
        <form.Field
          name="violationId"
          validators={{ onChange: locationViolationSchema.shape.violationId }}
          children={(field) => (
            <div>
              <label htmlFor={field.name} className="text-sm font-medium">Violation</label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select violation" />
                </SelectTrigger>
                <SelectContent>
                  {violations?.page.map((violation) => (
                    <SelectItem key={violation._id} value={violation._id}>
                      {violation.label} (#{violation.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-sm text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
              )}
            </div>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Location Violation"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}