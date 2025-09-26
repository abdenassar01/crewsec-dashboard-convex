"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Doc } from "@convex/_generated/dataModel";

type UserFormProps = {
  onSubmit: (data: any, isEdit: boolean) => void;
  defaultValues?: Partial<Doc<"users">> | null;
  isPending: boolean;
};

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["CLIENT", "EMPLOYER", "ADMIN"]),
  enabled: z.boolean().optional(),
  password: z.string().optional(),
});

export function UserForm({ onSubmit, defaultValues, isPending }: UserFormProps) {
  const isEditMode = !!defaultValues?._id;

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      role: defaultValues?.role ?? "CLIENT",
      enabled: defaultValues?.enabled ?? true,
      password: "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value, isEditMode);
    },
    // defaultValidators: zodValidator(userSchema),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="name"
        validators={{ onChange: userSchema.shape.name }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Name</Label>
            <Input id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      />
      <form.Field
        name="email"
        validators={{ onChange: userSchema.shape.email }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Email</Label>
            <Input type="email" id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      />
      <form.Field
        name="role"
        validators={{ onChange: userSchema.shape.role }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Role</Label>
            <select
              id={field.name}
              onChange={(e) => field.handleChange(e.target.value as any)}
              value={field.state.value}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="CLIENT">Client</option>
              <option value="EMPLOYER">Employer</option>
              <option value="ADMIN">Admin</option>
            </select>
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      />
      <form.Field
        name="enabled"
        children={(field) => (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor={field.name}>Enabled</Label>
          </div>
        )}
      />

      {!isEditMode && (
        <form.Field
          name="password"
          validators={{
            onChange: z.string().min(6, "Password must be at least 6 characters"),
          }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Password</Label>
              <Input type="password" id={field.name} onChange={(e) => field.handleChange(e.target.value as any)} value={field.state.value} />
              {field.state.meta.errors ? (
                <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
              ) : null}
            </div>
          )}
        />
      )}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save User"}
      </Button>
    </form>
  );
}