"use client";

import { Link } from "@/i18n/navigation";
import { Button, Space } from "antd";
import { ScreenLayout, Text, Title } from "@/components/ui";
import { useTranslations } from "next-intl";

export function WorkspaceNotFoundScreen() {
  const translate = useTranslations("workspace.notFound");
  return (
    <ScreenLayout centered>
      <Space direction="vertical" align="center" size="middle">
        <Title level={1}>{translate("title")}</Title>
        <Text type="secondary">{translate("description")}</Text>
        <Link href="/workspaces">
          <Button type="primary">{translate("back")}</Button>
        </Link>
      </Space>
    </ScreenLayout>
  );
}
