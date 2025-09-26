"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import type { Doc } from "@convex/_generated/dataModel";

type TownFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"towns">> | null;
  isPending: boolean;
};

const townSchema = z.object({
  label: z.string().min(1, "Town name is required"),
});

export function TownForm({ onSubmit, defaultValues, isPending }: TownFormProps) {
  const isEditMode = !!defaultValues?._id;

  const form = useForm({
    defaultValues: {
      label: defaultValues?.label ?? "",
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
          label="Town Name"
          placeholder="Enter town name..."
          form={form}
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Town"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}