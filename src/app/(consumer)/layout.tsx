'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { BottomNav } from '@/components/layout/BottomNav';

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    if (!user.city) { router.replace('/onboarding'); return; }
    // If an approved provider has switched to provider mode, send them to provider tools
    if (user.providerStatus === 'approved' && user.currentMode === 'provider') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // Show spinner while auth resolves — same HTML on server and client, no hydration mismatch
  if (loading) return <FullScreenSpinner />;
  if (!user) return <FullScreenSpinner />; // redirect in flight

  // Approved providers need extra space for the mode switcher strip above the nav
  const hasModeSwitcher = user.providerStatus === 'approved';

  return (
    <div className="min-h-full bg-gray-50">
      <main
        style={{
          paddingBottom: hasModeSwitcher
            ? 'calc(96px + env(safe-area-inset-bottom, 0px))'
            : 'calc(76px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
