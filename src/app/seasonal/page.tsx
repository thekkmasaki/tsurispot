import type { Metadata } from "next";
import Link from "next/link";
import {
  Cherry,
  Sun,
  Leaf,
  Snowflake,
  Fish,
  AlertTriangle,
  Anchor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "季節別釣りガイド - 春夏秋冬のおすすめ釣り",
  description:
    "春夏秋冬の釣りを完全ガイド。季節ごとに釣れる魚20種以上・おすすめ釣法・注意点を初心者向けに解説。今の時期にベストな釣り方と狙い目ターゲットがすぐわかる。",
  openGraph: {
    title: "季節別釣りガイド - 春夏秋冬のおすすめ釣り",
    description:
      "春夏秋冬それぞれの季節で釣れる魚やおすすめの釣法を初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/seasonal",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/seasonal",
  },
};

interface SeasonFish {
  name: string;
  slug: string;
  description: string;
  peak?: boolean;
}

interface SeasonMethod {
  name: string;
  description: string;
}

interface SeasonData {
  id: string;
  name: string;
  months: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  description: string;
  fish: SeasonFish[];
  methods: SeasonMethod[];
  tips: string[];
}

const seasons: SeasonData[] = [
  {
    id: "spring",
    name: "春",
    months: "3月〜5月",
    icon: <Cherry className="size-6" />,
    colorClass: "text-pink-600",
    bgClass: "bg-pink-50 dark:bg-pink-950",
    borderClass: "border-pink-200 dark:border-pink-900",
    description:
      "水温が上がり始め、魚の活性が回復する季節。産卵を控えた魚が岸に近づき、陸っぱりからの釣りが楽しくなります。",
    fish: [
      { name: "メバル", slug: "mebaru", description: "春告魚と呼ばれる春の代表魚。メバリングが人気。", peak: true },
      { name: "アオリイカ", slug: "aoriika", description: "産卵のために浅場に接岸。大型が狙えるシーズン。", peak: true },
      { name: "クロダイ", slug: "kurodai", description: "のっこみシーズンで大型が浅場に来る。フカセ釣りがおすすめ。" },
      { name: "カサゴ", slug: "kasago", description: "テトラの穴釣りで引き続きよく釣れる。" },
      { name: "カレイ", slug: "karei", description: "花見カレイと呼ばれる春の投げ釣りシーズン。" },
    ],
    methods: [
      { name: "メバリング", description: "ジグヘッド＋ワームでメバルを狙う。夜釣りが有利。" },
      { name: "エギング", description: "春イカシーズン。2kg超の大型アオリイカが狙える。" },
      { name: "フカセ釣り", description: "クロダイのっこみ狙い。堤防からでもOK。" },
      { name: "投げ釣り", description: "花見カレイやシロギス狙い。砂浜から遠投。" },
    ],
    tips: [
      "朝晩はまだ冷えるので防寒着を1枚多めに",
      "春は風が強い日が多く、軽量仕掛けは扱いづらいことも",
      "花粉対策にマスクやメガネを忘れずに",
      "潮が大きく動く大潮前後が狙い目",
    ],
  },
  {
    id: "summer",
    name: "夏",
    months: "6月〜8月",
    icon: <Sun className="size-6" />,
    colorClass: "text-orange-600",
    bgClass: "bg-orange-50 dark:bg-orange-950",
    borderClass: "border-orange-200 dark:border-orange-900",
    description:
      "最も魚種が豊富なハイシーズン。サビキ釣りでファミリーフィッシングを楽しめる季節。朝マヅメ・夕マヅメの時間帯が特に狙い目です。",
    fish: [
      { name: "アジ", slug: "aji", description: "サビキ釣りで数釣り可能。初心者に最もおすすめ。", peak: true },
      { name: "サバ", slug: "saba", description: "アジと一緒にサビキで釣れる。引きが強く楽しい。", peak: true },
      { name: "イワシ", slug: "iwashi", description: "大群で回遊。入れ食いになることも。" },
      { name: "キス", slug: "kisu", description: "砂浜からのちょい投げで手軽に狙える夏の定番。", peak: true },
      { name: "タチウオ", slug: "tachiuo", description: "夏の夜釣りのターゲット。電気ウキで狙える。" },
      { name: "シーバス", slug: "seabass", description: "バチ抜けパターンなどでルアーで狙える。" },
    ],
    methods: [
      { name: "サビキ釣り", description: "夏のファミリーフィッシングの定番。アジ・サバ・イワシが狙える。" },
      { name: "ちょい投げ", description: "砂浜や堤防からキスやハゼを手軽に狙える。" },
      { name: "ショアジギング", description: "青物が回遊し始める季節。メタルジグで狙う。" },
      { name: "夜釣り", description: "タチウオやアナゴを電気ウキやルアーで狙う。涼しくて快適。" },
    ],
    tips: [
      "熱中症対策：帽子・日焼け止め・水分は必須",
      "虫除けスプレーを忘れずに（特に夕方以降）",
      "クーラーボックスに氷をたっぷり（鮮度維持が重要）",
      "朝マヅメ（4時〜6時）が最も涼しく釣れやすい",
      "ゲリラ豪雨に注意。天気予報をこまめにチェック",
    ],
  },
  {
    id: "autumn",
    name: "秋",
    months: "9月〜11月",
    icon: <Leaf className="size-6" />,
    colorClass: "text-amber-600",
    bgClass: "bg-amber-50 dark:bg-amber-950",
    borderClass: "border-amber-200 dark:border-amber-900",
    description:
      "食欲の秋は魚も同じ。冬に備えて荒食いする魚が多く、大型が狙えるベストシーズン。青物の回遊も本格化します。",
    fish: [
      { name: "アジ", slug: "aji", description: "脂が乗った秋アジはサビキやアジングで。" },
      { name: "アオリイカ", slug: "aoriika", description: "新子が成長し、数釣りが楽しめるシーズン。", peak: true },
      { name: "タチウオ", slug: "tachiuo", description: "秋の堤防タチウオが最盛期。ルアーでも餌でも。", peak: true },
      { name: "イナダ", slug: "inada", description: "青物が接岸。ショアジギングで大興奮の釣り。", peak: true },
      { name: "カマス", slug: "kamasu", description: "秋の堤防で回遊。ルアーや餌釣りで手軽に狙える。", peak: true },
      { name: "ハゼ", slug: "haze", description: "秋は大型ハゼのシーズン。天ぷらが絶品。", peak: true },
    ],
    methods: [
      { name: "ショアジギング", description: "青物の回遊が本格化。イナダ・ワカシが狙える。" },
      { name: "エギング", description: "秋の新子イカシーズン。数釣りが楽しい。" },
      { name: "ルアー釣り", description: "タチウオやシーバスの秋パターン。" },
      { name: "ハゼ釣り", description: "ちょい投げやミャク釣りで大型ハゼを狙える。" },
    ],
    tips: [
      "秋は釣果が最も安定するベストシーズン",
      "朝夕の冷え込みに備えて上着を持参",
      "台風シーズンなので天候に注意。台風後は荒食いのチャンスも",
      "日没が早くなるので、ヘッドライトを持参しよう",
    ],
  },
  {
    id: "winter",
    name: "冬",
    months: "12月〜2月",
    icon: <Snowflake className="size-6" />,
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50 dark:bg-blue-950",
    borderClass: "border-blue-200 dark:border-blue-900",
    description:
      "水温低下で魚の活性は落ちますが、冬ならではのターゲットも。根魚のハイシーズンで、穴釣りやメバリングが楽しめます。",
    fish: [
      { name: "カサゴ", slug: "kasago", description: "冬の穴釣りの主役。ブラクリで手軽に狙える。", peak: true },
      { name: "メバル", slug: "mebaru", description: "冬〜早春のメバリングが最盛期。", peak: true },
      { name: "カレイ", slug: "karei", description: "投げ釣りで大型カレイが狙える冬の定番。" },
      { name: "カワハギ", slug: "kawahagi", description: "肝パンの冬カワハギは絶品。テクニカルな釣り。" },
      { name: "ヒラメ", slug: "hirame", description: "サーフからの泳がせやルアーで座布団級が狙える。" },
    ],
    methods: [
      { name: "穴釣り", description: "テトラの隙間でカサゴやメバルを狙う。冬の定番。" },
      { name: "メバリング", description: "常夜灯周りで小型ルアーで狙う。夜釣りが有利。" },
      { name: "投げ釣り", description: "カレイの大物狙い。2本竿でじっくり待つ。" },
      { name: "ルアー釣り", description: "ヒラメやシーバスのランカーが狙えるシーズン。" },
    ],
    tips: [
      "防寒対策が最重要。手袋・ネックウォーマー・カイロは必須",
      "冬は日照時間が短いのでヘッドライトを持参",
      "北風が強い日は風裏のポイントを選ぼう",
      "温かい飲み物やカップ麺を持参すると快適",
      "魚の活性が低いので、アタリが小さい。感度の良いタックルが有利",
    ],
  },
];

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "季節別釣りガイド - 春夏秋冬のおすすめ釣り",
  description:
    "春夏秋冬それぞれの季節で釣れる魚、おすすめの釣法、注意点を初心者向けにわかりやすく解説。",
  url: "https://tsurispot.com/seasonal",
  datePublished: "2025-01-01",
  dateModified: new Date().toISOString().split("T")[0],
  author: {
    "@type": "Person",
    name: "正木 家康",
    jobTitle: "編集長",
    url: "https://tsurispot.com/about",
  },
  publisher: {
    "@type": "Organization",
    name: "ツリスポ",
    url: "https://tsurispot.com",
    logo: {
      "@type": "ImageObject",
      url: "https://tsurispot.com/logo.svg",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://tsurispot.com/seasonal",
  },
};

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
      name: "季節別釣りガイド",
      item: "https://tsurispot.com/seasonal",
    },
  ],
};

export default function SeasonalPage() {
  const currentSeason = getCurrentSeason();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-4">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "季節別釣りガイド" }]} />
        </div>
        {/* Header */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            季節別釣りガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            春夏秋冬、それぞれの季節で楽しめる釣りを紹介します
          </p>
        </div>

        {/* Season navigation */}
        <nav className="mb-8 flex justify-center gap-2 sm:gap-3">
          {seasons.map((season) => (
            <a
              key={season.id}
              href={`#${season.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                season.id === currentSeason
                  ? `${season.bgClass} ${season.borderClass} ${season.colorClass}`
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {season.icon}
              <span className="hidden sm:inline">{season.name}の釣り</span>
              <span className="sm:hidden">{season.name}</span>
              {season.id === currentSeason && (
                <Badge variant="default" className="ml-1 text-[10px]">
                  今
                </Badge>
              )}
            </a>
          ))}
        </nav>

        {/* Seasons */}
        <div className="space-y-12">
          {seasons.map((season) => (
            <section
              key={season.id}
              id={season.id}
              className={`rounded-xl border-2 p-4 sm:p-6 ${
                season.id === currentSeason
                  ? `${season.borderClass} ${season.bgClass}`
                  : "border-border"
              }`}
            >
              {/* Season header */}
              <div className="mb-6 flex items-center gap-3">
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${season.bgClass} ${season.colorClass}`}
                >
                  {season.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    {season.name}の釣り
                    {season.id === currentSeason && (
                      <Badge variant="default" className="ml-2 align-middle">
                        今のシーズン
                      </Badge>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {season.months}
                  </p>
                </div>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {season.description}
              </p>

              {/* Target fish */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
                  <Fish className="size-4 text-primary" />
                  おすすめの魚種
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {season.fish.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/fish/${f.slug}`}
                      className="group flex items-start gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:bg-card"
                    >
                      <Fish
                        className={`mt-0.5 size-5 shrink-0 ${
                          f.peak
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold group-hover:text-primary">
                            {f.name}
                          </span>
                          {f.peak && (
                            <Badge
                              variant="secondary"
                              className="text-[10px]"
                            >
                              最盛期
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {f.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Methods */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
                  <Anchor className="size-4 text-primary" />
                  おすすめの釣法
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {season.methods.map((method) => (
                    <div
                      key={method.name}
                      className="rounded-lg border bg-white p-3 dark:bg-card"
                    >
                      <p className="font-semibold">{method.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
                  <AlertTriangle className="size-4 text-amber-500" />
                  注意点・ポイント
                </h3>
                <ul className="space-y-1.5">
                  {season.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">関連ページ</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/catchable-now"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">今釣れる魚</p>
              <p className="mt-1 text-xs text-muted-foreground">
                今の時期に釣れる魚をチェック
              </p>
            </Link>
            <Link
              href="/glossary"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">釣り用語集</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣りの基本用語を学ぶ
              </p>
            </Link>
            <Link
              href="/beginner-checklist"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold">持ち物チェックリスト</p>
              <p className="mt-1 text-xs text-muted-foreground">
                忘れ物防止チェックリスト
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
