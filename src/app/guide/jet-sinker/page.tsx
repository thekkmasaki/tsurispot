import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Shield,
  Waves,
  Anchor,
  MapPin,
  Fish,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "ジェット天秤の使い方｜初心者でも遠投できる最強アイテム",
  description:
    "ジェット天秤の特徴・使い方・号数の選び方を初心者向けに完全解説。なぜ飛ぶのか、根がかりしにくい理由、投げ釣り・ちょい投げ・泳がせ釣りでの仕掛けの作り方、おすすめの号数（8号・10号・15号・20号）まで。実釣レポートつき。",
  openGraph: {
    title: "ジェット天秤の使い方｜初心者でも遠投できる最強アイテム",
    description:
      "ジェット天秤の特徴・号数選び・仕掛けの作り方を初心者向けに解説。投げ釣り・ちょい投げ・泳がせ釣りに使える万能アイテム。",
    type: "article",
    url: "https://tsurispot.com/guide/jet-sinker",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/jet-sinker",
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
      name: "ジェット天秤の使い方",
      item: "https://tsurispot.com/guide/jet-sinker",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "ジェット天秤を使った投げ釣り仕掛けの作り方",
  description:
    "ジェット天秤を使った投げ釣り仕掛けのセット方法を初心者向けに解説。道糸からジェット天秤、ハリス、針までの接続手順。",
  totalTime: "PT10M",
  supply: [
    { "@type": "HowToSupply", name: "ジェット天秤（8〜20号）" },
    { "@type": "HowToSupply", name: "ハリス（フロロカーボン 1.5〜3号）" },
    { "@type": "HowToSupply", name: "針（投げ釣り用 7〜12号）" },
  ],
  tool: [
    { "@type": "HowToTool", name: "投げ竿またはちょい投げ竿（2.7〜4.2m）" },
    { "@type": "HowToTool", name: "スピニングリール（3000〜4000番）" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "道糸にジェット天秤を接続する",
      text: "リールから出した道糸の先端にスナップサルカンを結び、ジェット天秤の道糸側のアイに接続します。ジェット天秤のウイング（羽根）が付いている側が道糸側です。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "ハリスを接続する",
      text: "ジェット天秤のもう一方のアイ（ハリス側）にハリスを結びます。ハリスの長さは50cm〜1mが標準。フロロカーボンの1.5〜3号を使います。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "針を結ぶ",
      text: "ハリスの先端に針を結びます。投げ釣り用の流線型の針（7〜12号）がおすすめ。エサが外れにくい形状を選びましょう。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "エサを付けて投入する",
      text: "針にイソメやゴカイなどのエサを付け、竿を振りかぶって遠投します。ジェット天秤の空気抵抗が少ない形状のおかげで、初心者でも遠くに飛ばせます。",
      position: 4,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ジェット天秤と普通の天秤の違いは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ジェット天秤にはプラスチック製のウイング（羽根）が付いており、キャスト時に空気抵抗を減らして飛距離を伸ばし、回収時には水中で浮き上がるため根がかりしにくいのが最大の特徴です。通常のL型天秤にはこの浮き上がり機能がありません。",
      },
    },
    {
      "@type": "Question",
      name: "ジェット天秤は何号を選べばいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ちょい投げなら8〜10号、本格的な投げ釣りなら15〜20号が目安です。竿の適合オモリ号数を確認し、その範囲内で選びましょう。潮が速い場所では重め、穏やかな場所では軽めを選ぶのがコツです。",
      },
    },
    {
      "@type": "Question",
      name: "ジェット天秤で泳がせ釣りはできる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "できます。ジェット天秤を使った泳がせ釣りは、生きエサを遠投でき、根がかりも軽減できるため非常に有効です。特に砂浜やゴロタ場でのヒラメ・マゴチ狙いに効果的。10〜15号のジェット天秤を使い、ハリスは5号以上の太めを推奨します。",
      },
    },
    {
      "@type": "Question",
      name: "ジェット天秤の弱点は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "潮が速い場所では流されやすく、仕掛けが安定しにくいのが弱点です。また、置き竿でじっと待つ釣りには不向きで、転がりやすいため仕掛けが狙ったポイントからズレることがあります。潮が速い場合は通常のL型天秤やオモリに切り替えましょう。",
      },
    },
  ],
};

/* ── ジェット天秤の構造図 ── */
function JetSinkerDiagram() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        ジェット天秤の構造
      </p>
      <svg
        viewBox="0 0 600 260"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="ジェット天秤の構造図：ウイング（羽根）とおもりが一体化したボディ、道糸側アイ、ハリス側アイの各パーツを示す"
        className="mx-auto"
      >
        <rect x="0" y="0" width="600" height="260" rx="8" fill="#F0F9FF" />
        <text
          x="300"
          y="24"
          textAnchor="middle"
          fontSize="14"
          fill="#1E293B"
          fontWeight="bold"
        >
          ジェット天秤の構造
        </text>

        {/* ===== ウイング＋おもり一体ボディ ===== */}
        {/* おもり（鉛）- ウイングの中心に一体化 */}
        <ellipse
          cx="270"
          cy="110"
          rx="30"
          ry="18"
          fill="#9CA3AF"
          opacity="0.6"
          stroke="#6B7280"
          strokeWidth="2"
        />

        {/* ウイング上側（おもりを包むように一体化） */}
        <path
          d="M240,110 Q220,60 300,85 L300,110 Q260,90 240,110Z"
          fill="#38BDF8"
          opacity="0.35"
          stroke="#0284C7"
          strokeWidth="1.5"
        />
        {/* ウイング下側 */}
        <path
          d="M240,110 Q220,160 300,135 L300,110 Q260,130 240,110Z"
          fill="#38BDF8"
          opacity="0.35"
          stroke="#0284C7"
          strokeWidth="1.5"
        />

        {/* ボディラベル */}
        <line x1="270" y1="140" x2="270" y2="165" stroke="#4B5563" strokeWidth="1" />
        <text x="270" y="178" textAnchor="middle" fontSize="10" fill="#4B5563" fontWeight="bold">
          おもり＋ウイング
        </text>
        <text x="270" y="192" textAnchor="middle" fontSize="9" fill="#6B7280">
          （一体構造）
        </text>

        {/* ウイングラベル */}
        <line x1="225" y1="75" x2="210" y2="55" stroke="#0369A1" strokeWidth="1" />
        <text x="210" y="50" textAnchor="middle" fontSize="10" fill="#0369A1" fontWeight="bold">
          プラスチック羽根
        </text>

        {/* ===== 道糸側ワイヤーアーム ===== */}
        {/* ボディから左に伸びるワイヤー */}
        <line
          x1="240"
          y1="110"
          x2="140"
          y2="110"
          stroke="#6B7280"
          strokeWidth="2.5"
        />
        {/* 道糸側アイ（環） */}
        <circle
          cx="133"
          cy="110"
          r="7"
          fill="none"
          stroke="#2563EB"
          strokeWidth="2.5"
        />
        {/* 道糸の点線 */}
        <line
          x1="70"
          y1="110"
          x2="126"
          y2="110"
          stroke="#2563EB"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
        <text x="58" y="114" textAnchor="end" fontSize="11" fill="#2563EB" fontWeight="bold">
          道糸
        </text>
        {/* 道糸側ラベル */}
        <text x="133" y="88" textAnchor="middle" fontSize="9" fill="#2563EB">
          道糸側アイ
        </text>

        {/* ===== ハリス側ワイヤーアーム（L字型） ===== */}
        {/* ボディから右に伸びるワイヤー（水平部分） */}
        <line
          x1="300"
          y1="110"
          x2="400"
          y2="110"
          stroke="#6B7280"
          strokeWidth="2.5"
        />
        {/* L字の曲がり部分（下に曲がる） */}
        <path
          d="M400,110 Q410,110 410,120"
          fill="none"
          stroke="#6B7280"
          strokeWidth="2.5"
        />
        {/* L字の縦部分 */}
        <line
          x1="410"
          y1="120"
          x2="410"
          y2="170"
          stroke="#6B7280"
          strokeWidth="2.5"
        />
        {/* ハリス側アイ（環） */}
        <circle
          cx="410"
          cy="178"
          r="7"
          fill="none"
          stroke="#DC2626"
          strokeWidth="2.5"
        />
        {/* ハリスの点線 */}
        <line
          x1="410"
          y1="185"
          x2="410"
          y2="230"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeDasharray="5,3"
        />
        <text x="410" y="245" textAnchor="middle" fontSize="11" fill="#DC2626" fontWeight="bold">
          ハリス
        </text>
        {/* ハリス側ラベル */}
        <text x="445" y="180" fontSize="9" fill="#DC2626">
          ハリス側アイ
        </text>

        {/* L字ラベル */}
        <line x1="430" y1="115" x2="470" y2="105" stroke="#4B5563" strokeWidth="1" />
        <text x="475" y="108" fontSize="9" fill="#4B5563">
          L字アーム
        </text>
        <text x="475" y="120" fontSize="8" fill="#6B7280">
          （仕掛けの絡み防止）
        </text>

        {/* ===== キャスト方向の矢印 ===== */}
        <line
          x1="160"
          y1="40"
          x2="340"
          y2="40"
          stroke="#F59E0B"
          strokeWidth="1.5"
        />
        <polygon points="335,36 335,44 345,40" fill="#F59E0B" />
        <text x="250" y="36" textAnchor="middle" fontSize="9" fill="#F59E0B">
          キャスト方向（羽根で空気抵抗を減らし飛距離UP）
        </text>

        {/* ===== 浮き上がり説明 ===== */}
        <path
          d="M500,160 Q510,130 520,145"
          fill="none"
          stroke="#0EA5E9"
          strokeWidth="1.5"
        />
        <polygon points="508,132 514,138 506,140" fill="#0EA5E9" />
        <text x="520" y="165" textAnchor="middle" fontSize="9" fill="#0EA5E9">
          回収時に
        </text>
        <text x="520" y="177" textAnchor="middle" fontSize="9" fill="#0EA5E9">
          浮き上がる
        </text>
      </svg>
    </div>
  );
}

/* ── 仕掛けの接続図 ── */
function RigConnectionDiagram() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        ジェット天秤を使った投げ釣り仕掛け
      </p>
      <svg
        viewBox="0 0 700 160"
        width="100%"
        style={{ maxWidth: 700 }}
        aria-label="仕掛けの接続図：リール→道糸→スナップサルカン→ジェット天秤→ハリス→針の順番"
        className="mx-auto"
      >
        <rect x="0" y="0" width="700" height="160" rx="8" fill="#F9FAFB" />
        <text
          x="350"
          y="22"
          textAnchor="middle"
          fontSize="13"
          fill="#1E293B"
          fontWeight="bold"
        >
          仕掛けの接続順序
        </text>

        {/* リール */}
        <rect
          x="20"
          y="55"
          width="70"
          height="40"
          rx="6"
          fill="#E5E7EB"
          stroke="#6B7280"
          strokeWidth="1.5"
        />
        <text
          x="55"
          y="78"
          textAnchor="middle"
          fontSize="10"
          fill="#374151"
          fontWeight="bold"
        >
          リール
        </text>

        {/* 矢印 */}
        <line
          x1="95"
          y1="75"
          x2="130"
          y2="75"
          stroke="#2563EB"
          strokeWidth="2"
        />
        <polygon points="126,71 126,79 134,75" fill="#2563EB" />

        {/* 道糸 */}
        <rect
          x="135"
          y="55"
          width="80"
          height="40"
          rx="6"
          fill="#DBEAFE"
          stroke="#2563EB"
          strokeWidth="1.5"
        />
        <text
          x="175"
          y="72"
          textAnchor="middle"
          fontSize="10"
          fill="#1E40AF"
          fontWeight="bold"
        >
          道糸
        </text>
        <text
          x="175"
          y="86"
          textAnchor="middle"
          fontSize="8"
          fill="#3B82F6"
        >
          PE1〜3号
        </text>

        {/* 矢印 */}
        <line
          x1="220"
          y1="75"
          x2="255"
          y2="75"
          stroke="#2563EB"
          strokeWidth="2"
        />
        <polygon points="251,71 251,79 259,75" fill="#2563EB" />

        {/* スナップサルカン */}
        <rect
          x="260"
          y="50"
          width="90"
          height="50"
          rx="6"
          fill="#F0FDF4"
          stroke="#22C55E"
          strokeWidth="1.5"
        />
        <text
          x="305"
          y="72"
          textAnchor="middle"
          fontSize="9"
          fill="#15803D"
          fontWeight="bold"
        >
          スナップ
        </text>
        <text
          x="305"
          y="86"
          textAnchor="middle"
          fontSize="9"
          fill="#15803D"
          fontWeight="bold"
        >
          サルカン
        </text>

        {/* 矢印 */}
        <line
          x1="355"
          y1="75"
          x2="385"
          y2="75"
          stroke="#2563EB"
          strokeWidth="2"
        />
        <polygon points="381,71 381,79 389,75" fill="#2563EB" />

        {/* ジェット天秤 */}
        <rect
          x="390"
          y="45"
          width="110"
          height="55"
          rx="6"
          fill="#F0F9FF"
          stroke="#0EA5E9"
          strokeWidth="2"
        />
        <text
          x="445"
          y="68"
          textAnchor="middle"
          fontSize="10"
          fill="#0369A1"
          fontWeight="bold"
        >
          ジェット天秤
        </text>
        <text
          x="445"
          y="84"
          textAnchor="middle"
          fontSize="8"
          fill="#0EA5E9"
        >
          8〜20号
        </text>

        {/* 矢印 */}
        <line
          x1="505"
          y1="75"
          x2="535"
          y2="75"
          stroke="#DC2626"
          strokeWidth="2"
        />
        <polygon points="531,71 531,79 539,75" fill="#DC2626" />

        {/* ハリス */}
        <rect
          x="540"
          y="55"
          width="70"
          height="40"
          rx="6"
          fill="#FEF2F2"
          stroke="#DC2626"
          strokeWidth="1.5"
        />
        <text
          x="575"
          y="72"
          textAnchor="middle"
          fontSize="10"
          fill="#991B1B"
          fontWeight="bold"
        >
          ハリス
        </text>
        <text
          x="575"
          y="86"
          textAnchor="middle"
          fontSize="8"
          fill="#DC2626"
        >
          1.5〜3号
        </text>

        {/* 矢印 */}
        <line
          x1="615"
          y1="75"
          x2="640"
          y2="75"
          stroke="#DC2626"
          strokeWidth="2"
        />
        <polygon points="636,71 636,79 644,75" fill="#DC2626" />

        {/* 針 */}
        <rect
          x="645"
          y="55"
          width="45"
          height="40"
          rx="6"
          fill="#FDF4FF"
          stroke="#A855F7"
          strokeWidth="1.5"
        />
        <text
          x="667"
          y="78"
          textAnchor="middle"
          fontSize="10"
          fill="#7E22CE"
          fontWeight="bold"
        >
          針
        </text>

        {/* ハリスの長さの注記 */}
        <line
          x1="540"
          y1="110"
          x2="645"
          y2="110"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        <line
          x1="540"
          y1="105"
          x2="540"
          y2="115"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        <line
          x1="645"
          y1="105"
          x2="645"
          y2="115"
          stroke="#9CA3AF"
          strokeWidth="1"
        />
        <text
          x="592"
          y="126"
          textAnchor="middle"
          fontSize="9"
          fill="#6B7280"
        >
          50cm〜1m
        </text>
      </svg>
    </div>
  );
}

/* ── 号数比較データ ── */
const SINKER_SIZES = [
  {
    gou: "8号",
    weight: "30g",
    use: "ちょい投げ",
    target: "キス・ハゼ・カレイ",
    distance: "30〜50m",
    rod: "ちょい投げ竿、万能竿",
    color: "border-green-300 bg-green-50",
    badge: "bg-green-100 text-green-800",
    recommended: "初心者に最適",
  },
  {
    gou: "10号",
    weight: "37.5g",
    use: "ちょい投げ〜投げ釣り",
    target: "キス・カレイ・マゴチ",
    distance: "40〜70m",
    rod: "ちょい投げ竿、投げ竿",
    color: "border-blue-300 bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    recommended: "万能サイズ",
  },
  {
    gou: "15号",
    weight: "56.25g",
    use: "本格投げ釣り",
    target: "カレイ・マゴチ・ヒラメ",
    distance: "60〜100m",
    rod: "投げ竿（3.6〜4.2m）",
    color: "border-orange-300 bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    recommended: "遠投派に",
  },
  {
    gou: "20号",
    weight: "75g",
    use: "遠投投げ釣り",
    target: "大型カレイ・ヒラメ・泳がせ",
    distance: "80〜130m+",
    rod: "投げ竿（4.0〜4.5m）",
    color: "border-red-300 bg-red-50",
    badge: "bg-red-100 text-red-800",
    recommended: "上級者・大遠投",
  },
];

export default function JetSinkerGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* パンくずリスト */}
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "釣りの始め方ガイド", href: "/guide" },
            { label: "ジェット天秤の使い方" },
          ]}
        />

        {/* 戻るリンク */}
        <Link
          href="/guide"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          ガイド一覧に戻る
        </Link>

        {/* ヒーローセクション */}
        <div className="mb-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 p-8">
          <Badge className="mb-3 bg-sky-100 text-sky-800">
            投げ釣りの必須アイテム
          </Badge>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            ジェット天秤の使い方
          </h1>
          <p className="text-lg text-muted-foreground">
            初心者でも遠投できる最強アイテム。飛距離が出て、根がかりしにくい。
            投げ釣りを始めるならまずはこれ。
          </p>
        </div>

        {/* ===== 1. ジェット天秤とは ===== */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Zap className="h-6 w-6 text-sky-500" />
            ジェット天秤とは？
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="mb-4 leading-relaxed text-muted-foreground">
                ジェット天秤とは、通常の天秤おもりに<strong>プラスチック製のウイング（羽根）</strong>が付いた投げ釣り用のおもりです。
                この羽根が空気中では抵抗を減らして<strong>飛距離を伸ばし</strong>、水中ではリールを巻いた時に仕掛けを<strong>浮き上がらせる</strong>ことで根がかりを防ぎます。
              </p>

              <div className="mb-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                  <p className="mb-1 text-sm font-bold text-sky-800">
                    形状の特徴
                  </p>
                  <p className="text-sm text-sky-700">
                    天秤（L字型の金属アーム）にプラスチック製の翼がついた独特の形状。流線型で空気を切りやすい。
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="mb-1 text-sm font-bold text-emerald-800">
                    なぜ飛ぶのか
                  </p>
                  <p className="text-sm text-emerald-700">
                    ウイングが空気を整流し、弾丸のように安定して飛ぶ。同じ重さの通常おもりより10〜20%飛距離アップ。
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-1 text-sm font-bold text-amber-800">
                    通常のオモリとの違い
                  </p>
                  <p className="text-sm text-amber-700">
                    回収時に浮き上がるため海底を引きずらない。根がかり多発ポイントでも安心して使える。
                  </p>
                </div>
              </div>

              <JetSinkerDiagram />
            </CardContent>
          </Card>
        </section>

        {/* ===== 2. なぜ初心者におすすめか ===== */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Target className="h-6 w-6 text-green-500" />
            なぜ初心者におすすめ？
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-green-200">
              <CardContent className="p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Waves className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="mb-2 font-bold">遠投しやすい</h3>
                <p className="text-sm text-muted-foreground">
                  流線型のウイングが空気抵抗を減らすため、初心者のキャストフォームでも驚くほど飛距離が出ます。
                  沖のポイントに届けば、大型魚に出会えるチャンスが格段に上がります。
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="mb-2 font-bold">根がかりしにくい</h3>
                <p className="text-sm text-muted-foreground">
                  リールを巻くと水中で浮き上がるため、海底の岩や海藻に引っかかりにくい。
                  おもりのロストが減り、<strong>コスパも良好</strong>。ストレスなく釣りに集中できます。
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Anchor className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 font-bold">安い</h3>
                <p className="text-sm text-muted-foreground">
                  1個あたり200〜400円程度。セットで買えばさらにお得。
                  高性能なのにリーズナブルで、初心者が最初に揃えるアイテムとして最適です。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ===== 3. 使える釣り方 ===== */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Fish className="h-6 w-6 text-blue-500" />
            ジェット天秤が使える釣り方
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Badge className="mt-1 shrink-0 bg-sky-100 text-sky-800">
                    定番
                  </Badge>
                  <div>
                    <h3 className="mb-1 font-bold">投げ釣り</h3>
                    <p className="text-sm text-muted-foreground">
                      ジェット天秤の本領発揮。砂浜や堤防から100m以上遠投して、キス・カレイ・マゴチなどの底物を狙います。
                      15〜20号を使い、イソメやゴカイをエサにするのが基本。サーフからのヒラメ狙いにも有効です。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Badge className="mt-1 shrink-0 bg-green-100 text-green-800">
                    お手軽
                  </Badge>
                  <div>
                    <h3 className="mb-1 font-bold">ちょい投げ</h3>
                    <p className="text-sm text-muted-foreground">
                      堤防から30〜50m投げる手軽な釣り方。8〜10号の軽めのジェット天秤を使えば、コンパクトロッドでもOK。
                      キスやハゼ、小型のカレイが狙えます。ファミリーフィッシングにもぴったり。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Badge className="mt-1 shrink-0 bg-red-100 text-red-800">
                    大物狙い
                  </Badge>
                  <div>
                    <h3 className="mb-1 font-bold">泳がせ釣り</h3>
                    <p className="text-sm text-muted-foreground">
                      サビキで釣ったアジやイワシを生きエサにして遠投。ヒラメ・マゴチ・シーバスなどの大型魚を狙えます。
                      ジェット天秤なら根がかりを気にせず、生きエサを沖のポイントに届けられるのが強みです。
                    </p>
                    <Link
                      href="/guide/oyogase"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      泳がせ釣りガイドを見る
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ===== 4. 仕掛けの作り方 ===== */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Anchor className="h-6 w-6 text-indigo-500" />
            仕掛けの作り方
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="mb-4 text-sm text-muted-foreground">
                ジェット天秤を使った投げ釣り仕掛けは非常にシンプルです。以下の順番で接続するだけ。
              </p>
              <RigConnectionDiagram />

              <div className="mt-6 space-y-3">
                <div className="flex gap-3 rounded-lg border p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                    1
                  </span>
                  <div>
                    <p className="font-medium">道糸にスナップサルカンを結ぶ</p>
                    <p className="text-sm text-muted-foreground">
                      リールの道糸の先端にスナップサルカンを結びます。クリンチノットやユニノットでOK。
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800">
                    2
                  </span>
                  <div>
                    <p className="font-medium">
                      ジェット天秤をスナップに接続
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ジェット天秤の道糸側のアイ（ウイングがある側）をスナップに挟みます。パチンと閉じるだけ。
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-800">
                    3
                  </span>
                  <div>
                    <p className="font-medium">
                      ハリス側にハリスを結ぶ
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ジェット天秤のもう一方のアイにハリス（フロロカーボン 1.5〜3号、長さ50cm〜1m）を結びます。
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-800">
                    4
                  </span>
                  <div>
                    <p className="font-medium">針を結んで完成</p>
                    <p className="text-sm text-muted-foreground">
                      ハリスの先端に投げ釣り用の針（流線型 7〜12号）を結べば仕掛けの完成です。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ===== 5. おすすめの号数 ===== */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Target className="h-6 w-6 text-orange-500" />
            おすすめの号数
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            ジェット天秤は号数（重さ）によって飛距離や対応する竿が変わります。
            用途に合わせて選びましょう。
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {SINKER_SIZES.map((s) => (
              <Card key={s.gou} className={s.color}>
                <CardContent className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-xl font-bold">{s.gou}</h3>
                    <Badge className={s.badge}>{s.recommended}</Badge>
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    重さ: {s.weight}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium">用途:</span> {s.use}
                    </p>
                    <p>
                      <span className="font-medium">対象魚:</span> {s.target}
                    </p>
                    <p>
                      <span className="font-medium">飛距離:</span>{" "}
                      {s.distance}
                    </p>
                    <p>
                      <span className="font-medium">対応竿:</span> {s.rod}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ===== 6. 実釣レポート ===== */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <MapPin className="h-6 w-6 text-red-500" />
            実釣レポート
          </h2>
          <Card className="overflow-hidden border-amber-200">
            <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
              <Image
                src="/images/catch-reports/jet-sinker-magochi.jpg"
                alt="京都府舞鶴市・田井漁港でジェット天秤と泳がせ釣りで釣り上げたマゴチ（40cm級）"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
            <CardContent className="p-6">
              <Badge className="mb-3 bg-amber-100 text-amber-800">
                2025年11月29日
              </Badge>
              <h3 className="mb-2 text-lg font-bold">
                ジェット天秤+泳がせ釣りでマゴチ（40cm級）
              </h3>
              <p className="mb-3 leading-relaxed text-muted-foreground">
                京都府舞鶴市の<strong>田井漁港</strong>にて、ジェット天秤を使った泳がせ釣りで<strong>マゴチ（40cm級）</strong>を釣り上げました。
                サビキで釣ったアジを生きエサに、10号のジェット天秤で沖のポイントへ遠投。根がかりの多いポイントでしたが、ジェット天秤の浮き上がり効果のおかげでスムーズに回収でき、
                ストレスなく泳がせ釣りを楽しめました。
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                マゴチは砂底に潜む底物のフィッシュイーター。泳がせ釣りの好ターゲットで、ジェット天秤との相性は抜群です。
                刺身にすると絶品で、釣り人の間では「照りゴチ」（夏のマゴチ）が最高と言われています。
              </p>
              <Link
                href="/spots/tai-port-maizuru"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <MapPin className="h-4 w-4" />
                田井漁港（舞鶴市）の釣りスポット情報を見る
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* ===== 7. おすすめ商品 ===== */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <ExternalLink className="h-6 w-6 text-emerald-500" />
            おすすめ商品
          </h2>
          <Card className="border-emerald-200">
            <CardContent className="p-6">
              <h3 className="mb-3 font-bold">ジェット天秤</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                初心者でも遠投できて根がかりしにくい、投げ釣りの必須アイテム。
                まずは8〜10号から始めて、自分の釣り場に合った号数を見つけましょう。
              </p>
              <a
                href="https://amzn.to/4l7BnQg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-bold text-white shadow transition-colors hover:bg-amber-600"
              >
                <ExternalLink className="h-4 w-4" />
                Amazonで見る
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                ※ 上記はAmazonアソシエイトリンクです
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ===== FAQ ===== */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold">よくある質問</h2>
          <div className="space-y-3">
            {faqJsonLd.mainEntity.map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <h3 className="mb-2 font-bold">{faq.name}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.acceptedAnswer.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ===== 関連ガイド ===== */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-bold">関連ガイド</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guide/sinker">
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Anchor className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">おもりの種類と選び方</p>
                    <p className="text-sm text-muted-foreground">
                      12種類のおもりを徹底解説
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/choinage">
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Target className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">ちょい投げ入門</p>
                    <p className="text-sm text-muted-foreground">
                      堤防から手軽に投げ釣り
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/oyogase">
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Fish className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">泳がせ釣り入門</p>
                    <p className="text-sm text-muted-foreground">
                      生きエサで大物を狙う方法
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/casting">
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <Waves className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="font-medium">キャスティング入門</p>
                    <p className="text-sm text-muted-foreground">
                      遠投テクニックを磨こう
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <LineBanner />
      </div>
    </>
  );
}
