'use client';

import Home from '@/app/components/Home';
import { useUser } from '@/features/auth/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // If user is already logged in, we might want to redirect them to dashboard
  // But the user said they want to see Home.tsx first? 
  // "Me chahtihon user direct redirect na ho pehly wo home page par ay phir HOme.tsx show ho"
  // This sounds like even if they are logged in, they see Home page first?
  // Usually, if logged in, people expect to see dashboard.
  // However, I will stick to what the user said: "pehy wo home page par ay phir Home.tsx show ho"
  
  return <Home />;
}
