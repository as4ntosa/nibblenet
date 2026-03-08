'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ListingCard } from '@/components/listing/ListingCard';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Category, Listing } from '@/types';
import { CATEGORIES, CATEGORY_EMOJI, cn, haversineKm } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function HomePage() {
  const { user } = useAuth();
  const { getListings } = useData();
  const searchParams = useSearchParams();
  const { coords, status, request } = useGeolocation();

  const [activeCategory, setActiveCategory] = useState<Category | ''>(() => {
    const cat = searchParams.get('category');
    return (cat as Category) || '';
  });

  const rawListings = getListings(activeCategory ? { category: activeCategory } : undefined);

  // Enrich with real distances when we have coords, then sort nearest first
  const listings: Listing[] = coords
    ? [...rawListings]
        .map((l) =>
          l.pickupLat != null && l.pickupLng != null
            ? { ...l, distance: haversineKm(coords.latitude, coords.longitude, l.pickupLat, l.pickupLng) }
            : l
        )
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    : rawListings;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">{greeting()}</p>
            <h1 className="text-lg font-bold text-gray-900">
              {user?.name?.split(' ')[0] || 'Welcome'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Location pill */}
            {status === 'granted' ? (
              <div className="flex items-center gap-1 text-xs text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-1.5 rounded-full">
                <Navigation size={11} className="fill-brand-600 text-brand-600" />
                Near you
              </div>
            ) : status === 'loading' ? (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-full">
                <Loader2 size={11} className="animate-spin" />
                Locating…
              </div>
            ) : status === 'denied' ? (
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-full">
                <MapPin size={11} />
                {user?.city || 'Location off'}
              </div>
            ) : (
              // idle or unavailable — show city or "Use location" button
              user?.city ? (
                <button
                  onClick={request}
                  className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <MapPin size={11} />
                  {user.city}
                </button>
              ) : (
                <button
                  onClick={request}
                  className="flex items-center gap-1 text-xs text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1.5 rounded-full hover:bg-brand-100 transition-colors"
                >
                  <Navigation size={11} />
                  Use location
                </button>
              )
            )}
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-700 font-semibold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <Link href="/search">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
            <Search size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Search food, restaurants…</span>
          </div>
        </Link>

        {/* Category scroll */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => setActiveCategory('')}
            className={cn(
              'shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors border',
              activeCategory === ''
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors border',
                activeCategory === cat
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              )}
            >
              <span>{CATEGORY_EMOJI[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            {activeCategory ? activeCategory : status === 'granted' ? 'Nearest to you' : 'Nearby Listings'}
            <span className="text-gray-400 font-normal ml-1">({listings.length})</span>
          </h2>
          <Link href="/search" className="text-xs text-brand-600 font-medium">
            See all
          </Link>
        </div>

        {/* Location permission prompt */}
        {status === 'idle' && (
          <button
            onClick={request}
            className="w-full flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-4 text-left hover:bg-brand-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <Navigation size={15} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-700">Find providers near you</p>
              <p className="text-xs text-brand-500">Tap to sort listings by your distance</p>
            </div>
          </button>
        )}

        {status === 'denied' && (
          <div className="w-full flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
            <MapPin size={15} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">Location access denied. Enable it in your browser settings to sort by distance.</p>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🍃</div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No listings found</h3>
            <p className="text-sm text-gray-400">Try a different category or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
