import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "釣り仕掛け図解ガイド - 5つの基本仕掛けをイラストで解説",
  description:
    "サビキ・ウキ釣り・ちょい投げ・穴釣り・ルアーの5つの基本仕掛けをイラスト付きでわかりやすく解説。初心者でもすぐに仕掛けが作れるようになります。",
  openGraph: {
    title: "釣り仕掛け図解ガイド - 5つの基本仕掛けをイラストで解説",
    description:
      "5つの基本仕掛けをイラスト付きでわかりやすく解説。初心者でもすぐに仕掛けが作れます。",
    type: "article",
    url: "https://tsurispot.jp/guide/rigs",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.jp/guide/rigs",
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
      item: "https://tsurispot.jp",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "釣りの始め方ガイド",
      item: "https://tsurispot.jp/guide",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "釣り仕掛け図解ガイド",
      item: "https://tsurispot.jp/guide/rigs",
    },
  ],
};

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
      <span className="font-medium">こんな時におすすめ：</span>
      {children}
    </div>
  );
}

function TargetFishBadges({ fish }: { fish: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <span className="text-sm font-medium text-foreground">対象魚：</span>
      {fish.map((f) => (
        <span
          key={f}
          className="inline-flex items-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary"
        >
          {f}
        </span>
      ))}
    </div>
  );
}

/* ── SVG仕掛け図 ── */

function SabikiRigSvg() {
  return (
    <svg
      viewBox="0 0 300 520"
      className="mx-auto w-full max-w-[300px]"
      aria-label="サビキ仕掛けの図解"
    >
      {/* 背景（水） */}
      <rect x="0" y="180" width="300" height="340" fill="#DBEAFE" rx="8" />
      <text x="270" y="200" fontSize="11" fill="#2563EB" textAnchor="end">
        水面
      </text>
      <line
        x1="0"
        y1="185"
        x2="300"
        y2="185"
        stroke="#2563EB"
        strokeWidth="1.5"
        strokeDasharray="6,3"
      />

      {/* 竿先 */}
      <rect x="135" y="10" width="30" height="12" rx="3" fill="#78716C" />
      <text x="150" y="40" fontSize="12" fill="#44403C" textAnchor="middle">
        竿先
      </text>

      {/* 道糸 */}
      <line
        x1="150"
        y1="22"
        x2="150"
        y2="100"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <text x="170" y="70" fontSize="11" fill="#4B5563">
        道糸
      </text>

      {/* スナップサルカン */}
      <circle cx="150" cy="110" r="8" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
      <text x="175" y="114" fontSize="11" fill="#4B5563">
        スナップサルカン
      </text>

      {/* サビキ仕掛け（6本針） */}
      <line
        x1="150"
        y1="118"
        x2="150"
        y2="410"
        stroke="#4B5563"
        strokeWidth="1.5"
      />
      {[160, 200, 240, 280, 320, 360].map((y, i) => (
        <g key={i}>
          {/* エダス */}
          <line
            x1="150"
            y1={y}
            x2="110"
            y2={y + 15}
            stroke="#4B5563"
            strokeWidth="1"
          />
          {/* 針 */}
          <path
            d={`M110,${y + 15} Q105,${y + 25} 112,${y + 25}`}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          {/* 疑似餌 */}
          <circle cx="108" cy={y + 12} r="3" fill="#EC4899" opacity="0.7" />
        </g>
      ))}
      <text x="80" y="270" fontSize="11" fill="#F59E0B" textAnchor="end">
        針×6
      </text>
      <text x="65" y="285" fontSize="10" fill="#EC4899" textAnchor="end">
        (疑似餌付き)
      </text>

      {/* コマセカゴ */}
      <rect x="135" y="415" width="30" height="30" rx="4" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
      <text x="150" y="435" fontSize="9" fill="white" textAnchor="middle">
        カゴ
      </text>
      <text x="190" y="434" fontSize="11" fill="#16A34A">
        コマセカゴ
      </text>

      {/* オモリ */}
      <ellipse cx="150" cy="470" rx="12" ry="8" fill="#4B5563" />
      <text x="190" y="474" fontSize="11" fill="#4B5563">
        オモリ
      </text>
    </svg>
  );
}

function UkiRigSvg() {
  return (
    <svg
      viewBox="0 0 300 500"
      className="mx-auto w-full max-w-[300px]"
      aria-label="ウキ釣り仕掛けの図解"
    >
      {/* 水面 */}
      <rect x="0" y="160" width="300" height="340" fill="#DBEAFE" rx="8" />
      <text x="270" y="178" fontSize="11" fill="#2563EB" textAnchor="end">
        水面
      </text>
      <line
        x1="0"
        y1="165"
        x2="300"
        y2="165"
        stroke="#2563EB"
        strokeWidth="1.5"
        strokeDasharray="6,3"
      />

      {/* 竿先 */}
      <rect x="135" y="10" width="30" height="12" rx="3" fill="#78716C" />
      <text x="150" y="40" fontSize="12" fill="#44403C" textAnchor="middle">
        竿先
      </text>

      {/* 道糸 */}
      <line
        x1="150"
        y1="22"
        x2="150"
        y2="90"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <text x="170" y="65" fontSize="11" fill="#4B5563">
        道糸
      </text>

      {/* ウキ止め */}
      <rect x="145" y="90" width="10" height="6" rx="2" fill="#EF4444" />
      <text x="175" y="98" fontSize="11" fill="#EF4444">
        ウキ止め
      </text>

      {/* 道糸続き */}
      <line
        x1="150"
        y1="96"
        x2="150"
        y2="140"
        stroke="#4B5563"
        strokeWidth="2"
      />

      {/* ウキ */}
      <ellipse cx="150" cy="155" rx="14" ry="22" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" />
      <rect x="148" y="130" width="4" height="15" fill="#44403C" />
      <text x="180" y="160" fontSize="11" fill="#DC2626">
        ウキ
      </text>

      {/* 道糸（水中） */}
      <line
        x1="150"
        y1="177"
        x2="150"
        y2="270"
        stroke="#4B5563"
        strokeWidth="1.5"
      />

      {/* ガン玉 */}
      <circle cx="150" cy="280" r="5" fill="#4B5563" />
      <text x="170" y="284" fontSize="11" fill="#4B5563">
        ガン玉（オモリ）
      </text>

      {/* サルカン */}
      <circle cx="150" cy="310" r="7" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
      <text x="170" y="314" fontSize="11" fill="#6B7280">
        サルカン
      </text>

      {/* ハリス */}
      <line
        x1="150"
        y1="317"
        x2="150"
        y2="420"
        stroke="#4B5563"
        strokeWidth="1"
        strokeDasharray="4,2"
      />
      <text x="170" y="375" fontSize="11" fill="#4B5563">
        ハリス
      </text>

      {/* 針 */}
      <path
        d="M150,420 Q143,440 152,440"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.5"
      />
      <text x="165" y="440" fontSize="11" fill="#F59E0B">
        針
      </text>

      {/* エサ */}
      <ellipse cx="148" cy="442" rx="6" ry="4" fill="#F97316" opacity="0.8" />
      <text x="165" y="455" fontSize="10" fill="#F97316">
        エサ
      </text>
    </svg>
  );
}

function ChoiNageRigSvg() {
  return (
    <svg
      viewBox="0 0 300 480"
      className="mx-auto w-full max-w-[300px]"
      aria-label="ちょい投げ仕掛けの図解"
    >
      {/* 水面 */}
      <rect x="0" y="140" width="300" height="340" fill="#DBEAFE" rx="8" />
      <text x="270" y="158" fontSize="11" fill="#2563EB" textAnchor="end">
        水面
      </text>
      <line
        x1="0"
        y1="145"
        x2="300"
        y2="145"
        stroke="#2563EB"
        strokeWidth="1.5"
        strokeDasharray="6,3"
      />

      {/* 海底 */}
      <path
        d="M0,450 Q75,430 150,445 Q225,460 300,440"
        fill="#D4A373"
        opacity="0.3"
      />
      <text x="150" y="470" fontSize="11" fill="#92400E" textAnchor="middle">
        海底
      </text>

      {/* 竿先 */}
      <rect x="135" y="10" width="30" height="12" rx="3" fill="#78716C" />
      <text x="150" y="40" fontSize="12" fill="#44403C" textAnchor="middle">
        竿先
      </text>

      {/* 道糸 */}
      <line
        x1="150"
        y1="22"
        x2="150"
        y2="170"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <text x="170" y="100" fontSize="11" fill="#4B5563">
        道糸
      </text>

      {/* スナップサルカン */}
      <circle cx="150" cy="180" r="7" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
      <text x="170" y="184" fontSize="11" fill="#6B7280">
        スナップサルカン
      </text>

      {/* L型テンピンオモリ */}
      <line
        x1="150"
        y1="187"
        x2="150"
        y2="260"
        stroke="#4B5563"
        strokeWidth="1.5"
      />
      <line
        x1="150"
        y1="260"
        x2="110"
        y2="260"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <ellipse cx="100" cy="260" rx="14" ry="8" fill="#4B5563" />
      <text x="60" y="250" fontSize="11" fill="#4B5563" textAnchor="end">
        L型テンビン
      </text>
      <text x="60" y="265" fontSize="11" fill="#4B5563" textAnchor="end">
        + オモリ
      </text>

      {/* ハリス（2本針） */}
      <line
        x1="150"
        y1="260"
        x2="150"
        y2="380"
        stroke="#4B5563"
        strokeWidth="1"
        strokeDasharray="4,2"
      />
      <text x="170" y="310" fontSize="11" fill="#4B5563">
        ハリス
      </text>

      {/* 枝針 */}
      <line
        x1="150"
        y1="330"
        x2="190"
        y2="345"
        stroke="#4B5563"
        strokeWidth="1"
      />
      <path
        d="M190,345 Q183,360 192,360"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
      />
      <text x="200" y="348" fontSize="10" fill="#F59E0B">
        針1
      </text>

      {/* 先針 */}
      <path
        d="M150,380 Q143,398 152,398"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
      />
      <text x="165" y="395" fontSize="10" fill="#F59E0B">
        針2
      </text>
    </svg>
  );
}

function AnaTsuriRigSvg() {
  return (
    <svg
      viewBox="0 0 300 420"
      className="mx-auto w-full max-w-[300px]"
      aria-label="穴釣り（ブラクリ）仕掛けの図解"
    >
      {/* テトラポッド */}
      <polygon
        points="60,100 120,100 140,250 40,250"
        fill="#9CA3AF"
        opacity="0.4"
        stroke="#6B7280"
        strokeWidth="1"
      />
      <polygon
        points="180,80 240,80 260,250 160,250"
        fill="#9CA3AF"
        opacity="0.4"
        stroke="#6B7280"
        strokeWidth="1"
      />
      <text x="90" y="160" fontSize="11" fill="#4B5563" textAnchor="middle">
        テトラ
      </text>
      <text x="210" y="150" fontSize="11" fill="#4B5563" textAnchor="middle">
        テトラ
      </text>

      {/* 隙間の水 */}
      <rect x="120" y="120" width="40" height="280" fill="#DBEAFE" rx="4" />

      {/* 竿先 */}
      <rect x="125" y="10" width="30" height="12" rx="3" fill="#78716C" />
      <text x="140" y="40" fontSize="12" fill="#44403C" textAnchor="middle">
        竿先（短い竿）
      </text>

      {/* 道糸 */}
      <line
        x1="140"
        y1="22"
        x2="140"
        y2="230"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <text x="165" y="80" fontSize="11" fill="#4B5563">
        道糸
      </text>

      {/* ブラクリ（オモリ+針一体型） */}
      <ellipse cx="140" cy="250" rx="14" ry="10" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" />
      <text x="140" y="254" fontSize="8" fill="white" textAnchor="middle">
        ブラクリ
      </text>

      {/* 針 */}
      <path
        d="M140,260 Q132,280 142,280"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2.5"
      />

      {/* エサ */}
      <ellipse cx="138" cy="283" rx="6" ry="4" fill="#F97316" opacity="0.8" />

      <text x="170" y="258" fontSize="11" fill="#DC2626">
        オモリ+針
      </text>
      <text x="170" y="273" fontSize="11" fill="#DC2626">
        一体型
      </text>
      <text x="170" y="290" fontSize="10" fill="#F97316">
        エサ
      </text>

      {/* 矢印（落とす方向） */}
      <line
        x1="140"
        y1="300"
        x2="140"
        y2="370"
        stroke="#2563EB"
        strokeWidth="1.5"
        strokeDasharray="4,3"
      />
      <polygon points="135,370 145,370 140,382" fill="#2563EB" />
      <text x="140" y="400" fontSize="11" fill="#2563EB" textAnchor="middle">
        隙間に落とす
      </text>
    </svg>
  );
}

function LureRigSvg() {
  return (
    <svg
      viewBox="0 0 300 460"
      className="mx-auto w-full max-w-[300px]"
      aria-label="ルアー仕掛けの図解"
    >
      {/* 水面 */}
      <rect x="0" y="180" width="300" height="280" fill="#DBEAFE" rx="8" />
      <text x="270" y="198" fontSize="11" fill="#2563EB" textAnchor="end">
        水面
      </text>
      <line
        x1="0"
        y1="185"
        x2="300"
        y2="185"
        stroke="#2563EB"
        strokeWidth="1.5"
        strokeDasharray="6,3"
      />

      {/* 竿先 */}
      <rect x="135" y="10" width="30" height="12" rx="3" fill="#78716C" />
      <text x="150" y="40" fontSize="12" fill="#44403C" textAnchor="middle">
        竿先
      </text>

      {/* PE/ナイロンライン */}
      <line
        x1="150"
        y1="22"
        x2="150"
        y2="130"
        stroke="#4B5563"
        strokeWidth="2"
      />
      <text x="175" y="80" fontSize="11" fill="#4B5563">
        メインライン
      </text>
      <text x="175" y="95" fontSize="10" fill="#6B7280">
        (PEまたはナイロン)
      </text>

      {/* 結束部 */}
      <circle cx="150" cy="140" r="5" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
      <text x="170" y="144" fontSize="10" fill="#6B7280">
        結束
      </text>

      {/* リーダー */}
      <line
        x1="150"
        y1="145"
        x2="150"
        y2="250"
        stroke="#4B5563"
        strokeWidth="1.5"
        strokeDasharray="4,2"
      />
      <text x="175" y="200" fontSize="11" fill="#4B5563">
        リーダー
      </text>
      <text x="175" y="215" fontSize="10" fill="#6B7280">
        (フロロカーボン)
      </text>

      {/* スナップ */}
      <ellipse cx="150" cy="260" rx="6" ry="4" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
      <text x="170" y="264" fontSize="11" fill="#6B7280">
        スナップ
      </text>

      {/* ルアー（プラグ型） */}
      <g>
        <text x="55" y="310" fontSize="11" fill="#44403C" textAnchor="middle">
          プラグ
        </text>
        <ellipse cx="55" cy="330" rx="22" ry="10" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
        <circle cx="42" cy="327" r="2" fill="white" />
        {/* トレブルフック */}
        <path
          d="M45,340 L42,352 M45,340 L48,352 M45,340 L40,348"
          stroke="#F59E0B"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M65,340 L62,352 M65,340 L68,352 M65,340 L60,348"
          stroke="#F59E0B"
          strokeWidth="1.5"
          fill="none"
        />
      </g>

      {/* or */}
      <text x="150" y="340" fontSize="12" fill="#6B7280" textAnchor="middle">
        または
      </text>

      {/* ジグヘッド+ワーム */}
      <g>
        <text x="245" y="310" fontSize="11" fill="#44403C" textAnchor="middle">
          ジグヘッド+ワーム
        </text>
        <circle cx="230" cy="330" r="6" fill="#4B5563" />
        <path
          d="M230,336 Q226,350 232,350"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
        />
        {/* ワーム */}
        <path
          d="M234,330 Q250,325 265,332 Q270,340 260,340"
          fill="#A78BFA"
          opacity="0.8"
          stroke="#7C3AED"
          strokeWidth="1"
        />
      </g>

      {/* 接続線 */}
      <line
        x1="150"
        y1="264"
        x2="55"
        y2="320"
        stroke="#4B5563"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <line
        x1="150"
        y1="264"
        x2="230"
        y2="324"
        stroke="#4B5563"
        strokeWidth="1"
        strokeDasharray="3,3"
      />

      {/* 注記 */}
      <text
        x="150"
        y="400"
        fontSize="10"
        fill="#6B7280"
        textAnchor="middle"
      >
        ルアーの種類に合わせて
      </text>
      <text
        x="150"
        y="415"
        fontSize="10"
        fill="#6B7280"
        textAnchor="middle"
      >
        スナップに接続します
      </text>
    </svg>
  );
}

/* ── メインコンポーネント ── */

export default function RigsGuidePage() {
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
            釣り仕掛け図解ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            5つの基本仕掛けをイラスト付きで解説。初心者でもすぐに仕掛けが作れます。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">はじめに：</span>
          仕掛けとは、竿先から針までの糸や道具の組み合わせのこと。狙う魚や釣り方によって仕掛けは異なります。ここでは初心者が覚えるべき5つの基本仕掛けを図解で紹介します。
        </div>

        <div className="space-y-6">
          {/* 1. サビキ仕掛け */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <h2 className="text-xl font-bold">サビキ仕掛け</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                堤防から足元に垂直に落として使う、初心者に最もおすすめの仕掛けです。コマセ（撒き餌）で魚を集め、疑似餌がついた6本の針で一度に複数の魚を狙えます。投げる技術が不要なので、初めての釣りにぴったりです。
              </p>

              <div className="my-4 rounded-lg border p-4">
                <SabikiRigSvg />
              </div>

              <h3 className="mb-2 font-medium text-foreground">必要な道具</h3>
              <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>万能竿またはサビキ竿（2〜3m）</li>
                <li>スピニングリール（2000〜3000番）</li>
                <li>サビキ仕掛け（針4〜6号）</li>
                <li>コマセカゴ（下カゴ式が一般的）</li>
                <li>コマセ（冷凍アミエビまたはチューブタイプ）</li>
                <li>ナス型オモリ（6〜10号）</li>
              </ul>

              <Hint>
                堤防や海釣り公園で手軽に始めたいとき。家族やグループでの釣りにも最適です。コマセを撒くだけで魚が集まるので、ボウズ（釣れない）になりにくいのが魅力。
              </Hint>

              <TargetFishBadges
                fish={["アジ", "サバ", "イワシ", "コノシロ", "小メジナ"]}
              />
            </CardContent>
          </Card>

          {/* 2. ウキ釣り仕掛け */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <h2 className="text-xl font-bold">ウキ釣り仕掛け</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                ウキ（浮き）を使って魚のアタリを目で見る、伝統的な釣り方です。ウキが沈んだり動いたりしたら魚がエサに食いついた合図。ウキ止めの位置を変えることで、狙うタナ（深さ）を自由に調整できます。
              </p>

              <div className="my-4 rounded-lg border p-4">
                <UkiRigSvg />
              </div>

              <h3 className="mb-2 font-medium text-foreground">必要な道具</h3>
              <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>磯竿または万能竿（3〜4.5m）</li>
                <li>スピニングリール（2500〜3000番）</li>
                <li>円錐ウキまたは棒ウキ</li>
                <li>ウキ止め糸・シモリ玉</li>
                <li>ガン玉（オモリ）</li>
                <li>サルカン</li>
                <li>ハリス付き針</li>
                <li>エサ（オキアミ、虫エサなど）</li>
              </ul>

              <Hint>
                狙った深さをじっくり攻めたいとき。堤防・磯・河口など幅広い場所で使えます。ウキの動きを見ながら待つ釣りなので、のんびり楽しみたい方におすすめです。
              </Hint>

              <TargetFishBadges
                fish={["メジナ", "クロダイ", "アジ", "サヨリ", "メバル"]}
              />
            </CardContent>
          </Card>

          {/* 3. ちょい投げ仕掛け */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <h2 className="text-xl font-bold">ちょい投げ仕掛け</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                軽く投げて海底付近にいる魚を狙う釣り方です。本格的な投げ釣りほど遠くに飛ばす必要がなく、20〜40m程度の軽いキャストでOK。テンビンオモリを使うことで、仕掛けが絡みにくくなっています。
              </p>

              <div className="my-4 rounded-lg border p-4">
                <ChoiNageRigSvg />
              </div>

              <h3 className="mb-2 font-medium text-foreground">必要な道具</h3>
              <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>万能竿またはちょい投げ竿（2.4〜3.6m）</li>
                <li>スピニングリール（2500〜3000番）</li>
                <li>L型テンビンオモリ（5〜10号）</li>
                <li>ちょい投げ仕掛け（針8〜10号、1〜2本針）</li>
                <li>エサ（青イソメ、ジャリメなど虫エサ）</li>
              </ul>

              <Hint>
                砂浜や堤防から、底にいるキスやカレイを狙いたいとき。サビキ釣りに慣れたら次のステップとしておすすめ。少し投げる技術が必要ですが、難しくはありません。
              </Hint>

              <div className="my-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <span className="font-medium">注意：</span>
                投げるときは必ず周囲の安全を確認してください。後ろに人がいないか、左右にも十分な間隔があるかを確認してからキャストしましょう。
              </div>

              <TargetFishBadges
                fish={["シロギス", "カレイ", "ハゼ", "イシモチ", "メゴチ"]}
              />
            </CardContent>
          </Card>

          {/* 4. 穴釣り（ブラクリ）仕掛け */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <h2 className="text-xl font-bold">
                  穴釣り（ブラクリ）仕掛け
                </h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                テトラポッド（消波ブロック）や岩の隙間に仕掛けを落として、穴に潜む根魚（ロックフィッシュ）を狙う釣り方です。仕掛けは「ブラクリ」と呼ばれるオモリと針が一体になったものを使い、非常にシンプル。短い竿で手軽に楽しめます。
              </p>

              <div className="my-4 rounded-lg border p-4">
                <AnaTsuriRigSvg />
              </div>

              <h3 className="mb-2 font-medium text-foreground">必要な道具</h3>
              <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>短い竿（1〜1.5m）またはテトラ竿</li>
                <li>小型スピニングリールまたはベイトリール</li>
                <li>ブラクリ仕掛け（3〜5号）</li>
                <li>エサ（青イソメ、サバの切り身、オキアミなど）</li>
              </ul>

              <Hint>
                テトラポッドや岩場の隙間を探って根魚を狙いたいとき。仕掛けが最もシンプルで、道糸にブラクリを結ぶだけ。数か所穴を探り歩くのが釣果アップのコツです。
              </Hint>

              <div className="my-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <span className="font-medium">安全上の注意：</span>
                テトラポッドの上は非常に滑りやすく危険です。ライフジャケットを必ず着用し、足元に十分注意してください。単独での釣行は避け、できるだけ二人以上で行きましょう。
              </div>

              <TargetFishBadges
                fish={["カサゴ", "メバル", "アイナメ", "ソイ", "ギンポ"]}
              />
            </CardContent>
          </Card>

          {/* 5. ルアー仕掛け */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <h2 className="text-xl font-bold">ルアー仕掛け</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                疑似餌（ルアー）を使ってフィッシュイーター（魚を食べる魚）を狙う釣り方です。エサが不要で手が汚れず、ゲーム性が高いのが魅力。ルアーの種類は豊富ですが、基本の仕掛けはシンプルです。メインラインにリーダーを結び、スナップでルアーを接続します。
              </p>

              <div className="my-4 rounded-lg border p-4">
                <LureRigSvg />
              </div>

              <h3 className="mb-2 font-medium text-foreground">必要な道具</h3>
              <ul className="mb-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>ルアーロッド（ライトゲーム用：6〜8フィート）</li>
                <li>スピニングリール（2000〜3000番）</li>
                <li>
                  メインライン（PEライン0.6〜1号 またはナイロン4〜8lb）
                </li>
                <li>リーダー（フロロカーボン1〜2号、50cm〜1m）</li>
                <li>スナップ（ルアー交換を素早くするため）</li>
                <li>
                  ルアー（ジグヘッド+ワーム、メタルジグ、ミノーなど）
                </li>
              </ul>

              <Hint>
                エサを使わずにゲーム感覚で釣りを楽しみたいとき。初心者はジグヘッド（1〜3g）にワームを付ける「アジング」や「メバリング」から始めるのがおすすめ。軽い仕掛けで手軽に楽しめます。
              </Hint>

              <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <span className="font-medium">PEラインを使う場合：</span>
                PEラインは伸びがなく感度が良い反面、根ズレ（岩などで擦れること）に弱いです。必ずフロロカーボンのリーダーを接続しましょう。結び方は電車結びかFGノットがおすすめです。
              </div>

              <TargetFishBadges
                fish={[
                  "アジ",
                  "メバル",
                  "シーバス",
                  "カサゴ",
                  "ヒラメ",
                  "青物",
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* まとめ */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">仕掛け選びのポイント</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">
                      初めての一本はサビキ仕掛け。
                    </span>
                    投げる技術不要で、魚が釣れる確率が最も高いです。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">
                      狙う魚に合わせて選ぶ。
                    </span>
                    底にいる魚ならちょい投げや穴釣り、回遊魚ならサビキやルアーが適しています。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">
                      釣り場の環境に合わせる。
                    </span>
                    テトラがあれば穴釣り、砂地ならちょい投げ、堤防ならサビキと使い分けましょう。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">
                      セット仕掛けを活用する。
                    </span>
                    各釣り方のセット仕掛けが釣具店で販売されています。最初はセットから始めると失敗しにくいです。
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            仕掛けが分かったら、結び方をマスターしましょう。
          </p>
          <Link
            href="/guide/knots"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            釣り糸の結び方ガイドへ
          </Link>
        </div>
      </main>
    </>
  );
}
