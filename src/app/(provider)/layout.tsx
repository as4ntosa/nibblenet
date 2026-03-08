'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProviderNav } from '@/components/layout/ProviderNav';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!user.city) router.replace('/onboarding');
    else if (user.providerStatus !== 'approved') router.replace('/become-a-provider');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-full bg-gray-50">
      <main className="pb-20">{children}</main>
      <ProviderNav />
    </div>
  );
}
