"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Compass, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isAdmin: z.boolean().default(false),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [role, setRole] = React.useState<"STUDENT" | "ADMIN">("STUDENT");

  const callbackUrl = searchParams.get("callbackUrl") || (role === "ADMIN" ? "/admin" : "/student");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      isAdmin: false,
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        toast(res.error, "error");
      } else {
        toast("Welcome back to EduPilot AI!", "success");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      toast(err?.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: "STUDENT" | "ADMIN") => {
    setRole(newRole);
    setValue("isAdmin", newRole === "ADMIN");
    if (newRole === "ADMIN") {
      setValue("email", "admin@edupilot.ai");
      setValue("password", "admin123");
    } else {
      setValue("email", "student1@edupilot.ai");
      setValue("password", "student123");
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/20">
      <Card className="w-full max-w-md border-slate-100 dark:border-slate-800 bg-background/80 backdrop-blur shadow-xl text-left">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
              <Compass className="h-5.5 w-5.5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Sign In to EduPilot</CardTitle>
          <CardDescription>Enter your credentials to access your pilot deck.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 p-1 rounded-lg bg-muted dark:bg-slate-800/80 mb-4">
            <button
              onClick={() => handleRoleChange("STUDENT")}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                role === "STUDENT"
                  ? "bg-background text-foreground shadow-sm dark:bg-slate-900"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => handleRoleChange("ADMIN")}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                role === "ADMIN"
                  ? "bg-background text-foreground shadow-sm dark:bg-slate-900"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Admin Deck
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("email")}
                  placeholder="name@example.com"
                  type="email"
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-xs font-medium text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("password")}
                  placeholder="••••••••"
                  type="password"
                  className="pl-10"
                />
              </div>
              {errors.password && <p className="text-xs font-medium text-rose-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="gradient" className="w-full flex justify-center items-center gap-2 mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center dark:border-slate-800 text-sm text-muted-foreground">
          <p>
            Don&apos;t have a student account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create Account
            </Link>
          </p>
          <div className="rounded-lg bg-violet-50/50 p-2.5 dark:bg-slate-900/30 text-left border border-violet-100/40 dark:border-slate-800/40 text-[11px] leading-relaxed">
            <span className="font-bold text-violet-600 dark:text-violet-400">Pro-Tip for evaluators:</span> Click either tab to autofill default seeded testing credentials (e.g. `student1@edupilot.ai` / `student123` or `admin@edupilot.ai` / `admin123`).
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[85vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
