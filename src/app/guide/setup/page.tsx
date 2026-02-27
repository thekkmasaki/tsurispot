import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import { AlertTriangle, ChevronLeft, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import type { YouTubeSearchLink } from "@/types";

const setupVideos: YouTubeSearchLink[] = [
  {
    label: "リールの取り付け方",
    searchQuery: "リール 取り付け方 初心者",
    description: "スピニングリールを竿に正しくセットする方法を動画で確認",
  },
  {
    label: "振り出し竿の伸ばし方",
    searchQuery: "振り出し竿 伸ばし方 初心者",
    description: "振り出し竿の正しい伸ばし方と収納方法",
  },
  {
    label: "ガイドへの糸の通し方",
    searchQuery: "釣り竿 糸の通し方 初心者",
    description: "ラインをガイドに通す手順とコツ",
  },
  {
    label: "釣り竿セッティング完全ガイド",
    searchQuery: "釣り竿 セッティング 初心者 やり方",
    description: "竿・リール・ラインの準備を一通り解説",
  },
  {
    label: "リールへの糸巻き方（逆巻き防止）",
    searchQuery: "リール 糸巻き 方向 スピニング 初心者",
    description: "スピニングリールへの正しい糸の巻き方と方向の確認方法",
  },
];

export const metadata: Metadata = {
  title: "竿とリールのセッティング方法 - 初心者ガイド",
  description:
    "リールの取り付け方、竿の継ぎ方、糸の通し方をステップバイステップで解説。初心者がやりがちなリールの糸巻き方向の間違いと対処法も詳しく紹介。",
  openGraph: {
    title: "竿とリールのセッティング方法 - 初心者ガイド",
    description:
      "リールの取り付け方、竿の継ぎ方、糸の通し方をステップバイステップで解説。糸の逆巻き注意も。",
    type: "article",
    url: "https://tsurispot.com/guide/setup",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/setup",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "竿とリールのセッティング方法",
  description:
    "リールの取り付け方、竿の継ぎ方、糸の通し方をステップバイステップで解説。初心者がやりがちなリールの糸巻き方向の間違いと対処法も詳しく紹介。",
  totalTime: "PT15M",
  tool: [
    { "@type": "HowToTool", name: "釣り竿（振り出し竿）" },
    { "@type": "HowToTool", name: "スピニングリール" },
    { "@type": "HowToTool", name: "釣り糸（ライン）" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "リールシートの位置を確認する",
      text: "竿のグリップ部分にある、リールを取り付けるための金具（リールシート）を探します。ナット（ネジ）を緩めておきましょう。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "リールフットを差し込む",
      text: "リールの足の部分（リールフット）をリールシートの溝に差し込みます。片方を先に引っかけてから、もう片方をはめると簡単です。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "ナットを締めて固定する",
      text: "ナットを手で回して、リールがしっかり固定されるまで締めます。工具は不要です。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "ガタつきがないか確認する",
      text: "リールを軽く揺すってみて、グラグラしなければOKです。ガタつく場合はナットをもう少し締めましょう。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "竿先（穂先）から順番に伸ばす",
      text: "竿の一番細い部分（穂先）から順番に引き出します。一番太い部分（元竿）は最後です。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "各ガイドが一直線になるよう調整する",
      text: "糸を通す輪っか（ガイド）がすべて同じ方向を向くように、各節を回して調整します。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "各節をしっかり固定する",
      text: "引き出した各節がしっかり止まっていることを確認します。緩いと釣りの最中に縮んでしまいます。",
      position: 7,
    },
    {
      "@type": "HowToStep",
      name: "リールのベイル（糸押さえ）を起こす",
      text: "リールの半円形の金属パーツ（ベイル）を上に起こします。これで糸が自由に出るようになります。",
      position: 8,
    },
    {
      "@type": "HowToStep",
      name: "リールから糸を出す",
      text: "糸の先端を持って、50cmほど引き出します。",
      position: 9,
    },
    {
      "@type": "HowToStep",
      name: "竿のガイドに下から順番に通す",
      text: "リールに一番近いガイド（元ガイド）から順番に、竿先のガイドまで糸を通していきます。一つも飛ばさないように注意しましょう。",
      position: 10,
    },
    {
      "@type": "HowToStep",
      name: "穂先まで通したらベイルを戻す",
      text: "すべてのガイドに糸を通し終えたら、ベイルを元に戻します。これで糸がリールに巻き取れる状態になります。",
      position: 11,
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
      name: "竿とリールのセッティング方法",
      item: "https://tsurispot.com/guide/setup",
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

function TackleSetupDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 320"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="スピニングタックルの組み立て手順図：竿のジョイント、リール取り付け、ガイドにライン通し、仕掛け接続"
        role="img"
      >
        <rect width="600" height="320" rx="12" fill="#EFF6FF" />
        <text x="300" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">スピニングタックル組み立ての流れ</text>

        {/* Step 1: 竿を伸ばす */}
        <g transform="translate(20,55)">
          <rect x="10" y="10" width="120" height="100" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="12" fill="#3B82F6" />
          <text x="30" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFFFFF">1</text>
          <text x="75" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E3A5F">竿を伸ばす</text>
          {/* 縮んだ竿 */}
          <rect x="25" y="50" width="90" height="6" rx="3" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
          {/* 伸ばした竿 */}
          <line x1="25" y1="75" x2="115" y2="75" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <line x1="115" y1="75" x2="115" y2="68" stroke="#F59E0B" strokeWidth="2" />
          {/* ガイド */}
          <circle cx="45" cy="75" r="3" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <circle cx="70" cy="75" r="3" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <circle cx="95" cy="75" r="2.5" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <text x="70" y="98" textAnchor="middle" fontSize="9" fill="#6B7280">穂先から順に引き出す</text>
        </g>

        {/* 矢印 */}
        <path d="M150,105 L170,105" stroke="#3B82F6" strokeWidth="2" fill="none" markerEnd="url(#arrowSetup)" />

        {/* Step 2: リール取り付け */}
        <g transform="translate(170,55)">
          <rect x="10" y="10" width="120" height="100" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="12" fill="#3B82F6" />
          <text x="30" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFFFFF">2</text>
          <text x="78" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E3A5F">リール装着</text>
          {/* 竿のグリップ部分 */}
          <rect x="25" y="55" width="90" height="8" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          {/* リールシート */}
          <rect x="50" y="50" width="30" height="18" rx="3" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5" />
          {/* リール本体 */}
          <rect x="52" y="68" width="26" height="30" rx="5" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          {/* 矢印（取り付け方向） */}
          <path d="M65,45 L65,52" stroke="#22C55E" strokeWidth="1.5" markerEnd="url(#arrowGreenSetup)" />
          <text x="70" y="98" textAnchor="middle" fontSize="9" fill="#6B7280">リールシートに固定</text>
        </g>

        {/* 矢印 */}
        <path d="M300,105 L320,105" stroke="#3B82F6" strokeWidth="2" fill="none" markerEnd="url(#arrowSetup)" />

        {/* Step 3: ライン通し */}
        <g transform="translate(320,55)">
          <rect x="10" y="10" width="120" height="100" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="12" fill="#3B82F6" />
          <text x="30" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFFFFF">3</text>
          <text x="78" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E3A5F">糸を通す</text>
          {/* 竿 */}
          <line x1="25" y1="65" x2="115" y2="65" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          {/* ガイド */}
          <circle cx="40" cy="65" r="4" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <circle cx="65" cy="65" r="3.5" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <circle cx="90" cy="65" r="3" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          {/* ラインがガイドを通る */}
          <path d="M30,58 L40,61 L65,61 L90,62 L110,58" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeDasharray="4,2" />
          {/* 方向矢印 */}
          <path d="M35,50 L50,50" stroke="#22C55E" strokeWidth="1.5" markerEnd="url(#arrowGreenSetup)" />
          <text x="70" y="98" textAnchor="middle" fontSize="9" fill="#6B7280">下のガイドから順に</text>
        </g>

        {/* 矢印 */}
        <path d="M450,105 L470,105" stroke="#3B82F6" strokeWidth="2" fill="none" markerEnd="url(#arrowSetup)" />

        {/* Step 4: 仕掛け接続 */}
        <g transform="translate(470,55)">
          <rect x="10" y="10" width="120" height="100" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="12" fill="#22C55E" />
          <text x="30" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FFFFFF">4</text>
          <text x="78" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E3A5F">仕掛け接続</text>
          {/* ラインの先 */}
          <line x1="25" y1="60" x2="65" y2="60" stroke="#3B82F6" strokeWidth="1.5" />
          {/* スナップ/サルカン */}
          <circle cx="70" cy="60" r="4" fill="none" stroke="#9CA3AF" strokeWidth="2" />
          {/* 仕掛け */}
          <line x1="74" y1="60" x2="110" y2="60" stroke="#EF4444" strokeWidth="1.5" />
          <line x1="110" y1="60" x2="110" y2="85" stroke="#EF4444" strokeWidth="1.5" />
          {/* 針 */}
          <path d="M110,85 Q115,95 105,90" stroke="#EF4444" strokeWidth="1.5" fill="none" />
          {/* おもり */}
          <circle cx="95" cy="75" r="5" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
          <text x="70" y="98" textAnchor="middle" fontSize="9" fill="#6B7280">結んで完成!</text>
        </g>

        {/* 下部の注意書き */}
        <rect x="30" y="175" width="540" height="130" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />
        <text x="300" y="198" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E3A5F">チェックポイント</text>
        <g transform="translate(50,210)">
          <circle cx="8" cy="4" r="4" fill="#22C55E" />
          <text x="18" y="8" fontSize="11" fill="#374151">ガイドは全て同じ方向（一直線）に並んでいるか</text>
        </g>
        <g transform="translate(50,235)">
          <circle cx="8" cy="4" r="4" fill="#22C55E" />
          <text x="18" y="8" fontSize="11" fill="#374151">リールがグラつかず固定されているか</text>
        </g>
        <g transform="translate(50,260)">
          <circle cx="8" cy="4" r="4" fill="#22C55E" />
          <text x="18" y="8" fontSize="11" fill="#374151">糸がガイドを一つも飛ばさず通っているか</text>
        </g>
        <g transform="translate(50,285)">
          <circle cx="8" cy="4" r="4" fill="#22C55E" />
          <text x="18" y="8" fontSize="11" fill="#374151">各節の竿がしっかり伸びて固定されているか</text>
        </g>

        <defs>
          <marker id="arrowSetup" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#3B82F6" />
          </marker>
          <marker id="arrowGreenSetup" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#22C55E" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function DragAdjustmentDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 550 260"
        width="100%"
        style={{ maxWidth: 550 }}
        aria-label="ドラグ調整の3段階図：締めすぎ、適正、緩すぎの比較"
        role="img"
      >
        <rect width="550" height="260" rx="12" fill="#EFF6FF" />
        <text x="275" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">ドラグ調整の目安</text>

        {/* 締めすぎ */}
        <g transform="translate(20,50)">
          <rect x="5" y="5" width="155" height="180" rx="8" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.5" />
          <text x="82" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#EF4444">締めすぎ</text>
          {/* リールアイコン */}
          <rect x="52" y="40" width="40" height="50" rx="6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          <circle cx="72" cy="65" r="12" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
          {/* ドラグノブ（きつく締めた表示） */}
          <rect x="62" y="35" width="20" height="8" rx="4" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
          {/* 糸が切れている */}
          <line x1="72" y1="90" x2="72" y2="120" stroke="#3B82F6" strokeWidth="2" />
          <line x1="72" y1="122" x2="75" y2="125" stroke="#3B82F6" strokeWidth="2" />
          <line x1="72" y1="122" x2="69" y2="126" stroke="#3B82F6" strokeWidth="2" />
          <text x="82" y="145" textAnchor="middle" fontSize="10" fill="#EF4444" fontWeight="bold">糸が切れる!</text>
          <text x="82" y="160" textAnchor="middle" fontSize="9" fill="#6B7280">魚の引きを吸収できず</text>
          <text x="82" y="172" textAnchor="middle" fontSize="9" fill="#6B7280">ラインブレイクの危険</text>
        </g>

        {/* 適正 */}
        <g transform="translate(195,50)">
          <rect x="5" y="5" width="155" height="180" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="2" />
          <text x="82" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#22C55E">適正</text>
          {/* リールアイコン */}
          <rect x="52" y="40" width="40" height="50" rx="6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          <circle cx="72" cy="65" r="12" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
          {/* ドラグノブ */}
          <rect x="62" y="35" width="20" height="8" rx="4" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
          {/* 糸がしなやかに出ている */}
          <path d="M72,90 Q80,105 72,120 Q64,135 72,145" stroke="#3B82F6" strokeWidth="2" fill="none" />
          {/* 魚マーク */}
          <ellipse cx="72" cy="155" rx="10" ry="5" fill="#60A5FA" />
          <polygon points="82,155 90,150 90,160" fill="#60A5FA" />
          <text x="82" y="175" textAnchor="middle" fontSize="10" fill="#22C55E" fontWeight="bold">バランス良好</text>
        </g>

        {/* 緩すぎ */}
        <g transform="translate(370,50)">
          <rect x="5" y="5" width="155" height="180" rx="8" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />
          <text x="82" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F59E0B">緩すぎ</text>
          {/* リールアイコン */}
          <rect x="52" y="40" width="40" height="50" rx="6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          <circle cx="72" cy="65" r="12" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
          {/* ドラグノブ（緩い表示） */}
          <rect x="62" y="35" width="20" height="8" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          {/* 糸がどんどん出ていく */}
          <path d="M72,90 Q90,100 72,115 Q55,125 72,135 Q90,145 72,155" stroke="#3B82F6" strokeWidth="2" fill="none" />
          {/* 方向矢印（出ていく方向） */}
          <path d="M72,150 L72,160" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrowAmber)" />
          <text x="82" y="175" textAnchor="middle" fontSize="10" fill="#F59E0B" fontWeight="bold">巻き取れない!</text>
        </g>

        {/* 下部テキスト */}
        <text x="275" y="248" textAnchor="middle" fontSize="11" fill="#6B7280">目安：糸を手で引いて、少し力を入れるとジーっと出る程度が適正</text>

        <defs>
          <marker id="arrowAmber" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#F59E0B" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function DragAnimationSvg() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 400 300"
        width="100%"
        style={{ maxWidth: 400 }}
        aria-label="ドラグ調整アニメーション：締めすぎ、適正、緩すぎの3段階をループ表示"
        role="img"
      >
        <style>{`
          @keyframes dragPhase {
            0%, 33.32% { opacity: 1; }
            33.33%, 100% { opacity: 0; }
          }
          @keyframes dragPhase2 {
            0%, 33.32% { opacity: 0; }
            33.33%, 66.65% { opacity: 1; }
            66.66%, 100% { opacity: 0; }
          }
          @keyframes dragPhase3 {
            0%, 66.65% { opacity: 0; }
            66.66%, 99.99% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes lineSnap {
            0%, 60% { stroke-dashoffset: 0; opacity: 1; }
            70% { stroke-dashoffset: 0; opacity: 1; }
            75% { opacity: 0.3; }
            80% { opacity: 1; }
            85% { opacity: 0.2; }
            90%, 100% { opacity: 0.5; stroke-dashoffset: 10; }
          }
          @keyframes lineTension {
            0%, 100% { d: path("M120,120 Q200,118 300,120"); }
            50% { d: path("M120,120 Q200,115 300,120"); }
          }
          @keyframes lineProper {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -20; }
          }
          @keyframes lineLoose {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -60; }
          }
          @keyframes fishPullRight {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(15px); }
          }
          @keyframes fishTiredPull {
            0% { transform: translateX(0); }
            30% { transform: translateX(10px); }
            60% { transform: translateX(5px); }
            100% { transform: translateX(-5px); }
          }
          @keyframes fishRunAway {
            0% { transform: translateX(0); }
            100% { transform: translateX(50px); }
          }
          @keyframes snapBurst {
            0%, 65% { opacity: 0; transform: scale(0); }
            70% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(2); }
          }
          @keyframes jijiBlink {
            0%, 40%, 60%, 80%, 100% { opacity: 1; }
            50%, 70%, 90% { opacity: 0.3; }
          }
          @keyframes labelPhase1 {
            0%, 33.32% { opacity: 1; }
            33.33%, 100% { opacity: 0; }
          }
          @keyframes labelPhase2 {
            0%, 33.32% { opacity: 0; }
            33.33%, 66.65% { opacity: 1; }
            66.66%, 100% { opacity: 0; }
          }
          @keyframes labelPhase3 {
            0%, 66.65% { opacity: 0; }
            66.66%, 99.99% { opacity: 1; }
            100% { opacity: 0; }
          }
          .drag-phase1 { animation: dragPhase 9s linear infinite; }
          .drag-phase2 { animation: dragPhase2 9s linear infinite; }
          .drag-phase3 { animation: dragPhase3 9s linear infinite; }
          .line-snap { animation: lineSnap 3s ease-in-out infinite; }
          .line-proper { animation: lineProper 1.5s linear infinite; }
          .line-loose { animation: lineLoose 1s linear infinite; }
          .fish-pull { animation: fishPullRight 3s ease-in-out infinite; }
          .fish-tired { animation: fishTiredPull 3s ease-in-out infinite; }
          .fish-run { animation: fishRunAway 3s linear infinite; }
          .snap-burst { animation: snapBurst 3s ease-out infinite; transform-origin: 210px 120px; }
          .jiji-text { animation: jijiBlink 1.5s ease-in-out infinite; }
          .label-p1 { animation: labelPhase1 9s linear infinite; }
          .label-p2 { animation: labelPhase2 9s linear infinite; }
          .label-p3 { animation: labelPhase3 9s linear infinite; }
        `}</style>

        <rect x="0" y="0" width="400" height="300" rx="12" fill="#F9FAFB" />

        {/* タイトル */}
        <text x="200" y="24" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1E293B">動きで見るドラグの効果</text>

        {/* 共通要素: 竿 */}
        <line x1="30" y1="140" x2="120" y2="100" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
        {/* 竿先 */}
        <circle cx="120" cy="100" r="3" fill="#EF4444" />
        {/* リール */}
        <ellipse cx="60" cy="135" rx="14" ry="10" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5" />
        <circle cx="60" cy="135" r="4" fill="#9CA3AF" />

        {/* 魚が引く力の矢印（共通） */}
        <defs>
          <marker id="dragArrowR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#6B7280" />
          </marker>
        </defs>
        <line x1="320" y1="140" x2="370" y2="140" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#dragArrowR)" />
        <text x="345" y="155" textAnchor="middle" fontSize="8" fill="#6B7280">魚の引く力</text>

        {/* === フェーズ1: 締めすぎ（赤） === */}
        <g className="drag-phase1">
          {/* ピンと張った糸 */}
          <line x1="120" y1="100" x2="210" y2="120" stroke="#EF4444" strokeWidth="2" className="line-snap" />
          {/* 切れた糸の表現 */}
          <g className="snap-burst">
            <line x1="205" y1="115" x2="215" y2="110" stroke="#EF4444" strokeWidth="2" />
            <line x1="205" y1="125" x2="215" y2="130" stroke="#EF4444" strokeWidth="2" />
            <line x1="210" y1="113" x2="210" y2="127" stroke="#EF4444" strokeWidth="1.5" />
          </g>
          {/* 切れた先の糸 */}
          <line x1="215" y1="120" x2="300" y2="130" stroke="#EF4444" strokeWidth="1.5" opacity="0.5" strokeDasharray="4 3" />
          {/* 魚（引っ張っている） */}
          <g className="fish-pull">
            <ellipse cx="315" cy="130" rx="18" ry="10" fill="#22C55E" opacity="0.8" />
            <polygon points="333,130 345,122 345,138" fill="#22C55E" opacity="0.8" />
            <circle cx="303" cy="127" r="2" fill="white" />
            <circle cx="303" cy="127" r="1" fill="#1E293B" />
          </g>
          {/* プツンテキスト */}
          <text x="210" y="105" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#EF4444">プツン!</text>
        </g>

        {/* === フェーズ2: 適正（緑） === */}
        <g className="drag-phase2">
          {/* しなやかに出る糸 */}
          <path d="M120,100 Q170,108 220,115 Q260,120 300,125" stroke="#22C55E" strokeWidth="2" fill="none" strokeDasharray="6 3" className="line-proper" />
          {/* 魚（疲れていく） */}
          <g className="fish-tired">
            <ellipse cx="315" cy="125" rx="18" ry="10" fill="#22C55E" opacity="0.8" />
            <polygon points="333,125 345,117 345,133" fill="#22C55E" opacity="0.8" />
            <circle cx="303" cy="122" r="2" fill="white" />
            <circle cx="303" cy="122" r="1" fill="#1E293B" />
          </g>
          {/* ジジジテキスト */}
          <text x="200" y="95" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#22C55E" className="jiji-text">ジジジ...</text>
          {/* 糸が少し出ている波線 */}
          <path d="M220,115 Q225,110 230,115 Q235,120 240,115" stroke="#22C55E" strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>

        {/* === フェーズ3: 緩すぎ（黄） === */}
        <g className="drag-phase3">
          {/* どんどん出る糸（波打ち） */}
          <path d="M120,100 Q150,130 180,110 Q210,90 240,120 Q270,150 300,125 Q330,100 360,130" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="6 3" className="line-loose" />
          {/* 魚（逃げていく） */}
          <g className="fish-run">
            <ellipse cx="315" cy="125" rx="18" ry="10" fill="#22C55E" opacity="0.8" />
            <polygon points="333,125 345,117 345,133" fill="#22C55E" opacity="0.8" />
            <circle cx="303" cy="122" r="2" fill="white" />
            <circle cx="303" cy="122" r="1" fill="#1E293B" />
          </g>
          {/* 糸が出続ける矢印 */}
          <text x="250" y="90" textAnchor="middle" fontSize="11" fill="#F59E0B" fontWeight="bold">糸が止まらない...</text>
        </g>

        {/* フェーズ表示ラベル */}
        <g className="label-p1">
          <rect x="100" y="170" width="200" height="32" rx="8" fill="#EF4444" />
          <text x="200" y="191" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">{"締めすぎ \u274C"}</text>
        </g>
        <g className="label-p2">
          <rect x="100" y="170" width="200" height="32" rx="8" fill="#22C55E" />
          <text x="200" y="191" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">{"適正 \u2705"}</text>
        </g>
        <g className="label-p3">
          <rect x="100" y="170" width="200" height="32" rx="8" fill="#F59E0B" />
          <text x="200" y="191" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">{"緩すぎ \u26A0\uFE0F"}</text>
        </g>

        {/* 進行インジケーター */}
        <g className="label-p1">
          <circle cx="170" cy="220" r="5" fill="#EF4444" />
          <circle cx="200" cy="220" r="5" fill="#D1D5DB" />
          <circle cx="230" cy="220" r="5" fill="#D1D5DB" />
        </g>
        <g className="label-p2">
          <circle cx="170" cy="220" r="5" fill="#D1D5DB" />
          <circle cx="200" cy="220" r="5" fill="#22C55E" />
          <circle cx="230" cy="220" r="5" fill="#D1D5DB" />
        </g>
        <g className="label-p3">
          <circle cx="170" cy="220" r="5" fill="#D1D5DB" />
          <circle cx="200" cy="220" r="5" fill="#D1D5DB" />
          <circle cx="230" cy="220" r="5" fill="#F59E0B" />
        </g>

        {/* 説明テキスト */}
        <rect x="30" y="238" width="340" height="50" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        <g className="label-p1">
          <text x="200" y="258" textAnchor="middle" fontSize="10" fill="#EF4444">ドラグが強すぎると糸の限界を超えて切れてしまう</text>
          <text x="200" y="275" textAnchor="middle" fontSize="9" fill="#6B7280">大物がかかった時にラインブレイクの原因に</text>
        </g>
        <g className="label-p2">
          <text x="200" y="258" textAnchor="middle" fontSize="10" fill="#22C55E">適正なドラグなら糸を出しながら魚を疲れさせる</text>
          <text x="200" y="275" textAnchor="middle" fontSize="9" fill="#6B7280">糸を切られず、じっくりファイトできる</text>
        </g>
        <g className="label-p3">
          <text x="200" y="258" textAnchor="middle" fontSize="10" fill="#F59E0B">ドラグが弱すぎると糸が出続けて巻き取れない</text>
          <text x="200" y="275" textAnchor="middle" fontSize="9" fill="#6B7280">魚に主導権を握られて逃げられてしまう</text>
        </g>
      </svg>
    </div>
  );
}

function LineWindingDirectionDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 340"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="リールの糸巻き方向の正しい例と間違った例を比較した図。正しい方向はボビンとリールの回転方向が同じ。"
        role="img"
      >
        <rect width="600" height="340" rx="12" fill="#FFFBEB" />
        <text x="300" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#92400E">
          リールの糸巻き方向 &#x2014; 正しい例 vs 間違った例
        </text>

        {/* === 正しい例（左側） === */}
        <g transform="translate(10,45)">
          <rect x="5" y="5" width="275" height="280" rx="8" fill="#F0FDF4" stroke="#22C55E" strokeWidth="2" />
          <rect x="5" y="5" width="275" height="30" rx="8" fill="#22C55E" />
          <rect x="5" y="25" width="275" height="10" fill="#22C55E" />
          <text x="142" y="25" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#FFFFFF">
            正しい巻き方
          </text>

          {/* ボビン（糸の元） */}
          <text x="70" y="58" textAnchor="middle" fontSize="10" fill="#374151">ボビン（糸の元）</text>
          <ellipse cx="70" cy="100" rx="35" ry="45" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          <ellipse cx="70" cy="100" rx="20" ry="45" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
          {/* ボビンの回転矢印（反時計回り） */}
          <path d="M42,75 A35,35 0 0,0 42,125" fill="none" stroke="#22C55E" strokeWidth="2.5" markerEnd="url(#arrowCorrect)" />
          <text x="22" y="103" textAnchor="middle" fontSize="9" fill="#22C55E" fontWeight="bold">回転</text>

          {/* 糸のライン（ボビンからリールへ） */}
          <line x1="105" y1="85" x2="175" y2="85" stroke="#3B82F6" strokeWidth="2" />
          {/* テンション表示 */}
          <text x="140" y="78" textAnchor="middle" fontSize="8" fill="#6B7280">テンション</text>
          <path d="M120,82 L125,79 L130,82 L135,79 L140,82 L145,79 L150,82 L155,79 L160,82" stroke="#6B7280" strokeWidth="0.8" fill="none" />

          {/* リール */}
          <text x="210" y="58" textAnchor="middle" fontSize="10" fill="#374151">リール（スプール）</text>
          <ellipse cx="210" cy="100" rx="30" ry="40" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          <ellipse cx="210" cy="100" rx="18" ry="40" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
          {/* リールの回転矢印（反時計回り＝ボビンと同じ） */}
          <path d="M245,78 A35,35 0 0,1 245,122" fill="none" stroke="#22C55E" strokeWidth="2.5" markerEnd="url(#arrowCorrect)" />
          <text x="264" y="103" textAnchor="middle" fontSize="9" fill="#22C55E" fontWeight="bold">回転</text>

          {/* 方向一致マーク */}
          <text x="142" y="105" textAnchor="middle" fontSize="20" fill="#22C55E">&#x2192;</text>
          <text x="142" y="120" textAnchor="middle" fontSize="9" fill="#22C55E" fontWeight="bold">同じ方向</text>

          {/* 結果 */}
          <rect x="25" y="155" width="235" height="55" rx="6" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1" />
          <text x="142" y="175" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#166534">
            糸ヨレが発生しない
          </text>
          <text x="142" y="192" textAnchor="middle" fontSize="10" fill="#15803D">
            キャストがスムーズ・飛距離も出る
          </text>

          {/* スプールの断面図 */}
          <text x="142" y="228" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">スプール上面から見た図</text>
          <circle cx="100" cy="260" r="25" fill="none" stroke="#22C55E" strokeWidth="2" />
          <circle cx="100" cy="260" r="10" fill="#D1D5DB" />
          {/* 巻き方向の矢印（反時計回り） */}
          <path d="M85,238 A30,30 0 1,0 120,248" fill="none" stroke="#3B82F6" strokeWidth="2.5" markerEnd="url(#arrowBlueWind)" />
          <text x="100" y="263" textAnchor="middle" fontSize="7" fill="#374151">スプール</text>

          {/* ベイルとラインローラー */}
          <line x1="125" y1="260" x2="160" y2="248" stroke="#9CA3AF" strokeWidth="2" />
          <circle cx="160" cy="248" r="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          <text x="175" y="245" fontSize="8" fill="#374151">ラインローラー</text>
          <text x="175" y="256" fontSize="8" fill="#374151">（ここを通す）</text>
        </g>

        {/* === 間違った例（右側） === */}
        <g transform="translate(305,45)">
          <rect x="5" y="5" width="275" height="280" rx="8" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
          <rect x="5" y="5" width="275" height="30" rx="8" fill="#EF4444" />
          <rect x="5" y="25" width="275" height="10" fill="#EF4444" />
          <text x="142" y="25" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#FFFFFF">
            間違った巻き方（逆巻き）
          </text>

          {/* ボビン（糸の元） */}
          <text x="70" y="58" textAnchor="middle" fontSize="10" fill="#374151">ボビン（糸の元）</text>
          <ellipse cx="70" cy="100" rx="35" ry="45" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          <ellipse cx="70" cy="100" rx="20" ry="45" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
          {/* ボビンの回転矢印（時計回り＝逆） */}
          <path d="M42,125 A35,35 0 0,1 42,75" fill="none" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowWrong)" />
          <text x="22" y="103" textAnchor="middle" fontSize="9" fill="#EF4444" fontWeight="bold">逆回転</text>

          {/* 糸のライン（ねじれ表現） */}
          <path d="M105,85 Q115,78 125,90 Q135,100 145,82 Q155,68 165,88 L175,85" stroke="#EF4444" strokeWidth="2" fill="none" />
          <text x="140" y="72" textAnchor="middle" fontSize="8" fill="#EF4444" fontWeight="bold">糸ヨレ発生!</text>

          {/* リール */}
          <text x="210" y="58" textAnchor="middle" fontSize="10" fill="#374151">リール（スプール）</text>
          <ellipse cx="210" cy="100" rx="30" ry="40" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5" />
          <ellipse cx="210" cy="100" rx="18" ry="40" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
          {/* リールの回転矢印 */}
          <path d="M245,78 A35,35 0 0,1 245,122" fill="none" stroke="#22C55E" strokeWidth="2.5" markerEnd="url(#arrowCorrect)" />
          <text x="264" y="103" textAnchor="middle" fontSize="9" fill="#6B7280">回転</text>

          {/* 方向不一致マーク */}
          <text x="142" y="105" textAnchor="middle" fontSize="20" fill="#EF4444">&#x2194;</text>
          <text x="142" y="120" textAnchor="middle" fontSize="9" fill="#EF4444" fontWeight="bold">逆方向</text>

          {/* 結果 */}
          <rect x="25" y="155" width="235" height="55" rx="6" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1" />
          <text x="142" y="175" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#991B1B">
            糸ヨレ・バックラッシュの原因
          </text>
          <text x="142" y="192" textAnchor="middle" fontSize="10" fill="#B91C1C">
            糸が絡まってトラブル続出
          </text>

          {/* ぐちゃぐちゃの糸のイメージ */}
          <text x="142" y="228" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">こうなってしまう</text>
          <circle cx="100" cy="260" r="25" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,2" />
          <circle cx="100" cy="260" r="10" fill="#D1D5DB" />
          {/* 絡まった糸の表現 */}
          <path d="M80,242 Q95,250 85,260 Q78,268 95,272 Q108,265 100,255 Q90,248 105,245 Q115,252 110,265 Q98,278 88,270" stroke="#EF4444" strokeWidth="1.5" fill="none" />
          <text x="100" y="263" textAnchor="middle" fontSize="7" fill="#991B1B">ぐちゃ...</text>
          <text x="175" y="255" fontSize="9" fill="#B91C1C" fontWeight="bold">糸が絡まって</text>
          <text x="175" y="268" fontSize="9" fill="#B91C1C" fontWeight="bold">釣りにならない</text>
        </g>

        <defs>
          <marker id="arrowCorrect" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#22C55E" />
          </marker>
          <marker id="arrowWrong" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#EF4444" />
          </marker>
          <marker id="arrowBlueWind" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#3B82F6" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

export default function SetupGuidePage() {
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
          { label: "セッティング方法" },
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
            竿とリールのセッティング方法
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            釣りを始める前の準備。正しいセッティングで快適な釣りを楽しみましょう。
          </p>
        </div>

        <TackleSetupDiagram />

        <div className="space-y-6">
          {/* リールの取り付け方 */}
          <SectionCard title="リールの取り付け方">
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールシートの位置を確認する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿のグリップ部分にある、リールを取り付けるための金具（リールシート）を探します。ナット（ネジ）を緩めておきましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールフットを差し込む
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールの足の部分（リールフット）をリールシートの溝に差し込みます。片方を先に引っかけてから、もう片方をはめると簡単です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ナットを締めて固定する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ナットを手で回して、リールがしっかり固定されるまで締めます。工具は不要です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ガタつきがないか確認する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールを軽く揺すってみて、グラグラしなければOKです。ガタつく場合はナットをもう少し締めましょう。
                  </p>
                </div>
              </li>
            </ol>
            <Hint>
              リールが竿の下側に来るように取り付けます。ハンドルは利き手側に来るようにセットしましょう。
            </Hint>
          </SectionCard>

          {/* 竿の継ぎ方 */}
          <SectionCard title="竿の継ぎ方（振り出し竿の場合）">
            <p className="mb-4 text-sm text-muted-foreground">
              振り出し竿は、伸縮式の竿で初心者に最も一般的なタイプです。
            </p>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿先（穂先）から順番に伸ばす
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿の一番細い部分（穂先）から順番に引き出します。一番太い部分（元竿）は最後です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    各ガイドが一直線になるよう調整する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    糸を通す輪っか（ガイド）がすべて同じ方向を向くように、各節を回して調整します。ガイドがずれていると糸の通りが悪くなります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    各節をしっかり固定する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    引き出した各節がしっかり止まっていることを確認します。緩いと釣りの最中に縮んでしまいます。
                  </p>
                </div>
              </li>
            </ol>
            <Danger>
              無理に引っ張ると折れの原因になります。固い場合は接続部分を温かい手で握って温めると外れやすくなります。
            </Danger>
          </SectionCard>

          <DragAdjustmentDiagram />

          {/* ドラグアニメーション */}
          <div className="my-4">
            <h3 className="mb-2 text-lg font-bold">動きで見るドラグの効果</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              ドラグの締め具合による違いをアニメーションで確認しましょう。3つの状態が順番にループします。
            </p>
            <DragAnimationSvg />
          </div>

          {/* 糸の通し方 */}
          <SectionCard title="糸の通し方（ラインの通し方）">
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールのベイル（糸押さえ）を起こす
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールの半円形の金属パーツ（ベイル）を上に起こします。これで糸が自由に出るようになります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールから糸を出す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    糸の先端を持って、50cmほど引き出します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿のガイドに下から順番に通す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールに一番近いガイド（元ガイド）から順番に、竿先のガイドまで糸を通していきます。一つも飛ばさないように注意しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    穂先まで通したらベイルを戻す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    すべてのガイドに糸を通し終えたら、ベイルを元に戻します。これで糸がリールに巻き取れる状態になります。
                  </p>
                </div>
              </li>
            </ol>
            <Warning>
              ガイドを一つでも飛ばすと、竿に負担がかかって折れる原因になります。通し終わったら必ず全ガイドを確認しましょう。
            </Warning>
            <Hint>
              糸が細くて通しにくい場合は、糸の先端をセロテープで太くすると通しやすくなります。
            </Hint>
          </SectionCard>

          {/* リールの糸巻き方向の注意 */}
          <div id="line-direction" className="scroll-mt-20">
            <div className="overflow-hidden rounded-xl border-2 border-amber-400 bg-amber-50 shadow-lg dark:border-amber-600 dark:bg-amber-950">
              <div className="flex items-center gap-3 border-b border-amber-300 bg-amber-100 px-4 py-3 dark:border-amber-700 dark:bg-amber-900">
                <AlertTriangle className="size-6 shrink-0 text-amber-600 dark:text-amber-400" />
                <h2 className="text-lg font-bold text-amber-800 dark:text-amber-200">
                  初心者がよくやるミス：リールの糸巻き方向に注意！
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <p className="mb-4 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
                  リールに初めて糸を巻くとき、<strong>巻き方向を間違える</strong>のは初心者にありがちな失敗です。
                  逆方向に巻いてしまうと、キャスト時に糸が絡まる「ライントラブル」の原因になります。
                  最初にしっかり確認しましょう。
                </p>

                <LineWindingDirectionDiagram />

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-base font-bold text-amber-800 dark:text-amber-200">
                      正しい糸巻きの手順
                    </h3>
                    <ol className="list-none space-y-3">
                      <li className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                          1
                        </span>
                        <div className="text-sm text-amber-900 dark:text-amber-100">
                          <strong>ベイルを起こして</strong>糸をラインローラーに通す。ベイルを起こさずに巻くと、ラインローラーを通らず正しく巻けません。
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                          2
                        </span>
                        <div className="text-sm text-amber-900 dark:text-amber-100">
                          <strong>糸をスプールに結んで</strong>ベイルを戻す。結び方はユニノットやアーバーノットが簡単です。
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                          3
                        </span>
                        <div className="text-sm text-amber-900 dark:text-amber-100">
                          <strong>糸の出る方向を確認</strong>する。新品のボビン（糸の巻いてあるプラスチック）を床に置き、糸がボビンから出る方向（回転方向）と、リールのベイルが糸を巻き取る方向が<strong>同じ</strong>になるようにします。
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                          4
                        </span>
                        <div className="text-sm text-amber-900 dark:text-amber-100">
                          <strong>テンションをかけながら巻く</strong>。糸を濡れたタオルや指で軽く挟み、たるまないように一定のテンションをかけて巻きます。
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                          5
                        </span>
                        <div className="text-sm text-amber-900 dark:text-amber-100">
                          <strong>ラインローラーを通っているか確認</strong>。巻いている途中で糸がラインローラーから外れていないか、数回に一度チェックしましょう。
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-lg border border-amber-300 bg-white p-4 dark:border-amber-700 dark:bg-amber-900/50">
                    <h3 className="mb-2 text-base font-bold text-red-600 dark:text-red-400">
                      逆巻きするとどうなる？
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
                      <li className="flex gap-2">
                        <span className="shrink-0 text-red-500">&#x2716;</span>
                        <span><strong>糸ヨレ（ラインのねじれ）</strong>が発生し、キャストのたびに糸が絡まりやすくなる</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="shrink-0 text-red-500">&#x2716;</span>
                        <span><strong>バックラッシュ</strong>（糸がぐちゃぐちゃに絡まる現象）が起きやすくなる</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="shrink-0 text-red-500">&#x2716;</span>
                        <span>飛距離が大幅に落ちる</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="shrink-0 text-red-500">&#x2716;</span>
                        <span>最悪の場合、ガイドに糸が絡まって竿が折れる原因にもなる</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/50">
                    <h3 className="mb-2 text-base font-bold text-green-700 dark:text-green-300">
                      間違えた場合の直し方
                    </h3>
                    <ol className="space-y-1 text-sm text-green-800 dark:text-green-200">
                      <li>1. リールから糸を<strong>全部出す</strong>（広い場所で行う）</li>
                      <li>2. 糸のねじれが取れるよう、まっすぐ伸ばす</li>
                      <li>3. 正しい方向でイチから巻き直す</li>
                      <li>4. テンションをかけながら丁寧に巻く</li>
                    </ol>
                    <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                      ※ 少しだけ巻いた段階なら、すぐに出して巻き直しましょう。多く巻いてからでは糸ヨレが蓄積して取れにくくなります。
                    </p>
                  </div>

                  <div className="rounded-lg bg-amber-100 p-3 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    <span className="font-bold">ポイント：</span>
                    新品のリールでも最初の糸巻きは慎重に行いましょう。
                    釣具店で購入時に糸巻きをお願いすると、正しい方向で巻いてもらえるので初心者にはおすすめです。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 参考動画 */}
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Play className="size-5 text-primary" />
            参考動画
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            文字だけではわかりにくい手順を動画で確認しましょう。
          </p>
          <YouTubeVideoList links={setupVideos} />
        </section>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            セッティングができたら、次は糸の結び方を覚えましょう。
          </p>
          <Link
            href="/guide/knots"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            釣り糸の結び方を学ぶ
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
