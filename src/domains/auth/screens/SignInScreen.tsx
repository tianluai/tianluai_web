"use client";

import { GoogleOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button, ScreenLayout, Space, Title } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export function SignInScreen() {
  const translateSignIn = useTranslations("auth.signIn");

  return (
    <ScreenLayout centered>
      <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: 360 }}>
        <Title level={3}>{translateSignIn("title")}</Title>
        {/* Clerk (paused): <SignIn afterSignInUrl="/onboarding" signUpUrl="/sign-up" /> */}
        <Button
          type="primary"
          block
          size="large"
          icon={<GoogleOutlined />}
          onClick={() => void signIn("google", { callbackUrl: "/" })}
        >
          {translateSignIn("google")}
        </Button>
        <Link href="/sign-up">{translateSignIn("linkSignUp")}</Link>
      </Space>
    </ScreenLayout>
  );
}
