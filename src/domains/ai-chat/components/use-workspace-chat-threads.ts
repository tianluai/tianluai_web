"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "./chat-types";
import {
  deleteThreadStorage,
  loadMessages,
  loadThreads,
  saveMessages,
  saveThreads,
  type ChatThread,
} from "./chat-storage";

function createThreadOrMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function truncateTitle(text: string) {
  const collapsedWhitespace = text.trim().replace(/\s+/g, " ");
  if (collapsedWhitespace.length <= 36) return collapsedWhitespace;
  return `${collapsedWhitespace.slice(0, 36)}…`;
}

function normalizeThreadTitle(title: string, defaultThreadTitle: string) {
  // If translations were missing when persisted, we may have stored i18n keys.
  // Normalize those back to the current localized default title.
  if (title.startsWith("workspace.chat.")) return defaultThreadTitle;
  return title;
}

export function useWorkspaceChatThreads(args: {
  workspaceId: string;
  initialAssistantMessage: string;
  defaultThreadTitle: string;
}) {
  const { workspaceId, initialAssistantMessage, defaultThreadTitle } = args;
  const [state, setState] = useState<{
    threads: ChatThread[];
    activeThreadId: string;
    messages: ChatMessage[];
  }>(() => {
    if (!workspaceId) return { threads: [], activeThreadId: "", messages: [] };
    const loaded = loadThreads(workspaceId)
      .map((thread) => ({
        ...thread,
        title: normalizeThreadTitle(thread.title, defaultThreadTitle),
      }))
      .sort((first, second) => second.updatedAt - first.updatedAt);
    if (loaded.length > 0) {
      const activeId = loaded[0]?.id ?? "";
      return {
        threads: loaded,
        activeThreadId: activeId,
        messages: activeId ? loadMessages(workspaceId, activeId) : [],
      };
    }

    const now = Date.now();
    const newThreadId = createThreadOrMessageId();
    const seedThread: ChatThread = {
      id: newThreadId,
      title: defaultThreadTitle,
      createdAt: now,
      updatedAt: now,
    };
    const seeded = [seedThread];
    const seedMessages: ChatMessage[] = [
      {
        id: createThreadOrMessageId(),
        role: "assistant",
        content: initialAssistantMessage,
        createdAt: now,
      },
    ];
    saveThreads(workspaceId, seeded);
    saveMessages(workspaceId, newThreadId, seedMessages);
    return { threads: seeded, activeThreadId: newThreadId, messages: seedMessages };
  });

  const threads = state.threads;
  const activeThreadId = state.activeThreadId;
  const messages = state.messages;

  // Load threads on workspace change
  useEffect(() => {
    if (!workspaceId) return;
    queueMicrotask(() => {
      const loaded = loadThreads(workspaceId)
        .map((thread) => ({
          ...thread,
          title: normalizeThreadTitle(thread.title, defaultThreadTitle),
        }))
        .sort((first, second) => second.updatedAt - first.updatedAt);
      if (loaded.length === 0) {
        const now = Date.now();
        const newThreadId = createThreadOrMessageId();
        const seedThread: ChatThread = {
          id: newThreadId,
          title: defaultThreadTitle,
          createdAt: now,
          updatedAt: now,
        };
        const seeded = [seedThread];
        const seedMessages: ChatMessage[] = [
          {
            id: createThreadOrMessageId(),
            role: "assistant",
            content: initialAssistantMessage,
            createdAt: now,
          },
        ];
        saveThreads(workspaceId, seeded);
        saveMessages(workspaceId, newThreadId, seedMessages);
        setState({ threads: seeded, activeThreadId: newThreadId, messages: seedMessages });
        return;
      }

      const nextActive = loaded[0]?.id ?? "";
      setState({
        threads: loaded,
        activeThreadId: nextActive,
        messages: nextActive ? loadMessages(workspaceId, nextActive) : [],
      });
    });
  }, [workspaceId, initialAssistantMessage, defaultThreadTitle]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );

  const selectThread = useCallback(
    (threadId: string) => {
      setState((previous) => ({
        ...previous,
        activeThreadId: threadId,
        messages: threadId ? loadMessages(workspaceId, threadId) : [],
      }));
    },
    [workspaceId],
  );

  const createThread = useCallback(() => {
    const now = Date.now();
    const newThreadId = createThreadOrMessageId();
    const thread: ChatThread = {
      id: newThreadId,
      title: defaultThreadTitle,
      createdAt: now,
      updatedAt: now,
    };
    const nextThreads = [thread, ...threads];
    saveThreads(workspaceId, nextThreads);
    const seedMessages: ChatMessage[] = [
      {
        id: createThreadOrMessageId(),
        role: "assistant",
        content: initialAssistantMessage,
        createdAt: now,
      },
    ];
    saveMessages(workspaceId, newThreadId, seedMessages);
    setState({ threads: nextThreads, activeThreadId: newThreadId, messages: seedMessages });
  }, [workspaceId, defaultThreadTitle, initialAssistantMessage, threads]);

  const deleteThread = useCallback(
    (threadId: string) => {
      const remaining = threads.filter((thread) => thread.id !== threadId);
      deleteThreadStorage(workspaceId, threadId);
      saveThreads(workspaceId, remaining);
      if (activeThreadId !== threadId) {
        setState((previous) => ({ ...previous, threads: remaining }));
        return;
      }
      const nextActive = remaining[0]?.id ?? "";
      setState({
        threads: remaining,
        activeThreadId: nextActive,
        messages: nextActive ? loadMessages(workspaceId, nextActive) : [],
      });
    },
    [workspaceId, threads, activeThreadId],
  );

  const clearActive = useCallback(() => {
    if (!activeThreadId) return;
    const now = Date.now();
    const seedMessages: ChatMessage[] = [
      {
        id: createThreadOrMessageId(),
        role: "assistant",
        content: initialAssistantMessage,
        createdAt: now,
      },
    ];
    saveMessages(workspaceId, activeThreadId, seedMessages);
    const nextThreads = threads.map((thread) =>
      thread.id === activeThreadId
        ? { ...thread, updatedAt: now, title: defaultThreadTitle }
        : thread,
    );
    saveThreads(workspaceId, nextThreads);
    setState((previous) => ({ ...previous, threads: nextThreads, messages: seedMessages }));
  }, [workspaceId, activeThreadId, initialAssistantMessage, threads, defaultThreadTitle]);

  const addMessage = useCallback(
    (messageInput: Omit<ChatMessage, "id" | "createdAt">) => {
      if (!activeThreadId) return;
      const nextMessages: ChatMessage[] = [
        ...messages,
        { id: createThreadOrMessageId(), createdAt: Date.now(), ...messageInput } satisfies ChatMessage,
      ];
      saveMessages(workspaceId, activeThreadId, nextMessages);

      const now = Date.now();
      const nextThreads = threads
        .map((thread) => {
          if (thread.id !== activeThreadId) return thread;
          const title =
            thread.title === defaultThreadTitle && messageInput.role === "user"
              ? truncateTitle(messageInput.content)
              : thread.title;
          return { ...thread, updatedAt: now, title };
        })
        .sort((first, second) => second.updatedAt - first.updatedAt);
      saveThreads(workspaceId, nextThreads);
      setState((previous) => ({ ...previous, threads: nextThreads, messages: nextMessages }));
    },
    [workspaceId, activeThreadId, messages, threads, defaultThreadTitle],
  );

  const filteredThreads = useCallback(
    (query: string) => {
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) return threads;
      return threads.filter((thread) =>
        thread.title.toLowerCase().includes(normalizedQuery),
      );
    },
    [threads],
  );

  return {
    threads,
    activeThreadId,
    activeThread,
    messages,
    selectThread,
    createThread,
    deleteThread,
    clearActive,
    addMessage,
    filteredThreads,
  };
}
