import { NextResponse } from 'next/server';

const RESERVED = new Set(['www', 'admin', 'api', 'app', 'localhost']);

function extractSubdomain(hostname) {
  const host = hostname.split(':')[0];
  const parts = host.split('.');
  if (parts.length < 2) return null;
  const sub = parts[0];
  if (RESERVED.has(sub)) return null;
  return sub;
}

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const subdomain = extractSubdomain(hostname);
  if (!subdomain) return NextResponse.next();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant', subdomain);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
