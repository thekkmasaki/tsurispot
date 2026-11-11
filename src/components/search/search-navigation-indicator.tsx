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
 *
 * アニメーションの定義はこのファイル内の <style> に置く。#534 で globals.css に
 * 置いたところ、デプロイ時に復元される Turbopack のビルドキャッシュ（.next/cache）で
 * 本番CSSに反映されなかったため（JS だけ新しくなった）。
 */
const KEYFRAMES = `
@keyframes tsp-search-nav-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
@keyframes tsp-search-nav-in { from { opacity: 0; } to { opacity: 1; } }
.tsp-search-nav { animation: tsp-search-nav-in 0.2s ease-out 0.15s both; }
.tsp-search-nav-bar { animation: tsp-search-nav-bar 1.1s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .tsp-search-nav { animation: none; }
  .tsp-search-nav-bar { animation: none; left: 0; width: 100%; opacity: 0.6; }
}
`;

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
      className="tsp-search-nav pointer-events-none fixed inset-x-0 top-0 z-[60]"
    >
      <style>{KEYFRAMES}</style>
      {/* 画面上端の流れるバー */}
      <div className="relative h-1 w-full overflow-hidden bg-primary/15">
        <div className="tsp-search-nav-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary" />
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
