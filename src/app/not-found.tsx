import type { Metadata } from "next";
import Link from "next/link";
import { Home, MapPin, TrendingUp, Fish } from "lucide-react";
import { NotFoundSearch } from "@/components/not-found-search";

export const metadata: Metadata = {
  title: "ページが見つかりません | ツリスポ（つりすぽ）",
  description: "お探しのページが見つかりませんでした。釣りスポット・魚種図鑑・釣り方ガイドから目的の情報を探してみてください。",
  robots: { index: false, follow: true },
};

export default function NotFound() {
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
        {/* 大きな404テキスト（背景的） */}
        <p className="pointer-events-none select-none text-[10rem] font-bold leading-none text-gray-200 sm:text-[14rem]">
          404
        </p>

        {/* 釣りアイコン */}
        <div className="-mt-10 mb-4 text-7xl sm:-mt-14 sm:text-8xl">
          🎣
        </div>

        {/* メインメッセージ */}
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
          お探しのページが見つかりません
        </h1>
        <p className="mb-8 max-w-md text-sm text-gray-600 sm:text-base">
          大物は逃しましたが、まだまだ釣れるスポットはたくさんあります！
        </p>

        <NotFoundSearch />

        {/* 誘導ボタン */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link prefetch={false} href="/">
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
              <Home className="size-4" />
              トップページへ
            </button>
          </Link>

          <Link prefetch={false} href="/spots">
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
              <MapPin className="size-4" />
              釣りスポットを探す
            </button>
          </Link>

          <Link prefetch={false} href="/ranking">
            <button className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50">
              <TrendingUp className="size-4" />
              人気ランキング
            </button>
          </Link>

          <Link prefetch={false} href="/bouzu-checker">
            <button className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50">
              <Fish className="size-4" />
              ボウズ確率チェッカー
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
