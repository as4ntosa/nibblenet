'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

export default function ReservationsPage() {
  const { user } = useAuth();
  const { getConsumerReservations, cancelReservation } = useData();

  const reservations = user ? getConsumerReservations(user.id) : [];
  const active = reservations.filter((r) => r.status === 'confirmed');
  const past = reservations.filter((r) => r.status !== 'confirmed');

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <p className="text-xs text-gray-400 mt-0.5">{reservations.length} total reservation{reservations.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 py-4 space-y-6">
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
                    <ReservationCard key={r.id} reservation={r} onCancel={cancelReservation} />
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
