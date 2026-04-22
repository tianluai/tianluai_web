import { apiFetch, type ApiResult } from "@/lib/api/client";

export type RagChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type RagChatRequest = {
  workspaceId: string;
  message: string;
  history?: RagChatHistoryItem[];
};

export type RagChatResponse = {
  answer: string;
};

export function postRagChat(
  token: string,
  body: RagChatRequest,
): Promise<ApiResult<RagChatResponse>> {
  return apiFetch<RagChatResponse>(token, "/rag/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
