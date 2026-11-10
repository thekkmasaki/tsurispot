import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { rejectInactiveUser } from "@/lib/user-status";
import { safeEqual } from "@/lib/safe-compare";
import { APP_LINK_REQ_COOKIE, appSchemeUrl, isAppLinkEnabled } from "@/lib/app-link/config";
import { parseAppLinkReq } from "@/lib/app-link/req-cookie";
import { issueAuthCode } from "@/lib/app-link/store";

export const dynamic = "force-dynamic";

const SITE_ORIGIN = "https://tsurispot.com";

/**
 * Origin ヘッダーがサイト自身のものか。
 * 本番で通すのは https://tsurispot.com だけ。本番のコンテナから見た自分の origin は
 * 内部のホスト名（localhost など）になり得るので、それを許可に入れない。
 * 開発・テストの時だけ、リクエスト自身の origin も通す。
 */
function isSameSiteOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  if (origin === SITE_ORIGIN) return true;
  return process.env.NODE_ENV !== "production" && origin === request.nextUrl.origin;
}

function forbidden() {
  return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
}

// 「連携する」ボタンの POST（通常の HTML フォーム）。コードを発行して固定スキームへ 303。
export async function POST(request: NextRequest) {
  if (!isAppLinkEnabled()) return new NextResponse("Not Found", { status: 404 });

  if (!(await checkRateLimit(getClientIp(request), "APP_LINK_APPROVE", 20, 60))) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  if (!isSameSiteOrigin(request)) return forbidden();

  const reqInfo = parseAppLinkReq(request.cookies.get(APP_LINK_REQ_COOKIE)?.value);
  if (!reqInfo) return forbidden();

  let formNonce: unknown;
  try {
    formNonce = (await request.formData()).get("nonce");
  } catch {
    return forbidden();
  }
  if (typeof formNonce !== "string" || !safeEqual(formNonce, reqInfo.nonce)) return forbidden();

  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) return forbidden();
  if (await rejectInactiveUser(tsuriId)) return forbidden();

  const code = await issueAuthCode(tsuriId, reqInfo.challenge);

  const res = new NextResponse(null, {
    status: 303,
    headers: { Location: appSchemeUrl({ code, state: reqInfo.state }), "Cache-Control": "no-store" },
  });
  res.cookies.set(APP_LINK_REQ_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
