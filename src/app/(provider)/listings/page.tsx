'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Trash2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Listing } from '@/types';
import { formatPrice, STATUS_COLOR, STATUS_LABEL, timeUntil, formatPickupWindow } from '@/lib/utils';

export default function ManageListingsPage() {
  const { user } = useAuth();
  const { getProviderListings, deleteListing, updateListing } = useData();
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);

  const listings = user ? getProviderListings(user.id) : [];

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteListing(deleteTarget.id);
    setDeleteTarget(null);
  };

  const toggleStatus = (listing: Listing) => {
    const next = listing.status === 'available' ? 'sold_out' : 'available';
    updateListing(listing.id, { status: next });
  };

  return (
    <div className="px-4 pt-12 md:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
          <p className="text-xs text-gray-400 mt-0.5">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/listings/create">
          <Button size="sm" className="gap-1.5">
            <PlusCircle size={15} />
            Add
          </Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card">
          <div className="text-5xl mb-4">🍱</div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">No listings yet</h3>
          <p className="text-sm text-gray-400 mb-5">Create your first listing to reduce waste and earn</p>
          <Link href="/listings/create">
            <Button>Create First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const remaining = listing.quantity - listing.quantityReserved;
            return (
              <div key={listing.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 flex-1 leading-tight line-clamp-2">
                        {listing.title}
                      </h3>
                      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLOR[listing.status]}`}>
                        {STATUS_LABEL[listing.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatPrice(listing.price)} · {listing.quantityReserved} reserved · {remaining} left
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                      <Clock size={10} />
                      {formatPickupWindow(listing.pickupStartTime, listing.pickupEndTime)} · {timeUntil(listing.expiresAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => toggleStatus(listing)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      listing.status === 'available'
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                    }`}
                  >
                    {listing.status === 'available' ? (
                      <><ToggleRight size={13} /> Mark Sold Out</>
                    ) : (
                      <><ToggleLeft size={13} /> Mark Available</>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(listing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors ml-auto"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Listing">
        <div className="text-center">
          <div className="text-4xl mb-3">🗑️</div>
          <p className="text-sm text-gray-600 mb-1">
            Are you sure you want to delete
          </p>
          <p className="text-sm font-semibold text-gray-900 mb-5">
            "{deleteTarget?.title}"?
          </p>
          <p className="text-xs text-gray-400 mb-5">
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
