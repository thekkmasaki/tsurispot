import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣り糸（ライン）の選び方ガイド - PE・ナイロン・フロロカーボンの違いと号数別強度表",
  description:
    "PE・ナイロン・フロロカーボンの特徴と使い分けを初心者向けに解説。号数ごとの強度（lb/kg）一覧表つき。太さによるメリット・デメリットも詳しく紹介。",
  openGraph: {
    title: "釣り糸（ライン）の選び方ガイド",
    description:
      "PE・ナイロン・フロロカーボンの違いと号数別強度を徹底解説。初心者が迷わないライン選びの決定版。",
    type: "article",
    url: "https://tsurispot.com/guide/line",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/line",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "PE0.8号は何kgまで耐えられますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PE0.8号の標準的な強度は約7.3kg（16lb）です。実用強度は結び目の強度に依存し、おおよそ70〜80%の5〜6kgが目安です。",
      },
    },
    {
      "@type": "Question",
      name: "PEラインとナイロンラインの違いは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PEラインは細くて強く感度が高いですが、根ズレに弱くリーダーが必要です。ナイロンラインはしなやかでトラブルが少なく初心者向きですが、伸びがあり感度は劣ります。",
      },
    },
    {
      "@type": "Question",
      name: "初心者におすすめのラインは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "サビキ釣りや投げ釣りならナイロン3〜4号、ルアー釣りならPE0.6〜1号にフロロリーダーの組合せがおすすめです。",
      },
    },
  ],
};

// PE line strength data
const PE_DATA = [
  { gou: "0.3", lb: 6, kg: 2.7, use: "アジング・メバリング" },
  { gou: "0.4", lb: 8, kg: 3.6, use: "ライトゲーム全般" },
  { gou: "0.6", lb: 12, kg: 5.4, use: "エギング・シーバス" },
  { gou: "0.8", lb: 16, kg: 7.3, use: "エギング・シーバス・ライトショアジギ" },
  { gou: "1.0", lb: 20, kg: 9.1, use: "シーバス・ショアジギング" },
  { gou: "1.2", lb: 24, kg: 10.9, use: "ショアジギング" },
  { gou: "1.5", lb: 30, kg: 13.6, use: "ショアジギング・ヒラスズキ" },
  { gou: "2.0", lb: 38, kg: 17.2, use: "磯釣り・青物ジギング" },
  { gou: "3.0", lb: 50, kg: 22.7, use: "大物ジギング・GTフィッシング" },
  { gou: "4.0", lb: 62, kg: 28.1, use: "オフショアジギング" },
];

// Nylon line strength data
const NYLON_DATA = [
  { gou: "1", lb: 4, kg: 1.8, dia: "0.165mm", use: "渓流・ワカサギ" },
  { gou: "1.5", lb: 6, kg: 2.7, dia: "0.205mm", use: "渓流・管理釣り場" },
  { gou: "2", lb: 8, kg: 3.6, dia: "0.235mm", use: "メバリング・チヌ" },
  { gou: "3", lb: 12, kg: 5.4, dia: "0.285mm", use: "サビキ・ちょい投げ" },
  { gou: "4", lb: 16, kg: 7.3, dia: "0.330mm", use: "サビキ・投げ釣り・ウキ釣り" },
  { gou: "5", lb: 20, kg: 9.1, dia: "0.370mm", use: "投げ釣り・ウキフカセ" },
  { gou: "6", lb: 22, kg: 10.0, dia: "0.405mm", use: "磯釣り・大物投げ" },
  { gou: "8", lb: 30, kg: 13.6, dia: "0.470mm", use: "磯・堤防の大物狙い" },
  { gou: "10", lb: 35, kg: 15.9, dia: "0.520mm", use: "磯の大型魚" },
];

// Fluorocarbon line strength data
const FLUORO_DATA = [
  { gou: "1", lb: 4, kg: 1.8, use: "ライトゲームリーダー" },
  { gou: "1.5", lb: 6, kg: 2.7, use: "アジング・メバリングリーダー" },
  { gou: "2", lb: 8, kg: 3.6, use: "エギング・シーバスリーダー" },
  { gou: "3", lb: 12, kg: 5.4, use: "シーバス・エギングリーダー" },
  { gou: "4", lb: 16, kg: 7.3, use: "ショアジギングリーダー" },
  { gou: "5", lb: 20, kg: 9.1, use: "ショアジギング・磯リーダー" },
  { gou: "6", lb: 22, kg: 10.0, use: "青物ジギングリーダー" },
  { gou: "8", lb: 30, kg: 13.6, use: "大型青物リーダー" },
];

export default function LineGuidePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "初心者ガイド", href: "/guide" },
          { label: "釣り糸の選び方" },
        ]}
      />
      <Link
        href="/guide"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        ガイド一覧に戻る
      </Link>

      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
        釣り糸（ライン）の選び方ガイド
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
        釣りの成否を分けるのがラインの選択。PE・ナイロン・フロロカーボンの3種類の特徴と、号数ごとの強度・太さを一覧表で解説します。
      </p>

      {/* ライン3種類の比較 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">ラインの種類と特徴</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* PE */}
          <Card className="border-blue-200 py-0">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-blue-600">PE</Badge>
                <span className="text-sm font-bold">ポリエチレン</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-green-700">メリット</p>
                  <ul className="ml-4 list-disc text-muted-foreground">
                    <li>同号数で<strong>最も強い</strong></li>
                    <li>伸びがなく<strong>感度抜群</strong></li>
                    <li>飛距離が出る</li>
                    <li>劣化しにくい</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-700">デメリット</p>
                  <ul className="ml-4 list-disc text-muted-foreground">
                    <li>根ズレ・摩擦に弱い</li>
                    <li><strong>リーダーが必須</strong></li>
                    <li>風に弱い（軽い）</li>
                    <li>価格がやや高い</li>
                  </ul>
                </div>
                <p className="rounded bg-blue-50 p-2 text-xs text-blue-800">
                  向いている釣り: ルアー全般、エギング、ジギング、船釣り
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ナイロン */}
          <Card className="border-amber-200 py-0">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-amber-600">ナイロン</Badge>
                <span className="text-sm font-bold">ポリアミド</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-green-700">メリット</p>
                  <ul className="ml-4 list-disc text-muted-foreground">
                    <li>しなやかで<strong>トラブルが少ない</strong></li>
                    <li>結びやすい</li>
                    <li>適度な伸びで<strong>バラしにくい</strong></li>
                    <li>安価で入手しやすい</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-700">デメリット</p>
                  <ul className="ml-4 list-disc text-muted-foreground">
                    <li>伸びがあり感度が低い</li>
                    <li><strong>紫外線・吸水で劣化</strong></li>
                    <li>同強度ではPEより太い</li>
                    <li>定期的な交換が必要</li>
                  </ul>
                </div>
                <p className="rounded bg-amber-50 p-2 text-xs text-amber-800">
                  向いている釣り: サビキ、投げ釣り、ウキ釣り、初心者全般
                </p>
              </div>
            </CardContent>
          </Card>

          {/* フロロカーボン */}
          <Card className="border-purple-200 py-0">
            <CardContent className="p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="bg-purple-600">フロロ</Badge>
                <span className="text-sm font-bold">フロロカーボン</span>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-green-700">メリット</p>
                  <ul className="ml-4 list-disc text-muted-foreground">
                    <li><strong>根ズレに強い</strong></li>
                    <li>水中で見えにくい</li>
                    <li>伸びが少なく感度良好</li>
                    <li>吸水しない</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-700">デメリット</p>
                  <ul className="ml-4 list-disc text-muted-foreground">
                    <li>硬くて<strong>巻きグセが付く</strong></li>
                    <li>結束強度が出にくい</li>
                    <li>ナイロンよりやや高い</li>
                    <li>ライントラブルが起きやすい</li>
                  </ul>
                </div>
                <p className="rounded bg-purple-50 p-2 text-xs text-purple-800">
                  向いている釣り: PEのリーダー、バス釣り、磯のハリス
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* PE号数×強度表 */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-bold">PEラインの号数と強度</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          PEラインは4本編み・8本編みで強度が若干異なります。下記は標準的な4本編みの目安値です。
        </p>
        <Card className="py-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-blue-50">
                  <th className="px-3 py-2.5 text-left font-bold">号数</th>
                  <th className="px-3 py-2.5 text-right font-bold">強度 (lb)</th>
                  <th className="px-3 py-2.5 text-right font-bold">強度 (kg)</th>
                  <th className="px-3 py-2.5 text-left font-bold">主な用途</th>
                </tr>
              </thead>
              <tbody>
                {PE_DATA.map((row) => (
                  <tr key={row.gou} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{row.gou}号</td>
                    <td className="px-3 py-2 text-right">{row.lb}lb</td>
                    <td className="px-3 py-2 text-right font-medium text-blue-700">{row.kg}kg</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <p className="mt-2 text-xs text-muted-foreground">
          ※ 8本編みは4本編みより約10〜15%強度が高くなります。実用強度は結び目で70〜80%に低下します。
        </p>
      </section>

      {/* ナイロン号数×強度表 */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-bold">ナイロンラインの号数と強度</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          ナイロンは「号数 = 太さ」が決まっており、メーカー間のバラつきが少ないのが特徴です。
        </p>
        <Card className="py-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-amber-50">
                  <th className="px-3 py-2.5 text-left font-bold">号数</th>
                  <th className="px-3 py-2.5 text-right font-bold">強度 (lb)</th>
                  <th className="px-3 py-2.5 text-right font-bold">強度 (kg)</th>
                  <th className="px-3 py-2.5 text-center font-bold">直径</th>
                  <th className="px-3 py-2.5 text-left font-bold">主な用途</th>
                </tr>
              </thead>
              <tbody>
                {NYLON_DATA.map((row) => (
                  <tr key={row.gou} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{row.gou}号</td>
                    <td className="px-3 py-2 text-right">{row.lb}lb</td>
                    <td className="px-3 py-2 text-right font-medium text-amber-700">{row.kg}kg</td>
                    <td className="px-3 py-2 text-center text-xs">{row.dia}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* フロロカーボン号数×強度表 */}
      <section className="mb-10">
        <h2 className="mb-2 text-xl font-bold">フロロカーボンラインの号数と強度</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          フロロカーボンはPEラインのリーダー（ショックリーダー）としてもよく使われます。
        </p>
        <Card className="py-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-purple-50">
                  <th className="px-3 py-2.5 text-left font-bold">号数</th>
                  <th className="px-3 py-2.5 text-right font-bold">強度 (lb)</th>
                  <th className="px-3 py-2.5 text-right font-bold">強度 (kg)</th>
                  <th className="px-3 py-2.5 text-left font-bold">主な用途</th>
                </tr>
              </thead>
              <tbody>
                {FLUORO_DATA.map((row) => (
                  <tr key={row.gou} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{row.gou}号</td>
                    <td className="px-3 py-2 text-right">{row.lb}lb</td>
                    <td className="px-3 py-2 text-right font-medium text-purple-700">{row.kg}kg</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* 太さの選び方 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">ラインの太さの選び方</h2>
        <div className="space-y-4">
          <Card className="border-green-200 py-0">
            <CardContent className="p-4 sm:p-5">
              <h3 className="mb-2 font-bold text-green-800">細いラインのメリット・デメリット</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm font-medium text-green-700">メリット</p>
                  <ul className="ml-4 list-disc text-sm text-muted-foreground">
                    <li>飛距離が伸びる</li>
                    <li>水中抵抗が少なく仕掛けが自然に漂う</li>
                    <li>魚に警戒されにくい</li>
                    <li>感度が良い（アタリがわかりやすい）</li>
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-red-700">デメリット</p>
                  <ul className="ml-4 list-disc text-sm text-muted-foreground">
                    <li>大物がかかると切れるリスク</li>
                    <li>根掛かりで仕掛けごとロストしやすい</li>
                    <li>風や潮の影響を受けやすい（PEの場合）</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 py-0">
            <CardContent className="p-4 sm:p-5">
              <h3 className="mb-2 font-bold text-orange-800">太いラインのメリット・デメリット</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm font-medium text-green-700">メリット</p>
                  <ul className="ml-4 list-disc text-sm text-muted-foreground">
                    <li>大物にも対応できる安心感</li>
                    <li>根ズレに強く仕掛けロストが少ない</li>
                    <li>初心者でもライン切れの心配が少ない</li>
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-red-700">デメリット</p>
                  <ul className="ml-4 list-disc text-sm text-muted-foreground">
                    <li>飛距離が落ちる</li>
                    <li>仕掛けが不自然になり食いが悪くなる</li>
                    <li>水中で目立って魚に警戒される</li>
                    <li>リールに巻ける量が減る</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 釣り方別おすすめ */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">釣り方別おすすめライン</h2>
        <div className="space-y-3">
          {[
            { method: "サビキ釣り", line: "ナイロン 3〜4号", reason: "トラブルが少なく初心者に最適。安価で交換もしやすい。" },
            { method: "ちょい投げ", line: "ナイロン 2〜3号", reason: "しなやかで飛距離が出やすい。PEなら0.8〜1号。" },
            { method: "投げ釣り（本格）", line: "PE 0.8〜1.5号 + フロロリーダー", reason: "飛距離を最大化。テーパーライン（力糸）も有効。" },
            { method: "ウキフカセ釣り", line: "ナイロン 1.5〜3号", reason: "潮に乗せて自然に流すため、しなやかなナイロンが最適。" },
            { method: "エギング", line: "PE 0.6〜0.8号 + フロロリーダー2〜3号", reason: "シャクリの感度とイカのジェット噴射に耐えるバランス。" },
            { method: "シーバス", line: "PE 0.8〜1.2号 + フロロリーダー3〜5号", reason: "感度と強度のバランス。エラ洗いによるラインブレイクを防ぐ。" },
            { method: "ショアジギング", line: "PE 1.0〜2.0号 + フロロリーダー5〜8号", reason: "青物の引きに耐える強度。根ズレ対策にリーダーは太めに。" },
            { method: "アジング・メバリング", line: "PE 0.3〜0.4号 or フロロ 1〜2号", reason: "繊細なアタリを取るため極細ラインが必須。" },
            { method: "穴釣り", line: "フロロ 3〜4号", reason: "根ズレに強いフロロが最適。障害物周りでもラインが切れにくい。" },
          ].map(({ method, line, reason }) => (
            <div
              key={method}
              className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-2 sm:w-40 shrink-0">
                <Badge variant="outline" className="text-xs shrink-0">{method}</Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{line}</p>
                <p className="text-xs text-muted-foreground">{reason}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PE号数の比較（同じ強度でどれだけ差があるか） */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">PE vs ナイロン - 同強度での太さ比較</h2>
        <Card className="py-0">
          <CardContent className="p-4 sm:p-5">
            <p className="mb-3 text-sm text-muted-foreground">
              同じ約7kgの引っ張り強度を得るのに必要な号数の違い：
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-blue-600">PEライン</p>
                <p className="text-3xl font-bold text-blue-700">0.8号</p>
                <p className="text-xs text-muted-foreground">直径 約0.15mm</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-4">
                <p className="text-xs text-amber-600">ナイロンライン</p>
                <p className="text-3xl font-bold text-amber-700">4号</p>
                <p className="text-xs text-muted-foreground">直径 約0.33mm</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              PEラインはナイロンの約1/2の太さで同じ強度を実現。飛距離と感度で圧倒的に有利です。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* おすすめライン */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">おすすめライン</h2>
        <Card className="border-blue-200 py-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Badge className="mb-2 bg-blue-600">編集部おすすめ</Badge>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  初心者からベテランまで幅広く使える万能PEライン。コスパが良く、最初の1本におすすめです。
                </p>
              </div>
              <a
                href="https://amzn.to/408jI1f"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF9900] px-6 py-3 text-sm font-bold text-white shadow transition-all hover:bg-[#e88b00] hover:shadow-md active:scale-95 min-h-[44px]"
              >
                Amazonで見る &rarr;
              </a>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              ※ 上記はアフィリエイトリンクです。購入による追加費用は発生しません。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ライン交換の目安 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">ライン交換の目安</h2>
        <div className="space-y-2">
          {[
            { type: "ナイロン", period: "3〜6ヶ月", note: "紫外線と吸水で劣化。白っぽくなったり、巻きグセが強くなったら交換時期。" },
            { type: "フロロカーボン", period: "6ヶ月〜1年", note: "ナイロンより劣化しにくいが、キズが入ったら即交換。" },
            { type: "PE", period: "1〜2年", note: "色落ちや毛羽立ちが出たら交換。先端の傷んだ部分をカットしながら使える。" },
          ].map(({ type, period, note }) => (
            <div key={type} className="flex items-start gap-3 rounded-lg border p-3">
              <Info className="size-4 shrink-0 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">
                  <strong>{type}</strong>: {period}
                </p>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 関連ガイド */}
      <section>
        <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/guide/knots">
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold hover:text-primary">釣り糸の結び方</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  ユニノット・クリンチノット・電車結びを解説
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/guide/rigs">
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold hover:text-primary">仕掛けの作り方</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  サビキ・ウキ・投げ・ルアーの仕掛け図解
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/guide/sabiki">
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold hover:text-primary">サビキ釣り入門</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  ファミリーで楽しむサビキ釣りの始め方
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/guide/setup">
            <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold hover:text-primary">タックルの選び方</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  竿とリールの基本的な選び方を解説
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
