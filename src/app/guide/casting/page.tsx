import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import type { YouTubeSearchLink } from "@/types";

const castingVideos: YouTubeSearchLink[] = [
  {
    label: "ちょい投げのやり方",
    searchQuery: "ちょい投げ やり方 初心者 スピニング",
    description: "初心者が最初に覚えるべき軽い投げ方",
  },
  {
    label: "オーバーヘッドキャスト",
    searchQuery: "オーバーヘッドキャスト やり方 釣り 初心者",
    description: "最も基本的な投げ方を動画でマスター",
  },
  {
    label: "糸の放すタイミング",
    searchQuery: "スピニングリール 投げ方 指 離すタイミング",
    description: "飛距離を出すための指を離すタイミングを解説",
  },
];

export const metadata: Metadata = {
  title: "投げ方（キャスティング）の基本 - 初心者ガイド",
  description:
    "オーバーヘッドキャスト、サイドキャスト、ちょい投げの3つの投げ方を解説。よくある失敗と対策も紹介。初心者が安全にキャスティングを学べるガイド。",
  openGraph: {
    title: "投げ方（キャスティング）の基本 - 初心者ガイド",
    description:
      "オーバーヘッドキャスト、サイドキャスト、ちょい投げの3つの投げ方を解説。",
    type: "article",
    url: "https://tsurispot.com/guide/casting",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/casting",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "投げ方（キャスティング）の基本 - ちょい投げ・オーバーヘッド・サイドキャスト",
  description:
    "オーバーヘッドキャスト、サイドキャスト、ちょい投げの3つの投げ方を解説。よくある失敗と対策も紹介。初心者が安全にキャスティングを学べるガイド。",
  totalTime: "PT20M",
  tool: [
    { "@type": "HowToTool", name: "釣り竿" },
    { "@type": "HowToTool", name: "スピニングリール（ライン付き）" },
    { "@type": "HowToTool", name: "練習用おもり（本番前の練習時）" },
  ],
  step: [
    {
      "@type": "HowToSection",
      name: "ちょい投げ（初心者向け）",
      itemListElement: [
        {
          "@type": "HowToStep",
          name: "後方の安全確認をする",
          text: "振りかぶる方向に人がいないか必ず確認します。左右も見渡しましょう。",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "ベイルを起こし、人差し指で糸を押さえる",
          text: "リールのベイルを起こして、人差し指の第一関節あたりに糸をかけて押さえます。",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "竿を軽く後ろに引く",
          text: "大きく振りかぶる必要はありません。竿先を肩の高さくらいまで後ろに引きます。",
          position: 3,
        },
        {
          "@type": "HowToStep",
          name: "前方に振り出し、指を離す",
          text: "竿を前に振り出すと同時に、人差し指から糸を放します。竿が前方45度くらいの角度のときに離すのがベストです。",
          position: 4,
        },
        {
          "@type": "HowToStep",
          name: "着水したらベイルを戻す",
          text: "仕掛けが着水したら、ベイルを手で戻して糸を巻ける状態にします。余分な糸のたるみを巻き取りましょう。",
          position: 5,
        },
      ],
    },
    {
      "@type": "HowToSection",
      name: "オーバーヘッドキャスト（基本の投げ方）",
      itemListElement: [
        {
          "@type": "HowToStep",
          name: "後方の安全確認",
          text: "背後と左右に人がいないか確認します。仕掛けの垂らしは30〜50cmが目安です。",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "ベイルを起こし、人差し指で糸を押さえる",
          text: "ちょい投げと同じ要領で、糸を人差し指にかけて押さえます。",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "竿を頭上まで振りかぶる",
          text: "竿を真っすぐ後ろに振りかぶります。竿先が真後ろまで来たところで一瞬止めると、竿にしなりが生まれます。",
          position: 3,
        },
        {
          "@type": "HowToStep",
          name: "前方に振り下ろし、タイミングよく指を離す",
          text: "竿を前方に力強く振り下ろします。竿が正面より少し上（約45度）を向いたときに指を離して糸を放します。",
          position: 4,
        },
        {
          "@type": "HowToStep",
          name: "着水後、ベイルを戻す",
          text: "仕掛けが着水したらベイルを戻し、余分な糸のたるみを巻き取ります。",
          position: 5,
        },
      ],
    },
    {
      "@type": "HowToSection",
      name: "サイドキャスト（狭い場所で）",
      itemListElement: [
        {
          "@type": "HowToStep",
          name: "周囲の安全確認",
          text: "特に竿を振る側の横方向に人がいないか確認します。",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "竿を横に構える",
          text: "竿を体の横（利き手側）に水平に構えます。ベイルを起こして糸を指で押さえます。",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "横方向に振り出し、指を離す",
          text: "体をひねりながら竿を前方に振り出します。正面に向いたタイミングで指を離します。",
          position: 3,
        },
      ],
    },
  ],
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
      name: "投げ方の基本",
      item: "https://tsurispot.com/guide/casting",
    },
  ],
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
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

function OverheadCastDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 280"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="オーバーヘッドキャストの3段階フォーム図：構え、振り上げ、リリースポイント"
        role="img"
      >
        <rect width="600" height="280" rx="12" fill="#EFF6FF" />
        {/* タイトル */}
        <text x="300" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">オーバーヘッドキャストのフォーム</text>

        {/* Step 1: 構え */}
        <g transform="translate(80,60)">
          {/* 人体 */}
          <circle cx="40" cy="20" r="12" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
          <line x1="40" y1="32" x2="40" y2="80" stroke="#3B82F6" strokeWidth="2.5" />
          <line x1="40" y1="80" x2="25" y2="120" stroke="#3B82F6" strokeWidth="2" />
          <line x1="40" y1="80" x2="55" y2="120" stroke="#3B82F6" strokeWidth="2" />
          {/* 竿（斜め前） */}
          <line x1="40" y1="50" x2="70" y2="-10" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          {/* 腕 */}
          <line x1="40" y1="45" x2="55" y2="30" stroke="#3B82F6" strokeWidth="2" />
          <line x1="55" y1="30" x2="55" y2="10" stroke="#3B82F6" strokeWidth="2" />
          <text x="40" y="150" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3B82F6">1. 構え</text>
          <text x="40" y="165" textAnchor="middle" fontSize="10" fill="#6B7280">竿を前に構える</text>
        </g>

        {/* 矢印1 */}
        <path d="M180,120 L210,120" stroke="#3B82F6" strokeWidth="2" fill="none" markerEnd="url(#arrowCast)" />

        {/* Step 2: 振り上げ */}
        <g transform="translate(250,60)">
          <circle cx="40" cy="20" r="12" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
          <line x1="40" y1="32" x2="40" y2="80" stroke="#3B82F6" strokeWidth="2.5" />
          <line x1="40" y1="80" x2="25" y2="120" stroke="#3B82F6" strokeWidth="2" />
          <line x1="40" y1="80" x2="55" y2="120" stroke="#3B82F6" strokeWidth="2" />
          {/* 竿（後ろに倒す） */}
          <line x1="40" y1="50" x2="10" y2="-15" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          {/* 腕 */}
          <line x1="40" y1="45" x2="30" y2="25" stroke="#3B82F6" strokeWidth="2" />
          <line x1="30" y1="25" x2="20" y2="8" stroke="#3B82F6" strokeWidth="2" />
          {/* 振り方向矢印 */}
          <path d="M50,-5 C60,-20 65,-10 58,5" stroke="#EF4444" strokeWidth="1.5" fill="none" markerEnd="url(#arrowRed)" />
          <text x="40" y="150" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3B82F6">2. 振り上げ</text>
          <text x="40" y="165" textAnchor="middle" fontSize="10" fill="#6B7280">しなりを溜める</text>
        </g>

        {/* 矢印2 */}
        <path d="M350,120 L380,120" stroke="#3B82F6" strokeWidth="2" fill="none" markerEnd="url(#arrowCast)" />

        {/* Step 3: リリース */}
        <g transform="translate(420,60)">
          <circle cx="40" cy="20" r="12" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
          <line x1="40" y1="32" x2="40" y2="80" stroke="#3B82F6" strokeWidth="2.5" />
          <line x1="40" y1="80" x2="25" y2="120" stroke="#3B82F6" strokeWidth="2" />
          <line x1="40" y1="80" x2="55" y2="120" stroke="#3B82F6" strokeWidth="2" />
          {/* 竿（前45度） */}
          <line x1="40" y1="50" x2="80" y2="-5" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          {/* 腕 */}
          <line x1="40" y1="45" x2="60" y2="25" stroke="#3B82F6" strokeWidth="2" />
          <line x1="60" y1="25" x2="65" y2="8" stroke="#3B82F6" strokeWidth="2" />
          {/* 45度の角度表示 */}
          <path d="M55,50 A20,20 0 0,1 70,35" stroke="#22C55E" strokeWidth="1.5" fill="none" />
          <text x="78" y="45" fontSize="10" fill="#22C55E" fontWeight="bold">45°</text>
          {/* リリースマーク */}
          <circle cx="80" cy="-5" r="5" fill="none" stroke="#EF4444" strokeWidth="2" />
          <text x="92" y="-2" fontSize="9" fill="#EF4444">リリース!</text>
          <text x="40" y="150" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3B82F6">3. リリース</text>
          <text x="40" y="165" textAnchor="middle" fontSize="10" fill="#6B7280">45度で指を離す</text>
        </g>

        <defs>
          <marker id="arrowCast" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#3B82F6" />
          </marker>
          <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#EF4444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function BailFingerDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 500 300"
        width="100%"
        style={{ maxWidth: 500 }}
        aria-label="ベールの開閉と人差し指でラインを押さえる方法の図解"
        role="img"
      >
        <rect width="500" height="300" rx="12" fill="#EFF6FF" />
        <text x="250" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">ベールと指の使い方</text>

        {/* 左: ベール閉 */}
        <g transform="translate(50,50)">
          <text x="80" y="10" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3B82F6">ベールを閉じた状態</text>
          {/* リール本体 */}
          <rect x="40" y="30" width="80" height="120" rx="10" fill="#D1D5DB" stroke="#6B7280" strokeWidth="1.5" />
          {/* スプール */}
          <rect x="55" y="50" width="50" height="80" rx="6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          {/* ライン巻き */}
          <rect x="60" y="55" width="40" height="70" rx="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
          {/* ベール（閉じている） */}
          <path d="M45,70 Q30,90 45,110" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="45" cy="70" r="3" fill="#F59E0B" />
          <circle cx="45" cy="110" r="3" fill="#F59E0B" />
          {/* ハンドル */}
          <line x1="120" y1="90" x2="145" y2="90" stroke="#6B7280" strokeWidth="2.5" />
          <circle cx="148" cy="90" r="6" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
          <text x="80" y="175" textAnchor="middle" fontSize="10" fill="#6B7280">糸が巻ける状態</text>
        </g>

        {/* 右: ベール開 + 指で押さえる */}
        <g transform="translate(280,50)">
          <text x="80" y="10" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#EF4444">ベールを開けた状態</text>
          {/* リール本体 */}
          <rect x="40" y="30" width="80" height="120" rx="10" fill="#D1D5DB" stroke="#6B7280" strokeWidth="1.5" />
          {/* スプール */}
          <rect x="55" y="50" width="50" height="80" rx="6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          {/* ライン巻き */}
          <rect x="60" y="55" width="40" height="70" rx="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
          {/* ベール（開いている） */}
          <path d="M45,70 Q80,60 115,70" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="45" cy="70" r="3" fill="#F59E0B" />
          <circle cx="115" cy="70" r="3" fill="#F59E0B" />
          {/* 人差し指 */}
          <path d="M80,45 Q80,35 75,28 Q73,25 78,24 Q83,23 85,28 L88,40" stroke="#F4A460" strokeWidth="2.5" fill="#FDDCB5" strokeLinecap="round" />
          {/* ラインが指にかかっている */}
          <line x1="80" y1="55" x2="80" y2="35" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3,2" />
          <line x1="80" y1="28" x2="80" y2="10" stroke="#3B82F6" strokeWidth="1.5" />
          {/* 矢印: 指で押さえるポイント */}
          <line x1="120" y1="30" x2="95" y2="30" stroke="#EF4444" strokeWidth="1.5" markerEnd="url(#arrowRedBail)" />
          <text x="155" y="28" fontSize="10" fill="#EF4444" fontWeight="bold">人差し指で</text>
          <text x="155" y="40" fontSize="10" fill="#EF4444" fontWeight="bold">糸を押さえる</text>
          {/* ハンドル */}
          <line x1="120" y1="90" x2="145" y2="90" stroke="#6B7280" strokeWidth="2.5" />
          <circle cx="148" cy="90" r="6" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
          <text x="80" y="175" textAnchor="middle" fontSize="10" fill="#6B7280">糸が自由に出る状態</text>
        </g>

        {/* 補足テキスト */}
        <text x="250" y="280" textAnchor="middle" fontSize="11" fill="#6B7280">第一関節あたりにラインをかけ、投げる瞬間に離します</text>

        <defs>
          <marker id="arrowRedBail" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#EF4444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function CastingMotionAnimationSvg() {
  return (
    <div className="my-6">
      <h4 className="mb-3 text-base font-bold text-foreground">動きで見るキャストフォーム</h4>
      <svg
        viewBox="0 0 500 400"
        width="100%"
        style={{ maxWidth: 500 }}
        aria-label="オーバーヘッドキャストの動作アニメーション：構え、振りかぶり、振り下ろし、飛行、着水の一連の流れ"
        role="img"
      >
        <defs>
          {/* 竿の回転アニメーション */}
          <style>{`
            @keyframes rodSwing {
              0%, 20% { transform: rotate(0deg); }
              20.1%, 30% { transform: rotate(0deg); }
              30.1%, 40% { transform: rotate(-120deg); }
              40.1%, 50% { transform: rotate(-45deg); }
              50.1%, 100% { transform: rotate(-45deg); }
            }
            @keyframes armSwing {
              0%, 20% { transform: rotate(0deg); }
              20.1%, 30% { transform: rotate(0deg); }
              30.1%, 40% { transform: rotate(-90deg); }
              40.1%, 50% { transform: rotate(-20deg); }
              50.1%, 100% { transform: rotate(-20deg); }
            }
            @keyframes tackleMove {
              0%, 50% { transform: translate(0px, 0px); opacity: 0; }
              50.1% { transform: translate(0px, 0px); opacity: 1; }
              60% { transform: translate(80px, -80px); opacity: 1; }
              70% { transform: translate(160px, -60px); opacity: 1; }
              80% { transform: translate(220px, -10px); opacity: 1; }
              85% { transform: translate(240px, 20px); opacity: 1; }
              86%, 100% { transform: translate(240px, 20px); opacity: 0; }
            }
            @keyframes splash1 {
              0%, 84% { transform: scale(0); opacity: 0; }
              85% { transform: scale(0.2); opacity: 0.9; }
              90% { transform: scale(1); opacity: 0.6; }
              95% { transform: scale(1.8); opacity: 0.2; }
              100% { transform: scale(2.2); opacity: 0; }
            }
            @keyframes splash2 {
              0%, 86% { transform: scale(0); opacity: 0; }
              87% { transform: scale(0.2); opacity: 0.8; }
              92% { transform: scale(1.2); opacity: 0.5; }
              97% { transform: scale(2); opacity: 0.1; }
              100% { transform: scale(2.2); opacity: 0; }
            }
            @keyframes splashDrop1 {
              0%, 84% { transform: translate(0px, 0px); opacity: 0; }
              85% { transform: translate(0px, 0px); opacity: 0.8; }
              92% { transform: translate(-12px, -18px); opacity: 0.5; }
              100% { transform: translate(-16px, -2px); opacity: 0; }
            }
            @keyframes splashDrop2 {
              0%, 84% { transform: translate(0px, 0px); opacity: 0; }
              86% { transform: translate(0px, 0px); opacity: 0.8; }
              93% { transform: translate(10px, -20px); opacity: 0.5; }
              100% { transform: translate(14px, -3px); opacity: 0; }
            }
            @keyframes splashDrop3 {
              0%, 85% { transform: translate(0px, 0px); opacity: 0; }
              87% { transform: translate(0px, 0px); opacity: 0.7; }
              94% { transform: translate(0px, -22px); opacity: 0.4; }
              100% { transform: translate(0px, -4px); opacity: 0; }
            }
            @keyframes phaseLabel {
              0%, 20% { opacity: 1; }
              20.1%, 30% { opacity: 0; }
              30.1%, 40% { opacity: 0; }
              40.1%, 50% { opacity: 0; }
              50.1%, 85% { opacity: 0; }
              85.1%, 100% { opacity: 0; }
            }
            @keyframes phaseLabel2 {
              0%, 20% { opacity: 0; }
              20.1%, 40% { opacity: 1; }
              40.1%, 100% { opacity: 0; }
            }
            @keyframes phaseLabel3 {
              0%, 40% { opacity: 0; }
              40.1%, 50% { opacity: 1; }
              50.1%, 100% { opacity: 0; }
            }
            @keyframes phaseLabel4 {
              0%, 50% { opacity: 0; }
              50.1%, 85% { opacity: 1; }
              85.1%, 100% { opacity: 0; }
            }
            @keyframes phaseLabel5 {
              0%, 85% { opacity: 0; }
              85.1%, 100% { opacity: 1; }
            }
            @keyframes tackleLine {
              0%, 50% { stroke-dashoffset: 0; opacity: 0; }
              50.1% { stroke-dashoffset: 400; opacity: 0.6; }
              85% { stroke-dashoffset: 0; opacity: 0.4; }
              86%, 100% { opacity: 0; }
            }
            .rod-group {
              transform-origin: 220px 230px;
              animation: rodSwing 5s ease-in-out infinite;
            }
            .arm-group {
              transform-origin: 220px 210px;
              animation: armSwing 5s ease-in-out infinite;
            }
            .tackle {
              animation: tackleMove 5s ease-out infinite;
            }
            .splash-ring1 {
              transform-origin: center;
              animation: splash1 5s ease-out infinite;
            }
            .splash-ring2 {
              transform-origin: center;
              animation: splash2 5s ease-out infinite;
            }
            .splash-drop1 {
              animation: splashDrop1 5s ease-out infinite;
            }
            .splash-drop2 {
              animation: splashDrop2 5s ease-out infinite;
            }
            .splash-drop3 {
              animation: splashDrop3 5s ease-out infinite;
            }
            .phase1 { animation: phaseLabel 5s ease-in-out infinite; }
            .phase2 { animation: phaseLabel2 5s ease-in-out infinite; }
            .phase3 { animation: phaseLabel3 5s ease-in-out infinite; }
            .phase4 { animation: phaseLabel4 5s ease-in-out infinite; }
            .phase5 { animation: phaseLabel5 5s ease-in-out infinite; }
            .tackle-trail {
              animation: tackleLine 5s ease-out infinite;
            }
          `}</style>
        </defs>

        {/* 背景 */}
        <rect width="500" height="400" rx="12" fill="#EFF6FF" />

        {/* タイトル */}
        <text x="250" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">キャスト動作アニメーション</text>

        {/* 海面 */}
        <rect x="0" y="310" width="500" height="90" rx="0" fill="#3B82F6" opacity="0.15" />
        <path d="M0,310 Q60,300 120,310 T240,310 T360,310 T480,310 L500,310" stroke="#3B82F6" strokeWidth="1.5" fill="none" opacity="0.4" />

        {/* 地面/堤防 */}
        <rect x="140" y="310" width="120" height="20" rx="2" fill="#9CA3AF" opacity="0.3" />
        <line x1="140" y1="310" x2="260" y2="310" stroke="#6B7280" strokeWidth="1.5" />

        {/* 釣り人の体（固定部分） */}
        {/* 頭 */}
        <circle cx="220" cy="195" r="14" fill="#374151" opacity="0.9" />
        {/* 体 */}
        <line x1="220" y1="209" x2="220" y2="270" stroke="#374151" strokeWidth="3" />
        {/* 左足 */}
        <line x1="220" y1="270" x2="200" y2="310" stroke="#374151" strokeWidth="2.5" />
        {/* 右足 */}
        <line x1="220" y1="270" x2="240" y2="310" stroke="#374151" strokeWidth="2.5" />

        {/* 腕（アニメーション） */}
        <g className="arm-group">
          {/* 上腕 */}
          <line x1="220" y1="220" x2="235" y2="200" stroke="#374151" strokeWidth="2.5" />
          {/* 前腕 */}
          <line x1="235" y1="200" x2="220" y2="185" stroke="#374151" strokeWidth="2.5" />
        </g>

        {/* 竿（アニメーション） */}
        <g className="rod-group">
          <line x1="220" y1="230" x2="220" y2="140" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
          {/* 竿先 */}
          <line x1="220" y1="140" x2="220" y2="120" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
          {/* ガイド（竿のリング） */}
          <circle cx="220" cy="160" r="2" fill="none" stroke="#9CA3AF" strokeWidth="1" />
          <circle cx="220" cy="140" r="1.5" fill="none" stroke="#9CA3AF" strokeWidth="1" />
        </g>

        {/* 仕掛け（飛んでいくアニメーション） */}
        <g className="tackle" style={{ transformOrigin: '220px 120px' }}>
          <circle cx="220" cy="120" r="4" fill="#EF4444" />
          <line x1="220" y1="124" x2="220" y2="132" stroke="#EF4444" strokeWidth="1" />
        </g>

        {/* 仕掛けの軌跡 */}
        <path
          d="M220,120 Q300,40 460,330"
          stroke="#EF4444"
          strokeWidth="1"
          fill="none"
          strokeDasharray="4,4"
          className="tackle-trail"
          opacity="0.4"
        />

        {/* 着水エフェクト */}
        <g transform="translate(460, 330)">
          <ellipse cx="0" cy="0" rx="8" ry="3" fill="none" stroke="#3B82F6" strokeWidth="1.5" className="splash-ring1" />
          <ellipse cx="0" cy="0" rx="12" ry="5" fill="none" stroke="#3B82F6" strokeWidth="1" className="splash-ring2" />
          {/* 水しぶき */}
          <circle cx="0" cy="0" r="2" fill="#3B82F6" className="splash-drop1" />
          <circle cx="0" cy="0" r="1.5" fill="#3B82F6" className="splash-drop2" />
          <circle cx="0" cy="0" r="1.5" fill="#3B82F6" className="splash-drop3" />
        </g>

        {/* フェーズ表示 */}
        <g>
          <rect x="150" y="355" width="200" height="30" rx="8" fill="white" opacity="0.8" />
          <text className="phase1" x="250" y="375" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#3B82F6">1. 構え</text>
          <text className="phase2" x="250" y="375" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#F59E0B">2. 振りかぶり</text>
          <text className="phase3" x="250" y="375" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#EF4444">3. 振り下ろし・リリース!</text>
          <text className="phase4" x="250" y="375" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#8B5CF6">4. 飛行中...</text>
          <text className="phase5" x="250" y="375" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#3B82F6">5. 着水!</text>
        </g>
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">※ アニメーションが自動でループします</p>
    </div>
  );
}

function CastDistanceDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 280"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="リリース角度と飛距離の関係を示す放物線の図解。45度が最大飛距離になる"
        role="img"
      >
        <rect width="600" height="280" rx="12" fill="#EFF6FF" />
        <text x="300" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">リリース角度と飛距離の関係</text>

        {/* 地面 */}
        <line x1="50" y1="230" x2="570" y2="230" stroke="#9CA3AF" strokeWidth="2" />
        {/* 水面 */}
        <rect x="350" y="230" width="220" height="30" rx="0" fill="#DBEAFE" opacity="0.5" />
        <text x="460" y="250" textAnchor="middle" fontSize="10" fill="#3B82F6">水面</text>

        {/* 人の位置マーカー */}
        <circle cx="80" cy="220" r="8" fill="#93C5FD" stroke="#3B82F6" strokeWidth="2" />
        <line x1="80" y1="228" x2="80" y2="230" stroke="#3B82F6" strokeWidth="2" />

        {/* 早すぎるリリース (70度) - 短い距離 */}
        <path d="M90,220 Q130,80 200,220" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,3" />
        <text x="145" y="70" fontSize="10" fill="#EF4444">70° 早すぎ</text>
        <circle cx="200" cy="220" r="4" fill="#EF4444" />

        {/* 最適角度 (45度) - 最大飛距離 */}
        <path d="M90,220 Q250,40 460,220" stroke="#22C55E" strokeWidth="3" fill="none" />
        <text x="270" y="55" fontSize="12" fill="#22C55E" fontWeight="bold">45° 最適!</text>
        <circle cx="460" cy="220" r="5" fill="#22C55E" stroke="#22C55E" strokeWidth="2" />
        {/* 飛距離矢印 */}
        <line x1="90" y1="245" x2="455" y2="245" stroke="#22C55E" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />
        <text x="270" y="260" textAnchor="middle" fontSize="11" fill="#22C55E" fontWeight="bold">最大飛距離</text>

        {/* 遅すぎるリリース (20度) - 足元に落ちる */}
        <path d="M90,220 Q110,190 160,220" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="5,3" />
        <text x="100" y="195" fontSize="10" fill="#F59E0B">20° 遅すぎ</text>
        <circle cx="160" cy="220" r="4" fill="#F59E0B" />

        {/* 角度インジケーター */}
        <g transform="translate(80,220)">
          <path d="M0,0 L30,-30" stroke="#EF4444" strokeWidth="1" strokeDasharray="3,2" />
          <path d="M0,0 L40,-40" stroke="#22C55E" strokeWidth="1.5" />
          <path d="M0,0 L40,-15" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3,2" />
        </g>

        {/* 凡例 */}
        <g transform="translate(30,265)">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#22C55E" strokeWidth="3" />
          <text x="25" y="4" fontSize="10" fill="#6B7280">45°: 最大飛距離</text>
          <line x1="160" y1="0" x2="180" y2="0" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,3" />
          <text x="185" y="4" fontSize="10" fill="#6B7280">70°: 真上に飛ぶ</text>
          <line x1="320" y1="0" x2="340" y2="0" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,3" />
          <text x="345" y="4" fontSize="10" fill="#6B7280">20°: 足元に落ちる</text>
        </g>

        <defs>
          <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#22C55E" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function CastingGuidePage() {
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
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "ガイド", href: "/guide" },
          { label: "キャスティングの基本" },
        ]} />
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
            投げ方（キャスティング）の基本
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            安全に遠くへ飛ばすための基本テクニックを学びましょう。
          </p>
        </div>

        <Danger>
          キャスティングの前に必ず後方と周囲の安全確認をしてください。釣り針は鋭く、他の人に当たると大けがにつながります。
        </Danger>

        <div className="space-y-6">
          {/* ちょい投げ */}
          <SectionCard title="ちょい投げ（初心者はここから）">
            <p className="mb-4 text-sm text-muted-foreground">
              軽く投げる方法で、初心者が最初に覚えるべきキャスティングです。10〜30m程度飛ばすことを目標にします。
            </p>
            <BailFingerDiagram />
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    後方の安全確認をする
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    振りかぶる方向に人がいないか必ず確認します。左右も見渡しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ベイルを起こし、人差し指で糸を押さえる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールのベイルを起こして、人差し指の第一関節あたりに糸をかけて押さえます。このとき糸がたるまないようにしましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿を軽く後ろに引く
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    大きく振りかぶる必要はありません。竿先を肩の高さくらいまで後ろに引きます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    前方に振り出し、指を離す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を前に振り出すと同時に、人差し指から糸を放します。竿が前方45度くらいの角度のときに離すのがベストです。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    着水したらベイルを戻す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    仕掛けが着水したら、ベイルを手で戻して糸を巻ける状態にします。余分な糸のたるみを巻き取りましょう。
                  </p>
                </div>
              </li>
            </ol>
            <Hint>
              最初は飛距離を気にせず、コントロール（狙った方向に投げること）を意識しましょう。距離は慣れてから伸ばせます。
            </Hint>
          </SectionCard>

          {/* オーバーヘッドキャスト */}
          <SectionCard title="オーバーヘッドキャスト（基本の投げ方）">
            <p className="mb-4 text-sm text-muted-foreground">
              頭上から振り下ろす最も基本的な投げ方です。飛距離が出やすく、コントロールもしやすいのが特徴です。
            </p>
            <OverheadCastDiagram />
            <CastingMotionAnimationSvg />
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    後方の安全確認
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    背後と左右に人がいないか確認します。仕掛けの垂らし（竿先から仕掛けまでの距離）は30〜50cmが目安です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ベイルを起こし、人差し指で糸を押さえる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ちょい投げと同じ要領で、糸を人差し指にかけて押さえます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿を頭上まで振りかぶる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を真っすぐ後ろに（頭上を通るように）振りかぶります。竿先が真後ろまで来たところで一瞬止めると、竿にしなりが生まれます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    前方に振り下ろし、タイミングよく指を離す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を前方に力強く振り下ろします。竿が正面より少し上（約45度）を向いたときに指を離して糸を放します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    着水後、ベイルを戻す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    仕掛けが着水したらベイルを戻し、余分な糸のたるみを巻き取ります。
                  </p>
                </div>
              </li>
            </ol>
            <Hint>
              振りかぶりから振り下ろしまで、竿の軌道は一直線になるようにします。斜めに振ると仕掛けが横にずれてしまいます。
            </Hint>
          </SectionCard>

          {/* サイドキャスト */}
          <SectionCard title="サイドキャスト（狭い場所で）">
            <p className="mb-4 text-sm text-muted-foreground">
              横方向に振るキャストで、頭上に障害物がある場所や、後ろのスペースが狭い場所で使います。
            </p>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    周囲の安全確認
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    特に竿を振る側の横方向に人がいないか確認します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿を横に構える
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を体の横（利き手側）に水平に構えます。ベイルを起こして糸を指で押さえます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    横方向に振り出し、指を離す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    体をひねりながら竿を前方に振り出します。正面に向いたタイミングで指を離します。
                  </p>
                </div>
              </li>
            </ol>
            <Warning>
              サイドキャストは仕掛けが低い位置を飛ぶため、周囲の人に当たりやすくなります。特に混雑した釣り場では十分注意してください。
            </Warning>
          </SectionCard>

          {/* 着水点と飛距離の関係 */}
          <CastDistanceDiagram />

          {/* よくある失敗と対策 */}
          <SectionCard title="よくある失敗と対策">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="font-medium text-foreground">
                  糸がぐちゃぐちゃに絡まる（バックラッシュ）
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">原因：</span>
                  ベイルを戻し忘れたまま糸が出続けた、または糸がガイドに絡んでいた。
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">対策：</span>
                  投げる前にベイルの状態を確認する習慣をつけましょう。着水後はすぐにベイルを戻します。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium text-foreground">
                  仕掛けが全然飛ばない
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">原因：</span>
                  糸を離すタイミングが遅い。竿が下を向いてから離すと飛距離が出ません。
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">対策：</span>
                  竿が前方45度を向いた時点で離しましょう。早すぎると真上に飛び、遅すぎると足元に落ちます。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium text-foreground">
                  仕掛けが真上に飛んでしまう
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">原因：</span>
                  糸を離すタイミングが早すぎる。
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">対策：</span>
                  指を離すタイミングを少しだけ遅らせましょう。竿の振りを止めずに、前方に振り切る途中で離します。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium text-foreground">
                  隣の人の方に飛んでしまう
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">原因：</span>
                  竿の振りが斜めになっている。
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">対策：</span>
                  投げたい方向に向かって真っすぐ振ることを意識します。最初は人の少ない場所で練習しましょう。
                </p>
              </div>
            </div>

            <Danger>
              万が一、他の人に針を引っかけてしまった場合は、無理に抜かず、すぐに謝罪して救急処置を行いましょう。深く刺さった場合は病院を受診してください。
            </Danger>
          </SectionCard>
        </div>

        {/* 参考動画 */}
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Play className="size-5 text-primary" />
            参考動画
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            投げ方は動画で見るのが一番わかりやすいです。
          </p>
          <YouTubeVideoList links={castingVideos} />
        </section>

        {/* ガイドに戻る */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            基本をマスターしたら、実際に釣り場に行ってみましょう！
          </p>
          <Link
            href="/guide"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ガイドトップに戻る
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
