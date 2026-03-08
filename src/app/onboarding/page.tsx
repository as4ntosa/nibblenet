'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const BUSINESS_TYPES = ['Restaurant', 'Bakery', 'Cafe', 'Grocery / Market', 'Food Truck', 'Other'];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile, setRole } = useAuth();

  const [step, setStep] = useState<'role' | 'location' | 'provider-details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [city, setCity] = useState(user?.city || '');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessType, setBusinessType] = useState(user?.businessType || '');
  const [saving, setSaving] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setRole(role);
  };

  const handleLocationNext = () => {
    updateProfile({ city, zipCode });
    if (selectedRole === 'provider') setStep('provider-details');
    else finish();
  };

  const finish = async () => {
    setSaving(true);
    if (selectedRole === 'provider') {
      updateProfile({ businessName, businessType });
    }
    await new Promise((r) => setTimeout(r, 400));
    router.replace(selectedRole === 'provider' ? '/dashboard' : '/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      <div className="flex-1 px-5 pt-12 pb-8 max-w-sm mx-auto w-full">
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {['role', 'location', ...(selectedRole === 'provider' ? ['provider-details'] : [])].map(
            (s, i) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 rounded-full flex-1 transition-all',
                  step === s
                    ? 'bg-brand-600'
                    : ['role', 'location', 'provider-details'].indexOf(step) > i
                    ? 'bg-brand-300'
                    : 'bg-gray-200'
                )}
              />
            )
          )}
        </div>

        {/* Step: Role */}
        {step === 'role' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-gray-400 text-sm mb-8">How will you be using ShareBite?</p>

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect('consumer')}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                  selectedRole === 'consumer'
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                  selectedRole === 'consumer' ? 'bg-brand-100' : 'bg-gray-100'
                )}>
                  <ShoppingBag size={22} className={selectedRole === 'consumer' ? 'text-brand-600' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">I want to find food</p>
                  <p className="text-sm text-gray-400 mt-0.5">Browse surplus food from nearby providers at great prices</p>
                </div>
                {selectedRole === 'consumer' && (
                  <CheckCircle size={20} className="text-brand-600 ml-auto shrink-0" />
                )}
              </button>

              <button
                onClick={() => handleRoleSelect('provider')}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
                  selectedRole === 'provider'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                  selectedRole === 'provider' ? 'bg-amber-100' : 'bg-gray-100'
                )}>
                  <Store size={22} className={selectedRole === 'provider' ? 'text-amber-600' : 'text-gray-400'} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">I'm a food provider</p>
                  <p className="text-sm text-gray-400 mt-0.5">List surplus food and connect with nearby customers</p>
                </div>
                {selectedRole === 'provider' && (
                  <CheckCircle size={20} className="text-amber-500 ml-auto shrink-0" />
                )}
              </button>
            </div>

            <Button
              fullWidth
              size="lg"
              className="mt-8"
              disabled={!selectedRole}
              onClick={() => setStep('location')}
            >
              Continue
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Step: Location */}
        {step === 'location' && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
              <MapPin size={22} className="text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Where are you located?</h1>
            <p className="text-gray-400 text-sm mb-8">We use this to show you nearby listings.</p>

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
              onClick={handleLocationNext}
              disabled={!city}
            >
              Continue
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        )}

        {/* Step: Provider details */}
        {step === 'provider-details' && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
              <Store size={22} className="text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Your business</h1>
            <p className="text-gray-400 text-sm mb-8">Tell customers a bit about your food business.</p>

            <div className="space-y-3">
              <Input
                label="Business Name"
                placeholder="e.g. Sunrise Bakery"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Business Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setBusinessType(type)}
                      className={cn(
                        'px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors text-left',
                        businessType === type
                          ? 'border-amber-500 bg-amber-50 text-amber-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              className="mt-8"
              onClick={finish}
              disabled={!businessName}
              loading={saving}
            >
              Start Sharing Food
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
