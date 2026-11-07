import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow home page and auth routes unconditionally
  if (
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Check if session token cookie exists
  const sessionToken = getSessionCookie(request);

  if (!sessionToken) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - assets/* (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets/).*)",
  ],
};
