'use client';

import Image from 'next/image';
import { CheckCircle, Clock, XCircle, Package, ShieldCheck } from 'lucide-react';
import { Reservation } from '@/types';
import { formatPrice, formatPickupWindow } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
  onConfirmPickup?: (id: string) => void;
  onCancelAtPickup?: (id: string) => void;
}

const STATUS_ICON = {
  confirmed: CheckCircle,
  picked_up: Package,
  cancelled: XCircle,
  cancelled_at_pickup: XCircle,
};

const STATUS_COLOR = {
  confirmed: 'text-brand-600',
  picked_up: 'text-blue-500',
  cancelled: 'text-gray-400',
  cancelled_at_pickup: 'text-amber-500',
};

const STATUS_BG = {
  confirmed: 'bg-brand-50 border-brand-100',
  picked_up: 'bg-blue-50 border-blue-100',
  cancelled: 'bg-gray-50 border-gray-100',
  cancelled_at_pickup: 'bg-amber-50 border-amber-100',
};

const STATUS_LABEL = {
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
  cancelled_at_pickup: 'Cancelled at Pickup',
};

export function ReservationCard({ reservation, onCancel, onConfirmPickup, onCancelAtPickup }: ReservationCardProps) {
  const { id, listing, quantity, totalPrice, status, confirmationCode, createdAt } = reservation;
  const Icon = STATUS_ICON[status];
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

  return (
    <div className={cn('rounded-2xl border p-4', STATUS_BG[status])}>
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" sizes="64px" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
              {listing.title}
            </h3>
            <div className={cn('flex items-center gap-1 shrink-0', STATUS_COLOR[status])}>
              <Icon size={14} />
              <span className="text-xs font-medium">{STATUS_LABEL[status]}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-0.5 mb-2">{listing.businessName}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{formatPrice(totalPrice)}</span>
            <span>Qty: {quantity}</span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatPickupWindow(listing.pickupStartTime, listing.pickupEndTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-white/60 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Confirmation</p>
          <p className="text-sm font-mono font-bold text-gray-800">{confirmationCode}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400">{date}</p>
          {status === 'confirmed' && onCancel && (
            <button
              onClick={() => onCancel(id)}
              className="text-xs text-red-500 hover:text-red-600 font-medium mt-0.5"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Pickup action buttons — shown for confirmed reservations */}
      {status === 'confirmed' && (onConfirmPickup || onCancelAtPickup) && (
        <div className="mt-3 pt-3 border-t border-white/60 space-y-2">
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide flex items-center gap-1">
            <ShieldCheck size={11} className="text-brand-500" />
            At pickup
          </p>
          <div className="flex gap-2">
            {onConfirmPickup && (
              <button
                onClick={() => onConfirmPickup(id)}
                className="flex-1 text-xs font-semibold text-brand-700 bg-brand-100 hover:bg-brand-200 rounded-xl py-2 transition-colors"
              >
                ✓ Confirm Pickup
              </button>
            )}
            {onCancelAtPickup && (
              <button
                onClick={() => onCancelAtPickup(id)}
                className="flex-1 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl py-2 transition-colors"
              >
                Item doesn't match
              </button>
            )}
          </div>
        </div>
      )}

      {status === 'cancelled_at_pickup' && (
        <div className="mt-3 pt-3 border-t border-amber-200">
          <p className="text-xs text-amber-700 leading-relaxed">
            This reservation was cancelled at pickup because the item did not match the listing. No charge applies.
          </p>
        </div>
      )}
    </div>
  );
}
