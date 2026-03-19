"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { message, Space } from "antd";
import { createWorkspaceAction } from "../actions";
import {
  ApiErrorAlert,
  Button,
  FormCard,
  Input,
  Text,
  Title,
} from "@/components/ui";
import { useLocale, useTranslations } from "next-intl";

type OnboardingClientProps = { apiError?: string | null };

export function OnboardingClient({ apiError }: OnboardingClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createName, setCreateName] = useState("");

  const handleCreate = async () => {
    const name = createName.trim();
    if (!name) {
      message.warning(t("workspace.create.enterName"));
      return;
    }
    setLoading(true);
    const result = await createWorkspaceAction(name, locale);
    setLoading(false);
    if ("redirect" in result) {
      router.push(result.redirect);
      return;
    }
    message.error(result.error);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: 448 }}>
      <ApiErrorAlert
        message={apiError ? t(apiError) : null}
        title={t("errors.apiUnreachable")}
        description={t("errors.apiUnreachableHint")}
      />
      <Space direction="vertical" align="center" size="middle">
        <Title level={2}>{t("workspace.create.getStarted")}</Title>
        <Text type="secondary">{t("workspace.create.joinLater")}</Text>
      </Space>
      <FormCard title={t("workspace.create.formTitle")}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Input
            placeholder={t("workspace.create.namePlaceholder")}
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onPressEnter={handleCreate}
            size="large"
          />
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleCreate}
            block
          >
            {t("workspace.create.submit")}
          </Button>
        </Space>
      </FormCard>
    </Space>
  );
}
