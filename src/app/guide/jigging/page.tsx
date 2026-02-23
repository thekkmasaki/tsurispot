import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Zap, Settings, Target, ShieldAlert, Fish } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ショアジギング入門ガイド - メタルジグで青物を狙う",
  description:
    "ショアジギング初心者のための入門ガイド。メタルジグの選び方（重さ・カラー）、ロッドとリールの選び方、キャスト方法とアクション、青物の取り込み方、磯場での安全対策を詳しく解説。",
  openGraph: {
    title: "ショアジギング入門ガイド - メタルジグで青物を狙う",
    description:
      "メタルジグの選び方からアクション、安全対策まで初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/jigging",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/jigging",
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
      name: "釣りの始め方ガイド",
      item: "https://tsurispot.com/guide",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "ショアジギング入門ガイド",
      item: "https://tsurispot.com/guide/jigging",
    },
  ],
};

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          {Icon && <Icon className="size-5 text-primary" />}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
      <span className="font-medium">ヒント：</span>
      {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span className="font-medium">注意：</span>
      {children}
    </div>
  );
}

function Danger({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
      <span className="font-medium">危険：</span>
      {children}
    </div>
  );
}

function OnePitchJerkDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 580 300"
        width="100%"
        style={{ maxWidth: 580 }}
        aria-label="ワンピッチジャークのアクション図：竿の上げ、リール巻き、フォールの繰り返し動作"
        role="img"
      >
        <rect width="580" height="300" rx="12" fill="#EFF6FF" />
        <text x="290" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">ワンピッチジャークのアクション</text>

        {/* 水面 */}
        <line x1="30" y1="60" x2="550" y2="60" stroke="#60A5FA" strokeWidth="2" />
        <text x="25" y="55" fontSize="10" fill="#3B82F6">水面</text>

        {/* 海底 */}
        <path d="M30,260 Q150,250 280,260 Q400,270 550,258" stroke="#D1A97A" strokeWidth="2" fill="#FEF3C7" opacity="0.4" />

        {/* Phase 1: 着底 */}
        <g>
          {/* ジグ */}
          <rect x="50" y="248" width="8" height="20" rx="2" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
          <text x="54" y="285" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6B7280">着底</text>
        </g>

        {/* Phase 2: ジャーク1 (上げ) */}
        <g>
          {/* 上向き矢印（ジグの動き） */}
          <path d="M54,248 L100,180" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowJigUp)" />
          <rect x="96" y="170" width="8" height="20" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          {/* 竿アイコン */}
          <g transform="translate(90,80)">
            <line x1="0" y1="30" x2="0" y2="0" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M-8,30 L8,30" stroke="#6B7280" strokeWidth="2" />
            <path d="M-5,35 L5,35" stroke="#6B7280" strokeWidth="1.5" />
            <text x="0" y="50" textAnchor="middle" fontSize="9" fill="#EF4444" fontWeight="bold">しゃくる</text>
          </g>
        </g>

        {/* Phase 3: リール1回転 + フォール */}
        <g>
          <path d="M100,180 Q130,160 160,210" stroke="#22C55E" strokeWidth="2.5" strokeDasharray="5,3" />
          <rect x="156" y="200" width="8" height="20" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          {/* リールアイコン */}
          <g transform="translate(140,80)">
            <circle cx="0" cy="15" r="10" fill="none" stroke="#22C55E" strokeWidth="2" />
            <path d="M0,5 L7,15 L0,25 L-7,15 Z" fill="none" stroke="#22C55E" strokeWidth="1.5" />
            <text x="0" y="40" textAnchor="middle" fontSize="9" fill="#22C55E" fontWeight="bold">1回転巻く</text>
          </g>
        </g>

        {/* Phase 4: ジャーク2 (上げ) */}
        <g>
          <path d="M160,210 L210,140" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowJigUp)" />
          <rect x="206" y="130" width="8" height="20" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <g transform="translate(200,80)">
            <line x1="0" y1="30" x2="0" y2="0" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M-8,30 L8,30" stroke="#6B7280" strokeWidth="2" />
            <text x="0" y="50" textAnchor="middle" fontSize="9" fill="#EF4444" fontWeight="bold">しゃくる</text>
          </g>
        </g>

        {/* Phase 5: リール1回転 + フォール */}
        <g>
          <path d="M210,140 Q240,120 270,175" stroke="#22C55E" strokeWidth="2.5" strokeDasharray="5,3" />
          <rect x="266" y="165" width="8" height="20" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <g transform="translate(250,80)">
            <circle cx="0" cy="15" r="10" fill="none" stroke="#22C55E" strokeWidth="2" />
            <path d="M0,5 L7,15 L0,25 L-7,15 Z" fill="none" stroke="#22C55E" strokeWidth="1.5" />
            <text x="0" y="40" textAnchor="middle" fontSize="9" fill="#22C55E" fontWeight="bold">1回転巻く</text>
          </g>
        </g>

        {/* Phase 6: ジャーク3 (上げ) */}
        <g>
          <path d="M270,175 L320,110" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowJigUp)" />
          <rect x="316" y="100" width="8" height="20" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        </g>

        {/* リピート矢印 */}
        <g>
          <path d="M330,100 Q380,80 410,120 Q440,160 430,180" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4,3" />
          <text x="400" y="85" fontSize="10" fill="#3B82F6" fontWeight="bold">繰り返す</text>
        </g>

        {/* 凡例 */}
        <g transform="translate(400,140)">
          <rect x="0" y="0" width="155" height="120" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />
          <text x="78" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E3A5F">ポイント</text>
          <line x1="10" y1="35" x2="35" y2="35" stroke="#EF4444" strokeWidth="2.5" />
          <text x="40" y="39" fontSize="10" fill="#374151">ジャーク(しゃくり)</text>
          <line x1="10" y1="55" x2="35" y2="55" stroke="#22C55E" strokeWidth="2.5" strokeDasharray="5,3" />
          <text x="40" y="59" fontSize="10" fill="#374151">フォール(沈下)</text>
          <text x="78" y="80" textAnchor="middle" fontSize="9" fill="#6B7280">1ジャーク = 1回転</text>
          <text x="78" y="95" textAnchor="middle" fontSize="9" fill="#6B7280">リズミカルに繰り返す</text>
          <text x="78" y="110" textAnchor="middle" fontSize="9" fill="#6B7280">ジグを躍らせるイメージ</text>
        </g>

        <defs>
          <marker id="arrowJigUp" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#EF4444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function ShoreJiggingPointDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 320"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="ショアジギングのポイント図：堤防から沖へキャストし、表層・中層・底層の各レンジを攻略する方法"
        role="img"
      >
        <rect width="600" height="320" rx="12" fill="#EFF6FF" />
        <text x="300" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">ショアジギングのポイントとレンジ</text>

        {/* 空 */}
        <rect x="0" y="35" width="600" height="45" rx="0" fill="#DBEAFE" opacity="0.3" />

        {/* 水面 */}
        <path d="M0,80 Q50,75 100,80 Q150,85 200,80 Q250,75 300,80 Q350,85 400,80 Q450,75 500,80 Q550,85 600,80" stroke="#60A5FA" strokeWidth="2" fill="none" />

        {/* 水域（グラデーション的に深くなる） */}
        <rect x="150" y="80" width="450" height="45" fill="#DBEAFE" opacity="0.3" />
        <rect x="150" y="125" width="450" height="55" fill="#93C5FD" opacity="0.25" />
        <rect x="150" y="180" width="450" height="70" fill="#60A5FA" opacity="0.2" />

        {/* 海底 */}
        <path d="M150,250 Q250,245 350,255 Q450,260 550,248 L600,250 L600,320 L150,320 Z" fill="#FEF3C7" opacity="0.5" />
        <path d="M150,250 Q250,245 350,255 Q450,260 550,248" stroke="#D1A97A" strokeWidth="2" fill="none" />

        {/* 堤防 */}
        <rect x="0" y="65" width="160" height="255" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2" />
        <rect x="0" y="55" width="170" height="15" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
        <text x="80" y="150" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#6B7280">堤防</text>

        {/* 釣り人 */}
        <g transform="translate(130,30)">
          <circle cx="0" cy="0" r="7" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="0" y1="7" x2="0" y2="25" stroke="#3B82F6" strokeWidth="2" />
          <line x1="0" y1="25" x2="-8" y2="37" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="0" y1="25" x2="8" y2="37" stroke="#3B82F6" strokeWidth="1.5" />
          {/* 竿 */}
          <line x1="0" y1="12" x2="40" y2="-15" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* キャスト方向矢印 */}
        <path d="M170,55 Q300,20 470,80" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="6,3" markerEnd="url(#arrowCastJig)" />
        <text x="310" y="40" textAnchor="middle" fontSize="11" fill="#3B82F6" fontWeight="bold">キャスト</text>

        {/* レンジ表示 */}
        {/* 表層 */}
        <g>
          <rect x="410" y="85" width="70" height="30" rx="4" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="445" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#F59E0B">表層</text>
          {/* ジグ */}
          <rect x="395" y="92" width="6" height="14" rx="2" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <text x="500" y="96" fontSize="9" fill="#6B7280">ファスト</text>
          <text x="500" y="108" fontSize="9" fill="#6B7280">リトリーブ</text>
        </g>

        {/* 中層 */}
        <g>
          <rect x="350" y="140" width="70" height="30" rx="4" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5" />
          <text x="385" y="159" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3B82F6">中層</text>
          <rect x="335" y="147" width="6" height="14" rx="2" fill="#3B82F6" stroke="#2563EB" strokeWidth="1" />
          <text x="440" y="151" fontSize="9" fill="#6B7280">ワンピッチ</text>
          <text x="440" y="163" fontSize="9" fill="#6B7280">ジャーク</text>
        </g>

        {/* 底層 */}
        <g>
          <rect x="280" y="210" width="70" height="30" rx="4" fill="#FFFFFF" stroke="#22C55E" strokeWidth="1.5" />
          <text x="315" y="229" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#22C55E">底層</text>
          <rect x="265" y="217" width="6" height="14" rx="2" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
          <text x="370" y="221" fontSize="9" fill="#6B7280">ボトムバンプ</text>
          <text x="370" y="233" fontSize="9" fill="#6B7280">/ スロージャーク</text>
        </g>

        {/* ジグの軌道（沈下） */}
        <path d="M470,85 Q440,140 350,245" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x="460" y="170" fontSize="9" fill="#9CA3AF">沈下</text>

        {/* 青物アイコン */}
        <g transform="translate(250,130)">
          <ellipse cx="0" cy="0" rx="14" ry="7" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1.5" />
          <polygon points="14,0 22,-5 22,5" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1" />
          <circle cx="-7" cy="-2" r="2" fill="#1F2937" />
        </g>
        <g transform="translate(450,165)">
          <ellipse cx="0" cy="0" rx="12" ry="6" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1.5" />
          <polygon points="12,0 18,-4 18,4" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1" />
          <circle cx="-6" cy="-1" r="1.5" fill="#1F2937" />
        </g>

        {/* 下部の注釈 */}
        <text x="400" y="285" textAnchor="middle" fontSize="10" fill="#6B7280">朝マズメは表層〜中層、日中は中層〜底層を重点的に攻める</text>
        <text x="400" y="300" textAnchor="middle" fontSize="10" fill="#6B7280">まずは底まで沈めてから巻き上げるのが基本</text>

        <defs>
          <marker id="arrowCastJig" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#3B82F6" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function JiggingGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* パンくず */}
        <div className="mb-6">
          <Link
            href="/guide"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 size-4" />
            釣りの始め方ガイドに戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            ショアジギング入門ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            岸（ショア）からメタルジグで青物を狙う、ダイナミックな釣りを始めましょう。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">ショアジギングとは：</span>
          岸（ショア）からメタルジグを遠投し、ブリやカンパチなどの青物を狙う釣り方。船に乗らずに大物と勝負できる、アクティブでエキサイティングな釣りスタイルです。体力を使いますが、その分ヒットした時の興奮は格別です。
        </div>

        <div className="space-y-6">
          {/* メタルジグの選び方 */}
          <SectionCard title="メタルジグの選び方" icon={Zap}>
            <p className="mb-4 text-sm text-muted-foreground">
              メタルジグは重さ、形状、カラーによって飛距離やアクションが変わります。状況に応じた選び方を覚えましょう。
            </p>

            <h3 className="mb-3 font-medium text-foreground">重さの選び方</h3>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">20〜30g（ライトショアジギング）</span>
                  &nbsp;&mdash;&nbsp;堤防からのお手軽スタイル。小〜中型青物やカマス、サゴシなどに。シーバスロッドでも使用可能。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">30〜60g（ショアジギング）</span>
                  &nbsp;&mdash;&nbsp;標準的な重さ。飛距離と操作性のバランスが良く、最も汎用性が高い。ブリ（イナダ・ワラサ）やカンパチに。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">60〜100g（ヘビーショアジギング）</span>
                  &nbsp;&mdash;&nbsp;磯場や潮流の速い場所で使う重量級。大型青物を狙う上級者向け。専用のパワーロッドが必要です。
                </span>
              </div>
            </div>

            <h3 className="mb-3 font-medium text-foreground">カラーの選び方</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">シルバー系（イワシカラー）</span>
                  &nbsp;&mdash;&nbsp;万能カラー。晴天・クリアウォーターで特に有効。まず一つ選ぶならこれ。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ブルー・ピンク系</span>
                  &nbsp;&mdash;&nbsp;アピール力が強く、曇天や朝夕のマズメ時に効果的。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ゴールド・アカキン系</span>
                  &nbsp;&mdash;&nbsp;濁りが入った水や、光量が少ない時に存在感を発揮。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">グロー（蓄光）系</span>
                  &nbsp;&mdash;&nbsp;深場やローライト時に有効。光を蓄えて発光するため視認性が高い。
                </span>
              </div>
            </div>

            <Hint>
              最初はシルバー系の40gを2〜3個用意するのがおすすめ。根がかり（ジグが岩に引っかかること）でロストすることもあるため、予備は必須です。
            </Hint>
          </SectionCard>

          {/* ロッドとリールの選び方 */}
          <SectionCard title="ロッドとリールの選び方" icon={Settings}>
            <p className="mb-4 text-sm text-muted-foreground">
              ショアジギングは体力を使う釣りなので、軽くて丈夫なタックルを選ぶことが大切です。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ロッドの選び方</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>長さ：9〜10フィート（約2.7〜3m）が標準。遠投と操作性のバランスが良い</li>
                  <li>硬さ：M（ミディアム）〜MH（ミディアムヘビー）。40gのジグを快適に投げられるパワー</li>
                  <li>種類：ショアジギング専用ロッドが理想。シーバスロッドでもライトショアジギングなら対応可能</li>
                  <li>素材：カーボン製で軽量なものを選ぶ。一日中しゃくるため、軽さは重要</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">リールの選び方</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>番手：4000〜5000番のスピニングリール。ライトなら3000番でもOK</li>
                  <li>ギア比：ハイギア（HG）がおすすめ。糸の回収が速く、ジグ操作がしやすい</li>
                  <li>ドラグ力：最大ドラグ8kg以上。大型青物の走りに対応できる強さが必要</li>
                  <li>ライン：PEライン1.5〜2号を200m以上巻ける容量</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ラインシステム</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>メインライン：PEライン1.5〜2号（200〜300m）</li>
                  <li>リーダー：フロロカーボン30〜40lb（6〜8号）を1〜1.5m</li>
                  <li>接続：FGノットまたはPRノットで結束。強度の高い結び方が必須</li>
                </ul>
              </div>
            </div>

            <Warning>
              PEラインとリーダーの結束が弱いと、大物がかかった時にラインブレイク（糸切れ）します。FGノットを練習して確実にマスターしましょう。
            </Warning>
          </SectionCard>

          {/* キャスト方法とアクション */}
          <SectionCard title="キャスト方法とアクション" icon={Target}>
            <h3 className="mb-3 font-medium text-foreground">キャスト（投げ方）</h3>
            <ol className="mb-6 list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">周囲の安全を確認</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    後方・左右に人がいないか必ず確認。メタルジグは重いため、人に当たると大怪我になります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">垂らしを調整</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿先からジグまでの糸の長さ（垂らし）を1〜1.5mに調整します。長すぎても短すぎても投げにくくなります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">オーバーヘッドキャスト</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を頭の後ろに構え、体全体を使って前方に振り抜きます。指でラインを押さえ、竿が前方45度あたりに来た時にリリースします。
                  </p>
                </div>
              </li>
            </ol>

            <ShoreJiggingPointDiagram />

            <h3 className="mb-3 font-medium text-foreground">基本アクション</h3>
            <OnePitchJerkDiagram />
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ワンピッチジャーク</h3>
                <p className="text-sm text-muted-foreground">
                  ショアジギングの基本アクション。ロッドを1回しゃくり上げる（ジャーク）と同時にリールを1回転巻く動作を繰り返します。リズミカルにジグを躍らせることで、逃げる小魚を演出します。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ただ巻き</h3>
                <p className="text-sm text-muted-foreground">
                  一定速度でリールを巻くだけのシンプルなアクション。ジグが自然に泳ぐため、魚の活性が低い時や、サワラなど横方向の動きに反応する魚に有効です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">フォール（沈下）</h3>
                <p className="text-sm text-muted-foreground">
                  ジグをキャスト後、着水してから底まで沈ませる間もアタリのチャンス。テンションフォール（糸を張ったまま沈ませる）とフリーフォール（糸を緩めて沈ませる）を使い分けましょう。
                </p>
              </div>
            </div>

            <Hint>
              疲れてきたらアクションが雑になりがち。休憩を挟みつつ、メリハリのあるアクションを心がけましょう。青物は朝マズメに集中的に回遊するため、最初の1〜2時間が勝負です。
            </Hint>
          </SectionCard>

          {/* 青物の取り込み方 */}
          <SectionCard title="青物の取り込み方" icon={Fish}>
            <p className="mb-4 text-sm text-muted-foreground">
              青物がヒットすると、強烈な引きで一気に走ります。落ち着いて対処するためのポイントを押さえましょう。
            </p>

            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">合わせ（フッキング）</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ガツンとアタリがあったら、ロッドを大きく上に立てて合わせます。メタルジグは針の掛かりが浅くなりやすいので、しっかりとした合わせが重要です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">ドラグを活用して走らせる</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    青物は掛かった直後に猛スピードで走ります。無理に止めようとするとラインが切れるため、ドラグ（自動的に糸が出る機構）を適切に調整し、魚の走りを受け止めましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">ポンピングで寄せる</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    魚の走りが止まったら、ロッドを起こして（ポンプ）魚を浮かせ、ロッドを下げながらリールを巻く動作を繰り返します。この「ポンピング」で徐々に魚を寄せます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">タモ（玉網）で掬う</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    足元まで寄せたら、タモ網で掬い上げます。堤防では柄の長いタモが必要（5〜6m）。磯ではギャフ（引っかけ棒）を使うこともあります。一人の場合は片手でロッド、片手でタモを操作します。
                  </p>
                </div>
              </li>
            </ol>

            <Warning>
              青物がヒットしたら周囲の釣り人に「かかりました！」と声をかけましょう。隣の人の仕掛けと絡まる（お祭りする）のを防ぐためです。
            </Warning>
          </SectionCard>

          {/* 安全対策 */}
          <SectionCard title="安全対策（磯場での注意点）" icon={ShieldAlert}>
            <p className="mb-4 text-sm text-muted-foreground">
              ショアジギングは堤防だけでなく、磯場で行うことも多い釣りです。磯場は大物が狙える反面、危険も伴います。安全対策を徹底しましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ライフジャケット着用は絶対</span>
                  &nbsp;&mdash;&nbsp;磯場では落水のリスクが常にあります。膨張式ではなく、フローティングベスト（固形浮力体タイプ）がおすすめです。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">磯靴（スパイクシューズ）を履く</span>
                  &nbsp;&mdash;&nbsp;磯場は海藻やコケで非常に滑りやすい。フェルトスパイクの磯靴が必須です。スニーカーやサンダルは厳禁。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">波に背を向けない</span>
                  &nbsp;&mdash;&nbsp;常に海に目を向け、大波（うねり）に注意。「セット波」と呼ばれる周期的に来る大波に足をすくわれる事故が後を絶ちません。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">単独行動を避ける</span>
                  &nbsp;&mdash;&nbsp;磯では必ず二人以上で行動し、お互いの安全を確認し合いましょう。携帯電話の電波が届くか事前に確認を。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">天候を必ずチェック</span>
                  &nbsp;&mdash;&nbsp;風速7m/s以上、波高2m以上の日は磯への立ち入りを中止しましょう。天気が急変した場合は速やかに撤退してください。
                </span>
              </div>
            </div>

            <Danger>
              「濡れている場所には絶対に立たない」が磯の鉄則。波しぶきで濡れている場所は、次の大波で水没する可能性があります。命に関わるため、安全マージンを十分に取りましょう。
            </Danger>
          </SectionCard>
        </div>

        {/* 関連ガイド */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guide/lure" className="text-primary hover:underline">
                    ルアー釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ルアーフィッシングの基本をおさらい</span>
                </li>
                <li>
                  <Link href="/guide/knots" className="text-primary hover:underline">
                    釣り糸の結び方
                  </Link>
                  <span className="text-muted-foreground"> - FGノットなどの強力な結び方</span>
                </li>
                <li>
                  <Link href="/guide/fish-handling" className="text-primary hover:underline">
                    釣った魚の持ち帰り方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 大型青物の締め方と持ち帰り方</span>
                </li>
                <li>
                  <Link href="/guide/tide" className="text-primary hover:underline">
                    潮汐の読み方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 青物が回遊しやすい潮のタイミング</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            釣った青物を美味しく持ち帰る方法も確認しましょう。
          </p>
          <Link
            href="/guide/fish-handling"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            釣った魚の持ち帰り方ガイドへ
          </Link>
        </div>
      {/* LINE登録バナー */}
      <div className="mt-8 sm:mt-12">
        <LineBanner variant="compact" />
      </div>
      </main>
    </>
  );
}
