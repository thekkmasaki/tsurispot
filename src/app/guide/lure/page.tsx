import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Fish, Target, Zap, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ルアー釣り入門ガイド - ルアーの種類・選び方・アクションを解説",
  description:
    "ルアー釣り初心者のための完全ガイド。ミノー・バイブレーション・ワーム・メタルジグなどルアーの種類、ターゲット魚種別の選び方、ただ巻き・トゥイッチ・リフト＆フォールなどアクションの付け方を解説。",
  openGraph: {
    title: "ルアー釣り入門ガイド - ルアーの種類・選び方・アクションを解説",
    description:
      "ルアーの種類・選び方・アクションの基本を初心者向けにわかりやすく解説。",
    type: "article",
    url: "https://tsurispot.com/guide/lure",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/lure",
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
      name: "ルアー釣り入門ガイド",
      item: "https://tsurispot.com/guide/lure",
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

function LureTypesDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 580 340"
        width="100%"
        style={{ maxWidth: 580 }}
        aria-label="ルアーの種類図：ミノー、バイブレーション、ワーム、メタルジグ、スプーンの簡略シルエットと用途"
        role="img"
      >
        <rect width="580" height="340" rx="12" fill="#EFF6FF" />
        <text x="290" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">ルアーの種類と特徴</text>

        {/* ミノー */}
        <g transform="translate(20,50)">
          <rect x="0" y="0" width="165" height="120" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="82" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3B82F6">ミノー</text>
          {/* ミノーのシルエット */}
          <g transform="translate(30,30)">
            {/* ボディ */}
            <ellipse cx="50" cy="20" rx="40" ry="12" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1.5" />
            {/* リップ */}
            <path d="M10,20 L-5,28 L-5,20 Z" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
            {/* 目 */}
            <circle cx="22" cy="17" r="4" fill="#FFFFFF" stroke="#374151" strokeWidth="1" />
            <circle cx="22" cy="17" r="2" fill="#374151" />
            {/* 尾 */}
            <polygon points="90,20 100,13 100,27" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1" />
            {/* 針 */}
            <path d="M35,32 L35,42 Q38,48 32,45" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
            <path d="M65,32 L65,42 Q68,48 62,45" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
          </g>
          <text x="82" y="85" textAnchor="middle" fontSize="10" fill="#6B7280">リップで水中に潜る</text>
          <text x="82" y="98" textAnchor="middle" fontSize="10" fill="#6B7280">表層〜中層向け</text>
          <text x="82" y="113" textAnchor="middle" fontSize="9" fill="#3B82F6">シーバス・ヒラメ</text>
        </g>

        {/* バイブレーション */}
        <g transform="translate(205,50)">
          <rect x="0" y="0" width="165" height="120" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="82" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F59E0B">バイブレーション</text>
          {/* バイブレーションのシルエット */}
          <g transform="translate(35,30)">
            {/* ボディ（リップなし、幅広） */}
            <path d="M10,10 Q50,-5 90,10 Q95,20 90,30 Q50,45 10,30 Q5,20 10,10 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
            {/* 目 */}
            <circle cx="25" cy="18" r="3.5" fill="#FFFFFF" stroke="#374151" strokeWidth="1" />
            <circle cx="25" cy="18" r="1.5" fill="#374151" />
            {/* 振動マーク */}
            <path d="M95,15 L100,12" stroke="#D97706" strokeWidth="1" />
            <path d="M95,20 L102,20" stroke="#D97706" strokeWidth="1" />
            <path d="M95,25 L100,28" stroke="#D97706" strokeWidth="1" />
            {/* 針 */}
            <path d="M40,32 L40,42 Q43,48 37,45" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
          </g>
          <text x="82" y="85" textAnchor="middle" fontSize="10" fill="#6B7280">ブルブル震える動き</text>
          <text x="82" y="98" textAnchor="middle" fontSize="10" fill="#6B7280">中層〜底層向け</text>
          <text x="82" y="113" textAnchor="middle" fontSize="9" fill="#F59E0B">シーバス・クロダイ</text>
        </g>

        {/* ワーム */}
        <g transform="translate(390,50)">
          <rect x="0" y="0" width="165" height="120" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="82" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#22C55E">ワーム</text>
          {/* ワームのシルエット */}
          <g transform="translate(25,35)">
            {/* ジグヘッド */}
            <circle cx="15" cy="15" r="8" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
            {/* 針 */}
            <path d="M15,23 Q20,35 10,30" stroke="#6B7280" strokeWidth="1.5" fill="none" />
            {/* ワーム本体 */}
            <path d="M23,15 Q50,8 70,15 Q85,18 100,12 Q108,10 115,15" stroke="#22C55E" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* 尻尾のカール */}
            <path d="M115,15 Q120,20 115,25 Q110,28 108,22" stroke="#22C55E" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <text x="82" y="85" textAnchor="middle" fontSize="10" fill="#6B7280">ナチュラルな動き</text>
          <text x="82" y="98" textAnchor="middle" fontSize="10" fill="#6B7280">全レンジ対応</text>
          <text x="82" y="113" textAnchor="middle" fontSize="9" fill="#22C55E">アジ・メバル・カサゴ</text>
        </g>

        {/* メタルジグ */}
        <g transform="translate(80,190)">
          <rect x="0" y="0" width="165" height="120" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="82" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#EF4444">メタルジグ</text>
          {/* メタルジグのシルエット */}
          <g transform="translate(45,28)">
            {/* ボディ（細長い金属） */}
            <path d="M10,0 L65,0 Q75,15 65,30 L10,30 Q0,15 10,0 Z" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* 光の反射 */}
            <line x1="20" y1="5" x2="25" y2="25" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
            <line x1="35" y1="5" x2="40" y2="25" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />
            {/* アイ */}
            <circle cx="10" cy="15" r="3" fill="none" stroke="#6B7280" strokeWidth="1.5" />
            {/* 針（アシストフック） */}
            <path d="M10,5 L5,-5 Q0,-10 -3,-5" stroke="#EF4444" strokeWidth="1.5" fill="none" />
            <path d="M65,25 L70,35 Q73,40 68,38" stroke="#EF4444" strokeWidth="1.5" fill="none" />
          </g>
          <text x="82" y="80" textAnchor="middle" fontSize="10" fill="#6B7280">金属製で遠投可能</text>
          <text x="82" y="93" textAnchor="middle" fontSize="10" fill="#6B7280">底〜全レンジ</text>
          <text x="82" y="108" textAnchor="middle" fontSize="9" fill="#EF4444">ブリ・サワラ・ヒラメ</text>
        </g>

        {/* スプーン */}
        <g transform="translate(325,190)">
          <rect x="0" y="0" width="165" height="120" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="82" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#A855F7">スプーン</text>
          {/* スプーンのシルエット */}
          <g transform="translate(40,28)">
            {/* ボディ（楕円の板） */}
            <ellipse cx="40" cy="15" rx="35" ry="13" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
            {/* カーブ表現 */}
            <path d="M15,10 Q40,5 65,10" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" fill="none" />
            {/* 光の反射 */}
            <ellipse cx="30" cy="12" rx="8" ry="4" fill="#FFFFFF" opacity="0.4" />
            {/* アイ */}
            <circle cx="5" cy="15" r="3" fill="none" stroke="#6B7280" strokeWidth="1.5" />
            {/* 針 */}
            <path d="M75,15 L80,25 Q83,30 78,28" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
          </g>
          <text x="82" y="80" textAnchor="middle" fontSize="10" fill="#6B7280">ひらひら揺れる動き</text>
          <text x="82" y="93" textAnchor="middle" fontSize="10" fill="#6B7280">中層〜底層</text>
          <text x="82" y="108" textAnchor="middle" fontSize="9" fill="#A855F7">トラウト・シーバス</text>
        </g>
      </svg>
    </div>
  );
}

function RetrieveSpeedDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 550 300"
        width="100%"
        style={{ maxWidth: 550 }}
        aria-label="リトリーブスピードと水深の関係図：ファストで表層、ミディアムで中層、スローで底層を攻める"
        role="img"
      >
        <rect width="550" height="300" rx="12" fill="#EFF6FF" />
        <text x="275" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">リトリーブスピードと攻めるレンジ</text>

        {/* 水面 */}
        <line x1="120" y1="55" x2="530" y2="55" stroke="#60A5FA" strokeWidth="2" />
        <text x="115" y="58" textAnchor="end" fontSize="10" fill="#3B82F6">水面</text>

        {/* 水深の帯 */}
        <rect x="120" y="55" width="410" height="60" fill="#DBEAFE" opacity="0.2" />
        <rect x="120" y="115" width="410" height="65" fill="#93C5FD" opacity="0.2" />
        <rect x="120" y="180" width="410" height="65" fill="#3B82F6" opacity="0.15" />

        {/* 海底 */}
        <path d="M120,245 Q250,238 380,248 Q450,255 530,242" stroke="#D1A97A" strokeWidth="2" fill="#FEF3C7" opacity="0.4" />

        {/* 左側のレンジラベル */}
        <text x="115" y="90" textAnchor="end" fontSize="11" fontWeight="bold" fill="#F59E0B">表層</text>
        <text x="115" y="150" textAnchor="end" fontSize="11" fontWeight="bold" fill="#3B82F6">中層</text>
        <text x="115" y="215" textAnchor="end" fontSize="11" fontWeight="bold" fill="#22C55E">底層</text>

        {/* ファスト リトリーブ（表層） */}
        <g>
          <rect x="140" y="65" width="380" height="40" rx="6" fill="#FEF3C7" opacity="0.5" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5,3" />
          {/* ルアーの軌道 */}
          <path d="M160,85 L500,80" stroke="#F59E0B" strokeWidth="2.5" />
          {/* ルアー */}
          <ellipse cx="500" cy="80" rx="10" ry="5" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          {/* 速度矢印 */}
          <path d="M175,78 L210,78" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrowOrangeLure)" />
          <path d="M215,78 L250,78" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrowOrangeLure)" />
          <path d="M255,78 L290,78" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrowOrangeLure)" />
          <text x="340" y="75" fontSize="10" fill="#D97706" fontWeight="bold">ファスト</text>
        </g>

        {/* ミディアム リトリーブ（中層） */}
        <g>
          <rect x="140" y="120" width="380" height="50" rx="6" fill="#DBEAFE" opacity="0.3" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="5,3" />
          {/* ルアーの軌道（少し沈みつつ） */}
          <path d="M160,130 Q330,155 500,140" stroke="#3B82F6" strokeWidth="2.5" />
          <ellipse cx="500" cy="140" rx="10" ry="5" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
          {/* 速度矢印 */}
          <path d="M180,132 L220,137" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowBlueLure)" />
          <path d="M240,139 L280,143" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrowBlueLure)" />
          <text x="340" y="135" fontSize="10" fill="#2563EB" fontWeight="bold">ミディアム</text>
        </g>

        {/* スロー リトリーブ（底層） */}
        <g>
          <rect x="140" y="185" width="380" height="50" rx="6" fill="#DCFCE7" opacity="0.3" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="5,3" />
          {/* ルアーの軌道（底を這う） */}
          <path d="M160,200 Q250,230 340,220 Q420,215 500,225" stroke="#22C55E" strokeWidth="2.5" />
          <ellipse cx="500" cy="225" rx="10" ry="5" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
          {/* 速度矢印 */}
          <path d="M185,208 L215,215" stroke="#22C55E" strokeWidth="2" markerEnd="url(#arrowGreenLure)" />
          <text x="340" y="210" fontSize="10" fill="#16A34A" fontWeight="bold">スロー</text>
        </g>

        {/* 右側のまとめ */}
        <g transform="translate(130,255)">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#F59E0B" strokeWidth="3" />
          <text x="25" y="4" fontSize="10" fill="#374151">ファスト: 速く巻く → 表層をキープ</text>
        </g>
        <g transform="translate(130,273)">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#3B82F6" strokeWidth="3" />
          <text x="25" y="4" fontSize="10" fill="#374151">ミディアム: 中速 → 中層を通す</text>
        </g>
        <g transform="translate(130,291)">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#22C55E" strokeWidth="3" />
          <text x="25" y="4" fontSize="10" fill="#374151">スロー: ゆっくり巻く → 底層をじっくり攻める</text>
        </g>

        <defs>
          <marker id="arrowOrangeLure" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#F59E0B" />
          </marker>
          <marker id="arrowBlueLure" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#3B82F6" />
          </marker>
          <marker id="arrowGreenLure" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#22C55E" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function LureGuidePage() {
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
            ルアー釣り入門ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            エサを使わずゲーム感覚で楽しめるルアーフィッシングの基本を解説します。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">ルアー釣りとは：</span>
          疑似餌（ルアー）を使って魚を誘い、反射的に食いつかせる釣り方です。エサが不要で手が汚れず、ゲーム性が高いのが最大の魅力。自分のアクションで魚を釣る達成感は格別です。
        </div>

        <div className="space-y-6">
          {/* ルアーの種類 */}
          <SectionCard title="ルアーの種類" icon={Fish}>
            <p className="mb-4 text-sm text-muted-foreground">
              ルアーにはさまざまな種類があり、それぞれ泳ぎ方や狙える水深が異なります。代表的なルアーを覚えましょう。
            </p>
            <LureTypesDiagram />

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ミノー</h3>
                <p className="text-sm text-muted-foreground">
                  小魚の形をしたプラスチック製のルアー。リップ（唇のような板）が付いており、巻くと水中に潜って泳ぎます。シーバスやヒラメなど幅広い魚に有効で、最も汎用性の高いルアーです。
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">シーバス</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">ヒラメ</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">ブラックバス</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">バイブレーション</h3>
                <p className="text-sm text-muted-foreground">
                  リップがなく、ボディ全体が小刻みに震えるルアー。飛距離が出やすく、広範囲を探るのに適しています。沈むタイプが多いため、中層からボトム（底）まで攻められます。
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">シーバス</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">クロダイ</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ワーム（ソフトルアー）</h3>
                <p className="text-sm text-muted-foreground">
                  柔らかい素材で作られた疑似餌。ジグヘッド（オモリ付きの針）にセットして使います。ナチュラルな動きが特徴で、警戒心の強い魚にも効果的。アジング・メバリングなどのライトゲームで定番です。
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">アジ</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">メバル</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">カサゴ</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">メタルジグ</h3>
                <p className="text-sm text-muted-foreground">
                  金属製のルアーで、重さがあるため遠投が可能。堤防や磯から青物（ブリ、カンパチなど）を狙うショアジギングで使われます。フォール（沈下）中のアクションも魅力的で、さまざまな魚種に有効です。
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">ブリ</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">サワラ</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">ヒラメ</span>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">スプーン</h3>
                <p className="text-sm text-muted-foreground">
                  金属の板をカーブさせたシンプルなルアー。ひらひらと揺れる動きが小魚を模しています。管理釣り場のトラウトから海のシーバスまで幅広く使えるルアーの原点です。
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">トラウト</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">シーバス</span>
                </div>
              </div>
            </div>

            <Hint>
              初心者はまず「ジグヘッド+ワーム」の組み合わせから始めるのがおすすめ。安価でルアーの基本動作を学べます。
            </Hint>
          </SectionCard>

          {/* ターゲット魚種別のルアー選び */}
          <SectionCard title="ターゲット魚種別のルアー選び" icon={Target}>
            <p className="mb-4 text-sm text-muted-foreground">
              狙う魚によって最適なルアーは異なります。代表的なターゲットとおすすめルアーを紹介します。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">アジ（アジング）</span>
                  &nbsp;&mdash;&nbsp;1〜3gのジグヘッド＋2インチ前後のワーム。軽量ルアーで繊細なアタリを楽しむライトゲーム。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">メバル（メバリング）</span>
                  &nbsp;&mdash;&nbsp;1〜5gのジグヘッド＋ワーム、小型ミノーやプラグ。夜釣りで常夜灯周りが好ポイント。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">シーバス</span>
                  &nbsp;&mdash;&nbsp;9〜12cmのミノー、バイブレーション。河口や港湾部で狙える人気ターゲット。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">青物（ブリ・カンパチ）</span>
                  &nbsp;&mdash;&nbsp;20〜60gのメタルジグ。堤防や磯からのショアジギングで大物を狙う。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ヒラメ・マゴチ</span>
                  &nbsp;&mdash;&nbsp;ジグヘッド＋ワーム、メタルジグ。サーフ（砂浜）からの遠投で底付近を攻める。
                </span>
              </div>
            </div>

            <Warning>
              ルアーのサイズはターゲットのエサとなる小魚（ベイトフィッシュ）に合わせるのが基本。現地の釣具店で「今何が釣れていますか？」と聞くのが一番確実です。
            </Warning>
          </SectionCard>

          {/* アクションの付け方 */}
          <SectionCard title="アクションの付け方" icon={Zap}>
            <p className="mb-4 text-sm text-muted-foreground">
              ルアーは巻き方やロッド操作によってさまざまな動きを演出できます。基本の3つのアクションをマスターしましょう。
            </p>
            <RetrieveSpeedDiagram />

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ただ巻き（ステディリトリーブ）</h3>
                <p className="text-sm text-muted-foreground">
                  一定の速度でリールを巻くだけのシンプルなアクション。ルアーの持つ本来のアクションを活かせます。初心者はまずこれをマスターしましょう。巻くスピードを変えることで、異なるレンジ（深さ）を攻められます。
                </p>
                <div className="mt-2 rounded-lg bg-green-50 p-3 text-xs text-green-800 dark:bg-green-950 dark:text-green-200">
                  難易度：初心者向け / 有効なルアー：ミノー、バイブレーション、スプーン
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">トゥイッチ＆ジャーク</h3>
                <p className="text-sm text-muted-foreground">
                  ロッドの先をチョンチョンと動かして、ルアーに不規則な動きを与えるテクニック。小さく動かすのがトゥイッチ、大きく動かすのがジャーク。弱った小魚を演出し、魚の捕食スイッチを入れます。
                </p>
                <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  難易度：中級者向け / 有効なルアー：ミノー、ジャークベイト
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">リフト＆フォール</h3>
                <p className="text-sm text-muted-foreground">
                  ロッドを上に持ち上げてルアーを浮かせ（リフト）、そのまま沈ませる（フォール）動作を繰り返すテクニック。フォール中にバイト（食いつき）が多いのが特徴。底付近の魚に非常に有効です。
                </p>
                <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  難易度：中級者向け / 有効なルアー：メタルジグ、バイブレーション、ワーム
                </div>
              </div>
            </div>

            <Hint>
              まずは「ただ巻き」で魚の反応を見て、反応がなければトゥイッチやリフト＆フォールを試してみましょう。アクションを変えるだけで急に食いつくことも多いです。
            </Hint>
          </SectionCard>

          {/* おすすめのタックル構成 */}
          <SectionCard title="おすすめのタックル構成" icon={Settings}>
            <p className="mb-4 text-sm text-muted-foreground">
              ルアー釣りを始めるための基本的なタックル（道具）構成を紹介します。最初は汎用性の高い組み合わせを選びましょう。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ライトゲーム入門セット（アジング・メバリング）</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>ロッド：ライトゲームロッド 6〜7フィート（ULパワー）</li>
                  <li>リール：スピニングリール 1000〜2000番</li>
                  <li>ライン：PEライン0.3〜0.4号 または フロロカーボン2〜3lb</li>
                  <li>リーダー：フロロカーボン0.8〜1号（PEライン使用時）</li>
                  <li>ルアー：ジグヘッド1〜3g＋ワーム各種</li>
                </ul>
                <div className="mt-2 rounded-lg bg-green-50 p-3 text-xs text-green-800 dark:bg-green-950 dark:text-green-200">
                  予算目安：1万円〜2万円（ロッド+リール）
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">シーバス入門セット</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>ロッド：シーバスロッド 8.6〜9.6フィート（MLパワー）</li>
                  <li>リール：スピニングリール 3000〜4000番</li>
                  <li>ライン：PEライン0.8〜1.2号</li>
                  <li>リーダー：フロロカーボン16〜20lb（3〜5号）</li>
                  <li>ルアー：ミノー9〜12cm、バイブレーション各種</li>
                </ul>
                <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  予算目安：1.5万円〜3万円（ロッド+リール）
                </div>
              </div>
            </div>

            <Warning>
              最初から高価な道具を揃える必要はありません。入門モデルでも十分に楽しめます。まずは実際に釣りをしてみて、自分の好みのスタイルが分かってからグレードアップしましょう。
            </Warning>
          </SectionCard>
        </div>

        {/* 関連ガイド */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guide/jigging" className="text-primary hover:underline">
                    ショアジギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - メタルジグを使った青物狙いの詳細解説</span>
                </li>
                <li>
                  <Link href="/guide/knots" className="text-primary hover:underline">
                    釣り糸の結び方
                  </Link>
                  <span className="text-muted-foreground"> - ルアーと糸の接続に必要な結び方</span>
                </li>
                <li>
                  <Link href="/guide/rigs" className="text-primary hover:underline">
                    釣り仕掛け図解ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ルアー仕掛けの基本構成を図解で解説</span>
                </li>
                <li>
                  <Link href="/guide/night-fishing" className="text-primary hover:underline">
                    夜釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - メバリングやアジングに最適な夜釣りの基本</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            ルアー釣りの基本がわかったら、ショアジギングに挑戦してみましょう。
          </p>
          <Link
            href="/guide/jigging"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ショアジギング入門ガイドへ
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
