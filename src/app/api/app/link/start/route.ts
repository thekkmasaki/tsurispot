import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  APP_LINK_REQ_COOKIE,
  APP_LINK_REQ_TTL_SECONDS,
  CHALLENGE_RE,
  STATE_RE,
  isAppLinkEnabled,
} from "@/lib/app-link/config";
import { randomB64url } from "@/lib/app-link/store";

export const dynamic = "force-dynamic";

// アプリ連携の入口。アプリが Safari の小窓（ASWebAuthenticationSession）で開く。
export async function GET(request: NextRequest) {
  if (!isAppLinkEnabled()) return new NextResponse("Not Found", { status: 404 });

  if (!(await checkRateLimit(getClientIp(request), "APP_LINK_START", 30, 60))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const challenge = request.nextUrl.searchParams.get("challenge") ?? "";
  const state = request.nextUrl.searchParams.get("state") ?? "";
  if (!CHALLENGE_RE.test(challenge) || !STATE_RE.test(state)) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const nonce = randomB64url(16);
  const value = Buffer.from(JSON.stringify({ c: challenge, s: state, n: nonce, t: Date.now() })).toString("base64url");

  // 相対 Location（プロキシ配下でもホストを取り違えない）
  const res = new NextResponse(null, { status: 302, headers: { Location: "/app-link" } });
  res.cookies.set(APP_LINK_REQ_COOKIE, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: APP_LINK_REQ_TTL_SECONDS,
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
