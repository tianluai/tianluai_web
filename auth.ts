import NextAuth from "next-auth";
import type { Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import { SignJWT } from "jose";

/** NextAuth cookie encryption; set `AUTH_SECRET` or `NEXTAUTH_SECRET` in env. */
function resolveNextAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

/** Shared with Nest `AUTH_JWT_SECRET` for HS256 API Bearer tokens. */
function getJwtSecretBytes(): Uint8Array {
  const value = process.env.AUTH_JWT_SECRET ?? "";
  if (!value) {
    throw new Error("AUTH_JWT_SECRET is required (must match the Nest API)");
  }
  return new TextEncoder().encode(value);
}

/** Becomes the JWT `sub` claim (stable id for the Nest API / Mongo user key). */
async function mintApiAccessToken(authenticatedUserSubject: string): Promise<string> {
  const secret = getJwtSecretBytes();
  return await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(authenticatedUserSubject)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

type StringFieldBinding = readonly { sourceKey: string; targetKey: string }[];

function copyOptionalStringFields(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  fields: StringFieldBinding,
): void {
  for (const { sourceKey, targetKey } of fields) {
    const value = source[sourceKey];
    if (typeof value !== "string") continue;
    target[targetKey] = value;
  }
}

/** Google OIDC profile fields → NextAuth JWT payload keys. */
const GOOGLE_PROFILE_TO_JWT_FIELDS: StringFieldBinding = [
  { sourceKey: "name", targetKey: "name" },
  { sourceKey: "email", targetKey: "email" },
  { sourceKey: "picture", targetKey: "picture" },
];

/** JWT payload keys → `Session["user"]` keys (`picture` maps to Ant/Next `image`). */
const JWT_TO_SESSION_USER_FIELDS: StringFieldBinding = [
  { sourceKey: "name", targetKey: "name" },
  { sourceKey: "email", targetKey: "email" },
  { sourceKey: "picture", targetKey: "image" },
  { sourceKey: "sub", targetKey: "id" },
];

function assignGoogleProfileToToken(token: JWT, profile: unknown): void {
  if (profile == null || typeof profile !== "object") return;
  const record = profile as Record<string, unknown>;
  copyOptionalStringFields(record, token as Record<string, unknown>, GOOGLE_PROFILE_TO_JWT_FIELDS);
}

function readExistingJwtSubject(token: JWT): string | null {
  if (typeof token.sub !== "string" || !token.sub) return null;
  return token.sub;
}

async function handleJwtCallback(params: {
  token: JWT;
  account?: Account | null;
  profile?: unknown;
}): Promise<JWT> {
  const { token, account, profile } = params;

  if (account?.provider === "google" && account.providerAccountId) {
    const googleAccountUserId = account.providerAccountId;
    token.sub = googleAccountUserId;
    token.apiAccessToken = await mintApiAccessToken(googleAccountUserId);
    assignGoogleProfileToToken(token, profile);
    return token;
  }

  const existingSubject = readExistingJwtSubject(token);
  if (!existingSubject) return token;
  if (token.apiAccessToken) return token;
  token.apiAccessToken = await mintApiAccessToken(existingSubject);
  return token;
}

function hydrateSessionUserFromToken(
  user: NonNullable<Session["user"]>,
  token: JWT,
): void {
  copyOptionalStringFields(
    token as Record<string, unknown>,
    user as Record<string, unknown>,
    JWT_TO_SESSION_USER_FIELDS,
  );
}

function attachApiAccessTokenToSession(session: Session, token: JWT): void {
  if (typeof token.apiAccessToken !== "string") return;
  session.apiAccessToken = token.apiAccessToken;
}

function handleSessionCallback(params: {
  session: Session;
  token: JWT;
}): Session {
  const { session, token } = params;
  if (session.user) hydrateSessionUserFromToken(session.user, token);
  attachApiAccessTokenToSession(session, token);
  return session;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: resolveNextAuthSecret(),
  providers: [Google],
  trustHost: true,
  pages: { signIn: "/sign-in" },
  callbacks: {
    jwt: (params) => handleJwtCallback(params),
    session: (params) => handleSessionCallback(params),
  },
});
