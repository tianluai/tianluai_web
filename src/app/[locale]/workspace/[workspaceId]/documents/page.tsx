"use client";

import { useParams } from "next/navigation";
import { DocumentsScreen } from "@/domains/documents/screens/DocumentsScreen";

export default function WorkspaceDocumentsPage() {
  const params = useParams();
  const workspaceId = typeof params.workspaceId === "string" ? params.workspaceId : "";
  if (!workspaceId) return null;
  return <DocumentsScreen workspaceId={workspaceId} />;
}
