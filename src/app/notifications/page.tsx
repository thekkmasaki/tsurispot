import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Heart, MessageCircle, UserPlus, Repeat2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  getNotifications,
  clearUnreadNotifications,
  type UserNotification,
} from "@/lib/social-store";

// 通知一覧: 開いた時点で未読を0化。ログイン者専用のためnoindex・dynamic
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "通知",
  robots: { index: false, follow: false },
};

const TYPE_ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  repost: Repeat2,
} as const;

function message(n: UserNotification): string {
  switch (n.type) {
    case "like":
      return `さんがあなたの釣果${n.excerpt ? `（${n.excerpt}）` : ""}にいいねしました`;
    case "comment":
      return `さんがコメントしました${n.excerpt ? `:「${n.excerpt}」` : ""}`;
    case "follow":
      return "さんにフォローされました";
    case "repost":
      return "さんがあなたの釣果をリポストしました";
  }
}

function href(n: UserNotification): string {
  if (n.type === "follow") return `/users/${n.actorId}`;
  return n.reportId ? `/posts/${encodeURIComponent(n.reportId)}` : `/users/${n.actorId}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function NotificationsPage() {
  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) redirect("/login");

  const notifications = await getNotifications(tsuriId, 30);
  await clearUnreadNotifications(tsuriId);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Bell className="size-5" aria-hidden="true" />
        通知
      </h1>

      <Card className="mt-4 py-0">
        <CardContent className="px-0">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              通知はまだありません。釣果を投稿したり、他の釣り人をフォローしてみましょう。
            </p>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? Bell;
                return (
                  <li key={n.id}>
                    <Link
                      prefetch={false}
                      href={href(n)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <Icon
                        className={
                          n.type === "like"
                            ? "mt-0.5 size-4 shrink-0 text-rose-500"
                            : "mt-0.5 size-4 shrink-0 text-sky-700"
                        }
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 text-sm leading-relaxed">
                        <span className="font-semibold">{n.actorNickname}</span>
                        {message(n)}
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
