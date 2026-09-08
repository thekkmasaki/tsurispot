import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Clock,
  Target,
  Settings,
  MapPin,
  ShieldAlert,
  Fish,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fishingSpots } from "@/lib/data/spots";
import { InArticleAd } from "@/components/ads/ad-unit";
import { ProductList } from "@/components/affiliate/product-list";
import { products } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "タチウオ釣り完全ガイド｜堤防からの釣り方4種・仕掛け・時間帯",
  description:
    "堤防からのタチウオ釣りを徹底解説。ワインド・テンヤ・電気ウキ・ジグの引き釣り4種の使い分け、タナの探り方、時合い（夕マヅメ・夜・朝マヅメ）、タックル選び、鋭い歯への安全対策まで初心者向けにまとめました。",
  openGraph: {
    title: "タチウオ釣り完全ガイド｜堤防からの釣り方4種・仕掛け・時間帯",
    description:
      "ワインド・テンヤ・電気ウキ・引き釣りの使い分けとタナ攻略、安全対策を初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/tachiuo",
    siteName: "ツリスポ",
    images: [{
      url: `/api/og?title=${encodeURIComponent("タチウオ釣り完全ガイド")}&emoji=${encodeURIComponent("🗡️")}`,
      width: 1200,
      height: 630,
    }],
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/tachiuo",
  },
};

// SpeakableSpecification for GEO (Generative Engine Optimization)
const guideSpeakableJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "タチウオ釣り完全ガイド｜堤防からの釣り方4種・仕掛け・時間帯",
  url: "https://tsurispot.com/guide/tachiuo",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".page-description", ".guide-summary"],
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
      name: "タチウオ釣り完全ガイド",
      item: "https://tsurispot.com/guide/tachiuo",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "タチウオが堤防から釣れる時間帯はいつですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "夕マヅメ（日没前後）から21時頃までと、夜明け前の朝マヅメが二大チャンスです。タチウオは夜行性で、暗くなるとエサを求めて堤防の近くまで接岸します。特に日没直後の30分〜1時間に時合いが集中することが多く、この時間帯に合わせて釣行するのが釣果への近道です。",
      },
    },
    {
      "@type": "Question",
      name: "タチウオ釣り初心者はどの釣り方から始めるべきですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "電気ウキ釣りがおすすめです。ウキの動きでアタリが目に見えるため状況が分かりやすく、仕掛けを投げて待つだけなので特別なテクニックが不要です。ルアーで狙いたい場合は、しゃくるだけでワームが左右に動いてくれるワインド釣法から始めると釣果を得やすいです。",
      },
    },
    {
      "@type": "Question",
      name: "タチウオのタナ（泳層）はどうやって探せば良いですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "日没直後は底付近、暗くなるにつれて表層へ浮上するのが基本パターンです。ウキ釣りならタナ2〜3ヒロ（3〜4.5m）から始めて1ヒロずつ調整し、ルアーならカウントダウンで沈める秒数を変えて反応のあるレンジを探します。アタリが出た深さを覚えて、同じタナを集中して攻めるのが効率的です。",
      },
    },
    {
      "@type": "Question",
      name: "タチウオの「指3本」「指4本」とはどういう意味ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "タチウオの胴体の幅を指の本数で表すサイズの呼び方です。指3本（幅約5〜6cm）が堤防釣りのアベレージサイズで、指4本（約7〜8cm）を超えると良型、指5本クラスは「ドラゴン」と呼ばれる大物です。体長よりも胴の幅が太さ＝食べ応えの目安になるため、この呼び方が定着しています。",
      },
    },
    {
      "@type": "Question",
      name: "アタリはあるのに針に掛からない時はどうすれば良いですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "タチウオはエサの尻尾側から少しずつかじる習性があるため、早アワセは禁物です。ウキ釣りではウキが完全に沈んでラインが走り出すまで待ってからアワセます。ルアーの場合はアタリがあってもアクションを止めず、追い食いさせてロッドに重みが乗ってからアワセると掛かりやすくなります。",
      },
    },
    {
      "@type": "Question",
      name: "釣れたタチウオはどう扱えば安全ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "タチウオの歯はカミソリのように鋭く、素手で触ると深い切り傷を負う危険があります。釣れたら必ずフィッシュグリップで頭の後ろを掴んで固定し、プライヤーで針を外してください。地面に置いた状態でも噛みつくことがあるため、口元には絶対に指を近づけないようにしましょう。",
      },
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

function TachiuoTanaDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 320"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="タチウオのタナ攻略図：日没直後は底付近、夜が深まるにつれて表層へ浮上するレンジの変化"
        role="img"
      >
        <rect width="600" height="320" rx="12" fill="#EFF6FF" />
        <text x="300" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">タチウオのタナは時間で変わる</text>

        {/* 水面 */}
        <path d="M150,70 Q200,65 250,70 Q300,75 350,70 Q400,65 450,70 Q500,75 600,70" stroke="#60A5FA" strokeWidth="2" fill="none" />
        <text x="155" y="62" fontSize="10" fill="#3B82F6">水面</text>

        {/* 水域レイヤー */}
        <rect x="150" y="70" width="450" height="55" fill="#DBEAFE" opacity="0.3" />
        <rect x="150" y="125" width="450" height="65" fill="#93C5FD" opacity="0.25" />
        <rect x="150" y="190" width="450" height="70" fill="#60A5FA" opacity="0.2" />

        {/* 海底 */}
        <path d="M150,260 Q250,255 350,262 Q450,268 600,258 L600,320 L150,320 Z" fill="#FEF3C7" opacity="0.5" />
        <path d="M150,260 Q250,255 350,262 Q450,268 600,258" stroke="#D1A97A" strokeWidth="2" fill="none" />

        {/* 堤防 */}
        <rect x="0" y="55" width="160" height="265" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2" />
        <rect x="0" y="45" width="170" height="15" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1" />
        <text x="80" y="160" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#6B7280">堤防</text>

        {/* 釣り人 */}
        <g transform="translate(120,20)">
          <circle cx="0" cy="0" r="7" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="0" y1="7" x2="0" y2="25" stroke="#3B82F6" strokeWidth="2" />
          <line x1="0" y1="25" x2="-8" y2="37" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="0" y1="25" x2="8" y2="37" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="0" y1="12" x2="40" y2="-12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* 夕マヅメ：底付近 */}
        <g>
          <rect x="200" y="212" width="120" height="34" rx="6" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="260" y="226" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#D97706">日没直後</text>
          <text x="260" y="240" textAnchor="middle" fontSize="9" fill="#92400E">底付近からスタート</text>
          {/* タチウオ（細長い魚体） */}
          <g transform="translate(365,229)">
            <path d="M0,0 Q18,-4 36,-1 L46,-5 L42,0 L46,5 L36,1 Q18,4 0,0 Z" fill="#C0C7D1" stroke="#8B95A5" strokeWidth="1.2" />
            <circle cx="6" cy="-1" r="1.5" fill="#1F2937" />
          </g>
        </g>

        {/* 夜：中層 */}
        <g>
          <rect x="250" y="142" width="120" height="34" rx="6" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1.5" />
          <text x="310" y="156" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4F46E5">夜が深まると</text>
          <text x="310" y="170" textAnchor="middle" fontSize="9" fill="#3730A3">中層へ浮上</text>
          <g transform="translate(415,159)">
            <path d="M0,0 Q18,-4 36,-1 L46,-5 L42,0 L46,5 L36,1 Q18,4 0,0 Z" fill="#C0C7D1" stroke="#8B95A5" strokeWidth="1.2" />
            <circle cx="6" cy="-1" r="1.5" fill="#1F2937" />
          </g>
        </g>

        {/* 時合いピーク：表層近く */}
        <g>
          <rect x="300" y="82" width="130" height="34" rx="6" fill="#FFFFFF" stroke="#22C55E" strokeWidth="1.5" />
          <text x="365" y="96" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16A34A">時合いのピーク</text>
          <text x="365" y="110" textAnchor="middle" fontSize="9" fill="#166534">表層近くまで浮く</text>
          <g transform="translate(475,99)">
            <path d="M0,0 Q18,-4 36,-1 L46,-5 L42,0 L46,5 L36,1 Q18,4 0,0 Z" fill="#C0C7D1" stroke="#8B95A5" strokeWidth="1.2" />
            <circle cx="6" cy="-1" r="1.5" fill="#1F2937" />
          </g>
        </g>

        {/* 浮上矢印 */}
        <path d="M230,210 Q240,160 290,120 Q320,95 340,88" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,3" markerEnd="url(#arrowTanaUp)" />
        <text x="215" y="130" fontSize="9" fill="#EF4444" fontWeight="bold" transform="rotate(-50 215 130)">浮上していく</text>

        {/* 注釈 */}
        <text x="375" y="290" textAnchor="middle" fontSize="10" fill="#6B7280">底から1mずつタナを上げて、アタリの出る層を探すのが基本</text>
        <text x="375" y="305" textAnchor="middle" fontSize="10" fill="#6B7280">アタリが出たタナを覚えて集中的に攻める</text>

        <defs>
          <marker id="arrowTanaUp" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#EF4444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function WindActionDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 580 300"
        width="100%"
        style={{ maxWidth: 580 }}
        aria-label="ワインド釣法のアクション図：ロッドを小刻みにしゃくることでワームが左右にダートする動き"
        role="img"
      >
        <rect width="580" height="300" rx="12" fill="#EFF6FF" />
        <text x="290" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">ワインドのダートアクション</text>

        {/* 水面 */}
        <line x1="30" y1="60" x2="550" y2="60" stroke="#60A5FA" strokeWidth="2" />
        <text x="25" y="55" fontSize="10" fill="#3B82F6">水面</text>

        {/* ダート軌道：ジグザグ */}
        <path d="M70,200 L130,150 L190,190 L250,130 L310,175 L370,115 L430,160"
          stroke="#EF4444" strokeWidth="2.5" fill="none" markerEnd="url(#arrowDart)" />

        {/* ワーム（各ポイント） */}
        <g transform="translate(70,200) rotate(-35)">
          <path d="M0,0 L16,-3 L22,0 L16,3 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.2" />
        </g>
        <g transform="translate(130,150) rotate(30)">
          <path d="M0,0 L16,-3 L22,0 L16,3 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.2" />
        </g>
        <g transform="translate(190,190) rotate(-40)">
          <path d="M0,0 L16,-3 L22,0 L16,3 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.2" />
        </g>
        <g transform="translate(250,130) rotate(35)">
          <path d="M0,0 L16,-3 L22,0 L16,3 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.2" />
        </g>
        <g transform="translate(310,175) rotate(-40)">
          <path d="M0,0 L16,-3 L22,0 L16,3 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.2" />
        </g>
        <g transform="translate(370,115) rotate(30)">
          <path d="M0,0 L16,-3 L22,0 L16,3 Z" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1.2" />
        </g>

        {/* しゃくりの説明 */}
        <g transform="translate(100,235)">
          <text x="0" y="0" fontSize="10" fill="#EF4444" fontWeight="bold">シャクリ1回 = 左へダート</text>
        </g>
        <g transform="translate(300,235)">
          <text x="0" y="0" fontSize="10" fill="#EF4444" fontWeight="bold">シャクリ2回目 = 右へダート</text>
        </g>

        {/* タチウオ（下から狙う） */}
        <g transform="translate(430,215)">
          <path d="M0,0 Q20,-5 42,-1 L54,-6 L49,0 L54,6 L42,1 Q20,5 0,0 Z" fill="#C0C7D1" stroke="#8B95A5" strokeWidth="1.3" transform="rotate(-25)" />
          <circle cx="7" cy="-4" r="1.6" fill="#1F2937" />
          <text x="30" y="30" textAnchor="middle" fontSize="9" fill="#6B7280">下から食い上げてくる</text>
        </g>

        {/* 凡例 */}
        <g transform="translate(430,80)">
          <rect x="0" y="0" width="130" height="100" rx="8" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1" />
          <text x="65" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E3A5F">ポイント</text>
          <text x="65" y="38" textAnchor="middle" fontSize="9" fill="#374151">竿先を下げて</text>
          <text x="65" y="52" textAnchor="middle" fontSize="9" fill="#374151">小刻みに2〜3回しゃくる</text>
          <text x="65" y="70" textAnchor="middle" fontSize="9" fill="#6B7280">しゃくる度に</text>
          <text x="65" y="84" textAnchor="middle" fontSize="9" fill="#6B7280">左右交互にダートする</text>
        </g>

        <text x="290" y="275" textAnchor="middle" fontSize="10" fill="#6B7280">2〜3回しゃくったら止めてフォール。この「止め」の瞬間にアタリが集中する</text>

        <defs>
          <marker id="arrowDart" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0,0 8,3 0,6" fill="#EF4444" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function TenyaUkiRigDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 340"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="タチウオのエサ釣り仕掛け図：テンヤの引き釣り仕掛けと電気ウキ仕掛けの構成"
        role="img"
      >
        <rect width="600" height="340" rx="12" fill="#EFF6FF" />
        <text x="300" y="28" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">エサ釣り2大仕掛け</text>

        {/* 左：テンヤ仕掛け */}
        <g>
          <text x="150" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#D97706">テンヤ（引き釣り）</text>
          {/* 道糸 */}
          <line x1="150" y1="65" x2="150" y2="130" stroke="#6B7280" strokeWidth="1.5" />
          <text x="165" y="100" fontSize="9" fill="#6B7280">PE 0.8〜1号</text>
          {/* リーダー */}
          <line x1="150" y1="130" x2="150" y2="180" stroke="#9CA3AF" strokeWidth="2" />
          <text x="165" y="158" fontSize="9" fill="#6B7280">リーダー</text>
          {/* ケミホタル */}
          <rect x="145" y="185" width="10" height="22" rx="5" fill="#A3E635" stroke="#65A30D" strokeWidth="1" />
          <text x="165" y="200" fontSize="9" fill="#65A30D">ケミホタル</text>
          {/* テンヤ本体 */}
          <g transform="translate(150,235)">
            <path d="M-8,-12 L8,-12 L12,0 L8,4 L-8,4 L-12,0 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
            <path d="M8,4 Q18,10 14,18" stroke="#6B7280" strokeWidth="1.5" fill="none" />
            <path d="M14,18 L11,14 M14,18 L18,15" stroke="#6B7280" strokeWidth="1.5" />
          </g>
          <text x="185" y="238" fontSize="9" fill="#6B7280">テンヤ2〜3号</text>
          {/* キビナゴ */}
          <g transform="translate(150,270)">
            <path d="M-16,0 Q0,-5 16,0 Q0,5 -16,0 Z" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="1.2" />
            <circle cx="-11" cy="-1" r="1.2" fill="#1F2937" />
          </g>
          <text x="150" y="295" textAnchor="middle" fontSize="9" fill="#6B7280">キビナゴをワイヤーで固定</text>
          <text x="150" y="318" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="bold">ゆっくり一定速度で巻く</text>
        </g>

        {/* 中央仕切り */}
        <line x1="300" y1="45" x2="300" y2="325" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="4,4" />

        {/* 右：電気ウキ仕掛け */}
        <g>
          <text x="450" y="55" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#16A34A">電気ウキ釣り</text>
          {/* 道糸 */}
          <line x1="450" y1="65" x2="450" y2="95" stroke="#6B7280" strokeWidth="1.5" />
          {/* 電気ウキ */}
          <g transform="translate(450,115)">
            <ellipse cx="0" cy="0" rx="9" ry="18" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="0" cy="-22" r="5" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
          </g>
          <text x="470" y="112" fontSize="9" fill="#16A34A">電気ウキ2〜3号</text>
          <text x="470" y="124" fontSize="9" fill="#6B7280">（緑が見やすい）</text>
          {/* ウキ下 */}
          <line x1="450" y1="135" x2="450" y2="200" stroke="#6B7280" strokeWidth="1.5" />
          <text x="470" y="170" fontSize="9" fill="#6B7280">タナ2〜3ヒロから</text>
          {/* オモリ */}
          <path d="M446,205 L454,205 L452,218 L448,218 Z" fill="#6B7280" />
          {/* ワイヤーハリス */}
          <line x1="450" y1="218" x2="450" y2="250" stroke="#374151" strokeWidth="1.8" />
          <text x="470" y="238" fontSize="9" fill="#374151">ワイヤーハリス</text>
          <text x="470" y="250" fontSize="9" fill="#6B7280">（歯切れ対策）</text>
          {/* 針＋キビナゴ */}
          <g transform="translate(450,270)">
            <path d="M0,-15 Q6,-8 3,0 Q0,6 -5,3" stroke="#6B7280" strokeWidth="1.5" fill="none" />
            <path d="M-18,-4 Q-2,-9 14,-4 Q-2,1 -18,-4 Z" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="1.2" />
            <circle cx="-13" cy="-5" r="1.2" fill="#1F2937" />
          </g>
          <text x="450" y="295" textAnchor="middle" fontSize="9" fill="#6B7280">キビナゴの1匹掛け</text>
          <text x="450" y="318" textAnchor="middle" fontSize="10" fill="#374151" fontWeight="bold">ウキが消し込むまで待つ</text>
        </g>
      </svg>
    </div>
  );
}

export default function TachiuoGuidePage() {
  const tachiuoSpots = fishingSpots
    .filter((s) => s.catchableFish?.some((f) => f.fish.slug === "tachiuo"))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const tachiuoProducts = ["p35", "p36", "p28", "p29", "p34", "p38"]
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideSpeakableJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* パンくず */}
        <div className="mb-6">
          <Link prefetch={false}
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
            タチウオ釣り完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            堤防から狙える人気の夜のターゲット。4つの釣り方の使い分けとタナ攻略を解説します。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">タチウオ釣りとは：</span>
          銀色に輝く刀のような魚体のタチウオを、堤防から狙う釣りです。秋（9〜12月）に接岸のピークを迎え、ルアー（ワインド・ジグ）でもエサ（テンヤ・電気ウキ）でも釣れる懐の深さが魅力。夕マヅメから夜にかけての短時間で釣果が出るため、仕事帰りや週末の夜だけでも十分に楽しめます。
        </div>

        <div className="space-y-6">
          {/* タチウオの生態と時合い */}
          <SectionCard title="タチウオの生態と時合い" icon={Clock}>
            <p className="mb-4 text-sm text-muted-foreground">
              タチウオ釣りは「いつ竿を出すか」が釣果の大半を決めます。まずは行動パターンを理解しましょう。
            </p>

            <h3 className="mb-3 font-medium text-foreground">夜行性で、暗くなると接岸する</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              タチウオは日中は沖の深場に群れで潜み、日没とともにイワシやアジなどのベイト（小魚）を追って岸近くの浅場へ移動します。堤防から狙えるのはこの接岸のタイミング。立ち泳ぎしながら下から獲物を狙う独特の捕食スタイルのため、ルアーやエサは「上から見せる」意識が重要です。
            </p>

            <h3 className="mb-3 font-medium text-foreground">時合いは1日2回</h3>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">夕マヅメ〜夜（メイン）</span>
                  &nbsp;&mdash;&nbsp;日没前後30分〜1時間に時合いが集中。その後も21時頃までダラダラと食いが続くことが多い。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">朝マヅメ（第二のチャンス）</span>
                  &nbsp;&mdash;&nbsp;夜明け前の薄暗い時間帯。沖へ帰る前のタチウオが最後の捕食をするタイミングで、良型が出やすい。
                </span>
              </div>
            </div>

            <h3 className="mb-3 font-medium text-foreground">サイズは「指○本」で表す</h3>
            <div className="mb-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm font-bold text-foreground">指2〜3本</p>
                <p className="mt-1 text-xs text-muted-foreground">胴幅4〜6cm。初秋のアベレージ。数釣り向き</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm font-bold text-foreground">指4本</p>
                <p className="mt-1 text-xs text-muted-foreground">胴幅7〜8cm。晩秋に増える良型。食べ応え十分</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-sm font-bold text-foreground">指5本以上</p>
                <p className="mt-1 text-xs text-muted-foreground">通称「ドラゴン」。堤防から出れば自慢できる大物</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ※胴体の幅を指の本数に当てはめた呼び方。体長よりも太さがサイズの目安になります。
            </p>

            <Hint>
              潮がよく動く大潮・中潮の日没前後がもっとも期待値の高い組み合わせです。釣行前に潮見表で日没時刻と潮回りを確認しましょう。
            </Hint>
          </SectionCard>

          {/* 4つの釣り方比較 */}
          <SectionCard title="4つの釣り方と使い分け" icon={Target}>
            <p className="mb-4 text-sm text-muted-foreground">
              堤防のタチウオ釣りには大きく4つのスタイルがあります。まずは全体像を比較表で押さえましょう。
            </p>

            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-2 font-medium">釣り方</th>
                    <th className="p-2 font-medium">タイプ</th>
                    <th className="p-2 font-medium">難易度</th>
                    <th className="p-2 font-medium">向いている時間帯</th>
                    <th className="p-2 font-medium">特徴</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="p-2 font-medium text-foreground">ワインド</td>
                    <td className="p-2">ルアー</td>
                    <td className="p-2">★★☆</td>
                    <td className="p-2">夕マヅメ〜夜</td>
                    <td className="p-2">ダートで誘う攻めの釣り。活性が高い時合いに強い</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium text-foreground">テンヤ（引き釣り）</td>
                    <td className="p-2">エサ</td>
                    <td className="p-2">★★☆</td>
                    <td className="p-2">夜全般</td>
                    <td className="p-2">キビナゴを付けてただ巻き。渋い日でも食わせやすい</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium text-foreground">電気ウキ</td>
                    <td className="p-2">エサ</td>
                    <td className="p-2">★☆☆</td>
                    <td className="p-2">夜全般</td>
                    <td className="p-2">待ちの釣り。アタリが目に見え、初心者に最適</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium text-foreground">ジグの引き釣り</td>
                    <td className="p-2">ルアー</td>
                    <td className="p-2">★★☆</td>
                    <td className="p-2">朝マヅメ・薄明るい時間</td>
                    <td className="p-2">飛距離が出る。明るい時間帯の深いタナ攻略に強い</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">① ワインド釣法</h3>
                <p className="text-sm text-muted-foreground">
                  専用ジグヘッド（3/8〜5/8oz）に矢じり型のワームを刺し、竿先を小刻みにしゃくってワームを左右にダートさせる釣り方です。逃げ惑う小魚を演出でき、活性の高いタチウオに抜群の効果があります。カラーは夜光（グロー）が夜の定番。2〜3回しゃくって止め、フォールでアタリを待つのが基本リズムです。
                </p>
              </div>
              <WindActionDiagram />

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">② テンヤの引き釣り</h3>
                <p className="text-sm text-muted-foreground">
                  オモリと大針が一体になった「テンヤ」にキビナゴやドジョウをワイヤーで巻き付け、一定速度でゆっくり巻いてくる釣り方です。エサの匂いと波動で誘えるため、ルアーに反応しない低活性の日でも食わせやすいのが強み。アタリがあっても巻き続け、ロッドに重みが乗ってからアワセます。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">③ 電気ウキ釣り</h3>
                <p className="text-sm text-muted-foreground">
                  発光する電気ウキの下にワイヤーハリス＋キビナゴをセットし、タナを決めて流す待ちの釣りです。暗闇に浮かぶウキがピクピクと動き、スーッと消し込む瞬間は独特の緊張感があります。竿を置いて待てるので体力的にも楽で、ファミリーや初心者の夜釣りデビューに最適です。
                </p>
              </div>
              <TenyaUkiRigDiagram />

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">④ メタルジグの引き釣り</h3>
                <p className="text-sm text-muted-foreground">
                  20〜30gのメタルジグをキャストし、カウントダウンで沈めてからただ巻きやストップ&ゴーで誘う釣り方です。飛距離が出るため沖の群れに届き、まだ明るい時間帯や朝マヅメの深いタナ攻略に向いています。フォール中のアタリが多いので、ラインの変化に集中しましょう。
                </p>
              </div>
            </div>

            <Hint>
              迷ったら「時合いはワインド、渋くなったらテンヤか電気ウキ」の使い分けが定番です。ルアーとエサの両方を用意しておくと、その日のパターンに対応できます。
            </Hint>
          </SectionCard>

          <InArticleAd className="my-8" />

          {/* シーズン */}
          <SectionCard title="シーズンと地域差" icon={Calendar}>
            <p className="mb-4 text-sm text-muted-foreground">
              堤防からタチウオが狙えるのは、接岸が始まる初秋から初冬まで。月ごとの傾向を押さえましょう。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">9月 - シーズン開幕</h3>
                <p className="text-sm text-muted-foreground">
                  指2〜3本の小型中心ながら数が出やすい時期。群れが入れば短時間で連発します。まだ残暑があるため、夜釣りが快適に楽しめるのもこの時期の利点です。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">10〜11月 - ベストシーズン</h3>
                <p className="text-sm text-muted-foreground">
                  数・サイズともにピーク。指3〜4本が中心になり、接岸する群れの規模も大きくなります。人気の堤防は夕方前から場所が埋まるため、早めの到着が確実です。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">12月 - 大型狙いの終盤戦</h3>
                <p className="text-sm text-muted-foreground">
                  数は減るものの、居残った個体は指4本超の良型が中心。タナは深めになる傾向があり、じっくり探る釣りになります。防寒対策を万全にして臨みましょう。
                </p>
              </div>
            </div>

            <Warning>
              接岸時期には地域差があります。大阪湾や瀬戸内など内湾部は9月から本格化しやすい一方、地域によっては10月以降が本番になることも。釣具店やツリスポの釣果情報で直近の状況を確認してから釣行するのが確実です。
            </Warning>
          </SectionCard>

          {/* タックル選び */}
          <SectionCard title="タックル選び" icon={Settings}>
            <p className="mb-4 text-sm text-muted-foreground">
              ルアーとエサ釣りでタックルは異なりますが、シーバスタックルが1本あれば多くの釣り方を兼用できます。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ルアータックル（ワインド・ジグ）</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>ロッド：8.6〜9フィートのシーバスロッド（ML〜M）。ワインド専用ロッドならダートがつけやすい</li>
                  <li>リール：3000番前後のスピニングリール。ハイギアが糸ふけ回収に有利</li>
                  <li>ライン：PE0.8〜1号を150m以上</li>
                  <li>リーダー：フロロカーボン5〜8号（20〜30lb）を1m前後。歯対策に太めを選ぶ</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">エサ釣りタックル（テンヤ・電気ウキ）</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>竿：3号 4.5m前後の磯竿、または3m前後の万能竿</li>
                  <li>リール：3000番前後のスピニングリール。ナイロン3〜4号またはPE1号</li>
                  <li>ウキ：電気ウキ2〜3号。視認性の良い緑や赤を選ぶ</li>
                  <li>ハリス：ワイヤーハリスが安心。フロロ8号以上で代用する場合は歯切れを覚悟して予備を多めに</li>
                  <li>エサ：キビナゴが定番。冷凍で釣具店に売っており、1パックで一晩持つ</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">あると釣果と安全が変わる小物</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>フィッシュグリップ：歯対策の必須装備。素手での取り込みは厳禁</li>
                  <li>ケミホタル：仕掛けやワインドのジグヘッドに装着してアピール力を上げる</li>
                  <li>ヘッドライト：夜釣りの必需品。手元作業用に光量調整できるものが便利</li>
                  <li>スナップ：ルアー交換を素早く行えて時合いを逃さない</li>
                </ul>
              </div>
            </div>

            <Hint>
              最初の1本にはシーバスロッド＋3000番リールの組み合わせがおすすめ。ワインド・ジグ・テンヤの引き釣りまで1タックルでこなせます。
            </Hint>
          </SectionCard>

          {/* 堤防での立ち回り */}
          <SectionCard title="堤防での立ち回りとタナ攻略" icon={MapPin}>
            <p className="mb-4 text-sm text-muted-foreground">
              タチウオ釣りで最も重要なのが「タナ（泳層）の見極め」。時間帯によって泳ぐ深さが変わるためです。
            </p>

            <TachiuoTanaDiagram />

            <h3 className="mb-3 font-medium text-foreground">タナの刻み方（手順）</h3>
            <ol className="mb-6 list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">まず底付近から探る</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    日没直後のタチウオは底付近にいることが多いため、ルアーなら着底までカウントし、ウキ釣りならタナ3ヒロ（約4.5m）程度からスタートします。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">反応がなければ1mずつ上げる</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    5〜10投して反応がなければ、カウントの秒数を減らす（ウキ下を1ヒロ縮める）ことでタナを1段浅くします。これを繰り返して魚のいる層を見つけます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">アタリが出たタナを覚える</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    アタリが出たらそのカウント・ウキ下を記憶して同じタナを攻め続けます。群れが回っている間は同じ層で連続ヒットが期待できます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">アタリが止まったら再度探り直す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    時間の経過とともにタチウオのタナは浮いたり沈んだりします。アタリが遠のいたら、そのタナに固執せず上下の層を探り直しましょう。
                  </p>
                </div>
              </li>
            </ol>

            <h3 className="mb-3 font-medium text-foreground">ポイント選びの目安</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">潮通しの良い堤防の先端・外向き</span>
                  &nbsp;&mdash;&nbsp;タチウオの回遊コースに最も近く、群れの通過数が多い一級ポイント。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">常夜灯周りの明暗</span>
                  &nbsp;&mdash;&nbsp;光に集まるベイトを狙ってタチウオも寄る。明かりの境目を通すのがセオリー。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">水深のある岸壁・埠頭</span>
                  &nbsp;&mdash;&nbsp;足元から水深5m以上ある場所は、接岸したタチウオが足元近くまで入ってくる。
                </span>
              </div>
            </div>

            <Hint>
              周りで釣れている人のタナと釣り方を観察するのが最短ルート。ウキ釣りの人のウキ下、ルアーの人のカウント数は貴重な情報源です（声をかける時はマナーを忘れずに）。
            </Hint>
          </SectionCard>

          {/* 安全対策 */}
          <SectionCard title="安全上の注意（歯・夜釣り対策）" icon={ShieldAlert}>
            <p className="mb-4 text-sm text-muted-foreground">
              タチウオ釣りには「鋭い歯」と「夜釣り」という2つのリスクがあります。対策を徹底しましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">フィッシュグリップで掴む</span>
                  &nbsp;&mdash;&nbsp;釣れたら必ずグリップで頭の後ろを固定し、プライヤーで針を外します。素手での取り扱いは厳禁です。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">地面に置いても油断しない</span>
                  &nbsp;&mdash;&nbsp;タチウオは陸に上げた後も体を反らせて噛みついてきます。口元に指や足を近づけないでください。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ヘッドライト＋予備電池</span>
                  &nbsp;&mdash;&nbsp;夜の堤防で明かりを失うと移動すら危険になります。予備の電池かモバイルバッテリーを必ず携行しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ライフジャケットを着用する</span>
                  &nbsp;&mdash;&nbsp;暗闇での落水は昼間の何倍も危険です。夜釣りでは必ず着用してください。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">混雑時のキャストに注意</span>
                  &nbsp;&mdash;&nbsp;シーズン中の人気堤防は隣との間隔が狭くなります。周囲を確認し、無理なキャストは控えましょう。
                </span>
              </div>
            </div>

            <Danger>
              タチウオの歯はカミソリのように鋭く、触れただけで深く切れます。釣り上げた直後の暴れている個体は特に危険。ラインを持ってぶら下げた状態で暴れた魚体が体に触れる事故もあるため、抜き上げたらまず地面に下ろし、落ち着いてグリップで確保してください。
            </Danger>
          </SectionCard>

          {/* FAQ */}
          <SectionCard title="よくある質問" icon={HelpCircle}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">Q. タチウオが堤防から釣れる時間帯はいつですか？</h3>
                <p className="text-sm text-muted-foreground">
                  夕マヅメ（日没前後）から21時頃までと、夜明け前の朝マヅメが二大チャンスです。特に日没直後の30分〜1時間に時合いが集中することが多いため、明るいうちに準備を済ませておきましょう。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">Q. 初心者はどの釣り方から始めるべきですか？</h3>
                <p className="text-sm text-muted-foreground">
                  電気ウキ釣りがおすすめです。アタリが目に見えて分かりやすく、投げて待つだけで成立します。ルアー派ならしゃくるだけでダートしてくれるワインドから始めましょう。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">Q. タナ（泳層）はどうやって探せば良いですか？</h3>
                <p className="text-sm text-muted-foreground">
                  日没直後は底付近、暗くなるほど表層へ浮くのが基本です。底から1mずつタナを上げながら探り、アタリが出た層を集中的に攻めます。時間とともにタナは変化するので、アタリが止まったら探り直しましょう。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">Q. 「指3本」「指4本」とはどういう意味ですか？</h3>
                <p className="text-sm text-muted-foreground">
                  胴体の幅を指の本数で表すタチウオ特有のサイズ表現です。指3本が堤防のアベレージ、指4本以上が良型、指5本クラスは「ドラゴン」と呼ばれる大物です。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">Q. アタリはあるのに掛からない時は？</h3>
                <p className="text-sm text-muted-foreground">
                  タチウオはエサの後方から少しずつかじる習性があるため、早アワセが最大の原因です。ウキが完全に消し込んでラインが走るまで待つ、ルアーはアクションを止めず追い食いさせる、を意識すると掛かる確率が上がります。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">Q. 釣れたタチウオの安全な扱い方は？</h3>
                <p className="text-sm text-muted-foreground">
                  フィッシュグリップで頭の後ろを掴んで固定し、プライヤーで針を外します。歯には絶対に触れないこと。持ち帰りは氷締めにしてクーラーボックスへ。刺身・塩焼き・天ぷらと食味の良さも人気の理由です。
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <InArticleAd className="my-8" />

        {/* タチウオ釣りで狙える魚 */}
        <section className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Fish className="size-5 text-primary" />
                <h2 className="text-xl font-bold">夜の堤防で一緒に狙える魚</h2>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                タチウオ狙いの外道や、同じ時間帯・同じ堤防で狙えるターゲットです。
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { slug: "tachiuo", name: "タチウオ", badge: "本命" },
                  { slug: "aji", name: "アジ", badge: "常夜灯周り" },
                  { slug: "suzuki", name: "シーバス（スズキ）", badge: "夜のルアー" },
                  { slug: "saba", name: "サバ", badge: "回遊次第" },
                ].map((fish) => (
                  <Link prefetch={false}
                    key={fish.slug}
                    href={`/fish/${fish.slug}`}
                    className="group flex items-center gap-2 rounded-lg border p-3 transition-colors hover:border-primary"
                  >
                    <div className="size-8 shrink-0 overflow-hidden rounded-md bg-primary/10">
                      <Image src={`/images/fish/${fish.slug}.jpg`} alt={fish.name} width={32} height={32} className="size-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium group-hover:text-primary">{fish.name}</span>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">{fish.badge}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* タチウオにおすすめのスポット */}
        {tachiuoSpots.length > 0 && (
          <section className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="size-5 text-primary" />
                  <h2 className="text-xl font-bold">タチウオ釣りにおすすめのスポット</h2>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  タチウオの実績があるスポットを厳選。潮通しの良い堤防・埠頭がメインです。
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {tachiuoSpots.map((spot) => {
                    const spotTypeLabel = spot.spotType === "breakwater" ? "堤防" : spot.spotType === "rocky" ? "磯" : spot.spotType === "port" ? "漁港" : "釣り場";
                    return (
                    <Link prefetch={false}
                      key={spot.id}
                      href={`/spots/${spot.slug}`}
                      className="group flex items-center gap-2 rounded-lg border p-3 transition-colors hover:border-primary"
                      title={`${spot.name}（${spot.region.prefecture}のタチウオポイント）`}
                    >
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium group-hover:text-primary">{spot.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{spot.region.prefecture} {spot.region.areaName} - {spotTypeLabel}</p>
                      </div>
                    </Link>
                    );
                  })}
                </div>
                <div className="mt-3 text-center">
                  <Link prefetch={false} href="/spots" className="text-sm text-primary hover:underline">
                    全国の釣りスポットから探す →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* タチウオ釣りにおすすめの道具（アフィリエイト） */}
        <section className="mt-8 sm:mt-10">
          <ProductList
            products={tachiuoProducts}
            title="タチウオ釣りにおすすめの道具"
            description="ルアータックルの基本装備と夜釣りの必需品。タチウオ入門はこのあたりから揃えるのがおすすめです。"
            pageType="guide"
          />
        </section>

        {/* 関連ガイド */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link prefetch={false} href="/guide/night-fishing" className="text-primary hover:underline">
                    夜釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ヘッドライトなど夜釣りの装備と安全対策</span>
                </li>
                <li>
                  <Link prefetch={false} href="/guide/jigging" className="text-primary hover:underline">
                    ショアジギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - メタルジグの操作をさらに詳しく</span>
                </li>
                <li>
                  <Link prefetch={false} href="/guide/lure" className="text-primary hover:underline">
                    ルアー釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ルアーの種類とアクションの基本</span>
                </li>
                <li>
                  <Link prefetch={false} href="/guide/float-fishing" className="text-primary hover:underline">
                    ウキ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ウキ仕掛けの基本をおさらい</span>
                </li>
                <li>
                  <Link prefetch={false} href="/guide/tide" className="text-primary hover:underline">
                    潮汐の読み方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 時合いを左右する潮のタイミング</span>
                </li>
                <li>
                  <Link prefetch={false} href="/guide/fish-handling" className="text-primary hover:underline">
                    釣った魚の持ち帰り方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - タチウオを美味しく持ち帰る氷締めの方法</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            釣ったタチウオを美味しく持ち帰る方法も確認しましょう。
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link prefetch={false}
              href="/guide/fish-handling"
              className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              釣った魚の持ち帰り方ガイドへ
            </Link>
            <Link prefetch={false}
              href="/spots"
              className="inline-flex items-center rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              釣りスポットを探す
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
            <Link prefetch={false} href="/fish/tachiuo" className="text-primary hover:underline">タチウオ図鑑を見る</Link>
            <span className="text-muted-foreground">|</span>
            <Link prefetch={false} href="/catchable-now" className="text-primary hover:underline">今釣れる魚</Link>
            <span className="text-muted-foreground">|</span>
            <Link prefetch={false} href="/guide" className="text-primary hover:underline">釣り方ガイド一覧</Link>
          </div>
        </div>
      </main>
    </>
  );
}
