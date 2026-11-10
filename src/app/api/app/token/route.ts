import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserById } from "@/lib/user-store";
import { getUserStatus } from "@/lib/user-status";
import { CODE_RE, DEVICE_NAME_MAX, TOKEN_TTL_DAYS, VERIFIER_RE, isAppLinkEnabled } from "@/lib/app-link/config";
import { createAppToken, redeemAuthCode, revokeAppToken, verifyAppToken } from "@/lib/app-link/store";
import { extractAppBearer, unauthorizedResponse } from "@/lib/app-link/request-user";
import { readJsonBody } from "@/lib/ugc-validation";

export const dynamic = "force-dynamic";

const notFound = () => new NextResponse("Not Found", { status: 404 });
const err = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

// コード + verifier をトークンに引き換える。
export async function POST(request: NextRequest) {
  if (!isAppLinkEnabled()) return notFound();

  if (!(await checkRateLimit(getClientIp(request), "APP_TOKEN", 10, 60))) {
    return err("rate_limited", 429);
  }

  const body = await readJsonBody<{ code?: unknown; verifier?: unknown; deviceName?: unknown }>(request, 4 * 1024);
  if (!body) return err("invalid_request", 400);
  const { code, verifier, deviceName } = body;
  if (typeof code !== "string" || !CODE_RE.test(code)) return err("invalid_request", 400);
  if (typeof verifier !== "string" || !VERIFIER_RE.test(verifier)) return err("invalid_request", 400);
  if (deviceName !== undefined && (typeof deviceName !== "string" || deviceName.length > DEVICE_NAME_MAX)) {
    return err("invalid_request", 400);
  }

  let tsuriId: string | null;
  try {
    tsuriId = await redeemAuthCode(code, verifier);
  } catch (e) {
    console.error("[app-link] コード引き換えエラー:", e);
    return err("server_error", 500);
  }
  if (!tsuriId) return err("invalid_code", 401);

  if ((await getUserStatus(tsuriId)) !== "active") return err("inactive", 403);
  const user = await getUserById(tsuriId);
  if (!user) return err("invalid_code", 401);

  let token: string;
  try {
    token = await createAppToken(tsuriId, typeof deviceName === "string" && deviceName ? deviceName : null);
  } catch (e) {
    console.error("[app-link] トークン発行エラー:", e);
    return err("server_error", 500);
  }

  return NextResponse.json(
    {
      ok: true,
      token,
      expiresInDays: TOKEN_TTL_DAYS,
      user: { nickname: user.nickname, avatarUrl: user.avatarUrl ?? null },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// このトークンを失効させる（すでに無効でも 200）。
export async function DELETE(request: NextRequest) {
  if (!isAppLinkEnabled()) return notFound();

  const bearer = extractAppBearer(request);
  if (!bearer) return unauthorizedResponse();
  const verified = await verifyAppToken(bearer);
  if (verified) await revokeAppToken(verified.tsuriId, verified.hash);
  return NextResponse.json({ ok: true });
}
