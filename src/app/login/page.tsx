"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FieldInput, FormContext, ModeToggle } from "@/components";
import { HugeiconsIcon } from "@hugeicons/react";
import { Login01FreeIcons } from "@hugeicons/core-free-icons";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onError: (data: any) => {
            toast.error(data.error.message || "An error occurred");
            console.log("Error data: ", data);
          },
          onSuccess: async (data) => {
            console.log("__2__DATA: ", data);
            toast.success("Login Successfully");
            redirect("/");
          },
        },
      );
    },
  });

  return (
    <div className="flex bg-[url('/login-background.webp')] min-h-screen items-center justify-center bg-cover bg-no-repeat">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <FormContext.Provider value={form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <div className="flex flex-col gap-3">
                <FieldInput
                  label="Email"
                  name="email"
                  placeholder="Email"
                  form={form as any}
                />

                <FieldInput
                  label="Password"
                  name="password"
                  placeholder="****"
                  password
                  form={form as any}
                />

                <Button type="submit" className="w-full mt-2">
                  <HugeiconsIcon icon={Login01FreeIcons} className="" />
                  <span>Login</span>
                </Button>
              </div>
            </form>
          </FormContext.Provider>
        </CardContent>
      </Card>
    </div>
  );
}
