"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Compass, Loader2, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSuccess(true);
      toast("Password recovery instructions sent to your email", "success");
    } catch (err: any) {
      toast("Something went wrong. Try again.", "error");
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
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>We will send instructions to verify and reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm">Check your inbox</h4>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  If that account exists, we have sent link parameters to authorize password modification.
                </p>
              </div>
              <Button onClick={() => setSuccess(false)} variant="outline" className="mt-2 w-full">
                Try different email
              </Button>
            </div>
          ) : (
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

              <Button type="submit" variant="gradient" className="w-full flex justify-center items-center gap-2 mt-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Recovery Link"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 text-center dark:border-slate-800 text-sm text-muted-foreground justify-center">
          <p>
            Remembered your password?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
