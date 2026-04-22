import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Clerk (paused): import { ClerkProvider } from "@clerk/nextjs";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthProviders } from "@/components/AuthProviders";
import { QueryProvider } from "@/lib/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tianlu AI",
  description: "AI workspace",
};

/**
 * Root shell only. With `localePrefix: "never"`, next-intl middleware rewrites
 * `/workspaces` → `/en/workspaces` internally, so all pages live under `app/[locale]/`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Clerk (paused): wrap with <ClerkProvider> … </ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProviders>
          <QueryProvider>
            <AntdRegistry>{children}</AntdRegistry>
          </QueryProvider>
        </AuthProviders>
      </body>
    </html>
  );
}
