"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Doc } from "@convex/_generated/dataModel";


type UserFormProps = {
  onSubmit: (data: Omit<Doc<"users">, "_id" | "_creationTime" | "enabled">) => void;
  defaultValues?: Partial<Doc<"users"> | null>;
  isPending: boolean;
};

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  role: z.enum(["ADMIN", "PARKING", "RESTORER"]),
  password: z.string().optional(),
});

export function UserForm({ onSubmit, defaultValues, isPending }: UserFormProps) {
  const isEditMode = !!defaultValues?._id;

  const form = useForm({
    defaultValues: {
      name: defaultValues?.email?.split('@')[0] ?? "",
      email: defaultValues?.email ?? "",
      role: defaultValues?.role ?? "CLIENT",
      password: "",
    },
    onSubmit: async ({ value }) => onSubmit(value as any),
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
            <Input id={field.name} onChange={(e) => field.handleChange(e.target.value)} value={field.state.value} />
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
            <Input type="email" id={field.name} onChange={(e) => field.handleChange(e.target.value)} value={field.state.value} />
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      />

      {/* <form.Field
        name="role"
        validators={{ onChange: userSchema.shape.role }}
        children={(field) => (
          <div>
            <Label htmlFor={field.name}>Role</Label>
            <Select onValueChange={field.handleChange} defaultValue={field.state.value}>
              <SelectTrigger id={field.name}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="PARKING">Parking</SelectItem>
                <SelectItem value="RESTORER">Restorer</SelectItem>
              </SelectContent>
            </Select>
            {field.state.meta.errors ? (
              <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
            ) : null}
          </div>
        )}
      /> */}
      {!isEditMode && (
        <form.Field
          name="password"
          validators={{
            onChange: z.string().min(6, "Password must be at least 6 characters"),
          }}
          children={(field) => (
            <div>
              <Label htmlFor={field.name}>Password</Label>
              <Input type="password" id={field.name} onChange={(e) => field.handleChange(e.target.value)} value={field.state.value} />
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