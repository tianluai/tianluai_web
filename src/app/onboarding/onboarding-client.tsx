"use client";

import { useState } from "react";
import { message, Space } from "antd";
import { createWorkspaceAction } from "./actions";
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
  const [loading, setLoading] = useState(false);
  const [createName, setCreateName] = useState("");

  const handleCreate = async () => {
    const name = createName.trim();
    if (!name) {
      message.warning("Enter a workspace name");
      return;
    }
    setLoading(true);
    try {
      const result = await createWorkspaceAction(name);
      if (result?.error) message.error(result.error);
      setLoading(false);
    } catch {
      setLoading(false);
      message.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <ApiErrorAlert message={apiError} />
        <div className="text-center">
          <Title level={2} style={{ marginBottom: 8 }}>
            Get started
          </Title>
          <Text type="secondary">
            Create a workspace. You can join others later via invite links.
          </Text>
        </div>
        <FormCard title="Create workspace">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Input
              placeholder="Workspace name"
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
              Create
            </Button>
          </Space>
        </FormCard>
      </Space>
    </div>
  );
}
