import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Legacy URL without locale prefix — send users to the locale-prefixed documents route.
 */
export default function DocumentsRedirectPage() {
  redirect(`/${routing.defaultLocale}/documents`);
}
