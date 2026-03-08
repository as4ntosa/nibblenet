'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BottomNav } from '@/components/layout/BottomNav';

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!user.city) router.replace('/onboarding');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-full bg-gray-50">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
