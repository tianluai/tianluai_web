"use client";

// Clerk (paused): import { UserButton } from "@clerk/nextjs";
import { UserAccountMenu } from "@/components/UserAccountMenu";
import { Space } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";

export function OnboardingHeader() {
  return (
    <Space>
      <LocaleSelect />
      {/* Clerk (paused): <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} /> */}
      <UserAccountMenu />
    </Space>
  );
}
