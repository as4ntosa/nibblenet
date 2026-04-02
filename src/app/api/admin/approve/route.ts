import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { handleCors, withCors } from '@/lib/cors';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function adminClient() {
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

async function isAdmin(callerId: string): Promise<boolean> {
  const { data } = await adminClient().from('profiles').select('is_admin').eq('id', callerId).single();
  return data?.is_admin === true;
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
  if (!callerId || !(await isAdmin(callerId))) {
    return withCors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }), req);
  }

  const { userId } = await req.json();
  if (!userId) return withCors(NextResponse.json({ error: 'userId required' }, { status: 400 }), req);

  const { error } = await adminClient()
    .from('profiles')
    .update({ provider_status: 'approved', can_provide: true })
    .eq('id', userId);

  if (error) return withCors(NextResponse.json({ error: error.message }, { status: 500 }), req);
  return withCors(NextResponse.json({ success: true }), req);
}
