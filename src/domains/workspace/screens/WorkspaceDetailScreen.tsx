"use client";

import { useParams } from "next/navigation";
import { Card, Flex, Spin } from "antd";
import { ScreenLayout, Text, Title } from "@/components/ui";
import { useTranslations } from "next-intl";
import { useWorkspace } from "../workspace.queries";
import { WorkspaceNotFoundScreen } from "./WorkspaceNotFoundScreen";

export function WorkspaceDetailScreen() {
  const t = useTranslations("workspace.detail");
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const { data: workspace, isLoading } = useWorkspace(workspaceId);

  if (isLoading) {
    return (
      <ScreenLayout centered>
        <Spin size="large" />
      </ScreenLayout>
    );
  }
  if (!workspace) return <WorkspaceNotFoundScreen />;

  return (
    <ScreenLayout centered={false} contentMaxWidth={896}>
      <Card>
        <Flex vertical align="center" gap="middle">
          <Title level={2} style={{ margin: 0 }}>
            {workspace.name}
          </Title>
          <Text type="secondary">{t("contentPlaceholder")}</Text>
        </Flex>
      </Card>
    </ScreenLayout>
  );
}
