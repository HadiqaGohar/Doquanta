import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/tasks/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/:path*` 
          : 'http://localhost:8000/api/tasks/:path*',
      },
      {
        source: '/api/chat/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/:path*` 
          : 'http://localhost:8000/api/chat/:path*',
      },
      {
        source: '/api/reminders/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reminders/:path*` 
          : 'http://localhost:8000/api/reminders/:path*',
      },
      {
        source: '/api/notifications/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/:path*` 
          : 'http://localhost:8000/api/notifications/:path*',
      },
      {
        source: '/api/register-session',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register-session` 
          : 'http://localhost:8000/api/register-session',
      },
    ];
  },
};

export default nextConfig;