"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import type { Doc } from "@convex/_generated/dataModel";

type ViolationFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"violations">> | null;
  isPending: boolean;
};

const violationSchema = z.object({
  label: z.string().min(1, "Violation type is required"),
  description: z.string().optional(),
});

export function ViolationForm({ onSubmit, defaultValues, isPending }: ViolationFormProps) {
  const isEditMode = !!defaultValues?._id;

  const form = useForm({
    defaultValues: {
      label: defaultValues?.label ?? "",
      description: defaultValues?.description ?? "",
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
          name="label"
          label="Violation Type"
          placeholder="Enter violation type..."
          form={form}
          required
        />
        <FieldInput
          name="description"
          label="Description"
          placeholder="Enter description..."
          form={form}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Violation"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}