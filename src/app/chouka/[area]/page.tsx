import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Fish } from "lucide-react";
import { getAllBlogPosts, getBlogPostBySlugAsync } from "@/lib/data/blog";
import {
  MAIN_WEEKLY_AREA_SLUGS,
  extractWeeklyDigest,
  getWeeklyReportArea,
  listWeeklyPostsForArea,
} from "@/lib/weekly-report-areas";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";
import { LineChoukaCta } from "@/components/line/line-chouka-cta";
import { safeJsonLd } from "@/lib/safe-json-ld";

// エリアごとに「常に最新週の釣果」を出すページ。週報記事は毎週別URLで増えるため、
// 「{地名} 釣果」の検索はこのページで受け、週報記事へ送る（週報記事側からもここへリンク）。
export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = false;
export const maxDuration = 60;

export function generateStaticParams() {
  return MAIN_WEEKLY_AREA_SLUGS.map((area) => ({ area }));
}

type Props = { params: Promise<{ area: string }> };

const PAST_LIMIT = 12;

function fmtDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/** 週報タイトル「【釣果週報】…｜キャッチコピー」からキャッチコピーを取り出す */
function catchCopy(title: string): string {
  const i = title.indexOf("｜");
  return i >= 0 ? title.slice(i + 1) : title;
}

async function load(areaSlug: string) {
  const area = getWeeklyReportArea(areaSlug);
  if (!area || !MAIN_WEEKLY_AREA_SLUGS.includes(areaSlug)) return null;
  const posts = listWeeklyPostsForArea(await getAllBlogPosts(), areaSlug);
  const latest = posts[0] ? await getBlogPostBySlugAsync(posts[0].slug) : undefined;
  return { area, posts, latest };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area: areaSlug } = await params;
  const data = await load(areaSlug);
  if (!data) return {};
  const { area, posts } = data;
  const title = `${area.label}の釣果情報【毎週更新】今釣れている魚・釣り場`;
  const latestCopy = posts[0] ? catchCopy(posts[0].title) : "";
  const description = latestCopy
    ? `${area.label}エリアの最新釣果（${fmtDate(posts[0].publishedAt)}更新）：${latestCopy}。釣具店・釣り施設の公開情報をもとに、釣れた釣り場・魚種・サイズ・釣り方を毎週まとめています。`
    : `${area.label}エリアの最新釣果を毎週まとめています。釣れた釣り場・魚種・サイズ・釣り方を一覧で確認できます。`;
  const url = `https://tsurispot.com/chouka/${area.slug}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", url, siteName: "ツリスポ" },
    alternates: { canonical: url },
  };
}

export default async function WeeklyAreaHubPage({ params }: Props) {
  const { area: areaSlug } = await params;
  const data = await load(areaSlug);
  if (!data) notFound();
  const { area, posts, latest } = data;
  const digest = latest ? extractWeeklyDigest(latest.content) : { intro: "", picks: "", table: "" };
  const past = posts.slice(1, PAST_LIMIT + 1);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "エリア別の最新釣果", item: "https://tsurispot.com/chouka" },
      { "@type": "ListItem", position: 3, name: `${area.label}の釣果情報`, item: `https://tsurispot.com/chouka/${area.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "エリア別の最新釣果", href: "/chouka" },
          { label: `${area.label}の釣果情報` },
        ]}
      />

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{area.label}の釣果情報</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {area.label}エリア（{area.prefectures.join("・")}）の釣果を毎週まとめています。
          釣具店・釣り施設などの公開情報をもとに、釣れた釣り場・魚種・サイズ・釣り方を確認できます。
        </p>
      </header>

      {posts[0] && latest ? (
        <section aria-labelledby="latest" className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 sm:p-6">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-sky-800">
            <span className="rounded-full bg-sky-600 px-2.5 py-0.5 font-bold text-white">最新</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {fmtDate(posts[0].publishedAt)}更新
            </span>
          </div>
          <h2 id="latest" className="text-lg font-bold sm:text-xl">
            {catchCopy(posts[0].title)}
          </h2>
          {digest.intro && (
            <div
              className="prose prose-sm prose-gray mt-3 max-w-none"
              dangerouslySetInnerHTML={{ __html: digest.intro }}
            />
          )}
          {digest.picks && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <h3 className="text-base font-bold text-amber-900">今週末に狙うなら</h3>
              <div className="prose prose-sm prose-gray mt-2 max-w-none" dangerouslySetInnerHTML={{ __html: digest.picks }} />
            </div>
          )}
          {digest.table && (
            <div className="prose prose-sm prose-gray mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: digest.table }} />
          )}
          <Link
            prefetch={false}
            href={`/blog/${posts[0].slug}`}
            className="mt-4 inline-flex items-center gap-1 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700"
          >
            釣り場ごとの詳しい釣果・出典を読む
            <ChevronRight className="size-4" />
          </Link>
        </section>
      ) : (
        <p className="rounded-xl border p-4 text-sm text-muted-foreground">
          {area.label}エリアの釣果週報はまだありません。
        </p>
      )}

      <LineChoukaCta className="mt-8" />

      <InArticleAd className="my-8" />

      {past.length > 0 && (
        <section aria-labelledby="past" className="mt-8">
          <h2 id="past" className="mb-3 text-lg font-bold">過去の釣果週報</h2>
          <ul className="divide-y rounded-xl border">
            {past.map((p) => (
              <li key={p.slug}>
                <Link prefetch={false} href={`/blog/${p.slug}`} className="flex items-start gap-3 p-3 hover:bg-muted/50">
                  <Fish className="mt-0.5 size-4 shrink-0 text-sky-600" />
                  <span className="min-w-0">
                    <span className="block text-xs text-muted-foreground">{fmtDate(p.publishedAt)}</span>
                    <span className="block text-sm font-medium">{catchCopy(p.title)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs text-muted-foreground">
        ※釣果は各施設・釣具店などの公開情報を編集部がまとめたもので、釣果を保証するものではありません。
        立入禁止・釣り禁止の場所では釣りをしないでください。
      </p>
      <p className="mt-4 text-sm">
        <Link prefetch={false} href="/chouka" className="text-sky-700 underline">
          ほかのエリアの最新釣果を見る
        </Link>
      </p>
    </div>
  );
}
