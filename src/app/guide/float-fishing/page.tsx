import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { CircleDot, Anchor, Bug, Eye, Fish } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RigDiagram } from "@/components/rig-diagram";

export const metadata: Metadata = {
  title: "ウキ釣り完全ガイド - ウキの種類・仕掛け・アタリの取り方",
  description:
    "ウキ釣り初心者のための完全ガイド。ウキの種類と選び方、仕掛けの作り方、エサの付け方、アタリの取り方を詳しく解説。チヌ・グレ・メバルなど代表的なターゲットも紹介。",
  openGraph: {
    title: "ウキ釣り完全ガイド - ウキの種類・仕掛け・アタリの取り方",
    description:
      "ウキの種類と選び方から仕掛けの作り方、アタリの取り方まで初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/float-fishing",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/float-fishing",
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
      name: "ウキ釣り完全ガイド",
      item: "https://tsurispot.com/guide/float-fishing",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "ウキ釣りの仕掛けの作り方と釣り方",
  description:
    "ウキ釣り初心者のための完全ガイド。ウキの種類と選び方、仕掛けの作り方、エサの付け方、アタリの取り方を詳しく解説。チヌ・グレ・メバルなど代表的なターゲットも紹介。",
  totalTime: "PT30M",
  supply: [
    { "@type": "HowToSupply", name: "ウキ（棒ウキ・玉ウキ・円錐ウキのいずれか）" },
    { "@type": "HowToSupply", name: "ウキ止め糸" },
    { "@type": "HowToSupply", name: "シモリ玉" },
    { "@type": "HowToSupply", name: "ガン玉（オモリ）" },
    { "@type": "HowToSupply", name: "サルカン" },
    { "@type": "HowToSupply", name: "ハリス（1〜2号）" },
    { "@type": "HowToSupply", name: "針（ハリス付きが便利）" },
    { "@type": "HowToSupply", name: "エサ（オキアミ・虫エサ・練りエサ）" },
  ],
  tool: [
    { "@type": "HowToTool", name: "磯竿またはウキ釣り用の竿（4.5〜5.3m）" },
    { "@type": "HowToTool", name: "スピニングリール（2500〜3000番）" },
    { "@type": "HowToTool", name: "ハサミまたはラインカッター" },
    { "@type": "HowToTool", name: "バケツ" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "ウキ止めを付ける",
      text: "道糸にウキ止め糸を結びます。ウキ止めの位置がタナ（狙う深さ）を決めます。水深2mを狙うなら、ウキから針まで2mになるよう調整します。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "シモリ玉を通す",
      text: "ウキ止めの下にシモリ玉（小さなビーズ）を通します。これがウキのストッパーの役割を果たします。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "ウキを通す",
      text: "道糸にウキを通します。中通しタイプ（円錐ウキ）は道糸が中を通る構造。棒ウキはスナップで接続します。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "ガン玉（オモリ）を打つ",
      text: "ウキの浮力に合わせたガン玉を道糸に打ちます。ウキのトップ（先端）がちょうど水面に出るくらいが最適な浮力バランスです。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "サルカンを結ぶ",
      text: "道糸とハリスの接続にサルカンを使います。糸のヨレ（ねじれ）を防ぐ効果があります。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "ハリスと針を結ぶ",
      text: "サルカンの下にハリス（1〜2号程度）を30〜100cm結び、先端に針を付けます。ハリス付き針を使うと簡単です。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "エサを付けて仕掛けを投入する",
      text: "針にオキアミや虫エサを付け、ポイントに向かって仕掛けを振り込みます。ウキが安定するまで少し待ちましょう。",
      position: 7,
    },
    {
      "@type": "HowToStep",
      name: "アタリを待って合わせる",
      text: "ウキの動きを観察し、消し込みアタリ（ウキが沈む）が出たらロッドを上にシャープに持ち上げて合わせます。モゾモゾした動きのときはまだ待ちましょう。",
      position: 8,
    },
  ],
};

/* ── SVG図解コンポーネント ── */

function TanaAdjustSvg() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">タナ調整の仕組み</h3>
      <svg
        viewBox="0 0 500 380"
        className="mx-auto w-full max-w-[500px]"
        aria-label="ウキ釣りのタナ調整図解：ウキ止めの位置を変えることで狙う深さが変わる"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="500" height="380" fill="#F9FAFB" rx="12" />

        {/* 左: 浅いタナ */}
        <g>
          <text x="120" y="24" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">浅いタナ（表層狙い）</text>

          {/* 水面 */}
          <rect x="30" y="60" width="180" height="280" fill="#DBEAFE" rx="8" />
          <line x1="30" y1="65" x2="210" y2="65" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="6,3" />
          <text x="200" y="58" fontSize="9" fill="#2563EB" textAnchor="end">水面</text>

          {/* 道糸 */}
          <line x1="120" y1="45" x2="120" y2="60" stroke="#4B5563" strokeWidth="1.5" />

          {/* ウキ止め（浅い位置） */}
          <rect x="115" y="70" width="10" height="5" rx="2" fill="#EF4444" />

          {/* ウキ */}
          <ellipse cx="120" cy="85" rx="10" ry="16" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" />
          <rect x="118" y="66" width="4" height="10" fill="#44403C" />

          {/* 道糸（水中） */}
          <line x1="120" y1="101" x2="120" y2="190" stroke="#4B5563" strokeWidth="1" />

          {/* ガン玉 */}
          <circle cx="120" cy="160" r="4" fill="#4B5563" />

          {/* ハリス */}
          <line x1="120" y1="164" x2="120" y2="190" stroke="#4B5563" strokeWidth="1" strokeDasharray="3,2" />

          {/* 針 */}
          <path d="M120,190 Q113,205 122,205" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="118" cy="207" rx="4" ry="3" fill="#F97316" opacity="0.7" />

          {/* タナの距離 */}
          <line x1="80" y1="75" x2="80" y2="195" stroke="#22C55E" strokeWidth="1.5" />
          <line x1="75" y1="75" x2="85" y2="75" stroke="#22C55E" strokeWidth="1.5" />
          <line x1="75" y1="195" x2="85" y2="195" stroke="#22C55E" strokeWidth="1.5" />
          <text x="68" y="140" fontSize="10" fill="#22C55E" textAnchor="end" transform="rotate(-90,68,140)">タナ 約1.5m</text>

          {/* 魚 */}
          <ellipse cx="160" cy="120" rx="14" ry="6" fill="#60A5FA" opacity="0.7" />
          <text x="160" y="145" fontSize="9" fill="#2563EB" textAnchor="middle">イワシ等</text>

          {/* 海底 */}
          <path d="M30,320 Q120,310 210,320" fill="#D4A373" opacity="0.3" />
        </g>

        {/* 右: 深いタナ */}
        <g>
          <text x="370" y="24" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">深いタナ（底層狙い）</text>

          {/* 水面 */}
          <rect x="280" y="60" width="180" height="280" fill="#DBEAFE" rx="8" />
          <line x1="280" y1="65" x2="460" y2="65" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="6,3" />
          <text x="450" y="58" fontSize="9" fill="#2563EB" textAnchor="end">水面</text>

          {/* 道糸 */}
          <line x1="370" y1="45" x2="370" y2="60" stroke="#4B5563" strokeWidth="1.5" />

          {/* ウキ止め（浅い位置に見えるが、長いウキ下） */}
          <rect x="365" y="70" width="10" height="5" rx="2" fill="#EF4444" />

          {/* ウキ */}
          <ellipse cx="370" cy="85" rx="10" ry="16" fill="#EF4444" stroke="#DC2626" strokeWidth="1.5" />
          <rect x="368" y="66" width="4" height="10" fill="#44403C" />

          {/* 道糸（水中・長い） */}
          <line x1="370" y1="101" x2="370" y2="295" stroke="#4B5563" strokeWidth="1" />

          {/* ガン玉 */}
          <circle cx="370" cy="260" r="4" fill="#4B5563" />

          {/* ハリス */}
          <line x1="370" y1="264" x2="370" y2="295" stroke="#4B5563" strokeWidth="1" strokeDasharray="3,2" />

          {/* 針 */}
          <path d="M370,295 Q363,310 372,310" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="368" cy="312" rx="4" ry="3" fill="#F97316" opacity="0.7" />

          {/* タナの距離 */}
          <line x1="330" y1="75" x2="330" y2="300" stroke="#22C55E" strokeWidth="1.5" />
          <line x1="325" y1="75" x2="335" y2="75" stroke="#22C55E" strokeWidth="1.5" />
          <line x1="325" y1="300" x2="335" y2="300" stroke="#22C55E" strokeWidth="1.5" />
          <text x="318" y="195" fontSize="10" fill="#22C55E" textAnchor="end" transform="rotate(-90,318,195)">タナ 約4m</text>

          {/* 魚 */}
          <ellipse cx="410" cy="280" rx="14" ry="6" fill="#2563EB" opacity="0.7" />
          <text x="410" y="300" fontSize="9" fill="#1E40AF" textAnchor="middle">チヌ等</text>

          {/* 海底 */}
          <path d="M280,320 Q370,310 460,320" fill="#D4A373" opacity="0.3" />
        </g>

        {/* 中央の矢印と説明 */}
        <g>
          <path d="M220,180 L270,180" fill="none" stroke="#EF4444" strokeWidth="2" />
          <polygon points="265,175 265,185 275,180" fill="#EF4444" />
          <text x="247" y="165" fontSize="10" fill="#EF4444" textAnchor="middle">ウキ止めを</text>
          <text x="247" y="178" fontSize="10" fill="#EF4444" textAnchor="middle">上にずらす</text>
        </g>

        {/* 説明テキスト */}
        <text x="250" y="365" fontSize="10" fill="#6B7280" textAnchor="middle">
          ウキ止めの位置を変えるだけでタナ（深さ）を自由に調整できます
        </text>
      </svg>
    </div>
  );
}

function UkiAtariSvg() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">ウキのアタリパターン</h3>
      <svg
        viewBox="0 0 560 200"
        className="mx-auto w-full max-w-[560px]"
        aria-label="ウキのアタリパターン図解：消し込み、モゾモゾ、横走り、浮き上がりの4種類"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="560" height="200" fill="#F9FAFB" rx="12" />

        {/* 共通水面ライン */}
        <line x1="10" y1="100" x2="550" y2="100" stroke="#2563EB" strokeWidth="1" strokeDasharray="6,3" />

        {/* 1. 消し込みアタリ */}
        <g>
          <text x="70" y="20" fontSize="11" fill="#EF4444" textAnchor="middle" fontWeight="bold">消し込み</text>
          <text x="70" y="34" fontSize="9" fill="#6B7280" textAnchor="middle">合わせる!</text>
          {/* 通常位置のウキ（薄い） */}
          <ellipse cx="55" cy="92" rx="8" ry="14" fill="#EF4444" opacity="0.2" stroke="#DC2626" strokeWidth="1" strokeDasharray="3,2" />
          <rect x="53" y="75" width="3" height="10" fill="#44403C" opacity="0.2" />
          {/* 沈んだウキ */}
          <ellipse cx="85" cy="130" rx="8" ry="14" fill="#EF4444" opacity="0.8" stroke="#DC2626" strokeWidth="1.5" />
          <rect x="83" y="113" width="3" height="10" fill="#44403C" />
          {/* 矢印 */}
          <path d="M60,95 L80,120" fill="none" stroke="#EF4444" strokeWidth="1.5" />
          <polygon points="78,117 84,120 80,124" fill="#EF4444" />
          <text x="70" y="170" fontSize="9" fill="#6B7280" textAnchor="middle">一気に沈む</text>
        </g>

        {/* 2. モゾモゾアタリ */}
        <g>
          <text x="210" y="20" fontSize="11" fill="#F59E0B" textAnchor="middle" fontWeight="bold">モゾモゾ</text>
          <text x="210" y="34" fontSize="9" fill="#6B7280" textAnchor="middle">まだ待つ</text>
          {/* ウキ（小刻みに上下） */}
          <ellipse cx="195" cy="88" rx="8" ry="14" fill="#EF4444" opacity="0.4" stroke="#DC2626" strokeWidth="1" strokeDasharray="2,2" />
          <ellipse cx="210" cy="96" rx="8" ry="14" fill="#EF4444" opacity="0.6" stroke="#DC2626" strokeWidth="1" strokeDasharray="2,2" />
          <ellipse cx="225" cy="90" rx="8" ry="14" fill="#EF4444" opacity="0.8" stroke="#DC2626" strokeWidth="1.5" />
          <rect x="223" y="73" width="3" height="10" fill="#44403C" />
          {/* 上下矢印 */}
          <path d="M210,75 L210,65 M210,110 L210,120" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
          <polygon points="207,68 213,68 210,62" fill="#F59E0B" />
          <polygon points="207,117 213,117 210,123" fill="#F59E0B" />
          <text x="210" y="170" fontSize="9" fill="#6B7280" textAnchor="middle">小刻みに上下</text>
        </g>

        {/* 3. 横走りアタリ */}
        <g>
          <text x="350" y="20" fontSize="11" fill="#3B82F6" textAnchor="middle" fontWeight="bold">横走り</text>
          <text x="350" y="34" fontSize="9" fill="#6B7280" textAnchor="middle">沈んだら合わせる</text>
          {/* ウキ（横に移動） */}
          <ellipse cx="325" cy="92" rx="8" ry="14" fill="#EF4444" opacity="0.2" stroke="#DC2626" strokeWidth="1" strokeDasharray="3,2" />
          <ellipse cx="355" cy="92" rx="8" ry="14" fill="#EF4444" opacity="0.5" stroke="#DC2626" strokeWidth="1" strokeDasharray="3,2" />
          <ellipse cx="380" cy="92" rx="8" ry="14" fill="#EF4444" opacity="0.8" stroke="#DC2626" strokeWidth="1.5" />
          <rect x="378" y="75" width="3" height="10" fill="#44403C" />
          {/* 横矢印 */}
          <path d="M330,92 L375,92" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
          <polygon points="370,88 370,96 380,92" fill="#3B82F6" />
          <text x="350" y="170" fontSize="9" fill="#6B7280" textAnchor="middle">横に移動する</text>
        </g>

        {/* 4. 浮き上がりアタリ */}
        <g>
          <text x="490" y="20" fontSize="11" fill="#22C55E" textAnchor="middle" fontWeight="bold">浮き上がり</text>
          <text x="490" y="34" fontSize="9" fill="#6B7280" textAnchor="middle">浮きったら合わせる</text>
          {/* 通常位置（薄い） */}
          <ellipse cx="475" cy="92" rx="8" ry="14" fill="#EF4444" opacity="0.2" stroke="#DC2626" strokeWidth="1" strokeDasharray="3,2" />
          <rect x="473" y="75" width="3" height="10" fill="#44403C" opacity="0.2" />
          {/* 浮いたウキ（横倒しに近い） */}
          <ellipse cx="505" cy="80" rx="14" ry="8" fill="#EF4444" opacity="0.8" stroke="#DC2626" strokeWidth="1.5" />
          {/* 上向き矢印 */}
          <path d="M480,92 L500,78" fill="none" stroke="#22C55E" strokeWidth="1.5" />
          <polygon points="497,75 504,78 500,82" fill="#22C55E" />
          <text x="490" y="170" fontSize="9" fill="#6B7280" textAnchor="middle">逆に浮き上がる</text>
          <text x="490" y="183" fontSize="9" fill="#6B7280" textAnchor="middle">(チヌに多い)</text>
        </g>
      </svg>
    </div>
  );
}

function UkiAtariAnimationSvg() {
  return (
    <div className="my-6">
      <h4 className="mb-3 text-center text-sm font-bold text-foreground">
        動きで見るアタリパターン
      </h4>
      <svg
        viewBox="0 0 500 350"
        className="mx-auto w-full max-w-[500px]"
        aria-label="ウキのアタリパターンアニメーション：消し込み、モゾモゾ、横走り、浮き上がりの4種類が動きで見られる"
      >
        <defs>
          {/* 水面のさざ波パターン */}
          <pattern id="wave-pattern" x="0" y="0" width="60" height="12" patternUnits="userSpaceOnUse">
            <path d="M0,6 Q15,0 30,6 Q45,12 60,6" fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.5">
              <animate attributeName="d" values="M0,6 Q15,0 30,6 Q45,12 60,6;M0,6 Q15,12 30,6 Q45,0 60,6;M0,6 Q15,0 30,6 Q45,12 60,6" dur="3s" repeatCount="indefinite" />
            </path>
          </pattern>
        </defs>

        {/* 背景 */}
        <rect x="0" y="0" width="500" height="350" fill="#F9FAFB" rx="12" />

        {/* 空（水面の上） */}
        <rect x="0" y="0" width="500" height="140" fill="#F0F9FF" rx="12" />

        {/* 海 */}
        <rect x="0" y="140" width="500" height="210" fill="#DBEAFE" />
        <rect x="0" y="338" width="500" height="12" fill="#F9FAFB" rx="0" />

        {/* 水面ライン */}
        <line x1="0" y1="140" x2="500" y2="140" stroke="#3B82F6" strokeWidth="2" />

        {/* さざ波アニメーション */}
        <g opacity="0.4">
          <path d="M0,140 Q30,134 60,140 Q90,146 120,140 Q150,134 180,140 Q210,146 240,140 Q270,134 300,140 Q330,146 360,140 Q390,134 420,140 Q450,146 480,140 L500,140" fill="none" stroke="#3B82F6" strokeWidth="1.5">
            <animate attributeName="d" values="M0,140 Q30,134 60,140 Q90,146 120,140 Q150,134 180,140 Q210,146 240,140 Q270,134 300,140 Q330,146 360,140 Q390,134 420,140 Q450,146 480,140 L500,140;M0,140 Q30,146 60,140 Q90,134 120,140 Q150,146 180,140 Q210,134 240,140 Q270,146 300,140 Q330,134 360,140 Q390,146 420,140 Q450,134 480,140 L500,140;M0,140 Q30,134 60,140 Q90,146 120,140 Q150,134 180,140 Q210,146 240,140 Q270,134 300,140 Q330,146 360,140 Q390,134 420,140 Q450,146 480,140 L500,140" dur="2s" repeatCount="indefinite" />
          </path>
        </g>
        <g opacity="0.25">
          <path d="M0,148 Q25,144 50,148 Q75,152 100,148 Q125,144 150,148 Q175,152 200,148 Q225,144 250,148 Q275,152 300,148 Q325,144 350,148 Q375,152 400,148 Q425,144 450,148 Q475,152 500,148" fill="none" stroke="#3B82F6" strokeWidth="1">
            <animate attributeName="d" values="M0,148 Q25,144 50,148 Q75,152 100,148 Q125,144 150,148 Q175,152 200,148 Q225,144 250,148 Q275,152 300,148 Q325,144 350,148 Q375,152 400,148 Q425,144 450,148 Q475,152 500,148;M0,148 Q25,152 50,148 Q75,144 100,148 Q125,152 150,148 Q175,144 200,148 Q225,152 250,148 Q275,144 300,148 Q325,152 350,148 Q375,144 400,148 Q425,152 450,148 Q475,144 500,148;M0,148 Q25,144 50,148 Q75,152 100,148 Q125,144 150,148 Q175,152 200,148 Q225,144 250,148 Q275,152 300,148 Q325,144 350,148 Q375,152 400,148 Q425,144 450,148 Q475,152 500,148" dur="2.5s" repeatCount="indefinite" />
          </path>
        </g>

        {/* ── 1. 消し込み ── */}
        <g>
          {/* ラベル */}
          <text x="62" y="28" fontSize="13" fill="#EF4444" textAnchor="middle" fontWeight="bold">消し込み</text>
          <text x="62" y="44" fontSize="10" fill="#6B7280" textAnchor="middle">ゆっくり沈む</text>

          {/* 道糸 */}
          <line x1="62" y1="70" x2="62" y2="120" stroke="#9CA3AF" strokeWidth="1" />

          {/* ウキ本体 - ゆっくり沈んで戻る */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0,50;0,50;0,0" keyTimes="0;0.4;0.6;1" dur="3s" repeatCount="indefinite" />
            {/* ウキトップ（赤い棒） */}
            <rect x="60" y="108" width="4" height="16" rx="2" fill="#EF4444" />
            {/* ウキ上部（赤） */}
            <ellipse cx="62" cy="130" rx="8" ry="12" fill="#EF4444" />
            {/* ウキ下部（白） */}
            <ellipse cx="62" cy="146" rx="6" ry="10" fill="#ffffff" stroke="#D1D5DB" strokeWidth="0.5" />
          </g>
        </g>

        {/* ── 2. モゾモゾ ── */}
        <g>
          {/* ラベル */}
          <text x="187" y="28" fontSize="13" fill="#F59E0B" textAnchor="middle" fontWeight="bold">モゾモゾ</text>
          <text x="187" y="44" fontSize="10" fill="#6B7280" textAnchor="middle">ブルブル震える</text>

          {/* 道糸 */}
          <line x1="187" y1="70" x2="187" y2="120" stroke="#9CA3AF" strokeWidth="1" />

          {/* ウキ本体 - 小刻みに震える */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;-2,-3;1,2;-1,-2;2,1;-2,-1;1,3;0,0" dur="1s" repeatCount="indefinite" />
            {/* ウキトップ */}
            <rect x="185" y="108" width="4" height="16" rx="2" fill="#EF4444" />
            {/* ウキ上部 */}
            <ellipse cx="187" cy="130" rx="8" ry="12" fill="#EF4444" />
            {/* ウキ下部 */}
            <ellipse cx="187" cy="146" rx="6" ry="10" fill="#ffffff" stroke="#D1D5DB" strokeWidth="0.5" />
          </g>
        </g>

        {/* ── 3. 横走り ── */}
        <g>
          {/* ラベル */}
          <text x="312" y="28" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">横走り</text>
          <text x="312" y="44" fontSize="10" fill="#6B7280" textAnchor="middle">左右に移動</text>

          {/* 道糸 */}
          <line x1="312" y1="70" x2="312" y2="120" stroke="#9CA3AF" strokeWidth="1" />

          {/* ウキ本体 - 左右に移動 */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="-30,0;30,0;-30,0" dur="2s" repeatCount="indefinite" />
            {/* ウキトップ */}
            <rect x="310" y="108" width="4" height="16" rx="2" fill="#EF4444" />
            {/* ウキ上部 */}
            <ellipse cx="312" cy="130" rx="8" ry="12" fill="#EF4444" />
            {/* ウキ下部 */}
            <ellipse cx="312" cy="146" rx="6" ry="10" fill="#ffffff" stroke="#D1D5DB" strokeWidth="0.5" />
          </g>
        </g>

        {/* ── 4. 浮き上がり ── */}
        <g>
          {/* ラベル */}
          <text x="437" y="28" fontSize="13" fill="#22C55E" textAnchor="middle" fontWeight="bold">浮き上がり</text>
          <text x="437" y="44" fontSize="10" fill="#6B7280" textAnchor="middle">沈んで浮き上がる</text>

          {/* 道糸 */}
          <line x1="437" y1="70" x2="437" y2="120" stroke="#9CA3AF" strokeWidth="1" />

          {/* ウキ本体 - 沈んでから大きく浮き上がる */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0,20;0,-30;0,-30;0,0" keyTimes="0;0.25;0.5;0.75;1" dur="3s" repeatCount="indefinite" />
            {/* ウキトップ */}
            <rect x="435" y="108" width="4" height="16" rx="2" fill="#EF4444" />
            {/* ウキ上部 */}
            <ellipse cx="437" cy="130" rx="8" ry="12" fill="#EF4444" />
            {/* ウキ下部 */}
            <ellipse cx="437" cy="146" rx="6" ry="10" fill="#ffffff" stroke="#D1D5DB" strokeWidth="0.5" />
          </g>
        </g>

        {/* 各ウキの下のパターン名ラベル（水中） */}
        <g>
          <rect x="20" y="300" width="85" height="24" rx="6" fill="#EF4444" opacity="0.1" />
          <text x="62" y="316" fontSize="11" fill="#EF4444" textAnchor="middle" fontWeight="bold">消し込み</text>

          <rect x="145" y="300" width="85" height="24" rx="6" fill="#F59E0B" opacity="0.1" />
          <text x="187" y="316" fontSize="11" fill="#F59E0B" textAnchor="middle" fontWeight="bold">モゾモゾ</text>

          <rect x="270" y="300" width="85" height="24" rx="6" fill="#3B82F6" opacity="0.1" />
          <text x="312" y="316" fontSize="11" fill="#3B82F6" textAnchor="middle" fontWeight="bold">横走り</text>

          <rect x="395" y="300" width="85" height="24" rx="6" fill="#22C55E" opacity="0.1" />
          <text x="437" y="316" fontSize="11" fill="#22C55E" textAnchor="middle" fontWeight="bold">浮き上がり</text>
        </g>

        {/* 区切り線（各ウキの間） */}
        <line x1="125" y1="55" x2="125" y2="295" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="250" y1="55" x2="250" y2="295" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
        <line x1="375" y1="55" x2="375" y2="295" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
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

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span className="font-medium">注意：</span>
      {children}
    </div>
  );
}

export default function FloatFishingGuidePage() {
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
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "釣りガイド", href: "/guide" }, { label: "ウキ釣り完全ガイド" }]} />

        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            ウキ釣り完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            ウキの動きでアタリを取る、伝統的で奥深い釣り方を学びましょう。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">ウキ釣りの魅力：</span>
          ウキが水面に浮かぶ様子を眺めながら、沈む瞬間のドキドキ感を味わえるのがウキ釣りの最大の魅力。狙う深さ（タナ）を自由に調整でき、堤防から磯まで幅広い場所で楽しめます。
        </div>

        <div className="space-y-6">
          {/* ウキの種類と選び方 */}
          <SectionCard title="ウキの種類と選び方" icon={CircleDot}>
            <p className="mb-4 text-sm text-muted-foreground">
              ウキにはさまざまな種類があり、釣り方や状況によって使い分けます。代表的なウキを紹介します。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">棒ウキ</h3>
                <p className="text-sm text-muted-foreground">
                  細長い棒状のウキ。感度が高く、小さなアタリも見逃しにくいのが特徴です。風が弱く波が穏やかな日に適しています。堤防での釣りにおすすめです。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">円錐ウキ（ドングリウキ）</h3>
                <p className="text-sm text-muted-foreground">
                  丸みを帯びた安定感のあるウキ。波や風の影響を受けにくく、遠投にも対応できます。磯釣りでグレやチヌを狙う際の定番ウキです。道糸が中通しになっているため仕掛けが絡みにくい利点もあります。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">玉ウキ</h3>
                <p className="text-sm text-muted-foreground">
                  球状のシンプルなウキ。安価で視認性が良く、初心者にも扱いやすいのが特徴。堤防でのちょい投げウキ釣りや、子供と一緒の釣りに最適です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">電気ウキ</h3>
                <p className="text-sm text-muted-foreground">
                  LEDライトが内蔵されたウキ。夜釣りでもアタリが見えるため、夜のウキ釣りには必須です。赤や緑の発光色があり、暗闇でもくっきりと見えます。
                </p>
              </div>
            </div>

            <Hint>
              初心者は視認性の良い「棒ウキ」か「玉ウキ」から始めるのがおすすめ。慣れてきたら状況に応じて円錐ウキにステップアップしましょう。
            </Hint>
          </SectionCard>

          {/* 仕掛けの作り方 */}
          <SectionCard title="仕掛けの作り方" icon={Anchor}>
            <p className="mb-4 text-sm text-muted-foreground">
              基本的なウキ釣り仕掛けの構成を上から順番に解説します。まずは仕掛けの全体像を確認しましょう。
            </p>

            <RigDiagram type="float" />

            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">ウキ止めを付ける</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸にウキ止め糸を結びます。ウキ止めの位置がタナ（狙う深さ）を決めます。水深2mを狙うなら、ウキから針まで2mになるよう調整します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">シモリ玉を通す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ウキ止めの下にシモリ玉（小さなビーズ）を通します。これがウキのストッパーの役割を果たします。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">ウキを通す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸にウキを通します。中通しタイプ（円錐ウキ）は道糸が中を通る構造。棒ウキはスナップで接続します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">ガン玉（オモリ）を打つ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ウキの浮力に合わせたガン玉を道糸に打ちます。ウキのトップ（先端）がちょうど水面に出るくらいが最適な浮力バランスです。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">サルカンを結ぶ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸とハリスの接続にサルカンを使います。糸のヨレ（ねじれ）を防ぐ効果があります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  6
                </span>
                <div>
                  <p className="font-medium text-foreground">ハリスと針を結ぶ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    サルカンの下にハリス（1〜2号程度）を30〜100cm結び、先端に針を付けます。ハリス付き針を使うと簡単です。
                  </p>
                </div>
              </li>
            </ol>

            <Warning>
              ウキの浮力表示とガン玉の重さを必ず合わせましょう。浮力が合っていないと、ウキが沈みすぎたり浮きすぎたりしてアタリが取れません。
            </Warning>

            <TanaAdjustSvg />
          </SectionCard>

          {/* エサの付け方 */}
          <SectionCard title="エサの付け方" icon={Bug}>
            <p className="mb-4 text-sm text-muted-foreground">
              ウキ釣りで使う代表的なエサと、針への付け方を紹介します。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">オキアミ</h3>
                <p className="text-sm text-muted-foreground">
                  最も万能なエサ。尾を取り除き、背中側から針を通して腹側に抜きます。身崩れしやすいので、ハリ先がエサから少し出るようにセットするのがコツ。チヌ・グレ狙いの定番です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">虫エサ（アオイソメ・ゴカイ）</h3>
                <p className="text-sm text-muted-foreground">
                  頭の部分から針を刺し、体に沿って通し刺しにします。長い場合は2〜3cmにカットしてもOK。動きで魚を誘うため、できるだけ活きの良い状態で付けましょう。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">練りエサ</h3>
                <p className="text-sm text-muted-foreground">
                  粉末を水で練って作るエサ。針に丸く付けます。手が汚れにくく、虫が苦手な方にもおすすめ。チヌ狙い用の集魚剤入りタイプが人気です。
                </p>
              </div>
            </div>

            <Hint>
              エサが針からズレやすい場合は、針のサイズを見直しましょう。エサに対して針が大きすぎると外れやすくなります。
            </Hint>
          </SectionCard>

          {/* アタリの取り方 */}
          <SectionCard title="アタリの取り方" icon={Eye}>
            <p className="mb-4 text-sm text-muted-foreground">
              ウキ釣り最大の醍醐味は、ウキの動きからアタリ（魚が食いついた合図）を読み取ること。代表的なアタリのパターンを覚えましょう。
            </p>

            <UkiAtariSvg />

            <UkiAtariAnimationSvg />

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">消し込みアタリ</span>
                  &nbsp;&mdash;&nbsp;ウキが一気に水中に沈む。最もわかりやすいアタリで、魚がしっかりエサを咥えた状態。合わせ（ロッドを上げる）のタイミングです。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">モゾモゾアタリ</span>
                  &nbsp;&mdash;&nbsp;ウキが小刻みに上下する。エサを突いている段階。まだ合わせずに待ちましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">横走りアタリ</span>
                  &nbsp;&mdash;&nbsp;ウキが横方向に移動する。魚がエサを咥えたまま泳いでいる状態。ウキが沈んだ瞬間に合わせます。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">浮き上がりアタリ</span>
                  &nbsp;&mdash;&nbsp;ウキが逆に浮き上がる。魚がエサを持ち上げた状態で、チヌに多いパターン。ウキが浮き上がりきったら合わせましょう。
                </span>
              </div>
            </div>

            <div className="my-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">合わせのコツ：</span>
              慌てて合わせると針が外れることが多いです。「ウキが完全に消し込んだ」のを確認してから、ロッドを真上にシャープに持ち上げましょう。グレの場合はやや早め、チヌの場合はしっかり食い込ませてから合わせるのがセオリーです。
            </div>

            <Warning>
              エサ取り（本命以外の小魚）がいると、エサばかり取られてアタリが出ないことがあります。コマセ（撒き餌）を遠くに撒いてエサ取りを分散させる、タナを変える、エサを硬めにするなどの対策が有効です。
            </Warning>
          </SectionCard>

          {/* 代表的なターゲット */}
          <SectionCard title="代表的なターゲット" icon={Fish}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">チヌ（クロダイ）</h3>
                <p className="text-sm text-muted-foreground">
                  堤防や磯で狙える人気ターゲット。引きが強く、食味も良い。オキアミや練りエサで狙います。警戒心が強いため、繊細な仕掛けと静かなアプローチが求められます。
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  時期：通年（春〜秋が好シーズン）/ タナ：底付近〜中層
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">グレ（メジナ）</h3>
                <p className="text-sm text-muted-foreground">
                  磯釣りの王道ターゲット。コマセワークで寄せて食わせる「フカセ釣り」が主流。引きが強く、磯際でのスリリングなやり取りが醍醐味です。
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  時期：秋〜春（冬が最盛期）/ タナ：中層〜やや深め
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">メバル</h3>
                <p className="text-sm text-muted-foreground">
                  夜行性の根魚で、冬〜春が好シーズン。小型の電気ウキを使った夜釣りが人気。虫エサやオキアミで狙います。繊細なアタリを楽しめる釣りものです。
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  時期：冬〜春 / タナ：表層〜中層（夜間）
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 関連ガイド */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guide/rigs" className="text-primary hover:underline">
                    釣り仕掛け図解ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ウキ釣り仕掛けの構成を図解で確認</span>
                </li>
                <li>
                  <Link href="/guide/knots" className="text-primary hover:underline">
                    釣り糸の結び方
                  </Link>
                  <span className="text-muted-foreground"> - 仕掛け作りに必要な結び方</span>
                </li>
                <li>
                  <Link href="/guide/tide" className="text-primary hover:underline">
                    潮汐の読み方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ウキ釣りに重要な潮の読み方</span>
                </li>
                <li>
                  <Link href="/guide/night-fishing" className="text-primary hover:underline">
                    夜釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 電気ウキを使った夜のウキ釣り</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            ウキ釣りの基本がわかったら、潮の読み方を学んで釣果アップを目指しましょう。
          </p>
          <Link
            href="/guide/tide"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            潮汐の読み方ガイドへ
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
