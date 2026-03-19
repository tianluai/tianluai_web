"use client";

import { Link } from "@/i18n/navigation";
import { Button, Space } from "antd";
import { ScreenLayout, Text, Title } from "@/components/ui";
import { useTranslations } from "next-intl";

export function WorkspaceNotFoundScreen() {
  const t = useTranslations("workspace.notFound");
  return (
    <ScreenLayout centered>
      <Space direction="vertical" align="center" size="middle">
        <Title level={1}>{t("title")}</Title>
        <Text type="secondary">{t("description")}</Text>
        <Link href="/workspaces">
          <Button type="primary">{t("back")}</Button>
        </Link>
      </Space>
    </ScreenLayout>
  );
}
