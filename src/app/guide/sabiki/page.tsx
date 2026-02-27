import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Footprints,
  Lightbulb,
  HelpCircle,
  MapPin,
  Fish,
  Target,
  Anchor,
  Trash2,
  Play,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fishingSpots } from "@/lib/data/spots";
import { ProductList } from "@/components/affiliate/product-list";
import { getProductsByMethod } from "@/lib/data/products";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import type { YouTubeSearchLink } from "@/types";
import { RigDiagram } from "@/components/rig-diagram";

const sabikiVideos: YouTubeSearchLink[] = [
  {
    label: "サビキ釣りのやり方",
    searchQuery: "サビキ釣り やり方 初心者 堤防",
    description: "準備から実釣まで初心者向けに完全解説",
  },
  {
    label: "サビキ仕掛けのセット方法",
    searchQuery: "サビキ仕掛け セット方法 初心者",
    description: "仕掛けの取り付け方とカゴの使い方",
  },
  {
    label: "コマセの使い方・コツ",
    searchQuery: "サビキ釣り コマセ 使い方 コツ",
    description: "コマセの詰め方とシャクリのテクニック",
  },
  {
    label: "サビキ釣りで爆釣する方法",
    searchQuery: "サビキ釣り 爆釣 タナ 探り方",
    description: "タナの探り方や手返しのコツで釣果アップ",
  },
];

export const metadata: Metadata = {
  title: "サビキ釣り完全ガイド - 初心者でも爆釣するコツと仕掛け",
  description:
    "サビキ釣りの仕掛け、コマセの使い方、タナの探し方を初心者向けに完全解説。アジ・サバ・イワシの釣り方、必要な道具、おすすめスポット、釣果アップのコツ、片付けまで。堤防から手軽に始められるサビキ釣りで大漁を目指そう。",
  openGraph: {
    title: "サビキ釣り完全ガイド - 初心者でも爆釣するコツと仕掛け",
    description:
      "サビキ釣りの仕掛け、コマセの使い方、釣り方を初心者向けに完全解説。アジ・サバ・イワシを釣ろう。",
    type: "article",
    url: "https://tsurispot.com/guide/sabiki",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/sabiki",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "サビキ釣り完全ガイド - 初心者でも爆釣するコツと仕掛け",
  description:
    "サビキ釣りの仕掛け、コマセの使い方、タナの探し方を初心者向けに完全解説。アジ・サバ・イワシの釣り方、必要な道具、おすすめスポット、釣果アップのコツ、片付けまで。",
  datePublished: "2025-01-01",
  dateModified: new Date().toISOString().split("T")[0],
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
    "@id": "https://tsurispot.com/guide/sabiki",
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
      name: "サビキ釣り完全ガイド",
      item: "https://tsurispot.com/guide/sabiki",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "サビキ釣りの始め方 - 仕掛けの準備から実釣・片付けまで",
  description:
    "サビキ釣りの仕掛けのセットからコマセの使い方、タナの探し方、取り込み、片付けまで。初心者でもアジ・サバ・イワシが釣れる手順を解説。",
  totalTime: "PT3H",
  supply: [
    { "@type": "HowToSupply", name: "サビキ仕掛け（ハゲ皮またはスキン・針4〜6号）" },
    { "@type": "HowToSupply", name: "コマセカゴ（上カゴ式または下カゴ式）" },
    { "@type": "HowToSupply", name: "コマセ（冷凍アミエビまたはチューブタイプ）" },
  ],
  tool: [
    { "@type": "HowToTool", name: "釣り竿（2〜3mの万能竿または磯竿2〜3号）" },
    { "@type": "HowToTool", name: "スピニングリール（2000〜3000番）" },
    { "@type": "HowToTool", name: "バケツ（コマセ用・水くみ用）" },
    { "@type": "HowToTool", name: "クーラーボックス" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "仕掛けをセットする",
      text: "竿にリールをセットし、糸をガイドに通します。糸の先にサビキ仕掛けのスナップを結び、仕掛けの下（または上）にコマセカゴを取り付けます。下カゴ式が一般的で初心者向きです。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "コマセ（撒き餌）をカゴに詰める",
      text: "コマセカゴにアミエビを7〜8分目まで詰めます。詰めすぎると海中でコマセが出にくくなるので、少し余裕を持たせるのがポイント。チューブタイプならそのまま絞り入れるだけで簡単です。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "狙うタナ（深さ）に仕掛けを下ろす",
      text: "足元にそのまま仕掛けを落とします。投げる必要はありません。まずは底まで沈めてから、リールを2〜3回巻いて底から少し浮かせた位置からスタートしましょう。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "竿をシャクってコマセを振り出す",
      text: "竿を50cm〜1mほど上下に動かして、カゴからコマセを海中に拡散させます。2〜3回シャクったら竿を止めて、コマセの煙幕の中に針が漂うようにします。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "アタリを待つ",
      text: "竿を止めた状態で10〜30秒待ちます。コマセの匂いと煙幕に引き寄せられた魚が疑似餌の針に食いつくのを待ちましょう。竿先に集中してアタリを見逃さないようにします。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "アワセてリールを巻き上げる",
      text: "ブルブルと竿先に振動が伝わったら魚がかかった合図。竿をゆっくり立てて合わせ、一定の速度でリールを巻いて仕掛けを回収します。複数の針にかかっていると重くなりますが、焦らず巻きましょう。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "魚を取り込んでバケツに入れる",
      text: "仕掛けが上がってきたら、魚を針から外してバケツやクーラーボックスに入れます。針を飲み込んでいる場合はプライヤーを使って外しましょう。サバは暴れるのでフィッシュグリップがあると便利です。",
      position: 7,
    },
    {
      "@type": "HowToStep",
      name: "コマセを詰め直して繰り返す",
      text: "カゴのコマセが減っていたら詰め直し、再度仕掛けを投入します。群れが来ているうちは手返しよく繰り返すことが大漁のカギです。アタリがなければタナを変えてみましょう。",
      position: 8,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "サビキ釣りに最適な時期・シーズンはいつですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "サビキ釣りのベストシーズンは5〜11月です。特に6〜9月の夏場はアジ・サバ・イワシの回遊が活発で、初心者でも数釣りが楽しめます。春（4〜5月）は小型の豆アジが釣れ始め、秋（9〜11月）は脂が乗った良型のアジが狙えます。冬場は回遊が少なくなりますが、暖かい地域では年中釣れることもあります。",
      },
    },
    {
      "@type": "Question",
      name: "サビキ釣りの仕掛けは上カゴ式と下カゴ式どちらがいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者には下カゴ式がおすすめです。下カゴ式は仕掛けの一番下にカゴとオモリが付いているので、投入時に絡みにくく扱いやすいのが特徴。上カゴ式はコマセが上から降り注ぐのでアピール力が高く、深い場所や潮が速い場所で効果的です。まずは下カゴ式で慣れてから、上カゴ式も試してみましょう。",
      },
    },
    {
      "@type": "Question",
      name: "サビキの針のサイズは何号がいいですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "万能なのは4〜6号です。豆アジやイワシなど小型の魚がメインなら3〜4号、20cm以上のアジやサバが混じるなら5〜7号を選びましょう。針が大きすぎると小型魚の口に入らず、小さすぎると大型魚に折られることがあります。迷ったら5号を選べば幅広く対応できます。",
      },
    },
    {
      "@type": "Question",
      name: "サビキ釣りで全然釣れないときはどうすればいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "まずタナ（深さ）を変えてみましょう。底付近、中層、表層と幅広く探ります。次に、仕掛けの種類を変えてみること。ピンクスキンで釣れなければハゲ皮やサバ皮に変更します。それでもダメなら、魚がまだ回遊していない可能性があります。周りの釣り人の様子を観察し、釣れている人がいればタナや仕掛けを参考にしましょう。朝マヅメや夕マヅメの時合いを狙うのも効果的です。",
      },
    },
    {
      "@type": "Question",
      name: "コマセは冷凍アミエビとチューブタイプどちらがいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "冷凍アミエビの方がコストパフォーマンスが良く、集魚効果も高いです。1ブロック（約2kg）で300〜500円程度。ただし解凍の手間と手が汚れるデメリットがあります。チューブタイプ（アミ姫など）は手が汚れにくく持ち運びも楽ですが、やや割高。短時間の釣りやお試しならチューブタイプ、半日以上じっくり釣るなら冷凍アミエビがおすすめです。",
      },
    },
    {
      "@type": "Question",
      name: "サビキ釣りの初期費用はいくらかかる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "竿・リール・仕掛けが一式セットになったサビキ釣りセットが3,000〜5,000円程度。これにコマセ（300〜600円）、バケツ（100均でも可）、クーラーボックス（1,000〜3,000円）を合わせても、約5,000〜10,000円で始められます。まずはセット品で釣りの楽しさを体験し、ハマったら少しずつ道具をグレードアップしていくのがおすすめです。",
      },
    },
    {
      "@type": "Question",
      name: "サビキで釣ったアジやサバはどうやって持ち帰ればいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "クーラーボックスに氷を入れておき、釣れた魚をすぐに入れるのが基本です。氷は釣具店やコンビニで購入できます。海水と氷を混ぜた「潮氷」にすると、魚全体が均一に冷えて鮮度が保たれます。アジは刺身、サバは塩焼き、イワシは天ぷらや煮付けにするとおいしくいただけます。",
      },
    },
  ],
};

/* ── SVG図解コンポーネント ── */

function KomaseSvg() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">コマセの撒き方（4ステップ）</h3>
      <svg
        viewBox="0 0 720 260"
        className="mx-auto w-full max-w-[720px]"
        aria-label="コマセの撒き方の図解：カゴに詰める、着底させる、シャクリ上げる、コマセが広がるの4ステップ"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="720" height="260" fill="#F9FAFB" rx="12" />

        {/* Step 1: カゴにコマセを詰める */}
        <g>
          <text x="90" y="24" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">1. カゴに詰める</text>
          {/* カゴ */}
          <rect x="70" y="80" width="40" height="50" rx="5" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
          <text x="90" y="110" fontSize="9" fill="white" textAnchor="middle">カゴ</text>
          {/* コマセ */}
          <rect x="74" y="95" width="32" height="20" rx="3" fill="#F59E0B" opacity="0.6" />
          <text x="90" y="108" fontSize="8" fill="#92400E" textAnchor="middle">7-8分目</text>
          {/* 矢印（手で詰める） */}
          <path d="M50,80 Q45,70 60,65" fill="none" stroke="#6B7280" strokeWidth="1.5" />
          <polygon points="60,62 56,70 64,68" fill="#6B7280" />
          <text x="40" y="58" fontSize="10" fill="#6B7280" textAnchor="middle">詰める</text>
        </g>

        {/* Step 2: 着底 */}
        <g>
          <text x="270" y="24" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">2. 着底させる</text>
          {/* 水面 */}
          <line x1="210" y1="60" x2="330" y2="60" stroke="#2563EB" strokeWidth="1" strokeDasharray="4,3" />
          <text x="325" y="56" fontSize="9" fill="#2563EB" textAnchor="end">水面</text>
          {/* 水 */}
          <rect x="210" y="60" width="120" height="170" fill="#DBEAFE" rx="6" />
          {/* 道糸 */}
          <line x1="270" y1="40" x2="270" y2="195" stroke="#4B5563" strokeWidth="1.5" />
          {/* 針 */}
          {[100, 120, 140, 160].map((y, i) => (
            <g key={i}>
              <line x1="270" y1={y} x2="252" y2={y + 8} stroke="#4B5563" strokeWidth="0.8" />
              <circle cx="250" cy={y + 6} r="2" fill="#EC4899" opacity="0.7" />
            </g>
          ))}
          {/* カゴ */}
          <rect x="260" y="195" width="20" height="20" rx="3" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
          {/* 底 */}
          <path d="M210,230 Q270,225 330,230" fill="none" stroke="#92400E" strokeWidth="1.5" />
          <text x="270" y="248" fontSize="9" fill="#92400E" textAnchor="middle">海底</text>
          {/* 矢印 */}
          <line x1="270" y1="185" x2="270" y2="195" stroke="#2563EB" strokeWidth="1.5" />
          <polygon points="265,193 275,193 270,200" fill="#2563EB" />
        </g>

        {/* Step 3: シャクリ上げ */}
        <g>
          <text x="450" y="24" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">3. シャクリ上げる</text>
          {/* 水面 */}
          <line x1="390" y1="60" x2="510" y2="60" stroke="#2563EB" strokeWidth="1" strokeDasharray="4,3" />
          {/* 水 */}
          <rect x="390" y="60" width="120" height="170" fill="#DBEAFE" rx="6" />
          {/* 道糸 */}
          <line x1="450" y1="40" x2="450" y2="155" stroke="#4B5563" strokeWidth="1.5" />
          {/* 針 */}
          {[80, 100, 120, 140].map((y, i) => (
            <g key={i}>
              <line x1="450" y1={y} x2="432" y2={y + 8} stroke="#4B5563" strokeWidth="0.8" />
              <circle cx="430" cy={y + 6} r="2" fill="#EC4899" opacity="0.7" />
            </g>
          ))}
          {/* カゴ */}
          <rect x="440" y="155" width="20" height="20" rx="3" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
          {/* シャクリの矢印 */}
          <path d="M470,180 L470,100" fill="none" stroke="#EF4444" strokeWidth="2" />
          <polygon points="465,105 475,105 470,95" fill="#EF4444" />
          <text x="490" y="140" fontSize="10" fill="#EF4444">シャクリ</text>
          <text x="490" y="154" fontSize="10" fill="#EF4444">50cm-1m</text>
          {/* コマセ粒 */}
          {[170, 175, 165, 180, 160].map((y, i) => (
            <circle key={i} cx={440 + (i % 3) * 8 - 5} cy={y} r="2" fill="#F59E0B" opacity="0.6" />
          ))}
        </g>

        {/* Step 4: コマセが広がる */}
        <g>
          <text x="630" y="24" fontSize="13" fill="#3B82F6" textAnchor="middle" fontWeight="bold">4. コマセが広がる</text>
          {/* 水面 */}
          <line x1="570" y1="60" x2="690" y2="60" stroke="#2563EB" strokeWidth="1" strokeDasharray="4,3" />
          {/* 水 */}
          <rect x="570" y="60" width="120" height="170" fill="#DBEAFE" rx="6" />
          {/* 道糸 */}
          <line x1="630" y1="40" x2="630" y2="175" stroke="#4B5563" strokeWidth="1.5" />
          {/* 針（コマセの中に） */}
          {[100, 120, 140, 160].map((y, i) => (
            <g key={i}>
              <line x1="630" y1={y} x2="612" y2={y + 8} stroke="#4B5563" strokeWidth="0.8" />
              <circle cx="610" cy={y + 6} r="2" fill="#EC4899" opacity="0.7" />
            </g>
          ))}
          {/* カゴ */}
          <rect x="620" y="175" width="20" height="20" rx="3" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />
          {/* コマセの煙幕（楕円で表現） */}
          <ellipse cx="625" cy="140" rx="35" ry="55" fill="#F59E0B" opacity="0.15" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3,3" />
          {/* コマセ粒 */}
          {[
            [610, 100], [620, 115], [600, 130], [635, 105], [640, 125],
            [615, 145], [605, 160], [638, 150], [625, 170], [610, 175],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="#F59E0B" opacity="0.7" />
          ))}
          <text x="670" y="140" fontSize="9" fill="#F59E0B">コマセの</text>
          <text x="670" y="153" fontSize="9" fill="#F59E0B">煙幕</text>
          {/* 魚が寄ってくる */}
          <text x="585" y="120" fontSize="12" fill="#3B82F6">🐟</text>
          <text x="595" y="155" fontSize="10" fill="#3B82F6">🐟</text>
        </g>

        {/* 矢印（ステップ間） */}
        <line x1="145" y1="110" x2="200" y2="110" stroke="#9CA3AF" strokeWidth="1.5" />
        <polygon points="195,106 195,114 205,110" fill="#9CA3AF" />
        <line x1="335" y1="110" x2="385" y2="110" stroke="#9CA3AF" strokeWidth="1.5" />
        <polygon points="380,106 380,114 390,110" fill="#9CA3AF" />
        <line x1="515" y1="110" x2="565" y2="110" stroke="#9CA3AF" strokeWidth="1.5" />
        <polygon points="560,106 560,114 570,110" fill="#9CA3AF" />
      </svg>
    </div>
  );
}

function TanaSvg() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">タナ（深さ）の探り方</h3>
      <svg
        viewBox="0 0 400 350"
        className="mx-auto w-full max-w-[400px]"
        aria-label="タナの探り方の図解：表層・中層・底層のレイヤーと魚のいる位置"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="400" height="350" fill="#F9FAFB" rx="12" />

        {/* 堤防 */}
        <rect x="0" y="20" width="50" height="330" fill="#9CA3AF" opacity="0.3" stroke="#6B7280" strokeWidth="1" />
        <text x="25" y="14" fontSize="11" fill="#4B5563" textAnchor="middle">堤防</text>

        {/* 竿 */}
        <line x1="40" y1="30" x2="100" y2="30" stroke="#78716C" strokeWidth="3" />
        <text x="70" y="24" fontSize="9" fill="#44403C" textAnchor="middle">竿</text>

        {/* 水面 */}
        <line x1="50" y1="60" x2="400" y2="60" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="6,3" />
        <text x="380" y="54" fontSize="11" fill="#2563EB" textAnchor="end">水面</text>

        {/* 水域 */}
        <rect x="50" y="60" width="350" height="270" fill="#DBEAFE" rx="0" />

        {/* 表層 */}
        <rect x="50" y="60" width="350" height="80" fill="#BFDBFE" opacity="0.3" />
        <text x="380" y="102" fontSize="12" fill="#2563EB" textAnchor="end" fontWeight="bold">表層</text>
        <text x="380" y="118" fontSize="9" fill="#2563EB" textAnchor="end">イワシが多い</text>

        {/* 中層 */}
        <rect x="50" y="140" width="350" height="90" fill="#93C5FD" opacity="0.2" />
        <text x="380" y="188" fontSize="12" fill="#2563EB" textAnchor="end" fontWeight="bold">中層</text>
        <text x="380" y="204" fontSize="9" fill="#2563EB" textAnchor="end">アジが多い</text>

        {/* 底層 */}
        <rect x="50" y="230" width="350" height="80" fill="#60A5FA" opacity="0.2" />
        <text x="380" y="272" fontSize="12" fill="#2563EB" textAnchor="end" fontWeight="bold">底層</text>
        <text x="380" y="288" fontSize="9" fill="#2563EB" textAnchor="end">サバ・大型アジ</text>

        {/* 海底 */}
        <path d="M50,310 Q150,300 250,310 Q350,320 400,305" fill="#D4A373" opacity="0.4" />
        <text x="225" y="340" fontSize="10" fill="#92400E" textAnchor="middle">海底</text>

        {/* 道糸 */}
        <line x1="100" y1="30" x2="100" y2="290" stroke="#4B5563" strokeWidth="1.5" />

        {/* 仕掛け位置（底層付近） */}
        {[160, 190, 220, 250, 270].map((y, i) => (
          <g key={i}>
            <line x1="100" y1={y} x2="80" y2={y + 10} stroke="#4B5563" strokeWidth="0.8" />
            <circle cx="78" cy={y + 8} r="2" fill="#EC4899" opacity="0.7" />
          </g>
        ))}
        {/* カゴ */}
        <rect x="92" y="280" width="16" height="16" rx="2" fill="#22C55E" stroke="#16A34A" strokeWidth="1" />

        {/* 魚（表層） */}
        <g opacity="0.8">
          <ellipse cx="180" cy="90" rx="12" ry="5" fill="#60A5FA" />
          <ellipse cx="210" cy="100" rx="12" ry="5" fill="#60A5FA" />
          <ellipse cx="240" cy="85" rx="12" ry="5" fill="#60A5FA" />
          <ellipse cx="260" cy="95" rx="12" ry="5" fill="#60A5FA" />
          <text x="150" y="90" fontSize="8" fill="#1D4ED8">イワシ</text>
        </g>

        {/* 魚（中層） */}
        <g opacity="0.8">
          <ellipse cx="190" cy="170" rx="14" ry="6" fill="#3B82F6" />
          <ellipse cx="230" cy="180" rx="14" ry="6" fill="#3B82F6" />
          <ellipse cx="260" cy="165" rx="14" ry="6" fill="#3B82F6" />
          <text x="155" y="172" fontSize="8" fill="#1E40AF">アジ</text>
        </g>

        {/* 魚（底層） */}
        <g opacity="0.8">
          <ellipse cx="200" cy="255" rx="16" ry="7" fill="#2563EB" />
          <ellipse cx="245" cy="265" rx="16" ry="7" fill="#2563EB" />
          <text x="155" y="260" fontSize="8" fill="#1E3A8A">サバ</text>
        </g>

        {/* タナ変更の矢印 */}
        <g>
          <path d="M130,100 L130,260" fill="none" stroke="#EF4444" strokeWidth="2" />
          <polygon points="125,105 135,105 130,95" fill="#EF4444" />
          <polygon points="125,255 135,255 130,265" fill="#EF4444" />
          <text x="145" y="180" fontSize="10" fill="#EF4444" transform="rotate(90,145,180)">タナを変えて探る</text>
        </g>
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        アタリがなければタナ（リールを巻く回数）を変えて、魚のいる層を探りましょう
      </p>
    </div>
  );
}

/* ── CSSアニメーション付きSVGコンポーネント ── */

function ShakuriAnimationSvg() {
  return (
    <div className="my-6">
      <h4 className="mb-3 text-center text-sm font-bold text-foreground">動きで見るしゃくり方</h4>
      <svg
        viewBox="0 0 400 500"
        width="100%"
        className="mx-auto max-w-[400px]"
        aria-label="しゃくり動作のイメージ：仕掛けが上下に動き、コマセが拡散して魚が寄ってくるアニメーション"
      >
        <style>{`
          @keyframes shakuri {
            0% { transform: translateY(0); }
            40% { transform: translateY(-40px); }
            60% { transform: translateY(-40px); }
            80% { transform: translateY(0); }
            100% { transform: translateY(0); }
          }
          @keyframes komase-spread {
            0% { opacity: 0; r: 2; }
            30% { opacity: 0.8; }
            70% { opacity: 0.4; r: 5; }
            100% { opacity: 0; r: 8; }
          }
          @keyframes fish-approach {
            0% { transform: translateX(-60px); opacity: 0; }
            30% { opacity: 1; }
            80% { transform: translateX(0); opacity: 1; }
            100% { transform: translateX(0); opacity: 1; }
          }
          .shakuri-rig {
            animation: shakuri 3s ease-in-out infinite;
          }
          .komase-p1 { animation: komase-spread 3s ease-out infinite; animation-delay: 0.5s; }
          .komase-p2 { animation: komase-spread 3s ease-out infinite; animation-delay: 0.8s; }
          .komase-p3 { animation: komase-spread 3s ease-out infinite; animation-delay: 1.1s; }
          .komase-p4 { animation: komase-spread 3s ease-out infinite; animation-delay: 1.4s; }
          .komase-p5 { animation: komase-spread 3s ease-out infinite; animation-delay: 0.6s; }
          .komase-p6 { animation: komase-spread 3s ease-out infinite; animation-delay: 0.9s; }
          .komase-p7 { animation: komase-spread 3s ease-out infinite; animation-delay: 1.2s; }
          .komase-p8 { animation: komase-spread 3s ease-out infinite; animation-delay: 1.5s; }
          .fish-1 { animation: fish-approach 3s ease-out infinite; animation-delay: 1s; }
          .fish-2 { animation: fish-approach 3s ease-out infinite; animation-delay: 1.5s; }
          .fish-3 { animation: fish-approach 3s ease-out infinite; animation-delay: 2s; }
        `}</style>

        {/* 背景 */}
        <rect x="0" y="0" width="400" height="500" fill="#F9FAFB" rx="12" />

        {/* 空 */}
        <rect x="0" y="0" width="400" height="100" fill="#EFF6FF" rx="12" />

        {/* 堤防 */}
        <rect x="0" y="40" width="60" height="460" fill="#9CA3AF" opacity="0.3" stroke="#6B7280" strokeWidth="1" />
        <text x="30" y="32" fontSize="10" fill="#4B5563" textAnchor="middle">堤防</text>

        {/* 竿 */}
        <line x1="50" y1="55" x2="160" y2="45" stroke="#78716C" strokeWidth="3" strokeLinecap="round" />
        <line x1="160" y1="45" x2="200" y2="60" stroke="#78716C" strokeWidth="2.5" strokeLinecap="round" />
        <text x="130" y="38" fontSize="9" fill="#44403C" textAnchor="middle">竿</text>

        {/* 水面 */}
        <path d="M60,100 Q100,94 140,100 Q180,106 220,100 Q260,94 300,100 Q340,106 400,100 L400,100 L60,100" fill="none" stroke="#3B82F6" strokeWidth="2" />
        <text x="380" y="94" fontSize="10" fill="#3B82F6" textAnchor="end">水面</text>

        {/* 水域 */}
        <rect x="60" y="100" width="340" height="400" fill="#DBEAFE" opacity="0.5" />

        {/* 道糸（竿先から仕掛けへ） */}
        <line x1="200" y1="60" x2="200" y2="140" stroke="#4B5563" strokeWidth="1" />

        {/* しゃくりで動く仕掛けグループ */}
        <g className="shakuri-rig">
          {/* 道糸（動く部分） */}
          <line x1="200" y1="140" x2="200" y2="400" stroke="#4B5563" strokeWidth="1.2" />

          {/* サビキ針 3本 */}
          <g>
            {/* 針1 */}
            <line x1="200" y1="240" x2="175" y2="255" stroke="#4B5563" strokeWidth="0.8" />
            <circle cx="173" cy="257" r="3" fill="#EC4899" opacity="0.8" />
            <text x="160" y="261" fontSize="8" fill="#6B7280" textAnchor="end">針</text>

            {/* 針2 */}
            <line x1="200" y1="290" x2="175" y2="305" stroke="#4B5563" strokeWidth="0.8" />
            <circle cx="173" cy="307" r="3" fill="#EC4899" opacity="0.8" />

            {/* 針3 */}
            <line x1="200" y1="340" x2="175" y2="355" stroke="#4B5563" strokeWidth="0.8" />
            <circle cx="173" cy="357" r="3" fill="#EC4899" opacity="0.8" />
          </g>

          {/* コマセカゴ */}
          <rect x="188" y="370" width="24" height="28" rx="4" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
          <text x="200" y="388" fontSize="7" fill="white" textAnchor="middle">カゴ</text>

          {/* オモリ */}
          <ellipse cx="200" cy="410" rx="8" ry="6" fill="#6B7280" stroke="#4B5563" strokeWidth="1" />
          <text x="200" y="413" fontSize="6" fill="white" textAnchor="middle">錘</text>

          {/* コマセパーティクル */}
          <circle className="komase-p1" cx="185" cy="380" r="2" fill="#F59E0B" opacity="0" />
          <circle className="komase-p2" cx="215" cy="375" r="2" fill="#F59E0B" opacity="0" />
          <circle className="komase-p3" cx="178" cy="390" r="2" fill="#F59E0B" opacity="0" />
          <circle className="komase-p4" cx="222" cy="385" r="2" fill="#F59E0B" opacity="0" />
          <circle className="komase-p5" cx="190" cy="395" r="2" fill="#F59E0B" opacity="0" />
          <circle className="komase-p6" cx="210" cy="392" r="2" fill="#F59E0B" opacity="0" />
          <circle className="komase-p7" cx="175" cy="370" r="2" fill="#F59E0B" opacity="0" />
          <circle className="komase-p8" cx="225" cy="378" r="2" fill="#F59E0B" opacity="0" />
        </g>

        {/* 魚（寄ってくるアニメーション） */}
        <g className="fish-1">
          <ellipse cx="120" cy="310" rx="16" ry="7" fill="#22C55E" opacity="0.8" />
          <polygon points="103,310 95,304 95,316" fill="#22C55E" opacity="0.8" />
          <circle cx="130" cy="308" r="1.5" fill="white" />
        </g>
        <g className="fish-2">
          <ellipse cx="115" cy="350" rx="14" ry="6" fill="#22C55E" opacity="0.7" />
          <polygon points="100,350 93,345 93,355" fill="#22C55E" opacity="0.7" />
          <circle cx="124" cy="348" r="1.5" fill="white" />
        </g>
        <g className="fish-3">
          <ellipse cx="125" cy="280" rx="12" ry="5" fill="#22C55E" opacity="0.6" />
          <polygon points="112,280 106,276 106,284" fill="#22C55E" opacity="0.6" />
          <circle cx="132" cy="278" r="1.2" fill="white" />
        </g>

        {/* しゃくり方向の矢印 */}
        <g>
          <path d="M250,200 L250,160" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,3" />
          <polygon points="245,165 255,165 250,155" fill="#EF4444" />
          <path d="M260,160 L260,200" fill="none" stroke="#EF4444" strokeWidth="2" />
          <polygon points="255,195 265,195 260,205" fill="#EF4444" />
          <text x="285" y="175" fontSize="10" fill="#EF4444" fontWeight="bold">しゃくり</text>
          <text x="285" y="190" fontSize="9" fill="#EF4444">上→下</text>
        </g>

        {/* ラベル */}
        <text x="200" y="475" fontSize="12" fill="#374151" textAnchor="middle" fontWeight="bold">しゃくり動作のイメージ</text>
        <text x="200" y="492" fontSize="9" fill="#6B7280" textAnchor="middle">仕掛けを上下に動かしてコマセを拡散させます</text>
      </svg>
    </div>
  );
}

function AtariAnimationSvg() {
  return (
    <div className="my-6">
      <h4 className="mb-3 text-center text-sm font-bold text-foreground">アタリの瞬間</h4>
      <svg
        viewBox="0 0 400 300"
        width="100%"
        className="mx-auto max-w-[400px]"
        aria-label="アタリの瞬間：ウキがゆっくり揺れた後、急に沈むアニメーション"
      >
        <style>{`
          @keyframes uki-bob {
            0% { transform: translateY(0); }
            15% { transform: translateY(-3px); }
            30% { transform: translateY(2px); }
            45% { transform: translateY(-2px); }
            55% { transform: translateY(1px); }
            60% { transform: translateY(0); }
            65% { transform: translateY(4px); }
            70% { transform: translateY(30px); }
            75% { transform: translateY(35px); }
            80% { transform: translateY(30px); }
            85% { transform: translateY(35px); }
            90% { transform: translateY(10px); }
            95% { transform: translateY(2px); }
            100% { transform: translateY(0); }
          }
          @keyframes splash {
            0% { opacity: 0; }
            65% { opacity: 0; }
            70% { opacity: 1; }
            80% { opacity: 0.5; }
            90% { opacity: 0; }
            100% { opacity: 0; }
          }
          @keyframes atari-fish {
            0% { transform: translateX(0) translateY(0); }
            60% { transform: translateX(0) translateY(0); }
            68% { transform: translateX(10px) translateY(-15px); }
            72% { transform: translateX(5px) translateY(-10px); }
            80% { transform: translateX(15px) translateY(-20px); }
            90% { transform: translateX(10px) translateY(-5px); }
            100% { transform: translateX(0) translateY(0); }
          }
          @keyframes line-tension {
            0% { stroke-dashoffset: 0; }
            60% { stroke-dashoffset: 0; }
            70% { stroke-dashoffset: 5; }
            80% { stroke-dashoffset: 0; }
            90% { stroke-dashoffset: 3; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes alert-text {
            0% { opacity: 0; }
            65% { opacity: 0; }
            70% { opacity: 1; }
            85% { opacity: 1; }
            90% { opacity: 0; }
            100% { opacity: 0; }
          }
          @keyframes wave1 {
            0% { d: path("M0,80 Q50,74 100,80 Q150,86 200,80 Q250,74 300,80 Q350,86 400,80"); }
            50% { d: path("M0,80 Q50,86 100,80 Q150,74 200,80 Q250,86 300,80 Q350,74 400,80"); }
            100% { d: path("M0,80 Q50,74 100,80 Q150,86 200,80 Q250,74 300,80 Q350,86 400,80"); }
          }
          .uki-group {
            animation: uki-bob 6s ease-in-out infinite;
          }
          .splash-effect {
            animation: splash 6s ease-out infinite;
          }
          .atari-fish-move {
            animation: atari-fish 6s ease-in-out infinite;
          }
          .atari-line {
            animation: line-tension 6s ease-in-out infinite;
          }
          .alert-label {
            animation: alert-text 6s ease-in-out infinite;
          }
          .wave-line {
            animation: wave1 3s ease-in-out infinite;
          }
        `}</style>

        {/* 背景 */}
        <rect x="0" y="0" width="400" height="300" fill="#F9FAFB" rx="12" />

        {/* 空 */}
        <rect x="0" y="0" width="400" height="80" fill="#EFF6FF" rx="12" />

        {/* 水面の波 */}
        <path className="wave-line" d="M0,80 Q50,74 100,80 Q150,86 200,80 Q250,74 300,80 Q350,86 400,80" fill="none" stroke="#3B82F6" strokeWidth="2" />

        {/* 水域 */}
        <rect x="0" y="80" width="400" height="220" fill="#DBEAFE" opacity="0.5" />

        {/* 水の深い部分グラデ */}
        <rect x="0" y="200" width="400" height="100" fill="#93C5FD" opacity="0.2" />

        {/* 道糸（上部・固定） */}
        <line x1="80" y1="20" x2="200" y2="60" stroke="#4B5563" strokeWidth="1" />

        {/* 竿先 */}
        <line x1="30" y1="30" x2="80" y2="20" stroke="#78716C" strokeWidth="2.5" strokeLinecap="round" />

        {/* ウキグループ（アニメーション） */}
        <g className="uki-group">
          {/* 道糸（ウキから下） */}
          <line className="atari-line" x1="200" y1="90" x2="200" y2="200" stroke="#4B5563" strokeWidth="0.8" strokeDasharray="3,2" />

          {/* ウキ本体 */}
          <g>
            {/* ウキの棒 */}
            <line x1="200" y1="58" x2="200" y2="92" stroke="#4B5563" strokeWidth="1.5" />
            {/* 赤い上部 */}
            <circle cx="200" cy="68" r="7" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
            {/* 白い下部 */}
            <circle cx="200" cy="82" r="7" fill="white" stroke="#D1D5DB" strokeWidth="1" />
          </g>

          {/* 水しぶき */}
          <g className="splash-effect" opacity="0">
            <circle cx="190" cy="75" r="2" fill="#3B82F6" opacity="0.6" />
            <circle cx="210" cy="73" r="1.5" fill="#3B82F6" opacity="0.5" />
            <circle cx="185" cy="70" r="1" fill="#3B82F6" opacity="0.4" />
            <circle cx="215" cy="72" r="1.5" fill="#3B82F6" opacity="0.5" />
            <circle cx="195" cy="68" r="1" fill="#3B82F6" opacity="0.3" />
            <circle cx="205" cy="69" r="1.2" fill="#3B82F6" opacity="0.4" />
          </g>

          {/* サビキ針 */}
          <line x1="200" y1="150" x2="185" y2="160" stroke="#4B5563" strokeWidth="0.6" />
          <circle cx="183" cy="162" r="2" fill="#EC4899" opacity="0.7" />
          <line x1="200" y1="170" x2="185" y2="180" stroke="#4B5563" strokeWidth="0.6" />
          <circle cx="183" cy="182" r="2" fill="#EC4899" opacity="0.7" />
        </g>

        {/* 魚（アタリ時に動く） */}
        <g className="atari-fish-move">
          <ellipse cx="220" cy="200" rx="18" ry="8" fill="#22C55E" opacity="0.8" />
          <polygon points="239,200 248,194 248,206" fill="#22C55E" opacity="0.8" />
          <circle cx="210" cy="198" r="2" fill="white" />
          <circle cx="210" cy="198" r="1" fill="#1F2937" />
        </g>

        {/* 「アタリ!」テキスト */}
        <g className="alert-label">
          <rect x="240" y="38" width="80" height="28" rx="14" fill="#EF4444" />
          <text x="280" y="57" fontSize="13" fill="white" textAnchor="middle" fontWeight="bold">アタリ!</text>
        </g>

        {/* 小さな魚（背景） */}
        <ellipse cx="320" cy="150" rx="10" ry="4" fill="#60A5FA" opacity="0.3" />
        <ellipse cx="340" cy="160" rx="8" ry="3.5" fill="#60A5FA" opacity="0.25" />
        <ellipse cx="90" cy="180" rx="9" ry="4" fill="#60A5FA" opacity="0.2" />

        {/* 説明ラベル */}
        <g>
          <text x="330" y="100" fontSize="9" fill="#3B82F6">ウキが揺れる</text>
          <text x="330" y="112" fontSize="9" fill="#3B82F6">= 波の動き</text>
          <line x1="320" y1="100" x2="215" y2="80" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="2,2" />
        </g>
        <g>
          <text x="50" y="230" fontSize="9" fill="#22C55E">魚が食いつくと</text>
          <text x="50" y="242" fontSize="9" fill="#22C55E">ウキが沈む!</text>
        </g>

        {/* ラベル */}
        <text x="200" y="280" fontSize="12" fill="#374151" textAnchor="middle" fontWeight="bold">アタリの瞬間</text>
        <text x="200" y="295" fontSize="9" fill="#6B7280" textAnchor="middle">ウキが急に沈んだら魚がかかった合図です</text>
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

function Danger({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
      <span className="font-medium">重要：</span>
      {children}
    </div>
  );
}

export default function SabikiGuidePage() {
  // サビキ向けスポット（漁港・堤防の初心者向け）
  const sabikiSpots = fishingSpots
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "ガイド", href: "/guide" },
          { label: "サビキ釣りガイド" },
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
            サビキ釣り完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            初心者の定番、サビキ釣り。
            <br className="hidden sm:inline" />
            コマセの使い方から釣り方、片付けまで丁寧に解説します。
          </p>
        </div>

        {/* サビキ釣りとは */}
        <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">サビキ釣りとは？</p>
          <p className="mt-1">
            サビキ釣りは、コマセ（撒き餌）で魚を寄せて、疑似餌が付いた複数の針で一度にたくさんの魚を釣る方法です。アジ、サバ、イワシなどの回遊魚が主なターゲットで、群れが来れば一度に3〜5匹がかかることも珍しくありません。堤防から足元に仕掛けを落とすだけなので投げる技術が不要で、お子さんから大人まで誰でも手軽に楽しめます。「最初の一匹」を釣りやすい釣り方として、釣り入門に最もおすすめされている定番スタイルです。釣った魚はその日のうちに刺身や天ぷらにして食べられるのも大きな魅力です。
          </p>
        </div>

        <div className="space-y-6">
          {/* 必要な道具 */}
          <SectionCard title="必要な道具" icon={Package}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">竿：</span>
                <span>2〜3mの万能竿や磯竿2〜3号。初心者セットに含まれていることが多く、振り出し式のコンパクトロッドが持ち運びに便利です。長すぎると取り回しが難しいので、最初は2.4〜2.7mがおすすめ。{" "}
                <a href="https://amzn.to/4s4i64m" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                  <ShoppingBag className="size-3" />
                  シマノ ロッドを見る
                  <ExternalLink className="size-2.5" />
                </a></span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">リール：</span>
                <span>スピニングリール2000〜3000番。ナイロンライン2〜3号が100m以上巻けるもの。糸付きリールでもサビキ釣りなら十分です。{" "}
                <a href="https://amzn.to/4atW7Om" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                  <ShoppingBag className="size-3" />
                  シマノ リールを見る
                  <ExternalLink className="size-2.5" />
                </a></span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">サビキ仕掛け：</span>
                針のサイズは4〜6号が万能。ハゲ皮（魚皮）とスキン（ビニール素材）の2種類があり、ピンクスキンが定番。状況によって使い分けると釣果が変わります。2〜3種類持っていくと安心です。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">コマセカゴ：</span>
                仕掛けの下に付ける「下カゴ式」が初心者向け。オモリ一体型のカゴなら別途オモリを買う必要がなく簡単です。上カゴ式はコマセが上から降り注ぐため深場で効果的。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">コマセ（アミエビ）：</span>
                <span>冷凍アミエビが最もコスパが良く、1ブロック（約2kg）で300〜500円。手を汚したくない方にはチューブタイプ（アミ姫など）が便利。半日の釣りなら冷凍1ブロックで足ります。{" "}
                <a href="https://amzn.to/4c6gaUn" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                  <ShoppingBag className="size-3" />
                  マルキュー アミ姫を見る
                  <ExternalLink className="size-2.5" />
                </a></span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">バケツ：</span>
                コマセを入れるバケツ（蓋付きがベスト）と、海水を汲む水くみバケツの2つがあると便利です。折りたたみ式バケツなら収納に困りません。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">クーラーボックス：</span>
                釣った魚を新鮮に持ち帰るために必須。10〜15Lサイズが使いやすい。氷や保冷剤を入れておきましょう。
              </li>
            </ul>
            <Hint>
              初心者は「サビキ釣りセット」を購入するのが最も簡単。竿・リール・仕掛け・カゴがセットで3,000〜5,000円程度です。コマセとバケツを追加すれば、すぐに釣りを始められます。リールに巻くラインは、扱いやすいナイロンライン2〜3号がおすすめです。{" "}
              <a href="https://amzn.to/4s1SPaX" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                <ShoppingBag className="size-3" />
                ナイロンラインを見る
                <ExternalLink className="size-2.5" />
              </a>
            </Hint>
          </SectionCard>

          {/* 仕掛け図 */}
          <RigDiagram type="sabiki" />

          {/* 釣り方の手順 */}
          <SectionCard title="釣り方の手順" icon={Footprints}>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    仕掛けをセットする
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿にリールをセットし、糸をガイドに通します。糸の先にサビキ仕掛けのスナップ（接続金具）を結び、仕掛けの下にコマセカゴを取り付けます。仕掛けの袋に図解があるので参考にしましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    コマセ（撒き餌）をカゴに詰める
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    コマセカゴにアミエビを7〜8分目まで詰めます。詰めすぎると海中でコマセが出にくくなるので、少し余裕を持たせるのがポイント。チューブタイプならそのまま絞り入れるだけで簡単です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    狙うタナ（深さ）に仕掛けを下ろす
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    足元にそのまま仕掛けを落とします。投げる必要はありません。ベイルを起こして、仕掛けの重さで自然に沈めます。まずは底まで沈めてから、リールを2〜3回巻いて底から少し浮かせた位置からスタートしましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿をシャクってコマセを振り出す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を50cm〜1mほど上下に動かして、カゴからコマセを海中に拡散させます。2〜3回シャクったら竿を止めて、コマセの煙幕の中に針が漂うようにします。シャクりすぎるとコマセがすぐになくなるので注意。
                  </p>
                </div>
              </li>
            </ol>

            <KomaseSvg />

            <ShakuriAnimationSvg />

            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    アタリを待つ
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を止めた状態で10〜30秒待ちます。コマセの匂いと煙幕に引き寄せられた魚が、疑似餌の付いた針に食いつくのを待ちましょう。竿先に集中してアタリを見逃さないようにします。
                  </p>
                </div>
              </li>

              <AtariAnimationSvg />

              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  6
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    アワセてリールを巻き上げる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ブルブルと竿先に振動が伝わったら、魚がかかった合図です。竿をゆっくり立てて合わせ、一定の速度でリールを巻いて仕掛けを回収します。複数の針に魚がかかっていると重くなりますが、焦らずゆっくり巻きましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  7
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    魚を取り込む
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    仕掛けが上がってきたら、魚を針から外してバケツやクーラーボックスに入れます。針を飲み込んでいる場合はプライヤーを使いましょう。サバは暴れるので素早く外すのがコツです。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  8
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    コマセを詰め直して繰り返す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    カゴのコマセが減っていたら詰め直し、再度仕掛けを投入します。群れが来ているうちは手返しよく繰り返すことが大漁のカギ。アタリがなければタナ（深さ）を変えて魚のいる層を探りましょう。
                  </p>
                </div>
              </li>
            </ol>

            <Warning>
              コマセはにおいが強いので、服や手に付くと落ちにくくなります。使い捨てのゴム手袋があると便利です。コマセ用のスプーンも売っているので活用しましょう。
            </Warning>
          </SectionCard>

          {/* 釣れる魚 */}
          <SectionCard title="サビキ釣りで釣れる魚" icon={Fish}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">アジ（マアジ）</h3>
                  <Badge variant="secondary" className="text-xs">
                    サビキの王道ターゲット
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  サビキ釣りで最も人気のターゲット。群れで回遊し、コマセに集まりやすい魚です。刺身、なめろう、フライ、南蛮漬けなど料理のレパートリーも豊富。10〜20cmの「豆アジ」から25cm以上の「尺アジ」まで、サイズを問わず美味しくいただけます。特に秋のアジは脂が乗って絶品です。
                </p>
                <Link
                  href="/fish/aji"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  アジの詳細を見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">サバ（マサバ・ゴマサバ）</h3>
                  <Badge variant="secondary" className="text-xs">
                    パワフルな引き
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  サビキ釣りの外道としても人気のターゲット。アジよりも引きが強く、竿をグイグイ引き込む力強いファイトが楽しめます。塩焼き、味噌煮、しめ鯖が定番料理。傷みが早い魚なので、釣ったらすぐに氷水の入ったクーラーボックスに入れて鮮度を保ちましょう。
                </p>
                <Link
                  href="/fish/saba"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  サバの詳細を見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">イワシ（カタクチイワシ・マイワシ）</h3>
                  <Badge variant="secondary" className="text-xs">
                    数釣りが楽しい
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  大群で回遊するため、群れに当たれば一度に5〜6匹かかることも。サビキ釣りで最も数が釣れる魚です。天ぷら、唐揚げ、煮干し、オイルサーディンなど加工方法も多彩。小さなお子さんでも簡単に釣れるので、ファミリーフィッシングの強い味方です。
                </p>
                <Link
                  href="/fish/iwashi"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  イワシの詳細を見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  その他にもこんな魚が釣れることも
                </p>
                <p className="mt-1">
                  サッパ、コノシロ、ウミタナゴ、メジナ（グレ）の幼魚、小型のクロダイなど。思わぬ魚が針にかかるのもサビキ釣りの楽しさです。サビキで釣ったアジやイワシを生きエサにして
                  <Link
                    href="/guide/oyogase"
                    className="text-primary hover:underline"
                  >
                    泳がせ釣り
                  </Link>
                  で大物を狙うこともできます。
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 釣果アップのコツ */}
          <SectionCard title="釣果アップのコツ" icon={Lightbulb}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    朝マヅメ・夕マヅメを狙う
                  </span>
                  <br />
                  日の出・日の入り前後の薄暗い時間帯は魚の活性が最も高くなるゴールデンタイムです。この時間帯に釣り場にいることが大漁への第一歩。特に朝マヅメは回遊魚の接岸が多く、最も期待できます。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    タナ（深さ）をこまめに変える
                  </span>
                  <br />
                  魚は日によって、時間帯によって泳いでいる深さが変わります。底付近、中層、表層と幅広く探りましょう。アタリが出たタナを覚えておき、そのタナを集中的に攻めるのが効果的です。
                </div>
              </li>
            </ul>

            <TanaSvg />

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    コマセは少しずつ、こまめに出す
                  </span>
                  <br />
                  一度に大量にコマセを出すと、魚がコマセだけ食べて針に食いつきません。シャクりは2〜3回で十分。コマセの煙幕の中に針が漂うように、シャクった後は竿を止めて待つのがコツです。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    仕掛けの色・種類を変えてみる
                  </span>
                  <br />
                  ピンクスキンで反応がなければハゲ皮（魚皮）やサバ皮に変更してみましょう。日によって魚の好みが変わるので、2〜3種類の仕掛けを用意しておくと対応力が上がります。蓄光タイプは曇りの日や朝夕の薄暗い時間帯に効果的です。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    群れが来たら手返し良く
                  </span>
                  <br />
                  回遊魚は群れで移動するため、釣れ始めたらチャンスタイムです。魚を素早く外し、コマセを詰め直してすぐに再投入。この「手返し」のスピードが釣果を大きく左右します。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    周りの釣り人を観察する
                  </span>
                  <br />
                  隣で爆釣している人がいたら、使っている仕掛けやタナを参考にしましょう。同じ釣り場でも、少しの違いで釣果に差が出ることがあります。釣りの上手い人は快く教えてくれることが多いです。
                </div>
              </li>
            </ul>
          </SectionCard>

          {/* おすすめスポット */}
          <SectionCard title="おすすめスポット" icon={MapPin}>
            <p className="mb-4 text-sm text-muted-foreground">
              サビキ釣りに適した釣り場は、漁港や堤防など足場が安定した場所です。潮通しが良く、水深がある程度ある（3m以上）ポイントを選びましょう。海釣り公園や海釣り施設はトイレや売店もあり、初心者やファミリーに最適です。
            </p>

            {sabikiSpots.length > 0 && (
              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sabikiSpots.map((spot) => (
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

          {/* よくある質問 */}
          <SectionCard title="よくある質問（FAQ）" icon={HelpCircle}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. サビキ釣りに最適な時期・シーズンはいつですか？
                </h3>
                <p className="text-sm text-muted-foreground">
                  ベストシーズンは5〜11月です。特に6〜9月の夏場は
                  <Link
                    href="/fish/aji"
                    className="text-primary hover:underline"
                  >
                    アジ
                  </Link>
                  ・
                  <Link
                    href="/fish/saba"
                    className="text-primary hover:underline"
                  >
                    サバ
                  </Link>
                  ・
                  <Link
                    href="/fish/iwashi"
                    className="text-primary hover:underline"
                  >
                    イワシ
                  </Link>
                  の回遊が活発で、初心者でも数釣りが楽しめます。秋は脂の乗った良型アジが狙えるシーズンです。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. サビキ釣りの仕掛けは上カゴ式と下カゴ式どちらがいい？
                </h3>
                <p className="text-sm text-muted-foreground">
                  初心者には下カゴ式がおすすめです。仕掛けの一番下にカゴとオモリが付いているので、投入時に絡みにくく扱いやすいのが特徴。上カゴ式はコマセが上から降り注ぐのでアピール力が高く、深い場所で効果的です。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. サビキの針のサイズは何号がいいですか？
                </h3>
                <p className="text-sm text-muted-foreground">
                  万能なのは4〜6号です。豆アジやイワシなど小型メインなら3〜4号、20cm以上のアジやサバ狙いなら5〜7号を選びましょう。迷ったら5号を選べば幅広く対応できます。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. サビキ釣りで全然釣れないときはどうすればいい？
                </h3>
                <p className="text-sm text-muted-foreground">
                  まずタナ（深さ）を変えてみましょう。底、中層、表層と幅広く探ります。次に仕掛けの種類を変更。それでもダメなら魚がまだ回遊していない可能性があります。朝マヅメや夕マヅメの時合いを狙うのも効果的です。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. コマセは冷凍アミエビとチューブタイプどちらがいい？
                </h3>
                <p className="text-sm text-muted-foreground">
                  冷凍アミエビの方がコスパが良く集魚効果も高いです。ただし解凍の手間と手が汚れるデメリットも。チューブタイプ（アミ姫など）は手が汚れにくく持ち運びも楽。短時間ならチューブ、半日以上なら冷凍がおすすめです。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. サビキ釣りの初期費用はいくらかかる？
                </h3>
                <p className="text-sm text-muted-foreground">
                  サビキ釣りセット（竿・リール・仕掛け付き）が3,000〜5,000円、コマセが300〜600円、バケツやクーラーボックスを含めても約5,000〜10,000円で始められます。まずはセット品で始めて、ハマったら道具をグレードアップしましょう。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. サビキで釣った魚はどうやって持ち帰ればいい？
                </h3>
                <p className="text-sm text-muted-foreground">
                  クーラーボックスに氷と海水を入れた「潮氷」に魚を入れるのがベスト。魚全体が均一に冷えて鮮度が保たれます。詳しくは
                  <Link
                    href="/guide/handling"
                    className="text-primary hover:underline"
                  >
                    魚の締め方・持ち帰りガイド
                  </Link>
                  をご覧ください。
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 片付け */}
          <SectionCard title="片付け・マナー" icon={Trash2}>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    コマセの残りは持ち帰る
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    余ったコマセは海に捨てず、ゴミ袋に入れて持ち帰ります。環境保護と釣り場のマナーです。臭いが気になる場合は二重のゴミ袋に入れましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    仕掛けは丁寧に巻き取る
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    サビキ仕掛けは針が多いので、絡まないように仕掛け巻きに丁寧に巻き取ります。状態が良ければ再利用できることもあります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    釣り場を水で流す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    コマセや魚の汁で汚れた釣り場を、水くみバケツで海水をくんで洗い流します。来たときよりもきれいにして帰りましょう。
                  </p>
                </div>
              </li>
            </ol>
            <Danger>
              釣り場を汚したまま帰ると、釣り禁止になる原因になります。コマセの跡は特に目立つので、必ず海水で洗い流してから帰りましょう。マナーを守ることが、釣り場を守ることにつながります。
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
            サビキ釣りの一連の流れを動画で確認しましょう。
          </p>
          <YouTubeVideoList links={sabikiVideos} />
        </section>

        {/* 道具を揃えるなら */}
        <section className="mt-8 sm:mt-10">
          <ProductList
            products={getProductsByMethod("sabiki")}
            title="サビキ釣りに必要な道具"
            description="サビキ釣りを始めるなら、まずはこれを揃えましょう。セット購入が一番お得です。"
          />
        </section>

        {/* 関連ガイド */}
        <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-center text-xl font-bold">
            関連ガイド
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guide/choinage" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Target className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    ちょい投げ釣り完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    キスやハゼを狙うちょい投げ入門
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/oyogase" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Anchor className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    泳がせ釣り入門ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    サビキで釣ったアジで大物を狙おう
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            サビキ釣りができるスポットを探してみよう
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
