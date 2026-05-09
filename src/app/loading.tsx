/**
 * App Router のルート Loading UI。
 * ページ遷移時に Next.js が自動で表示する Suspense ベースのローディング。
 * 認証コールバック → /mypage の遷移中など、すべての遷移で白画面を回避する。
 */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ocean-mid border-t-transparent" />
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
