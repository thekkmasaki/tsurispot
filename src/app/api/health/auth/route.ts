import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * App Runner マルチインスタンス間の AUTH_SECRET 不整合を検知するエンドポイント。
 * すべてのインスタンスから同じ digest が返れば secret は同期されている。
 * 値そのものは漏らさず、SHA256 の最初8文字だけ返す。
 */
export async function GET() {
  const secret = process.env.AUTH_SECRET;
  const cognitoIssuer = process.env.COGNITO_ISSUER;
  const cognitoClientId = process.env.COGNITO_CLIENT_ID;

  const digest = secret
    ? crypto.createHash("sha256").update(secret).digest("hex").slice(0, 8)
    : null;

  return NextResponse.json({
    instance: process.env.HOSTNAME || "unknown",
    authSecretDigest: digest,
    authSecretPresent: Boolean(secret),
    cognitoIssuerPresent: Boolean(cognitoIssuer),
    cognitoClientIdPresent: Boolean(cognitoClientId),
    timestamp: new Date().toISOString(),
  });
}
