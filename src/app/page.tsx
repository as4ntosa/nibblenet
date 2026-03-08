'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, ArrowRight, ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const FEATURES = [
  { emoji: '🍱', text: 'Surplus meals from local restaurants' },
  { emoji: '🥐', text: 'Fresh baked goods at a fraction of the price' },
  { emoji: '🥦', text: 'Produce and pantry goods near you' },
  { emoji: '♻️', text: 'Save food. Save money. Help the planet.' },
];

export default function SplashPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Auto-redirect signed-in users
  useEffect(() => {
    if (!loading && user) {
      if (!user.role || !user.city) router.replace('/onboarding');
      else if (user.role === 'provider') router.replace('/dashboard');
      else router.replace('/home');
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Hero gradient */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-6 pb-4 text-center bg-gradient-to-b from-brand-50 via-white to-white">
        {/* App icon */}
        <div
          className="mb-5 flex items-center justify-center"
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            background: 'linear-gradient(145deg, #22c55e, #15803d)',
            boxShadow: '0 8px 32px rgba(22,163,74,0.35)',
          }}
        >
          <Leaf size={40} className="text-white" strokeWidth={2} />
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#111827', letterSpacing: -0.5, lineHeight: 1.15, marginBottom: 10 }}>
          ShareBite
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.55, maxWidth: 260, marginBottom: 28 }}>
          Rescue surplus food from local restaurants &amp; markets at up to 70% off.
        </p>

        {/* Feature pills */}
        <div className="w-full max-w-xs space-y-2.5 mb-8">
          {FEATURES.map(({ emoji, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50"
            >
              <span style={{ fontSize: 20 }}>{emoji}</span>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, textAlign: 'left' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA area */}
      <div className="px-5 pb-4 pt-3 space-y-3 bg-white border-t border-gray-50">
        {/* Stats row */}
        <div className="flex justify-around py-2">
          {[
            { value: '500+', label: 'Providers' },
            { value: '12K+', label: 'Meals Saved' },
            { value: '4.8★', label: 'Rating' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{value}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        <Link href="/login?tab=signup">
          <Button fullWidth size="lg" className="gap-2 rounded-2xl">
            <ShoppingBag size={18} />
            Get Started — It&apos;s Free
          </Button>
        </Link>

        <Link href="/login">
          <Button fullWidth size="lg" variant="outline" className="rounded-2xl">
            Sign In
          </Button>
        </Link>

        {/* Provider link */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <Store size={13} className="text-gray-400" />
          <Link href="/login?tab=signup&role=provider">
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              Are you a food provider?{' '}
              <span style={{ color: '#16a34a', fontWeight: 600 }}>List your surplus →</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
