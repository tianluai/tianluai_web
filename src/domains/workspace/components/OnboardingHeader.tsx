"use client";

import { UserButton, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button, Space } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";

export function OnboardingHeader() {
  const { signOut } = useClerk();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");

  const handleLogout = () => {
    signOut({ redirectUrl: `/${locale}` });
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
