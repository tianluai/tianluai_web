"use client";

import { LocaleLayoutClient } from "@/components/LocaleLayoutClient";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocaleLayoutClient>{children}</LocaleLayoutClient>;
}
