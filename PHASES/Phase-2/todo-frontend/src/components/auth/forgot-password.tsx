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
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/features/auth/schema";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks";
import { ArrowLeftIcon, MailIcon, SendIcon } from "lucide-react";

export function ForgotPasswordForm() {
  const { forgotPassword: {
    mutateAsync: forgotPassword,
    isPending: isLoading,
  } } = useAuth();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await forgotPassword(data);
  }

  return (
    <Card className="shadow-elevated">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl text-center">Forgot password?</CardTitle>
        <CardDescription className="text-center">Enter your email and we'll send you a reset link</CardDescription>
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

            <Button
              type="submit"
              className="w-full"
              variant="espresso"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse-soft">Sending...</span>
              ) : (
                <>
                  <SendIcon className="w-4 h-4" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-accent transition-colors font-sans inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
