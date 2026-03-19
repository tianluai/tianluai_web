"use client";

import type { ReactNode } from "react";
import { ScreenLayout } from "./ScreenLayout";

type PageLayoutProps = {
  children: ReactNode;
  centered?: boolean;
};

export function PageLayout({ children, centered = true }: PageLayoutProps) {
  return (
    <ScreenLayout centered={centered}>
      {children}
    </ScreenLayout>
  );
}
