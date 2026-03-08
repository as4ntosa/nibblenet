'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [city, setCity] = useState(user?.city || '');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    updateProfile({ city, zipCode });
    await new Promise((r) => setTimeout(r, 400));
    router.replace('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <div className="flex-1 px-5 pt-12 pb-8 max-w-sm mx-auto w-full">
        <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
          <MapPin size={22} className="text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Where are you located? We use this to show nearby food listings.
        </p>

        <div className="space-y-3">
          <Input
            label="City"
            placeholder="e.g. San Francisco"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label="ZIP Code"
            placeholder="e.g. 94105"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </div>

        <Button
          fullWidth
          size="lg"
          className="mt-8"
          onClick={handleContinue}
          disabled={!city}
          loading={saving}
        >
          Start Browsing
          <ArrowRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
