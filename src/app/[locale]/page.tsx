"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useLocale } from "next-intl";

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
