import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://nibblenet-kappa.vercel.app',
  'capacitor://localhost',   // iOS Capacitor WebView
  'http://localhost',        // Android Capacitor WebView
  'http://localhost:3000',   // Local dev
];

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function handleCors(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }
  return null;
}

export function withCors(res: NextResponse, req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');
  Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
