import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/compte", "/admin/dashboard"];
const authRoutes = ["/authentification/connexion", "/authentification/inscription"];
const redirectRoute = "/recycler-planche/redirect";
export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie = getSessionCookie(req);
  const googleAuthCookie = req.cookies.get("google-auth");

  const isLoggedIn = !!sessionCookie || !!googleAuthCookie;
  const pathname = nextUrl.pathname;

  const isOnProtectedRoute = protectedRoutes.includes(pathname);
  const isOnAuthRoute = authRoutes.includes(pathname);


  if (isOnProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/authentification/connexion", req.url));
  }

  if (isOnAuthRoute && isLoggedIn && pathname !== "/compte") {
    return NextResponse.redirect(new URL("/compte", req.url));
  }

  if (pathname === "/panier/redirect" && isLoggedIn) {
    return NextResponse.redirect(new URL("/paiement/livraison", req.url));
  }

  if (redirectRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/recycler-planche", req.url));
}

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
