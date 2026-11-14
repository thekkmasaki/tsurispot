import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAllBlogPosts } from "@/lib/data/blog";
import { getFishWithLatestCatches } from "@/lib/data/weekly-fish-latest";
import {
  MAIN_WEEKLY_AREA_SLUGS,
  getWeeklyReportArea,
  listWeeklyPostsForArea,
  weeklyAreaHubPath,
} from "@/lib/weekly-report-areas";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";
import { LineChoukaCta } from "@/components/line/line-chouka-cta";

export const revalidate = 3600;
export const dynamic = "force-static";
export const maxDuration = 60;

const PAGE_URL = "https://tsurispot.com/chouka";

export const metadata: Metadata = {
  title: "エリア別の最新釣果情報【毎週更新】全国10エリアの今釣れている魚",
  description:
    "明石・神戸、大阪湾・泉南、東京湾・横浜、福岡・北九州、駿河湾・伊豆、知多・三河、南紀・白浜、瀬戸内・広島、仙台・石巻、小樽・石狩の最新釣果を毎週まとめています。釣れた釣り場・魚種・サイズ・釣り方をエリアごとに確認できます。",
  openGraph: { title: "エリア別の最新釣果情報【毎週更新】", url: PAGE_URL, type: "website", siteName: "ツリスポ" },
  alternates: { canonical: PAGE_URL },
};

function fmtDate(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}/${d}`;
}

export default async function WeeklyAreaIndexPage() {
  const [posts, fishes] = await Promise.all([getAllBlogPosts(), getFishWithLatestCatches()]);
  const areas = MAIN_WEEKLY_AREA_SLUGS.map((slug) => {
    const area = getWeeklyReportArea(slug)!;
    const latest = listWeeklyPostsForArea(posts, slug)[0];
    return { area, latest };
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "エリア別の最新釣果" }]} />
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">エリア別の最新釣果情報</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        全国10エリアの釣果を毎週まとめています。エリアを選ぶと、最新の釣果一覧と過去の週報を確認できます。
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {areas.map(({ area, latest }) => (
          <li key={area.slug}>
            <Link
              prefetch={false}
              href={weeklyAreaHubPath(area.slug)}
              className="flex h-full items-start justify-between gap-3 rounded-xl border p-4 hover:border-sky-300 hover:bg-sky-50/50"
            >
              <span className="min-w-0">
                <span className="block font-bold">{area.label}</span>
                {latest ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {fmtDate(latest.publishedAt)}更新｜{latest.title.split("｜")[1] ?? ""}
                  </span>
                ) : (
                  <span className="mt-1 block text-xs text-muted-foreground">準備中</span>
                )}
              </span>
              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      {fishes.length > 0 && (
        <section aria-labelledby="by-fish" className="mt-10">
          <h2 id="by-fish" className="text-lg font-bold">魚から探す</h2>
          <p className="mt-1 text-xs text-muted-foreground">最新の週報で報告があった魚（報告の多い順）</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {fishes.map((f) => (
              <li key={f.slug}>
                <Link
                  prefetch={false}
                  href={`/chouka/fish/${f.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm hover:border-sky-300 hover:bg-sky-50"
                >
                  {f.name}
                  <span className="text-xs text-muted-foreground">{f.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <LineChoukaCta className="mt-8" />

      <InArticleAd className="my-8" />
    </div>
  );
}
