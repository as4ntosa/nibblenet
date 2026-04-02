'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProviderNav } from '@/components/layout/ProviderNav';

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (!user.city) { router.replace('/onboarding'); return; }
    // Hard gate: provider tools require approved status — mode alone is not enough
    if (user.providerStatus !== 'approved') {
      router.replace('/become-a-provider');
      return;
    }
    // Soft gate: if the user has switched back to consumer mode, send them home
    if (user.currentMode === 'consumer') {
      router.replace('/home');
    }
  }, [user, loading, router]);

  // Show spinner while auth resolves — same HTML on server and client, no hydration mismatch
  if (loading) return <FullScreenSpinner />;
  if (!user) return <FullScreenSpinner />; // redirect in flight

  return (
    <div className="min-h-full bg-gray-50">
      {/* Extra bottom padding: mode switcher strip (24px) + nav bar (60px) + safe area */}
      <main style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </main>
      <ProviderNav />
    </div>
  );
}
