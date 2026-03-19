"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, Space } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScreenLayout, Text, Title } from "@/components/ui";
import { getSessionAction } from "../actions";

export function HomeScreen() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");

  useEffect(() => {
    getSessionAction().then(({ userId }) => {
      if (userId) router.replace(`/${locale}/onboarding`);
    });
  }, [router, locale]);

  return (
    <ScreenLayout centered>
      <Space direction="vertical" align="center" size="large">
        <Title level={1}>{t("title")}</Title>
        <Text type="secondary">{t("signInPrompt")}</Text>
        <Space>
          <Link href="/sign-in">
            <Button type="primary">{t("signIn")}</Button>
          </Link>
          <Link href="/sign-up">
            <Button>{t("signUp")}</Button>
          </Link>
        </Space>
      </Space>
    </ScreenLayout>
  );
}
