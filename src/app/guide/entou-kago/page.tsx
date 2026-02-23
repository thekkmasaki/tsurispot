import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import {
  ChevronLeft,
  Package,
  Footprints,
  Lightbulb,
  HelpCircle,
  Fish,
  Target,
  Play,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import type { YouTubeSearchLink } from "@/types";

const entouKagoVideos: YouTubeSearchLink[] = [
  {
    label: "遠投カゴ釣りのやり方",
    searchQuery: "遠投カゴ釣り やり方 初心者",
    description: "仕掛けの作り方から実釣まで初心者向けに完全解説",
  },
  {
    label: "遠投カゴ釣り 仕掛けの作り方",
    searchQuery: "遠投カゴ釣り 仕掛け 作り方",
    description: "天秤・カゴ・ウキの組み合わせを丁寧に解説",
  },
  {
    label: "ペンデュラムキャストのコツ",
    searchQuery: "遠投カゴ釣り ペンデュラムキャスト コツ",
    description: "遠投に欠かせない投げ方テクニック",
  },
  {
    label: "遠投カゴ釣りでマダイを狙う",
    searchQuery: "遠投カゴ釣り マダイ 堤防",
    description: "堤防からマダイを狙うカゴ釣りの実践動画",
  },
];

export const metadata: Metadata = {
  title: "遠投カゴ釣り完全ガイド - 仕掛けの作り方とコツ｜ツリスポ",
  description:
    "遠投カゴ釣りの仕掛け、道具、投げ方（ペンデュラムキャスト）、タナの取り方を完全解説。カゴへのサシエの入れ方（入れるタイプ・入れないタイプ）の違い、マダイ・グレ・イサキ・アジ・青物の釣り方、初心者向けのコツまで。",
  openGraph: {
    title: "遠投カゴ釣り完全ガイド - 仕掛けの作り方とコツ｜ツリスポ",
    description:
      "遠投カゴ釣りの仕掛け・投げ方・タナの取り方を完全解説。マダイやグレを堤防から狙おう。",
    type: "article",
    url: "https://tsurispot.com/guide/entou-kago",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/entou-kago",
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
      name: "遠投カゴ釣り完全ガイド",
      item: "https://tsurispot.com/guide/entou-kago",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "遠投カゴ釣りの仕掛けの作り方と釣り方",
  description:
    "遠投カゴ釣りの仕掛けの作り方、投げ方（ペンデュラムキャスト）、タナの取り方まで。マダイ・グレ・イサキ・アジ・青物を堤防から狙う手順を解説。",
  totalTime: "PT4H",
  supply: [
    { "@type": "HowToSupply", name: "コマセ（オキアミ）" },
    { "@type": "HowToSupply", name: "サシエ（オキアミ）" },
    { "@type": "HowToSupply", name: "遠投カゴ（ロケットカゴ等）" },
    { "@type": "HowToSupply", name: "遠投ウキ（10〜15号）" },
    { "@type": "HowToSupply", name: "天秤" },
    { "@type": "HowToSupply", name: "ハリス（フロロカーボン2〜3号）" },
    { "@type": "HowToSupply", name: "針（グレ針6〜8号）" },
  ],
  tool: [
    { "@type": "HowToTool", name: "遠投竿（磯竿4〜5号、4.5〜5.3m）" },
    { "@type": "HowToTool", name: "大型スピニングリール（4000〜5000番）" },
    { "@type": "HowToTool", name: "道糸（ナイロン4〜6号またはPE2〜3号）" },
    { "@type": "HowToTool", name: "バッカン（コマセ用）" },
    { "@type": "HowToTool", name: "タモ網" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "道糸にウキ止め糸とシモリ玉を通す",
      text: "道糸にウキ止め糸を結び、その下にシモリ玉を通します。ウキ止め糸の位置がタナ（狙う深さ）になるので、最初は3〜5mに設定しましょう。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "遠投ウキを通してからまん棒をセットする",
      text: "シモリ玉の下に遠投ウキを通し、その下にからまん棒（ゴム管付き）をセットします。からまん棒はウキがサルカンまで落ちるのを防ぎ、仕掛けの絡みを軽減します。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "サルカンを結び天秤とカゴを取り付ける",
      text: "道糸の先にサルカン（ヨリモドシ）を結びます。サルカンの下側に天秤を取り付け、天秤の先にカゴをセットします。天秤があることで仕掛けの絡みを防げます。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "ハリスと針を結ぶ",
      text: "天秤のもう一方の先にハリスを結びます。ハリスはフロロカーボン2〜3号、長さ1.5〜3m。ハリスの先にグレ針6〜8号を結びます。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "コマセとサシエをカゴに入れる",
      text: "カゴにコマセ（オキアミ）を7〜8分目まで詰め、ロケットカゴの場合はサシエ（付けエサのオキアミ）とハリスの先端30〜50cmもカゴ内に収納します。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "ペンデュラムキャストで投げる",
      text: "仕掛けを振り子のように後ろに振り、前方に振り出してロッドのしなりを使って遠投します。45度の角度でリリースし、着水直前にサミング（糸を指で軽く押さえる）して糸フケを抑えます。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "ウキを見てアタリを待つ",
      text: "着水後、ウキが立つのを確認します。ウキ止め糸まで仕掛けが沈んだらタナに到達した合図。ウキが沈んだり不自然に動いたらアタリです。ゆっくり竿を立てて合わせましょう。",
      position: 7,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "サシエをカゴに入れないタイプだとひっかかってしまうのか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい、遠投時の遠心力でハリスがカゴや道糸に絡む「エビり」が起きやすくなります。特に長いハリス（2m以上）だと顕著です。入れるタイプのカゴ（ロケットカゴ等）を使えば、サシエとハリスの先端部分をカゴ内に収納でき、絡みを大幅に防げます。初心者には入れるタイプを強くおすすめします。",
      },
    },
    {
      "@type": "Question",
      name: "入れるタイプならサシエとハリス全てを入れるのか？それともサシエだけ入れてハリスは垂らすだけ？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "サシエだけでなく、ハリスの先端30〜50cm程度もカゴ内に収納するのがコツです。ハリス全体を入れる必要はありません。サシエ付きの針とハリスの先端部分をカゴに入れ、残りのハリスはカゴの外に出します。着水後にカゴが開くとサシエとコマセが一緒に放出されるので、集魚効果も高まります。",
      },
    },
    {
      "@type": "Question",
      name: "遠投カゴ釣りのタナはどうやって決める？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "まずはウキ止め糸を竿2本分（約3〜5m）の位置にセットしてスタートします。アタリがなければウキ止め糸をずらしてタナを深くしたり浅くしたりして探ります。周りで釣れている人のタナを参考にするのも有効です。マダイは深め（5〜10m）、グレは浅め（2〜5m）が基本です。",
      },
    },
    {
      "@type": "Question",
      name: "風が強い日のカゴ釣りのコツは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "向かい風の場合は低い弾道で投げ、ウキの号数を上げて仕掛けの重量を増やします。横風の場合は風上に向かって斜めに投げ、糸フケが出ないようにこまめに糸を張ります。追い風なら飛距離が伸びるチャンスです。風が強すぎる日（風速8m以上）はウキが流されて釣りにならないので、風裏のポイントを選ぶか、別の釣り方に切り替えましょう。",
      },
    },
    {
      "@type": "Question",
      name: "おすすめの遠投カゴは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者にはサシエとハリスを収納できる「ロケットカゴ」タイプがおすすめです。着水時にカゴが自動で開いてコマセとサシエが同時に放出されるため、絡みトラブルが少なく、コマセとサシエが同じポイントに撒けて集魚効果も高くなります。号数はウキに合わせて10〜15号を選びましょう。慣れてきたら一発カゴやシャトルカゴなども試してみてください。",
      },
    },
  ],
};

/* ── ヘルパーコンポーネント ── */

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
      <span className="font-medium">重要：</span>
      {children}
    </div>
  );
}

/* ── SVG図解コンポーネント ── */

/** 図解1: 遠投カゴ釣り仕掛け全体図（縦型） */
function ShikakeSvg() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">
        遠投カゴ釣り 仕掛け全体図
      </h3>
      <svg
        viewBox="0 0 320 700"
        width="100%"
        className="mx-auto max-w-[320px]"
        aria-label="遠投カゴ釣りの仕掛け全体図：竿先から順にウキ止め糸、シモリ玉、遠投ウキ、からまん棒、サルカン、天秤、カゴ、ハリス、針＋サシエの配置"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="320" height="700" fill="#F9FAFB" rx="12" />

        {/* 竿先（ティップ） */}
        <line x1="160" y1="20" x2="160" y2="55" stroke="#78716C" strokeWidth="4" strokeLinecap="round" />
        <text x="200" y="30" fontSize="12" fill="#44403C" fontWeight="bold">竿先（ティップ）</text>

        {/* 道糸 */}
        <line x1="160" y1="55" x2="160" y2="640" stroke="#4B5563" strokeWidth="1.5" />
        <text x="200" y="78" fontSize="12" fill="#3B82F6" fontWeight="bold">道糸</text>
        <text x="200" y="93" fontSize="11" fill="#6B7280">ナイロン4-6号</text>
        <text x="200" y="107" fontSize="11" fill="#6B7280">またはPE2-3号</text>

        {/* ウキ止め糸 */}
        <rect x="150" y="130" width="20" height="6" rx="3" fill="#EF4444" />
        <line x1="170" y1="133" x2="200" y2="133" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
        <text x="205" y="137" fontSize="12" fill="#EF4444" fontWeight="bold">ウキ止め糸</text>
        <text x="205" y="151" fontSize="10" fill="#6B7280">タナの深さを決める</text>

        {/* シモリ玉 */}
        <circle cx="160" cy="175" r="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="166" y1="175" x2="200" y2="175" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
        <text x="205" y="179" fontSize="12" fill="#F59E0B" fontWeight="bold">シモリ玉</text>

        {/* 遠投ウキ（円錐型） */}
        <g>
          {/* ウキ本体 - 棒型 */}
          <ellipse cx="160" cy="230" rx="14" ry="28" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
          <line x1="160" y1="200" x2="160" y2="210" stroke="#EF4444" strokeWidth="2" />
          <circle cx="160" cy="198" r="3" fill="#EF4444" />
          <line x1="174" y1="230" x2="200" y2="230" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
          <text x="205" y="224" fontSize="12" fill="#3B82F6" fontWeight="bold">遠投ウキ</text>
          <text x="205" y="238" fontSize="10" fill="#6B7280">10〜15号</text>
        </g>

        {/* からまん棒 */}
        <rect x="155" y="280" width="10" height="14" rx="2" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
        <line x1="165" y1="287" x2="200" y2="287" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
        <text x="205" y="283" fontSize="12" fill="#22C55E" fontWeight="bold">からまん棒</text>
        <text x="205" y="297" fontSize="10" fill="#6B7280">絡み防止</text>

        {/* サルカン */}
        <g>
          <circle cx="160" cy="330" r="5" fill="none" stroke="#4B5563" strokeWidth="2" />
          <circle cx="160" cy="342" r="5" fill="none" stroke="#4B5563" strokeWidth="2" />
          <line x1="160" y1="335" x2="160" y2="337" stroke="#4B5563" strokeWidth="2" />
          <line x1="165" y1="336" x2="200" y2="336" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
          <text x="205" y="340" fontSize="12" fill="#4B5563" fontWeight="bold">サルカン</text>
        </g>

        {/* 天秤 */}
        <g>
          <line x1="160" y1="347" x2="160" y2="380" stroke="#78716C" strokeWidth="2" />
          <line x1="140" y1="380" x2="180" y2="380" stroke="#78716C" strokeWidth="2" />
          <line x1="140" y1="380" x2="130" y2="400" stroke="#78716C" strokeWidth="2" />
          <line x1="180" y1="380" x2="190" y2="400" stroke="#78716C" strokeWidth="2" />
          <line x1="185" y1="380" x2="200" y2="380" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
          <text x="205" y="378" fontSize="12" fill="#78716C" fontWeight="bold">天秤</text>
          <text x="205" y="392" fontSize="10" fill="#6B7280">絡み防止の要</text>
        </g>

        {/* カゴ */}
        <g>
          <rect x="117" y="405" width="26" height="38" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          {/* コマセを表す点々 */}
          <circle cx="125" cy="418" r="2" fill="#FCD34D" opacity="0.8" />
          <circle cx="132" cy="425" r="2" fill="#FCD34D" opacity="0.8" />
          <circle cx="128" cy="432" r="2" fill="#FCD34D" opacity="0.8" />
          <circle cx="136" cy="415" r="2" fill="#FCD34D" opacity="0.8" />
          <line x1="100" y1="424" x2="117" y2="424" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
          <text x="30" y="420" fontSize="12" fill="#F59E0B" fontWeight="bold">カゴ</text>
          <text x="22" y="434" fontSize="10" fill="#6B7280">コマセ入り</text>
        </g>

        {/* ハリス */}
        <g>
          <line x1="190" y1="400" x2="190" y2="620" stroke="#93C5FD" strokeWidth="1.5" />
          <line x1="195" y1="500" x2="220" y2="500" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
          <text x="225" y="496" fontSize="12" fill="#60A5FA" fontWeight="bold">ハリス</text>
          <text x="225" y="510" fontSize="10" fill="#6B7280">フロロ2-3号</text>
          <text x="225" y="524" fontSize="10" fill="#6B7280">1.5〜3m</text>
        </g>

        {/* 針 + サシエ */}
        <g>
          {/* 針 */}
          <path d="M190,620 L190,640 Q190,650 183,650 L180,650" fill="none" stroke="#4B5563" strokeWidth="1.5" />
          <circle cx="178" cy="650" r="2" fill="#4B5563" />
          {/* サシエ（オキアミ） */}
          <ellipse cx="172" cy="652" rx="8" ry="5" fill="#EC4899" opacity="0.7" stroke="#DB2777" strokeWidth="1" />
          <text x="120" y="656" fontSize="10" fill="#EC4899">サシエ</text>
          <text x="112" y="670" fontSize="10" fill="#6B7280">（オキアミ）</text>
          <line x1="200" y1="640" x2="220" y2="640" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="3,2" />
          <text x="225" y="636" fontSize="12" fill="#4B5563" fontWeight="bold">針</text>
          <text x="225" y="650" fontSize="10" fill="#6B7280">グレ針6-8号</text>
        </g>
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        仕掛けは上から順にセットし、ウキ止め糸の位置でタナ（深さ）を調整します
      </p>
    </div>
  );
}

/** 図解2: カゴへのサシエの入れ方（2パターン比較） */
function KagoComparisonSvg() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">
        カゴへのサシエの入れ方（2パターン比較）
      </h3>
      <svg
        viewBox="0 0 640 420"
        width="100%"
        className="mx-auto max-w-[640px]"
        aria-label="カゴへのサシエの入れ方の比較図。左が入れるタイプ（推奨・絡みにくい）、右が入れないタイプ（絡みやすい）"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="640" height="420" fill="#F9FAFB" rx="12" />

        {/* 中央の仕切り線 */}
        <line x1="320" y1="20" x2="320" y2="400" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="5,5" />
        <text x="320" y="415" fontSize="11" fill="#6B7280" textAnchor="middle">VS</text>

        {/* ===== 左: 入れるタイプ（推奨）===== */}
        <g>
          {/* タイトル */}
          <rect x="40" y="15" width="240" height="30" rx="6" fill="#22C55E" opacity="0.15" />
          <text x="160" y="36" fontSize="14" fill="#16A34A" textAnchor="middle" fontWeight="bold">入れるタイプ（推奨）</text>

          {/* 道糸 */}
          <line x1="160" y1="60" x2="160" y2="130" stroke="#4B5563" strokeWidth="1.5" />

          {/* 天秤 */}
          <line x1="145" y1="130" x2="175" y2="130" stroke="#78716C" strokeWidth="2" />
          <line x1="145" y1="130" x2="135" y2="150" stroke="#78716C" strokeWidth="2" />
          <line x1="175" y1="130" x2="185" y2="150" stroke="#78716C" strokeWidth="2" />

          {/* カゴ（開いた状態） */}
          <rect x="115" y="155" width="40" height="65" rx="5" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <text x="135" y="173" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">カゴ</text>

          {/* コマセ（カゴ内） */}
          {[180, 190, 200, 210].map((y, i) => (
            <circle key={`komase-l-${i}`} cx={125 + (i % 3) * 8} cy={y} r="2.5" fill="#FCD34D" opacity="0.7" />
          ))}

          {/* ハリス（カゴ外部分） */}
          <line x1="185" y1="150" x2="185" y2="210" stroke="#93C5FD" strokeWidth="1.5" />
          {/* ハリスがカゴ内に入る部分 */}
          <line x1="185" y1="210" x2="145" y2="210" stroke="#93C5FD" strokeWidth="1.5" />
          <line x1="145" y1="210" x2="135" y2="218" stroke="#93C5FD" strokeWidth="1.5" />

          {/* サシエ（カゴ内） */}
          <ellipse cx="132" cy="212" rx="6" ry="4" fill="#EC4899" opacity="0.7" stroke="#DB2777" strokeWidth="1" />

          {/* 残りのハリス（カゴ外に垂れる分） */}
          <line x1="185" y1="210" x2="185" y2="310" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4,3" />

          {/* 寸法表示 */}
          <line x1="210" y1="210" x2="210" y2="260" stroke="#6B7280" strokeWidth="1" />
          <line x1="206" y1="210" x2="214" y2="210" stroke="#6B7280" strokeWidth="1" />
          <line x1="206" y1="260" x2="214" y2="260" stroke="#6B7280" strokeWidth="1" />
          <text x="225" y="240" fontSize="10" fill="#6B7280">30-50cm</text>
          <text x="225" y="253" fontSize="10" fill="#6B7280">をカゴ内に</text>

          {/* マルマーク */}
          <circle cx="85" cy="280" r="18" fill="none" stroke="#22C55E" strokeWidth="3" />
          <text x="85" y="286" fontSize="16" fill="#22C55E" textAnchor="middle" fontWeight="bold">OK</text>

          {/* メリット説明 */}
          <text x="30" y="325" fontSize="12" fill="#16A34A" fontWeight="bold">メリット：</text>
          <text x="30" y="342" fontSize="11" fill="#4B5563">・ハリスが絡まない</text>
          <text x="30" y="358" fontSize="11" fill="#4B5563">・サシエとコマセが同時放出</text>
          <text x="30" y="374" fontSize="11" fill="#4B5563">・集魚効果が高い</text>
          <text x="30" y="390" fontSize="11" fill="#16A34A" fontWeight="bold">・初心者に断然おすすめ</text>
        </g>

        {/* ===== 右: 入れないタイプ ===== */}
        <g>
          {/* タイトル */}
          <rect x="360" y="15" width="240" height="30" rx="6" fill="#EF4444" opacity="0.1" />
          <text x="480" y="36" fontSize="14" fill="#EF4444" textAnchor="middle" fontWeight="bold">入れないタイプ</text>

          {/* 道糸 */}
          <line x1="480" y1="60" x2="480" y2="130" stroke="#4B5563" strokeWidth="1.5" />

          {/* 天秤 */}
          <line x1="465" y1="130" x2="495" y2="130" stroke="#78716C" strokeWidth="2" />
          <line x1="465" y1="130" x2="455" y2="150" stroke="#78716C" strokeWidth="2" />
          <line x1="495" y1="130" x2="505" y2="150" stroke="#78716C" strokeWidth="2" />

          {/* カゴ */}
          <rect x="435" y="155" width="40" height="55" rx="5" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <text x="455" y="175" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">カゴ</text>

          {/* コマセ（カゴ内） */}
          {[180, 190, 200].map((y, i) => (
            <circle key={`komase-r-${i}`} cx={445 + (i % 3) * 8} cy={y} r="2.5" fill="#FCD34D" opacity="0.7" />
          ))}

          {/* ハリス（全部外に出ている・絡んでいる様子） */}
          <path d="M505,150 Q520,180 500,210 Q485,230 510,260 Q520,280 490,310" fill="none" stroke="#93C5FD" strokeWidth="1.5" />

          {/* サシエ（外に出ている） */}
          <ellipse cx="490" cy="315" rx="6" ry="4" fill="#EC4899" opacity="0.7" stroke="#DB2777" strokeWidth="1" />

          {/* 絡みの表現（バツ印の近く） */}
          <path d="M505,190 Q515,195 510,205" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2,2" />
          <text x="520" y="200" fontSize="10" fill="#EF4444" fontWeight="bold">絡み</text>
          <text x="520" y="213" fontSize="10" fill="#EF4444">（エビり）</text>

          {/* バツマーク */}
          <circle cx="405" cy="280" r="18" fill="none" stroke="#EF4444" strokeWidth="3" />
          <line x1="393" y1="268" x2="417" y2="292" stroke="#EF4444" strokeWidth="3" />
          <line x1="417" y1="268" x2="393" y2="292" stroke="#EF4444" strokeWidth="3" />

          {/* デメリット説明 */}
          <text x="350" y="325" fontSize="12" fill="#EF4444" fontWeight="bold">デメリット：</text>
          <text x="350" y="342" fontSize="11" fill="#4B5563">・遠心力でサシエが外れやすい</text>
          <text x="350" y="358" fontSize="11" fill="#4B5563">・ハリスがカゴや道糸に絡む</text>
          <text x="350" y="374" fontSize="11" fill="#4B5563">・長いハリスほどトラブル多</text>
          <text x="350" y="390" fontSize="11" fill="#6B7280">対策：ハリス1-1.5mに短縮</text>
        </g>
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        初心者はサシエをカゴに入れるタイプ（ロケットカゴ等）を選びましょう
      </p>
    </div>
  );
}

/** 図解3: 投げ方（ペンデュラムキャスト） */
function PendulumCastSvg() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">
        ペンデュラムキャスト（振り子投法）
      </h3>
      <svg
        viewBox="0 0 700 320"
        width="100%"
        className="mx-auto max-w-[700px]"
        aria-label="ペンデュラムキャストの3段階の図解：仕掛けを後ろに振る、前方に振り出す、45度でリリース"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="700" height="320" fill="#F9FAFB" rx="12" />

        {/* ===== Step 1: 仕掛けを後ろに振る ===== */}
        <g>
          <rect x="15" y="12" width="200" height="26" rx="6" fill="#3B82F6" opacity="0.12" />
          <text x="115" y="30" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">1. 後ろに振る</text>

          {/* 地面 */}
          <line x1="20" y1="270" x2="220" y2="270" stroke="#9CA3AF" strokeWidth="1" />

          {/* 釣り人（簡易） */}
          <circle cx="120" cy="160" r="10" fill="#4B5563" />
          <line x1="120" y1="170" x2="120" y2="230" stroke="#4B5563" strokeWidth="2" />
          <line x1="120" y1="230" x2="105" y2="270" stroke="#4B5563" strokeWidth="2" />
          <line x1="120" y1="230" x2="135" y2="270" stroke="#4B5563" strokeWidth="2" />
          {/* 腕 */}
          <line x1="120" y1="185" x2="100" y2="200" stroke="#4B5563" strokeWidth="2" />
          <line x1="120" y1="185" x2="90" y2="160" stroke="#4B5563" strokeWidth="2" />

          {/* 竿（後ろに構え） */}
          <line x1="90" y1="160" x2="55" y2="90" stroke="#78716C" strokeWidth="3" />

          {/* 仕掛け（振り子の先） */}
          <line x1="55" y1="90" x2="40" y2="140" stroke="#4B5563" strokeWidth="1" />
          <circle cx="40" cy="145" r="5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />

          {/* 振り子の軌跡（点線弧） */}
          <path d="M40,145 Q30,200 55,250" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4,4" />
          {/* 矢印 */}
          <polygon points="50,245 60,250 53,255" fill="#3B82F6" />

          <text x="35" y="285" fontSize="11" fill="#6B7280" textAnchor="start">仕掛けを振り子のように</text>
          <text x="35" y="300" fontSize="11" fill="#6B7280" textAnchor="start">後ろに振る</text>
        </g>

        {/* 矢印（ステップ間） */}
        <line x1="225" y1="180" x2="245" y2="180" stroke="#9CA3AF" strokeWidth="2" />
        <polygon points="242,175 242,185 252,180" fill="#9CA3AF" />

        {/* ===== Step 2: 前方に振り出す ===== */}
        <g>
          <rect x="255" y="12" width="200" height="26" rx="6" fill="#3B82F6" opacity="0.12" />
          <text x="355" y="30" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">2. 前方に振り出す</text>

          {/* 地面 */}
          <line x1="260" y1="270" x2="460" y2="270" stroke="#9CA3AF" strokeWidth="1" />

          {/* 釣り人 */}
          <circle cx="340" cy="160" r="10" fill="#4B5563" />
          <line x1="340" y1="170" x2="340" y2="230" stroke="#4B5563" strokeWidth="2" />
          <line x1="340" y1="230" x2="325" y2="270" stroke="#4B5563" strokeWidth="2" />
          <line x1="340" y1="230" x2="355" y2="270" stroke="#4B5563" strokeWidth="2" />
          {/* 腕（振り上げ中） */}
          <line x1="340" y1="185" x2="360" y2="175" stroke="#4B5563" strokeWidth="2" />
          <line x1="340" y1="185" x2="370" y2="140" stroke="#4B5563" strokeWidth="2" />

          {/* 竿（前方へ） */}
          <line x1="370" y1="140" x2="420" y2="80" stroke="#78716C" strokeWidth="3" />

          {/* 仕掛け（前に来ている） */}
          <line x1="420" y1="80" x2="430" y2="120" stroke="#4B5563" strokeWidth="1" />
          <circle cx="430" cy="125" r="5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />

          {/* 動きの矢印 */}
          <path d="M290,200 Q340,80 420,75" fill="none" stroke="#EF4444" strokeWidth="2" />
          <polygon points="415,70 425,73 418,80" fill="#EF4444" />
          <text x="300" y="100" fontSize="11" fill="#EF4444" fontWeight="bold">ロッドのしなりを</text>
          <text x="300" y="115" fontSize="11" fill="#EF4444" fontWeight="bold">使って振り出す</text>

          <text x="275" y="285" fontSize="11" fill="#6B7280" textAnchor="start">仕掛けが前に来たら</text>
          <text x="275" y="300" fontSize="11" fill="#6B7280" textAnchor="start">竿を一気に振り上げる</text>
        </g>

        {/* 矢印（ステップ間） */}
        <line x1="465" y1="180" x2="485" y2="180" stroke="#9CA3AF" strokeWidth="2" />
        <polygon points="482,175 482,185 492,180" fill="#9CA3AF" />

        {/* ===== Step 3: 45度でリリース ===== */}
        <g>
          <rect x="490" y="12" width="200" height="26" rx="6" fill="#3B82F6" opacity="0.12" />
          <text x="590" y="30" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">3. 45度でリリース</text>

          {/* 地面 */}
          <line x1="500" y1="270" x2="695" y2="270" stroke="#9CA3AF" strokeWidth="1" />

          {/* 水面 */}
          <rect x="620" y="210" width="75" height="60" fill="#DBEAFE" rx="4" />
          <line x1="620" y1="210" x2="695" y2="210" stroke="#2563EB" strokeWidth="1" strokeDasharray="4,3" />
          <text x="658" y="225" fontSize="9" fill="#2563EB" textAnchor="middle">水面</text>

          {/* 釣り人 */}
          <circle cx="560" cy="160" r="10" fill="#4B5563" />
          <line x1="560" y1="170" x2="560" y2="230" stroke="#4B5563" strokeWidth="2" />
          <line x1="560" y1="230" x2="545" y2="270" stroke="#4B5563" strokeWidth="2" />
          <line x1="560" y1="230" x2="575" y2="270" stroke="#4B5563" strokeWidth="2" />
          {/* 腕（振り切り） */}
          <line x1="560" y1="185" x2="580" y2="170" stroke="#4B5563" strokeWidth="2" />
          <line x1="560" y1="185" x2="590" y2="140" stroke="#4B5563" strokeWidth="2" />

          {/* 竿（上方） */}
          <line x1="590" y1="140" x2="620" y2="80" stroke="#78716C" strokeWidth="3" />

          {/* 45度の角度表示 */}
          <path d="M580,270 L580,250" fill="none" stroke="#22C55E" strokeWidth="1" />
          <path d="M580,270 Q590,260 600,248" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x="598" y="267" fontSize="11" fill="#22C55E" fontWeight="bold">45°</text>

          {/* 飛んでいく仕掛けの軌跡 */}
          <path d="M620,80 Q650,50 680,100 Q690,140 665,210" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,3" />
          <polygon points="662,205 670,208 667,215" fill="#F59E0B" />

          {/* 着水点 */}
          <circle cx="665" cy="215" r="5" fill="#F59E0B" opacity="0.5" />
          <text x="648" y="245" fontSize="10" fill="#2563EB" textAnchor="middle">着水</text>

          <text x="505" y="285" fontSize="11" fill="#6B7280" textAnchor="start">45度の角度で指を離す</text>
          <text x="505" y="300" fontSize="11" fill="#6B7280" textAnchor="start">着水前にサミングで制御</text>
        </g>
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        振り子の動きを利用して仕掛けを遠くへ飛ばすペンデュラムキャスト。力むより、竿のしなりを活かすのがコツです
      </p>
    </div>
  );
}

export default function EntouKagoGuidePage() {
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
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ガイド", href: "/guide" },
            { label: "遠投カゴ釣りガイド" },
          ]}
        />
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
            遠投カゴ釣り完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            堤防から遠くのポイントを狙い、マダイやグレなどの大物を釣る。
            <br className="hidden sm:inline" />
            仕掛けの作り方、投げ方のコツ、カゴへのサシエの入れ方まで徹底解説します。
          </p>
        </div>

        {/* 遠投カゴ釣りとは */}
        <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">遠投カゴ釣りとは？</p>
          <p className="mt-1">
            遠投カゴ釣りは、コマセ（撒き餌）を入れたカゴとウキを遠くに投げ、沖合のポイントで魚を寄せて釣る方法です。堤防の足元では届かない沖のシモリ（岩礁）や潮目を直接狙えるのが最大の特徴。マダイ、グレ（メジナ）、イサキ、アジ、青物など、サイズも種類も豊富なターゲットを狙えます。サビキ釣りやウキフカセ釣りのステップアップとして人気があり、「堤防からマダイを釣りたい」「もっと大きな魚を狙いたい」という方に最適な釣り方です。遠投の爽快感と、ウキが沈む瞬間の興奮を楽しめます。
          </p>
        </div>

        <div className="space-y-6">
          {/* 必要な道具 */}
          <SectionCard title="必要な道具" icon={Package}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">遠投竿：</span>
                磯竿4〜5号、長さ4.5〜5.3m。遠投に適した硬さとしなりを持つ竿で、カゴの重さ（10〜15号）に耐えられるものを選びましょう。短すぎると飛距離が出ず、長すぎると取り回しが難しくなります。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">リール：</span>
                大型スピニングリール4000〜5000番。ナイロン4〜6号が200m以上巻けるもの。遠投ではライントラブルを減らすために、糸巻き量に余裕のあるリールを選ぶことが重要です。ドラグ性能が良いものを選ぶと大物とのやり取りも安心。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">道糸：</span>
                ナイロンライン4〜6号が基本。初心者はトラブルが少ないナイロンがおすすめ。PEライン2〜3号なら飛距離が伸びますが、ウキ止め糸が滑りやすいので慣れてから使いましょう。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">遠投カゴ：</span>
                10〜15号。サシエを中に入れられるロケットカゴタイプが初心者におすすめ。着水後に自動で開いてコマセとサシエを同時に放出します。号数はウキに合わせて選びましょう。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">遠投ウキ：</span>
                10〜15号の自立式遠投ウキ。羽根付きの棒ウキ型が視認性と飛距離に優れています。電気ウキを使えば夜釣りにも対応可能。号数はカゴの重さに合わせます。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">天秤：</span>
                L型天秤または半遊動天秤。仕掛けの絡み防止に欠かせないパーツです。天秤があることでハリスとカゴが離れ、絡みトラブルが大幅に減ります。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">ハリス：</span>
                フロロカーボン2〜3号、長さ1.5〜3m。フロロカーボンは水中で目立ちにくく、根ズレにも強いのでハリスに最適です。マダイ狙いなら3号、アジ・グレなら2号が目安。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">針：</span>
                グレ針6〜8号がオールマイティ。マダイ狙いならマダイ針8〜10号も用意しましょう。針先が鈍ったら迷わず交換するのが釣果アップのコツです。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">その他：</span>
                ウキ止め糸、シモリ玉、からまん棒、サルカン。小物ですが仕掛けに必須のパーツです。予備を多めに持っていきましょう。
              </li>
            </ul>
            <Hint>
              ウキとカゴの号数は必ず合わせましょう。例えば12号のカゴには12号のウキ。号数が合わないとウキが沈んだり、浮力が強すぎてアタリが分かりにくくなります。
            </Hint>
          </SectionCard>

          {/* 仕掛け全体図 */}
          <ShikakeSvg />

          {/* サシエとカゴの関係 */}
          <SectionCard title="サシエとカゴの関係（重要）" icon={Target}>
            <p className="mb-4 text-sm text-muted-foreground">
              遠投カゴ釣りで最も重要なポイントの一つが「サシエ（付けエサ）をどうやってカゴと一緒に投げるか」です。カゴのタイプによって大きく2つの方法があります。
            </p>

            <div className="space-y-4">
              {/* 入れるタイプ */}
              <div className="rounded-lg border-2 border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/30">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">カゴにサシエを入れるタイプ（ロケットカゴ等）</h3>
                  <Badge className="bg-green-600 text-xs text-white">推奨</Badge>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-green-600">&#9679;</span>
                    サシエ（オキアミ）とハリスの先端30〜50cm程度をカゴの中に収納します
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">&#9679;</span>
                    <strong className="text-foreground">ハリス全体を入れる必要はありません。</strong>サシエ付きの針とハリスの先端部分だけをカゴに入れ、残りのハリスはカゴの外に出します
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">&#9679;</span>
                    着水後、カゴが開いてサシエとコマセが同時に放出されます
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">&#9679;</span>
                    投げた時にハリスが絡まない（エビらない）のが最大のメリット
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600">&#9679;</span>
                    サシエとコマセが同じ場所に撒けるため、集魚効果が非常に高い
                  </li>
                </ul>
              </div>

              {/* 入れないタイプ */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">カゴにサシエを入れないタイプ</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-amber-500">&#9679;</span>
                    ハリスとサシエはカゴの外に出したまま投げます
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500">&#9679;</span>
                    投げる時の遠心力でサシエが針から外れたり、ハリスがカゴや道糸に絡む（「エビる」）リスクがあります
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-500">&#9679;</span>
                    対策：ハリスを短め（1〜1.5m）にする、投げ方を柔らかくする
                  </li>
                </ul>
                <Warning>
                  特にハリスが2m以上の場合、遠投時の絡みが頻発します。初心者は「入れるタイプ」のカゴ（ロケットカゴ）を選ぶのが断然おすすめです。
                </Warning>
              </div>
            </div>

            {/* 比較SVG図解 */}
            <KagoComparisonSvg />
          </SectionCard>

          {/* 仕掛けの作り方 */}
          <SectionCard title="仕掛けの作り方" icon={Footprints}>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    道糸にウキ止め糸とシモリ玉を通す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸にウキ止め糸を結びます。ウキ止め糸の位置がタナ（狙う深さ）になるので、最初は竿2本分（約3〜5m）に設定しましょう。ウキ止め糸の下にシモリ玉を通します。シモリ玉はウキがウキ止め糸をすり抜けるのを防ぐストッパーの役割です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    遠投ウキを通してからまん棒をセット
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    シモリ玉の下に遠投ウキを通します。ウキは中通しタイプを使用。ウキの下にからまん棒（ゴム管付きのストッパー）をセットします。からまん棒はウキがサルカンまで落ちるのを防ぎ、仕掛け回収時の絡みを軽減する重要なパーツです。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    サルカンを結び、天秤とカゴを取り付ける
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸の先にサルカン（ヨリモドシ）を結びます。サルカンの下側に天秤を取り付け、天秤の一方の先にカゴをセットします。天秤が仕掛けの絡み防止の要になります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ハリスと針を結ぶ
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    天秤のもう一方の先にハリス（フロロカーボン2〜3号）を結びます。長さは1.5〜3m。ハリスの先にグレ針6〜8号を結びます。結び方は内掛け結びか外掛け結びが定番です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    コマセとサシエをカゴにセット
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    カゴにコマセ（オキアミ）を7〜8分目まで詰めます。ロケットカゴの場合は、サシエ（付けエサのオキアミ）を針に刺し、サシエとハリスの先端30〜50cmをカゴ内に収納してからカゴを閉じます。これで仕掛けの完成です。
                  </p>
                </div>
              </li>
            </ol>
            <Hint>
              仕掛けを作る順番は「上から下へ」が基本。ウキ止め糸→シモリ玉→ウキ→からまん棒→サルカン→天秤→カゴ＆ハリスの順にセットしましょう。
            </Hint>
          </SectionCard>

          {/* 投げ方のコツ */}
          <SectionCard title="投げ方のコツ（ペンデュラムキャスト）" icon={Target}>
            <p className="mb-4 text-sm text-muted-foreground">
              遠投カゴ釣りでは、仕掛けが重く長いため、通常のオーバーヘッドキャストでは絡みやすく危険です。「ペンデュラムキャスト（振り子投法）」を覚えましょう。
            </p>

            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    仕掛けを振り子のように後ろに振る
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿先から仕掛けまでの垂らし（道糸の長さ）を1〜1.5mに調整します。仕掛けを体の前で軽く揺らし、振り子のように後方に振ります。無理に後ろに引かず、自然な振り子運動を利用するのがポイントです。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    前方に振り出す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    仕掛けが後方の最高点に達したタイミングで、竿を前方に一気に振り出します。腕の力だけで投げるのではなく、体の回転と竿のしなり（反発力）を最大限に活かすのがコツ。力むと飛距離が落ちるので、スムーズな動きを意識しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    45度の角度でリリース
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿が45度の角度に来たところで人差し指を離して糸を放出します。角度が低すぎると飛距離が出ず、高すぎると仕掛けが失速します。着水直前にスプールを軽く指で押さえる「サミング」をすると、糸フケが減って着水が安定します。
                  </p>
                </div>
              </li>
            </ol>

            <PendulumCastSvg />

            <Warning>
              投げる前に必ず周囲の安全を確認してください。仕掛けが重いので、人に当たると大ケガにつながります。後方や左右に人がいないことを確認してからキャストしましょう。
            </Warning>

            <Danger>
              PEラインを使用する場合、指を切る危険があります。必ずキャスティンググローブを使用するか、人差し指にフィンガーガードを装着してください。
            </Danger>
          </SectionCard>

          {/* タナの取り方 */}
          <SectionCard title="タナ（深さ）の取り方" icon={Lightbulb}>
            <p className="mb-4 text-sm text-muted-foreground">
              遠投カゴ釣りでは、ウキ止め糸の位置で「タナ」（仕掛けが沈む深さ）を決めます。魚種によって適切なタナが異なるので、状況に合わせて調整しましょう。
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">基本のタナ設定</span>
                  <br />
                  まずは竿2本分（約3〜5m）の位置にウキ止め糸をセットしてスタート。アタリがなければ1mずつ深くしたり浅くしたりして探ります。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">魚種別の目安タナ</span>
                  <br />
                  マダイ：5〜10m（底層寄り）。グレ（メジナ）：2〜5m（浅め）。イサキ：3〜7m。アジ：3〜8m（群れの層を探る）。青物：2〜5m（表中層）。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">タナの探り方</span>
                  <br />
                  周囲で釣れている人のタナを参考にするのが最も効率的です。それが分からない場合は、浅いタナから始めて徐々に深くしていきましょう。アタリが出たタナを見つけたら、そのタナを集中的に攻めます。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">タナの微調整</span>
                  <br />
                  ウキが完全に沈まず「モゾモゾ」と動く場合は、タナが合っていない可能性があります。50cm刻みで微調整してみましょう。時間帯や潮の流れでも適正タナは変わるので、こまめな調整が釣果に直結します。
                </div>
              </li>
            </ul>
            <Hint>
              朝マヅメ・夕マヅメは魚が浮きやすいのでタナを浅めに、日中は深めに設定するのが基本パターンです。
            </Hint>
          </SectionCard>

          {/* 釣れる魚 */}
          <SectionCard title="遠投カゴ釣りで釣れる魚" icon={Fish}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">マダイ</h3>
                  <Badge variant="secondary" className="text-xs">
                    カゴ釣りの王道ターゲット
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  堤防からマダイを狙える数少ない釣法が遠投カゴ釣りです。乗っ込み（産卵期）の春と、荒食いの秋がベストシーズン。30〜50cmクラスが堤防から狙え、時に70cmオーバーの大物も。タナは深め（5〜10m）に設定し、日の出・日没前後の薄暗い時間帯が最もチャンスです。
                </p>
                <Link
                  href="/fish/madai"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  マダイの詳細を見る
                </Link>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">グレ（メジナ）</h3>
                  <Badge variant="secondary" className="text-xs">
                    磯釣りの人気魚
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  磯釣りの代表的ターゲットですが、遠投カゴ釣りなら堤防から手軽に狙えます。秋〜冬が本番で、水温が下がると良型が接岸します。タナは浅め（2〜5m）で、コマセワークが釣果を左右します。引きが強く、やり取りも楽しい魚です。
                </p>
                <Link
                  href="/fish/mejina"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  グレ（メジナ）の詳細を見る
                </Link>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">イサキ</h3>
                  <Badge variant="secondary" className="text-xs">
                    夏の味覚
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  初夏〜夏がベストシーズン。群れで回遊するので、一度アタリが出ると連続ヒットが期待できます。タナは3〜7mが目安。夜釣りでの実績も高く、電気ウキを使った夜のカゴ釣りは夏の風物詩です。刺身や塩焼きが絶品の美味しい魚です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">アジ</h3>
                  <Badge variant="secondary" className="text-xs">
                    良型が狙える
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  サビキ釣りでは届かない沖の大型アジを狙えるのがカゴ釣りの強み。25cm以上の「尺アジ」や40cmクラスの「ギガアジ」を堤防から狙えます。朝夕のマヅメ時に回遊するので、タナを3〜8mで探りましょう。
                </p>
                <Link
                  href="/fish/aji"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  アジの詳細を見る
                </Link>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  青物（ブリ・カンパチ・ソウダガツオなど）も
                </p>
                <p className="mt-1">
                  コマセに寄ってきた青物がヒットすることもあります。ハマチ（ブリの若魚）やカンパチ、ソウダガツオなどが突然かかると強烈な引きが楽しめます。青物がかかる可能性がある場合はハリスを3号以上にしておくと安心です。タモ網も忘れずに。
                </p>
              </div>
            </div>
          </SectionCard>

          {/* よくある質問 */}
          <SectionCard title="よくある質問（FAQ）" icon={HelpCircle}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. サシエをカゴに入れないタイプだとひっかかってしまうのか？
                </h3>
                <p className="text-sm text-muted-foreground">
                  はい、遠投時の遠心力でハリスがカゴや道糸に絡む「エビり」が起きやすくなります。特に長いハリス（2m以上）だと顕著です。入れるタイプのカゴ（ロケットカゴ等）を使えば、サシエとハリスの先端部分をカゴ内に収納でき、絡みを大幅に防げます。初心者には入れるタイプを強くおすすめします。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. 入れるタイプならサシエとハリス全てを入れるのか？それともサシエだけ入れてハリスは垂らすだけ？
                </h3>
                <p className="text-sm text-muted-foreground">
                  サシエだけでなく、ハリスの先端30〜50cm程度もカゴ内に収納するのがコツです。ハリス全体を入れる必要はありません。サシエ付きの針とハリスの先端部分をカゴに入れ、残りのハリスはカゴの外に出します。着水後にカゴが開くとサシエとコマセが一緒に放出されるので、集魚効果も高まります。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. 遠投カゴ釣りのタナはどうやって決める？
                </h3>
                <p className="text-sm text-muted-foreground">
                  まずはウキ止め糸を竿2本分（約3〜5m）の位置にセットしてスタートします。アタリがなければウキ止め糸をずらしてタナを深くしたり浅くしたりして探ります。周りで釣れている人のタナを参考にするのも有効です。マダイは深め（5〜10m）、グレは浅め（2〜5m）が基本です。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. 風が強い日のカゴ釣りのコツは？
                </h3>
                <p className="text-sm text-muted-foreground">
                  向かい風の場合は低い弾道で投げ、ウキの号数を上げて仕掛けの重量を増やします。横風の場合は風上に向かって斜めに投げ、糸フケが出ないようにこまめに糸を張ります。追い風なら飛距離が伸びるチャンスです。風が強すぎる日（風速8m以上）はウキが流されて釣りにならないので、風裏のポイントを選ぶか別の釣り方に切り替えましょう。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. おすすめの遠投カゴは？
                </h3>
                <p className="text-sm text-muted-foreground">
                  初心者にはサシエとハリスを収納できる「ロケットカゴ」タイプがおすすめです。着水時にカゴが自動で開いてコマセとサシエが同時に放出されるため、絡みトラブルが少なく、コマセとサシエが同じポイントに撒けて集魚効果も高くなります。号数はウキに合わせて10〜15号を選びましょう。慣れてきたら一発カゴやシャトルカゴなども試してみてください。
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 参考動画 */}
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Play className="size-5 text-primary" />
            参考動画
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            遠投カゴ釣りの仕掛けの作り方や投げ方を動画で確認しましょう。
          </p>
          <YouTubeVideoList links={entouKagoVideos} />
        </section>

        {/* 関連ガイド */}
        <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-center text-xl font-bold">関連ガイド</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guide/float-fishing" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Target className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    ウキ釣り完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ウキ釣りの基本をマスターしよう
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/rigs" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Package className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    仕掛けの基本ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    釣りの仕掛けの種類と作り方
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/casting" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Target className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    キャスティングガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    投げ方の種類とコツを解説
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/sabiki" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Fish className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    サビキ釣り完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    初心者の定番、サビキ釣り入門
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            遠投カゴ釣りができるスポットを探してみよう
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
