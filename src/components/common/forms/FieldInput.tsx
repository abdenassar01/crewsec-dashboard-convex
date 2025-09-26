import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@tanstack/react-form";

type FieldInputProps = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  password?: boolean;
  form: any;
  required?: boolean;
};

export function FieldInput({ name, label, placeholder, type = "text", password, form, required }: FieldInputProps) {
  return (
    <Field
      form={form}
      name={name}
      validators={{
        onChange: ({ value }) => {
          if (required && !value) {
            return `${label} is required`;
          }
          if (type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Invalid email address";
          }
          return undefined;
        },
      }}
      children={(field) => (
        <div>
          <Label htmlFor={field.name}>{label}{required && "*"}</Label>
          <Input
            id={field.name}
            type={password ? "password" : type}
            placeholder={placeholder}
            value={field.state.value || ""}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
          {field.state.meta.errors && (
            <p className="text-sm text-red-500 mt-1">{field.state.meta.errors.join(", ")}</p>
          )}
        </div>
      )}
    />
  );
}