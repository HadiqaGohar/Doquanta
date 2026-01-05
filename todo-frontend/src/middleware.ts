import { NextRequest, NextResponse } from 'next/server';

// Protect routes that require authentication
export async function middleware(request: NextRequest) {
  // Define protected routes
  const protectedPaths = [
    // /^\/dashboard(\/.*)?$/,  // All dashboard routes
    /^\/profile(\/.*)?$/,    // Profile routes
    /^\/settings(\/.*)?$/,   // Settings routes
    // /^\/tasks(\/.*)?$/,      // Task routes
  ];
  

  // Check if the current path matches any protected route
  const isProtectedRoute = protectedPaths.some(pathPattern => 
    pathPattern.test(request.nextUrl.pathname)
  );

  if (isProtectedRoute) {
    // Get the auth token from cookies
    try {
      // Using Better Auth's session token
      const token = request.cookies.get('__Secure-bta-s') || request.cookies.get('bta-s'); // Better Auth session cookie names
      
      if (!token) {
        // Redirect to login if no token exists
        const url = request.nextUrl.clone();
        url.pathname = '/sign-in';
        url.search = `callbackUrl=${request.nextUrl.pathname}`;
        return NextResponse.redirect(url);
      }

      // If we have a token, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware auth error:', error);
      // If there's an error verifying the token, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      url.search = `callbackUrl=${request.nextUrl.pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // For non-protected routes, allow the request to proceed
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};