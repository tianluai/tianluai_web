"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Flex, Spin } from "antd";
import { ScreenLayout, Text, Title } from "@/components/ui";
import { useTranslations } from "next-intl";
import { getWorkspaceAction } from "../actions";
import { WorkspaceNotFoundScreen } from "./WorkspaceNotFoundScreen";

export function WorkspaceDetailScreen() {
  const t = useTranslations("workspace.detail");
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const [workspace, setWorkspace] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    getWorkspaceAction(workspaceId).then((w) => {
      setWorkspace(w);
      setLoading(false);
    });
  }, [workspaceId]);

  if (loading) {
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
