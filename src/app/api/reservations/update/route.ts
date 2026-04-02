import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleCors, withCors } from '@/lib/cors';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function serviceClient() {
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function extractUserId(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function OPTIONS(req: NextRequest) {
  return handleCors(req) ?? new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), req);

  const callerId = extractUserId(token);
  if (!callerId) return withCors(NextResponse.json({ error: 'Invalid token' }, { status: 401 }), req);

  const { reservationId, status, listingId, newReserved, newStatus } = await req.json();
  if (!reservationId || !status) {
    return withCors(NextResponse.json({ error: 'reservationId and status required' }, { status: 400 }), req);
  }

  const db = serviceClient();

  const { data: res } = await db
    .from('reservations')
    .select('consumer_id')
    .eq('id', reservationId)
    .single();

  if (!res || res.consumer_id !== callerId) {
    return withCors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }), req);
  }

  const { error } = await db.from('reservations').update({ status }).eq('id', reservationId);

  if (error) return withCors(NextResponse.json({ error: error.message }, { status: 500 }), req);

  if (listingId && newReserved !== undefined && newStatus) {
    await db.from('listings').update({ quantity_reserved: newReserved, status: newStatus }).eq('id', listingId);
  }

  return withCors(NextResponse.json({ success: true }), req);
}
