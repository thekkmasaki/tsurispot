import Link from "next/link";
import { Snowflake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { REGIONAL_WATER_TEMP, type RegionGroup } from "@/lib/data/prefecture-month-enrichment";
import { isMonthInRange } from "@/lib/data/fishing-methods";
import { SPOT_TYPE_LABELS, type FishingSpot } from "@/types";

/**
 * 県×魚ページの「冬の◯◯攻略（12〜2月）」セクション（サーバーコンポーネント）。
 *
 * 11月に入り冬の県×魚クエリが伸び始めるため先回りで追加。テンプレ文の水増しにしないよう、
 * 魚ごとの一般的な冬の釣り方（WINTER_TIPS）は短く固定し、本文の中身は県ごとの実データ
 * （冬に狙えるスポット数・冬の主な釣り方の内訳・冬の水温目安・冬が旬のスポット上位）で差別化する。
 * 冬に狙えるスポットが無い県や、冬の釣り方メモを持たない魚では何も出さない。
 */

interface WinterTip {
  /** 時間帯 */
  time: string;
  /** 仕掛け・釣り方の要点 */
  rig: string;
  /** 冬のポイント選び */
  point: string;
}

const WINTER_TIPS: Record<string, WinterTip> = {
  mebaru: {
    time: "日没後〜夜。常夜灯が点く港・堤防が好機",
    rig: "メバリング（1〜2gジグヘッド＋2インチ前後のワーム）、またはウキ釣り（青イソメ・シラサエビ）",
    point: "冬は産卵期を挟み、常夜灯の明暗の境目や藻場まわりの表層〜中層に浮きやすい。風裏で波の穏やかな港内を選ぶ",
  },
  kasago: {
    time: "日中も釣れるが、夕マヅメ〜夜に活性が上がりやすい",
    rig: "ブラクリ・胴付き仕掛け（サバ切り身・イソメ）、またはジグヘッド＋ワーム",
    point: "テトラ・岩の隙間・岸壁の際を足元から探る穴釣りが基本。水温が下がっても居着くので冬の安定ターゲット",
  },
  karei: {
    time: "日中。潮が動く時間帯に食いが立ちやすい",
    rig: "投げ釣り（ジェット天秤＋カレイ針、青イソメ・岩イソメ）。置き竿を複数出してこまめに誘う",
    point: "産卵を控えて浅場の砂泥底に寄る時期。船道・カケアガリ・河口周りの砂地を狙う",
  },
  yariika: {
    time: "夜。常夜灯の明暗まわり",
    rig: "エギング（2.5〜3号）、または電気ウキ＋エサ巻きテーラ（キビナゴ）",
    point: "冬〜春に産卵で接岸し、水深のある港内に群れが入ると数釣りになる。群れの回遊待ちになりやすい",
  },
  aji: {
    time: "夕マヅメ〜夜。日中は沖に出やすい",
    rig: "サビキ（夜はアミエビ＋電気ウキ）、またはアジング（0.5〜1.5gジグヘッド）",
    point: "水温低下で群れが小さくなりがち。水深があり潮通しの良い港・常夜灯のある堤防が有利",
  },
  kurosoi: {
    time: "夜",
    rig: "ジグヘッド＋ワーム、ブラクリ（イソメ・サンマ切り身）",
    point: "冬の夜釣りの主役。港内の岸壁際・テトラ帯・常夜灯の影を丁寧に探る",
  },
  ainame: {
    time: "日中",
    rig: "ブラクリ・ブッコミ（イソメ）、ワーム",
    point: "秋〜冬の産卵期に浅い岩礁帯・テトラ帯へ寄る。根周りをゆっくり探る",
  },
  mejina: {
    time: "日中",
    rig: "ウキフカセ（オキアミ＋配合エサのまき餌）",
    point: "「寒グレ」の時期で型が良い。サラシと潮目のある磯・堤防先端を狙う",
  },
  sayori: {
    time: "日中",
    rig: "ウキ釣り（細ハリス・小針、アミエビ・オキアミ）",
    point: "冬は港内に大型（カンヌキ）が入ることがある。まき餌で表層に寄せて狙う",
  },
};

const WINTER_MONTHS = [12, 1, 2];

export function WinterFishGuide({
  pref,
  fish,
  spots,
  regionGroup,
}: {
  pref: { name: string; slug: string };
  fish: { slug: string; name: string };
  spots: FishingSpot[];
  regionGroup: string;
}) {
  const tip = WINTER_TIPS[fish.slug];
  if (!tip) return null;

  // この県で冬（12〜2月）にこの魚が狙えるスポット（スポットごとの月データが根拠）
  const winter = spots
    .map((spot) => {
      const cfs = spot.catchableFish.filter(
        (cf) => cf.fish.slug === fish.slug && WINTER_MONTHS.some((m) => isMonthInRange(m, cf.monthStart, cf.monthEnd)),
      );
      if (cfs.length === 0) return null;
      return { spot, cfs, peak: cfs.some((cf) => cf.peakSeason) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (winter.length === 0) return null;

  const methodCount = new Map<string, number>();
  for (const w of winter) for (const m of new Set(w.cfs.map((cf) => cf.method))) methodCount.set(m, (methodCount.get(m) ?? 0) + 1);
  const methods = [...methodCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const peakCount = winter.filter((w) => w.peak).length;
  const top = [...winter]
    .sort((a, b) => Number(b.peak) - Number(a.peak) || b.spot.rating - a.spot.rating || b.spot.reviewCount - a.spot.reviewCount)
    .slice(0, 5);

  const temps = REGIONAL_WATER_TEMP[regionGroup as RegionGroup];
  const tempDec = temps?.[12];
  const tempJan = temps?.[1];

  return (
    <section className="mb-8 sm:mb-10" aria-labelledby="winter-guide">
      <h2 id="winter-guide" className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
        <Snowflake className="size-5 text-sky-600" aria-hidden="true" />
        冬（12〜2月）の{pref.name}の{fish.name}攻略
      </h2>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4 sm:p-5 text-sm leading-relaxed">
          <p>
            {pref.name}で冬に{fish.name}を狙える釣り場は<strong>{winter.length}件</strong>
            {peakCount > 0 && <>（うち{peakCount}件は冬が旬）</>}。
            {methods.length > 0 && (
              <>冬の釣り方は{methods.map(([m, c]) => `${m}（${c}件）`).join("・")}が中心です。</>
            )}
            {tempDec && tempJan && (
              <>水温の目安は12月{tempDec}、1月{tempJan}です。</>
            )}
          </p>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/40 p-3">
              <dt className="text-xs font-bold text-muted-foreground">時間帯</dt>
              <dd className="mt-1">{tip.time}</dd>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <dt className="text-xs font-bold text-muted-foreground">仕掛けの要点</dt>
              <dd className="mt-1">{tip.rig}</dd>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <dt className="text-xs font-bold text-muted-foreground">冬のポイント選び</dt>
              <dd className="mt-1">{tip.point}</dd>
            </div>
          </dl>
          <div>
            <h3 className="mb-2 text-sm font-bold">{pref.name}で冬に{fish.name}を狙えるおすすめ釣り場</h3>
            <ol className="space-y-1.5">
              {top.map(({ spot, cfs, peak }, i) => (
                <li key={spot.slug} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-xs text-muted-foreground tabular-nums">{i + 1}.</span>
                  <Link prefetch={false} href={`/spots/${spot.slug}`} className="font-medium text-primary underline-offset-2 hover:underline">
                    {spot.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {SPOT_TYPE_LABELS[spot.spotType]}・{spot.region.areaName}・{[...new Set(cfs.map((cf) => cf.method))].join("/")}
                    {peak && "・冬が旬"}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-xs text-muted-foreground">
            <Link prefetch={false} href={`/prefecture/${pref.slug}/december`} className="text-primary underline-offset-2 hover:underline">
              {pref.name}の12月の釣り
            </Link>
            {" ／ "}
            <Link prefetch={false} href={`/prefecture/${pref.slug}/january`} className="text-primary underline-offset-2 hover:underline">
              {pref.name}の1月の釣り
            </Link>
            {" "}もあわせて確認できます。
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
