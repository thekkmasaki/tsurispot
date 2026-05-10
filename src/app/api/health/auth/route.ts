import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * App Runner マルチインスタンス間の AUTH_SECRET 不整合検知 +
 * Cognito Provider Configuration エラーの原因切り分け用エンドポイント。
 *
 * 値そのものは絶対に漏らさない。present/absent + 長さ + OIDC 到達性のみ返す。
 */
export async function GET() {
  const secret = process.env.AUTH_SECRET;
  const cognitoIssuer = process.env.COGNITO_ISSUER;
  const cognitoClientId = process.env.COGNITO_CLIENT_ID;
  const cognitoClientSecret = process.env.COGNITO_CLIENT_SECRET;

  const digest = secret
    ? crypto.createHash("sha256").update(secret).digest("hex").slice(0, 8)
    : null;

  let oidcStatus: number | string | null = null;
  let oidcIssuerEcho: string | null = null;
  if (cognitoIssuer) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(
        `${cognitoIssuer.replace(/\/$/, "")}/.well-known/openid-configuration`,
        { signal: ctrl.signal, cache: "no-store" },
      );
      clearTimeout(t);
      oidcStatus = res.status;
      if (res.ok) {
        const json = (await res.json()) as { issuer?: unknown };
        oidcIssuerEcho = typeof json.issuer === "string" ? json.issuer : null;
      }
    } catch (e) {
      oidcStatus = e instanceof Error ? e.name : "unknown_error";
    }
  }

  return NextResponse.json({
    instance: process.env.HOSTNAME || "unknown",
    authSecretDigest: digest,
    authSecretPresent: Boolean(secret),
    authSecretLen: secret?.length ?? 0,
    cognitoIssuerPresent: Boolean(cognitoIssuer),
    cognitoIssuerLen: cognitoIssuer?.length ?? 0,
    cognitoClientIdPresent: Boolean(cognitoClientId),
    cognitoClientIdLen: cognitoClientId?.length ?? 0,
    cognitoClientSecretPresent: Boolean(cognitoClientSecret),
    cognitoClientSecretLen: cognitoClientSecret?.length ?? 0,
    oidc: {
      status: oidcStatus,
      issuerMatchesEnv:
        oidcIssuerEcho !== null &&
        cognitoIssuer !== undefined &&
        oidcIssuerEcho.replace(/\/$/, "") === cognitoIssuer.replace(/\/$/, ""),
    },
    timestamp: new Date().toISOString(),
  });
}
