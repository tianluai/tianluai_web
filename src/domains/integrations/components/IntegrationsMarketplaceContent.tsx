"use client";

import { GoogleOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Flex, Row, theme, Typography } from "antd";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button, Space, Text, Title } from "@/components/ui";

type IntegrationsMarketplaceContentProps = {
  workspaceId: string;
  onGoogleDriveOpen: () => void;
  showPageHeading?: boolean;
  /** Filter featured cards (Explore search bar). */
  marketSearch?: string;
};

export function IntegrationsMarketplaceContent({
  workspaceId,
  onGoogleDriveOpen,
  showPageHeading = false,
  marketSearch = "",
}: IntegrationsMarketplaceContentProps) {
  const translate = useTranslations("integrations");
  const { token } = theme.useToken();

  const searchNeedle = marketSearch.trim().toLowerCase();
  const driveTitle = translate("googleDrive.title");
  const driveDescription = translate("googleDrive.cardTeaser");
  const driveMatches =
    !searchNeedle ||
    driveTitle.toLowerCase().includes(searchNeedle) ||
    driveDescription.toLowerCase().includes(searchNeedle);

  const trendingItems = useMemo(
    () =>
      [
        { key: "drive", title: translate("googleDrive.title"), hint: translate("googleDrive.byProvider") },
      ] as const,
    [translate],
  );

  if (!workspaceId) return null;

  if (showPageHeading) {
    return (
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0 }}>
            {translate("title")}
          </Title>
          <Text type="secondary">{translate("lead")}</Text>
        </Space>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            {translate("marketplaceTitle")}
          </Title>
          <Text type="secondary">{translate("featuredSubtitle")}</Text>
          <Flex gap="middle" wrap="wrap">
            <Card
              hoverable
              styles={{ body: { padding: 20 } }}
              style={{ minWidth: 280, maxWidth: 400, flex: "1 1 280px" }}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Flex align="center" gap="middle">
                  <GoogleOutlined style={{ fontSize: 28 }} aria-hidden />
                  <Space direction="vertical" size={0}>
                    <Title level={5} style={{ margin: 0 }}>
                      {translate("googleDrive.title")}
                    </Title>
                    <Text type="secondary">{translate("googleDrive.description")}</Text>
                  </Space>
                </Flex>
                <Button type="primary" block onClick={onGoogleDriveOpen}>
                  {translate("googleDrive.cta")}
                </Button>
              </Space>
            </Card>
          </Flex>
        </Space>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Title level={4} style={{ margin: 0 }}>
          {translate("sectionFeatured")}
        </Title>
        <Text type="secondary">{translate("featuredSubtitle")}</Text>

        {driveMatches ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={8}>
              <Card
                hoverable
                onClick={() => onGoogleDriveOpen()}
                styles={{ body: { padding: 20 } }}
                style={{
                  borderRadius: token.borderRadiusLG,
                  borderColor: token.colorBorderSecondary,
                  background: token.colorFillAlter,
                }}
              >
                <Flex align="flex-start" gap={16} wrap="nowrap">
                  <Avatar
                    size={56}
                    icon={<GoogleOutlined />}
                    style={{
                      background: token.colorBgContainer,
                      color: token.colorText,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      flexShrink: 0,
                    }}
                  />
                  <Space direction="vertical" size={6} style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {translate("googleDrive.title")}
                    </Typography.Title>
                    <Typography.Text type="secondary" ellipsis>
                      {translate("googleDrive.cardTeaser")}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {translate("googleDrive.byProvider")}
                    </Typography.Text>
                  </Space>
                </Flex>
              </Card>
            </Col>
          </Row>
        ) : (
          <Text type="secondary">{translate("searchNoResults")}</Text>
        )}
      </Space>

      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Title level={4} style={{ margin: 0 }}>
          {translate("sectionTrending")}
        </Title>
        <Text type="secondary" style={{ marginBottom: 8 }}>
          {translate("trendingLead")}
        </Text>
        <Flex vertical gap={0}>
          {trendingItems.map((item, index) => (
            <Flex
              key={item.key}
              align="center"
              justify="space-between"
              style={{
                paddingBlock: 12,
                paddingInline: 4,
                borderBottom:
                  index < trendingItems.length - 1 ? `1px solid ${token.colorBorderSecondary}` : undefined,
              }}
            >
              <Flex align="center" gap={12}>
                <Typography.Text strong style={{ minWidth: 24, color: token.colorTextSecondary }}>
                  {index + 1}
                </Typography.Text>
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>{item.title}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {item.hint}
                  </Typography.Text>
                </Space>
              </Flex>
              <Button type="link" onClick={() => onGoogleDriveOpen()}>
                {translate("googleDrive.cta")}
              </Button>
            </Flex>
          ))}
        </Flex>
      </Space>
    </Space>
  );
}
