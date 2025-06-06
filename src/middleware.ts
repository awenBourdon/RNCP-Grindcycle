import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/compte", "/admin/dashboard"];
const authRoutes = ["/authentification/connexion", "/authentification/inscription"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  
  const sessionCookie = getSessionCookie(req);
  const googleAuthCookie = req.cookies.get("google-auth");
  const isLoggedIn = !!sessionCookie || !!googleAuthCookie;
  
  const isOnProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isOnAuthRoute = authRoutes.includes(pathname);
  
  if (isOnProtectedRoute && !isLoggedIn) {
    const redirectUrl = new URL("/authentification/connexion", req.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  if (isOnAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/compte", req.url));
  }
  
  if (pathname === "/panier/redirect" && isLoggedIn) {
    return NextResponse.redirect(new URL("/paiement/livraison", req.url));
  }
  
  if (pathname === "/recycler-planche/redirect" && isLoggedIn) {
    return NextResponse.redirect(new URL("/recycler-planche", req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt (SEO files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};