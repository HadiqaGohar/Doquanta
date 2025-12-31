"use client";

import { authClient } from "@/lib/auth/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean; // If true, redirects to login when not authenticated; if false, redirects to dashboard when authenticated
}

export function AuthRedirect({
  children,
  redirectTo = "/dashboard",
  requireAuth = false,
}: AuthRedirectProps) {

  const {
    data: session,
    isLoading
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await authClient.getSession();
      return response?.data || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !session) {
        // This is a protected page, redirect to sign in if not authenticated
        router.push("/sign-in");
      } else if (!requireAuth && session) {
        // This is an auth page (like sign in/up), redirect to dashboard if already authenticated
        router.push(redirectTo);
      }
    }
  }, [session, isLoading, router, redirectTo, requireAuth]);

  // Show loading state while checking session
  if (isLoading) {
    return <Loading />;
  }

  // If the redirect condition is not met, render the children
  return <>{children}</>;
}
