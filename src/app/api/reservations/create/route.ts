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

  const body = await req.json();

  if (body.consumer_id !== callerId) {
    return withCors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }), req);
  }

  const db = serviceClient();

  const { data: resRow, error: resErr } = await db
    .from('reservations')
    .insert(body.reservation)
    .select()
    .single();

  if (resErr) return withCors(NextResponse.json({ error: resErr.message }, { status: 500 }), req);

  const { error: listingErr } = await db
    .from('listings')
    .update({ quantity_reserved: body.newReserved, status: body.newStatus })
    .eq('id', body.listingId);

  if (listingErr) return withCors(NextResponse.json({ error: listingErr.message }, { status: 500 }), req);

  return withCors(NextResponse.json(resRow), req);
}
