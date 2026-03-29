"use client";

import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/use-auth";
import { Button, Space } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";

export function OnboardingHeader() {
  const { signOut } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");

  const handleLogout = () => {
    void signOut({ redirectUrl: `/${locale}` });
    router.push(`/${locale}`);
  };

  return (
    <Space>
      <LocaleSelect />
      <Button type="default" onClick={handleLogout}>
        {t("logOut")}
      </Button>
      <UserButton
        afterSignOutUrl="/"
        appearance={{ elements: { avatarBox: "h-8 w-8" } }}
      />
    </Space>
  );
}
