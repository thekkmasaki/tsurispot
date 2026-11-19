import type { Metadata } from "next";
import Link from "next/link";
import { Bot, Fish } from "lucide-react";
import { CatchReportForm } from "@/components/spots/catch-report-form";
import { getSpotBySlug, dedupRedirects } from "@/lib/data/spots";
import { parseDraftQuery } from "@/lib/mcp/catch-draft";

// AI アシスタント（MCP の draft_catch_report）が作った釣果の下書きを確認して投稿するページ。
// 下書きは URL のクエリだけで渡ってくる（サーバーには保存していない）。誰でもクエリを作れるため、
// parseDraftQuery で検証して不正な項目は捨て、投稿 API 側でも従来どおり全項目を検証する。
// 公開されるのは、このページで本人が写真を付けて「投稿する」を押したときだけ。
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "釣果の下書きを確認",
  description: "AI アシスタントが作った釣果の下書きを確認して、写真を付けて投稿します。",
  robots: { index: false, follow: false },
};

export default async function CatchDraftPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const draft = parseDraftQuery(await searchParams);
  const slug = draft ? (dedupRedirects.get(draft.spot) ?? draft.spot) : undefined;
  const spot = slug ? getSpotBySlug(slug) : undefined;

  if (!draft || !spot) {
    return (
      <Shell>
        <p className="mt-4 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          下書きの釣り場が見つかりませんでした。
          <Link prefetch={false} href="/spots" className="mx-1 text-sky-700 hover:underline">
            釣りスポット
          </Link>
          から釣り場を選び、詳細ページの「釣果を報告する」から投稿してください。
        </p>
      </Shell>
    );
  }

  if (spot.fishingBan?.scope === "full") {
    return (
      <Shell>
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {spot.name}は現在釣りが禁止されているため、釣果の投稿を受け付けていません。
        </p>
      </Shell>
    );
  }

  const catchableFishNames = [...new Set(spot.catchableFish.map((cf) => cf.fish.name))];

  return (
    <Shell>
      <p className="mt-1 text-sm text-muted-foreground">
        AI アシスタントが作った下書きです。<strong className="text-foreground">まだ投稿されていません。</strong>
        内容を確かめて、写真を付けて「投稿する」を押すと公開されます。
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        <Fish className="size-4 shrink-0 text-sky-700" aria-hidden="true" />
        <span>
          釣り場：
          <Link prefetch={false} href={`/spots/${spot.slug}`} className="font-medium text-sky-700 hover:underline">
            {spot.name}
          </Link>
          <span className="ml-1 text-muted-foreground">（{spot.region.prefecture}）</span>
        </span>
      </div>

      <CatchReportForm
        spotSlug={spot.slug}
        spotName={spot.name}
        catchableFishNames={catchableFishNames}
        initial={{
          fishName: draft.fishName,
          sizeCm: draft.sizeCm,
          method: draft.method,
          weather: draft.weather,
          date: draft.date,
          comment: draft.comment,
        }}
        defaultOpen
        via="mcp"
      />

      <p className="mt-6 text-xs text-muted-foreground">
        チャットに貼った写真は自動では付きません。写真はこのページで選んでください（位置情報は自動で削除されます）。
        AI アシスタントとの連携については
        <Link prefetch={false} href="/ai" className="mx-1 text-sky-700 hover:underline">
          AIで使う
        </Link>
        をご覧ください。
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Bot className="size-5 text-sky-700" aria-hidden="true" />
        釣果の下書きを確認
      </h1>
      {children}
    </main>
  );
}
