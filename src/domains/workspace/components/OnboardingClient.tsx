"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { message, Space } from "antd";
import { useTranslations } from "next-intl";
import { useCreateWorkspace } from "../workspace.queries";
import {
  ApiErrorAlert,
  Button,
  FormCard,
  Input,
  Text,
  Title,
} from "@/components/ui";

type OnboardingClientProps = { apiError?: string | null };

export function OnboardingClient({ apiError }: OnboardingClientProps) {
  const translate = useTranslations();
  const router = useRouter();
  const [createName, setCreateName] = useState("");
  const create = useCreateWorkspace();

  const handleCreate = async () => {
    if (create.isPending) return;
    const name = createName.trim();
    if (!name) {
      message.warning(translate("workspace.create.enterName"));
      return;
    }

    create.mutate(name, {
      onSuccess: (workspace) => {
        router.push(`/workspace/${workspace.id}`);
      },
      onError: (error) => {
        message.error(translate(error.message));
      },
    });
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: 448 }}>
      <ApiErrorAlert
        message={apiError ? translate(apiError) : null}
        title={translate("errors.apiUnreachable")}
        description={translate("errors.apiUnreachableHint")}
      />
      <Space direction="vertical" align="center" size="middle">
        <Title level={2}>{translate("workspace.create.getStarted")}</Title>
        <Text type="secondary">{translate("workspace.create.joinLater")}</Text>
      </Space>
      <FormCard title={translate("workspace.create.formTitle")}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Input
            placeholder={translate("workspace.create.namePlaceholder")}
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            onPressEnter={handleCreate}
            disabled={create.isPending}
            size="large"
          />
          <Button
            type="primary"
            size="large"
            loading={create.isPending}
            disabled={create.isPending}
            onClick={handleCreate}
            block
          >
            {translate("workspace.create.submit")}
          </Button>
        </Space>
      </FormCard>
    </Space>
  );
}
