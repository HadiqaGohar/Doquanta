"use client";

import { authClient } from "@/lib/auth/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Loading from "@/app/loading";
import { InfoIcon } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = "/sign-in"
}: ProtectedRouteProps) {
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
    if (!isLoading && !session) {
      toast(
        "Please sign in to access this page",
        { icon: <InfoIcon className="text-category-work" /> }
      );
      router.push(redirectTo);
    }
  }, [session, isLoading, router, redirectTo]);

  // Show loading state while checking session
  if (isLoading) {
    return <Loading />;
  }

  // If user is authenticated, render the protected content
  if (session) {
    return <>{children}</>;
  }

  // If not authenticated and not loading, return null (as redirect effect will handle navigation)
  return null;
}
