"use client";

import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/use-auth";
import { Button, Space } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";

export function OnboardingHeader() {
  const { signOut } = useAuth();
  const router = useRouter();
  const translate = useTranslations("auth");

  const handleLogout = () => {
    void signOut({ redirectUrl: "/" });
    router.push("/");
  };

  return (
    <Space>
      <LocaleSelect />
      <Button type="default" onClick={handleLogout}>
        {translate("logOut")}
      </Button>
      <UserButton
        afterSignOutUrl="/"
        appearance={{ elements: { avatarBox: "h-8 w-8" } }}
      />
    </Space>
  );
}
