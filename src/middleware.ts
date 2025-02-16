import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    // Retrieve the token using NextAuth's getToken function
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Define the paths where authentication is NOT required
    const publicPaths: string[] = ['/', '/auth/signin', '/auth/signup'];

    const { pathname } = new URL(req.url);

    console.log('token', token, pathname);

    // If the route is public or the token exists, allow access
    if (publicPaths.includes(pathname) || pathname.startsWith('/_next') || token) {
        return NextResponse.next();
    }

    console.log('redirecting');

    // Redirect to the homepage if not authenticated
    return NextResponse.redirect(new URL('/', req.url));
}

// Apply the middleware to all routes
export const config = {
    matcher: '/((?!api/auth).*)', // Exclude NextAuth routes by default
};