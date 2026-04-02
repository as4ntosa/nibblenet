// Base URL for internal API routes.
// Empty string during normal web/Vercel builds (relative URLs work fine).
// Set to the Vercel deployment URL when building for Capacitor mobile.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
