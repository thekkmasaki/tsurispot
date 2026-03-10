import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowDown,
  ExternalLink,
  ShoppingBag,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CollapsibleSection } from "@/components/ui/collapsible-section";

/* ================================================================
   メタデータ & 構造化データ
   ================================================================ */

export const metadata: Metadata = {
  title: "初心者のための仕掛け準備 完全ガイド｜道具の組み立てから実釣まで",
  description:
    "このページだけ見れば、釣り道具を買ってから実際に釣りを始めるまで全部わかります。竿の組み立て、リールの取り付け、糸の結び方（ユニノット・クリンチノット・電車結び）、仕掛けのセット、エサの付け方まで、SVGイラスト付きでステップバイステップ解説。",
  openGraph: {
    title: "初心者のための仕掛け準備 完全ガイド｜道具の組み立てから実釣まで",
    description:
      "竿の組み立てから糸の結び方、仕掛けのセット、エサ付けまで。このページだけで釣りの準備が全部わかる完全ガイド。",
    type: "article",
    url: "https://tsurispot.com/guide/beginner-setup",
    siteName: "ツリスポ",
    images: [{
      url: `/api/og?title=${encodeURIComponent("初心者のための仕掛け準備ガイド")}&emoji=${encodeURIComponent("🔧")}`,
      width: 1200,
      height: 630,
    }],
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/beginner-setup",
  },
};

// SpeakableSpecification for GEO (Generative Engine Optimization)
const guideSpeakableJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "初心者のための仕掛け準備 完全ガイド｜道具の組み立てから実釣まで",
  url: "https://tsurispot.com/guide/beginner-setup",
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
      name: "初心者のための仕掛け準備 完全ガイド",
      item: "https://tsurispot.com/guide/beginner-setup",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "初心者のための仕掛け準備 完全ガイド",
  description:
    "釣り道具を買ってから実際に釣りを始めるまでの全手順を、イラスト付きでステップバイステップ解説します。",
  totalTime: "PT60M",
  supply: [
    { "@type": "HowToSupply", name: "釣り竿（振り出し竿または2ピース竿）" },
    { "@type": "HowToSupply", name: "スピニングリール" },
    { "@type": "HowToSupply", name: "釣り糸（ナイロンライン2〜3号）" },
    { "@type": "HowToSupply", name: "仕掛け（サビキ・ちょい投げ・ウキ釣り用）" },
    { "@type": "HowToSupply", name: "エサ（アミエビ・青イソメ・オキアミ）" },
    { "@type": "HowToSupply", name: "スナップ・サルカン" },
  ],
  tool: [
    { "@type": "HowToTool", name: "ハサミ（ラインカッター）" },
    { "@type": "HowToTool", name: "バケツ" },
    { "@type": "HowToTool", name: "タオル" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "必要な道具を揃える",
      text: "竿、リール、仕掛け、エサ、ハサミ、バケツの6点を準備します。セット竿を購入した場合はSTEP3の糸の結び方から始められます。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "竿を組み立てる",
      text: "振り出し竿は先端から順にゆっくり引き出し、ガイドの向きを一直線に揃えます。2ピース竿は差し込み口を合わせて軽くねじりながら接続します。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "リールを取り付ける",
      text: "リールシートにリールの足を差し込み、ネジを締めて固定します。ベールを開いて糸をガイドに下から通します。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "糸の結び方を覚える（ユニノット）",
      text: "糸をリング（穴）に通し、端糸を折り返してループを作り、5回巻きつけてから締め込みます。締める前に唾で湿らせるのがコツです。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "糸の結び方を覚える（クリンチノット）",
      text: "糸をリングに通し、本線に5回巻きつけ、最初のループに端糸を通してゆっくり締めます。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "スナップに糸を結ぶ",
      text: "スナップの穴にユニノットまたはクリンチノットで糸を結びます。スナップを使うと仕掛けの交換が簡単になります。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "糸と糸を結ぶ（電車結び）",
      text: "2本の糸を10cm重ね、それぞれの端でユニノットを結んで両方の本線を引っ張って密着させます。",
      position: 7,
    },
    {
      "@type": "HowToStep",
      name: "仕掛けをセットする",
      text: "サビキ釣り・ちょい投げ・ウキ釣りなど、釣り方に合わせた仕掛けをスナップに接続します。",
      position: 8,
    },
    {
      "@type": "HowToStep",
      name: "エサを付ける",
      text: "青イソメは2〜3cmにカットして針先を少し出す。オキアミは尻尾を取って針に通す。アミエビはカゴに8分目まで詰めます。",
      position: 9,
    },
    {
      "@type": "HowToStep",
      name: "投入して実釣開始",
      text: "ベールを起こし人差し指でラインを押さえてキャスト。着水後にベールを戻し、糸ふけを取ってアタリを待ちます。",
      position: 10,
    },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "初心者のための仕掛け準備 完全ガイド｜道具の組み立てから実釣まで",
  description:
    "竿の組み立て、リールの取り付け、糸の結び方（ユニノット・クリンチノット・電車結び）、仕掛けのセット、エサの付け方までステップバイステップ解説。",
  datePublished: "2026-03-05",
  dateModified: "2026-03-05",
  author: {
    "@type": "Person",
    name: "正木 家康",
    jobTitle: "編集長",
    url: "https://tsurispot.com/about",
  },
  publisher: {
    "@type": "Organization",
    name: "ツリスポ",
    url: "https://tsurispot.com",
    logo: {
      "@type": "ImageObject",
      url: "https://tsurispot.com/logo.svg",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://tsurispot.com/guide/beginner-setup",
  },
};

/* ================================================================
   ユーティリティコンポーネント
   ================================================================ */

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
      <Lightbulb className="mt-0.5 size-5 shrink-0 text-amber-500" />
      <div>
        <span className="font-bold">ポイント：</span>
        {children}
      </div>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
      <div>
        <span className="font-bold">こうするとダメ：</span>
        {children}
      </div>
    </div>
  );
}

function StepHeader({
  step,
  title,
  id,
}: {
  step: number;
  title: string;
  id: string;
}) {
  return (
    <div id={id} className="mb-4 scroll-mt-20 flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-base font-bold text-white">
        {step}
      </span>
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
    </div>
  );
}

function SubStepHeader({ label, title }: { label: string; title: string }) {
  return (
    <h3 className="mb-3 mt-6 text-lg font-bold text-foreground">
      <span className="mr-2 inline-block rounded bg-sky-100 px-2 py-0.5 text-sm font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-200">
        {label}
      </span>
      {title}
    </h3>
  );
}

function AffiliateLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 hover:bg-orange-200 transition-colors dark:bg-orange-900 dark:text-orange-100"
    >
      <ShoppingBag className="size-3" />
      {label}
      <ExternalLink className="size-3" />
    </a>
  );
}

/* ================================================================
   進行バー
   ================================================================ */

const STEPS = [
  { num: 0, label: "事前準備", id: "step0" },
  { num: 1, label: "竿の組立", id: "step1" },
  { num: 2, label: "リール", id: "step2" },
  { num: 3, label: "糸の結び方", id: "step3" },
  { num: 4, label: "仕掛け", id: "step4" },
  { num: 5, label: "エサ", id: "step5" },
  { num: 6, label: "実釣", id: "step6" },
];

function ProgressBar() {
  return (
    <nav
      aria-label="ステップナビゲーション"
      className="sticky top-0 z-30 -mx-4 mb-8 overflow-x-auto border-b bg-background/95 backdrop-blur px-4 py-3 sm:mx-0 sm:rounded-lg sm:border sm:px-6"
    >
      <ol className="flex min-w-max items-center gap-1 sm:gap-2">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && (
              <ArrowDown className="size-3 shrink-0 rotate-[-90deg] text-gray-300" />
            )}
            <a
              href={`#${s.id}`}
              className="flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100 transition-colors dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900 whitespace-nowrap"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
                {s.num}
              </span>
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ================================================================
   SVGイラスト群
   ================================================================ */

function RodAssemblySvg() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        振り出し竿の伸ばし方
      </p>
      <svg
        viewBox="0 0 600 180"
        className="mx-auto w-full max-w-[600px]"
        aria-label="振り出し竿を先端から順にゆっくり引き出す手順図"
      >
        <rect x="0" y="0" width="600" height="180" rx="8" fill="#F0F9FF" />
        {/* 収納状態 */}
        <g>
          <rect x="20" y="15" width="170" height="60" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="105" y="32" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">収納状態</text>
          <rect x="40" y="45" width="130" height="12" rx="6" fill="#A3A3A3" />
          <text x="105" y="55" textAnchor="middle" fontSize="8" fill="#FFF">たたまれた状態</text>
        </g>
        {/* 矢印 */}
        <polygon points="200,45 215,38 215,52" fill="#F59E0B" />
        {/* 伸ばし中 */}
        <g>
          <rect x="225" y="15" width="170" height="60" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="310" y="32" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">先端から引き出す</text>
          <line x1="245" y1="52" x2="375" y2="52" stroke="#A3A3A3" strokeWidth="3" />
          <line x1="245" y1="52" x2="310" y2="45" stroke="#6B7280" strokeWidth="2" />
          <circle cx="310" cy="45" r="3" fill="#F59E0B" />
          <text x="310" y="38" textAnchor="middle" fontSize="8" fill="#F59E0B">ここを持つ</text>
        </g>
        {/* 矢印 */}
        <polygon points="405,45 420,38 420,52" fill="#F59E0B" />
        {/* 完成 */}
        <g>
          <rect x="430" y="15" width="155" height="60" rx="6" fill="#FFF" stroke="#22C55E" strokeWidth="1.5" />
          <text x="507" y="32" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16A34A">完成</text>
          <line x1="440" y1="52" x2="575" y2="42" stroke="#6B7280" strokeWidth="2" />
          {/* ガイド */}
          {[460, 490, 520, 550].map((x) => (
            <circle key={x} cx={x} cy={52 - (x - 440) * 0.074} r="3" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
          ))}
          <text x="507" y="68" textAnchor="middle" fontSize="8" fill="#3B82F6">ガイドが一直線</text>
        </g>
        {/* 注意書き */}
        <rect x="20" y="90" width="560" height="75" rx="6" fill="#FFFBEB" stroke="#FCD34D" strokeWidth="1" />
        <text x="30" y="110" fontSize="10" fontWeight="bold" fill="#92400E">伸ばし方のコツ</text>
        <text x="30" y="126" fontSize="9" fill="#78350F">1. 必ず先端（細い方）から順番に引き出す</text>
        <text x="30" y="140" fontSize="9" fill="#78350F">2. 各節をゆっくり回しながら引き出し、ガイドの向きを揃える</text>
        <text x="30" y="154" fontSize="9" fill="#78350F">3. 引き出しすぎて抜けないよう注意。少し固い位置で止める</text>
      </svg>
    </div>
  );
}

function ReelAttachSvg() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        リールの取り付け方
      </p>
      <svg
        viewBox="0 0 600 200"
        className="mx-auto w-full max-w-[600px]"
        aria-label="リールシートへのリール取り付けとベールの開閉、ガイドへの糸の通し方の図解"
      >
        <rect x="0" y="0" width="600" height="200" rx="8" fill="#F0F9FF" />
        {/* Step 1: リールシートにはめる */}
        <g>
          <rect x="10" y="10" width="180" height="180" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="100" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">1. リールシートにはめる</text>
          {/* 竿のグリップ部分 */}
          <rect x="30" y="80" width="140" height="16" rx="4" fill="#D4A373" />
          {/* リールシート */}
          <rect x="65" y="72" width="50" height="32" rx="3" fill="#9CA3AF" stroke="#6B7280" strokeWidth="1.5" />
          {/* リールの足 */}
          <rect x="75" y="96" width="30" height="8" rx="2" fill="#6B7280" />
          {/* リール本体 */}
          <ellipse cx="90" cy="130" rx="30" ry="22" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5" />
          <text x="90" y="134" textAnchor="middle" fontSize="8" fill="#6B7280">リール</text>
          {/* ネジ矢印 */}
          <path d="M120,80 L140,68" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <text x="142" y="66" fontSize="8" fill="#F59E0B">ネジを締める</text>
        </g>
        {/* Step 2: ベールを開く */}
        <g>
          <rect x="210" y="10" width="180" height="180" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="300" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">2. ベールを開く</text>
          {/* リール簡易図 */}
          <ellipse cx="300" cy="110" rx="40" ry="30" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5" />
          {/* ベール（閉じ） */}
          <path d="M265,95 Q300,75 335,95" stroke="#9CA3AF" strokeWidth="3" fill="none" strokeDasharray="4,3" />
          <text x="300" y="72" textAnchor="middle" fontSize="8" fill="#9CA3AF">閉じた状態</text>
          {/* ベール（開き） */}
          <path d="M265,95 Q260,110 265,125" stroke="#22C55E" strokeWidth="3" fill="none" />
          <text x="248" y="116" textAnchor="middle" fontSize="8" fill="#22C55E">開く</text>
          {/* 矢印 */}
          <path d="M290,88 C275,80 260,95 265,108" stroke="#F59E0B" strokeWidth="1.5" fill="none" markerEnd="url(#arrowBS)" />
          <defs>
            <marker id="arrowBS" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#F59E0B" />
            </marker>
          </defs>
          <text x="300" y="160" textAnchor="middle" fontSize="9" fill="#374151">U字の金属をパカッと起こす</text>
        </g>
        {/* Step 3: ガイドに糸を通す */}
        <g>
          <rect x="410" y="10" width="180" height="180" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="500" y="30" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">3. ガイドに糸を通す</text>
          {/* 竿 */}
          <line x1="430" y1="140" x2="580" y2="60" stroke="#6B7280" strokeWidth="2" />
          {/* ガイド3つ */}
          {[
            { x: 460, y: 122 },
            { x: 505, y: 96 },
            { x: 550, y: 70 },
          ].map((g, i) => (
            <g key={i}>
              <circle cx={g.x} cy={g.y} r="6" fill="none" stroke="#3B82F6" strokeWidth="2" />
              {/* 糸が下から通る矢印 */}
              <line x1={g.x} y1={g.y + 14} x2={g.x} y2={g.y - 10} stroke="#3B82F6" strokeWidth="1.5" />
              <polygon points={`${g.x - 3},${g.y - 8} ${g.x + 3},${g.y - 8} ${g.x},${g.y - 14}`} fill="#3B82F6" />
            </g>
          ))}
          <text x="500" y="160" textAnchor="middle" fontSize="9" fill="#3B82F6">下から上へ通す</text>
          <text x="500" y="174" textAnchor="middle" fontSize="8" fill="#EF4444">※1つでも飛ばすとNG</text>
        </g>
      </svg>
    </div>
  );
}

function UniKnotSvg() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        ユニノットの結び方（5ステップ）
      </p>
      <svg
        viewBox="0 0 760 220"
        className="mx-auto w-full max-w-[760px]"
        aria-label="ユニノットの結び方を5ステップで解説するイラスト"
      >
        <rect x="0" y="0" width="760" height="220" rx="8" fill="#F0F9FF" />
        {/* Step 1 */}
        <g>
          <rect x="8" y="8" width="140" height="200" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="78" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 1</text>
          <text x="78" y="40" textAnchor="middle" fontSize="9" fill="#374151">リングに糸を通す</text>
          <circle cx="40" cy="110" r="12" fill="none" stroke="#6B7280" strokeWidth="2.5" />
          <line x1="15" y1="110" x2="28" y2="110" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="52" y1="110" x2="135" y2="110" stroke="#0EA5E9" strokeWidth="2" />
          <text x="100" y="100" fontSize="8" fill="#6B7280">端糸15cm</text>
          <text x="20" y="135" fontSize="8" fill="#6B7280">本線</text>
        </g>
        {/* Step 2 */}
        <g>
          <rect x="158" y="8" width="140" height="200" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="228" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 2</text>
          <text x="228" y="40" textAnchor="middle" fontSize="9" fill="#374151">折り返してループ</text>
          <circle cx="178" cy="100" r="10" fill="none" stroke="#6B7280" strokeWidth="2" />
          <line x1="165" y1="100" x2="168" y2="100" stroke="#0EA5E9" strokeWidth="2" />
          <path d="M188,100 L278,100 L278,80 L220,80 L220,140 L278,140 L278,120 L248,120" stroke="#0EA5E9" strokeWidth="2" fill="none" />
          <text x="258" y="113" fontSize="8" fill="#EF4444">ループ</text>
        </g>
        {/* Step 3 */}
        <g>
          <rect x="308" y="8" width="140" height="200" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="378" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 3</text>
          <text x="378" y="40" textAnchor="middle" fontSize="9" fill="#374151">5回巻きつける</text>
          <line x1="320" y1="110" x2="435" y2="110" stroke="#0EA5E9" strokeWidth="2" />
          {[345, 358, 371, 384, 397].map((x) => (
            <ellipse key={x} cx={x} cy={110} rx="5" ry="13" fill="none" stroke="#F59E0B" strokeWidth="1.8" />
          ))}
          <text x="371" y="142" textAnchor="middle" fontSize="8" fill="#92400E">5回巻く</text>
          <path d="M420,95 L430,85" stroke="#F59E0B" strokeWidth="1.2" fill="none" markerEnd="url(#arrowUni)" />
          <defs>
            <marker id="arrowUni" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5" fill="#F59E0B" />
            </marker>
          </defs>
          <text x="430" y="82" fontSize="7" fill="#F59E0B">巻く方向</text>
        </g>
        {/* Step 4 */}
        <g>
          <rect x="458" y="8" width="140" height="200" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="528" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 4</text>
          <text x="528" y="40" textAnchor="middle" fontSize="9" fill="#374151">端糸を引いて締める</text>
          <line x1="475" y1="110" x2="585" y2="110" stroke="#0EA5E9" strokeWidth="2" />
          <rect x="510" y="100" width="22" height="20" rx="5" fill="#F59E0B" opacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
          <polygon points="575,110 565,105 565,115" fill="#22C55E" />
          <text x="565" y="130" fontSize="8" fill="#22C55E">端糸を引く</text>
          {/* 水滴 */}
          <path d="M505,75 Q508,68 511,75 Q511,80 505,80 Q499,80 505,75" fill="#60A5FA" opacity="0.5" />
          <text x="508" y="90" textAnchor="middle" fontSize="7" fill="#3B82F6">湿らせる</text>
        </g>
        {/* Step 5 */}
        <g>
          <rect x="608" y="8" width="145" height="200" rx="6" fill="#FFF" stroke="#22C55E" strokeWidth="1.5" />
          <text x="680" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16A34A">Step 5</text>
          <text x="680" y="40" textAnchor="middle" fontSize="9" fill="#374151">本線を引いて寄せる</text>
          <circle cx="635" cy="110" r="10" fill="none" stroke="#6B7280" strokeWidth="2" />
          <rect x="648" y="102" width="18" height="16" rx="4" fill="#F59E0B" opacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="618" y1="110" x2="625" y2="110" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="666" y1="110" x2="740" y2="110" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="666" y1="106" x2="680" y2="90" stroke="#0EA5E9" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x="682" y="88" fontSize="7" fill="#EF4444">カット</text>
          <polygon points="623,110 630,106 630,114" fill="#22C55E" />
          <polygon points="736,110 729,106 729,114" fill="#22C55E" />
          <text x="680" y="148" textAnchor="middle" fontSize="8" fill="#16A34A">結び目をリングに</text>
          <text x="680" y="160" textAnchor="middle" fontSize="8" fill="#16A34A">密着させて完成</text>
        </g>
      </svg>
    </div>
  );
}

function ClinchKnotSvg() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        クリンチノットの結び方（4ステップ）
      </p>
      <svg
        viewBox="0 0 640 200"
        className="mx-auto w-full max-w-[640px]"
        aria-label="クリンチノットの結び方を4ステップで解説するイラスト"
      >
        <rect x="0" y="0" width="640" height="200" rx="8" fill="#F0F9FF" />
        {/* Step 1 */}
        <g>
          <rect x="8" y="8" width="150" height="184" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="83" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 1</text>
          <text x="83" y="40" textAnchor="middle" fontSize="9" fill="#374151">リングに糸を通す</text>
          <rect x="40" y="92" width="16" height="26" rx="3" fill="none" stroke="#6B7280" strokeWidth="2" />
          <circle cx="48" cy="92" r="5" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <line x1="20" y1="105" x2="40" y2="105" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="56" y1="105" x2="145" y2="105" stroke="#0EA5E9" strokeWidth="2" />
          <text x="48" y="134" textAnchor="middle" fontSize="8" fill="#6B7280">サルカン</text>
        </g>
        {/* Step 2 */}
        <g>
          <rect x="168" y="8" width="150" height="184" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="243" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 2</text>
          <text x="243" y="40" textAnchor="middle" fontSize="9" fill="#374151">本線に5回巻く</text>
          <line x1="180" y1="105" x2="305" y2="105" stroke="#0EA5E9" strokeWidth="2" />
          {[210, 223, 236, 249, 262].map((x) => (
            <ellipse key={x} cx={x} cy={105} rx="5" ry="12" fill="none" stroke="#F59E0B" strokeWidth="1.8" />
          ))}
          <circle cx="200" cy="105" r="4" fill="none" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="2,2" />
          <text x="200" y="130" textAnchor="middle" fontSize="7" fill="#EF4444">小さな輪</text>
        </g>
        {/* Step 3 */}
        <g>
          <rect x="328" y="8" width="150" height="184" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="403" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 3</text>
          <text x="403" y="40" textAnchor="middle" fontSize="9" fill="#374151">最初のループに通す</text>
          <line x1="340" y1="100" x2="465" y2="100" stroke="#0EA5E9" strokeWidth="2" />
          <circle cx="370" cy="100" r="7" fill="none" stroke="#EF4444" strokeWidth="1.5" />
          <path d="M450,100 C450,72 370,72 370,93" stroke="#F59E0B" strokeWidth="1.5" fill="none" markerEnd="url(#arrowCL)" />
          <defs>
            <marker id="arrowCL" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5" fill="#F59E0B" />
            </marker>
          </defs>
          <text x="420" y="72" fontSize="7" fill="#92400E">端糸を通す</text>
        </g>
        {/* Step 4 */}
        <g>
          <rect x="488" y="8" width="145" height="184" rx="6" fill="#FFF" stroke="#22C55E" strokeWidth="1.5" />
          <text x="560" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16A34A">Step 4</text>
          <text x="560" y="40" textAnchor="middle" fontSize="9" fill="#374151">湿らせて締める</text>
          <rect x="520" y="98" width="14" height="20" rx="3" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <rect x="536" y="100" width="18" height="14" rx="4" fill="#F59E0B" opacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="505" y1="108" x2="520" y2="108" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="554" y1="108" x2="625" y2="108" stroke="#0EA5E9" strokeWidth="2" />
          <path d="M560,72 Q564,63 568,72 Q568,78 560,78 Q552,78 560,72" fill="#60A5FA" opacity="0.5" />
          <text x="560" y="88" textAnchor="middle" fontSize="7" fill="#3B82F6">湿らせる</text>
          <polygon points="510,108 517,104 517,112" fill="#22C55E" />
          <polygon points="620,108 613,104 613,112" fill="#22C55E" />
        </g>
      </svg>
    </div>
  );
}

function SnapExplainSvg() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        スナップの構造と使い方
      </p>
      <svg
        viewBox="0 0 500 180"
        className="mx-auto w-full max-w-[500px]"
        aria-label="スナップの構造と開閉方法の解説図"
      >
        <rect x="0" y="0" width="500" height="180" rx="8" fill="#F0F9FF" />
        {/* 閉じた状態 */}
        <g>
          <rect x="10" y="10" width="150" height="160" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="85" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">閉じた状態</text>
          {/* スナップ本体 */}
          <ellipse cx="85" cy="80" rx="12" ry="24" fill="none" stroke="#6B7280" strokeWidth="2.5" />
          <line x1="85" y1="56" x2="85" y2="40" stroke="#6B7280" strokeWidth="2" />
          <circle cx="85" cy="38" r="5" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <text x="85" y="41" textAnchor="middle" fontSize="6" fill="#6B7280">穴</text>
          {/* ロック部分 */}
          <line x1="79" y1="104" x2="91" y2="104" stroke="#6B7280" strokeWidth="2.5" />
          <text x="85" y="125" textAnchor="middle" fontSize="8" fill="#6B7280">ロック</text>
          <text x="85" y="160" textAnchor="middle" fontSize="9" fill="#374151">上の穴に糸を結ぶ</text>
        </g>
        {/* 矢印 */}
        <polygon points="170,90 182,84 182,96" fill="#F59E0B" />
        {/* 開いた状態 */}
        <g>
          <rect x="190" y="10" width="150" height="160" rx="6" fill="#FFF" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="265" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400E">開いた状態</text>
          <ellipse cx="265" cy="80" rx="12" ry="24" fill="none" stroke="#6B7280" strokeWidth="2.5" />
          <line x1="265" y1="56" x2="265" y2="40" stroke="#6B7280" strokeWidth="2" />
          <circle cx="265" cy="38" r="5" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          {/* ロック解除 */}
          <line x1="253" y1="104" x2="265" y2="112" stroke="#6B7280" strokeWidth="2" />
          <path d="M260,108 L270,120" stroke="#F59E0B" strokeWidth="1.5" fill="none" markerEnd="url(#arrowSN)" />
          <defs>
            <marker id="arrowSN" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5" fill="#F59E0B" />
            </marker>
          </defs>
          <text x="265" y="140" textAnchor="middle" fontSize="8" fill="#F59E0B">先端を押して開く</text>
          <text x="265" y="160" textAnchor="middle" fontSize="9" fill="#374151">仕掛けを引っ掛ける</text>
        </g>
        {/* なぜスナップ？ */}
        <g>
          <rect x="350" y="10" width="140" height="160" rx="6" fill="#FFF" stroke="#22C55E" strokeWidth="1.5" />
          <text x="420" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16A34A">なぜスナップ？</text>
          <text x="360" y="52" fontSize="9" fill="#374151">仕掛けの交換が</text>
          <text x="360" y="66" fontSize="9" fontWeight="bold" fill="#16A34A">ワンタッチで簡単</text>
          <line x1="360" y1="78" x2="480" y2="78" stroke="#E5E7EB" strokeWidth="1" />
          <text x="360" y="96" fontSize="9" fill="#374151">糸を切らずに</text>
          <text x="360" y="110" fontSize="9" fill="#374151">仕掛けを変えられる</text>
          <line x1="360" y1="122" x2="480" y2="122" stroke="#E5E7EB" strokeWidth="1" />
          <text x="360" y="140" fontSize="9" fill="#374151">サビキ→ちょい投げ</text>
          <text x="360" y="154" fontSize="9" fill="#374151">の切り替えも楽々</text>
        </g>
      </svg>
    </div>
  );
}

function TrainKnotSvg() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        電車結びの手順（3ステップ）
      </p>
      <svg
        viewBox="0 0 660 200"
        className="mx-auto w-full max-w-[660px]"
        aria-label="電車結びの手順。2本の糸を重ねてそれぞれユニノットを結び、引っ張って密着させる"
      >
        <rect x="0" y="0" width="660" height="200" rx="8" fill="#F0F9FF" />
        {/* Step 1 */}
        <g>
          <rect x="8" y="8" width="200" height="184" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="108" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 1</text>
          <text x="108" y="40" textAnchor="middle" fontSize="9" fill="#374151">2本を10cm重ねる</text>
          <line x1="18" y1="95" x2="195" y2="95" stroke="#0EA5E9" strokeWidth="2.5" />
          <line x1="25" y1="110" x2="200" y2="110" stroke="#F59E0B" strokeWidth="2.5" />
          <text x="25" y="88" fontSize="8" fill="#0EA5E9">道糸</text>
          <text x="165" y="126" fontSize="8" fill="#F59E0B">ハリス</text>
          <rect x="55" y="85" width="110" height="35" rx="3" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="4,3" />
          <text x="110" y="140" textAnchor="middle" fontSize="8" fill="#EF4444">約10cmの重なり</text>
        </g>
        {/* Step 2 */}
        <g>
          <rect x="228" y="8" width="210" height="184" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="333" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">Step 2</text>
          <text x="333" y="40" textAnchor="middle" fontSize="9" fill="#374151">それぞれユニノットを結ぶ</text>
          <line x1="238" y1="100" x2="428" y2="100" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="238" y1="110" x2="428" y2="110" stroke="#F59E0B" strokeWidth="2" />
          {/* 左結び目 */}
          {[280, 292, 304].map((x) => (
            <ellipse key={x} cx={x} cy={105} rx="4" ry="10" fill="none" stroke="#0EA5E9" strokeWidth="1.5" />
          ))}
          <rect x="274" y="94" width="36" height="22" rx="3" fill="#0EA5E9" opacity="0.1" />
          <text x="292" y="83" textAnchor="middle" fontSize="7" fill="#0EA5E9">道糸で結ぶ</text>
          {/* 右結び目 */}
          {[370, 382, 394].map((x) => (
            <ellipse key={x} cx={x} cy={105} rx="4" ry="10" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
          ))}
          <rect x="364" y="94" width="36" height="22" rx="3" fill="#F59E0B" opacity="0.1" />
          <text x="382" y="83" textAnchor="middle" fontSize="7" fill="#F59E0B">ハリスで結ぶ</text>
          <text x="333" y="145" textAnchor="middle" fontSize="8" fill="#6B7280">離れた状態</text>
        </g>
        {/* Step 3 */}
        <g>
          <rect x="448" y="8" width="205" height="184" rx="6" fill="#FFF" stroke="#22C55E" strokeWidth="1.5" />
          <text x="550" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16A34A">Step 3</text>
          <text x="550" y="40" textAnchor="middle" fontSize="9" fill="#374151">引っ張って密着させる</text>
          <line x1="460" y1="103" x2="640" y2="103" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="460" y1="110" x2="640" y2="110" stroke="#F59E0B" strokeWidth="2" />
          <rect x="535" y="93" width="28" height="26" rx="6" fill="#22C55E" opacity="0.15" stroke="#22C55E" strokeWidth="1.5" />
          <text x="549" y="109" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#22C55E">密着</text>
          <polygon points="465,106 475,101 475,111" fill="#22C55E" />
          <polygon points="635,106 625,101 625,111" fill="#22C55E" />
          <text x="475" y="130" fontSize="8" fill="#22C55E">引く</text>
          <text x="618" y="130" fontSize="8" fill="#22C55E">引く</text>
          <line x1="535" y1="93" x2="525" y2="78" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="3,2" />
          <line x1="563" y1="93" x2="573" y2="78" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3,2" />
          <text x="549" y="72" textAnchor="middle" fontSize="7" fill="#EF4444">端糸カット</text>
        </g>
      </svg>
    </div>
  );
}

function BaitSvg() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        エサの付け方3パターン
      </p>
      <svg
        viewBox="0 0 600 200"
        className="mx-auto w-full max-w-[600px]"
        aria-label="青イソメ、オキアミ、アミエビの付け方を解説するイラスト"
      >
        <rect x="0" y="0" width="600" height="200" rx="8" fill="#F0F9FF" />
        {/* 青イソメ */}
        <g>
          <rect x="10" y="10" width="180" height="180" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="100" y="28" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E40AF">青イソメ</text>
          {/* 針 */}
          <path d="M80,80 Q72,100 82,100" fill="none" stroke="#EF4444" strokeWidth="2.5" />
          {/* イソメ */}
          <path d="M82,75 C95,80 110,90 120,100 C125,110 115,112 105,105" fill="none" stroke="#22C55E" strokeWidth="3" opacity="0.7" />
          <circle cx="82" cy="75" r="2" fill="#22C55E" />
          <text x="100" y="125" textAnchor="middle" fontSize="9" fill="#374151">2〜3cmにカット</text>
          <text x="100" y="140" textAnchor="middle" fontSize="9" fill="#EF4444">針先を少し出す</text>
          <path d="M82,100 L75,108" stroke="#EF4444" strokeWidth="1" />
          <text x="68" y="118" fontSize="7" fill="#EF4444">針先</text>
          <text x="100" y="170" textAnchor="middle" fontSize="8" fill="#6B7280">ちょい投げ・ウキ釣り</text>
        </g>
        {/* オキアミ */}
        <g>
          <rect x="210" y="10" width="180" height="180" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="300" y="28" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E40AF">オキアミ</text>
          {/* 針 */}
          <path d="M280,70 Q272,95 282,95" fill="none" stroke="#EF4444" strokeWidth="2.5" />
          {/* エビ形状 */}
          <ellipse cx="286" cy="75" rx="12" ry="8" fill="#F97316" opacity="0.6" />
          <line x1="298" y1="75" x2="306" y2="70" stroke="#F97316" strokeWidth="1" />
          <text x="300" y="115" textAnchor="middle" fontSize="9" fill="#374151">尻尾を取ってから</text>
          <text x="300" y="130" textAnchor="middle" fontSize="9" fill="#374151">尻尾側から針を通す</text>
          <text x="300" y="150" textAnchor="middle" fontSize="8" fill="#EF4444">背中に沿わせるイメージ</text>
          <text x="300" y="170" textAnchor="middle" fontSize="8" fill="#6B7280">ウキ釣り・フカセ釣り</text>
        </g>
        {/* アミエビ（コマセ） */}
        <g>
          <rect x="410" y="10" width="180" height="180" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="500" y="28" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E40AF">アミエビ（コマセ）</text>
          {/* カゴ */}
          <rect x="480" y="60" width="40" height="50" rx="4" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
          <text x="500" y="90" textAnchor="middle" fontSize="8" fill="#FFF">カゴ</text>
          {/* 8分目ライン */}
          <line x1="482" y1="72" x2="518" y2="72" stroke="#FFF" strokeWidth="1" strokeDasharray="2,2" />
          <text x="530" y="76" fontSize="7" fill="#16A34A">8分目</text>
          <text x="500" y="130" textAnchor="middle" fontSize="9" fill="#374151">カゴに8分目まで</text>
          <text x="500" y="145" textAnchor="middle" fontSize="9" fill="#374151">詰める（入れすぎNG）</text>
          <text x="500" y="170" textAnchor="middle" fontSize="8" fill="#6B7280">サビキ釣り</text>
        </g>
      </svg>
    </div>
  );
}

function CastingSvg() {
  return (
    <div className="my-6">
      <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
        投入の基本動作
      </p>
      <svg
        viewBox="0 0 640 180"
        className="mx-auto w-full max-w-[640px]"
        aria-label="ベールを起こし、指でラインを押さえて投げ、着水後にベールを戻す手順"
      >
        <rect x="0" y="0" width="640" height="180" rx="8" fill="#F0F9FF" />
        {/* Step 1 */}
        <g>
          <rect x="8" y="8" width="150" height="164" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="83" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">1. ベールを起こす</text>
          <ellipse cx="83" cy="80" rx="28" ry="20" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5" />
          <path d="M60,68 Q55,80 60,92" stroke="#22C55E" strokeWidth="3" fill="none" />
          <text x="83" y="120" textAnchor="middle" fontSize="8" fill="#374151">糸が出る状態にする</text>
        </g>
        {/* Step 2 */}
        <g>
          <rect x="168" y="8" width="150" height="164" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="243" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">2. 指で糸を押さえる</text>
          {/* 手とリール簡略 */}
          <rect x="225" y="55" width="36" height="50" rx="5" fill="#D4A373" opacity="0.5" />
          <line x1="243" y1="50" x2="243" y2="110" stroke="#0EA5E9" strokeWidth="2" />
          <circle cx="243" cy="70" r="4" fill="#F59E0B" />
          <text x="260" y="72" fontSize="7" fill="#F59E0B">人差し指</text>
          <text x="243" y="130" textAnchor="middle" fontSize="8" fill="#374151">人差し指でラインを</text>
          <text x="243" y="142" textAnchor="middle" fontSize="8" fill="#374151">しっかり押さえる</text>
        </g>
        {/* Step 3 */}
        <g>
          <rect x="328" y="8" width="150" height="164" rx="6" fill="#FFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="403" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1E40AF">3. 振って指を離す</text>
          {/* 竿の動き */}
          <line x1="380" y1="120" x2="380" y2="50" stroke="#6B7280" strokeWidth="2" />
          <path d="M380,50 Q400,35 420,50" stroke="#F59E0B" strokeWidth="1.5" fill="none" markerEnd="url(#arrowCA)" />
          <defs>
            <marker id="arrowCA" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,0 L5,2.5 L0,5" fill="#F59E0B" />
            </marker>
          </defs>
          <text x="403" y="130" textAnchor="middle" fontSize="8" fill="#374151">竿先が前に来たら</text>
          <text x="403" y="142" textAnchor="middle" fontSize="8" fill="#F59E0B">パッと指を離す</text>
        </g>
        {/* Step 4 */}
        <g>
          <rect x="488" y="8" width="145" height="164" rx="6" fill="#FFF" stroke="#22C55E" strokeWidth="1.5" />
          <text x="560" y="26" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#16A34A">4. ベールを戻す</text>
          <ellipse cx="560" cy="80" rx="28" ry="20" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5" />
          <path d="M535,68 Q560,48 585,68" stroke="#6B7280" strokeWidth="3" fill="none" />
          <text x="560" y="120" textAnchor="middle" fontSize="8" fill="#374151">着水したらベールを戻す</text>
          <text x="560" y="134" textAnchor="middle" fontSize="8" fill="#374151">ハンドルを回してもOK</text>
        </g>
      </svg>
    </div>
  );
}

/* ================================================================
   メインページコンポーネント
   ================================================================ */

export default function BeginnerSetupGuidePage() {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ガイド", href: "/guide" },
            { label: "仕掛け準備 完全ガイド" },
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

        {/* ========== ヘッダー ========== */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            初心者のための仕掛け準備
            <br className="sm:hidden" />
            完全ガイド
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            このページだけ見れば、道具を買ってから釣りを始めるまで全部わかります。
          </p>
        </div>

        {/* 概要ボックス */}
        <div className="mb-6 rounded-lg border-2 border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-800 dark:bg-sky-950">
          <p className="mb-2 font-bold text-sky-800 dark:text-sky-200">
            このページで学べること
          </p>
          <ul className="space-y-1 text-sky-900 dark:text-sky-100">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-500" />
              竿の組み立てとリールの取り付け
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-500" />
              糸の結び方 3種類（ユニノット・クリンチノット・電車結び）
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-500" />
              スナップ・サルカンへの接続方法
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-500" />
              釣り方別の仕掛けセット手順
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-500" />
              エサの付け方と投入〜実釣の流れ
            </li>
          </ul>
        </div>

        {/* セット竿ショートカット */}
        <div className="mb-8 rounded-lg bg-green-50 p-4 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
          <p className="font-bold">
            セット竿（竿・リール・糸が一体のもの）を買った方へ
          </p>
          <p className="mt-1">
            竿の組み立てとリールの取り付けは済んでいるので、
            <a href="#step3" className="font-bold text-green-700 underline hover:text-green-600 dark:text-green-300">
              STEP 3「糸の結び方」
            </a>
            から始めてOKです。
          </p>
        </div>

        {/* ========== 進行バー ========== */}
        <ProgressBar />

        {/* ======================================================
           STEP 0: 事前準備
           ====================================================== */}
        <section className="mb-12">
          <StepHeader step={0} title="事前準備 ー 最低限これだけ揃えよう" id="step0" />
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-sm text-muted-foreground">
                釣りに出かける前に、まず以下の6つのアイテムを揃えましょう。
                釣具店で「初心者セット」として売られているものでもOKです。
              </p>
              <ul className="space-y-2">
                {[
                  { name: "釣り竿", desc: "万能竿2〜3mが使いやすい" },
                  { name: "リール", desc: "スピニングリール2000〜3000番" },
                  { name: "仕掛け", desc: "サビキセットorちょい投げセット" },
                  { name: "エサ", desc: "アミエビ（サビキ用）or青イソメ" },
                  { name: "ハサミ", desc: "糸を切るために必須" },
                  { name: "バケツ", desc: "水汲み・手洗い用" },
                ].map((item) => (
                  <li key={item.name} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-sky-500" />
                    <div>
                      <span className="font-bold text-foreground">{item.name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {item.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <AffiliateLink
                  href="https://amzn.to/4s4i64m"
                  label="おすすめロッド（シマノ）"
                />
                <AffiliateLink
                  href="https://amzn.to/4atW7Om"
                  label="おすすめリール（シマノ）"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ======================================================
           STEP 1: 竿の組み立て
           ====================================================== */}
        <section className="mb-12">
          <StepHeader step={1} title="竿の組み立て" id="step1" />
          <Card>
            <CardContent className="pt-6">
              <SubStepHeader label="A" title="振り出し竿の伸ばし方" />
              <p className="mb-2 text-sm text-muted-foreground">
                振り出し竿は、伸縮式の竿です。細い先端のセクションから順番に引き出して組み立てます。
                いきなり全部引き出さず、1節ずつ丁寧に伸ばすのがポイントです。
              </p>
              <RodAssemblySvg />
              <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">先端のキャップを外す。</span>
                  竿先を保護するキャップが付いている場合は最初に外します。
                </li>
                <li>
                  <span className="font-medium text-foreground">一番細い先端部分を持ってゆっくり引き出す。</span>
                  引き出したら少しだけ回して固定します。
                </li>
                <li>
                  <span className="font-medium text-foreground">順番に2番目、3番目と引き出す。</span>
                  各節のガイド（糸を通す輪っか）が一直線に並ぶよう向きを揃えます。
                </li>
                <li>
                  <span className="font-medium text-foreground">全て伸ばしたら各節がしっかり固定されているか確認。</span>
                  グラグラする節は少し回して固定し直します。
                </li>
              </ol>

              <SubStepHeader label="B" title="2ピース竿のつなぎ方" />
              <p className="text-sm text-muted-foreground">
                2ピース竿は2本のパーツを差し込んで接続します。
                差し込み部分（フェルール）を合わせて、軽くねじりながらしっかり差し込みます。
                ガイドの向きが一直線に揃ったら完了です。
              </p>
              <Tip>
                ガイドの向きが少しでもズレていると、糸の出が悪くなり飛距離が落ちます。
                組み立て後に竿を持って目で見てガイドが一直線か確認しましょう。
              </Tip>
            </CardContent>
          </Card>
        </section>

        {/* ======================================================
           STEP 2: リールの取り付け
           ====================================================== */}
        <section className="mb-12">
          <StepHeader step={2} title="リールの取り付け" id="step2" />
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-sm text-muted-foreground">
                竿の持ち手付近にある「リールシート」にリールを固定します。
                リールの足（フットと呼ばれる金属部分）をリールシートに差し込み、
                ネジやスライドパーツでガタつかないよう締めるだけです。
              </p>
              <ReelAttachSvg />
              <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">リールの足をリールシートに差し込む。</span>
                  片方の足を固定し、もう片方をスライドさせてはめます。
                </li>
                <li>
                  <span className="font-medium text-foreground">ネジを締めて固定する。</span>
                  手でしっかり締めればOK。工具は不要です。
                </li>
                <li>
                  <span className="font-medium text-foreground">ベール（U字の針金）を起こす。</span>
                  ベールを起こすと糸が出る状態になります。
                </li>
                <li>
                  <span className="font-medium text-foreground">糸を全てのガイドに下から上に通す。</span>
                  リール側のガイドから竿先に向かって順番に。1つでも飛ばすと竿が折れる原因になります。
                </li>
                <li>
                  <span className="font-medium text-foreground">糸を通し終えたらベールを戻す。</span>
                  ベールを倒すと糸が固定されます。
                </li>
              </ol>
              <Warning>
                ガイドを1つでも飛ばして糸を通すと、負荷が1か所に集中して竿が折れる原因になります。
                通し終わったら必ず全部のガイドに通っているか目視で確認しましょう。
              </Warning>
            </CardContent>
          </Card>
        </section>

        {/* ======================================================
           STEP 3: 糸の結び方（最重要セクション）
           ====================================================== */}
        <section className="mb-12">
          <StepHeader step={3} title="糸の結び方（最重要！）" id="step3" />

          <div className="mb-6 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
            <p className="font-bold text-base">
              ここが釣りの最大の壁！でも3つ覚えれば大丈夫
            </p>
            <p className="mt-1">
              糸の結び方（ノット）は釣りで最も重要なスキルです。
              結びが甘いと大物がかかっても糸が外れてしまいます。
              以下の3つさえ覚えれば、ほとんどの釣りに対応できます。
              家で太い紐を使って練習してから釣り場に行くのがおすすめです。
            </p>
          </div>

          {/* 3-1: ユニノット */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <SubStepHeader label="3-1" title="ユニノット（万能結び）" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">用途：</span>
                針・スナップ・サルカンに糸を結ぶ最も基本の結び方。
                これ1つで大半の釣りに対応できます。迷ったらユニノットを使えばOK。
              </p>
              <UniKnotSvg />
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">糸をリング（穴）に通す。</span>
                  スナップやサルカンの穴に糸を通し、先端を15cmほど出します。
                </li>
                <li>
                  <span className="font-medium text-foreground">端糸を折り返してループを作る。</span>
                  通した糸（端糸）を折り返し、本線と一緒に指で輪を作ります。
                </li>
                <li>
                  <span className="font-medium text-foreground">ループの中に端糸を5回巻きつける。</span>
                  端糸をループの中に通しながら、本線に5回巻きつけます。
                </li>
                <li>
                  <span className="font-medium text-foreground">端糸を引っ張って結び目を締める。</span>
                  端糸をゆっくり引いて、巻きつけた部分を締めていきます。
                </li>
                <li>
                  <span className="font-medium text-foreground">本線を引いて結び目をリングに寄せる。</span>
                  本線を引っ張り、結び目をリングのすぐそばまでスライドさせて完成。余った端糸をカットします。
                </li>
              </ol>
              <Tip>
                締める前に糸を唾で湿らせましょう。摩擦熱で糸が弱くなるのを防げます。
                これは全てのノットに共通する大事なコツです。
              </Tip>
              <Warning>
                巻き数が3回以下だとすっぽ抜ける可能性があります。必ず5回は巻きましょう。
                また、一気にギュッと締めると結び目が崩れるので、ゆっくり締めてください。
              </Warning>
            </CardContent>
          </Card>

          {/* 3-2: クリンチノット */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <SubStepHeader label="3-2" title="クリンチノット（初心者向け簡単結び）" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">用途：</span>
                スナップやサルカンに糸を結ぶときに使います。
                ユニノットより手順が少なく覚えやすいので、初心者はまずこちらからトライするのもおすすめです。
              </p>
              <ClinchKnotSvg />
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">糸をリングに通す。</span>
                  サルカンやスナップの穴に糸を通し、先端を10〜15cm出します。
                </li>
                <li>
                  <span className="font-medium text-foreground">本線に端糸を5回巻きつける。</span>
                  端糸を本線にくるくると5回巻きつけます。
                </li>
                <li>
                  <span className="font-medium text-foreground">最初のループ（リング横の小さな輪）に端糸を通す。</span>
                  巻きつけ始めの位置にできた小さな輪に、端糸を通します。
                </li>
                <li>
                  <span className="font-medium text-foreground">湿らせてからゆっくり締める。</span>
                  糸を湿らせてから、本線と端糸の両方を持ってゆっくり引っ張って締めます。
                </li>
              </ol>
              <Tip>
                改良クリンチノットにするには、Step3で小さな輪に通した後にできる大きな輪にも端糸を通します。
                強度が上がるので余裕があればこちらを覚えましょう。
              </Tip>
            </CardContent>
          </Card>

          {/* 3-3: スナップの接続 */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <SubStepHeader label="3-3" title="糸とスナップの接続" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">スナップとは：</span>
                仕掛けを素早く交換するための小さな金具です。
                洗濯バサミのように開閉でき、仕掛けを引っ掛けるだけで接続できます。
                糸を切らなくても仕掛けを交換できるので、サビキからちょい投げへの切り替えも楽々です。
              </p>
              <SnapExplainSvg />
              <h4 className="mt-4 mb-2 font-medium text-foreground">スナップに糸を結ぶ手順</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>スナップの上部にある小さな輪（アイ）に糸を通す</li>
                <li>ユニノットまたはクリンチノットで結ぶ（上で覚えた通り）</li>
                <li>しっかり締めて余った端糸をカット</li>
                <li>スナップの先端を押して開き、仕掛けを引っ掛けて閉じる</li>
              </ol>
              <div className="mt-4">
                <AffiliateLink
                  href="https://amzn.to/4c9oMcU"
                  label="スナップ（まとめ買い）"
                />
              </div>
            </CardContent>
          </Card>

          {/* 3-4: サルカンとの接続 */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <SubStepHeader label="3-4" title="サルカンとの接続" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">サルカンとは：</span>
                道糸とハリスをつなぐ回転式の金具です。
                糸のヨレ（ねじれ）を吸収してくれるので、仕掛けが絡みにくくなります。
                上下に輪があるので、上に道糸、下にハリスを結びます。
              </p>
              <p className="text-sm text-muted-foreground">
                結び方はスナップと同じです。サルカンの穴にユニノットまたはクリンチノットで結べばOKです。
                「スナップ付きサルカン」を使えば、片方はスナップで素早く脱着、もう片方は糸を結ぶという使い方もできます。
              </p>
            </CardContent>
          </Card>

          {/* 3-5: 電車結び */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <SubStepHeader label="3-5" title="糸と糸の結び方（電車結び）" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">用途：</span>
                道糸（メインの太い糸）とハリス（針に近い細い糸）をつなぐときに使います。
                名前の由来は、2つの結び目が電車のように中央に寄っていくことから。
              </p>
              <TrainKnotSvg />
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">2本の糸を10cmほど重ねて並べる。</span>
                </li>
                <li>
                  <span className="font-medium text-foreground">片方の端糸でもう片方の糸を芯にしてユニノット（3〜5回巻き）を結ぶ。</span>
                  軽く締めておきます。
                </li>
                <li>
                  <span className="font-medium text-foreground">反対側も同じようにユニノットを結ぶ。</span>
                </li>
                <li>
                  <span className="font-medium text-foreground">両方の本線を左右に引っ張る。</span>
                  2つの結び目が中央に寄ってぴったりくっつくまで引きます。
                </li>
                <li>
                  <span className="font-medium text-foreground">糸を湿らせてしっかり締め、余った端糸をカット。</span>
                </li>
              </ol>
              <Tip>
                太さが違う糸をつなぐ場合、細い方の巻き数を1〜2回多くするとバランスよく締まります。
                不安なら結び目に瞬間接着剤を少量塗ると安心です。
              </Tip>
            </CardContent>
          </Card>

          {/* 結び方のまとめ */}
          <div className="rounded-lg bg-sky-50 p-4 text-sm dark:bg-sky-950">
            <p className="mb-2 font-bold text-sky-800 dark:text-sky-200">
              結び方のまとめ：どれを使えばいい？
            </p>
            <ul className="space-y-1 text-sky-900 dark:text-sky-100">
              <li>
                <span className="font-medium">スナップ・サルカンに結ぶ</span>
                → ユニノット or クリンチノット
              </li>
              <li>
                <span className="font-medium">針に結ぶ</span>
                → ユニノット
              </li>
              <li>
                <span className="font-medium">糸と糸をつなぐ</span>
                → 電車結び
              </li>
            </ul>
            <p className="mt-2 text-sky-700 dark:text-sky-300">
              まずはユニノット1つだけ覚えれば大丈夫。
              慣れてきたら他のノットも試してみましょう。
            </p>
            <p className="mt-2">
              <Link
                href="/guide/knots"
                className="font-medium text-sky-700 underline hover:text-sky-600 dark:text-sky-300"
              >
                結び方をもっと詳しく学ぶ →
              </Link>
            </p>
          </div>
        </section>

        {/* ======================================================
           STEP 4: 仕掛けのセット
           ====================================================== */}
        <section className="mb-12">
          <StepHeader step={4} title="仕掛けのセット" id="step4" />
          <p className="mb-4 text-sm text-muted-foreground">
            釣り方によって仕掛けが異なります。ここでは初心者に人気の3つの釣り方別に、
            仕掛けのセット手順を解説します。
          </p>

          {/* サビキ釣り */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <SubStepHeader label="A" title="サビキ釣りの仕掛けセット" />
              <p className="mb-3 text-sm text-muted-foreground">
                堤防から足元に落とすだけの最も簡単な釣り方。
                市販の「サビキ仕掛けセット」を使えば、袋から出してつなぐだけでOKです。
              </p>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">道糸の先にスナップを結ぶ。</span>
                  ユニノットかクリンチノットで。
                </li>
                <li>
                  <span className="font-medium text-foreground">スナップにサビキ仕掛けの上部の輪を接続。</span>
                  スナップを開いて仕掛けの輪を引っ掛けるだけ。
                </li>
                <li>
                  <span className="font-medium text-foreground">仕掛けの一番下にコマセカゴを取り付ける。</span>
                  「下カゴ式」が一般的。カゴにスナップが付いているタイプなら引っ掛けるだけ。
                </li>
                <li>
                  <span className="font-medium text-foreground">コマセカゴにアミエビを8分目まで詰める。</span>
                  入れすぎると撒き出しが悪くなります。
                </li>
              </ol>
              <Tip>
                サビキ仕掛けはよく絡まります。袋から出すときは仕掛けの上部を持って、
                下にぶら下げるようにゆっくり広げましょう。
              </Tip>
              <p className="mt-3">
                <Link
                  href="/guide/sabiki"
                  className="text-sm font-medium text-sky-700 underline hover:text-sky-600 dark:text-sky-300"
                >
                  サビキ釣り完全ガイドをもっと詳しく →
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* ちょい投げ */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <SubStepHeader label="B" title="ちょい投げの仕掛けセット" />
              <p className="mb-3 text-sm text-muted-foreground">
                軽く投げて海底の魚を狙う釣り方。
                接続順序は「道糸 → スナップ → 天秤オモリ → 仕掛け（ハリス＋針）」です。
              </p>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">道糸の先にスナップを結ぶ。</span>
                </li>
                <li>
                  <span className="font-medium text-foreground">スナップに天秤オモリを接続。</span>
                  L字型のテンビンにオモリが付いたタイプが絡みにくくおすすめ。
                </li>
                <li>
                  <span className="font-medium text-foreground">天秤のもう一方の先にちょい投げ仕掛けを接続。</span>
                  市販のちょい投げ仕掛け（針1〜2本付き）を結ぶか、スナップで接続。
                </li>
                <li>
                  <span className="font-medium text-foreground">針に青イソメを付ける。</span>
                  2〜3cmにカットし、針先を少し出します。
                </li>
              </ol>
              <div className="mt-3">
                <AffiliateLink
                  href="https://amzn.to/4cFGDbl"
                  label="おもりセット"
                />
              </div>
              <p className="mt-3">
                <Link
                  href="/guide/choinage"
                  className="text-sm font-medium text-sky-700 underline hover:text-sky-600 dark:text-sky-300"
                >
                  ちょい投げ完全ガイドをもっと詳しく →
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* ウキ釣り */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <SubStepHeader label="C" title="ウキ釣りの仕掛けセット" />
              <p className="mb-3 text-sm text-muted-foreground">
                ウキを使って魚のアタリを目で見る伝統的な釣り方。
                パーツが多いですが、上から順番に通していくだけです。
              </p>
              <div className="mb-4 rounded-lg border bg-gray-50 p-4 text-sm dark:bg-gray-900">
                <p className="mb-2 font-bold text-foreground">道糸に上から順番に通すパーツ</p>
                <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                  <li><span className="font-medium text-foreground">ウキ止め糸</span> ー タナ（深さ）を決める目印</li>
                  <li><span className="font-medium text-foreground">シモリ玉</span> ー ウキがウキ止めを通過するのを防ぐ</li>
                  <li><span className="font-medium text-foreground">ウキ</span> ー アタリを視覚的に伝える</li>
                  <li><span className="font-medium text-foreground">からまん棒</span> ー ウキが仕掛けに絡むのを防ぐ</li>
                  <li><span className="font-medium text-foreground">サルカン</span> ー 道糸とハリスの接続点（ヨレ防止）</li>
                  <li><span className="font-medium text-foreground">ハリス＋針</span> ー サルカンの下に結ぶ</li>
                </ol>
              </div>
              <Tip>
                ウキ止めの位置を上下にずらすことで、狙う深さ（タナ）を自由に調整できます。
                最初は1〜2mの浅いタナから始めて、釣れなかったら少しずつ深くしてみましょう。
              </Tip>
              <p className="mt-3">
                <Link
                  href="/guide/float-fishing"
                  className="text-sm font-medium text-sky-700 underline hover:text-sky-600 dark:text-sky-300"
                >
                  ウキ釣りガイドをもっと詳しく →
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ======================================================
           STEP 5: エサの付け方
           ====================================================== */}
        <section className="mb-12">
          <StepHeader step={5} title="エサの付け方" id="step5" />
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-sm text-muted-foreground">
                エサの付け方1つで釣果が大きく変わります。基本は「針先を少し出す」こと。
                針先が隠れていると、魚がかかりにくくなります。
              </p>
              <BaitSvg />

              <SubStepHeader label="A" title="青イソメ（ちょい投げ・ウキ釣り）" />
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>ハサミで2〜3cmにカットする（長すぎると食いが悪い）</li>
                <li>切り口から針を刺し、針に沿わせるように通す</li>
                <li>針先を1〜2mm出す（これが重要！）</li>
              </ol>
              <Tip>
                虫エサが苦手な方は「パワーイソメ」などの人工エサもあります。
                生エサほどの集魚力はありませんが、そこそこ釣れるので試してみてください。
              </Tip>

              <SubStepHeader label="B" title="オキアミ（ウキ釣り・フカセ釣り）" />
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>尻尾をちぎって取る</li>
                <li>尻尾があった穴から針を刺す</li>
                <li>背中に沿って針を通し、針先を背中から少し出す</li>
              </ol>

              <SubStepHeader label="C" title="アミエビ・コマセ（サビキ釣り）" />
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>コマセカゴの蓋を開ける</li>
                <li>アミエビをスプーンやヘラで8分目まで詰める</li>
                <li>蓋を閉じる（チューブタイプなら絞り出すだけ）</li>
              </ol>
              <Tip>
                チューブタイプのコマセ（マルキュー アミ姫など）は手が汚れにくくて便利です。
                フルーティーな香りで臭いも少なく、初心者や家族連れにおすすめ。
              </Tip>
            </CardContent>
          </Card>
        </section>

        {/* ======================================================
           STEP 6: 投入〜実釣
           ====================================================== */}
        <section className="mb-12">
          <StepHeader step={6} title="投入〜実釣の流れ" id="step6" />
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-sm text-muted-foreground">
                準備が整ったら、いよいよ海に仕掛けを投入します。
                サビキ釣りの場合は足元に落とすだけなので投げる必要はありません。
                ちょい投げやウキ釣りの場合は、以下の手順でキャスト（投入）します。
              </p>
              <CastingSvg />

              <SubStepHeader label="投げ方" title="キャストの基本手順" />
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">ベールを起こす。</span>
                  糸が自由に出る状態にします。
                </li>
                <li>
                  <span className="font-medium text-foreground">人差し指でラインをしっかり押さえる。</span>
                  リールのスプール（糸が巻かれている部分）に人差し指をかけます。
                </li>
                <li>
                  <span className="font-medium text-foreground">後ろに人がいないことを確認！</span>
                  振りかぶる前に必ず周囲の安全を確認してください。
                </li>
                <li>
                  <span className="font-medium text-foreground">竿を後ろに振りかぶり、前に振る。</span>
                  竿先が正面を向いたタイミングで指を離すと、仕掛けが前に飛びます。
                </li>
                <li>
                  <span className="font-medium text-foreground">着水したらベールを戻す。</span>
                  ハンドルを少し回せば自動でベールが戻ります。
                </li>
                <li>
                  <span className="font-medium text-foreground">糸ふけ（たるんだ糸）を巻き取る。</span>
                  ハンドルを数回回して糸をピンと張ります。
                </li>
              </ol>

              <SubStepHeader label="アタリ" title="魚がかかったサインと合わせ" />
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li><span className="font-medium text-foreground">竿先がプルプル震える</span>→ 魚がエサをつついている</li>
                <li><span className="font-medium text-foreground">竿先がグーッと引き込まれる</span>→ 魚がしっかり食いついた合図！竿を立てて合わせます</li>
                <li><span className="font-medium text-foreground">ウキが沈む（ウキ釣りの場合）</span>→ 合わせのタイミング</li>
                <li><span className="font-medium text-foreground">糸がフッと緩む</span>→ 魚がエサをくわえて手前に泳いでいる場合も</li>
              </ul>
              <Tip>
                初心者はアタリがあっても慌てずに。竿先がしっかり引き込まれてから竿を立てましょう。
                早合わせ（アタリが来た瞬間に合わせる）だとエサだけ取られることが多いです。
              </Tip>
              <Warning>
                投げるときは必ず後方確認を。釣り針は鋭利なので、人に当たると大けがにつながります。
                また、隣の釣り人との間隔は最低でも2m以上空けましょう。
              </Warning>
            </CardContent>
          </Card>
        </section>

        {/* ======================================================
           準備完了！
           ====================================================== */}
        <div className="mb-8 rounded-lg border-2 border-green-300 bg-green-50 p-6 text-center dark:border-green-700 dark:bg-green-950">
          <p className="text-2xl font-bold text-green-800 dark:text-green-200">
            準備完了！釣りに行こう！
          </p>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            ここまで読んだあなたは、もう釣りの基本準備はバッチリです。
            あとは実際に釣り場に行って試してみましょう。
            最初は上手くいかなくて当たり前。何度かやるうちに体が覚えます。
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/spots"
              className="inline-flex items-center rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors"
            >
              近くの釣りスポットを探す
            </Link>
            <Link
              href="/for-beginners"
              className="inline-flex items-center rounded-full border border-green-600 px-6 py-3 text-sm font-bold text-green-700 hover:bg-green-100 transition-colors dark:text-green-300 dark:hover:bg-green-900"
            >
              初心者向け総合ガイド
            </Link>
          </div>
        </div>

        {/* ======================================================
           関連ページリンク
           ====================================================== */}
        <div className="mt-8 sm:mt-12">
          <CollapsibleSection
            title="もっと詳しく学ぶ"
            icon={<BookOpen className="size-5" />}
            defaultOpen={false}
            previewText="6件の関連ガイド"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  href: "/guide/knots",
                  title: "糸の結び方ガイド",
                  desc: "ユニノット・クリンチノット・電車結びをさらに詳しく",
                },
                {
                  href: "/guide/rigs",
                  title: "仕掛け図解ガイド",
                  desc: "5つの基本仕掛けをイラスト付きで解説",
                },
                {
                  href: "/guide/sabiki",
                  title: "サビキ釣り完全ガイド",
                  desc: "準備から釣り方のコツまで徹底解説",
                },
                {
                  href: "/guide/choinage",
                  title: "ちょい投げ完全ガイド",
                  desc: "投げ方のコツとキス・カレイの狙い方",
                },
                {
                  href: "/guide/setup",
                  title: "竿とリールのセッティング",
                  desc: "リールの糸巻き方向の間違いと対処法も",
                },
                {
                  href: "/guide/beginner",
                  title: "釣り初心者完全ガイド",
                  desc: "釣りの魅力から道具選びまで総合案内",
                },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground">{link.title}</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {link.desc}
                  </span>
                </Link>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        {/* LINE登録バナー */}
        <div className="mt-8 sm:mt-12">
        </div>
      </main>
    </>
  );
}
