import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Package,
  Users,
  Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getAmazonUrl, getRakutenUrl } from "@/lib/affiliate-config";

export const metadata: Metadata = {
  title:
    "釣り道具一式セットおすすめ5選 - 手ぶらで始められる！【2025年版】 | ツリスポ",
  description:
    "釣り道具一式セットのおすすめ5選を厳選紹介。竿・リール・仕掛け・バケツまで全部入りの入門セットから、家族向けセット、コンパクト収納セットまで目的別に解説。",
  openGraph: {
    title: "釣り道具一式セットおすすめ5選 - 手ぶらで始められる！【2025年版】",
    description:
      "釣り道具一式セットのおすすめ5選を目的別に紹介。手ぶらで釣りを始められるセットを厳選。",
    type: "article",
    url: "https://tsurispot.com/gear/tackle-box",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/gear/tackle-box",
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
      name: "釣り道具一式セット",
      item: "https://tsurispot.com/gear/tackle-box",
    },
  ],
};

interface TackleSetProduct {
  rank: number;
  name: string;
  brand: string;
  price: string;
  type: "beginner" | "family" | "compact";
  setContents: string[];
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  amazonAsin: string;
  rakutenQuery: string;
  rating: number;
  isEditorPick?: boolean;
}

const tackleSetProducts: TackleSetProduct[] = [
  {
    rank: 1,
    name: "プロマリン わくわくサビキ釣りセットDX 240",
    brand: "プロマリン",
    price: "3,000〜4,000円",
    type: "beginner",
    setContents: [
      "竿（2.4m）",
      "リール（糸付き）",
      "サビキ仕掛け",
      "コマセカゴ（上下）",
      "折りたたみバケツ",
      "ハサミ",
      "釣り方ガイド",
    ],
    description:
      "Amazon人気No.1のサビキ釣り入門セット。竿・リール・仕掛けはもちろん、バケツやハサミまで入った完全セット。買ったその日にすぐ始められる、まさに「手ぶらでOK」のセットです。追加で必要なのはコマセ（餌）だけ。",
    pros: [
      "必要なものが全て揃っている",
      "バケツ・ハサミまで付属",
      "釣り方ガイド付きで安心",
      "Amazon評価4.0以上の高評価",
    ],
    cons: [
      "コマセ（餌）は別途購入が必要",
      "リールの性能は最低限",
    ],
    bestFor: "初めてのサビキ釣りに最適",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "プロマリン サビキ釣りセット DX",
    rating: 4.1,
    isEditorPick: true,
  },
  {
    rank: 2,
    name: "マックスジャパン ファミリーフィッシングセット",
    brand: "マックスジャパン",
    price: "5,000〜7,000円",
    type: "family",
    setContents: [
      "竿2本（大人用2.4m + 子供用1.8m）",
      "リール2台（糸付き）",
      "サビキ仕掛けセット",
      "ちょい投げ仕掛けセット",
      "コマセカゴ",
      "折りたたみバケツ",
      "ハサミ",
      "収納バッグ",
    ],
    description:
      "親子2人分の竿・リールがセットになったファミリー向けパック。大人用と子供用で竿の長さが分かれており、家族で一緒にサビキ釣りを楽しめます。ちょい投げ仕掛けも入っているので飽きたら釣り方を変えられるのも魅力。",
    pros: [
      "親子2人分が1パックに",
      "サビキ+ちょい投げの2way仕掛け",
      "収納バッグ付きで持ち運び便利",
      "1人あたり3000円台のコスパ",
    ],
    cons: [
      "3人以上の場合は追加購入が必要",
      "個々の品質は単品セットに劣る",
    ],
    bestFor: "家族で楽しむ親子釣り",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "ファミリーフィッシングセット 親子 釣り",
    rating: 3.9,
  },
  {
    rank: 3,
    name: "FIVE STAR 海釣りコンプリートセット",
    brand: "FIVE STAR",
    price: "4,500〜6,000円",
    type: "beginner",
    setContents: [
      "竿（2.7m）",
      "リール（糸付き）",
      "サビキ仕掛け x3",
      "ちょい投げ仕掛け x2",
      "ウキ仕掛け x1",
      "コマセカゴ",
      "バケツ",
      "ハサミ",
      "タオル",
    ],
    description:
      "サビキ・ちょい投げ・ウキ釣りの3種類の仕掛けが入った贅沢セット。予備の仕掛けも含めて10点以上の充実内容。2.7mの竿は堤防釣りにちょうど良い長さで、初心者が一番多く訪れる漁港や防波堤で活躍します。",
    pros: [
      "3種類の釣り方が楽しめる",
      "仕掛けの予備が充実",
      "2.7mの堤防向き万能サイズ",
      "タオルまで付属する親切設計",
    ],
    cons: [
      "セット内容が多く最初は迷うかも",
      "竿がやや重め",
    ],
    bestFor: "色々な釣り方を試したい方",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "FIVE STAR 海釣り コンプリートセット",
    rating: 4.0,
    isEditorPick: true,
  },
  {
    rank: 4,
    name: "笑転 コンパクト釣りセット パックロッド",
    brand: "笑転",
    price: "3,500〜5,000円",
    type: "compact",
    setContents: [
      "パックロッド（仕舞45cm）",
      "小型リール（糸付き）",
      "サビキ仕掛け x2",
      "ジグヘッド + ワーム",
      "収納ケース",
      "カラビナ",
    ],
    description:
      "仕舞寸法わずか45cmのコンパクトパックロッドセット。リュックやスーツケースに入るサイズで、旅行先やキャンプ場での釣りに最適。サビキ仕掛けだけでなくルアーも入っており、海でも川でも楽しめます。",
    pros: [
      "仕舞45cmで超コンパクト",
      "リュックに入るサイズ",
      "旅行・キャンプのお供に",
      "海・川の両方で使える",
    ],
    cons: [
      "本格的なサビキには竿が短い",
      "大物には力不足",
    ],
    bestFor: "旅行・キャンプ・電車釣行",
    amazonAsin: "B0BXLZ4Q3X",
    rakutenQuery: "コンパクト 釣りセット パックロッド",
    rating: 3.8,
  },
  {
    rank: 5,
    name: "ダイワ 釣りの入門セット MC750",
    brand: "ダイワ",
    price: "7,000〜9,000円",
    type: "beginner",
    setContents: [
      "竿（2.1m振り出し）",
      "ダイワ製リール（糸付き）",
      "仕掛けセット",
      "収納ケース",
    ],
    description:
      "大手メーカー・ダイワが送る本格入門セット。竿・リールともにダイワの品質基準をクリアしており、初心者セットとは思えないしっかりとした作り。長く使い続けたい方に最適な「育てられる」セットです。",
    pros: [
      "ダイワブランドの安心品質",
      "竿・リールともに長く使える",
      "ちょい投げ・サビキ・ルアーに対応",
      "収納ケース付き",
    ],
    cons: [
      "仕掛けは最低限（追加購入推奨）",
      "入門セットとしてはやや高価",
    ],
    bestFor: "品質重視・長く使いたい方",
    amazonAsin: "B00NFQ5E8S",
    rakutenQuery: "ダイワ 釣り 入門セット MC750",
    rating: 4.3,
  },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "釣り道具一式セットおすすめ5選",
  numberOfItems: tackleSetProducts.length,
  itemListElement: tackleSetProducts.map((p) => ({
    "@type": "ListItem",
    position: p.rank,
    name: p.name,
    url: `https://tsurispot.com/gear/tackle-box#rank${p.rank}`,
  })),
};

const TYPE_LABELS: Record<string, string> = {
  beginner: "入門セット",
  family: "ファミリーセット",
  compact: "コンパクトセット",
};

const TYPE_ICONS: Record<string, typeof Package> = {
  beginner: Package,
  family: Users,
  compact: Briefcase,
};

const TYPE_COLORS: Record<string, string> = {
  beginner: "bg-blue-100 text-blue-700",
  family: "bg-green-100 text-green-700",
  compact: "bg-purple-100 text-purple-700",
};

function TackleSetCard({ product }: { product: TackleSetProduct }) {
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
                className={`${TYPE_COLORS[product.type]} hover:${TYPE_COLORS[product.type]}`}
              >
                {TYPE_LABELS[product.type]}
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

          {/* セット内容 */}
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="mb-2 text-xs font-bold text-foreground">
              セット内容（{product.setContents.length}点）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.setContents.map((item, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white px-2.5 py-1 text-xs text-muted-foreground shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

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

export default function GearTackleBoxPage() {
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
          { label: "釣り道具一式セット" },
        ]} />

        {/* ヒーロー */}
        <div className="mb-10 sm:mb-14">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Package className="size-7 text-primary" />
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            釣り道具一式セットおすすめ5選
            <span className="mt-1 block text-lg font-medium text-muted-foreground sm:text-xl">
              手ぶらで始められる！【2025年版】
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            「釣りを始めたいけど、何を揃えればいいかわからない...」
            そんな方には、必要な道具が全て揃った一式セットがおすすめ。
            竿・リール・仕掛け・バケツまで入ったセットなら、
            あとはコマセ（餌）を買うだけですぐに釣りを始められます。
          </p>
        </div>

        {/* 比較表 */}
        <Card className="mb-10 overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b bg-muted/30 px-4 py-3 sm:px-6">
              <h2 className="text-base font-bold sm:text-lg">
                5つのセットを一目で比較
              </h2>
            </div>
            <div className="overflow-x-auto p-4 sm:p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 pr-3 text-left font-semibold">商品</th>
                    <th className="pb-2 pr-3 text-left font-semibold">価格</th>
                    <th className="pb-2 pr-3 text-left font-semibold">タイプ</th>
                    <th className="pb-2 pr-3 text-left font-semibold">点数</th>
                    <th className="pb-2 text-left font-semibold">評価</th>
                  </tr>
                </thead>
                <tbody>
                  {tackleSetProducts.map((p) => (
                    <tr key={p.rank} className="border-b last:border-0">
                      <td className="py-2.5 pr-3">
                        <a
                          href={`#rank${p.rank}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {p.rank}. {p.name.split(" ").slice(0, 2).join(" ")}
                        </a>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">
                        {p.price}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge
                          className={`${TYPE_COLORS[p.type]} hover:${TYPE_COLORS[p.type]} text-xs`}
                        >
                          {TYPE_LABELS[p.type]}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-3">{p.setContents.length}点</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          {p.rating.toFixed(1)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* こんな人におすすめ */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">
            タイプ別 - こんな人におすすめ
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50/50 py-0">
              <CardContent className="p-4 text-center">
                <Package className="mx-auto mb-2 size-8 text-blue-600" />
                <h3 className="mb-1 font-bold text-blue-900">入門セット</h3>
                <p className="text-xs text-blue-800">
                  初めて釣りをする方に。必要なものが全部入りで迷わない。
                </p>
                <p className="mt-2 text-xs font-semibold text-blue-600">
                  → 1位・3位・5位
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50 py-0">
              <CardContent className="p-4 text-center">
                <Users className="mx-auto mb-2 size-8 text-green-600" />
                <h3 className="mb-1 font-bold text-green-900">
                  ファミリーセット
                </h3>
                <p className="text-xs text-green-800">
                  親子で釣りを楽しみたい方に。2人分の竿・リール入り。
                </p>
                <p className="mt-2 text-xs font-semibold text-green-600">
                  → 2位
                </p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50 py-0">
              <CardContent className="p-4 text-center">
                <Briefcase className="mx-auto mb-2 size-8 text-purple-600" />
                <h3 className="mb-1 font-bold text-purple-900">
                  コンパクトセット
                </h3>
                <p className="text-xs text-purple-800">
                  旅行・キャンプ・電車移動の方に。リュックに入るサイズ。
                </p>
                <p className="mt-2 text-xs font-semibold text-purple-600">
                  → 4位
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* --- ランキング --- */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            釣り道具一式セット おすすめランキング
          </h2>
          <div className="space-y-6">
            {tackleSetProducts.map((product) => (
              <TackleSetCard key={product.rank} product={product} />
            ))}
          </div>
        </section>

        {/* --- セットと一緒に買うもの --- */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">
            セットに追加で買っておきたいもの
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            セットだけでは足りないものを補足しましょう。
            特にコマセ（餌）は釣り場の近くの釣具店で当日購入がおすすめです。
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                name: "マルキュー アミ姫（コマセ）",
                desc: "チューブタイプで手が汚れない。フルーティーな香りで臭くない。サビキ釣りの必需品。",
                price: "300〜500円",
                asin: "B00TYF5RUS",
                query: "マルキュー アミ姫",
                priority: "必須",
              },
              {
                name: "ハヤブサ サビキ仕掛け（予備）",
                desc: "根がかりや絡みで仕掛けがダメになることが多いので、3セット以上の予備が必要。",
                price: "200〜400円",
                asin: "B00CMQGRJK",
                query: "ハヤブサ サビキ仕掛け ピンクスキン",
                priority: "必須",
              },
              {
                name: "ライフジャケット（膨張式）",
                desc: "堤防や磯での安全のために。ウエストタイプなら動きやすい。子供用は必ず着用を。",
                price: "4,000〜6,000円",
                asin: "B0CMP3RCT3",
                query: "ライフジャケット 膨張式 釣り",
                priority: "強く推奨",
              },
              {
                name: "クーラーボックス（15L）",
                desc: "釣った魚を新鮮に持ち帰るために。保冷剤と一緒に。発泡スチロールでも可。",
                price: "2,000〜6,000円",
                asin: "B0CVYV893K",
                query: "クーラーボックス 15L 釣り",
                priority: "あると便利",
              },
            ].map((item) => (
              <Card key={item.name} className="py-0">
                <CardContent className="p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        item.priority === "必須"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : item.priority === "強く推奨"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-blue-200 bg-blue-50 text-blue-700"
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
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

        {/* --- FAQ --- */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold sm:text-2xl">
            よくある質問
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "セットの竿は何年くらい使えますか？",
                a: "丁寧に使えば3〜5年は使えます。ただし2,000円以下の格安セットは1〜2年が目安です。ダイワやシマノのセットなら5年以上使えるケースも多いです。",
              },
              {
                q: "セット以外に何を買えばいいですか？",
                a: "コマセ（餌）は必須です。マルキュー「アミ姫」が手が汚れずおすすめ。あとは予備の仕掛けを2〜3セット買っておくと安心です。ライフジャケットも安全のために強く推奨します。",
              },
              {
                q: "子供は何歳から釣りができますか？",
                a: "4〜5歳くらいから、大人と一緒なら楽しめます。1.5〜1.8mの短い竿が操作しやすいです。ライフジャケットは必ず着用しましょう。",
              },
              {
                q: "川釣りにもセットは使えますか？",
                a: "サビキセットは海釣り専用です。川釣りには別途、渓流竿やルアーロッドのセットをお選びください。コンパクトセット（4位）なら海・川両方で使えます。",
              },
            ].map((faq, i) => (
              <Card key={i} className="py-0">
                <CardContent className="p-4">
                  <p className="mb-2 text-sm font-bold">Q. {faq.q}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    A. {faq.a}
                  </p>
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
              href="/gear/sabiki"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                サビキ釣りセットおすすめ
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                サビキ専用セットを比較
              </p>
              <ChevronRight className="mx-auto mt-2 size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link
              href="/gear/rod-beginner"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                初心者向け釣り竿
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                竿の選び方を詳しく
              </p>
              <ChevronRight className="mx-auto mt-2 size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link
              href="/beginner-checklist"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                持ち物チェックリスト
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                忘れ物防止に活用
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
