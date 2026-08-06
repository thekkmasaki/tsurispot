import type { Metadata } from "next";
import { Users } from "lucide-react";
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
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Users className="size-5" aria-hidden="true" />
        みんなのタイムライン
      </h1>
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
