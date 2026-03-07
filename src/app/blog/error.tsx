"use client";

import Link from "next/link";
import { RefreshCw, Home, ArrowLeft } from "lucide-react";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #e0f2fe 0%, #bae6fd 30%, #e0f7fa 60%, #f0fdf4 100%)",
      }}
    >
      {/* 波模様の背景装飾 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 40% at 50% 110%, rgba(56,189,248,0.18) 0%, transparent 70%),
            repeating-linear-gradient(
              -10deg,
              transparent,
              transparent 38px,
              rgba(147,210,240,0.13) 38px,
              rgba(147,210,240,0.13) 40px
            )
          `,
        }}
      />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        {/* 大きなエラーテキスト（背景的） */}
        <p className="pointer-events-none select-none text-[8rem] font-bold leading-none text-gray-200 sm:text-[12rem]">
          Error
        </p>

        {/* 釣りアイコン */}
        <div className="-mt-8 mb-4 text-7xl sm:-mt-12 sm:text-8xl">
          🎣
        </div>

        {/* メインメッセージ */}
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
          ブログ記事の読み込みに失敗しました
        </h1>
        <p className="mb-8 max-w-md text-sm text-gray-600 sm:text-base">
          記事データの取得中にエラーが発生しました。通信状況を確認のうえ、もう一度お試しください。
        </p>

        {/* ボタン */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <RefreshCw className="size-4" />
            もう一度試す
          </button>

          <Link href="/blog">
            <button className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50">
              <ArrowLeft className="size-4" />
              ブログ一覧に戻る
            </button>
          </Link>

          <Link href="/">
            <button className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50">
              <Home className="size-4" />
              トップページへ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
