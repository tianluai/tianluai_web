"use client";

import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Flex } from "antd";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/use-auth";
import { Dropdown } from "@/components/ui";
import type { MenuProps } from "antd";

export function UserAccountMenu() {
  const { data: session } = useSession();
  const { signOut } = useAuth();
  const translate = useTranslations("auth");

  const items: MenuProps["items"] = [
    {
      key: "sign-out",
      icon: <LogoutOutlined />,
      label: translate("logOut"),
      onClick: () => {
        void signOut({ redirectUrl: "/" });
      },
    },
  ];

  const image = session?.user?.image;
  const label = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <button
        type="button"
        aria-label={translate("accountMenuAria")}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          display: "inline-flex",
        }}
      >
        <Flex align="center" gap={8}>
          <Avatar src={image} icon={!image ? <UserOutlined /> : undefined} size="default" />
          {label ? (
            <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
              {label}
            </span>
          ) : null}
        </Flex>
      </button>
    </Dropdown>
  );
}
