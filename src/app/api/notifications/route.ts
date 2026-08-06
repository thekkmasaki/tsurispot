import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNotifications, clearUnreadNotifications } from "@/lib/social-store";

// GET /api/notifications — 通知一覧（取得と同時に未読を0化）
export async function GET() {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const notifications = await getNotifications(tsuriId, 30);
  await clearUnreadNotifications(tsuriId);
  return NextResponse.json({ notifications });
}
