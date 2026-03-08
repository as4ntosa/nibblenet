'use client';

import Image from 'next/image';
import { CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import { Reservation } from '@/types';
import { formatPrice, formatPickupWindow } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ReservationCardProps {
  reservation: Reservation;
  onCancel?: (id: string) => void;
}

const STATUS_ICON = {
  confirmed: CheckCircle,
  picked_up: Package,
  cancelled: XCircle,
};

const STATUS_COLOR = {
  confirmed: 'text-brand-600',
  picked_up: 'text-blue-500',
  cancelled: 'text-gray-400',
};

const STATUS_BG = {
  confirmed: 'bg-brand-50 border-brand-100',
  picked_up: 'bg-blue-50 border-blue-100',
  cancelled: 'bg-gray-50 border-gray-100',
};

const STATUS_LABEL = {
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  cancelled: 'Cancelled',
};

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
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
    </div>
  );
}
