"use client";
/**
 * 匿名図鑑のログイン訴求（案①）。
 * - 3種到達: 控えめな1行バナー（記録は端末保存、の事実だけ）
 * - 20種到達: 「失わないため」のカード（保有効果）。しきい値はA/B前提の初期値
 * どちらも「あとで」で消せて、記録は消えない。ダークパターン化しないことが最優先。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { BookOpen, X } from "lucide-react";

const DISMISS_3_KEY = "tsurispot-fishdex-prompt3";
const DISMISS_20_KEY = "tsurispot-fishdex-prompt20";
const THRESHOLD_STRONG = 20;
const THRESHOLD_SOFT = 3;

function isDismissed(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return true;
  }
}

function dismiss(key: string) {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // noop
  }
}

export function FishdexLoginPrompt({
  caughtCount,
  className,
}: {
  caughtCount: number;
  className?: string;
}) {
  const { status } = useSession();
  // SSR/ハイドレーション安全のため、マウント後にだけ表示判定する
  const [mounted, setMounted] = useState(false);
  const [hidden3, setHidden3] = useState(true);
  const [hidden20, setHidden20] = useState(true);

  useEffect(() => {
    setMounted(true);
    setHidden3(isDismissed(DISMISS_3_KEY));
    setHidden20(isDismissed(DISMISS_20_KEY));
  }, []);

  if (!mounted || status === "authenticated" || status === "loading") {
    return null;
  }

  if (caughtCount >= THRESHOLD_STRONG && !hidden20) {
    return (
      <div
        className={`rounded-xl border border-primary/30 bg-primary/5 p-4 ${className ?? ""}`}
      >
        <p className="flex items-center gap-2 text-sm font-bold">
          <BookOpen className="h-4 w-4 text-primary" />
          {caughtCount}種、記録しました。この図鑑、なくさないようにしませんか？
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          いまの記録は<b>この端末のブラウザにだけ</b>
          保存されています。ブラウザのデータを消すと失われます。
          無料のアカウントを作ると、機種を変えても続きから使えます。
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            prefetch={false}
            href="/login"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            無料で記録を残す
          </Link>
          <button
            onClick={() => {
              dismiss(DISMISS_20_KEY);
              setHidden20(true);
            }}
            className="min-h-[44px] px-2 text-xs text-muted-foreground underline underline-offset-2"
          >
            あとで（記録はこのまま残ります）
          </button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          メールアドレスは公開されません。釣果の投稿は任意です。
        </p>
      </div>
    );
  }

  if (
    caughtCount >= THRESHOLD_SOFT &&
    caughtCount < THRESHOLD_STRONG &&
    !hidden3
  ) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground ${className ?? ""}`}
      >
        <span className="flex-1">
          いいペース。記録はこの端末に保存されています。
        </span>
        <button
          onClick={() => {
            dismiss(DISMISS_3_KEY);
            setHidden3(true);
          }}
          aria-label="閉じる"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return null;
}
