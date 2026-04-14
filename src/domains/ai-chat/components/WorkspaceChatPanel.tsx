"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Drawer, Flex, Grid, Input, Layout, List, Typography, theme } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MenuFoldOutlined,
  MessageOutlined,
  SearchOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { Button, Text, Title } from "@/components/ui";
import type { ChatMessage } from "./chat-types";
import { useWorkspaceChatThreads } from "./use-workspace-chat-threads";
import { WorkspaceChatTopBar } from "./WorkspaceChatTopBar";

const { Sider, Content } = Layout;

type WorkspaceChatPanelProps = {
  workspaceId: string;
  workspaceName: string;
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const { token } = theme.useToken();
  if (!isUser) {
    return (
      <Flex justify="flex-start" style={{ width: "100%" }}>
        <Text style={{ color: token.colorText, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
          {message.content}
        </Text>
      </Flex>
    );
  }
  return (
    <Flex justify="flex-end" style={{ width: "100%" }}>
      <Flex
        vertical
        style={{
          maxWidth: "min(680px, 100%)",
          padding: "12px 16px",
          borderRadius: token.borderRadiusLG,
          whiteSpace: "pre-wrap",
          background: token.colorPrimaryBg,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Text style={{ color: token.colorText }}>{message.content}</Text>
      </Flex>
    </Flex>
  );
}

export function WorkspaceChatPanel({
  workspaceId,
  workspaceName,
}: WorkspaceChatPanelProps) {
  const translateWorkspaceChat = useTranslations("workspace.chat");
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isNarrow = !screens.lg;

  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [desktopSidebarHidden, setDesktopSidebarHidden] = useState(false);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const suggestions = useMemo(
    () => [
      translateWorkspaceChat("suggestionSummarize"),
      translateWorkspaceChat("suggestionNextSteps"),
      translateWorkspaceChat("suggestionQuestions"),
    ],
    [translateWorkspaceChat],
  );

  const canSend = draft.trim().length > 0 && !!activeThreadId;
  const isEmptyThread = messages.length <= 1;

  const send = async () => {
    const content = draft.trim();
    if (!content || !activeThreadId) return;
    setDraft("");
    addMessage({ role: "user", content });
    addMessage({ role: "assistant", content: translateWorkspaceChat("assistantAck") });
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
            {isEmptyThread && (
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
                paddingTop: isEmptyThread ? 8 : 24,
                paddingBottom: 16,
                gap: 20,
              }}
            >
              <List
                dataSource={messages}
                locale={{ emptyText: null }}
                split={false}
                renderItem={(chatMessage) => (
                  <List.Item style={{ border: "none", paddingInline: 0, paddingBlock: 12 }}>
                    <MessageBubble message={chatMessage} />
                  </List.Item>
                )}
              />
              <Flex ref={bottomRef} />
            </Flex>
          </Flex>

          <Flex
            justify="center"
            style={{
              flexShrink: 0,
              padding: "12px 16px 28px",
              background: token.colorBgLayout,
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
                  disabled={!activeThreadId}
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
