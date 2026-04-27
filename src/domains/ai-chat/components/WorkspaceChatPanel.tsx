"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Drawer, Flex, Grid, Input, Layout, List, Typography, message, theme } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MessageOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { useIntegrationsMarketplaceModal } from "@/domains/integrations/IntegrationsModalContext";
import { isUnauthorized } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/use-auth";
import { postRagChat } from "@/domains/ai-chat/rag.api";
import { Button, Text, Title } from "@/components/ui";
import type { ChatMessage } from "./chat-types";
import { useWorkspaceChatThreads } from "./use-workspace-chat-threads";
import { WorkspaceChatTopBar } from "./WorkspaceChatTopBar";

const { Sider, Content } = Layout;

type WorkspaceChatPanelProps = {
  workspaceId: string;
  workspaceName: string;
};

function MessageBubble({
  message,
  youLabel,
  assistantLabel,
}: {
  message: ChatMessage;
  youLabel: string;
  assistantLabel: string;
}) {
  const isUser = message.role === "user";
  const { token } = theme.useToken();
  const bubbleTextStyle = {
    margin: 0,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    lineHeight: 1.65,
  };

  if (!isUser) {
    return (
      <Flex vertical align="flex-start" gap={6} style={{ width: "100%" }}>
        <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1 }}>
          {assistantLabel}
        </Typography.Text>
        <div
          style={{
            maxWidth: "min(90%, 100%)",
            padding: "12px 16px",
            borderRadius: 18,
            background: token.colorFillSecondary,
            border: `1px solid ${token.colorBorderSecondary}`,
            color: token.colorText,
            ...bubbleTextStyle,
          }}
        >
          {message.content}
        </div>
      </Flex>
    );
  }

  return (
    <Flex vertical align="flex-end" gap={6} style={{ width: "100%" }}>
      <Typography.Text type="secondary" style={{ fontSize: 12, lineHeight: 1 }}>
        {youLabel}
      </Typography.Text>
      <div
        style={{
          maxWidth: "min(90%, 100%)",
          padding: "12px 16px",
          borderRadius: 18,
          background: token.colorPrimary,
          color: token.colorTextLightSolid,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
          ...bubbleTextStyle,
        }}
      >
        {message.content}
      </div>
    </Flex>
  );
}

export function WorkspaceChatPanel({
  workspaceId,
  workspaceName,
}: WorkspaceChatPanelProps) {
  const translateWorkspaceChat = useTranslations("workspace.chat");
  const translateNav = useTranslations("nav");
  const { openMarketplace } = useIntegrationsMarketplaceModal();
  const { getToken, signOut } = useAuth();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isNarrow = !screens.lg;

  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [desktopSidebarHidden, setDesktopSidebarHidden] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const sidebarCollapsed = isNarrow || desktopSidebarHidden;

  const initialAssistantMessage = useMemo(
    () => translateWorkspaceChat("welcome", { workspaceName }),
    [translateWorkspaceChat, workspaceName],
  );

  const {
    activeThreadId,
    messages,
    selectThread,
    createThread,
    deleteThread,
    addMessage,
    filteredThreads,
  } = useWorkspaceChatThreads({
    workspaceId,
    initialAssistantMessage,
    defaultThreadTitle: (() => {
      const threadUntitledLabel = translateWorkspaceChat("threadUntitled");
      return threadUntitledLabel.startsWith("workspace.chat.")
        ? translateWorkspaceChat("newChat")
        : threadUntitledLabel;
    })(),
  });

  const visibleThreads = useMemo(
    () => filteredThreads(search),
    [filteredThreads, search],
  );

  const openSidebarUi = () => {
    if (isNarrow) setThreadsOpen(true);
    else setDesktopSidebarHidden(false);
  };

  const hasUserMessage = useMemo(
    () => messages.some((chatMessage) => chatMessage.role === "user"),
    [messages],
  );

  /** Show centered hero only before the first user message (avoid stacking hero + duplicate welcome in the list). */
  const showEmptyHero = !hasUserMessage && messages.length <= 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const suggestions = useMemo(
    () => [
      translateWorkspaceChat("suggestionSummarize"),
      translateWorkspaceChat("suggestionNextSteps"),
      translateWorkspaceChat("suggestionQuestions"),
    ],
    [translateWorkspaceChat],
  );

  const canSend =
    draft.trim().length > 0 && !!activeThreadId && !isSending;

  const send = async () => {
    const content = draft.trim();
    if (!content || !activeThreadId || isSending) return;

    const history = messages.map((chatMessage) => ({
      role: chatMessage.role,
      content: chatMessage.content,
    }));

    setDraft("");
    setIsSending(true);
    addMessage({ role: "user", content });

    try {
      const authToken = await getToken({ skipCache: true });
      if (!authToken) {
        signOut();
        message.error(translateWorkspaceChat("errorNotSignedIn"));
        return;
      }

      const result = await postRagChat(authToken, {
        workspaceId,
        message: content,
        history,
      });

      if (isUnauthorized(result)) {
        signOut();
        return;
      }
      if (!result.ok) {
        message.error(translateWorkspaceChat("errorReplyFailed"));
        return;
      }

      addMessage({ role: "assistant", content: result.data.answer });
    } catch {
      message.error(translateWorkspaceChat("errorReplyFailed"));
    } finally {
      setIsSending(false);
    }
  };

  const threadsPanel = (
    <Flex vertical style={{ height: "100%" }}>
      <Flex align="center" justify="space-between" style={{ paddingBottom: 16 }}>
        <Typography.Text strong style={{ color: token.colorText, fontSize: 15 }}>
          {translateWorkspaceChat("brand")}
        </Typography.Text>
        {!isNarrow && (
          <Button
            type="text"
            icon={<MenuFoldOutlined />}
            onClick={() => setDesktopSidebarHidden(true)}
            aria-label={translateWorkspaceChat("collapseSidebarAria")}
            style={{ color: token.colorTextSecondary }}
          />
        )}
      </Flex>

      <Flex vertical gap="small" style={{ paddingBottom: 16 }}>
        <Button
          type="default"
          icon={<EditOutlined />}
          onClick={() => {
            createThread();
            setThreadsOpen(false);
          }}
          aria-label={translateWorkspaceChat("newChatAria")}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 12,
            background: "transparent",
            borderColor: token.colorBorderSecondary,
            color: token.colorText,
          }}
        >
          {translateWorkspaceChat("newChat")}
        </Button>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          allowClear
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          placeholder={translateWorkspaceChat("searchPlaceholder")}
          aria-label={translateWorkspaceChat("searchAria")}
          size="middle"
          style={{
            borderRadius: 12,
            background: token.colorBgContainer,
            borderColor: token.colorBorderSecondary,
          }}
        />
      </Flex>

      <Typography.Text
        type="secondary"
        style={{
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: token.colorTextTertiary,
          marginBottom: 8,
        }}
      >
        {translateWorkspaceChat("recents")}
      </Typography.Text>

      <Flex vertical style={{ flex: 1, minHeight: 0 }}>
        <List
          dataSource={visibleThreads}
          locale={{ emptyText: <Text type="secondary">{translateWorkspaceChat("noChats")}</Text> }}
          split={false}
          style={{ overflow: "auto", paddingRight: 4 }}
          renderItem={(thread) => {
            const isActive = thread.id === activeThreadId;
            return (
              <List.Item
                style={{
                  paddingInline: 0,
                  border: "none",
                  paddingBlock: 4,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Flex
                  align="center"
                  justify="space-between"
                  gap="small"
                  onClick={() => {
                    selectThread(thread.id);
                    setThreadsOpen(false);
                  }}
                  style={{
                    width: "100%",
                    minHeight: 40,
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: isActive ? token.colorBgElevated : "transparent",
                    border: `1px solid ${isActive ? token.colorBorderSecondary : "transparent"}`,
                  }}
                >
                  <Flex align="center" gap="small" style={{ minWidth: 0 }}>
                    <MessageOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                    <Text
                      strong={isActive}
                      style={{
                        display: "inline-block",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: token.colorText,
                        lineHeight: "22px",
                      }}
                    >
                      {thread.title}
                    </Text>
                  </Flex>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    aria-label={translateWorkspaceChat("deleteThreadAria", { title: thread.title })}
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    style={{
                      color: token.colorTextTertiary,
                      opacity: 0.55,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </Flex>
              </List.Item>
            );
          }}
        />
      </Flex>
    </Flex>
  );

  return (
    <Layout
      style={{
        width: "100%",
        height: "100dvh",
        minHeight: "100dvh",
        background: token.colorBgLayout,
      }}
    >
      <Sider
        width={272}
        collapsedWidth={0}
        collapsed={sidebarCollapsed}
        trigger={null}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          padding: 12,
          overflow: "hidden",
        }}
      >
        {threadsPanel}
      </Sider>

      {sidebarCollapsed && (
        <Drawer
          open={threadsOpen}
          onClose={() => setThreadsOpen(false)}
          placement="left"
          width="88vw"
          title={translateWorkspaceChat("threads")}
          closeIcon={null}
          extra={
            <Button
              type="text"
              onClick={() => setThreadsOpen(false)}
              aria-label={translateWorkspaceChat("closeThreadsAria")}
            >
              {translateWorkspaceChat("close")}
            </Button>
          }
          styles={{
            header: { borderBottom: `1px solid ${token.colorBorderSecondary}` },
            body: { padding: 12, background: token.colorBgContainer },
          }}
        >
          {threadsPanel}
        </Drawer>
      )}

      <Content style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <WorkspaceChatTopBar
          workspaceId={workspaceId}
          onOpenSidebar={openSidebarUi}
          showSidebarToggle={sidebarCollapsed}
        />

        <Flex vertical style={{ flex: 1, minHeight: 0 }}>
          <Flex
            vertical
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              paddingInline: 20,
            }}
          >
            {showEmptyHero && (
              <Flex
                vertical
                align="center"
                justify="center"
                style={{
                  paddingTop: 32,
                  paddingBottom: 24,
                  textAlign: "center",
                }}
              >
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    color: token.colorText,
                    maxWidth: 560,
                    lineHeight: 1.25,
                  }}
                >
                  {translateWorkspaceChat("emptyGreeting")}
                </Title>
                <Typography.Text
                  type="secondary"
                  style={{ marginTop: 10, maxWidth: 480, color: token.colorTextSecondary }}
                >
                  {translateWorkspaceChat("threadHint")}
                </Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ marginTop: 8, maxWidth: 480, color: token.colorTextSecondary }}
                >
                  {translateWorkspaceChat("sourcesHintLead")}{" "}
                  <Button
                    type="link"
                    onClick={() => openMarketplace()}
                    style={{ padding: 0, height: "auto", color: token.colorPrimary }}
                  >
                    {translateNav("integrations")}
                  </Button>
                  .
                </Typography.Text>
                <Flex wrap gap="small" justify="center" style={{ marginTop: 28, maxWidth: 720 }}>
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="default"
                      onClick={() => setDraft(suggestion)}
                      aria-label={translateWorkspaceChat("suggestionAria", { text: suggestion })}
                      style={{
                        borderRadius: 999,
                        borderColor: token.colorBorderSecondary,
                        background: token.colorBgContainer,
                        height: "auto",
                        paddingBlock: 8,
                        paddingInline: 14,
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </Flex>
              </Flex>
            )}

            <Flex
              vertical
              style={{
                width: "100%",
                maxWidth: 768,
                margin: "0 auto",
                paddingTop: showEmptyHero ? 8 : 24,
                paddingBottom: 16,
                gap: 20,
              }}
            >
              {!showEmptyHero && (
                <Flex vertical gap={20} style={{ width: "100%" }}>
                  {messages.map((chatMessage) => (
                    <MessageBubble
                      key={chatMessage.id}
                      message={chatMessage}
                      youLabel={translateWorkspaceChat("youLabel")}
                      assistantLabel={translateWorkspaceChat("assistantLabel")}
                    />
                  ))}
                </Flex>
              )}
              <Flex ref={bottomRef} />
            </Flex>
          </Flex>

          <Flex
            justify="center"
            style={{
              flexShrink: 0,
              padding: `12px 16px calc(28px + env(safe-area-inset-bottom, 0px))`,
              background: token.colorBgLayout,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Flex style={{ width: "100%", maxWidth: 768 }} gap={12} align="flex-end">
              <Flex
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 28,
                  background: token.colorBgElevated,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  minHeight: 52,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                }}
                align="center"
                gap="small"
              >
                <Input.TextArea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={translateWorkspaceChat("composerPlaceholder")}
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  onPressEnter={(event) => {
                    if (event.shiftKey) return;
                    event.preventDefault();
                    void send();
                  }}
                  disabled={!activeThreadId || isSending}
                  variant="borderless"
                  styles={{
                    textarea: {
                      paddingBlock: 0,
                      paddingInline: 0,
                      lineHeight: "24px",
                      minHeight: 24,
                    },
                  }}
                  style={{
                    resize: "none",
                    flex: 1,
                    lineHeight: "24px",
                  }}
                />
              </Flex>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => void send()}
                disabled={!canSend}
                loading={isSending}
                aria-label={translateWorkspaceChat("sendAria")}
                shape="circle"
                size="large"
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </Content>
    </Layout>
  );
}
