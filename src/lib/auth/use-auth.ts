"use client";

import { useAuth as useClerkAuth, useClerk } from "@clerk/nextjs";
export type SignOutOptions = { redirectUrl?: string };

/**
 * Clerk auth helpers.
 *
 * - **`isLoaded`**: Clerk has finished its client bootstrap; only then is **`isSignedIn`** reliable.
 *   Before that, treat session as unknown (show a shell or don’t branch on `isSignedIn`).
 * - There is no separate `isLoading` flag; the “still resolving” phase is **`!isLoaded`**.
 */
export function useAuth() {
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();

  const signOut = (options?: SignOutOptions) => {
    const redirectUrl = options?.redirectUrl ?? "/sign-in";
    return clerkSignOut({ redirectUrl });
  };

  return { isSignedIn, isLoaded, getToken, signOut };
}
