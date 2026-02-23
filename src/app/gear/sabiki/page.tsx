import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ExternalLink,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  Fish,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getAmazonUrl, getRakutenUrl } from "@/lib/affiliate-config";

export const metadata: Metadata = {
  title:
    "サビキ釣りセットおすすめ10選【2025年版】初心者向け完全ガイド | ツリスポ",
  description:
    "サビキ釣りセットのおすすめ10選を価格帯別にランキング形式で紹介。1000円以下・3000円以下・5000円以上のカテゴリ別に、初心者でも失敗しない選び方を解説。Amazon・楽天で購入可能。",
  openGraph: {
    title: "サビキ釣りセットおすすめ10選【2025年版】初心者向け完全ガイド",
    description:
      "サビキ釣りセットのおすすめを価格帯別にランキング形式で紹介。初心者でも失敗しない選び方を解説。",
    type: "article",
    url: "https://tsurispot.com/gear/sabiki",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/gear/sabiki",
  },
};

// --- 構造化データ ---
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
      name: "サビキ釣りセットおすすめ",
      item: "https://tsurispot.com/gear/sabiki",
    },
  ],
};

// --- 商品データ ---
interface SabikiProduct {
  rank: number;
  name: string;
  brand: string;
  price: string;
  priceCategory: "budget" | "mid" | "premium";
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  amazonAsin: string;
  rakutenQuery: string;
  rating: number;
  isEditorPick?: boolean;
}

const sabikiProducts: SabikiProduct[] = [
  {
    rank: 1,
    name: "プロマリン わくわくサビキ釣りセットDX 240",
    brand: "プロマリン",
    price: "3,000〜4,000円",
    priceCategory: "mid",
    description:
      "竿・リール・仕掛け・バケツまで全部入りの完全セット。買ったその日にサビキ釣りを始められる、Amazon人気No.1のサビキセット。初めての1本に最適です。",
    pros: [
      "必要なものが全て揃っている",
      "バケツ・ハサミまで付属",
      "説明書付きで初心者にも安心",
      "Amazon評価4.0以上の高評価",
    ],
    cons: [
      "竿がやや重め",
      "リールの巻き心地は価格相応",
    ],
    bestFor: "初心者・ファミリー",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "プロマリン サビキ釣りセット DX",
    rating: 4.1,
    isEditorPick: true,
  },
  {
    rank: 2,
    name: "つり具TEN サビキ釣り入門セット",
    brand: "つり具TEN",
    price: "2,500〜3,500円",
    priceCategory: "mid",
    description:
      "竿・リール・仕掛けのシンプルセット。軽量で扱いやすく、お子さんでも操作できます。仕掛けは3種類付属で、様々な魚種に対応。",
    pros: [
      "軽量で子供でも使いやすい",
      "仕掛け3種付属",
      "コスパ抜群",
    ],
    cons: [
      "バケツは別途購入が必要",
      "竿が短め（180cm）",
    ],
    bestFor: "子供・コスパ重視",
    amazonAsin: "B0C1JKXQV7",
    rakutenQuery: "サビキ釣り 入門セット 初心者",
    rating: 4.0,
  },
  {
    rank: 3,
    name: "FIVE STAR サビキ釣りコンプリートセット 270",
    brand: "FIVE STAR",
    price: "3,500〜4,500円",
    priceCategory: "mid",
    description:
      "2.7mの長めの竿で飛距離が出るセット。沖目の魚も狙える本格仕様ながら、初心者でも扱いやすい設計。堤防でのサビキ釣りにベストマッチ。",
    pros: [
      "2.7mで足場が高い堤防にも対応",
      "セット内容が充実",
      "投げサビキにも使える",
    ],
    cons: [
      "子供には長すぎる場合あり",
      "収納時にやや場所を取る",
    ],
    bestFor: "堤防釣り・大人の入門者",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "FIVE STAR サビキ釣りセット 270",
    rating: 3.9,
  },
  {
    rank: 4,
    name: "OGK ちょいサビキセット 180",
    brand: "OGK",
    price: "1,500〜2,500円",
    priceCategory: "budget",
    description:
      "1000円台で手に入るお手頃サビキセット。短めの竿で取り回しがよく、漁港内や足元の魚を狙うのにぴったり。予算を抑えたい方に。",
    pros: [
      "圧倒的な低価格",
      "コンパクトで持ち運びやすい",
      "足元のサビキに最適",
    ],
    cons: [
      "仕掛けの予備がない",
      "遠投には不向き",
    ],
    bestFor: "予算重視・お試し",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "OGK サビキセット 初心者",
    rating: 3.7,
  },
  {
    rank: 5,
    name: "笑転 サビキ釣りフルセット 240",
    brand: "笑転",
    price: "2,800〜3,500円",
    priceCategory: "mid",
    description:
      "竿・リール・仕掛け・コマセカゴ・バケツなど12点セット。YouTubeで解説動画も公開されており、初めてでも安心して始められます。",
    pros: [
      "12点の充実セット",
      "動画解説あり",
      "仕掛けの予備も付属",
    ],
    cons: [
      "竿の感度はそこそこ",
    ],
    bestFor: "完全初心者・動画で学びたい方",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "笑転 サビキ釣り フルセット",
    rating: 4.0,
  },
  {
    rank: 6,
    name: "ダイワ リバティクラブ サビキセット",
    brand: "ダイワ",
    price: "5,500〜7,000円",
    priceCategory: "premium",
    description:
      "大手メーカー・ダイワのブランド力を持つサビキセット。竿のしなやかさとリールの巻き心地が段違い。長く使いたい方におすすめの高品質モデル。",
    pros: [
      "ダイワブランドの安心感",
      "竿の感度が良い",
      "リールの巻き心地が滑らか",
      "サビキ以外にもちょい投げに使える",
    ],
    cons: [
      "セット商品としてはやや高め",
      "仕掛けは別売り",
    ],
    bestFor: "品質重視・長く使いたい方",
    amazonAsin: "B00NFQ5E8S",
    rakutenQuery: "ダイワ リバティクラブ サビキ セット",
    rating: 4.3,
    isEditorPick: true,
  },
  {
    rank: 7,
    name: "シマノ サビキ入門セット",
    brand: "シマノ",
    price: "6,000〜8,000円",
    priceCategory: "premium",
    description:
      "世界のシマノが送る高品質サビキセット。AR-Cスプール搭載リールで飛距離とライントラブルを軽減。本格的に続けたい方向け。",
    pros: [
      "シマノブランドの信頼性",
      "ライントラブルが少ない",
      "ちょい投げにも転用可能",
    ],
    cons: [
      "価格が高め",
      "仕掛けは別途必要",
    ],
    bestFor: "高品質志向・長期利用",
    amazonAsin: "B0B5ZRMLZZ",
    rakutenQuery: "シマノ サビキ 入門 セット",
    rating: 4.4,
  },
  {
    rank: 8,
    name: "浜田商会 サビキボンバーセット 210",
    brand: "浜田商会",
    price: "1,800〜2,500円",
    priceCategory: "budget",
    description:
      "2000円以下で手に入る格安セット。竿・リール・仕掛けの基本3点セットで、とにかく安く始めたい方に。短い竿で子供にもおすすめ。",
    pros: [
      "2000円以下の最安クラス",
      "軽くて子供向き",
      "必要最低限が揃う",
    ],
    cons: [
      "耐久性は価格相応",
      "大物がかかると心配",
    ],
    bestFor: "最安値で始めたい方",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "浜田商会 サビキ セット",
    rating: 3.6,
  },
  {
    rank: 9,
    name: "タカミヤ H.B concept サビキスターターセット",
    brand: "タカミヤ",
    price: "4,000〜5,000円",
    priceCategory: "mid",
    description:
      "釣具チェーン「釣具のポイント」オリジナルブランドのセット。品質と価格のバランスが良く、実店舗でもサポートが受けられる安心感。",
    pros: [
      "実店舗で相談できる",
      "品質と価格のバランス良",
      "替えの仕掛け付き",
    ],
    cons: [
      "オンラインでの入手性にばらつき",
    ],
    bestFor: "店舗サポート希望の方",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "タカミヤ サビキ スターター セット",
    rating: 3.9,
  },
  {
    rank: 10,
    name: "マックスジャパン ファミリーサビキセット 240",
    brand: "マックスジャパン",
    price: "2,500〜3,200円",
    priceCategory: "mid",
    description:
      "家族で楽しめるファミリー向けセット。竿2本とリール2台がセットになっており、親子で同時にサビキ釣りを楽しめます。",
    pros: [
      "竿2本・リール2台の親子セット",
      "家族で楽しめる",
      "1人あたりの単価が安い",
    ],
    cons: [
      "1本あたりの品質はそこそこ",
      "仕掛けは少なめ",
    ],
    bestFor: "ファミリー・親子釣り",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "ファミリー サビキ セット 親子",
    rating: 3.8,
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "サビキ釣りセットおすすめ10選",
  numberOfItems: sabikiProducts.length,
  itemListElement: sabikiProducts.map((p) => ({
    "@type": "ListItem",
    position: p.rank,
    name: p.name,
    url: `https://tsurispot.com/gear/sabiki#rank${p.rank}`,
  })),
};

// --- 商品カード ---
function SabikiProductCard({ product }: { product: SabikiProduct }) {
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
              <Badge variant="outline" className="text-xs">
                {product.bestFor}
              </Badge>
            </div>
          </div>
        </div>

        {/* 本文 */}
        <div className="space-y-4 px-4 py-4 sm:px-6">
          {/* 価格・評価 */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
              {product.price}
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

// --- メインページ ---
export default function GearSabikiPage() {
  const budgetProducts = sabikiProducts.filter(
    (p) => p.priceCategory === "budget"
  );
  const midProducts = sabikiProducts.filter((p) => p.priceCategory === "mid");
  const premiumProducts = sabikiProducts.filter(
    (p) => p.priceCategory === "premium"
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
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "おすすめ道具", href: "/gear" },
          { label: "サビキ釣りセット" },
        ]} />

        {/* ヒーロー */}
        <div className="mb-10 sm:mb-14">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Fish className="size-7 text-primary" />
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            サビキ釣りセットおすすめ10選
            <span className="mt-1 block text-lg font-medium text-muted-foreground sm:text-xl">
              【2025年版】初心者向け完全ガイド
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            サビキ釣りは初心者でも手軽に始められる人気の釣り方。
            アジ・サバ・イワシなどの回遊魚を家族で楽しめます。
            この記事では、予算や目的に合わせたおすすめのサビキ釣りセットを
            ランキング形式でご紹介します。
          </p>
        </div>

        {/* 目次 */}
        <Card className="mb-10">
          <CardContent className="py-4">
            <p className="mb-3 text-sm font-bold">この記事の内容</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#how-to-choose" className="text-primary hover:underline">
                  1. サビキ釣りセットの選び方
                </a>
              </li>
              <li>
                <a href="#ranking" className="text-primary hover:underline">
                  2. おすすめランキング TOP10
                </a>
              </li>
              <li>
                <a href="#by-price" className="text-primary hover:underline">
                  3. 価格帯別おすすめ
                </a>
              </li>
              <li>
                <a href="#extras" className="text-primary hover:underline">
                  4. 一緒に買いたいアイテム
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* --- セクション1: 選び方 --- */}
        <section id="how-to-choose" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            サビキ釣りセットの選び方
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-blue-200 bg-blue-50/50 py-0">
              <CardContent className="p-4">
                <h3 className="mb-2 font-bold text-blue-900">
                  竿の長さで選ぶ
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    <strong>1.8m〜2.1m:</strong> 子供・漁港の足元
                  </li>
                  <li>
                    <strong>2.4m〜2.7m:</strong> 堤防・防波堤（万能）
                  </li>
                  <li>
                    <strong>3.0m以上:</strong> 足場が高い場所・投げサビキ
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50 py-0">
              <CardContent className="p-4">
                <h3 className="mb-2 font-bold text-green-900">
                  セット内容で選ぶ
                </h3>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>
                    <strong>最低限:</strong> 竿 + リール + 仕掛け
                  </li>
                  <li>
                    <strong>標準:</strong> + コマセカゴ + バケツ
                  </li>
                  <li>
                    <strong>フル:</strong> + ハサミ + タオル + 説明書
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50 py-0">
              <CardContent className="p-4">
                <h3 className="mb-2 font-bold text-amber-900">
                  予算で選ぶ
                </h3>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>
                    <strong>2,000円以下:</strong> お試し・1回限り
                  </li>
                  <li>
                    <strong>3,000〜5,000円:</strong> 一番人気の価格帯
                  </li>
                  <li>
                    <strong>5,000円以上:</strong> 長く使える高品質
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50 py-0">
              <CardContent className="p-4">
                <h3 className="mb-2 font-bold text-purple-900">
                  メーカーで選ぶ
                </h3>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>
                    <strong>ダイワ・シマノ:</strong> 品質重視の大手
                  </li>
                  <li>
                    <strong>プロマリン:</strong> コスパ重視の定番
                  </li>
                  <li>
                    <strong>OGK・浜田商会:</strong> 格安入門向け
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- セクション2: ランキング --- */}
        <section id="ranking" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            <ShoppingBag className="mr-2 inline-block size-6 text-primary" />
            サビキ釣りセット おすすめランキング TOP10
          </h2>
          <div className="space-y-6">
            {sabikiProducts.map((product) => (
              <SabikiProductCard key={product.rank} product={product} />
            ))}
          </div>
        </section>

        {/* --- セクション3: 価格帯別 --- */}
        <section id="by-price" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            価格帯別おすすめ
          </h2>

          <div className="space-y-8">
            {/* 格安 */}
            <div>
              <h3 className="mb-3 text-lg font-bold text-green-700">
                2,000円以下 - とにかく安く試したい方
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                「1回だけ試してみたい」「子供の遊び用に」という方向け。
                耐久性は値段相応ですが、サビキ釣りの楽しさを知るには十分です。
              </p>
              <div className="space-y-4">
                {budgetProducts.map((p) => (
                  <SabikiProductCard key={p.rank} product={p} />
                ))}
              </div>
            </div>

            {/* 中間 */}
            <div>
              <h3 className="mb-3 text-lg font-bold text-blue-700">
                3,000〜5,000円 - 一番人気のバランス型
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                品質とコスパのバランスが最も良い価格帯。
                セット内容も充実しており、追加購入が最小限で済みます。
                迷ったらこの価格帯を選べば間違いありません。
              </p>
              <div className="space-y-4">
                {midProducts.map((p) => (
                  <SabikiProductCard key={p.rank} product={p} />
                ))}
              </div>
            </div>

            {/* プレミアム */}
            <div>
              <h3 className="mb-3 text-lg font-bold text-amber-700">
                5,000円以上 - 長く使える高品質
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                ダイワやシマノなど大手メーカーの品質。
                サビキだけでなく、ちょい投げやウキ釣りにも転用でき、
                長期的にはコスパが良い選択です。
              </p>
              <div className="space-y-4">
                {premiumProducts.map((p) => (
                  <SabikiProductCard key={p.rank} product={p} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- セクション4: 一緒に買いたい --- */}
        <section id="extras" className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            サビキ釣りで一緒に買いたいアイテム
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                name: "マルキュー アミ姫",
                desc: "チューブ型で手が汚れにくい！においも少なく、初めてのサビキ釣りにおすすめ。女性やお子さんに大人気。",
                price: "300〜500円",
                directUrl: "https://amzn.to/4c6gaUn",
                asin: "",
                query: "マルキュー アミ姫",
              },
              {
                name: "ハヤブサ サビキ仕掛け（予備）",
                desc: "根がかりや絡みに備えて、仕掛けは3セット以上持っていくと安心。",
                price: "200〜400円",
                directUrl: "",
                asin: "B00CMQGRJK",
                query: "ハヤブサ サビキ仕掛け ピンクスキン",
              },
              {
                name: "水汲みバケツ（折りたたみ）",
                desc: "コマセを溶かしたり、釣った魚を入れたり。必需品です。",
                price: "500〜1,000円",
                directUrl: "",
                asin: "B07L5N7CZX",
                query: "水汲みバケツ 折りたたみ 釣り",
              },
              {
                name: "フィッシュグリップ",
                desc: "魚のトゲやヒレから手を守る。毒を持つ魚がかかることもあるので安全のために。",
                price: "1,500〜2,500円",
                directUrl: "",
                asin: "B074P3D6R9",
                query: "フィッシュグリップ 釣り",
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
                      href={item.directUrl || getAmazonUrl(item.asin)}
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

        {/* --- 関連リンク --- */}
        <div className="rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">関連記事</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/gear/rod-beginner"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                初心者向け釣り竿おすすめ
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                最初の1本の選び方
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
              href="/guide/sabiki"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                サビキ釣りの始め方
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                手順とコツを完全ガイド
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
