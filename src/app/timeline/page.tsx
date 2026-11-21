import type { Metadata } from "next";
import Link from "next/link";
import { Users, Send, FileText, Trophy, UserSearch, Map } from "lucide-react";
import { TimelineFeed } from "@/components/social/timeline-feed";
import { PreFooterAd, StickySidebarAd } from "@/components/ads/ad-unit";

// タイムライン: ISR不使用（キャッシュ肥大回避）。SNSページはnoindex一貫。
// h1はServer Componentで出す（SSR空HTML=CSR bailout前歴の回避）
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "みんなのタイムライン｜全国の釣果が集まる",
  description:
    "ツリスポのタイムライン。全国の釣り人の釣果投稿が集まります。いいね・コメントで交流し、気になる釣り人をフォローしましょう。",
  robots: { index: false, follow: false },
};

const SIDE_LINKS = [
  { href: "/catch-reports", label: "釣果レポート", icon: FileText },
  { href: "/ranking", label: "ランキング", icon: Trophy },
  { href: "/users", label: "釣り人を探す", icon: UserSearch },
  { href: "/map", label: "地図から探す", icon: Map },
] as const;

export default function TimelinePage() {
  return (
    // PC: フィード(最大720px)+右サイドバー(300px)の2カラム。モバイルは1カラムで左右余白を詰める
    <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="lg:grid lg:grid-cols-[minmax(0,720px)_300px] lg:justify-center lg:gap-8">
        <div className="min-w-0">
          {/* 狭い端末(〜360px)では見出しとボタンが1行に収まらないため行ごと wrap */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <h1 className="flex items-center gap-2 text-lg font-bold sm:text-2xl">
              <Users className="size-5 sm:size-6" aria-hidden="true" />
              みんなのタイムライン
            </h1>
            <Link
              prefetch={false}
              href="/post"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-800 lg:hidden"
            >
              <Send className="size-4" aria-hidden="true" />
              釣果を投稿
            </Link>
          </div>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            全国の釣果が集まるタイムライン。いいねやコメントで釣り仲間と交流しましょう。
          </p>

          <div className="mt-4">
            <TimelineFeed />
          </div>
        </div>

        <aside className="hidden lg:block" aria-label="タイムラインのメニュー">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-base font-bold">今日の釣果をシェアしよう</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                写真1枚・魚の名前だけでもOK。あなたの釣果が誰かの次の1匹につながります。
              </p>
              <Link
                prefetch={false}
                href="/post"
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-sky-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-800"
              >
                <Send className="size-4" aria-hidden="true" />
                釣果を投稿
              </Link>
            </div>
            <nav className="rounded-2xl border bg-card p-2">
              {SIDE_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  prefetch={false}
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Icon className="size-4 text-sky-700" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>
            <StickySidebarAd className="!static" />
          </div>
        </aside>
      </div>

      <PreFooterAd />
    </main>
  );
}
