'use client';

import { ShoppingBag, Leaf, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export default function ReservationsPage() {
  const { user } = useAuth();
  const { getConsumerReservations, cancelReservation, confirmPickup, cancelAtPickup } = useData();

  const reservations = user ? getConsumerReservations(user.id) : [];
  const active = reservations.filter((r) => r.status === 'confirmed');
  const past = reservations.filter((r) => r.status !== 'confirmed');

  const pickedUp = reservations.filter((r) => r.status === 'picked_up');
  const kgSaved = pickedUp.reduce((sum, r) => sum + r.quantity * 0.4, 0);
  const co2Saved = kgSaved * 2.0;

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <p className="text-xs text-gray-400 mt-0.5">{reservations.length} total reservation{reservations.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 py-4 space-y-6">

        {/* Personal impact banner */}
        {pickedUp.length > 0 && (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
              <Leaf size={16} className="text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-700">Your food rescue impact</p>
              <p className="text-xs text-brand-600 mt-0.5">
                You&apos;ve rescued <span className="font-bold">{kgSaved.toFixed(1)} kg</span> of food, saving an estimated <span className="font-bold">{co2Saved.toFixed(1)} kg CO₂</span> from going to waste.
              </p>
              <Link href="/impact" className="text-[11px] text-brand-600 font-semibold mt-1 inline-block hover:underline">
                See full impact →
              </Link>
            </div>
          </div>
        )}

        {/* Recipe AI CTA */}
        {pickedUp.length > 0 && (
          <Link href="/pantry">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 hover:bg-amber-100 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <ChefHat size={16} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-700">What can I make?</p>
                <p className="text-xs text-amber-600 mt-0.5">Turn your rescued food into recipes with AI</p>
              </div>
              <span className="text-xs text-amber-500 font-semibold shrink-0">Try it →</span>
            </div>
          </Link>
        )}
        {reservations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} className="text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No reservations yet</h3>
            <p className="text-sm text-gray-400 mb-6">Find amazing deals on nearby food</p>
            <Link href="/home">
              <Button>Browse Food</Button>
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Active ({active.length})
                </h2>
                <div className="space-y-3">
                  {active.map((r) => (
                    <ReservationCard key={r.id} reservation={r} onCancel={cancelReservation} onConfirmPickup={confirmPickup} onCancelAtPickup={cancelAtPickup} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Past ({past.length})
                </h2>
                <div className="space-y-3">
                  {past.map((r) => (
                    <ReservationCard key={r.id} reservation={r} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
