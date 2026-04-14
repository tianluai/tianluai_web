"use client";

import { useCallback } from "react";
import { messages } from "./messages";

function get(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function useTranslations() {
  const translate = useCallback((key: string): string => {
    const value = get(messages, key);
    return value ?? key;
  }, []);
  return { translate };
}
