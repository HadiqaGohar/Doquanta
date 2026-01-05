"use client";

import { env } from "@/utils/env";
import { createAuthClient } from "better-auth/react";
import { toast } from "react-hot-toast";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL,
  fetchOptions: {
    onError: (error) => {
      console.error("Auth error:", error);
      toast.error(error.error.message || "An authentication error occurred");
    },
    
  },
});

export const getAuthClient = () => authClient;

// Session token method for cookie-based auth
export const getSessionToken = async (): Promise<string | null> => {
  try {
    // With cookie-based auth, we don't need to manually handle tokens
    // The browser will automatically include the auth cookies in requests
    // Return null to indicate that cookies should be used instead of Bearer tokens
    return null;
  } catch (error) {
    console.error("Error getting session token:", error);
    return null;
  }
};
