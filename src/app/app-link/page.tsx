import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Fish, Link2, PenLine, UserX } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserStatus } from "@/lib/user-status";
import { APP_LINK_REQ_COOKIE, appSchemeUrl, isAppLinkEnabled } from "@/lib/app-link/config";
import { parseAppLinkReq } from "@/lib/app-link/req-cookie";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "アプリ連携",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-mid to-ocean-deep text-white">
              <Fish className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="bg-gradient-to-r from-ocean-deep to-ocean-mid bg-clip-text text-lg font-bold text-transparent font-display">
              ツリスポ
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/** 連携を始めた時刻（日本時間）。旧Cookieで不明なら表示時刻を使う */
function formatStartedAt(startedAt: number | undefined): string {
  return new Date(startedAt ?? Date.now()).toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AppLinkPage() {
  if (!isAppLinkEnabled()) notFound();

  const cookieStore = await cookies();
  const req = parseAppLinkReq(cookieStore.get(APP_LINK_REQ_COOKIE)?.value);
  if (!req) {
    return (
      <Shell>
        <div className="rounded-xl border bg-card p-5 text-center text-sm">
          <p className="font-medium">アプリからもう一度やり直してください</p>
          <p className="mt-2 text-xs text-muted-foreground">
            連携の有効期限が切れたか、リンクが正しくありません。
          </p>
        </div>
      </Shell>
    );
  }

  const session = await auth();
  const tsuriId = session?.user?.tsuriId;
  if (!tsuriId) redirect("/login");

  if ((await getUserStatus(tsuriId)) !== "active") {
    return (
      <Shell>
        <div className="rounded-xl border bg-card p-5 text-center text-sm">
          <p className="font-medium">このアカウントでは連携できません</p>
        </div>
      </Shell>
    );
  }

  const cancelUrl = appSchemeUrl({ error: "cancelled", state: req.state });
  const nickname = session.user.nickname || "釣り人";
  // 心当たりのない連携要求に気付けるよう、連携を始めた時刻を明示する
  const startedLabel = formatStartedAt(req.startedAt);

  return (
    <Shell>
      <div className="space-y-5 rounded-xl border bg-card p-5">
        <div className="text-center">
          <h1 className="text-lg font-bold">釣果記録アプリと連携しますか</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ログイン中のアカウント: <span className="font-medium text-foreground">{nickname}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            連携を始めた時刻: <span className="font-medium text-foreground">{startedLabel}</span>（日本時間）
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-xs font-medium text-muted-foreground">連携すると、アプリから次のことができます</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-ocean-mid" aria-hidden="true" />
              <span>あなたの名前で釣果を投稿する</span>
            </li>
            <li className="flex items-start gap-2">
              <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-ocean-mid" aria-hidden="true" />
              <span>自分の投稿を修正・削除する</span>
            </li>
            <li className="flex items-start gap-2">
              <UserX className="mt-0.5 h-4 w-4 shrink-0 text-ocean-mid" aria-hidden="true" />
              <span>アカウントを退会する</span>
            </li>
          </ul>
          <p
            role="alert"
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
          >
            このボタンは、あなたが今ツリスポ釣果記録アプリから連携を始めた場合だけ押してください。覚えがない時や、上の時刻に心当たりがない時は「やめる」を押してください。
          </p>
        </div>

        <form method="POST" action="/api/app/link/approve" className="space-y-3">
          <input type="hidden" name="nonce" value={req.nonce} />
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-ocean-mid to-ocean-deep px-4 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            連携する
          </button>
          <a
            href={cancelUrl}
            className="flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            やめる
          </a>
        </form>
      </div>
    </Shell>
  );
}
