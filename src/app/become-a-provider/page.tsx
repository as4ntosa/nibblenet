'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, FileText, Leaf, ArrowRight, CheckCircle, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const STEPS = [
  {
    icon: Store,
    title: 'Identity & Provider Verification',
    desc: 'Choose your provider type and provide basic verification details.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Integrity Policy',
    desc: 'Read and acknowledge NibbleNet\'s safety rules. Prohibited items are strictly enforced.',
  },
  {
    icon: FileText,
    title: 'Food Safety Acknowledgement',
    desc: 'Agree to food handling guidelines covering cooked, raw, and packaged items.',
  },
];

const PROVIDER_TYPES = [
  { emoji: '🍽️', label: 'Restaurant' },
  { emoji: '🛒', label: 'Grocery Store' },
  { emoji: '☕', label: 'Bakery / Cafe' },
  { emoji: '🏠', label: 'Household' },
  { emoji: '🏪', label: 'Other Food Business' },
];

export default function BecomeAProviderPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user?.providerStatus === 'approved') router.replace('/dashboard');
    if (!loading && user?.providerStatus === 'pending') router.replace('/provider-pending');
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-50 to-white px-5 pt-10 pb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
          <Leaf size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Become a NibbleNet Provider</h1>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Share surplus food with your community. We review every application to keep the platform safe and trustworthy.
        </p>
      </div>

      <div className="px-5 pb-8 space-y-6 max-w-sm mx-auto w-full">
        {/* Who can apply */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Who can apply</p>
          <div className="grid grid-cols-2 gap-2">
            {PROVIDER_TYPES.map(({ emoji, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                <span className="text-lg">{emoji}</span>
                <span className="text-xs font-medium text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Approval steps */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">3-step approval process</p>
          <div className="space-y-3">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-0.5">Step {i + 1}</p>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-1">Safety-first platform</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                NibbleNet takes provider safety seriously. All providers must agree to our food safety standards.
                Prohibited, unsafe, or illegal items will result in immediate removal and account suspension.
              </p>
            </div>
          </div>
        </div>

        <Link href="/provider-apply">
          <Button fullWidth size="lg" className="gap-2">
            Start Application
            <ArrowRight size={16} />
          </Button>
        </Link>

        <Link href="/home" className="block text-center text-sm text-gray-400 hover:text-gray-600 pb-2">
          Maybe later
        </Link>
      </div>
    </div>
  );
}
