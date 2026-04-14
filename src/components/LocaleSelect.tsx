"use client";

import { useLocale } from "next-intl";
import { Select } from "@/components/ui";
import { useLocaleSwitcher } from "@/components/RootIntlClient";
import { routing } from "@/i18n/routing";

const localeOptions = [
  { value: "en", label: "en" },
  { value: "es", label: "es" },
];

export function LocaleSelect() {
  const locale = useLocale();
  const { setLocale } = useLocaleSwitcher();

  const handleChange = (value: unknown) => {
    const next = typeof value === "string" ? value : String(value ?? routing.defaultLocale);
    const resolved = routing.locales.includes(next as "en" | "es") ? next : routing.defaultLocale;
    setLocale(resolved);
  };

  return (
    <Select
      value={locale}
      options={localeOptions}
      onChange={handleChange}
      style={{ width: 56 }}
      size="small"
    />
  );
}
