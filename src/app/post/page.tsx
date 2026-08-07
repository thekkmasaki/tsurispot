import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { SpotPickerComposer } from "@/components/social/spot-picker-composer";

// 釣果投稿ページ: タイムライン等からの投稿導線。スポットを選んで既存フォームで投稿する
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "釣果を投稿する",
  description: "釣り場を選んで釣果を投稿。タイムラインとスポットページに反映されます。",
  robots: { index: false, follow: false },
};

export default function PostPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Send className="size-5 text-sky-700" aria-hidden="true" />
        釣果を投稿する
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        投稿した釣果は
        <Link prefetch={false} href="/timeline" className="mx-1 text-sky-700 hover:underline">
          タイムライン
        </Link>
        とスポットページに表示されます。
      </p>

      <div className="mt-4">
        <SpotPickerComposer />
      </div>
    </main>
  );
}
