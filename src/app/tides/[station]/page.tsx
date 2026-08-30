import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Waves } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { todayJST } from "@/lib/activity";
import { TIDE_STATIONS } from "@/lib/tide/stations";
import {
  CODE_BY_SLUG,
  STATION_SLUGS,
  TIDE_REGION_LABELS,
} from "@/lib/tide/station-slugs";
import { getTideDay } from "@/lib/tide/tide-data";
import { getTidePhaseJST } from "@/lib/tide/moon";
import { getSpotsForStation, getStationSpotCount } from "@/lib/tide/station-spots";
import { StationTidesClient } from "./station-tides-client";
import { SPOT_TYPE_LABELS } from "@/types";

/**
 * 観測地点別の潮見表ページ（気象庁 潮位表の天文潮推算値・239地点SSG）。
 * 静的シェルに「今日の満干」を焼き込み（revalidate=1日）、日付切替はクライアントが
 * /api/tide/[code]（force-static・CDN配信）を1回fetchして行う。
 */
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return Object.values(STATION_SLUGS).map((e) => ({ station: e.slug }));
}

function resolveStation(slug: string) {
  const code = CODE_BY_SLUG[slug];
  if (!code) return null;
  const station = TIDE_STATIONS.find((s) => s.code === code);
  if (!station) return null;
  return { code, station, entry: STATION_SLUGS[code] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ station: string }>;
}): Promise<Metadata> {
  const { station: slug } = await params;
  const resolved = resolveStation(slug);
  if (!resolved) return {};
  const { station } = resolved;
  const title = `${station.name}の潮見表・潮汐カレンダー【満潮・干潮の時刻と潮位】`;
  const description = `${station.name}の今日の満潮・干潮の時刻と潮位、潮回り（大潮・中潮・小潮）を14日先まで確認できる潮見表。気象庁 潮位表の推算値に基づく釣り人向け潮汐カレンダーです。`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/tides/${slug}`,
      siteName: "ツリスポ",
    },
    alternates: { canonical: `https://tsurispot.com/tides/${slug}` },
  };
}

export default async function StationTidePage({
  params,
}: {
  params: Promise<{ station: string }>;
}) {
  const { station: slug } = await params;
  const resolved = resolveStation(slug);
  if (!resolved) notFound();
  const { code, station, entry } = resolved;

  // 今日の満干をサーバー側で焼き込み（SEO用の実コンテンツ。revalidate=1日で追従）
  const today = todayJST();
  const todayTide = getTideDay(code, today);
  const todayPhase = getTidePhaseJST(today);

  const nearbySpots = getSpotsForStation(code, 12);
  const spotCount = getStationSpotCount(code);
  const regionLabel = TIDE_REGION_LABELS[entry.region];
  const sameRegionStations = Object.entries(STATION_SLUGS)
    .filter(([c, e]) => e.region === entry.region && c !== code)
    .map(([c, e]) => ({
      code: c,
      slug: e.slug,
      name: TIDE_STATIONS.find((s) => s.code === c)?.name ?? c,
    }));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "潮見表", item: "https://tsurispot.com/tides" },
      { "@type": "ListItem", position: 3, name: `${station.name}の潮見表`, item: `https://tsurispot.com/tides/${slug}` },
    ],
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "潮見表", href: "/tides" },
          { label: station.name },
        ]}
      />

      <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold">
        <Waves className="h-6 w-6 text-sky-600" />
        {station.name}の潮見表
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        気象庁 潮位表（{station.name}地点）の天文潮推算値に基づく、満潮・干潮の時刻と潮位、潮回りのカレンダーです。
        {spotCount > 0 && `この地点を基準にする釣りスポットが周辺に${spotCount}ヶ所あります。`}
      </p>

      {/* 今日の満干（サーバー焼き込み: SEO用実コンテンツ） */}
      {todayTide && (
        <section className="mt-4 rounded-lg border bg-sky-50/60 px-4 py-3 text-sm">
          <h2 className="font-bold">
            今日（{today.slice(5, 7)}月{today.slice(8, 10)}日）の{station.name}: {todayPhase.tideType}
          </h2>
          <p className="mt-1 text-muted-foreground">
            満潮 {todayTide.hi.map(([t, cm]) => `${t}（${cm}cm）`).join(" / ") || "—"} ・ 干潮{" "}
            {todayTide.lo.map(([t, cm]) => `${t}（${cm}cm）`).join(" / ") || "—"}
          </p>
        </section>
      )}

      <div className="mt-5">
        <StationTidesClient code={code} name={station.name} />
      </div>

      {/* この地点が最寄りの釣りスポット（内部リンク網: 潮見表→スポット） */}
      {nearbySpots.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold">
            <MapPin className="h-5 w-5 text-emerald-600" />
            {station.name}の潮で釣れる周辺スポット
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {nearbySpots.map((s) => (
              <Link
                key={s.slug}
                prefetch={false}
                href={`/spots/${s.slug}`}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {s.prefecture}・{SPOT_TYPE_LABELS[s.spotType as keyof typeof SPOT_TYPE_LABELS] ?? s.spotType}
                  </span>
                </span>
                <span className="ml-2 shrink-0 text-xs text-muted-foreground">約{s.distanceKm}km</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 同地方の他の観測地点 */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">{regionLabel}の他の潮見表</h2>
        <div className="flex flex-wrap gap-2">
          {sameRegionStations.map((s) => (
            <Link
              key={s.code}
              prefetch={false}
              href={`/tides/${s.slug}`}
              className="rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {s.name}
            </Link>
          ))}
          <Link
            prefetch={false}
            href="/tides"
            className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
          >
            全国の潮見表一覧 →
          </Link>
        </div>
      </section>

      {/* 潮と釣りの基礎（簡潔版） */}
      <Card className="mt-8">
        <CardContent className="px-4 py-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-bold text-foreground">潮回りと釣りの関係</h2>
          <p>
            大潮は潮の動きが最も大きく魚の活性が上がりやすい潮回りです。満潮・干潮の前後1〜2時間の「潮の変わり目」は
            エサが動きプランクトンが流れるため、多くの魚種で時合いになりやすいタイミングです。
            小潮・長潮は動きが小さいぶん、底物狙いやじっくり攻める釣りに向いています。
            詳しくは<Link href="/guide/tide" className="mx-0.5 underline hover:text-foreground">潮汐と釣りの完全ガイド</Link>をご覧ください。
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        出典: 気象庁 潮位表（{station.name}地点）の天文潮推算値を基に作成。実際の潮位は気圧・風などの気象の影響により
        変わります。本ページの情報は釣り・レジャーの参考用であり、航海・作業の用途には使用できません。
      </p>
    </div>
  );
}
