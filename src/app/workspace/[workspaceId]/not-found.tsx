import Link from "next/link";
import { Button, Text, Title } from "@/components/ui";

export default function WorkspaceNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      <Title level={1}>Workspace not found</Title>
      <Text type="secondary">
        This workspace does not exist or you don&apos;t have access.
      </Text>
      <Link href="/workspaces">
        <Button type="primary">Back to workspaces</Button>
      </Link>
    </div>
  );
}
