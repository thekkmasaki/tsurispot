"use client";
/**
 * 「釣ったことある！」1タップ記録（案①: 魚図鑑の匿名開放）。
 * /fish/[slug] の検索着地ユーザーがログインなしで図鑑を作りはじめる入口。
 * 見た目・アニメーションは既存 fish-like-button.tsx（scale-125/150・blue系）に揃える。
 */
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ThumbsUp, ChevronRight } from "lucide-react";
import { useFishdex } from "@/hooks/use-fishdex";
import { FishdexLoginPrompt } from "./fishdex-login-prompt";

interface FishCaughtButtonProps {
  slug: string;
  name: string;
  /** 全魚種数（サーバー側で fishSpecies.length を渡す） */
  total: number;
}

export function FishCaughtButton({ slug, name, total }: FishCaughtButtonProps) {
  const { count, isCaught, toggle } = useFishdex();
  const [animating, setAnimating] = useState(false);
  const caught = isCaught(slug);

  function handleClick() {
    if (animating) return;
    if (!caught) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
    toggle(slug);
  }

  return (
    <div className="mb-6 rounded-lg border bg-card p-4 sm:mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleClick}
          aria-pressed={caught}
          title={
            caught
              ? "もう一度押すと取り消せます"
              : `${name}を釣ったことがあれば1タップで図鑑に記録`
          }
          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
            caught
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500"
          } ${animating ? "scale-125" : ""}`}
        >
          {caught ? (
            <CheckCircle2
              className={`size-4 fill-blue-100 transition-transform duration-300 ${animating ? "scale-150" : ""}`}
            />
          ) : (
            <ThumbsUp
              className={`size-4 transition-transform duration-300 ${animating ? "scale-150" : ""}`}
            />
          )}
          <span>{caught ? "記録済み ✓" : "釣ったことある！"}</span>
        </button>
        <span className="text-xs text-muted-foreground">
          タップだけ。ログイン不要です。
        </span>
        <Link
          prefetch={false}
          href={`/post?fish=${encodeURIComponent(name)}`}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-ocean-mid/40 px-4 py-2 text-sm font-medium text-ocean-mid transition-colors hover:bg-ocean-mid/10"
        >
          🎣 今日釣った？ 釣果を投稿
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      {count > 0 && (
        <Link
          prefetch={false}
          href="/fishdex"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          あなたの図鑑 {count}
          <span className="text-muted-foreground">/{total}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
      <FishdexLoginPrompt caughtCount={count} className="mt-3" />
    </div>
  );
}
