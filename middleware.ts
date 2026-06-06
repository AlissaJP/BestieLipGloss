import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protège toutes les routes /admin/* sauf /admin/login (la page de connexion admin n'existe pas — la connexion se fait via /connexion)
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('bestie_admin_session');

    if (!adminSession || adminSession.value !== 'admin_authenticated') {
      const loginUrl = new URL('/connexion', request.url);
      loginUrl.searchParams.set('reason', 'admin_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
