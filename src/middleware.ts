import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/compte", "/admin/dashboard"];

export async function middleware(req: NextRequest) {
    const { nextUrl } = req;
    const sessionCookie = getSessionCookie(req);
    const googleAuthCookie = req.cookies.get('google-auth');

    const isLoggedIn = !!sessionCookie || !!googleAuthCookie;
    const isOnProtectedRoute = protectedRoutes.includes(nextUrl.pathname);
    const isOnAuthRoute = ["/authentification/connexion", "/authentification/inscription"].includes(nextUrl.pathname);

    if (isOnProtectedRoute && !isLoggedIn) {
        console.log("Redirecting to login page");
        return NextResponse.redirect(new URL("/authentification/connexion", req.url));
    }

    if (isOnAuthRoute && isLoggedIn && nextUrl.pathname !== "/compte") {
        console.log("Redirecting to profile page", new URL("/compte", req.url).toString());
        return NextResponse.redirect(new URL("/compte", req.url));
    }
    

    return NextResponse.next();
}
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
    ]
}