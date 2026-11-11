import { Sakanacchi } from "@/components/fun/sakanacchi";

/**
 * App Router のルート Loading UI。
 * ページ遷移時に Next.js が自動で表示する Suspense ベースのローディング。
 * 認証コールバック → /mypage の遷移中など、すべての遷移で白画面を回避する。
 * 2026-11: スピナーをマスコット「さかなっち」が泳ぐ表示に変更（UI/UX刷新Phase1）。
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-2 text-center" role="status">
        <Sakanacchi size={72} />
        <p className="text-sm font-bold text-primary">釣れるかな…釣れるかな…</p>
        <p className="sr-only">読み込み中</p>
      </div>
    </div>
  );
}
