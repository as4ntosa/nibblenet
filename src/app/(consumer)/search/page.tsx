'use client';

import { useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/listing/ListingCard';
import { FilterSheet } from '@/components/listing/FilterSheet';
import { useData } from '@/context/DataContext';
import { ListingFilters } from '@/types';

export default function SearchPage() {
  const router = useRouter();
  const { getListings } = useData();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ListingFilters>({});

  const results = getListings({ ...filters, query });

  return (
    <div>
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Search</h1>
        </div>

        <div className="flex gap-2">
          {/* Search input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search food, restaurants, categories…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-9 py-3 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <FilterSheet filters={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {query || Object.keys(filters).some((k) => (filters as any)[k]) ? (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''}
              {query && ` for "${query}"`}
            </p>
            {results.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-base font-semibold text-gray-700 mb-1">No results found</h3>
                <p className="text-sm text-gray-400">Try different keywords or remove some filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {results.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="text-xs text-gray-400 mb-3">All available listings</p>
            <div className="grid grid-cols-2 gap-3">
              {getListings().map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
