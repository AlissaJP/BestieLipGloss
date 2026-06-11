import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/adminAuth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protège /admin/dashboard et sous-routes — exclut /admin (page de connexion)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
