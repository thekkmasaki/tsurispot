import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Package,
  Fish,
  MapPin,
  ShieldCheck,
  HelpCircle,
  Anchor,
  Target,
  Waves,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fishingSpots } from "@/lib/data/spots";
import { ProductList } from "@/components/affiliate/product-list";
import { getBeginnerEssentials } from "@/lib/data/products";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣り初心者完全ガイド - ゼロから始める釣り入門【2025年版】",
  description:
    "釣りを始めたい初心者のための完全ガイド。釣りの魅力、最初に揃えるべき道具、初心者におすすめの釣り方（サビキ釣り・ちょい投げ・穴釣り）、おすすめスポット、基本マナーまで徹底解説。この記事を読めば、あなたも今日から釣り人デビューできます。",
  openGraph: {
    title: "釣り初心者完全ガイド - ゼロから始める釣り入門",
    description:
      "釣りの魅力から道具選び、おすすめの釣り方、スポット選び、マナーまで。初心者に必要な情報を完全網羅。",
    type: "article",
    url: "https://tsurispot.com/guide/beginner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/beginner",
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
      name: "釣り初心者完全ガイド",
      item: "https://tsurispot.com/guide/beginner",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "釣り初心者が釣りを始めるための5ステップ",
  description:
    "釣りをゼロから始めるための手順を5つのステップで解説。道具の準備から釣り場選び、実釣、マナーまで。",
  totalTime: "PT4H",
  supply: [
    { "@type": "HowToSupply", name: "釣り竿（万能竿またはサビキセット）" },
    { "@type": "HowToSupply", name: "スピニングリール（2000〜3000番）" },
    { "@type": "HowToSupply", name: "仕掛け（サビキ仕掛けなど）" },
    { "@type": "HowToSupply", name: "エサ（アミエビまたは青イソメ）" },
    { "@type": "HowToSupply", name: "バケツ・クーラーボックス" },
  ],
  tool: [
    { "@type": "HowToTool", name: "ハサミまたはラインカッター" },
    { "@type": "HowToTool", name: "プライヤー（針外し）" },
    { "@type": "HowToTool", name: "タオル" },
    { "@type": "HowToTool", name: "ゴミ袋" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "釣りのスタイルを決める",
      text: "サビキ釣り、ちょい投げ、穴釣りなど初心者向けの釣り方から自分に合ったスタイルを選びます。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "道具を揃える",
      text: "竿・リール・仕掛け・エサなど必要な道具を準備します。初心者セットなら3,000〜5,000円で一式揃います。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "釣り場を選ぶ",
      text: "初心者には足場の安定した漁港や堤防がおすすめ。トイレや駐車場の有無も確認しましょう。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "釣りに出かける",
      text: "朝マズメ（日の出前後）が最も釣れやすい時間帯。天気予報と潮汐情報を事前にチェックしましょう。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "マナーを守って片付ける",
      text: "ゴミは必ず持ち帰り、釣り場を水で洗い流します。釣り禁止区域では釣りをしないこと。",
      position: 5,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "釣りを始めるのにいくらかかりますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者向けのサビキ釣りセットなら3,000〜5,000円で竿・リール・仕掛けが一式揃います。エサ代（500〜1,000円程度）とクーラーボックス（1,000〜3,000円）を含めても、1万円以内で始められます。",
      },
    },
    {
      "@type": "Question",
      name: "釣り初心者が最初にやるべき釣り方は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "サビキ釣りが最もおすすめです。投げる技術が不要で、足元に仕掛けを落とすだけ。アジやイワシなどが群れで釣れるので、初心者でも数釣りが楽しめます。",
      },
    },
    {
      "@type": "Question",
      name: "釣りに免許や許可は必要ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "海釣りの場合、基本的に免許は不要です。ただし、一部の漁港や釣り施設では入場料がかかる場合があります。川や湖での釣りは遊漁券（遊漁料）が必要な場合が多いので、事前に確認しましょう。",
      },
    },
    {
      "@type": "Question",
      name: "釣りに最適な時間帯はいつですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "朝マズメ（日の出前後の1〜2時間）と夕マズメ（日没前後の1〜2時間）が最も魚の活性が高く釣れやすい時間帯です。特に朝マズメがおすすめです。",
      },
    },
    {
      "@type": "Question",
      name: "子供と一緒に釣りに行けますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい、ファミリーフィッシングは大変人気があります。海釣り公園や足場の良い漁港なら安全に楽しめます。お子さんにはライフジャケットを必ず着用させ、柵のある場所を選びましょう。サビキ釣りなら小さなお子さんでも簡単に魚が釣れます。",
      },
    },
    {
      "@type": "Question",
      name: "釣った魚はどうすればいいですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "クーラーボックスに氷と一緒に入れて持ち帰り、自宅で調理できます。アジなら刺身やフライ、イワシなら煮付けが定番。小さすぎる魚やリリースする魚は、優しく海に戻してあげましょう。",
      },
    },
  ],
};

/* --- SVG図解コンポーネント --- */

function FishingFlowDiagram() {
  const steps = [
    { label: "準備", sub: "道具・エサを揃える", color: "#3B82F6", icon: "M12 2L15 8H9L12 2Z M9 9H15V15H9V9Z" },
    { label: "移動", sub: "釣り場へ向かう", color: "#60A5FA", icon: "M5 17L12 5L19 17H5Z" },
    { label: "セットアップ", sub: "仕掛けを組む", color: "#22C55E", icon: "M8 4H16V8H8V4Z M6 9H18V14H6V9Z" },
    { label: "釣り", sub: "いよいよ実釣！", color: "#F59E0B", icon: "M12 3C16.97 3 21 7.03 21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3Z" },
    { label: "片付け", sub: "ゴミ持ち帰り", color: "#EF4444", icon: "M6 6H18L17 20H7L6 6Z M4 4H20V6H4V4Z" },
  ];
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 700 140"
        width="100%"
        style={{ maxWidth: 700 }}
        aria-label="釣りの基本フロー図：準備、移動、セットアップ、釣り、片付けの5ステップ"
        role="img"
      >
        <rect x="0" y="0" width="700" height="140" rx="12" fill="#EFF6FF" />
        {steps.map((s, i) => {
          const cx = 70 + i * 145;
          return (
            <g key={i}>
              <rect x={cx - 55} y={15} width={110} height={90} rx="10" fill="white" stroke={s.color} strokeWidth="2" />
              <circle cx={cx} cy={42} r="16" fill={s.color} opacity="0.15" />
              <text x={cx} y={47} textAnchor="middle" fontSize="16" fill={s.color} fontWeight="bold">{i + 1}</text>
              <text x={cx} y={72} textAnchor="middle" fontSize="13" fill="#1E293B" fontWeight="bold">{s.label}</text>
              <text x={cx} y={90} textAnchor="middle" fontSize="10" fill="#64748B">{s.sub}</text>
              {i < steps.length - 1 && (
                <polygon points={`${cx + 60},55 ${cx + 75},60 ${cx + 60},65`} fill="#94A3B8" />
              )}
            </g>
          );
        })}
        <text x="350" y="132" textAnchor="middle" fontSize="11" fill="#64748B">釣りの基本フロー（5ステップ）</text>
      </svg>
    </div>
  );
}

function TackleDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 320"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="基本的なタックル構成図：竿、リール、道糸、仕掛け、エサの全体図"
        role="img"
      >
        <rect x="0" y="0" width="600" height="320" rx="12" fill="#F9FAFB" />
        {/* 竿（ロッド） */}
        <line x1="80" y1="40" x2="520" y2="40" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <line x1="80" y1="40" x2="520" y2="40" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeDasharray="0" />
        {/* 竿先（穂先） */}
        <circle cx="520" cy="40" r="4" fill="#EF4444" />
        {/* グリップ */}
        <rect x="60" y="33" width="80" height="14" rx="5" fill="#92400E" opacity="0.7" />
        {/* リール */}
        <ellipse cx="160" cy="65" rx="25" ry="18" fill="#E2E8F0" stroke="#3B82F6" strokeWidth="2" />
        <circle cx="160" cy="65" r="8" fill="#3B82F6" opacity="0.3" />
        <text x="160" y="69" textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="bold">リール</text>
        {/* 道糸 */}
        <line x1="520" y1="40" x2="520" y2="130" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 2" />
        {/* ウキ */}
        <ellipse cx="520" cy="130" rx="10" ry="16" fill="#EF4444" opacity="0.8" />
        <text x="520" y="134" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">ウキ</text>
        {/* ハリス */}
        <line x1="520" y1="146" x2="520" y2="230" stroke="#60A5FA" strokeWidth="1.5" />
        {/* オモリ */}
        <ellipse cx="520" cy="215" rx="8" ry="6" fill="#64748B" />
        {/* サビキ仕掛け（針複数） */}
        <line x1="520" y1="230" x2="520" y2="290" stroke="#60A5FA" strokeWidth="1.5" />
        {[240, 255, 270].map((y, i) => (
          <g key={i}>
            <line x1="520" y1={y} x2="540" y2={y + 8} stroke="#F59E0B" strokeWidth="1.5" />
            <path d={`M540,${y + 8} Q545,${y + 12} 538,${y + 13}`} stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          </g>
        ))}
        {/* コマセカゴ */}
        <rect x="510" y="285" width="20" height="18" rx="3" fill="#22C55E" opacity="0.7" stroke="#22C55E" strokeWidth="1" />
        <text x="520" y="298" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">カゴ</text>

        {/* ラベル（引き出し線） */}
        {/* 竿ラベル */}
        <line x1="300" y1="40" x2="300" y2="20" stroke="#94A3B8" strokeWidth="1" />
        <rect x="245" y="5" width="110" height="18" rx="4" fill="#3B82F6" />
        <text x="300" y="17" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">竿（ロッド）2〜3m</text>
        {/* リールラベル */}
        <line x1="160" y1="83" x2="160" y2="105" stroke="#94A3B8" strokeWidth="1" />
        <rect x="95" y="105" width="130" height="18" rx="4" fill="#3B82F6" />
        <text x="160" y="118" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">リール（2000〜3000番）</text>
        {/* 道糸ラベル */}
        <line x1="520" y1="85" x2="470" y2="85" stroke="#94A3B8" strokeWidth="1" />
        <rect x="395" y="77" width="75" height="18" rx="4" fill="#60A5FA" />
        <text x="432" y="90" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">道糸（ライン）</text>
        {/* ウキラベル */}
        <line x1="510" y1="130" x2="440" y2="130" stroke="#94A3B8" strokeWidth="1" />
        <rect x="405" y="122" width="35" height="18" rx="4" fill="#EF4444" />
        <text x="422" y="135" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">ウキ</text>
        {/* ハリスラベル */}
        <line x1="520" y1="185" x2="460" y2="185" stroke="#94A3B8" strokeWidth="1" />
        <rect x="415" y="177" width="45" height="18" rx="4" fill="#60A5FA" opacity="0.8" />
        <text x="437" y="190" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">ハリス</text>
        {/* 針ラベル */}
        <line x1="540" y1="255" x2="570" y2="255" stroke="#94A3B8" strokeWidth="1" />
        <rect x="570" y="247" width="25" height="18" rx="4" fill="#F59E0B" />
        <text x="582" y="260" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">針</text>
        {/* カゴラベル */}
        <line x1="530" y1="294" x2="570" y2="294" stroke="#94A3B8" strokeWidth="1" />
        <rect x="570" y="286" width="25" height="18" rx="4" fill="#22C55E" />
        <text x="582" y="299" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">カゴ</text>

        {/* タイトル */}
        <text x="200" y="155" fontSize="13" fill="#1E293B" fontWeight="bold">基本的なタックル構成図</text>
        <text x="200" y="172" fontSize="10" fill="#64748B">（サビキ釣りの場合）</text>

        {/* 水面ライン */}
        <line x1="470" y1="110" x2="600" y2="110" stroke="#93C5FD" strokeWidth="1" strokeDasharray="6 3" opacity="0.6" />
        <text x="585" y="108" fontSize="9" fill="#93C5FD">水面</text>
      </svg>
    </div>
  );
}

function ReelAnimationSvg() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 400 350"
        width="100%"
        style={{ maxWidth: 400 }}
        aria-label="リールの巻き取りアニメーション：ハンドルが回転し、ラインが巻き取られて魚が引き寄せられるイメージ"
        role="img"
      >
        <style>{`
          @keyframes reelHandleRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes lineReel {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -40; }
          }
          @keyframes fishPull {
            0% { transform: translateX(0); }
            50% { transform: translateX(-100px); }
            100% { transform: translateX(0); }
          }
          @keyframes fishTailWag {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(8deg); }
            75% { transform: rotate(-8deg); }
          }
          .reel-handle {
            animation: reelHandleRotate 2s linear infinite;
            transform-origin: 100px 160px;
          }
          .reel-line {
            animation: lineReel 1s linear infinite;
          }
          .fish-group {
            animation: fishPull 4s ease-in-out infinite;
          }
          .fish-tail {
            animation: fishTailWag 0.6s ease-in-out infinite;
            transform-origin: 345px 155px;
          }
        `}</style>

        <rect x="0" y="0" width="400" height="350" rx="12" fill="#F9FAFB" />

        {/* タイトル */}
        <text x="200" y="28" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1E293B">リールの巻き取りイメージ</text>

        {/* リール本体（側面図） */}
        {/* ボディ */}
        <rect x="60" y="120" width="80" height="80" rx="12" fill="#E5E7EB" stroke="#6B7280" strokeWidth="2" />
        {/* スプール（中央の円） */}
        <circle cx="100" cy="160" r="28" fill="#D1D5DB" stroke="#6B7280" strokeWidth="2" />
        <circle cx="100" cy="160" r="18" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5" />
        <circle cx="100" cy="160" r="6" fill="#9CA3AF" />
        {/* リール脚 */}
        <rect x="85" y="200" width="30" height="10" rx="3" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
        {/* 竿（簡略） */}
        <rect x="80" y="210" width="40" height="8" rx="4" fill="#92400E" opacity="0.7" />

        {/* ハンドル（回転するパーツ） */}
        <g className="reel-handle">
          {/* ハンドルアーム */}
          <line x1="100" y1="160" x2="100" y2="120" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
          {/* ハンドルノブ */}
          <circle cx="100" cy="117" r="7" fill="#374151" stroke="#1F2937" strokeWidth="1.5" />
          <circle cx="100" cy="117" r="3" fill="#6B7280" />
        </g>

        {/* 竿先〜ガイド */}
        <line x1="140" y1="160" x2="160" y2="100" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
        <circle cx="160" cy="98" r="3" fill="none" stroke="#6B7280" strokeWidth="1.5" />

        {/* ライン（点線が移動） */}
        <line x1="160" y1="98" x2="320" y2="155" stroke="#3B82F6" strokeWidth="2" strokeDasharray="8 4" className="reel-line" />

        {/* 水面 */}
        <line x1="0" y1="240" x2="400" y2="240" stroke="#93C5FD" strokeWidth="1" strokeDasharray="8 4" opacity="0.5" />
        <text x="380" y="237" textAnchor="end" fontSize="9" fill="#93C5FD">水面</text>

        {/* 魚（引き寄せられる） */}
        <g className="fish-group">
          {/* 魚の体 */}
          <ellipse cx="330" cy="155" rx="22" ry="12" fill="#22C55E" opacity="0.9" />
          {/* 尾びれ */}
          <g className="fish-tail">
            <polygon points="352,155 365,145 365,165" fill="#22C55E" opacity="0.9" />
          </g>
          {/* 目 */}
          <circle cx="316" cy="152" r="3" fill="white" />
          <circle cx="316" cy="152" r="1.5" fill="#1E293B" />
          {/* 口 */}
          <ellipse cx="308" cy="155" rx="2" ry="1.5" fill="#166534" />
        </g>

        {/* 矢印表示（引き寄せ方向） */}
        <defs>
          <marker id="reelArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#3B82F6" />
          </marker>
        </defs>
        <line x1="280" y1="190" x2="220" y2="190" stroke="#3B82F6" strokeWidth="1.5" markerEnd="url(#reelArrow)" />
        <text x="250" y="206" textAnchor="middle" fontSize="9" fill="#3B82F6">巻き取り方向</text>

        {/* 操作説明 */}
        <rect x="30" y="260" width="340" height="70" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <circle cx="55" cy="280" r="8" fill="#3B82F6" opacity="0.15" />
        <text x="55" y="284" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3B82F6">1</text>
        <text x="70" y="284" fontSize="10" fill="#374151">ハンドルを回してラインを巻き取る</text>
        <circle cx="55" cy="305" r="8" fill="#22C55E" opacity="0.15" />
        <text x="55" y="309" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#22C55E">2</text>
        <text x="70" y="309" fontSize="10" fill="#374151">魚が手前に引き寄せられる</text>

        {/* ラベル */}
        <text x="200" y="342" textAnchor="middle" fontSize="10" fill="#64748B">リールの巻き取りイメージ</text>
      </svg>
    </div>
  );
}

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

export default function BeginnerGuidePage() {
  // 初心者向けの漁港・堤防スポットを取得（最大6件）
  const beginnerSpots = fishingSpots
    .filter(
      (s) =>
        (s.spotType === "port" || s.spotType === "breakwater") &&
        s.difficulty === "beginner"
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

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
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "ガイド", href: "/guide" },
          { label: "初心者完全ガイド" },
        ]} />
        {/* 戻るリンク */}
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
            釣り初心者完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            釣りの魅力から道具選び、おすすめの釣り方、マナーまで。
            <br className="hidden sm:inline" />
            この記事を読めば、あなたも今日から釣り人デビューできます。
          </p>
        </div>

        {/* 目次 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="mb-3 font-medium text-foreground">この記事の内容</p>
            <ol className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                <a href="#charm" className="hover:text-primary hover:underline">
                  1. 釣りの魅力とは
                </a>
              </li>
              <li>
                <a href="#gear" className="hover:text-primary hover:underline">
                  2. 最初に揃えるべき道具
                </a>
              </li>
              <li>
                <a
                  href="#methods"
                  className="hover:text-primary hover:underline"
                >
                  3. 初心者におすすめの釣り方
                </a>
              </li>
              <li>
                <a href="#spots" className="hover:text-primary hover:underline">
                  4. 初心者におすすめのスポットタイプ
                </a>
              </li>
              <li>
                <a
                  href="#manner"
                  className="hover:text-primary hover:underline"
                >
                  5. 釣りの基本マナーとルール
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary hover:underline">
                  6. よくある質問
                </a>
              </li>
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* 釣りの魅力とは */}
          <section id="charm">
            <SectionCard title="釣りの魅力とは" icon={Sparkles}>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                釣りは日本で古くから親しまれてきたレジャーのひとつです。自然の中で過ごしながら、魚との知恵比べを楽しめる奥深い趣味です。近年はファミリーフィッシングや女性アングラーも増え、性別や年齢を問わず人気が高まっています。
              </p>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      手軽に始められる
                    </span>
                    <br />
                    サビキ釣りセットなら3,000円程度から購入可能。投げる技術がなくても、足元に仕掛けを落とすだけで魚が釣れます。初期投資が少なく、気軽に始められるのが大きな魅力です。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      自然とのふれあい
                    </span>
                    <br />
                    海や川のそばで、潮風や鳥のさえずりを感じながら過ごす時間は格別です。日常のストレスから解放され、リフレッシュ効果も抜群。釣りは最高のアウトドアアクティビティです。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      釣った魚を食べる楽しみ
                    </span>
                    <br />
                    自分で釣った魚は格別の味わいです。新鮮なアジの刺身、揚げたてのキスの天ぷら、カサゴの煮付けなど、スーパーでは味わえない最高の鮮度で食卓を彩ります。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      家族や仲間との思い出づくり
                    </span>
                    <br />
                    子供が初めて魚を釣った時の笑顔は忘れられません。家族や友人と一緒に楽しめるのも釣りの大きな魅力。世代を超えたコミュニケーションが生まれます。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      終わりのない奥深さ
                    </span>
                    <br />
                    魚種、釣り方、季節、潮、天候...すべてが釣果に影響します。経験を重ねるほど上達を実感でき、一生楽しめる趣味です。サビキ釣りから始めて、ルアーやフカセ釣りにステップアップする楽しみもあります。
                  </div>
                </div>
              </div>
            </SectionCard>
          </section>

          {/* 釣りの基本フロー図 */}
          <FishingFlowDiagram />

          {/* 最初に揃えるべき道具 */}
          <section id="gear">
            <SectionCard title="最初に揃えるべき道具" icon={Package}>
              <p className="mb-4 text-sm text-muted-foreground">
                釣りを始めるにあたって最低限必要な道具をリストアップしました。すべてを個別に買い揃える必要はなく、初心者セットを購入すれば竿・リール・仕掛けが一式揃います。
              </p>

              {/* タックル構成図 */}
              <TackleDiagram />

              {/* リール巻き取りアニメーション */}
              <h3 className="mb-3 mt-6 font-medium text-foreground">
                動きで見るリールの使い方
              </h3>
              <p className="mb-2 text-sm text-muted-foreground">
                リールのハンドルを回すと、ラインが巻き取られて魚が引き寄せられます。
              </p>
              <ReelAnimationSvg />

              <h3 className="mb-3 font-medium text-foreground">
                必須の道具（これだけあれば釣りができる）
              </h3>
              <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">竿（ロッド）：</span>
                  万能竿またはサビキ用の竿（2〜3m）。初心者セットに含まれていることが多い。振り出し式（伸縮式）が持ち運びに便利です。
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">リール：</span>
                  小〜中型のスピニングリール（2000〜3000番）。糸付きのものを選べば、ライン選びの手間も省けます。
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">仕掛け：</span>
                  サビキ仕掛け（4〜6号）が最も万能。コマセカゴとセットになったものが便利です。予備を2〜3セット用意しておくと安心。
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">エサ：</span>
                  サビキ釣りならアミエビ（冷凍またはチューブタイプ）。ちょい投げなら青イソメ。釣具店やエサ屋で購入できます。
                </li>
              </ul>

              <h3 className="mb-3 font-medium text-foreground">
                あると便利な道具
              </h3>
              <ul className="mb-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">バケツ：</span>
                  コマセを入れたり、釣った魚を一時的に入れたり、帰りに釣り場を洗い流すのに使います。折りたたみ式が便利。
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">
                    クーラーボックス：
                  </span>
                  釣った魚を新鮮に持ち帰るために必要。氷と一緒に入れましょう。発泡スチロールの箱でも代用可能。
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">
                    ハサミ・プライヤー：
                  </span>
                  釣り糸を切ったり、魚から針を外したりするのに使います。専用のフィッシングプライヤーがあると便利。
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">タオル：</span>
                  手を拭いたり、魚を掴んだりするのに使います。2〜3枚あると重宝します。
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">ゴミ袋：</span>
                  釣り糸の切れ端やエサの容器など、ゴミは必ず持ち帰りましょう。
                </li>
              </ul>

              <Hint>
                初心者は「サビキ釣りセット」の購入が最もおすすめです。竿・リール・仕掛け・カゴがセットになって3,000〜5,000円程度。釣具店やネット通販で購入できます。個別に買い揃えるよりもずっとお得で、相性の心配もありません。
              </Hint>

              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium text-foreground">
                  予算の目安
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    最小限コース（約5,000円）：サビキセット + エサ + バケツ
                  </p>
                  <p>
                    おすすめコース（約10,000円）：サビキセット + エサ + バケツ +
                    クーラーボックス + 小物類
                  </p>
                  <p>
                    しっかりコース（約20,000円）：単品で良い竿・リールを揃える +
                    アクセサリー一式
                  </p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  詳しくは
                  <Link
                    href="/guide/budget"
                    className="text-primary hover:underline"
                  >
                    釣りの費用ガイド
                  </Link>
                  をご覧ください。
                </p>
              </div>
            </SectionCard>
          </section>

          {/* 初心者におすすめの釣り方 */}
          <section id="methods">
            <SectionCard title="初心者におすすめの釣り方" icon={Fish}>
              <p className="mb-4 text-sm text-muted-foreground">
                釣り方にはさまざまな種類がありますが、初心者は以下の3つから始めるのがおすすめです。いずれも特別な技術が不要で、手軽に魚が釣れます。
              </p>

              {/* サビキ釣り */}
              <div className="mb-6 rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Anchor className="size-5 text-primary" />
                  <h3 className="text-lg font-bold">サビキ釣り</h3>
                  <Badge variant="secondary" className="text-xs">
                    最もおすすめ
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  コマセ（撒き餌）で魚を集めて、疑似餌のついた複数の針で釣る方法です。投げる技術は不要で、足元に仕掛けを落とすだけ。群れが回ってくれば、一度にたくさんの魚が釣れるので初心者でも高い満足度が得られます。
                </p>
                <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">対象魚：</span>
                    <Link
                      href="/fish/aji"
                      className="text-primary hover:underline"
                    >
                      アジ
                    </Link>
                    、
                    <Link
                      href="/fish/saba"
                      className="text-primary hover:underline"
                    >
                      サバ
                    </Link>
                    、
                    <Link
                      href="/fish/iwashi"
                      className="text-primary hover:underline"
                    >
                      イワシ
                    </Link>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      ベストシーズン：
                    </span>
                    6〜10月（夏〜秋）
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      おすすめの場所：
                    </span>
                    漁港、堤防
                  </p>
                  <p>
                    <span className="font-medium text-foreground">難易度：</span>
                    初心者向け
                  </p>
                </div>
                <Link
                  href="/guide/sabiki"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  サビキ釣り完全ガイドを読む
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              {/* ちょい投げ */}
              <div className="mb-6 rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="size-5 text-primary" />
                  <h3 className="text-lg font-bold">ちょい投げ釣り</h3>
                  <Badge variant="secondary" className="text-xs">
                    砂浜でも楽しめる
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  軽いオモリとエサ（青イソメ）をつけた仕掛けを、20〜30mほど軽く投げて底に生息する魚を狙う釣り方です。本格的な投げ釣りよりも手軽で、万能竿でも楽しめます。砂地の海底にいるキスやハゼが主なターゲットで、天ぷらにすると絶品です。
                </p>
                <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">対象魚：</span>
                    <Link
                      href="/fish/kisu"
                      className="text-primary hover:underline"
                    >
                      キス
                    </Link>
                    、
                    <Link
                      href="/fish/haze"
                      className="text-primary hover:underline"
                    >
                      ハゼ
                    </Link>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      ベストシーズン：
                    </span>
                    キスは5〜9月、ハゼは7〜11月
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      おすすめの場所：
                    </span>
                    砂浜、漁港内の砂地
                  </p>
                  <p>
                    <span className="font-medium text-foreground">難易度：</span>
                    初心者向け（軽く投げる技術が必要）
                  </p>
                </div>
                <Link
                  href="/guide/choinage"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  ちょい投げ釣り完全ガイドを読む
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              {/* 穴釣り */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Waves className="size-5 text-primary" />
                  <h3 className="text-lg font-bold">穴釣り</h3>
                  <Badge variant="secondary" className="text-xs">
                    年中楽しめる
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  テトラポッドや岩の隙間に仕掛けを落として、穴に潜んでいる根魚（ロックフィッシュ）を釣る方法です。必要な道具が少なく、短い竿でできるので荷物が少なく済みます。他の釣り方で魚が釣れない時でも、穴釣りなら高確率で魚に出会えるのが嬉しいポイント。
                </p>
                <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">対象魚：</span>
                    <Link
                      href="/fish/kasago"
                      className="text-primary hover:underline"
                    >
                      カサゴ
                    </Link>
                    、
                    <Link
                      href="/fish/mebaru"
                      className="text-primary hover:underline"
                    >
                      メバル
                    </Link>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      ベストシーズン：
                    </span>
                    年中OK（特に秋〜冬がベスト）
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      おすすめの場所：
                    </span>
                    テトラポッドのある堤防、岩場
                  </p>
                  <p>
                    <span className="font-medium text-foreground">難易度：</span>
                    初心者向け（足場に注意）
                  </p>
                </div>
                <Link
                  href="/guide/anazuri"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  穴釣り完全ガイドを読む
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              <Hint>
                まずはサビキ釣りから始めて、慣れてきたらちょい投げや穴釣りに挑戦するのがおすすめの順番です。サビキ釣りで使った竿・リールは他の釣りにもそのまま使えます。
              </Hint>
            </SectionCard>
          </section>

          {/* 初心者におすすめのスポットタイプ */}
          <section id="spots">
            <SectionCard title="初心者におすすめのスポットタイプ" icon={MapPin}>
              <p className="mb-4 text-sm text-muted-foreground">
                初心者が釣り場を選ぶときに最も重要なのは「安全性」と「利便性」です。以下の2つのスポットタイプがおすすめです。
              </p>

              <div className="mb-4 space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    漁港（ポート）
                  </h3>
                  <p className="mb-2 text-sm text-muted-foreground">
                    漁港は波が穏やかで足場が安定しているため、初心者やファミリーに最適です。車を近くに停められることが多く、荷物の運搬も楽。サビキ釣りで回遊魚を狙うのが定番スタイルです。漁港内の堤防や岸壁が主な釣り座になります。
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ただし、漁業関係者の邪魔にならないよう配慮が必要です。漁船の航路や作業場所は避けましょう。
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    堤防（防波堤）
                  </h3>
                  <p className="mb-2 text-sm text-muted-foreground">
                    堤防はコンクリートで整備されており、足場がフラットで安全です。外海に面した側と内海に面した側があり、初心者は波の穏やかな内海側がおすすめ。外海側はより大きな魚が狙えますが、波が高い日は注意が必要です。
                  </p>
                  <p className="text-xs text-muted-foreground">
                    柵のない堤防では、ライフジャケットの着用を推奨します。
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                <span className="font-medium">釣り場選びのチェックポイント</span>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>トイレがあるか</li>
                  <li>駐車場があるか（有料/無料）</li>
                  <li>近くにコンビニや釣具店があるか</li>
                  <li>足場は安定しているか</li>
                  <li>釣り禁止エリアではないか</li>
                  <li>レンタル竿があるか（手ぶらでも行ける）</li>
                </ul>
              </div>

              {beginnerSpots.length > 0 && (
                <div>
                  <h3 className="mb-3 font-medium text-foreground">
                    初心者におすすめのスポット
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {beginnerSpots.map((spot) => (
                      <Link
                        key={spot.id}
                        href={`/spots/${spot.slug}`}
                        className="group flex items-center gap-2 rounded-lg border p-3 transition-colors hover:border-primary"
                      >
                        <MapPin className="size-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium group-hover:text-primary">
                            {spot.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {spot.region.prefecture} {spot.region.areaName}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/spots">
                        すべてのスポットを見る
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </SectionCard>
          </section>

          {/* 釣りの基本マナーとルール */}
          <section id="manner">
            <SectionCard title="釣りの基本マナーとルール" icon={ShieldCheck}>
              <p className="mb-4 text-sm text-muted-foreground">
                釣りを長く楽しむためには、マナーとルールを守ることが大切です。マナー違反が原因で釣り禁止になる場所が年々増えています。一人ひとりの心がけが、釣り場の未来を守ります。
              </p>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      ゴミは必ず持ち帰る
                    </span>
                    <br />
                    釣り糸、仕掛けの袋、エサの容器、飲食のゴミなど、持ち込んだものはすべて持ち帰りましょう。特に切れた釣り糸は鳥や海洋生物に絡まり、命を奪うこともあります。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      釣り場を洗い流す
                    </span>
                    <br />
                    コマセや魚の血で汚れた釣り場は、帰る前に海水で洗い流しましょう。「来た時よりもきれいに」が釣り人の心得です。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      釣り禁止・立入禁止区域を守る
                    </span>
                    <br />
                    標識がある場所では絶対に釣りをしないでください。違反すると法的な罰則を受ける場合もあります。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      他の釣り人への配慮
                    </span>
                    <br />
                    隣の人との間隔を適度に空ける（最低2〜3m）、大声を出さない、仕掛けが交差しないよう注意する。挨拶を忘れずに。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      安全対策を怠らない
                    </span>
                    <br />
                    ライフジャケットの着用を推奨。滑りにくい靴を履く。天候が悪化したら無理をせず撤退する。特に波の高い日や雷の接近時は危険です。
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">
                      小さな魚はリリースする
                    </span>
                    <br />
                    食べきれない量の魚や、小さすぎる魚は優しく海に戻しましょう。資源保護につながります。地域によってはサイズ制限がある場合もあります。
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href="/fishing-rules"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  釣りのルールをもっと詳しく見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>
            </SectionCard>
          </section>

          {/* よくある質問 */}
          <section id="faq">
            <SectionCard title="よくある質問（FAQ）" icon={HelpCircle}>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    Q. 釣りを始めるのにいくらかかりますか？
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    初心者向けのサビキ釣りセットなら3,000〜5,000円で竿・リール・仕掛けが一式揃います。エサ代（500〜1,000円程度）とクーラーボックス（1,000〜3,000円）を含めても、1万円以内で始められます。
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    Q. 釣り初心者が最初にやるべき釣り方は？
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    サビキ釣りが最もおすすめです。投げる技術が不要で、足元に仕掛けを落とすだけ。
                    <Link
                      href="/fish/aji"
                      className="text-primary hover:underline"
                    >
                      アジ
                    </Link>
                    や
                    <Link
                      href="/fish/iwashi"
                      className="text-primary hover:underline"
                    >
                      イワシ
                    </Link>
                    などが群れで釣れるので、初心者でも数釣りが楽しめます。詳しくは
                    <Link
                      href="/guide/sabiki"
                      className="text-primary hover:underline"
                    >
                      サビキ釣り完全ガイド
                    </Link>
                    をご覧ください。
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    Q. 釣りに免許や許可は必要ですか？
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    海釣りの場合、基本的に免許は不要です。ただし、一部の漁港や釣り施設では入場料がかかる場合があります。川や湖での釣りは遊漁券（遊漁料）が必要な場合が多いので、事前に確認しましょう。
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    Q. 釣りに最適な時間帯はいつですか？
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    朝マズメ（日の出前後の1〜2時間）と夕マズメ（日没前後の1〜2時間）が最も魚の活性が高く釣れやすい時間帯です。特に朝マズメがおすすめ。潮の動きも釣果に影響するので、
                    <Link
                      href="/guide/tide"
                      className="text-primary hover:underline"
                    >
                      潮汐の読み方
                    </Link>
                    も参考にしてみてください。
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    Q. 子供と一緒に釣りに行けますか？
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    はい、ファミリーフィッシングは大変人気があります。海釣り公園や足場の良い漁港なら安全に楽しめます。お子さんにはライフジャケットを必ず着用させ、柵のある場所を選びましょう。詳しくは
                    <Link
                      href="/guide/family"
                      className="text-primary hover:underline"
                    >
                      ファミリーフィッシングガイド
                    </Link>
                    をご覧ください。
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium text-foreground">
                    Q. 釣った魚はどうすればいいですか？
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    クーラーボックスに氷と一緒に入れて持ち帰り、自宅で調理できます。
                    <Link
                      href="/fish/aji"
                      className="text-primary hover:underline"
                    >
                      アジ
                    </Link>
                    なら刺身やフライ、
                    <Link
                      href="/fish/iwashi"
                      className="text-primary hover:underline"
                    >
                      イワシ
                    </Link>
                    なら煮付けが定番。魚の締め方や持ち帰り方は
                    <Link
                      href="/guide/fish-handling"
                      className="text-primary hover:underline"
                    >
                      釣った魚の持ち帰り方ガイド
                    </Link>
                    で詳しく解説しています。
                  </p>
                </div>
              </div>
            </SectionCard>
          </section>
        </div>

        {/* 道具を揃えるなら */}
        <section className="mt-8 sm:mt-10">
          <ProductList
            products={getBeginnerEssentials().slice(0, 4)}
            title="初心者が最初に揃えるべき道具"
            description="これから釣りを始める方におすすめの定番アイテムを厳選しました。"
          />
          <div className="mt-4 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/gear">
                すべてのおすすめ道具を見る
                <ChevronRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* 次に読むガイド */}
        <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-center text-xl font-bold">
            次に読むガイド
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/guide/sabiki" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Anchor className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    サビキ釣り完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    初心者の定番、サビキ釣りを詳しく解説
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/choinage" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Target className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    ちょい投げ釣り完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    キスやハゼを狙うちょい投げの基本
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/anazuri" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Waves className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    穴釣り完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    テトラの隙間で根魚を狙う穴釣り入門
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-base font-medium sm:text-lg">
            さっそく釣りスポットを探してみよう！
          </p>
          <Button asChild size="lg" className="min-h-[48px] rounded-full px-8">
            <Link href="/spots">スポットを探す</Link>
          </Button>
        </div>
      {/* LINE登録バナー */}
      <div className="mt-8 sm:mt-12">
        <LineBanner variant="compact" />
      </div>
      </main>
    </>
  );
}
