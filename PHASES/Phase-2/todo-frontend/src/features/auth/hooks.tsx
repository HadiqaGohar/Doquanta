"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  changePasswordAction,
  forgotPasswordAction,
  resetPasswordAction,
  signInAction,
  signOutAction,
  signUpAction,
  updateUserAction,
} from "./actions";


export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const signUp = useMutation({
    mutationFn: signUpAction,
    onSuccess: () => {
      toast.success("Registration successful! Redirecting...");
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    }
  });


  const signIn = useMutation({
    mutationFn: signInAction,
    onSuccess: () => {
      toast.success("Sign in successful! Redirecting...");
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Sign in error:", error);
      toast.error(error.message || "An unexpected error occurred during sign in");
    },
  });


  const signOut = useMutation({
    mutationFn: async () => {
      // Use Better Auth's built-in signOut method
      return await authClient.signOut();
    },
    onSuccess: async () => {
      toast.success("Successfully signed out");
      // Clear all related query caches to ensure proper state update
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      // Force a redirect to the root URL to avoid any potential redirects
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Sign out error:", error);
      toast.error(error.message || "Sign out failed");
    },
  });


  const forgotPassword = useMutation({
    mutationFn: forgotPasswordAction,
    onError: ({ message }) => {
      console.error("Forgot password error:", message);
      if (message?.includes('rate limit')) {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error(message || "An unexpected error occurred. Please try again.");
      }
    },
    onSuccess: () => {
      toast.success("If an account with this email exists, a password reset link has been sent.");
    }
  });


  const resetPassword = useMutation({
    mutationFn: resetPasswordAction,
    onSuccess: () => {
      toast.success("Password reset successful! Redirecting to sign in...");
      router.push("/sign-in");
    },
    onError: (error) => {
      console.error("Password reset failed: ", error);
      toast.error(error.message || "Password reset failed");
    }
  });


  const changePassword = useMutation({
    mutationFn: changePasswordAction,
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error) => {
      console.error("Change password error:", error);
      toast.error(error.message || "Failed to change password");
    },
  });

  return {
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    changePassword,
  }
}


export const useUser = () => {
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await authClient.getSession();
      return response?.data || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  const user = session?.user || null;

  const updateUserMutation = useMutation({
    mutationFn: updateUserAction,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      // Refetch user data to update context
      refetch();
      // Invalidate and refetch user query to update dashboard/profile page
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  return {
    updateUser: updateUserMutation,
    user,
    isLoading,
    error,
    refetch
  }
};

