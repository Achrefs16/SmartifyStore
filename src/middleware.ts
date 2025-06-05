import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute) {
    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Check if the token has the role property
    if (!token.role) {
      console.log('No role found in token:', token);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check if the role is admin
    if (token.role !== 'admin') {
      console.log('User is not admin, role:', token.role);
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('Admin access granted');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 