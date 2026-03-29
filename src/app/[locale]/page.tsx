"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useAuth } from "@/lib/auth/use-auth";

export default function HomePage() {
  const router = useRouter();
  const locale = useLocale();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace(`/${locale}/onboarding`);
    } else {
      router.replace(`/${locale}/sign-in`);
    }
  }, [isLoaded, isSignedIn, router, locale]);

  return null;
}
