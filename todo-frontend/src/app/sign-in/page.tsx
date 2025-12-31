'use client';

import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks';
import Header from '../components/Header';

export default function SignInPage() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <>
      {/* Header stays at top */}
      <Header />

      {/* Page Wrapper */}
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">

        {/* Auth Card */}
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 animate-fade-up -mt-10">

          {/* Heading */}
          <div className="text-center mb-8 animate-fade-up delay-100">
            <h1 className="text-3xl font-extrabold text-black mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to continue to{' '}
              <span className="font-semibold text-black">DoQuanta</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div className="animate-fade-up delay-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#AADE81] focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="animate-fade-up delay-300">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#AADE81] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between animate-fade-up delay-400">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#AADE81] focus:ring-[#AADE81]"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-black hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={signIn.isPending}
              className="w-full bg-black text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50 animate-fade-up delay-500"
            >
              {signIn.isPending ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Signup */}
            <div className="text-center mt-6 animate-fade-up delay-600">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/sign-up"
                  className="font-semibold text-black hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Animations */}
        <style jsx>{`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-up {
            animation: fadeUp 0.7s ease-out both;
          }

          .delay-100 { animation-delay: .1s }
          .delay-200 { animation-delay: .2s }
          .delay-300 { animation-delay: .3s }
          .delay-400 { animation-delay: .4s }
          .delay-500 { animation-delay: .5s }
          .delay-600 { animation-delay: .6s }
        `}</style>
      </div>
    </>
  );
}
