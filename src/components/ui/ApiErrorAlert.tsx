"use client";

import { Alert } from "antd";

type ApiErrorAlertProps = { message?: string | null };

const DEFAULT_MESSAGE =
  "Ensure NEXT_PUBLIC_API_URL points to the API and CLERK_JWT_KEY is set in the API .env. Log out and sign in again for a fresh token.";

export function ApiErrorAlert({ message }: ApiErrorAlertProps) {
  if (!message) return null;
  return (
    <Alert
      type="error"
      showIcon
      message="Cannot reach API"
      description={
        <>
          {message}. {DEFAULT_MESSAGE}
        </>
      }
    />
  );
}
