"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signInSchema, type SignInFormData } from "@/features/auth/schema";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks";
import { CheckCircleIcon, LockIcon, MailIcon } from "lucide-react";

export function SignInForm() {
  const { signIn: {
    mutateAsync: signIn,
    isPending: isLoading,
  } } = useAuth();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: SignInFormData) => {
    await signIn({
      email: data.email,
      password: data.password,
    });
  }

  return (
    <Card className="shadow-elevated">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">Enter your credentials to access your tasks</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="email@example.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="font-sans text-sm text-accent font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="espresso"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ?
                <span className="animate-pulse-soft">Please wait...</span> :
                <><CheckCircleIcon className="w-4 h-4" />Sign In</>
              }
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground font-sans">
            Don't have an account? {""}
            <Link href="/sign-up" className="text-accent font-medium">Sign up</Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
