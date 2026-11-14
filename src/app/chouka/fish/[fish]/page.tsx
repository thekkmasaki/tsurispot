import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { getFishBySlug } from "@/lib/data/fish";
import { getLatestWeeklyCatches, type LatestWeeklyCatch } from "@/lib/data/weekly-report-latest";
import { catchRowHasFish, weeklyAreaHubPath } from "@/lib/weekly-report-areas";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";
import { LineChoukaCta } from "@/components/line/line-chouka-cta";

// 魚から探す「今◯◯が釣れている場所」。主要10エリアの最新週報（14日以内）の釣果表を横断して出す。
// 週報が毎週差し替わるので中身も毎週変わる。今週報告が無い魚は noindex（薄いページを索引させない）。
export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = true;
export const maxDuration = 60;

export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ fish: string }> };

function fmt(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}/${d}`;
}

async function load(slug: string) {
  const fish = getFishBySlug(slug);
  if (!fish) return null;
  const rows = (await getLatestWeeklyCatches()).filter((r) => catchRowHasFish(r.fish, fish));
  rows.sort((a, b) => b.heat - a.heat || (a.publishedAt < b.publishedAt ? 1 : -1));
  return { fish, rows };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fish: slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const { fish, rows } = data;
  const areas = [...new Set(rows.map((r) => r.areaLabel))];
  const title = `${fish.name}が今釣れている場所【最新釣果・毎週更新】`;
  const description = rows.length
    ? `${fish.name}の最新釣果を全国から。直近の週報で${areas.slice(0, 4).join("・")}など${rows.length}か所で${fish.name}の報告がありました。釣れた釣り場・サイズ・釣り方を一覧で確認できます。`
    : `${fish.name}の最新釣果を全国10エリアの週報から毎週まとめています。`;
  const url = `https://tsurispot.com/chouka/fish/${fish.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "ツリスポ" },
    ...(rows.length === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function FishLatestCatchPage({ params }: Props) {
  const { fish: slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { fish, rows } = data;

  const byArea = new Map<string, LatestWeeklyCatch[]>();
  for (const r of rows) byArea.set(r.areaSlug, [...(byArea.get(r.areaSlug) ?? []), r]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "エリア別の最新釣果", href: "/chouka" },
          { label: `${fish.name}が釣れている場所` },
        ]}
      />
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{fish.name}が今釣れている場所</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        全国10エリアの最新の釣果週報（直近2週間以内）から、{fish.name}の報告があった釣り場をまとめています。
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border p-4 text-sm text-muted-foreground">
          最新の週報では、{fish.name}の釣果報告はありませんでした。
          <Link prefetch={false} href={`/fish/${fish.slug}`} className="ml-1 text-sky-700 underline">
            {fish.name}の釣り方・釣れる時期を見る
          </Link>
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {[...byArea].map(([areaSlug, list]) => (
            <section key={areaSlug} className="rounded-2xl border p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold">{list[0].areaLabel}</h2>
                <span className="text-xs text-muted-foreground">{fmt(list[0].publishedAt)}公開の週報より</span>
              </div>
              <ul className="divide-y">
                {list.map((r, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
                    <MapPin className="size-3.5 shrink-0 text-sky-600" />
                    {r.spotHref ? (
                      <Link prefetch={false} href={r.spotHref} className="font-bold text-sky-800 underline">
                        {r.spot}
                      </Link>
                    ) : (
                      <span className="font-bold">{r.spot}</span>
                    )}
                    <span>{r.fish}</span>
                    <span className="text-muted-foreground">{r.size}</span>
                    <span className="text-muted-foreground">{r.method}</span>
                    <span aria-label={`好調度${r.heat}`}>{"🔥".repeat(r.heat) || "—"}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <Link prefetch={false} href={list[0].articleHref} className="inline-flex items-center gap-1 text-sky-700 underline">
                  この週報を読む <ChevronRight className="size-3.5" />
                </Link>
                <Link prefetch={false} href={weeklyAreaHubPath(areaSlug)} className="inline-flex items-center gap-1 text-sky-700 underline">
                  {list[0].areaLabel}の最新釣果 <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </section>
          ))}
        </div>
      )}

      <LineChoukaCta className="mt-8" />

      <InArticleAd className="my-8" />

      <p className="text-xs text-muted-foreground">
        ※釣果は各施設・釣具店などの公開情報を編集部がまとめたもので、釣果を保証するものではありません。好調度は報告の件数・サイズ・匹数による目安です。
      </p>
      <p className="mt-4 text-sm">
        <Link prefetch={false} href={`/fish/${fish.slug}`} className="text-sky-700 underline">
          {fish.name}の釣り方・釣れる時期
        </Link>
        <span className="mx-2 text-muted-foreground">|</span>
        <Link prefetch={false} href="/chouka" className="text-sky-700 underline">
          ほかの魚・エリアの最新釣果
        </Link>
      </p>
    </div>
  );
}

