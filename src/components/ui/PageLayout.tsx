"use client";

import type { ReactNode } from "react";

type PageLayoutProps = {
  children: ReactNode;
  header?: ReactNode;
  centered?: boolean;
};

export function PageLayout({
  children,
  header,
  centered = true,
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {header && (
        <header className="border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-2xl items-center justify-end">
            {header}
          </div>
        </header>
      )}
      <main
        className={
          centered
            ? "flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12"
            : "flex-1 px-4 py-8 sm:px-6 sm:py-12"
        }
      >
        {children}
      </main>
    </div>
  );
}
