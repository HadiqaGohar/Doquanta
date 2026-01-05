"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useUser } from "@/features/auth/hooks";
import { profileSchema, type ProfileFormData } from "@/features/auth/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, MailIcon, SaveIcon, UserIcon } from "lucide-react";


export function ProfileForm() {
  const { user, updateUser, isLoading } = useUser();

  // Initialize the form with user data
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
    values: user && !isLoading ? {
      name: user.name || "",
      email: user.email || "",
    } : undefined,
  });


  function onSubmit(values: ProfileFormData) {
    updateUser.mutate(values);
  }

  const name = form.watch("name");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="w-5 h-5" />
          Profile Information
        </CardTitle>
        <CardDescription>Your personal details and account info</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-sans">Full Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="text" placeholder="John Doe" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <Button
                      type="submit"
                      disabled={isLoading || name === user?.name}
                      variant="accent"
                    >
                      {isLoading ? "Saving..." : <><SaveIcon className="w-4 h-4 mr-2" />Save</>}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <hr />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-sans">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="email@example.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs -mt-2 ml-1">Email cannot be changed.</FormDescription>
                </FormItem>
              )}
            />
            <hr />
          </form>
        </Form>
        <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
          <CalendarIcon className="w-4 h-4" />
          <span>
            Member since {user?.createdAt ? format(new Date(user.createdAt), "MMMM d, yyyy") : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
