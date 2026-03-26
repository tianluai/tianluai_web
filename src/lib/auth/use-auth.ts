"use client";

import { useAuth as useClerkAuth, useClerk } from "@clerk/nextjs";
import { useLocale } from "next-intl";

export type SignOutOptions = { redirectUrl?: string };

export function useAuth() {
  const { isSignedIn, isLoaded, getToken } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();
  const locale = useLocale();

  const signOut = (options?: SignOutOptions) => {
    const redirectUrl = options?.redirectUrl ?? `/${locale}/sign-in`;
    return clerkSignOut({ redirectUrl });
  };

  return { isSignedIn, isLoaded, getToken, signOut };
}
