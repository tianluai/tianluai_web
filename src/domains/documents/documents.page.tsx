"use client";

import { Alert, Space, Spin, Typography } from "antd";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui";
import { Button } from "@/components/ui";
import { useDriveOAuthUrlAlertMessage } from "@/domains/documents/hooks/use-drive-oauth-url-alert";
import { useWorkspaces } from "@/domains/workspace/workspace.queries";

function DocumentsOAuthRedirectAlert() {
  const message = useDriveOAuthUrlAlertMessage();
  if (!message) return null;
  return <Alert type="error" message={message} className="mb-4" showIcon />;
}

export default function DocumentsWorkspacePickerPage() {
  const translate = useTranslations("documents");
  const { data: workspaces = [], isLoading } = useWorkspaces();

  return (
    <PageLayout centered={false}>
      <Suspense fallback={null}>
        <DocumentsOAuthRedirectAlert />
      </Suspense>
      <Typography.Title level={4}>{translate("pickWorkspaceTitle")}</Typography.Title>
      <Typography.Paragraph type="secondary" className="mt-1">
        {translate("pickWorkspaceLead")}
      </Typography.Paragraph>
      <div className="mt-6">
        {isLoading ? (
          <Spin />
        ) : workspaces.length === 0 ? (
          <Typography.Paragraph>
            <Link href="/onboarding?create=true">{translate("createWorkspaceFirst")}</Link>
          </Typography.Paragraph>
        ) : (
          <Space direction="vertical" className="w-full" size="middle">
            {workspaces.map((workspace) => (
              <Link key={workspace.id} href={`/workspace/${workspace.id}/documents`}>
                <Button type="default" block>
                  {workspace.name}
                </Button>
              </Link>
            ))}
          </Space>
        )}
      </div>
    </PageLayout>
  );
}
