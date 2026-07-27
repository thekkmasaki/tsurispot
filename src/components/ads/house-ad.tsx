"use client";

import Link from "next/link";
import { MapPin, Fish, Trophy, CalendarDays, Camera } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * 自前ハウス広告（サイト内誘導）。
 *
 * AdSense が広告ブロッカーや no-fill で描画しなかった空き枠に差し込み、
 * 失われた面をサイト内回遊に転換する。アフィリエイトは使わず、トップレベルの
 * 主要導線のみ（クライアントに spot データをバンドルしないため static 定義）。
 *
 * これは「スポンサー」ではなく自社コンテンツなので、呼び出し側は fallback 時に
 * 「スポンサー」ラベルを抑制すること（誤ラベル防止）。
 */

interface HousePromo {
  href: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

// 主要導線（存在するルートのみ）。順序は表示優先度。
const PROMOS: HousePromo[] = [
  { href: "/spots", title: "釣り場を探す", desc: "全国の釣りスポットを地域・魚種で検索", icon: MapPin },
  { href: "/ranking", title: "人気ランキング", desc: "いま注目の釣り場をチェック", icon: Trophy },
  { href: "/fish", title: "魚種図鑑", desc: "狙える魚の釣り方・旬を調べる", icon: Fish },
  { href: "/monthly", title: "今月の釣りガイド", desc: "季節ごとの釣れる魚と釣り方", icon: CalendarDays },
  { href: "/login", title: "釣果を記録・共有", desc: "無料登録でお気に入り保存や釣果報告", icon: Camera },
];

/** placement 文字列から決定的にオフセットを作り、枠ごとに違うカードを見せる */
function offsetFor(placement?: string): number {
  if (!placement) return 0;
  let h = 0;
  for (let i = 0; i < placement.length; i++) h = (h * 31 + placement.charCodeAt(i)) >>> 0;
  return h % PROMOS.length;
}

export function HouseAd({
  placement,
  count = 2,
  className = "",
}: {
  placement?: string;
  /** 表示するカード枚数 */
  count?: number;
  className?: string;
}) {
  const start = offsetFor(placement);
  const items = Array.from({ length: Math.min(count, PROMOS.length) }, (_, i) => PROMOS[(start + i) % PROMOS.length]);

  return (
    <div
      className={`flex h-full min-h-[250px] w-full flex-col justify-center p-1 ${className}`}
      aria-label="TsuriSpot のおすすめ"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-bold text-primary">TsuriSpot</span>
        <span className="text-[11px] text-muted-foreground">のおすすめ</span>
      </div>
      <div className="grid gap-2">
        {items.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              prefetch={false}
              key={p.href}
              href={p.href}
              className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-3 transition-colors hover:border-primary/40 hover:bg-card"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold group-hover:text-primary">{p.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{p.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
