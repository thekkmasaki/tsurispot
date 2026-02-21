import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Ruler,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAmazonUrl, getRakutenUrl } from "@/lib/affiliate-config";

export const metadata: Metadata = {
  title:
    "初心者向け釣り竿おすすめ8選 - 最初の1本はこれ！【2025年版】 | ツリスポ",
  description:
    "初心者が最初に買うべき釣り竿おすすめ8選を厳選。万能竿・サビキ竿・ちょい投げ竿のカテゴリ別に、長さ・硬さの選び方からコスパ重視のランキングまで徹底解説。",
  openGraph: {
    title: "初心者向け釣り竿おすすめ8選 - 最初の1本はこれ！【2025年版】",
    description:
      "初心者が最初に買うべき釣り竿おすすめ8選を厳選紹介。カテゴリ別に選び方を徹底解説。",
    type: "article",
    url: "https://tsurispot.com/gear/rod-beginner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/gear/rod-beginner",
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
      name: "おすすめ釣り道具",
      item: "https://tsurispot.com/gear",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "初心者向け釣り竿おすすめ",
      item: "https://tsurispot.com/gear/rod-beginner",
    },
  ],
};

interface RodProduct {
  rank: number;
  name: string;
  brand: string;
  price: string;
  category: "versatile" | "sabiki" | "choinage" | "compact";
  length: string;
  weight: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  amazonAsin: string;
  rakutenQuery: string;
  rating: number;
  isEditorPick?: boolean;
}

const rodProducts: RodProduct[] = [
  {
    rank: 1,
    name: "ダイワ リバティクラブ 磯風 3-45遠投",
    brand: "ダイワ",
    price: "5,000〜7,000円",
    category: "versatile",
    length: "4.51m",
    weight: "215g",
    description:
      "サビキ釣り・ウキ釣り・ちょい投げまで幅広く使えるダイワの人気万能竿。しなやかで扱いやすく、初心者が「最初の1本」として選ぶなら間違いない定番モデル。3号の硬さは堤防釣り全般に対応します。",
    pros: [
      "サビキ・ウキ釣り・ちょい投げに万能",
      "ダイワブランドの安心品質",
      "しなやかで初心者でも扱いやすい",
      "価格と品質のバランスが最高",
    ],
    cons: [
      "ルアー釣りには不向き",
      "電車移動にはやや長い",
    ],
    bestFor: "迷ったらコレ！万能型",
    amazonAsin: "B00NFQ5E8S",
    rakutenQuery: "ダイワ リバティクラブ 磯風 3号",
    rating: 4.3,
    isEditorPick: true,
  },
  {
    rank: 2,
    name: "シマノ ホリデー磯 3号 450",
    brand: "シマノ",
    price: "6,000〜8,000円",
    category: "versatile",
    length: "4.50m",
    weight: "200g",
    description:
      "シマノの定番万能磯竿。軽量で操作性に優れ、長時間の釣りでも疲れにくい設計。穂先のしなやかさと胴のパワーのバランスが良く、初心者からベテランまで幅広く支持されています。",
    pros: [
      "シマノの信頼性と品質",
      "軽量で疲れにくい",
      "穂先が繊細でアタリが取りやすい",
    ],
    cons: [
      "リバティクラブより少し高め",
      "投げ釣り用途ならもう少し硬めが欲しい",
    ],
    bestFor: "品質重視の万能竿",
    amazonAsin: "B0B5ZRMLZZ",
    rakutenQuery: "シマノ ホリデー磯 3号 450",
    rating: 4.4,
  },
  {
    rank: 3,
    name: "プロマリン ブルーベイ磯 3-450",
    brand: "プロマリン",
    price: "2,500〜3,500円",
    category: "versatile",
    length: "4.50m",
    weight: "245g",
    description:
      "3000円台で手に入るコスパ抜群の万能磯竿。初めて竿を買う方に最適な入門価格ながら、堤防でのサビキ釣りやウキ釣りに十分な性能を持っています。",
    pros: [
      "3000円台の破格の安さ",
      "堤防釣りに十分な性能",
      "初心者の入門用に最適",
    ],
    cons: [
      "大手メーカーに比べると重め",
      "ガイドの耐久性はそこそこ",
    ],
    bestFor: "コスパ最強の入門竿",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "プロマリン ブルーベイ磯 3号",
    rating: 3.9,
  },
  {
    rank: 4,
    name: "ダイワ リバティクラブ ショートスイング 15-270",
    brand: "ダイワ",
    price: "5,500〜7,000円",
    category: "choinage",
    length: "2.69m",
    weight: "175g",
    description:
      "ちょい投げ専用設計の短めロッド。天秤仕掛けをちょい投げしてキスやハゼを狙うのにベスト。短くて軽いので女性やお子さんでも扱いやすい。投げ釣り入門に最適な1本。",
    pros: [
      "ちょい投げに特化した設計",
      "短くて軽いから扱いやすい",
      "キス・ハゼ釣りに最適",
      "振り出し竿でコンパクト収納",
    ],
    cons: [
      "サビキ釣りには短すぎる",
      "本格的な投げ釣りには力不足",
    ],
    bestFor: "ちょい投げ入門",
    amazonAsin: "B00NFQ5E8S",
    rakutenQuery: "ダイワ リバティクラブ ショートスイング",
    rating: 4.2,
  },
  {
    rank: 5,
    name: "シマノ ルアーマチック S86ML",
    brand: "シマノ",
    price: "5,000〜6,500円",
    category: "versatile",
    length: "2.59m",
    weight: "145g",
    description:
      "ルアー釣りにも対応するシマノの万能ロッド。エギング、シーバス、ライトショアジギングまでこなせる汎用性の高さが魅力。将来ルアー釣りにも挑戦したい方に。",
    pros: [
      "ルアー釣り全般に対応",
      "エギング・シーバスもOK",
      "軽量でキャストしやすい",
    ],
    cons: [
      "サビキ釣りには不向き",
      "餌釣り全般は得意ではない",
    ],
    bestFor: "ルアー釣りに興味がある方",
    amazonAsin: "B0B5ZRMLZZ",
    rakutenQuery: "シマノ ルアーマチック S86ML",
    rating: 4.3,
    isEditorPick: true,
  },
  {
    rank: 6,
    name: "OGK グローバルスティック 602MLS",
    brand: "OGK",
    price: "1,500〜2,000円",
    category: "compact",
    length: "1.80m",
    weight: "118g",
    description:
      "2000円以下で買える超格安ルアーロッド。コンパクトに収納でき、電車釣行にも便利。ちょい投げやサビキの予備竿としても活躍。「とりあえず1本」におすすめ。",
    pros: [
      "2000円以下の最安クラス",
      "コンパクトで携帯性抜群",
      "サブロッドにも最適",
    ],
    cons: [
      "耐久性は価格相応",
      "大物には力不足",
    ],
    bestFor: "最安値・コンパクト重視",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "OGK グローバルスティック ルアーロッド",
    rating: 3.6,
  },
  {
    rank: 7,
    name: "メジャークラフト ファーストキャスト FCS-T862M",
    brand: "メジャークラフト",
    price: "4,500〜6,000円",
    category: "versatile",
    length: "2.62m",
    weight: "未公表",
    description:
      "メジャークラフトの入門向けシリーズ。ちょい投げ・サビキ・ルアーまで幅広く使える汎用ロッド。テレスコピック（振り出し）タイプで持ち運びに便利。",
    pros: [
      "多目的に使えるテレスコロッド",
      "持ち運びが便利",
      "メジャークラフトの品質",
    ],
    cons: [
      "専用ロッドに比べると中途半端な面も",
    ],
    bestFor: "携帯性 + 万能性",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "メジャークラフト ファーストキャスト テレスコ",
    rating: 4.0,
  },
  {
    rank: 8,
    name: "ダイワ 小継 せとうち 2号-39",
    brand: "ダイワ",
    price: "6,000〜8,000円",
    category: "sabiki",
    length: "3.86m",
    weight: "145g",
    description:
      "仕舞寸法わずか48cmの超コンパクト小継竿。電車やバス移動でもリュックに入るサイズ。サビキやウキ釣りに最適で、堤防釣りの強い味方。旅行先での釣りにも。",
    pros: [
      "仕舞寸法48cmの超コンパクト",
      "電車釣行に最適",
      "ダイワの高品質",
      "サビキ・ウキ釣りに対応",
    ],
    cons: [
      "継ぎ数が多い分やや重め",
      "本格的な投げ釣りには不向き",
    ],
    bestFor: "電車釣行・旅行用",
    amazonAsin: "B00NFQ5E8S",
    rakutenQuery: "ダイワ 小継 せとうち 万能竿",
    rating: 4.2,
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "初心者向け釣り竿おすすめ8選",
  numberOfItems: rodProducts.length,
  itemListElement: rodProducts.map((p) => ({
    "@type": "ListItem",
    position: p.rank,
    name: p.name,
    url: `https://tsurispot.com/gear/rod-beginner#rank${p.rank}`,
  })),
};

const CATEGORY_LABELS: Record<string, string> = {
  versatile: "万能竿",
  sabiki: "サビキ竿",
  choinage: "ちょい投げ竿",
  compact: "コンパクト竿",
};

const CATEGORY_COLORS: Record<string, string> = {
  versatile: "bg-blue-100 text-blue-700",
  sabiki: "bg-green-100 text-green-700",
  choinage: "bg-amber-100 text-amber-700",
  compact: "bg-purple-100 text-purple-700",
};

function RodProductCard({ product }: { product: RodProduct }) {
  const amazonUrl = getAmazonUrl(product.amazonAsin);
  const rakutenUrl = getRakutenUrl(product.rakutenQuery);

  return (
    <Card
      id={`rank${product.rank}`}
      className="overflow-hidden border-2 py-0 transition-shadow hover:shadow-lg"
    >
      <CardContent className="p-0">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3 sm:px-6">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-white ${
              product.rank === 1
                ? "bg-amber-500"
                : product.rank === 2
                  ? "bg-gray-400"
                  : product.rank === 3
                    ? "bg-amber-700"
                    : "bg-primary/70"
            }`}
          >
            {product.rank}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold leading-snug sm:text-lg">
              {product.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {product.brand}
              </span>
              {product.isEditorPick && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  <Star className="mr-0.5 size-3 fill-amber-500 text-amber-500" />
                  編集部イチオシ
                </Badge>
              )}
              <Badge
                className={`${CATEGORY_COLORS[product.category]} hover:${CATEGORY_COLORS[product.category]}`}
              >
                {CATEGORY_LABELS[product.category]}
              </Badge>
            </div>
          </div>
        </div>

        {/* 本文 */}
        <div className="space-y-4 px-4 py-4 sm:px-6">
          {/* スペック */}
          <div className="flex flex-wrap gap-3">
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
              {product.price}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              <Ruler className="size-3" />
              {product.length}
            </span>
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {product.weight}
            </span>
            <div className="flex items-center gap-1 text-sm">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* 説明 */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* メリット・デメリット */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-3">
              <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-green-700">
                <CheckCircle className="size-3.5" />
                良いところ
              </p>
              <ul className="space-y-1">
                {product.pros.map((pro, i) => (
                  <li
                    key={i}
                    className="text-xs leading-relaxed text-green-800"
                  >
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <p className="mb-1.5 flex items-center gap-1 text-xs font-bold text-orange-700">
                <AlertTriangle className="size-3.5" />
                気になる点
              </p>
              <ul className="space-y-1">
                {product.cons.map((con, i) => (
                  <li
                    key={i}
                    className="text-xs leading-relaxed text-orange-800"
                  >
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]"
            >
              Amazonで見る
              <ExternalLink className="size-3.5" />
            </a>
            <a
              href={rakutenUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#BF0000] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#A00000]"
            >
              楽天で見る
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GearRodBeginnerPage() {
  const versatileRods = rodProducts.filter(
    (p) => p.category === "versatile"
  );
  const specialtyRods = rodProducts.filter(
    (p) => p.category !== "versatile"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, itemListJsonLd]),
        }}
      />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* パンくず */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          <Link href="/" className="hover:text-foreground">
            ホーム
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href="/gear" className="hover:text-foreground">
            おすすめ道具
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">初心者向け釣り竿</span>
        </nav>

        {/* ヒーロー */}
        <div className="mb-10 sm:mb-14">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Ruler className="size-7 text-primary" />
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            初心者向け釣り竿おすすめ8選
            <span className="mt-1 block text-lg font-medium text-muted-foreground sm:text-xl">
              最初の1本はこれ！【2025年版】
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            釣りを始めるとき、竿選びは一番迷うポイント。
            万能竿・サビキ竿・ちょい投げ竿など目的に合わせた
            おすすめの釣り竿をコスパ重視でランキング形式でご紹介します。
          </p>
        </div>

        {/* 目次 */}
        <Card className="mb-10">
          <CardContent className="py-4">
            <p className="mb-3 text-sm font-bold">この記事の内容</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-to-choose" className="text-primary hover:underline">
                  1. 釣り竿の選び方 - 長さ・硬さ・種類
                </a>
              </li>
              <li>
                <a href="#ranking" className="text-primary hover:underline">
                  2. おすすめランキング 全8選
                </a>
              </li>
              <li>
                <a href="#by-type" className="text-primary hover:underline">
                  3. 目的別おすすめ
                </a>
              </li>
              <li>
                <a href="#reel" className="text-primary hover:underline">
                  4. 合わせて買いたいリール
                </a>
              </li>
              <li>
                <a href="#line-tip" className="text-primary hover:underline">
                  5. 糸（ライン）は別で買おう！
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* --- セクション1: 選び方 --- */}
        <section id="how-to-choose" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            釣り竿の選び方 - 長さ・硬さ・種類
          </h2>

          <div className="space-y-4">
            <Card className="border-blue-200 bg-blue-50/50 py-0">
              <CardContent className="p-4 sm:p-5">
                <h3 className="mb-3 text-base font-bold text-blue-900">
                  竿の長さの選び方
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 pr-4 font-semibold text-blue-900">
                          長さ
                        </th>
                        <th className="pb-2 pr-4 font-semibold text-blue-900">
                          適した釣り場
                        </th>
                        <th className="pb-2 font-semibold text-blue-900">
                          おすすめの人
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-blue-800">
                      <tr className="border-b border-blue-100">
                        <td className="py-2 pr-4 font-medium">1.8〜2.1m</td>
                        <td className="py-2 pr-4">漁港・足元</td>
                        <td className="py-2">子供・コンパクト重視</td>
                      </tr>
                      <tr className="border-b border-blue-100">
                        <td className="py-2 pr-4 font-medium">2.4〜3.0m</td>
                        <td className="py-2 pr-4">堤防・防波堤</td>
                        <td className="py-2">ちょい投げ・ルアー</td>
                      </tr>
                      <tr className="border-b border-blue-100">
                        <td className="py-2 pr-4 font-medium">3.6〜4.5m</td>
                        <td className="py-2 pr-4">堤防・磯</td>
                        <td className="py-2">サビキ・ウキ釣り（万能）</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium">5.0m以上</td>
                        <td className="py-2 pr-4">磯・サーフ</td>
                        <td className="py-2">本格投げ釣り</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-green-200 bg-green-50/50 py-0">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-bold text-green-900">
                    竿の硬さ（号数）
                  </h3>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>
                      <strong>1〜1.5号:</strong> 繊細なウキ釣り向け
                    </li>
                    <li>
                      <strong>2〜3号:</strong> 万能（初心者おすすめ）
                    </li>
                    <li>
                      <strong>4〜5号:</strong> 遠投・大物向け
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-green-700">
                    ※ 初心者は3号を選べば間違いありません
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50 py-0">
                <CardContent className="p-4">
                  <h3 className="mb-2 font-bold text-amber-900">
                    竿の種類
                  </h3>
                  <ul className="space-y-1 text-sm text-amber-800">
                    <li>
                      <strong>磯竿（万能竿）:</strong> サビキ・ウキ釣りに
                    </li>
                    <li>
                      <strong>投げ竿:</strong> ちょい投げ・キス釣りに
                    </li>
                    <li>
                      <strong>ルアーロッド:</strong> ルアー釣り全般に
                    </li>
                    <li>
                      <strong>コンパクトロッド:</strong> 携帯性重視
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* --- ピックアップ: コスパ注目アイテム --- */}
        <section className="mb-12">
          <Card className="overflow-hidden border-2 border-red-200 py-0">
            <div className="flex items-center gap-2 border-b bg-gradient-to-r from-red-50 to-amber-50 px-4 py-3 sm:px-6">
              <Badge className="bg-red-500 text-white hover:bg-red-500">
                注目
              </Badge>
              <h2 className="text-base font-bold sm:text-lg">
                コスパ最強！ 2,633円〜のシーバスロッド
              </h2>
            </div>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  炭素繊維（カーボン）製で軽量・高感度なシーバスロッド。
                  2,000円台とは思えない本格仕様で、シーバス・エギング・ちょい投げなど
                  幅広い釣りに対応。初心者のルアー入門にも、2本目のサブロッドにも最適です。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-bold text-red-700">
                    2,633円〜
                  </span>
                  <Badge variant="outline">炭素繊維（カーボン）</Badge>
                  <Badge variant="outline">シーバスロッド</Badge>
                  <Badge variant="outline">ルアー対応</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-green-50 p-3">
                    <p className="mb-1 flex items-center gap-1 text-xs font-bold text-green-700">
                      <CheckCircle className="size-3.5" />
                      おすすめポイント
                    </p>
                    <ul className="space-y-1 text-xs text-green-800">
                      <li>カーボン素材で軽くて感度が良い</li>
                      <li>2,000円台の驚異的なコスパ</li>
                      <li>シーバス・エギング・ちょい投げに対応</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="mb-1 text-xs font-bold text-blue-700">
                      こんな人におすすめ
                    </p>
                    <ul className="space-y-1 text-xs text-blue-800">
                      <li>ルアー釣りを始めてみたい初心者</li>
                      <li>サブロッドが欲しい経験者</li>
                      <li>コスパ重視で竿を探している方</li>
                    </ul>
                  </div>
                </div>
                <a
                  href="https://hb.afl.rakuten.co.jp/ichiba/5134daee.e7e21566.5134daef.1df36343/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fiflife%2F021-outdoor%2F&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#BF0000] px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#A00000] sm:w-auto sm:px-8"
                >
                  楽天で詳細を見る
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- セクション2: ランキング --- */}
        <section id="ranking" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            初心者向け釣り竿 おすすめランキング
          </h2>
          <div className="space-y-6">
            {rodProducts.map((product) => (
              <RodProductCard key={product.rank} product={product} />
            ))}
          </div>
        </section>

        {/* --- セクション3: 目的別 --- */}
        <section id="by-type" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            目的別おすすめ
          </h2>

          <div className="space-y-6">
            <Card className="border-blue-200 py-0">
              <CardContent className="p-4 sm:p-5">
                <h3 className="mb-2 text-lg font-bold text-blue-800">
                  「なんでも1本で済ませたい」 → 万能竿
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  サビキ・ウキ釣り・ちょい投げに使える万能竿。迷ったらコレ。
                </p>
                <div className="flex flex-wrap gap-2">
                  {versatileRods.map((r) => (
                    <a
                      key={r.rank}
                      href={`#rank${r.rank}`}
                      className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-blue-50 hover:text-blue-700"
                    >
                      {r.rank}位: {r.name.split(" ").slice(0, 2).join(" ")}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 py-0">
              <CardContent className="p-4 sm:p-5">
                <h3 className="mb-2 text-lg font-bold text-amber-800">
                  「特定の釣りに使いたい」 → 専用竿
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  ちょい投げ・サビキ・コンパクトなど、目的に特化した竿。
                </p>
                <div className="flex flex-wrap gap-2">
                  {specialtyRods.map((r) => (
                    <a
                      key={r.rank}
                      href={`#rank${r.rank}`}
                      className="rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-amber-50 hover:text-amber-700"
                    >
                      {r.rank}位: {r.name.split(" ").slice(0, 2).join(" ")}（
                      {CATEGORY_LABELS[r.category]}）
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- セクション4: リール --- */}
        <section id="reel" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            合わせて買いたいリール
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            竿を単品で買う場合はリールも必要です。初心者には
            2500〜3000番のスピニングリールがおすすめ。
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                name: "シマノ セドナ 2500",
                desc: "初心者向けの定番リール。滑らかな巻き心地と安定したドラグ性能。コスパ抜群。",
                price: "5,000〜6,000円",
                asin: "B0B5ZRMLZZ",
                query: "シマノ セドナ 2500",
              },
              {
                name: "ダイワ レブロス LT2500",
                desc: "軽量設計のダイワ入門リール。LTコンセプトで持ち重り感が少なく、長時間の釣りでも疲れにくい。",
                price: "5,000〜6,500円",
                asin: "B00NFQ5E8S",
                query: "ダイワ レブロス LT2500",
              },
            ].map((item) => (
              <Card key={item.name} className="py-0">
                <CardContent className="p-4">
                  <h3 className="mb-1 text-sm font-bold">{item.name}</h3>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                  <span className="mb-3 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {item.price}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={getAmazonUrl(item.asin)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-[#FF9900] px-3 py-2 text-xs font-bold text-white hover:bg-[#E88B00]"
                    >
                      Amazon
                      <ExternalLink className="size-3" />
                    </a>
                    <a
                      href={getRakutenUrl(item.query)}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-[#BF0000] px-3 py-2 text-xs font-bold text-white hover:bg-[#A00000]"
                    >
                      楽天
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* --- セクション5: 糸は別で買おう --- */}
        <section id="line-tip" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            糸（ライン）は別で買おう！
          </h2>
          <Card className="border-sky-200 py-0">
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="rounded-lg bg-sky-50 p-4">
                <p className="mb-2 text-sm font-bold text-sky-900">
                  リールに最初から巻いてある糸は使わないでください
                </p>
                <ul className="space-y-1 text-sm text-sky-800">
                  <li>
                    <strong>品質が低い：</strong>
                    付属の糸は安価なもので、強度が低くすぐに切れます
                  </li>
                  <li>
                    <strong>太さが合わない：</strong>
                    釣り方に適した号数でないことが多いです
                  </li>
                  <li>
                    <strong>劣化している：</strong>
                    長期在庫品は糸が弱くなっていることがあります
                  </li>
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold">
                  初心者におすすめの糸の選び方
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 pr-4 font-semibold">釣り方</th>
                        <th className="pb-2 pr-4 font-semibold">ナイロン</th>
                        <th className="pb-2 font-semibold">PE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">サビキ釣り</td>
                        <td className="py-2 pr-4">3号</td>
                        <td className="py-2">1〜1.2号</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">ちょい投げ</td>
                        <td className="py-2 pr-4">2〜3号</td>
                        <td className="py-2">0.8〜1号</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-4 font-medium">ウキ釣り</td>
                        <td className="py-2 pr-4">2〜3号</td>
                        <td className="py-2">0.6〜1号</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium">ルアー釣り</td>
                        <td className="py-2 pr-4">—</td>
                        <td className="py-2">0.8〜1.5号</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ※ 初心者はまずナイロンラインがおすすめ。扱いやすくトラブルが少ないです。
                  PEラインは感度が高く飛距離が出ますが、別途リーダー（先糸）が必要です。
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <p className="mb-1 text-sm font-bold text-amber-900">
                  おすすめライン：魚の目に見えないフロロカーボン
                </p>
                <p className="mb-3 text-xs text-amber-800 leading-relaxed">
                  フロロカーボンラインは水中での屈折率が水に近く、<strong>魚の目にほぼ見えません</strong>。
                  警戒心の強い魚にも有効で、根ズレにも強いため堤防釣り全般に最適です。
                  初心者が最初に選ぶラインとして間違いなしの一本。
                </p>
                <a
                  href="https://amzn.to/4tKXyzu"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]"
                >
                  Amazonでおすすめラインを見る
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-sm font-bold">
                  ライン交換に便利！ 高速リサイクラー
                </p>
                <p className="mb-3 text-xs text-muted-foreground">
                  リールへのライン巻き替えが素早く均一にできる便利アイテム。
                  テーブルに固定して使えるので、一人でも簡単にライン交換できます。
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <a
                    href="https://hb.afl.rakuten.co.jp/ichiba/513505f3.9dc12d70.513505f4.52acab43/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjism%2F4995915331980-36-54383-n%2F&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#BF0000] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#A00000]"
                  >
                    第一精工 高速リサイクラー2.0 を楽天で見る
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">4,860円（税込）</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* --- 関連リンク --- */}
        <div className="rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">関連記事</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/gear/sabiki"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                サビキ釣りセットおすすめ
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                全部入りのお得セット
              </p>
              <ChevronRight className="mx-auto mt-2 size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link
              href="/gear/tackle-box"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                釣り道具一式セット
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                手ぶらで始められる
              </p>
              <ChevronRight className="mx-auto mt-2 size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link
              href="/gear"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                おすすめ釣り道具一覧
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                全アイテムを見る
              </p>
              <ChevronRight className="mx-auto mt-2 size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          </div>
        </div>

        {/* --- 戻るリンク --- */}
        <div className="mt-8 text-center">
          <Link
            href="/gear"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ChevronLeft className="size-4" />
            おすすめ釣り道具一覧に戻る
          </Link>
        </div>

        {/* 免責事項 */}
        <div className="mt-8 text-center text-xs leading-relaxed text-muted-foreground/70">
          <p>
            ※ 掲載価格は目安です。実際の価格はリンク先の各ショップでご確認ください。
          </p>
          <p className="mt-1">
            ※ 当ページにはアフィリエイトリンクが含まれます。リンク経由でご購入いただくと、当サイトの運営費に充てさせていただきます。
          </p>
        </div>
      </main>
    </>
  );
}
