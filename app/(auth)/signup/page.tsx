"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Compass, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Signup failed");
      }

      toast("Account registered successfully! Please sign in.", "success");
      router.push("/login");
    } catch (err: any) {
      toast(err?.message || "Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/20">
      <Card className="w-full max-w-md border-slate-100 dark:border-slate-800 bg-background/80 backdrop-blur shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
              <Compass className="h-5.5 w-5.5" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create Student Account</CardTitle>
          <CardDescription>Join EduPilot AI to automate study notes and roadmaps.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("name")}
                  placeholder="John Doe"
                  type="text"
                  className="pl-10"
                />
              </div>
              {errors.name && <p className="text-xs font-medium text-rose-500">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
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

            {/* Password */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
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

            {/* Confirm Password */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("confirmPassword")}
                  placeholder="••••••••"
                  type="password"
                  className="pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-rose-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Signup Button */}
            <Button type="submit" variant="gradient" className="w-full flex justify-center items-center gap-2 mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t pt-4 text-center dark:border-slate-800 text-sm text-muted-foreground justify-center">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
