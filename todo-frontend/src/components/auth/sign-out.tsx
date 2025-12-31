"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks";


export function SignOutButton() {
  const { signOut: {
    mutateAsync: signOut,
    isPending: isLoading,
  } } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      disabled={isLoading}
    >
      {isLoading ? "Signing Out..." : "Sign Out"}
    </Button>
  );
}
