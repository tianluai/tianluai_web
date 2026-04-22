"use client";

/**
 * Workspace “Google Drive” settings UI for `/workspace/[workspaceId]/documents`.
 *
 * - The **Next.js page** is `workspace-documents.page.tsx` (and `app/.../documents/page.tsx`), which only passes `workspaceId`.
 * - **`DocumentsScreen`** is what the page renders — the public domain entry for this route.
 * - **`DocumentsScreenBody`** uses hooks that read the URL; in the App Router they must live under `<Suspense>`, so the body is wrapped by `DocumentsScreen`.
 */

import { useAuth } from "@/lib/auth/use-auth";
import { useMemo, useState, Suspense } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Layout,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useLocale, useTranslations } from "next-intl";
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
import { pollDocumentIndexJobUntilTerminal } from "@/domains/documents/lib/poll-document-index-job";

const MAX_FOLDERS = 3;

type DocumentsScreenProps = {
  workspaceId: string;
};

function DocumentsScreenBody({ workspaceId }: DocumentsScreenProps) {
  const { getToken, isSignedIn, isLoaded, userId } = useAuth();
  const translate = useTranslations("documents");
  const locale = useLocale();
  const oauthUrlAlert = useDriveOAuthUrlAlertMessage();
  const { data: workspaces = [] } = useWorkspaces();
  const workspaceDisplayName = useMemo(() => {
    const name = workspaces.find((w) => w.id === workspaceId)?.name?.trim();
    if (name) return name;
    return translate("workspaceDefaultLabel");
  }, [workspaces, workspaceId, translate]);

  const [connectError, setConnectError] = useState<string | null>(null);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [folderPickerLoading, setFolderPickerLoading] = useState(false);
  const [pickerSelectedIds, setPickerSelectedIds] = useState<Set<string>>(new Set());
  const [savingFolders, setSavingFolders] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncInfo, setSyncInfo] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const statusQueryEnabled =
    isLoaded && isSignedIn && !!userId && !!workspaceId;
  const statusQuery = useDriveConnectionStatus(workspaceId, statusQueryEnabled);
  const invalidateDriveStatus = useInvalidateDriveConnectionStatus();
  const status = statusQuery.data;
  const lastSyncedFormatted = useMemo(() => {
    const iso = status?.lastGoogleDriveSyncAt;
    if (!iso) return null;
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return null;
    }
  }, [status?.lastGoogleDriveSyncAt, locale]);
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

  const pollSyncStatus = async (jobId: string) => {
    const outcome = await pollDocumentIndexJobUntilTerminal({
      workspaceId,
      jobId,
      getToken: () => getToken({ skipCache: true }),
      fetchStatus: driveService.getSyncStatus,
      onInProgress: () => setSyncInfo(translate("indexing")),
    });

    if (outcome.kind === "status_request_failed") {
      const statusErrorMessage = outcome.unauthorized
        ? translate("notSignedIn")
        : outcome.errorMessage || translate("apiUnreachable");
      setSyncError(
        translate("syncFailedDetail", {
          error: statusErrorMessage,
        }),
      );
      return;
    }

    if (outcome.kind === "failed") {
      setSyncError(
        translate("syncFailedDetail", {
          error: outcome.failedReason || translate("apiUnreachable"),
        }),
      );
      return;
    }

    if (outcome.kind === "max_wait_reached") {
      setSyncInfo(translate("indexingSlow"));
      return;
    }

    if (outcome.indexedChunks === 0 || outcome.indexedFiles === 0) {
      setSyncInfo(translate("doneNoFiles"));
      return;
    }
    setSyncInfo(
      translate("doneWithCounts", {
        chunks: outcome.indexedChunks,
        files: outcome.indexedFiles,
      }),
    );
  };

  const handleSyncNow = async () => {
    if (!workspaceId || !userId) return;
    setSyncError(null);
    setSyncInfo(null);
    setSyncLoading(true);
    const token = await getToken({ skipCache: true });
    const startSyncResult = await driveService.startSync(token, workspaceId);
    if (!startSyncResult.ok) {
      setSyncLoading(false);
      setSyncError(
        translate("syncFailedDetail", {
          error: startSyncResult.error || translate("apiUnreachable"),
        }),
      );
      return;
    }

    if (!startSyncResult.jobId) {
      setSyncLoading(false);
      setSyncError(translate("noJobId"));
      return;
    }

    await pollSyncStatus(startSyncResult.jobId);
    setSyncLoading(false);
    invalidateDriveStatus(workspaceId);
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
        {translate("pageLeadMultiSource", { workspaceName: workspaceDisplayName })}
      </Typography.Paragraph>

      {connectAlertMessage && (
        <Alert type="error" message={connectAlertMessage} className="mt-4" showIcon />
      )}
      {syncInfo && <Alert type="info" message={syncInfo} className="mt-4" showIcon />}
      {syncError && <Alert type="error" message={syncError} className="mt-4" showIcon />}

      <Typography.Title level={5} className="mt-8 mb-1">
        {translate("sourcesOverviewTitle")}
      </Typography.Title>
      <Typography.Paragraph type="secondary" className="mb-4 !mt-0">
        {translate("sourcesOverviewIntro")}
      </Typography.Paragraph>

      {/* Document sources: only Google Drive today; add another Card here when a new integration ships. */}
      <div className="max-w-3xl">
        <Card
          className="min-h-0"
          title={
            <Space align="center">
              <span>{translate("sourceGoogleDriveTitle")}</span>
              {status && !driveStatusLoading ? (
                <Tag
                  color={
                    status.connected
                      ? "green"
                      : status.driveSessionExpired
                        ? "warning"
                        : "default"
                  }
                >
                  {status.connected
                    ? translate("sourceGoogleDriveStatusConnected")
                    : status.driveSessionExpired
                      ? translate("sourceGoogleDriveStatusReconnect")
                      : translate("sourceGoogleDriveStatusNotConnected")}
                </Tag>
              ) : null}
            </Space>
          }
        >
          {driveStatusLoading && <Spin />}
          {!driveStatusLoading && status && (
            <>
              <Typography.Paragraph type="secondary" className="!mt-0 !mb-4">
                {translate("sourceGoogleDriveSubtitle")}
              </Typography.Paragraph>
              <Typography.Text type="secondary" className="mb-2 block">
                {lastSyncedFormatted
                  ? translate("lastSynced", { date: lastSyncedFormatted })
                  : translate("lastSyncedNever")}
              </Typography.Text>
              <Typography.Text type="secondary" className="mb-4 block">
                {status.indexedVectorCount !== null
                  ? translate("indexedChunksInVectorStore", {
                      count: status.indexedVectorCount,
                    })
                  : translate("indexedChunksUnknown")}
              </Typography.Text>

              {status.driveSessionExpired && (
                <Alert
                  type="warning"
                  message={translate("driveSessionExpiredLead")}
                  className="mb-4"
                  showIcon
                />
              )}

              {!status.connected &&
                !status.driveSessionExpired &&
                (status.indexedVectorCount ?? 0) > 0 && (
                  <Alert
                    type="info"
                    message={translate("reconnectPromptIndexedData")}
                    className="mb-4"
                    showIcon
                  />
                )}

              {(status.connected || status.driveSessionExpired) && (
                <>
                  <Typography.Paragraph type="secondary">
                    {status.driveSessionExpired
                      ? translate("driveSessionExpiredFoldersLead")
                      : status.selectedFolderIds.length === 0
                        ? translate("chooseFoldersLead", { max: MAX_FOLDERS })
                        : translate("manageFoldersLead", { max: MAX_FOLDERS })}
                  </Typography.Paragraph>
                  <Space className="mt-2" wrap>
                    <Typography.Text>
                      {translate("selectedCount", {
                        current: status.selectedFolderIds.length,
                        max: MAX_FOLDERS,
                      })}
                    </Typography.Text>
                    <Button onClick={openFolderPicker} disabled={!status.connected}>
                      {status.selectedFolderIds.length ? translate("changeFolders") : translate("chooseFolders")}
                    </Button>
                    <Button
                      type="primary"
                      loading={syncLoading}
                      disabled={
                        status.selectedFolderIds.length === 0 || syncLoading || !status.connected
                      }
                      onClick={handleSyncNow}
                    >
                      {translate("syncNow")}
                    </Button>
                  </Space>

                  {(status.selectedFolders.length > 0 || (status.indexedSources?.totalFiles ?? 0) > 0) && (
                    <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-700">
                      <Typography.Title level={5} className="!mb-3">
                        {translate("sourcesSectionTitle")}
                      </Typography.Title>

                      {status.selectedFolders.length > 0 && (
                        <div className="mb-4">
                          <Typography.Text type="secondary" className="mb-2 block">
                            {translate("connectedFoldersTitle")}
                          </Typography.Text>
                          <Space wrap size={[8, 8]}>
                            {status.selectedFolders.map((folder) => (
                              <Tag key={folder.id} color="blue">
                                {folder.name}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      )}

                      <div>
                        <Typography.Text type="secondary" className="mb-2 block">
                          {translate("indexedFilesTitle")}
                        </Typography.Text>
                        {status.indexedSources && status.indexedSources.totalFiles > 0 ? (
                          <>
                            <Typography.Text type="secondary" className="mb-2 block">
                              {translate("totalFilesLabel", { count: status.indexedSources.totalFiles })}
                            </Typography.Text>
                            <ul className="m-0 list-disc space-y-1 pl-5">
                              {status.indexedSources.fileNames.map((name, index) => (
                                <li key={`${name}-${index}`}>
                                  <Typography.Text>{name}</Typography.Text>
                                </li>
                              ))}
                            </ul>
                            {status.indexedSources.totalFiles > status.indexedSources.fileNames.length ? (
                              <Typography.Text type="secondary" className="mt-2 block">
                                {translate("indexedFilesMore", {
                                  count:
                                    status.indexedSources.totalFiles - status.indexedSources.fileNames.length,
                                })}
                              </Typography.Text>
                            ) : null}
                          </>
                        ) : (
                          <Typography.Paragraph type="secondary" className="!mb-0">
                            {translate("indexedFilesEmpty")}
                          </Typography.Paragraph>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {!status.connected && status.driveSessionExpired && (
                <Space direction="vertical" className="mt-6 w-full" size="middle">
                  <Typography.Paragraph type="secondary" className="!mb-0">
                    {translate("reconnectLeadShort")}
                  </Typography.Paragraph>
                  {!status.driveConfigured && (
                    <Alert
                      type="warning"
                      message={translate("adminMustEnableDrive")}
                      showIcon
                    />
                  )}
                  <Button type="primary" icon={<GoogleOutlined />} onClick={handleConnectDrive}>
                    {translate("reconnectButton")}
                  </Button>
                </Space>
              )}

              {!status.connected && !status.driveSessionExpired && (
                <>
                  <Typography.Paragraph type="secondary" className="mt-6">
                    {translate("connectLead")}
                  </Typography.Paragraph>
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
            </>
          )}
        </Card>
      </div>

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
