// Clerk (paused):
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { routing } from "@/i18n/routing";
import { auth } from "./auth";

const handleI18n = createIntlMiddleware(routing);

// Clerk (paused):
// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
// ]);
// export default clerkMiddleware(async (auth, req: NextRequest) => {
//   const pathname = req.nextUrl.pathname;
//   if (pathname.startsWith("/api")) {
//     return NextResponse.next();
//   }
//   if (req.nextUrl.searchParams.has("__clerk_handshake")) {
//     return NextResponse.next();
//   }
//   if (!isPublicRoute(req)) {
//     await auth.protect();
//   }
//   return handleI18n(req);
// });

const isPublicPath = (pathname: string) =>
  pathname === "/" ||
  pathname.startsWith("/sign-in") ||
  pathname.startsWith("/sign-up") ||
  pathname.startsWith("/api/auth");

function redirectUnauthenticatedToSignIn(req: NextAuthRequest): NextResponse {
  const signIn = new URL("/sign-in", req.url);
  const returnTo = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const shouldAttachCallback = Boolean(returnTo) && returnTo !== "/sign-in";
  if (shouldAttachCallback) signIn.searchParams.set("callbackUrl", returnTo);
  return NextResponse.redirect(signIn);
}

export default auth((req: NextAuthRequest) => {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  if (!isPublicPath(pathname) && !req.auth) {
    return redirectUnauthenticatedToSignIn(req);
  }
  return handleI18n(req);
});

export const config = {
  matcher: [
    "/",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
