import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { ALL_TIERS } from "@/lib/titles";

export const metadata: Metadata = {
  title: "称号・バッジ一覧 | ツリスポ",
  description: "釣果を投稿してランクアップ！投稿数に応じて称号が変わり、ヘッダーの色も変化します。全10段階の称号を目指そう。",
};

export default function TitlesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        トップに戻る
      </Link>

      <div className="mb-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-3 text-2xl font-bold">称号・バッジ一覧</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          釣果を投稿すると称号が上がります。ランクが上がるとヘッダーの色も変化！
        </p>
      </div>

      <div className="space-y-3">
        {ALL_TIERS.map((tier, i) => (
          <div
            key={tier.min}
            className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center text-2xl">
              {tier.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs leading-none ${tier.className}`}>
                  {tier.emoji} {tier.label}
                </span>
                {i === 0 && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                    最高ランク
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {tier.min === 0
                  ? "ログインするだけで獲得"
                  : `釣果を${tier.min}件以上投稿`}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-lg font-bold text-foreground">
                {tier.min}
              </span>
              <span className="text-xs text-muted-foreground">件〜</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border bg-muted/30 p-5">
        <h2 className="mb-3 font-bold">称号の仕組み</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>・ 釣果を投稿するたびに投稿数がカウントされます</li>
          <li>・ 投稿数に応じて称号が自動的にランクアップします</li>
          <li>・ 称号は釣果レポートのユーザー名横に表示されます</li>
          <li>・ ランクが上がるとヘッダーの背景色が変化します</li>
          <li>・ 投稿を削除するとカウントが減り、ランクダウンすることがあります</li>
          <li>・ マイページで現在の称号と次のランクまでの進捗を確認できます</li>
        </ul>
      </div>
    </div>
  );
}
