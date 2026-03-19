import en from "./translations/en.json";
import es from "./translations/es.json";
import { routing } from "./routing";

const messagesByLocale: Record<string, typeof en> = { en, es };

/**
 * Load messages for the given locale. Use this in the layout instead of
 * getMessages() when the next-intl config alias is not resolved (e.g. Next 16 + Turbopack).
 */
export function getMessagesForLocale(locale: string): typeof en {
  const resolved =
    routing.locales.includes(locale as "en" | "es") ? locale : routing.defaultLocale;
  return messagesByLocale[resolved] ?? messagesByLocale[routing.defaultLocale];
}

function getByPath(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * Get a message by key (e.g. "auth.notSignedIn") for the given locale.
 * Use in server actions when getTranslations() is unavailable due to config alias issues.
 */
export function getMessageForLocale(locale: string, key: string): string {
  const messages = getMessagesForLocale(locale);
  const value = getByPath(messages, key);
  return value ?? key;
}
