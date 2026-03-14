import { FoodCondition, Listing } from '@/types';

const CONDITION_BONUS: Record<FoodCondition, number> = {
  frozen: 38,
  packaged: 33,
  uncooked: 22,
  cooked: 18,
  perishable: 12,
  raw: 8,
};

export function computeFreshnessScore(listing: Listing): number {
  const now = Date.now();
  const expiresAt = new Date(listing.expiresAt).getTime();
  const preparedAt = listing.preparedAt
    ? new Date(listing.preparedAt).getTime()
    : now - 3_600_000;

  const totalWindow = expiresAt - preparedAt;
  const remaining = expiresAt - now;

  if (remaining <= 0) return 0;
  if (totalWindow <= 0) return 50;

  const timeScore = Math.max(0, (remaining / totalWindow) * 62);
  const conditionBonus = CONDITION_BONUS[listing.foodCondition ?? 'cooked'];
  return Math.min(100, Math.round(timeScore + conditionBonus));
}

export type FreshnessLevel = 'fresh' | 'good' | 'grab-soon' | 'urgent';

export function getFreshnessLevel(score: number): FreshnessLevel {
  if (score >= 80) return 'fresh';
  if (score >= 50) return 'good';
  if (score >= 20) return 'grab-soon';
  return 'urgent';
}

export const FRESHNESS_CONFIG: Record<
  FreshnessLevel,
  { label: string; pill: string }
> = {
  fresh:       { label: '🟢 Fresh',      pill: 'text-green-700 bg-green-50 border border-green-200' },
  good:        { label: '🟡 Good',       pill: 'text-yellow-700 bg-yellow-50 border border-yellow-200' },
  'grab-soon': { label: '🟠 Grab Soon',  pill: 'text-orange-700 bg-orange-50 border border-orange-200' },
  urgent:      { label: '🔴 Urgent',     pill: 'text-red-700 bg-red-50 border border-red-200' },
};
