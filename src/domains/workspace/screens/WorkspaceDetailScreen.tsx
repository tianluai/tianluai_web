"use client";

import { useParams } from "next/navigation";
import { Card, Flex, Spin } from "antd";
import { ScreenLayout, Text, Title } from "@/components/ui";
import { useTranslations } from "next-intl";
import { useWorkspace } from "../workspace.queries";
import { WorkspaceNotFoundScreen } from "./WorkspaceNotFoundScreen";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";

export function WorkspaceDetailScreen() {
  const translate = useTranslations("workspace.detail");
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
    <ScreenLayout centered={false} contentMaxWidth={1200}>
      <Flex gap="large" align="start" wrap>
        <Card style={{ flex: 1, minWidth: 360 }}>
          <Flex vertical align="center" gap="middle">
            <Title level={2} style={{ margin: 0 }}>
              {workspace.name}
            </Title>
            <Text type="secondary">{translate("contentPlaceholder")}</Text>
            <Link href={`/workspace/${workspaceId}/chat`}>
              <Button type="primary">{translate("openChat")}</Button>
            </Link>
          </Flex>
        </Card>
      </Flex>
    </ScreenLayout>
  );
}
