"use client";

import { Card, Flex } from "antd";
import { useRouter } from "@/i18n/navigation";
import { Space, Title } from "@/components/ui";
import { useTranslations } from "next-intl";
import type { Workspace } from "@/lib/api-common";

type WorkspaceSelectProps = {
  workspaces: Workspace[];
};

export function WorkspaceSelect({ workspaces }: WorkspaceSelectProps) {
  const t = useTranslations("workspace.picker");
  const router = useRouter();

  return (
    <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: 720 }}>
      <Title level={2}>{t("title")}</Title>
      <Flex gap="middle" wrap="wrap">
        {workspaces.map((workspace) => {
          const label =
            workspace.role && workspace.role !== "member"
              ? `${workspace.name} (${workspace.role})`
              : workspace.name;
          return (
            <Card
              key={workspace.id}
              hoverable
              onClick={() => router.push(`/workspace/${workspace.id}`)}
              style={{ minWidth: 200, flex: "1 1 200px", maxWidth: 320 }}
            >
              <Card.Meta title={label} />
            </Card>
          );
        })}
      </Flex>
    </Space>
  );
}
