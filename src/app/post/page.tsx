import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { TweetComposer } from "@/components/social/tweet-composer";
import { auth } from "@/lib/auth";

// 投稿ページ: Twitter型のつぶやきコンポーザー（本文のみ必須・場所/写真/釣果は任意添付）。
// スポット詳細ページの釣果フォーム(CatchReportForm)は従来どおり別導線で残る
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "投稿する",
  description: "釣行の様子や釣果をつぶやき投稿。タイムラインに表示されます。",
  robots: { index: false, follow: false },
};

export default async function PostPage({
  searchParams,
}: {
  searchParams: Promise<{ fish?: string }>;
}) {
  const [{ fish }, session] = await Promise.all([searchParams, auth()]);
  const initialFishName =
    typeof fish === "string" && fish.trim() ? fish.trim().slice(0, 30) : undefined;
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Send className="size-5 text-sky-700" aria-hidden="true" />
        投稿する
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        投稿は
        <Link prefetch={false} href="/timeline" className="mx-1 text-sky-700 hover:underline">
          タイムライン
        </Link>
        に表示されます。
      </p>

      <div className="mt-4">
        <TweetComposer initialFishName={initialFishName} />
      </div>

      {/* つぶやき投稿はログイン必須のため、匿名にはログイン不要の釣果報告への分岐を示す */}
      {!session?.user && (
        <div className="mt-4 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          ログインせずに投稿したい場合は、
          <Link prefetch={false} href="/spots" className="mx-1 text-sky-700 hover:underline">
            釣りスポット
          </Link>
          の詳細ページにある「釣果を報告する」（ログイン不要）が使えます。
        </div>
      )}
    </main>
  );
}
