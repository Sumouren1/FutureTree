import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/form', '/explore', '/tree', '/future'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !authToken) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
