/**
 * Paths that skip the global “wait for Clerk session” shell.
 * Keep in sync with public paths in root `middleware.ts` (`isPublicPath`).
 */
export function isAuthShellSkippedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/sign-in")) return true;
  if (pathname.startsWith("/sign-up")) return true;
  return false;
}
