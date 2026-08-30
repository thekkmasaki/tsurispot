import type { Metadata } from "next";
import Link from "next/link";
import { Waves } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { TIDE_STATIONS } from "@/lib/tide/stations";
import {
  STATION_SLUGS,
  TIDE_REGION_LABELS,
  TIDE_REGION_ORDER,
} from "@/lib/tide/station-slugs";
import { NearestStationButton } from "./nearest-station-button";

/**
 * 潮見表ハブ（全国239観測地点のディレクトリ）。
 * 従来の全国一律の簡易正弦波モデルは廃止し、地点別ページ（/tides/[station]、
 * 気象庁 潮位表の推算値）へ誘導する。
 */
export const metadata: Metadata = {
  title: "潮見表・潮汐カレンダー（全国239地点）",
  description:
    "全国239の観測地点から選べる釣り人向け潮見表。満潮・干潮の時刻と潮位、大潮・中潮・小潮の潮回りを気象庁 潮位表の推算値で確認できます。",
  alternates: { canonical: "https://tsurispot.com/tides" },
};

const nameByCode = new Map(TIDE_STATIONS.map((s) => [s.code, s.name]));

export default function TidesHubPage() {
  const stationsByRegion = TIDE_REGION_ORDER.map((region) => ({
    region,
    label: TIDE_REGION_LABELS[region],
    stations: Object.entries(STATION_SLUGS)
      .filter(([, e]) => e.region === region)
      .map(([code, e]) => ({ code, slug: e.slug, name: nameByCode.get(code) ?? code })),
  }));

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "潮見表" }]} />

      <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold">
        <Waves className="h-6 w-6 text-sky-600" />
        潮見表・潮汐カレンダー
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        全国239の観測地点ごとに、満潮・干潮の時刻と潮位、潮回り（大潮・中潮・小潮・長潮・若潮）を確認できます。
        データは気象庁 潮位表の天文潮推算値に基づいています。釣行前に釣り場の最寄り地点をチェックしましょう。
      </p>

      <div className="mt-4">
        <NearestStationButton />
      </div>

      {/* 地方別の地点ディレクトリ */}
      <div className="mt-6 space-y-6">
        {stationsByRegion.map(({ region, label, stations }) => (
          <section key={region}>
            <h2 className="mb-2 border-l-4 border-sky-500 pl-2 text-lg font-bold">{label}</h2>
            <div className="flex flex-wrap gap-2">
              {stations.map((s) => (
                <Link
                  key={s.code}
                  prefetch={false}
                  href={`/tides/${s.slug}`}
                  className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 潮と釣りの基礎知識 */}
      <Card className="mt-8">
        <CardContent className="px-4 py-4 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-base font-bold text-foreground">潮回りと釣りの基礎知識</h2>
          <ul className="list-inside list-disc space-y-1">
            <li><b className="text-foreground">大潮</b>: 干満差が最大。潮がよく動き、多くの魚の活性が上がりやすい</li>
            <li><b className="text-foreground">中潮</b>: 適度な流れで安定した釣果が期待できる万能の潮</li>
            <li><b className="text-foreground">小潮</b>: 動きが小さい。底物狙いやじっくり攻める釣り向き</li>
            <li><b className="text-foreground">長潮・若潮</b>: 干満差が最小の時期から再び大きくなり始める転換点</li>
            <li>満潮・干潮の前後1〜2時間の<b className="text-foreground">潮の変わり目</b>が多くの魚種で時合いになりやすい</li>
          </ul>
          <p className="mt-2">
            さらに詳しくは
            <Link href="/guide/tide" className="mx-0.5 underline hover:text-foreground">潮汐と釣りの完全ガイド</Link>
            へ。場所ごとに潮の時刻は大きく異なるため、必ず釣り場の最寄り観測地点のデータを参照してください。
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        出典: 気象庁 潮位表の天文潮推算値を基に作成。実際の潮位は気圧・風などの気象の影響により変わります。
        本ページの情報は釣り・レジャーの参考用であり、航海・作業の用途には使用できません。
      </p>
    </div>
  );
}
