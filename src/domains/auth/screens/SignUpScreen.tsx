"use client";

import { SignUp } from "@clerk/nextjs";
import { ScreenLayout } from "@/components/ui";

export function SignUpScreen() {
  return (
    <ScreenLayout centered>
      <SignUp afterSignUpUrl="/onboarding" signInUrl="/sign-in" />
    </ScreenLayout>
  );
}
