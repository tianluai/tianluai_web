"use client";

import { getSession, signOut as nextAuthSignOut, useSession } from "next-auth/react";

export type SignOutOptions = { redirectUrl?: string };

export type GetTokenOptions = { skipCache?: boolean };

/**
 * NextAuth (Google) session helpers.
 *
 * - **`isLoaded`**: Session status left `loading`; only then is **`isSignedIn`** reliable.
 * - **`getToken`**: Returns the HS256 API token minted for the Nest backend (`Authorization: Bearer`).
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const isSignedIn = status === "authenticated";
  const userId = session?.user?.id ?? "";

  const getToken = async (options?: GetTokenOptions) => {
    if (options?.skipCache) {
      const fresh = await getSession();
      return fresh?.apiAccessToken ?? null;
    }
    return session?.apiAccessToken ?? null;
  };

  const signOut = (options?: SignOutOptions) => {
    return nextAuthSignOut({
      callbackUrl: options?.redirectUrl ?? "/sign-in",
    });
  };

  return { isSignedIn, isLoaded, getToken, signOut, userId };
}
