"use client";

import type { ReactNode } from "react";

type ScreenLayoutProps = {
  children: ReactNode;
  centered?: boolean;
  contentMaxWidth?: number;
};

export function ScreenLayout({
  children,
  centered = true,
  contentMaxWidth,
}: ScreenLayoutProps) {
  return (
    <div
      style={{
        margin: "0 auto",
        maxWidth: contentMaxWidth ?? 896,
        width: "100%",
        padding: 48,
        ...(centered
          ? {
              display: "flex",
              flexDirection: "column" as const,
              alignItems: "center",
            }
          : {}),
      }}
    >
      {children}
    </div>
  );
}
