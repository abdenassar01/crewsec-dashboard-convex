"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FieldInput, FormContext, ModeToggle } from "@/components";
import { HugeiconsIcon } from "@hugeicons/react";
import { Login01FreeIcons } from "@hugeicons/core-free-icons";

import { authClient } from "@/lib";
import { useState } from "react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (isLogin) {
        authClient.signIn.email({
          email: value.email,
          password: value.password,
          callbackURL: "/",
        }, {
          onError: (data: any) => {
            toast.error(data.error.message || "An error occurred");
            console.log("Error data: ", data);
          },
          onSuccess: async (data) => {
            toast.success('Login Successfully');
            console.log('DATA: ', data);
            redirect('/');
          }
        });
      } else {
        if (value.password !== value.confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,

          callbackURL: "/",
        }, {
          onError: (data: any) => {
            toast.error(data.error.message || "An error occurred");
            console.log("Error data Signup: ", data);
          },
          onSuccess: async () => {
            toast.success('Account created successfully');
            redirect('/');
          }
        });
      }
    },
  });

  return (
    <div className="flex bg-[url('/login-background.webp')] min-h-screen items-center justify-center bg-cover bg-no-repeat">
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isLogin ? "Login" : "Sign Up"}
          </CardTitle>
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
                {!isLogin && (
                  <FieldInput
                    label="Name"
                    name="name"
                    placeholder="Full Name"
                    form={form as any}
                  />
                )}

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

                {!isLogin && (
                  <FieldInput
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="****"
                    password
                    form={form as any}
                  />
                )}

                <Button type="submit" className="w-full mt-2">
                  <HugeiconsIcon icon={Login01FreeIcons} className="" />
                  <span>{isLogin ? "Login" : "Sign Up"}</span>
                </Button>
              </div>
            </form>
          </FormContext.Provider>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}