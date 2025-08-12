import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access-token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isProtectedPage = pathname.startsWith('/dashboard') || pathname.startsWith('/studio');

 
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }


  if (!accessToken && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/studio/:path*'],
};