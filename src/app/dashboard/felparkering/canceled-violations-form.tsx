"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldInput, FormContext } from "@/components/common/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Doc } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

type CanceledViolationsFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"canceledViolations">> | null;
  isPending: boolean;
};

const causeType = z.union([
  z.literal("FELPARKERING"),
  z.literal("MAKULERA")
]);

const canceledViolationsSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  cause: causeType,
  resolved: z.boolean(),
  parkingId: z.string().min(1, "Parking is required"),
});

const causeColors = {
  FELPARKERING: "bg-yellow-100 text-yellow-800",
  MAKULERA: "bg-red-100 text-red-800",
};

export function CanceledViolationsForm({ onSubmit, defaultValues, isPending }: CanceledViolationsFormProps) {
  const isEditMode = !!defaultValues?._id;
  const parkings = useQuery(api.parkings.list, { paginationOpts: { numItems: 100, cursor: null } });
  const form = useForm({
    defaultValues: {
      reference: defaultValues?.reference ?? "",
      cause: defaultValues?.cause ?? "FELPARKERING",
      resolved: defaultValues?.resolved ?? false,
      parkingId: defaultValues?.parkingId ?? "",
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
          name="reference"
          label="Reference"
          placeholder="FEL-001"
          form={form}
          required
        />
        <form.Field
          name="cause"
          validators={{ onChange: canceledViolationsSchema.shape.cause }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Cause</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as "FELPARKERING" | "MAKULERA")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cause" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FELPARKERING">
                    <Badge className={causeColors.FELPARKERING}>FELPARKERING</Badge>
                  </SelectItem>
                  <SelectItem value="MAKULERA">
                    <Badge className={causeColors.MAKULERA}>MAKULERA</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
              {field.state.meta.errors ? (
                <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        />
        <form.Field
          name="parkingId"
          validators={{ onChange: canceledViolationsSchema.shape.parkingId }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Parking</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parking" />
                </SelectTrigger>
                <SelectContent>
                  {parkings?.page.map((parking) => (
                    <SelectItem key={parking._id} value={parking._id}>
                      {parking.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors ? (
                <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        />
        <form.Field
          name="resolved"
          validators={{ onChange: canceledViolationsSchema.shape.resolved }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Resolved</Label>
              <Select
                value={field.state.value.toString()}
                onValueChange={(value) => field.handleChange(value === "true")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                  </SelectItem>
                  <SelectItem value="false">
                    <Badge className="bg-red-100 text-red-800">Unresolved</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
              {field.state.meta.errors ? (
                <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Entry"}
        </Button>
      </form>
    </FormContext.Provider>
  );
}