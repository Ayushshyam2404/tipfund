import { type NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/submit", "/admin"];

// Public routes that should not be accessible when already authenticated
const publicAuthRoutes = ["/login", "/register", "/auth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the auth token from Supabase session cookie
  const supabaseSession = request.cookies.get("sb-access-token");

  // Check if user is authenticated
  const isAuthenticated = !!supabaseSession;

  // Redirect unauthenticated users to login if accessing protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from public auth routes
  if (publicAuthRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
