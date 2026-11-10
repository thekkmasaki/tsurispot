import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/user-store";
import { isAppLinkEnabled } from "@/lib/app-link/config";
import { extractAppBearer, getRequestUser, unauthorizedResponse } from "@/lib/app-link/request-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAppLinkEnabled()) return new NextResponse("Not Found", { status: 404 });

  // このエンドポイントはアプリ用トークン専用（Cookie セッションは受け付けない）
  if (!extractAppBearer(request)) return unauthorizedResponse();
  const r = await getRequestUser(request);
  if (r.kind !== "user") return unauthorizedResponse();

  const full = await getUserById(r.user.tsuriId);
  return NextResponse.json(
    {
      ok: true,
      user: {
        nickname: r.user.nickname,
        avatarUrl: r.user.avatarUrl,
        reportCount: full?.reportCount ?? 0,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
