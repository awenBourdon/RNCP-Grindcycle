import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/compte", "/admin/dashboard"];

export async function middleware(req: NextRequest) {
    const { nextUrl } = req;
    const sessionCookie = getSessionCookie(req);
    const googleAuthCookie = req.cookies.get('google-auth');

    const res = NextResponse.next();

    const isLoggedIn = !!sessionCookie || !!googleAuthCookie;
    const isOnProtectedRoute =  protectedRoutes.includes(nextUrl.pathname);
    const isOnAuthRoute = nextUrl.pathname.startsWith("/authentification");

    if (isOnProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/authentification/connexion", req.url))
    }

    if (isOnAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/compte", req.url))
    }

    return res;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
    ]
}