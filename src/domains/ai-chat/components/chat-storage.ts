import type { ChatMessage } from "./chat-types";

export type ChatThread = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

function threadsKey(workspaceId: string) {
  return `workspaceChatThreads:${workspaceId}`;
}

function messagesKey(workspaceId: string, threadId: string) {
  return `workspaceChatMessages:${workspaceId}:${threadId}`;
}

function safeParseThreads(rawJson: string | null): ChatThread[] {
  if (!rawJson) return [];
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((unknownItem) => {
        const record = unknownItem as Record<string, unknown>;
        const id = typeof record.id === "string" ? record.id : null;
        const title = typeof record.title === "string" ? record.title : null;
        const createdAt =
          typeof record.createdAt === "number" ? record.createdAt : Date.now();
        const updatedAt =
          typeof record.updatedAt === "number" ? record.updatedAt : createdAt;
        if (!id || !title) return null;
        return { id, title, createdAt, updatedAt } satisfies ChatThread;
      })
      .filter((thread): thread is ChatThread => thread !== null);
  } catch {
    return [];
  }
}

function safeParseMessages(rawJson: string | null): ChatMessage[] {
  if (!rawJson) return [];
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((unknownItem) => {
        const record = unknownItem as Record<string, unknown>;
        const role =
          record.role === "user" || record.role === "assistant" ? record.role : null;
        const content = typeof record.content === "string" ? record.content : null;
        const createdAt =
          typeof record.createdAt === "number" ? record.createdAt : Date.now();
        const id =
          typeof record.id === "string" ? record.id : `${createdAt}-${Math.random()}`;
        if (!role || !content) return null;
        return { id, role, content, createdAt } satisfies ChatMessage;
      })
      .filter((message): message is ChatMessage => message !== null);
  } catch {
    return [];
  }
}

export function loadThreads(workspaceId: string): ChatThread[] {
  try {
    return safeParseThreads(localStorage.getItem(threadsKey(workspaceId)));
  } catch {
    return [];
  }
}

export function saveThreads(workspaceId: string, threads: ChatThread[]) {
  try {
    localStorage.setItem(threadsKey(workspaceId), JSON.stringify(threads));
  } catch {
    // ignore
  }
}

export function loadMessages(workspaceId: string, threadId: string): ChatMessage[] {
  try {
    return safeParseMessages(localStorage.getItem(messagesKey(workspaceId, threadId)));
  } catch {
    return [];
  }
}

export function saveMessages(
  workspaceId: string,
  threadId: string,
  messages: ChatMessage[],
) {
  try {
    localStorage.setItem(messagesKey(workspaceId, threadId), JSON.stringify(messages));
  } catch {
    // ignore
  }
}

export function deleteThreadStorage(workspaceId: string, threadId: string) {
  try {
    localStorage.removeItem(messagesKey(workspaceId, threadId));
  } catch {
    // ignore
  }
}
