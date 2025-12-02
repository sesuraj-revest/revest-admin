"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { FormInput, FormPassword } from "@/components/form";
import { Mail, Lock, User } from "lucide-react";
import { RegisterAction } from "../actions";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await RegisterAction(data);
      if (!res || res.error) {
        setError(res?.error || "Registration failed");
        return;
      }

      // Redirect to login page
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md shadow-xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
            Vendor Admin
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Create your account
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                control={form.control}
                name="fullName"
                label="Full Name"
                placeholder="Sesuraj"
                disabled={isLoading}
                startIcon={<User className="h-4 w-4" />}
              />

              <FormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="user@example.com"
                disabled={isLoading}
                startIcon={<Mail className="h-4 w-4" />}
              />

              <FormPassword
                control={form.control}
                name="password"
                label="Password"
                placeholder="StrongPassword123"
                disabled={isLoading}
                startIcon={<Lock className="h-4 w-4" />}
              />

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm animate-in shake duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full transition-all duration-200 hover:shadow-lg"
                size="lg"
              >
                {isLoading ? "Creating account..." : "Register"}
              </Button>

              <p className="text-center text-sm mt-2 text-muted-foreground">
                Already have an account?{" "}
                {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
                {/** biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => router.push("/")}
                >
                  Login
                </span>
              </p>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
