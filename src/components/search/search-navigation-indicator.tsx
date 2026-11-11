"use client";

import { createPortal } from "react-dom";
import { LoaderCircle } from "lucide-react";

/**
 * 検索結果を選んだ／「検索」を押した後、次のページが表示されるまでの表示。
 *
 * 検索窓は選んだ瞬間に閉じるため、遷移先（魚種ページ・スポット一覧など）の
 * 取得に1〜数秒かかると「押したのに何も起きない」状態になっていた。
 * 呼び出し側は router.push を useTransition の startTransition で包み、
 * その isPending を active に渡す（遷移が終わるまで true のまま）。
 *
 * すぐ終わる遷移でちらつかないよう、表示は 150ms 遅れてフェードインする。
 *
 * ヘッダーは backdrop-blur を持ち、その子孫の position: fixed は画面ではなく
 * ヘッダーを基準にしてしまうため、body 直下へポータルで出す。
 * active は操作の後にしか true にならないので、SSR 時に document へ触れることはない。
 */
export function SearchNavigationIndicator({
  active,
  label = "ページを開いています",
}: {
  active: boolean;
  label?: string;
}) {
  if (!active || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="animate-search-nav-in pointer-events-none fixed inset-x-0 top-0 z-[60]"
    >
      {/* 画面上端の流れるバー */}
      <div className="relative h-1 w-full overflow-hidden bg-primary/15">
        <div className="animate-search-nav-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary" />
      </div>
      {/* 何を待っているかの表示 */}
      <div className="mt-3 flex justify-center px-4">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-border bg-white/95 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
          <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
