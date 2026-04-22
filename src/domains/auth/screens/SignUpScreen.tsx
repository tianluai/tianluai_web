"use client";

import { GoogleOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button, ScreenLayout, Space, Title } from "@/components/ui";
import { Link } from "@/i18n/navigation";

export function SignUpScreen() {
  const translateSignUp = useTranslations("auth.signUp");

  return (
    <ScreenLayout centered>
      <Space direction="vertical" size="large" style={{ width: "100%", maxWidth: 360 }}>
        <Title level={3}>{translateSignUp("title")}</Title>
        {/* Clerk (paused): <SignUp afterSignUpUrl="/onboarding" signInUrl="/sign-in" /> */}
        <Button
          type="primary"
          block
          size="large"
          icon={<GoogleOutlined />}
          onClick={() => void signIn("google", { callbackUrl: "/onboarding" })}
        >
          {translateSignUp("google")}
        </Button>
        <Link href="/sign-in">{translateSignUp("linkSignIn")}</Link>
      </Space>
    </ScreenLayout>
  );
}
