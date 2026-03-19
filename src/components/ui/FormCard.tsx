"use client";

import { Card } from "antd";
import type { ReactNode } from "react";

type FormCardProps = {
  title: string;
  children: ReactNode;
};

export function FormCard({ title, children }: FormCardProps) {
  return (
    <Card
      title={title}
      styles={{
        body: { padding: 24 },
        header: { borderBottom: "1px solid #f0f0f0", fontWeight: 600 },
      }}
    >
      {children}
    </Card>
  );
}
