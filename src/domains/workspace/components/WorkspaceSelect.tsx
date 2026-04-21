"use client";

import { DeleteOutlined } from "@ant-design/icons";
import { Card, Flex, message, Popconfirm, Typography } from "antd";
import { useRouter } from "@/i18n/navigation";
import { Button, Space, Title } from "@/components/ui";
import { useTranslations } from "next-intl";
import type { Workspace } from "@/lib/api-common";
import { useDeleteWorkspace } from "../workspace.queries";

type WorkspaceSelectProps = {
  workspaces: Workspace[];
};

export function WorkspaceSelect({ workspaces }: WorkspaceSelectProps) {
  const translate = useTranslations("workspace.picker");
  const router = useRouter();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const handleDeleteWorkspace = (workspaceId: string) => {
    deleteWorkspaceMutation.mutate(workspaceId, {
      onSuccess: () => {
        message.success(translate("deleteSuccess"));
      },
      onError: (error) => {
        const deleteErrorMessage =
          error instanceof Error ? error.message : "workspace.create.errorGeneric";
        message.error(translate(deleteErrorMessage));
      },
    });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: 720 }}>
      <Title level={2}>{translate("title")}</Title>
      <Flex gap="middle" wrap="wrap">
        {workspaces.map((workspace) => {
          const label =
            workspace.role && workspace.role !== "member"
              ? `${workspace.name} (${workspace.role})`
              : workspace.name;
          const isOwner = workspace.role === "owner";
          return (
            <Card
              key={workspace.id}
              hoverable
              onClick={() => router.push(`/workspace/${workspace.id}`)}
              styles={{
                body: {
                  padding: "14px 16px",
                },
              }}
              style={{ minWidth: 200, flex: "1 1 200px", maxWidth: 320 }}
            >
              <Flex align="center" justify="space-between" gap={12} wrap="nowrap">
                <Typography.Text
                  strong
                  ellipsis
                  title={label}
                  style={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: 1.4 }}
                >
                  {label}
                </Typography.Text>
                {isOwner ? (
                  <Popconfirm
                    title={translate("deleteConfirmTitle")}
                    description={translate("deleteConfirmDescription")}
                    okText={translate("deleteConfirmOk")}
                    cancelText={translate("deleteConfirmCancel")}
                    onConfirm={(event) => {
                      event?.stopPropagation();
                      handleDeleteWorkspace(workspace.id);
                    }}
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      loading={deleteWorkspaceMutation.isPending}
                      disabled={deleteWorkspaceMutation.isPending}
                      aria-label={translate("deleteAria", { name: workspace.name })}
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    />
                  </Popconfirm>
                ) : null}
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Space>
  );
}
