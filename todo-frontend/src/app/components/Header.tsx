"use client";

import Link from "next/link";
import {
  CheckCircle,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useUser, useAuth } from "@/features/auth/hooks";

export default function Header() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const isAuthenticated = !!user;

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/70 border-b border-black/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#AADE81]/40 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-[#AADE81] p-2.5 rounded-xl">
                <CheckCircle className="h-7 w-7 text-black" />
              </div>
            </div>

            <div className="leading-tight">
              <span className="text-xl font-extrabold tracking-tight text-black">
                DoQuanta
              </span>
              <span className="block text-xs text-gray-500 font-medium">
                Task Management
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <div className="flex items-center gap-3 pl-6 border-l border-black/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  </div>

                  <button
                    onClick={() => signOut.mutate()}
                    disabled={signOut.isPending}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold text-gray-700 hover:text-black transition"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className="px-6 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:scale-105 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
