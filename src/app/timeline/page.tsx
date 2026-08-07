import type { Metadata } from "next";
import Link from "next/link";
import { Users, Send } from "lucide-react";
import { TimelineFeed } from "@/components/social/timeline-feed";
import { PreFooterAd } from "@/components/ads/ad-unit";

// タイムライン: ISR不使用（キャッシュ肥大回避）。SNSページはnoindex一貫。
// h1はServer Componentで出す（SSR空HTML=CSR bailout前歴の回避）
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "みんなのタイムライン｜全国の釣果がリアルタイムに流れる",
  description:
    "ツリスポのタイムライン。全国の釣り人の釣果投稿がリアルタイムに流れます。いいね・コメントで交流し、気になる釣り人をフォローしましょう。",
  robots: { index: false, follow: false },
};

export default function TimelinePage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Users className="size-5" aria-hidden="true" />
          みんなのタイムライン
        </h1>
        <Link
          prefetch={false}
          href="/post"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sky-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-800"
        >
          <Send className="size-4" aria-hidden="true" />
          釣果を投稿
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        全国の釣果がリアルタイムに流れます。いいねやコメントで釣り仲間と交流しましょう。
      </p>

      <div className="mt-4">
        <TimelineFeed />
      </div>

      <PreFooterAd />
    </main>
  );
}
