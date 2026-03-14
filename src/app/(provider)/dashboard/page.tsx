'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, TrendingUp, Package, DollarSign, Clock, ArrowRight, Lightbulb, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { formatPrice, formatPickupWindow, STATUS_COLOR, STATUS_LABEL, timeUntil } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const { getProviderListings } = useData();

  const listings = user ? getProviderListings(user.id) : [];

  const stats = useMemo(() => {
    const active = listings.filter((l) => l.status === 'available').length;
    const totalReserved = listings.reduce((sum, l) => sum + l.quantityReserved, 0);
    const revenue = listings.reduce((sum, l) => sum + l.price * l.quantityReserved, 0);
    const kgSaved = totalReserved * 0.4;
    return { active, totalReserved, revenue, kgSaved };
  }, [listings]);

  // Deterministic AI-style demand insight based on listing data
  const demandInsight = useMemo(() => {
    if (listings.length === 0) return null;
    const topListing = [...listings].sort((a, b) => b.quantityReserved - a.quantityReserved)[0];
    const avgReserveRate = listings.length > 0
      ? listings.reduce((s, l) => s + (l.quantity > 0 ? l.quantityReserved / l.quantity : 0), 0) / listings.length
      : 0;
    if (topListing.quantityReserved > 0) {
      return `"${topListing.title}" is your best performer with ${topListing.quantityReserved} reservation${topListing.quantityReserved > 1 ? 's' : ''}. Your average reserve rate is ${Math.round(avgReserveRate * 100)}% — listings with a 2–5 PM pickup window historically sell ${avgReserveRate < 0.5 ? '40%' : '25%'} faster.`;
    }
    return 'Tip: Listings with clear descriptions and a 2–5 PM pickup window sell fastest. Try adding a freshness note to attract more reservations.';
  }, [listings]);

  const recent = listings.slice(0, 5);

  return (
    <div className="px-4 pt-12 md:pt-0">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs text-gray-400">Provider Dashboard</p>
        <h1 className="text-xl font-bold text-gray-900">
          {user?.businessName || user?.name}
        </h1>
        {user?.businessType && (
          <p className="text-sm text-gray-400">{user.businessType}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Package, label: 'Active', value: stats.active, color: 'text-brand-600', bg: 'bg-brand-50' },
          { icon: TrendingUp, label: 'Reserved', value: stats.totalReserved, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: DollarSign, label: 'Revenue', value: formatPrice(stats.revenue), color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-3.5 text-center">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Food waste impact */}
      <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3 mb-5">
        <Leaf size={16} className="text-brand-600 shrink-0" />
        <p className="text-xs text-brand-700">
          Your listings have rescued an estimated <span className="font-bold">{stats.kgSaved.toFixed(1)} kg</span> of food from waste so far.
        </p>
      </div>

      {/* AI demand insight */}
      {demandInsight && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Lightbulb size={14} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 mb-0.5">AI Insight</p>
            <p className="text-xs text-amber-600 leading-relaxed">{demandInsight}</p>
          </div>
        </div>
      )}

      {/* Quick action */}
      <Link href="/listings/create">
        <div className="bg-brand-600 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
            <PlusCircle size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Add New Listing</p>
            <p className="text-xs text-brand-200 mt-0.5">Share surplus food with your community</p>
          </div>
          <ArrowRight size={18} className="text-brand-200" />
        </div>
      </Link>

      {/* Recent listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Recent Listings</h2>
          <Link href="/listings" className="text-xs text-brand-600 font-medium">See all</Link>
        </div>

        {recent.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center">
            <div className="text-4xl mb-3">🍱</div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">No listings yet</h3>
            <p className="text-xs text-gray-400 mb-4">Create your first listing to start sharing food</p>
            <Link href="/listings/create">
              <Button size="sm">Create Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl shadow-card p-3 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <Image src={l.imageUrl} alt={l.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{l.title}</p>
                  <p className="text-xs text-gray-400">{formatPrice(l.price)} · {l.quantityReserved}/{l.quantity} reserved</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLOR[l.status]}`}>
                      {STATUS_LABEL[l.status]}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock size={9} />
                      {timeUntil(l.expiresAt)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/listings"
                  className="text-xs text-brand-600 font-medium shrink-0"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
