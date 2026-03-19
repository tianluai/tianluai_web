"use client";

import { useLocale } from "next-intl";
import { Select } from "@/components/ui";
import { usePathname, useRouter } from "@/i18n/navigation";

const localeOptions = [
  { value: "en", label: "en" },
  { value: "es", label: "es" },
];

export function LocaleSelect() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (value: unknown) => {
    const next = typeof value === "string" ? value : String(value ?? "en");
    router.replace(pathname, { locale: next as "en" | "es" });
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
