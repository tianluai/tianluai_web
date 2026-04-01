"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";
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
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageLayout } from "@/components/ui";
import { useWorkspaces } from "@/domains/workspace/workspace.queries";
import {
  fetchDriveAuthUrl,
  fetchDriveFolders,
  fetchDriveStatus,
  saveDriveFolderSelection,
  type DriveFolder,
} from "@/domains/documents/services/drive-api";

const MAX_FOLDERS = 3;

type Status = {
  connected: boolean;
  driveConfigured: boolean;
  selectedFolderIds: string[];
} | null;

type DocumentsScreenProps = {
  workspaceId: string;
};

function DocumentsContent({ workspaceId }: DocumentsScreenProps) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const userId = user?.id ?? "";
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("documents");
  const { data: workspaces = [] } = useWorkspaces();
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? workspaceId;

  const [status, setStatus] = useState<Status>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [folderPickerLoading, setFolderPickerLoading] = useState(false);
  const [pickerSelectedIds, setPickerSelectedIds] = useState<Set<string>>(new Set());
  const [savingFolders, setSavingFolders] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!userId || !workspaceId) return;
    const token = await getToken({ skipCache: true });
    const result = await fetchDriveStatus(token, userId, workspaceId);
    if (!result.ok) {
      setStatus({ connected: false, driveConfigured: false, selectedFolderIds: [] });
      return;
    }
    setStatus(result.data);
  }, [getToken, userId, workspaceId]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || !workspaceId) return;
    void fetchStatus();
  }, [isLoaded, isSignedIn, userId, workspaceId, fetchStatus]);

  useEffect(() => {
    const error = searchParams.get("error");
    const connected = searchParams.get("connected");
    if (error) setConnectError(decodeURIComponent(error));
    if (connected) setConnectError(null);
  }, [searchParams]);

  const handleConnectDrive = async () => {
    if (!userId || !workspaceId) return;
    setConnectError(null);
    const token = await getToken({ skipCache: true });
    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/${locale}/workspace/${workspaceId}/documents?connected=1`
        : "";
    const data = await fetchDriveAuthUrl(token, { returnUrl, userId, workspaceId });
    if (data.authUrl) {
      window.location.href = data.authUrl;
      return;
    }
    setConnectError(data.error || t("connectFailedStart"));
  };

  const openFolderPicker = useCallback(async () => {
    if (!userId || !workspaceId) return;
    setFolderPickerOpen(true);
    setFolderError(null);
    setPickerSelectedIds(new Set(status?.selectedFolderIds ?? []));
    setFolderPickerLoading(true);
    setFolders([]);
    const token = await getToken({ skipCache: true });
    try {
      const result = await fetchDriveFolders(token, userId, workspaceId, "root");
      if (result.ok) {
        setFolders(result.folders);
        setFolderError(result.driveError ?? null);
        return;
      }
      setFolderError(result.apiError || t("folderLoadFailed"));
    } catch {
      setFolderError(t("folderLoadFailed"));
    } finally {
      setFolderPickerLoading(false);
    }
  }, [getToken, status?.selectedFolderIds, t, userId, workspaceId]);

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
    try {
      const token = await getToken({ skipCache: true });
      const data = await saveDriveFolderSelection(token, {
        userId,
        workspaceId,
        folderIds: Array.from(pickerSelectedIds),
      });
      if (data.ok) {
        setFolderPickerOpen(false);
        void fetchStatus();
        return;
      }
      setFolderError(data.error || t("saveSelectionFailed"));
    } catch {
      setFolderError(t("saveSelectionFailed"));
    } finally {
      setSavingFolders(false);
    }
  };

  if (isLoaded && !isSignedIn) {
    return (
      <Layout className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Space direction="vertical" align="center">
          <Typography.Text type="secondary">{t("signInPrompt")}</Typography.Text>
          <Link href="/sign-in">
            <Button type="primary">{t("signIn")}</Button>
          </Link>
        </Space>
      </Layout>
    );
  }

  return (
    <PageLayout centered={false}>
      <Typography.Title level={4}>{t("pageTitle")}</Typography.Title>
      <Typography.Paragraph type="secondary" className="mt-1">
        {t("pageLeadForWorkspace", { workspaceName })}
      </Typography.Paragraph>

      {connectError && (
        <Alert type="error" message={connectError} className="mt-4" showIcon />
      )}

      <Card title={t("cardTitle")} className="mt-6">
        {status === null && <Spin />}
        {status !== null && !status.connected && (
          <>
            <Typography.Paragraph type="secondary">{t("connectLead")}</Typography.Paragraph>
            {!status.driveConfigured && (
              <Alert
                type="warning"
                message={t("adminMustEnableDrive")}
                className="mb-4"
                showIcon
              />
            )}
            <Button type="primary" icon={<GoogleOutlined />} onClick={handleConnectDrive}>
              {t("connectButton")}
            </Button>
          </>
        )}
        {status !== null && status.connected && (
          <>
            <Typography.Paragraph type="secondary">
              {t("chooseFoldersLead", { max: MAX_FOLDERS })}
            </Typography.Paragraph>
            <Space className="mt-4" wrap>
              <Typography.Text>
                {t("selectedCount", {
                  current: status.selectedFolderIds.length,
                  max: MAX_FOLDERS,
                })}
              </Typography.Text>
              <Button onClick={openFolderPicker}>
                {status.selectedFolderIds.length ? t("changeFolders") : t("chooseFolders")}
              </Button>
            </Space>
          </>
        )}
      </Card>

      <Modal
        title={t("modalTitle", { max: MAX_FOLDERS })}
        open={folderPickerOpen}
        onCancel={() => !folderPickerLoading && !savingFolders && setFolderPickerOpen(false)}
        onOk={saveFolderSelection}
        okText={t("modalSave")}
        cancelText={t("modalCancel")}
        confirmLoading={savingFolders}
        okButtonProps={{ disabled: folderPickerLoading }}
      >
        <Typography.Paragraph type="secondary">{t("modalHint")}</Typography.Paragraph>
        {folderError && <Alert type="error" message={folderError} className="mb-4" showIcon />}
        {folderPickerLoading && <Spin />}
        {!folderPickerLoading && folders.length === 0 && !folderError && (
          <Typography.Text type="secondary">{t("noFoldersInRoot")}</Typography.Text>
        )}
        {!folderPickerLoading && folders.length > 0 && (
          <Space direction="vertical" className="w-full">
            {folders.map((f) => (
              <Checkbox
                key={f.id}
                checked={pickerSelectedIds.has(f.id)}
                onChange={() => toggleFolderSelection(f.id)}
                disabled={!pickerSelectedIds.has(f.id) && pickerSelectedIds.size >= MAX_FOLDERS}
              >
                {f.name}
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
      <DocumentsContent {...props} />
    </Suspense>
  );
}
