"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

/** API redirect `errorCode` query values → `documents` i18n keys */
const DRIVE_OAUTH_ERROR_I18N: Record<string, string> = {
  oauth_missing_params: "oauthErrorMissingParams",
  oauth_state_invalid: "oauthErrorStateInvalid",
  drive_not_configured: "oauthErrorDriveNotConfigured",
  oauth_no_refresh_token: "oauthErrorNoRefreshToken",
  oauth_token_exchange_failed: "oauthErrorTokenExchangeFailed",
};

/**
 * Message to show after Google redirects back to the app with `errorCode` or legacy `error`
 * (used on `/documents` and workspace documents screens).
 */
export function useDriveOAuthUrlAlertMessage(): string | null {
  const searchParams = useSearchParams();
  const translate = useTranslations("documents");
  return useMemo(() => {
    if (searchParams.get("connected")) return null;
    const errorCode = searchParams.get("errorCode");
    if (errorCode) {
      const i18nKey = DRIVE_OAUTH_ERROR_I18N[errorCode];
      return i18nKey ? translate(i18nKey) : translate("oauthErrorUnknown");
    }
    if (searchParams.get("error")) return translate("connectCallbackFailedLegacy");
    return null;
  }, [searchParams, translate]);
}
