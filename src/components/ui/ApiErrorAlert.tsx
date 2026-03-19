"use client";

import { Alert } from "antd";

type ApiErrorAlertProps = {
  message?: string | null;
  title?: string;
  description?: string;
};

export function ApiErrorAlert({
  message,
  title,
  description,
}: ApiErrorAlertProps) {
  if (!message) return null;
  return (
    <Alert
      type="error"
      showIcon
      message={title}
      description={description ? `${message} ${description}` : message}
    />
  );
}
