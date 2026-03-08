'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ListingFilters, Category, CuisineTag } from '@/types';
import { CATEGORIES, CUISINE_TAGS, CATEGORY_EMOJI, cn } from '@/lib/utils';

interface FilterSheetProps {
  filters: ListingFilters;
  onChange: (f: ListingFilters) => void;
}

export function FilterSheet({ filters, onChange }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<ListingFilters>(filters);

  const activeCount = [
    filters.category,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.tags && filters.tags.length > 0,
  ].filter(Boolean).length;

  const apply = () => {
    onChange(local);
    setOpen(false);
  };

  const reset = () => {
    const clean: ListingFilters = {};
    setLocal(clean);
    onChange(clean);
    setOpen(false);
  };

  const toggleTag = (tag: CuisineTag) => {
    const tags = local.tags || [];
    setLocal({
      ...local,
      tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
    });
  };

  return (
    <>
      <button
        onClick={() => { setLocal(filters); setOpen(true); }}
        className="relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Filter Listings">
        <div className="space-y-5">
          {/* Category */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Category</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLocal({ ...local, category: local.category === cat ? '' : cat })}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
                    local.category === cat
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  )}
                >
                  <span>{CATEGORY_EMOJI[cat]}</span>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Max Price</p>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    setLocal({ ...local, maxPrice: local.maxPrice === p ? undefined : p })
                  }
                  className={cn(
                    'flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
                    local.maxPrice === p
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-gray-200 bg-white text-gray-600'
                  )}
                >
                  ${p}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine tags */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Cuisine</p>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag as CuisineTag)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
                    local.tags?.includes(tag as CuisineTag)
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-gray-200 bg-white text-gray-600'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={reset} fullWidth>
              Reset
            </Button>
            <Button onClick={apply} fullWidth>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
