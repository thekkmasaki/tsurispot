// ユーザー間通知の一本化: アプリ内通知(NOTIF#)の保存 + Web Push 配信。
// 呼び出し側は `void notify(...)` で fire-and-forget する（通知失敗が本操作を壊さない）。
import { getPushSubscriptions, removePushSubscription } from "@/lib/user-store";
import { sendPush } from "@/lib/push";
import {
  addNotification,
  isBlockedBy,
  type NotificationType,
} from "@/lib/social-store";

interface NotifyInput {
  type: NotificationType;
  actorId: string;
  actorNickname: string;
  reportId?: string;
  excerpt?: string;
}

function pushBody(n: NotifyInput): string {
  switch (n.type) {
    case "like":
      return `${n.actorNickname}さんがあなたの釣果にいいねしました`;
    case "comment":
      return `${n.actorNickname}さんがコメントしました${n.excerpt ? `:「${n.excerpt}」` : ""}`;
    case "follow":
      return `${n.actorNickname}さんにフォローされました`;
    case "repost":
      return `${n.actorNickname}さんがあなたの釣果をリポストしました`;
  }
}

export async function notify(recipientTsuriId: string, input: NotifyInput): Promise<void> {
  try {
    // 自己通知の抑止
    if (!recipientTsuriId || recipientTsuriId === input.actorId) return;
    // 受信者が actor をブロックしていたら通知しない
    if (await isBlockedBy(recipientTsuriId, input.actorId)) return;

    await addNotification(recipientTsuriId, {
      type: input.type,
      actorId: input.actorId,
      actorNickname: input.actorNickname,
      reportId: input.reportId,
      excerpt: input.excerpt,
    });

    // Web Push（購読者のみ・失敗は無視、410は購読掃除）
    const subs = await getPushSubscriptions(recipientTsuriId);
    await Promise.all(
      subs.map(async (sub) => {
        const res = await sendPush(sub, {
          title: "ツリスポ",
          body: pushBody(input),
          url: "/notifications",
          tag: input.type,
        });
        if (!res.ok && res.status === 410) {
          await removePushSubscription(recipientTsuriId, sub.endpoint).catch(() => {});
        }
      }),
    );
  } catch (err) {
    console.error("[通知] 配信エラー:", err);
  }
}
