import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAIN = 'chatfi.pro';
const RESERVED_SUBDOMAINS = ['store', 'pay', 'www'];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const cleanHost = hostname.split(':')[0];

  if (!cleanHost.endsWith(`.${ROOT_DOMAIN}`)) {
    return NextResponse.next();
  }

  const subdomain = cleanHost.replace(`.${ROOT_DOMAIN}`, '');

  if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
