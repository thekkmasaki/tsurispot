/**
 * /mypage 専用 Loading UI（ルート loading.tsx より優先される）。
 * Cognito callback → /mypage 遷移中も skeleton 表示でブランク画面を排除。
 */
export default function MypageLoading() {
  return (
    <div className="mx-auto max-w-2xl pb-8">
      {/* グラデーションヘッダー skeleton */}
      <div className="h-24 animate-pulse bg-gradient-to-r from-white/95 via-white/90 to-sand-light/80" />

      <div className="px-4 pt-4">
        {/* アバター + 編集ボタン skeleton */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-24 w-24 animate-pulse rounded-full border-4 border-white bg-muted shadow-md" />
          <div className="mt-2 h-8 w-28 animate-pulse rounded-full bg-muted" />
        </div>

        {/* ニックネーム + メタ skeleton */}
        <div className="mt-4 space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>

        {/* 統計4カード skeleton */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-xl border bg-card p-3"
            >
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-7 w-10 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* 「今日の好機」カード skeleton */}
        <div className="mt-6 rounded-lg border bg-card p-4">
          <div className="mb-3 h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>

        {/* バッジカード skeleton */}
        <div className="mt-6 rounded-lg border bg-card p-4">
          <div className="mb-3 h-5 w-28 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-lg border p-3"
              >
                <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
