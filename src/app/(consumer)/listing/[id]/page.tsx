import { MOCK_LISTINGS } from '@/lib/mock-data';
import ListingDetailClient from './ListingDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  const base = MOCK_LISTINGS.map((l) => ({ id: l.id }));

  // In Capacitor mobile builds, also pre-generate pages for live Supabase listings
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data } = await sb.from('listings').select('id').eq('is_sample', false);
      if (data) return [...base, ...data.map((r: { id: string }) => ({ id: r.id }))];
    } catch {
      // If Supabase is unreachable at build time, fall back to mock-only params
    }
  }

  return base;
}

export default function ListingDetailPage() {
  return <ListingDetailClient />;
}
