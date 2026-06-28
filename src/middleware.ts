import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAIN = 'chatfi.pro';
const RESERVED_SUBDOMAINS = ['store', 'pay', 'www'];

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const cleanHost = hostname.split(':')[0];

  // chatfi.pro subdomains (existing behavior)
  if (cleanHost.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = cleanHost.replace(`.${ROOT_DOMAIN}`, '');
    if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Never treat Vercel's own preview domains or localhost as custom domains
  if (cleanHost.endsWith('.vercel.app') || cleanHost === 'localhost' || cleanHost.endsWith('.localhost')) {
    return NextResponse.next();
  }

  // Otherwise, this could be a merchant's connected custom domain — resolve it
  try {
    const lookupRes = await fetch(`https://pay.chatfi.pro/api/domain-lookup?domain=${cleanHost}`);
    if (lookupRes.ok) {
      const data = await lookupRes.json();
      if (data.username) {
        const url = request.nextUrl.clone();
        url.pathname = `/${data.username}${url.pathname === '/' ? '' : url.pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch {
    // lookup failed — fall through
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
