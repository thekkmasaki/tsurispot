import type { Metadata } from "next";
import Link from "next/link";
import {
  Satellite,
  ScanSearch,
  Fish,
  Map as MapIcon,
  CalendarDays,
  Waves,
  Thermometer,
  MapPin,
  MessageSquarePlus,
  ChevronRight,
  Building2,
} from "lucide-react";
import { PatentBadge } from "@/components/patent/patent-badge";
import {
  getAnalyzedSpotSlugs,
  getAnalysisResult,
} from "@/lib/patent/load-analysis";
import { isAnalysisLocationConsistent } from "@/lib/patent/normalize-analysis";
import { getSpotBySlug } from "@/lib/data/spots";

export const metadata: Metadata = {
  title: "特許出願中のAI釣り場解析技術｜ツリスポ",
  description:
    "ツリスポは航空写真・衛星画像のAI解析で釣り場の構造物（堤防・テトラ・桟橋等）を自動検出し、対象魚種と釣りポイントマップを自動生成する技術を開発しています（特許出願中・特願2026-042836）。季節・地域・潮汐・水温と実釣果フィードバックで推定を継続的に改善します。",
  openGraph: {
    title: "特許出願中のAI釣り場解析技術｜ツリスポ",
    description:
      "航空写真をAIで解析し、釣り場の構造物検出から魚種推定・ポイントマップ生成までを自動化する特許出願中の技術を紹介します。",
    type: "website",
    url: "https://tsurispot.com/technology",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/technology",
  },
};

const PIPELINE_STEPS = [
  {
    icon: Satellite,
    step: "STEP 1",
    title: "画像取得",
    description:
      "解析対象の沿岸部について、国土地理院の航空写真や衛星画像など高解像度の画像データを取得します。",
    color: "bg-sky-100 text-sky-700",
  },
  {
    icon: ScanSearch,
    step: "STEP 2",
    title: "構造物のAI検出・分類",
    description:
      "機械学習（セグメンテーション＋画像分類）により、堤防・消波ブロック（テトラ）・岩礁・砂浜・桟橋・港湾施設などの構造物を自動検出し、種別に分類します。",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    icon: Fish,
    step: "STEP 3",
    title: "魚種推定",
    description:
      "構造物の種別と魚の生態（テトラ帯に根魚が付く等）の対応関係に、季節・地域・潮汐・水温の環境パラメータを掛け合わせ、その場所で狙いやすい魚種を推定します。",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: MapIcon,
    step: "STEP 4",
    title: "釣りポイントマップ自動生成",
    description:
      "検出した構造物・推定魚種・施設情報をもとに、ゾーン区分・番号付きポイント・凡例を備えたインタラクティブな釣りマップを自動生成します。",
    color: "bg-amber-100 text-amber-700",
  },
];

const ENV_PARAMS = [
  {
    icon: CalendarDays,
    title: "季節",
    description: "魚種ごとの釣期と現在の月を照合し、シーズン外の魚は優先度を下げます。",
  },
  {
    icon: MapPin,
    title: "地域",
    description: "そのスポットで実際に釣れるとされる魚のデータと照合し、海域に合った推定にします。",
  },
  {
    icon: Waves,
    title: "潮汐",
    description: "月齢から潮回り（大潮〜長潮）を算出し、回遊魚の活性予測に反映します。",
  },
  {
    icon: Thermometer,
    title: "水温",
    description: "海水温の季節遅行（最も冷えるのは2〜3月）を月別係数でモデル化し活性を補正します。",
  },
];

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "AI釣り場解析技術",
      item: "https://tsurispot.com/technology",
    },
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "特許出願中のAI釣り場解析技術｜ツリスポ",
  url: "https://tsurispot.com/technology",
  description:
    "航空写真・衛星画像のAI解析による釣り場ポイント情報自動生成技術（特許出願中・特願2026-042836）の解説。",
  isPartOf: {
    "@type": "WebSite",
    name: "ツリスポ",
    url: "https://tsurispot.com",
  },
};

export default function TechnologyPage() {
  // 実際にAI解析済みで、座標整合が確認できたスポットのみ実例として掲載
  const analyzedSpots = getAnalyzedSpotSlugs()
    .map((slug) => {
      const spot = getSpotBySlug(slug);
      const analysis = getAnalysisResult(slug);
      if (!spot || !analysis) return null;
      if (!isAnalysisLocationConsistent(analysis, spot.latitude, spot.longitude)) {
        return null;
      }
      return {
        slug,
        name: spot.name,
        prefecture: spot.region.prefecture,
        structureLength: analysis.structureLength,
        zoneCount: analysis.zones.length,
        seaLabel: analysis.seaLabel,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ヒーロー */}
      <section className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <PatentBadge />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          AIが航空写真から
          <br className="sm:hidden" />
          釣り場を解析する
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          ツリスポは、航空写真・衛星画像をAIで解析して釣り場の構造物を自動検出し、
          狙える魚種と釣りポイントマップを自動生成する技術を開発しています。
          この技術は「衛星画像解析による釣り場ポイント情報自動生成システムおよび方法」として
          特許出願中です（特願2026-042836・2026年3月出願）。
        </p>
      </section>

      {/* 課題 */}
      <section className="mb-12 rounded-2xl bg-slate-50 p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-bold">なぜこの技術が必要か</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          「どの釣り場の、どの位置で、何が釣れるか」という情報は、これまで釣り経験者の知識や
          現地調査に頼って人手で作られてきました。その方法では全国数千の釣り場を網羅するのに
          膨大な時間がかかり、品質も作成者の経験に左右されます。
          ツリスポのAI解析は、画像から構造物を客観的な基準で検出・分類することで、
          一定品質のポイント情報を大量の釣り場へスケールさせることを目指しています。
        </p>
      </section>

      {/* システム構成 */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-bold">解析パイプライン（特許の4つの構成）</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PIPELINE_STEPS.map((s) => (
            <div key={s.step} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <span className={`flex size-10 items-center justify-center rounded-lg ${s.color}`}>
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground">{s.step}</div>
                  <h3 className="text-base font-semibold">{s.title}</h3>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 環境パラメータ */}
      <section className="mb-12">
        <h2 className="mb-2 text-xl font-bold">環境パラメータで「今」に合わせる</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          構造物だけでなく、刻々と変わる環境条件を推定に組み込みます。
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ENV_PARAMS.map((p) => (
            <div key={p.title} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <p.icon className="size-4 text-indigo-600" aria-hidden="true" />
                <h3 className="text-sm font-semibold">{p.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-600">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 自己強化 */}
      <section className="mb-12 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquarePlus className="size-5 text-emerald-700" aria-hidden="true" />
          <h2 className="text-xl font-bold">実釣果で賢くなる（自己強化）</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          ユーザーの皆さまから投稿された釣果報告は、スポット×魚種ごとに集計され、
          AIの推定スコアに反映されます。報告が集まるほど「実釣果に裏付けられた推定」へと
          近づいていく、自己強化型の仕組みです。釣果報告は各スポットページから投稿できます。
        </p>
      </section>

      {/* 解析済みスポット実例 */}
      {analyzedSpots.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-2 text-xl font-bold">AI解析済みスポットの実例</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            以下のスポットでは、航空写真の実解析にもとづく「AI解析 釣りマップ」を公開しています。
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {analyzedSpots.map((s) => (
              <Link
                key={s.slug}
                href={`/spots/${s.slug}`}
                className="group flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                <div>
                  <div className="font-semibold group-hover:text-indigo-700">{s.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {s.prefecture}・{s.seaLabel}｜構造物長 約{s.structureLength}m・{s.zoneCount}ゾーン
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-indigo-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* B2B CTA */}
      <section className="mb-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white sm:p-8">
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="size-5" aria-hidden="true" />
          <h2 className="text-xl font-bold">事業者・メディアの方へ</h2>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-indigo-100">
          釣具店・釣り船・観光事業者さまとの連携や、本技術・データに関するお問い合わせを受け付けています。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/partner"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
          >
            掲載・提携について
          </Link>
          <Link
            href="/contact"
            className="rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            お問い合わせ
          </Link>
        </div>
      </section>

      {/* 出願情報・免責 */}
      <section className="rounded-xl border bg-muted/20 p-5 text-xs leading-relaxed text-muted-foreground">
        <p className="mb-2 font-semibold text-foreground">特許出願情報</p>
        <p className="mb-3">
          発明の名称: 衛星画像解析による釣り場ポイント情報自動生成システムおよび方法｜
          出願番号: 特願2026-042836（2026年3月17日出願）｜出願人: ツリスポ運営者
        </p>
        <p>
          ※ 本ページで紹介する解析結果・推定魚種・ポイント評価はAIによる推定（参考情報）であり、
          実際の地形・釣果を保証するものではありません。釣行の際は現地の規則・安全情報を必ずご確認ください。
          ※「特許出願中」は出願した事実を示すものであり、特許権の成立を意味するものではありません。
        </p>
      </section>
    </div>
  );
}
