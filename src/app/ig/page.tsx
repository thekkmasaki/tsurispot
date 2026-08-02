import type { Metadata } from "next";
import Link from "next/link";
import { SPOT_COUNT_FORMATTED } from "@/lib/data/spot-count";

// SNSのbioから飛ぶリンク集（Linktree代替）。PVを自サイトに落とす。
// ※ページ内リンクにUTMは付けない（内部遷移でセッション属性を壊さないため）。
//   UTMはbioに置く /ig のURL側に付与する（docs/sns/profile-setup.md 参照）。
export const metadata: Metadata = {
  title: "ツリスポ リンク集 | 全国の釣り場・釣果・旬の魚",
  description:
    "全国の釣り場、みんなの釣果、今釣れる魚、釣りクイズをまとめてチェック。ツリスポ公式SNSのリンク集。",
  robots: { index: false, follow: true },
  alternates: { canonical: "/ig" },
};

const LINKS: { href: string; emoji: string; label: string; desc: string }[] = [
  { href: "/fishing-spots/near-me", emoji: "🗺️", label: "近くの釣り場を探す", desc: "現在地から釣り場を検索" },
  { href: "/catchable-now", emoji: "🐟", label: "今釣れる魚", desc: "今月の旬の魚をチェック" },
  { href: "/catch-reports", emoji: "📣", label: "みんなの釣果", desc: "最新のユーザー釣果報告" },
  { href: "/ranking/reporters", emoji: "🏆", label: "釣果ランキング", desc: "釣果投稿者ランキング" },
  { href: "/quiz", emoji: "🎣", label: "釣りクイズ", desc: "釣りの知識を腕試し" },
  { href: "/fishing-calendar", emoji: "📅", label: "釣りカレンダー", desc: "潮・時期の釣りガイド" },
  { href: "/prefecture", emoji: "📍", label: "都道府県から探す", desc: "全国47都道府県の釣り場" },
  { href: "/map", emoji: "🗾", label: "釣り場マップ", desc: "地図で釣り場を探す" },
];

export default function IgLinkPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10">
      <div className="text-center">
        <p className="text-3xl font-bold tracking-tight">🎣 ツリスポ</p>
        <p className="mt-2 text-sm text-muted-foreground">
          全国{SPOT_COUNT_FORMATTED}ヶ所の釣り場・釣果・旬の魚
        </p>
      </div>

      <nav className="mt-8 w-full space-y-3" aria-label="ツリスポ主要ページ">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted"
          >
            <span className="text-2xl" aria-hidden="true">
              {l.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-foreground">{l.label}</span>
              <span className="block text-xs text-muted-foreground">{l.desc}</span>
            </span>
            <span aria-hidden="true" className="text-lg text-muted-foreground">
              ›
            </span>
          </Link>
        ))}
      </nav>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link href="/" className="font-medium hover:underline">
          tsurispot.com
        </Link>{" "}
        — 日本の釣り場情報サイト
      </p>
    </main>
  );
}
