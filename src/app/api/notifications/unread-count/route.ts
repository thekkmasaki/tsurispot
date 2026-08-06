import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/social-store";

// GET /api/notifications/unread-count — ヘッダーベル用（mount+focus時のみfetch、ポーリング禁止）
export async function GET() {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) {
    return NextResponse.json({ count: 0 });
  }
  const count = await getUnreadNotificationCount(tsuriId);
  return NextResponse.json({ count });
}
