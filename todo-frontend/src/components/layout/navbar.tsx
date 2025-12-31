"use client";

import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/features/auth/hooks";
import { CoffeeIcon, LogOutIcon, UserIcon, HomeIcon, LogInIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

export function Navbar() {
  const { user } = useUser();
  const { signOut: { mutate: signOut } } = useAuth();
  const pathname = usePathname();

  // if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b shadow-glow">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href={user ? "/dashboard" : "/sign-in"}
            className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-espresso flex items-center justify-center shadow-soft">
              <CoffeeIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-foreground">TaskFlow</h1>
              <p className="text-xs text-muted-foreground font-sans">AI-Powered Productivity</p>
            </div>
          </Link>
          {user &&
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard">
                <Button
                  variant={isActive("/") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <HomeIcon className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant={isActive("/profile") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Button>
              </Link>
            </nav>}
        </div>

        <div className="flex items-center gap-2">
          {user ? <>
            <Link href="/profile" className="md:hidden">
              <Button variant="ghost" size="icon">
                <UserIcon className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOutIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </> : <>
            <Link href="/sign-in">
              <Button variant="outline" size="sm">
                <LogInIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="espresso" size="sm">
                Create Account
              </Button>
            </Link>
          </>}
          <AnimatedThemeToggler />
        </div>
      </div>
    </header>
  );
}
