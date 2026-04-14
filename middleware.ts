import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18n = createIntlMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  // Clerk handshake on `/` must not be redirected by next-intl (`localePrefix: "always"` drops/breaks it).
  if (req.nextUrl.searchParams.has("__clerk_handshake")) {
    return NextResponse.next();
  }
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  return handleI18n(req);
});

export const config = {
  matcher: [
    // `'/((?!…).*)'` alone often does not match the root path `/`, so next-intl never rewrites
    // `/` → `/en/...` and all `[locale]` routes 404. See vercel/next.js#62078.
    "/",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
