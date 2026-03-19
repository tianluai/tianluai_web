"use client";

import { SignIn } from "@clerk/nextjs";
import { ScreenLayout } from "@/components/ui";

export function SignInScreen() {
  return (
    <ScreenLayout centered>
      <SignIn afterSignInUrl="/onboarding" signUpUrl="/sign-up" />
    </ScreenLayout>
  );
}
