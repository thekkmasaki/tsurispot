import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPushSubscriptions,
  removePushSubscription,
} from "@/lib/auth-redis";
import { sendPush } from "@/lib/push";

export async function POST() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const subs = await getPushSubscriptions(userId);
  if (subs.length === 0) {
    return NextResponse.json(
      { error: "購読されている端末がありません" },
      { status: 400 },
    );
  }
  const results = await Promise.all(
    subs.map((sub) =>
      sendPush(sub, {
        title: "ツリスポ テスト通知",
        body: "通知が届きました！🎣 お気に入りスポットの好機をお知らせします。",
        url: "/mypage",
      }),
    ),
  );
  // 410 Gone (期限切れ) の購読は削除
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 410 || results[i].status === 404) {
      await removePushSubscription(userId, subs[i].endpoint);
    }
  }
  const okCount = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: okCount > 0,
    sent: okCount,
    total: subs.length,
  });
}
