"use client";

/**
 * Workspace “Google Drive” settings UI for `/workspace/[workspaceId]/documents`.
 *
 * - The **Next.js page** is `workspace-documents.page.tsx` (and `app/.../documents/page.tsx`), which only passes `workspaceId`.
 * - **`DocumentsScreen`** is what the page renders — the public domain entry for this route.
 * - **`DocumentsScreenBody`** uses hooks that read the URL; in the App Router they must live under `<Suspense>`, so the body is wrapped by `DocumentsScreen`.
 */

import { useAuth, useUser } from "@clerk/nextjs";
import { useState, Suspense } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Layout,
  Modal,
  Space,
  Spin,
  Typography,
} from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui";
import { useWorkspaces } from "@/domains/workspace/workspace.queries";
import {
  driveService,
  type DriveFolder,
} from "@/domains/documents/services/drive-api";
import {
  useDriveConnectionStatus,
  useInvalidateDriveConnectionStatus,
} from "@/domains/documents/drive.queries";
import { useDriveOAuthUrlAlertMessage } from "@/domains/documents/hooks/use-drive-oauth-url-alert";

const MAX_FOLDERS = 3;

type DocumentsScreenProps = {
  workspaceId: string;
};

function DocumentsScreenBody({ workspaceId }: DocumentsScreenProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const userId = user?.id ?? "";
  const translate = useTranslations("documents");
  const oauthUrlAlert = useDriveOAuthUrlAlertMessage();
  const { data: workspaces = [] } = useWorkspaces();
  const workspaceName =
    workspaces.find((workspaceItem) => workspaceItem.id === workspaceId)?.name ?? workspaceId;

  const [connectError, setConnectError] = useState<string | null>(null);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [folderPickerLoading, setFolderPickerLoading] = useState(false);
  const [pickerSelectedIds, setPickerSelectedIds] = useState<Set<string>>(new Set());
  const [savingFolders, setSavingFolders] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  const statusQueryEnabled =
    isLoaded && isSignedIn && !!userId && !!workspaceId;
  const statusQuery = useDriveConnectionStatus(workspaceId, statusQueryEnabled);
  const invalidateDriveStatus = useInvalidateDriveConnectionStatus();
  const status = statusQuery.data;
  const driveStatusLoading =
    (isSignedIn && isLoaded && !userId) ||
    (statusQueryEnabled && statusQuery.isPending);

  const handleConnectDrive = async () => {
    if (!userId || !workspaceId) return;
    setConnectError(null);
    const token = await getToken({ skipCache: true });
    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/workspace/${workspaceId}/documents?connected=1`
        : "";
    const data = await driveService.getAuthUrl(token, { returnUrl, workspaceId });
    if (data.authUrl) {
      window.location.href = data.authUrl;
      return;
    }
    setConnectError(data.error || translate("connectFailedStart"));
  };

  async function openFolderPicker() {
    if (!userId || !workspaceId) return;
    setFolderPickerOpen(true);
    setFolderError(null);
    setPickerSelectedIds(new Set(status?.selectedFolderIds ?? []));
    setFolderPickerLoading(true);
    setFolders([]);
    const token = await getToken({ skipCache: true });
    const result = await driveService.getFolders(token, workspaceId, "root");
    setFolderPickerLoading(false);
    if (result.ok) {
      setFolders(result.folders);
      setFolderError(result.driveError ?? null);
      return;
    }
    setFolderError(result.apiError || translate("folderLoadFailed"));
  }

  const toggleFolderSelection = (id: string) => {
    setPickerSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      if (next.size >= MAX_FOLDERS) return prev;
      next.add(id);
      return next;
    });
  };

  const saveFolderSelection = async () => {
    if (!userId || !workspaceId) return;
    setSavingFolders(true);
    setFolderError(null);
    const token = await getToken({ skipCache: true });
    const data = await driveService.saveFolderSelection(token, {
      workspaceId,
      folderIds: Array.from(pickerSelectedIds),
    });
    setSavingFolders(false);
    if (data.ok) {
      setFolderPickerOpen(false);
      invalidateDriveStatus(workspaceId);
      return;
    }
    setFolderError(data.error || translate("saveSelectionFailed"));
  };

  if (isLoaded && !isSignedIn) {
    return (
      <Layout className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Space direction="vertical" align="center">
          <Typography.Text type="secondary">{translate("signInPrompt")}</Typography.Text>
          <Link href="/sign-in">
            <Button type="primary">{translate("signIn")}</Button>
          </Link>
        </Space>
      </Layout>
    );
  }

  const isFolderPickerFetching = folderPickerLoading;
  const isFolderPickerErrorVisible = Boolean(folderError);
  const isFolderPickerEmptyVisible =
    !isFolderPickerFetching && !isFolderPickerErrorVisible && folders.length === 0;
  const isFolderPickerListVisible =
    !isFolderPickerFetching && folders.length > 0;
  const connectAlertMessage = connectError ?? oauthUrlAlert;

  return (
    <PageLayout centered={false}>
      <Typography.Title level={4}>{translate("pageTitle")}</Typography.Title>
      <Typography.Paragraph type="secondary" className="mt-1">
        {translate("pageLeadForWorkspace", { workspaceName })}
      </Typography.Paragraph>

      {connectAlertMessage && (
        <Alert type="error" message={connectAlertMessage} className="mt-4" showIcon />
      )}

      <Card title={translate("cardTitle")} className="mt-6">
        {driveStatusLoading && <Spin />}
        {!driveStatusLoading && status && !status.connected && (
          <>
            <Typography.Paragraph type="secondary">{translate("connectLead")}</Typography.Paragraph>
            {!status.driveConfigured && (
              <Alert
                type="warning"
                message={translate("adminMustEnableDrive")}
                className="mb-4"
                showIcon
              />
            )}
            <Button type="primary" icon={<GoogleOutlined />} onClick={handleConnectDrive}>
              {translate("connectButton")}
            </Button>
          </>
        )}
        {!driveStatusLoading && status && status.connected && (
          <>
            <Typography.Paragraph type="secondary">
              {translate("chooseFoldersLead", { max: MAX_FOLDERS })}
            </Typography.Paragraph>
            <Space className="mt-4" wrap>
              <Typography.Text>
                {translate("selectedCount", {
                  current: status.selectedFolderIds.length,
                  max: MAX_FOLDERS,
                })}
              </Typography.Text>
              <Button onClick={openFolderPicker}>
                {status.selectedFolderIds.length ? translate("changeFolders") : translate("chooseFolders")}
              </Button>
            </Space>
          </>
        )}
      </Card>

      <Modal
        title={translate("modalTitle", { max: MAX_FOLDERS })}
        open={folderPickerOpen}
        onCancel={() => !folderPickerLoading && !savingFolders && setFolderPickerOpen(false)}
        onOk={saveFolderSelection}
        okText={translate("modalSave")}
        cancelText={translate("modalCancel")}
        confirmLoading={savingFolders}
        okButtonProps={{ disabled: folderPickerLoading }}
      >
        <Typography.Paragraph type="secondary">{translate("modalHint")}</Typography.Paragraph>
        {isFolderPickerErrorVisible && (
          <Alert type="error" message={folderError} className="mb-4" showIcon />
        )}
        {isFolderPickerFetching && <Spin />}
        {isFolderPickerEmptyVisible && (
          <Typography.Text type="secondary">{translate("noFoldersInRoot")}</Typography.Text>
        )}
        {isFolderPickerListVisible && (
          <Space direction="vertical" className="w-full">
            {folders.map((folder) => (
              <Checkbox
                key={folder.id}
                checked={pickerSelectedIds.has(folder.id)}
                onChange={() => toggleFolderSelection(folder.id)}
                disabled={!pickerSelectedIds.has(folder.id) && pickerSelectedIds.size >= MAX_FOLDERS}
              >
                {folder.name}
              </Checkbox>
            ))}
          </Space>
        )}
      </Modal>
    </PageLayout>
  );
}

export function DocumentsScreen(props: DocumentsScreenProps) {
  return (
    <Suspense
      fallback={
        <PageLayout centered={false}>
          <Spin />
        </PageLayout>
      }
    >
      <DocumentsScreenBody {...props} />
    </Suspense>
  );
}
