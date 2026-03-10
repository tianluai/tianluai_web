"use client";

import { UserButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function OnboardingHeader() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = () => {
    signOut({ redirectUrl: "/" });
    router.push("/");
  };

  return (
    <div className="flex items-center gap-3">
      <Button type="default" onClick={handleLogout}>
        Log out
      </Button>
      <UserButton
        afterSignOutUrl="/"
        appearance={{ elements: { avatarBox: "h-8 w-8" } }}
      />
    </div>
  );
}
