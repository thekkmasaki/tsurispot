"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Flame,
  Calendar,
  Trophy,
  Heart,
  Waves,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: Flame, label: "連続釣行ストリーク", color: "text-orange-500" },
  { icon: Calendar, label: "釣行カレンダー", color: "text-emerald-500" },
  { icon: Trophy, label: "バッジ・称号", color: "text-amber-500" },
  { icon: Heart, label: "お気に入り同期", color: "text-rose-500" },
  { icon: Waves, label: "潮汐アラーム", color: "text-ocean-mid" },
];

export function LoginPromoBanner() {
  const { status } = useSession();
  // CLS対策: "loading" 中も描画する。以前は loading で null → セッション解決後(未ログイン確定)に
  // 約400pxのセクションが途中挿入され、大多数の未ログイン訪問者(とPSI)で毎回レイアウトシフトしていた。
  // SSR/初期HTMLから表示しておけば未ログイン時のシフトはゼロ。ログイン済みのみ解決時に消える(少数派)。
  if (status === "authenticated") return null;

  return (
    <section className="bg-gradient-to-b from-white via-blue-50/40 to-white py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              無料・登録1分
            </div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              会員登録で、もっと釣りを記録しよう
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
              ログインするとこれらの機能が使えるようになります
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white/85 p-3 text-center shadow-xs"
              >
                <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                <span className="text-[11px] font-medium leading-tight sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-2">
            <Link href="/login">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30"
              >
                Googleでログインして始める
              </Button>
            </Link>
            <p className="text-[11px] text-muted-foreground">
              ログインしなくても全機能を利用できます
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
