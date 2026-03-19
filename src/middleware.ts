import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18n = createIntlMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/",
  "/(en|es)",
  "/(en|es)/sign-in(.*)",
  "/(en|es)/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  return handleI18n(req);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
