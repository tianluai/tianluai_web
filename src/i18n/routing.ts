import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  /** Locale from cookie / Accept-Language — not part of the URL. */
  localePrefix: "never",
});
