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

/**
 * Resolve an i18n key to the message string (for server use).
 * If the key is not in messages, returns the key as-is so API error messages pass through.
 */
export function getMessage(key: string): string {
  const value = get(messages, key);
  return value ?? key;
}
