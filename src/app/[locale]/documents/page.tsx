"use client";

import { useAuth } from "@clerk/nextjs";
import { Layout, Space, Spin, Typography } from "antd";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui";
import { Button } from "@/components/ui";
import { useWorkspaces } from "@/domains/workspace/workspace.queries";

export default function DocumentsWorkspacePickerPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const t = useTranslations("documents");
  const { data: workspaces = [], isLoading } = useWorkspaces();

  if (!isLoaded) {
    return (
      <PageLayout centered>
        <Spin />
      </PageLayout>
    );
  }

  if (!isSignedIn) {
    return (
      <Layout className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Space direction="vertical" align="center">
          <Typography.Text type="secondary">{t("signInPrompt")}</Typography.Text>
          <Link href="/sign-in">
            <Button type="primary">{t("signIn")}</Button>
          </Link>
        </Space>
      </Layout>
    );
  }

  return (
    <PageLayout centered={false}>
      <Typography.Title level={4}>{t("pickWorkspaceTitle")}</Typography.Title>
      <Typography.Paragraph type="secondary" className="mt-1">
        {t("pickWorkspaceLead")}
      </Typography.Paragraph>
      {isLoading && <Spin className="mt-6" />}
      {!isLoading && workspaces.length === 0 && (
        <Typography.Paragraph className="mt-6">
          <Link href="/onboarding?create=true">{t("createWorkspaceFirst")}</Link>
        </Typography.Paragraph>
      )}
      {!isLoading && workspaces.length > 0 && (
        <Space direction="vertical" className="mt-6 w-full" size="middle">
          {workspaces.map((w) => (
            <Link key={w.id} href={`/workspace/${w.id}/documents`}>
              <Button type="default" block>
                {w.name}
              </Button>
            </Link>
          ))}
        </Space>
      )}
    </PageLayout>
  );
}
