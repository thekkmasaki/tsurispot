import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Fish, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "泳がせ釣り入門ガイド - 生きエサで大物を狙う方法",
  description:
    "泳がせ釣り（のませ釣り）の完全ガイド。サビキで釣ったアジやイワシを生きエサにして、ヒラメ・シーバス・ブリなどの大型魚を狙う方法を解説。仕掛け、タックル、エサの付け方、やり取りのコツまで初心者向けに紹介。",
  openGraph: {
    title: "泳がせ釣り入門ガイド - 生きエサで大物を狙う方法",
    description:
      "サビキで釣った小魚を生きエサにして大物を狙う泳がせ釣りの方法を初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/oyogase",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/oyogase",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
    { "@type": "ListItem", position: 2, name: "釣りの始め方ガイド", item: "https://tsurispot.com/guide" },
    { "@type": "ListItem", position: 3, name: "泳がせ釣り入門ガイド", item: "https://tsurispot.com/guide/oyogase" },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "泳がせ釣りの始め方",
  description: "サビキで釣った小魚を生きエサにして大型魚を狙う泳がせ釣りの方法を解説。",
  totalTime: "PT4H",
  supply: [
    { "@type": "HowToSupply", name: "生きエサ（アジ・イワシなど）" },
    { "@type": "HowToSupply", name: "泳がせ用仕掛け（ハリス5〜8号）" },
    { "@type": "HowToSupply", name: "活かしバケツ" },
  ],
  tool: [
    { "@type": "HowToTool", name: "磯竿3〜4号 4.5〜5.3m またはシーバスロッド" },
    { "@type": "HowToTool", name: "中型スピニングリール 3000〜4000番" },
  ],
  step: [
    { "@type": "HowToStep", name: "エサを確保する", text: "まずサビキ釣りでアジやイワシなどの小魚を確保。活かしバケツでエアレーションして生かしておく。" },
    { "@type": "HowToStep", name: "仕掛けをセットする", text: "泳がせ用の仕掛けをセット。エレベーター式・ウキ式・ぶっこみ式から選ぶ。" },
    { "@type": "HowToStep", name: "エサを付けて投入", text: "アジの背中や鼻にハリを掛け、そっと投入。エサが弱らないよう丁寧に扱う。" },
    { "@type": "HowToStep", name: "アタリを待つ", text: "竿先の変化やドラグの音に注意。最初のアタリで合わせず、しっかり食い込むまで待つ。" },
    { "@type": "HowToStep", name: "やり取りと取り込み", text: "大物がかかったら慌てずドラグを利かせてやり取り。タモ網で取り込む。" },
  ],
};

/* --- SVG図解コンポーネント --- */

function OyogaseRigDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 400"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="泳がせ釣り仕掛け図：竿、道糸、ウキ、ハリス、孫針、活きエサの構成"
        role="img"
      >
        <rect x="0" y="0" width="600" height="400" rx="12" fill="#EFF6FF" />
        <text x="300" y="24" textAnchor="middle" fontSize="14" fill="#1E293B" fontWeight="bold">泳がせ釣り仕掛け図（ウキ式）</text>

        {/* 堤防 */}
        <rect x="0" y="45" width="120" height="355" fill="#D1D5DB" />
        <text x="60" y="70" textAnchor="middle" fontSize="11" fill="#475569" fontWeight="bold">堤防</text>

        {/* 竿 */}
        <line x1="100" y1="55" x2="260" y2="35" stroke="#78716C" strokeWidth="4" strokeLinecap="round" />
        <text x="180" y="30" textAnchor="middle" fontSize="10" fill="#78716C" fontWeight="bold">竿（磯竿3〜4号）</text>

        {/* リール */}
        <ellipse cx="130" cy="60" rx="12" ry="9" fill="#E2E8F0" stroke="#3B82F6" strokeWidth="1.5" />
        <text x="130" y="79" textAnchor="middle" fontSize="8" fill="#3B82F6">リール</text>

        {/* 水面 */}
        <line x1="120" y1="120" x2="600" y2="120" stroke="#60A5FA" strokeWidth="2" strokeDasharray="8 4" />
        <text x="565" y="115" fontSize="10" fill="#60A5FA" fontWeight="bold">水面</text>

        {/* 道糸 */}
        <line x1="260" y1="35" x2="300" y2="120" stroke="#3B82F6" strokeWidth="1.5" />
        <text x="288" y="75" fontSize="9" fill="#3B82F6" fontWeight="bold">道糸</text>
        <text x="288" y="86" fontSize="8" fill="#3B82F6">ナイロン4〜5号</text>

        {/* ウキ */}
        <ellipse cx="300" cy="115" rx="12" ry="20" fill="#EF4444" opacity="0.8" />
        <ellipse cx="300" cy="110" rx="8" ry="5" fill="#FCA5A5" />
        <text x="325" y="115" fontSize="10" fill="#EF4444" fontWeight="bold">ウキ</text>

        {/* ウキ下の糸 */}
        <line x1="300" y1="135" x2="300" y2="180" stroke="#3B82F6" strokeWidth="1.5" />

        {/* サルカン */}
        <rect x="296" y="180" width="8" height="12" rx="2" fill="#64748B" stroke="#475569" strokeWidth="1" />
        <text x="315" y="190" fontSize="8" fill="#64748B" fontWeight="bold">サルカン</text>

        {/* ハリス */}
        <line x1="300" y1="192" x2="300" y2="290" stroke="#60A5FA" strokeWidth="1.5" />
        <text x="315" y="240" fontSize="9" fill="#60A5FA" fontWeight="bold">ハリス</text>
        <text x="315" y="252" fontSize="8" fill="#60A5FA">フロロ5〜8号</text>

        {/* 親針 */}
        <path d="M300,290 Q310,298 305,303 Q298,308 295,300" stroke="#F59E0B" strokeWidth="2" fill="none" />
        <text x="318" y="302" fontSize="9" fill="#F59E0B" fontWeight="bold">親針</text>

        {/* 活きエサ（アジ） */}
        <ellipse cx="360" cy="295" rx="40" ry="18" fill="#93C5FD" opacity="0.4" stroke="#3B82F6" strokeWidth="1.5" />
        {/* 尾 */}
        <polygon points="395,290 415,280 415,310 395,300" fill="#93C5FD" opacity="0.4" stroke="#3B82F6" strokeWidth="1" />
        {/* 目 */}
        <circle cx="335" cy="293" r="3" fill="white" stroke="#475569" strokeWidth="1" />
        <circle cx="335" cy="293" r="1.5" fill="#475569" />
        <text x="360" y="328" textAnchor="middle" fontSize="10" fill="#3B82F6" fontWeight="bold">活きエサ（アジ）</text>

        {/* 孫針ライン */}
        <line x1="305" y1="300" x2="380" y2="308" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 2" />
        <path d="M380,308 Q390,315 385,320 Q378,324 375,316" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
        <text x="395" y="320" fontSize="8" fill="#F59E0B">孫針（トレブル）</text>

        {/* エサが泳ぐ矢印 */}
        <path d="M410,295 Q430,280 420,265" stroke="#22C55E" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
        <polygon points="418,268 425,262 422,272" fill="#22C55E" />
        <text x="445" y="275" fontSize="9" fill="#22C55E">泳ぐ方向</text>

        {/* 海底 */}
        <path d="M120,370 Q200,355 300,365 Q400,375 500,360 Q550,355 600,365" stroke="#D4A574" strokeWidth="2" fill="#F5DEB3" opacity="0.4" />
        <text x="450" y="385" fontSize="10" fill="#A0845C">海底</text>

        {/* タナ説明 */}
        <line x1="250" y1="120" x2="250" y2="290" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 3" />
        <text x="240" y="205" textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="bold">タナ</text>
        <text x="240" y="217" textAnchor="end" fontSize="8" fill="#94A3B8">（ウキ下の長さ）</text>
      </svg>
    </div>
  );
}

function BaitHookingDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 560 240"
        width="100%"
        style={{ maxWidth: 560 }}
        aria-label="エサの付け方図：鼻掛けと背掛けの2パターン"
        role="img"
      >
        <rect x="0" y="0" width="560" height="240" rx="12" fill="#F9FAFB" />
        <text x="280" y="24" textAnchor="middle" fontSize="14" fill="#1E293B" fontWeight="bold">エサの付け方（アジの場合）</text>

        {/* 鼻掛け（左） */}
        <rect x="20" y="38" width="250" height="190" rx="10" fill="white" stroke="#3B82F6" strokeWidth="2" />
        <rect x="20" y="38" width="250" height="30" rx="10" fill="#3B82F6" />
        <rect x="20" y="56" width="250" height="12" fill="#3B82F6" />
        <text x="145" y="58" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">鼻掛け（おすすめ）</text>

        {/* アジ（鼻掛け） */}
        <ellipse cx="145" cy="130" rx="60" ry="25" fill="#93C5FD" opacity="0.3" stroke="#3B82F6" strokeWidth="1.5" />
        <polygon points="200,122 230,110 230,150 200,138" fill="#93C5FD" opacity="0.3" stroke="#3B82F6" strokeWidth="1" />
        {/* 目 */}
        <circle cx="100" cy="126" r="5" fill="white" stroke="#475569" strokeWidth="1" />
        <circle cx="100" cy="126" r="2" fill="#475569" />
        {/* 鼻の穴に針 */}
        <circle cx="82" cy="130" r="3" fill="#EF4444" opacity="0.3" />
        <path d="M82,126 Q75,132 80,137" stroke="#EF4444" strokeWidth="2" fill="none" />
        <line x1="82" y1="126" x2="82" y2="100" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* 矢印で鼻の穴を指す */}
        <text x="75" y="95" textAnchor="middle" fontSize="9" fill="#EF4444" fontWeight="bold">針を通す</text>

        <text x="145" y="175" textAnchor="middle" fontSize="10" fill="#334155">鼻の穴にハリを通す</text>
        <text x="145" y="190" textAnchor="middle" fontSize="10" fill="#22C55E" fontWeight="bold">自然に泳ぎやすく長持ち</text>
        <text x="145" y="206" textAnchor="middle" fontSize="9" fill="#64748B">最もポピュラーな付け方</text>
        <text x="145" y="220" textAnchor="middle" fontSize="9" fill="#3B82F6">泳ぎの自由度が高い</text>

        {/* 背掛け（右） */}
        <rect x="290" y="38" width="250" height="190" rx="10" fill="white" stroke="#22C55E" strokeWidth="2" />
        <rect x="290" y="38" width="250" height="30" rx="10" fill="#22C55E" />
        <rect x="290" y="56" width="250" height="12" fill="#22C55E" />
        <text x="415" y="58" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">背掛け</text>

        {/* アジ（背掛け） */}
        <ellipse cx="415" cy="130" rx="60" ry="25" fill="#86EFAC" opacity="0.2" stroke="#22C55E" strokeWidth="1.5" />
        <polygon points="470,122 500,110 500,150 470,138" fill="#86EFAC" opacity="0.2" stroke="#22C55E" strokeWidth="1" />
        {/* 目 */}
        <circle cx="370" cy="126" r="5" fill="white" stroke="#475569" strokeWidth="1" />
        <circle cx="370" cy="126" r="2" fill="#475569" />
        {/* 背ビレ下に針 */}
        <line x1="415" y1="105" x2="415" y2="112" stroke="#94A3B8" strokeWidth="1" />
        <line x1="420" y1="105" x2="420" y2="110" stroke="#94A3B8" strokeWidth="1" />
        <line x1="410" y1="105" x2="410" y2="112" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="415" cy="115" r="3" fill="#EF4444" opacity="0.3" />
        <path d="M415,112 Q408,118 413,123" stroke="#EF4444" strokeWidth="2" fill="none" />
        <line x1="415" y1="112" x2="415" y2="90" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="415" y="86" textAnchor="middle" fontSize="9" fill="#EF4444" fontWeight="bold">針を刺す</text>

        <text x="415" y="175" textAnchor="middle" fontSize="10" fill="#334155">背ビレの下にハリを刺す</text>
        <text x="415" y="190" textAnchor="middle" fontSize="10" fill="#F59E0B" fontWeight="bold">フッキング率が高い</text>
        <text x="415" y="206" textAnchor="middle" fontSize="9" fill="#64748B">エサが暴れにくい</text>
        <text x="415" y="220" textAnchor="middle" fontSize="9" fill="#EF4444">やや弱りやすい点に注意</text>
      </svg>
    </div>
  );
}

function OyogaseWaitDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 600 280"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="泳がせ釣りの待ち方図：活きエサが泳ぐ範囲と大物が寄ってくるイメージ"
        role="img"
      >
        <rect x="0" y="0" width="600" height="280" rx="12" fill="#EFF6FF" />
        <text x="300" y="24" textAnchor="middle" fontSize="14" fill="#1E293B" fontWeight="bold">泳がせ釣りのイメージ</text>

        {/* 堤防 */}
        <rect x="0" y="35" width="80" height="245" fill="#D1D5DB" />
        <text x="40" y="55" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">堤防</text>
        {/* 釣り人シルエット */}
        <circle cx="65" cy="48" r="6" fill="#475569" />
        <line x1="65" y1="54" x2="65" y2="72" stroke="#475569" strokeWidth="2" />
        <line x1="65" y1="60" x2="55" y2="55" stroke="#475569" strokeWidth="1.5" />
        <line x1="65" y1="60" x2="90" y2="50" stroke="#475569" strokeWidth="1.5" />
        {/* 竿 */}
        <line x1="90" y1="50" x2="160" y2="38" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />

        {/* 水面 */}
        <path d="M80,85 Q140,80 200,87 Q260,94 320,85 Q380,76 440,87 Q500,95 560,85 Q580,82 600,87" stroke="#60A5FA" strokeWidth="2" fill="none" />
        <text x="570" y="82" fontSize="9" fill="#60A5FA">水面</text>

        {/* 道糸 */}
        <line x1="160" y1="38" x2="200" y2="87" stroke="#3B82F6" strokeWidth="1.5" />

        {/* ウキ */}
        <ellipse cx="200" cy="84" rx="8" ry="14" fill="#EF4444" opacity="0.8" />

        {/* ハリス */}
        <line x1="200" y1="98" x2="230" y2="160" stroke="#60A5FA" strokeWidth="1" />

        {/* 活きエサ（アジ）が泳ぐ範囲 */}
        <ellipse cx="280" cy="160" rx="80" ry="50" fill="#3B82F6" opacity="0.06" stroke="#3B82F6" strokeWidth="1" strokeDasharray="5 3" />
        <text x="280" y="210" textAnchor="middle" fontSize="9" fill="#3B82F6">エサが泳ぐ範囲</text>

        {/* 活きエサ */}
        <ellipse cx="260" cy="155" rx="18" ry="8" fill="#93C5FD" opacity="0.5" stroke="#3B82F6" strokeWidth="1" />
        <circle cx="247" cy="153" r="2" fill="#475569" />
        <text x="260" y="145" textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="bold">アジ</text>
        {/* 泳ぎの軌跡 */}
        <path d="M240,158 Q260,170 280,155 Q300,140 310,155" stroke="#60A5FA" strokeWidth="1" fill="none" strokeDasharray="3 2" opacity="0.5" />

        {/* 大物が寄ってくる */}
        {/* シーバス */}
        <ellipse cx="470" cy="155" rx="50" ry="22" fill="#64748B" opacity="0.2" stroke="#475569" strokeWidth="1.5" />
        <polygon points="515,148 545,135 545,175 515,162" fill="#64748B" opacity="0.2" stroke="#475569" strokeWidth="1" />
        <circle cx="430" cy="150" r="5" fill="white" stroke="#475569" strokeWidth="1" />
        <circle cx="430" cy="150" r="2.5" fill="#475569" />
        <text x="470" y="190" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="bold">大物（シーバス）</text>

        {/* 接近矢印 */}
        <path d="M420,155 Q380,155 340,158" stroke="#EF4444" strokeWidth="2" fill="none" markerEnd="url(#arrowOyogase)" />
        <text x="380" y="145" textAnchor="middle" fontSize="9" fill="#EF4444" fontWeight="bold">エサを追って接近！</text>

        <defs>
          <marker id="arrowOyogase" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#EF4444" />
          </marker>
        </defs>

        {/* 海底 */}
        <path d="M80,250 Q180,240 280,248 Q380,256 480,245 Q540,240 600,248" stroke="#D4A574" strokeWidth="2" fill="#F5DEB3" opacity="0.3" />

        {/* コツの吹き出し */}
        <rect x="350" y="225" width="240" height="45" rx="8" fill="white" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="470" y="243" textAnchor="middle" fontSize="10" fill="#F59E0B" fontWeight="bold">コツ：最初のアタリで合わせない！</text>
        <text x="470" y="258" textAnchor="middle" fontSize="9" fill="#64748B">食い込むまでじっくり待つ</text>
      </svg>
    </div>
  );
}

export default function OyogasePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      <Breadcrumb items={[
        { label: "ホーム", href: "/" },
        { label: "ガイド", href: "/guide" },
        { label: "泳がせ釣りガイド" },
      ]} />

      <Link href="/guide" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="size-4" />
        ガイド一覧に戻る
      </Link>

      <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
        泳がせ釣り入門ガイド
      </h1>
      <p className="mb-8 text-sm text-muted-foreground sm:text-base">
        サビキで釣ったアジやイワシをそのまま生きエサに！
        ヒラメ・シーバス・ブリクラスの大物が堤防から狙える、ロマン溢れる釣り方です。
      </p>

      {/* なぜおすすめ？ */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">泳がせ釣りがおすすめな理由</h2>
        <Card className="border-green-200 bg-green-50/50 py-0">
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span><strong>サビキ釣りの延長で大物が狙える</strong> — サビキで釣ったアジをそのまま使うので、追加の餌代がほぼゼロ</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span><strong>生きエサの食わせ力は最強</strong> — ルアーでは食わない魚も、本物の魚には反応する。食い渋りの日でも釣果が出やすい</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span><strong>テクニック不要で待つだけ</strong> — エサを投入したらあとは待つだけ。ルアーのアクション技術は不要</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                <span><strong>堤防からでも大型が狙える</strong> — ヒラメ60cm、シーバス80cm、ブリ(メジロ)クラスも現実的なターゲット</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 狙える魚 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">泳がせ釣りで狙える魚</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { name: "ヒラメ", slug: "hirame", desc: "砂地底の高級魚" },
            { name: "シーバス", slug: "seabass", desc: "港湾・河口で狙える" },
            { name: "ブリ・イナダ", slug: "buri", desc: "回遊次第で大物" },
            { name: "マゴチ", slug: "magochi", desc: "砂底のフラットフィッシュ" },
            { name: "アオリイカ", slug: "aoriika", desc: "ウキ泳がせで狙う" },
            { name: "ハタ類", slug: "hata", desc: "根周りの高級根魚" },
          ].map((fish) => (
            <Link key={fish.slug} href={`/fish/${fish.slug}`} className="group">
              <Card className="h-full py-0 transition-shadow hover:shadow-md">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Fish className="size-4 text-blue-500" />
                    <span className="text-sm font-bold group-hover:text-primary">{fish.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{fish.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 必要なタックル */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">必要なタックル・道具</h2>
        <Card className="py-0">
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-4 font-semibold">道具</th>
                    <th className="pb-2 font-semibold">おすすめスペック</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">竿</td>
                    <td className="py-2.5">磯竿3〜4号 4.5〜5.3m（万能竿でもOK）</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">リール</td>
                    <td className="py-2.5">中型スピニング 3000〜4000番（ドラグ性能重視）</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">道糸</td>
                    <td className="py-2.5">ナイロン4〜5号 または PE1.5〜2号</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">ハリス</td>
                    <td className="py-2.5">フロロカーボン 5〜8号（1〜1.5m）</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">ハリ</td>
                    <td className="py-2.5">チヌ針4〜6号 or 泳がせ専用針</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2.5 pr-4 font-medium">活かしバケツ</td>
                    <td className="py-2.5">エアポンプ付き（エサを元気に保つため必須）</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-medium">タモ網</td>
                    <td className="py-2.5">5m以上の柄が理想（堤防の高さに合わせる）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 泳がせ釣り仕掛け図 */}
      <OyogaseRigDiagram />

      {/* 仕掛けの種類 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">泳がせ釣りの仕掛け3タイプ</h2>
        <div className="space-y-4">
          <Card className="border-blue-200 py-0">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-2 text-base font-bold text-blue-800">1. ウキ泳がせ式（初心者おすすめ）</h3>
              <p className="mb-2 text-sm text-gray-700">
                大きめのウキを使ってエサの動きを目視で確認できる方式。アタリが一目でわかるので初心者に最適。
                タナ（水深）の調整も自由にできます。
              </p>
              <p className="text-xs text-muted-foreground">
                おすすめ状況：中層を回遊するシーバスやブリ系、アオリイカ狙い
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 py-0">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-2 text-base font-bold text-green-800">2. エレベーター式（万能型）</h3>
              <p className="mb-2 text-sm text-gray-700">
                オモリを先に投入してから、スナップサルカンにエサ付き仕掛けを後付けして道糸を滑らせて送り込む方式。
                エサを弱らせずに遠くのポイントまで送れるのが最大の利点。
              </p>
              <p className="text-xs text-muted-foreground">
                おすすめ状況：テトラ際や沖のポイントを狙う場合。ヒラメ・マゴチに有効
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 py-0">
            <CardContent className="p-4 sm:p-6">
              <h3 className="mb-2 text-base font-bold text-amber-800">3. ぶっこみ式（シンプル）</h3>
              <p className="mb-2 text-sm text-gray-700">
                中通しオモリとハリだけのシンプルな仕掛け。エサを底付近で泳がせる。
                仕掛けが最もシンプルなのでトラブルが少なく、ヒラメ・マゴチなどの底物に特化。
              </p>
              <p className="text-xs text-muted-foreground">
                おすすめ状況：砂底の堤防でヒラメ・マゴチを狙う場合
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* エサの付け方図 */}
      <BaitHookingDiagram />

      {/* エサの付け方 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">エサの付け方</h2>
        <Card className="py-0">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="space-y-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm font-bold text-blue-900">鼻掛け（おすすめ）</p>
                <p className="mt-1 text-xs text-blue-800">
                  アジの鼻の穴にハリを通す方法。エサが自然に泳ぎやすく長持ちする。最も一般的な付け方。
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-sm font-bold text-green-900">背掛け</p>
                <p className="mt-1 text-xs text-green-800">
                  背ビレの下にハリを刺す方法。エサが暴れにくく、フッキング率が高い。ただし弱りやすい。
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-sm font-bold text-amber-900">尾掛け</p>
                <p className="mt-1 text-xs text-amber-800">
                  尾ビレの付け根にハリを刺す方法。エサが逃げようと必死に泳ぐためアピール力大。ただし外れやすい。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 泳がせの待ち方図 */}
      <OyogaseWaitDiagram />

      {/* 釣り方のコツ */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">泳がせ釣りのコツ</h2>
        <Card className="border-amber-200 bg-amber-50/30 py-0">
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">1.</span>
                <span><strong>エサは元気なものを使う</strong> — 弱ったエサは大型魚の反応が悪い。こまめにエサを交換し、活かしバケツの水も定期的に入れ替える</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">2.</span>
                <span><strong>最初のアタリで合わせない</strong> — 大型魚はまずエサを咥えて走り、止まってから飲み込む。「走って止まった」タイミングで大きく合わせる</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">3.</span>
                <span><strong>ドラグは緩めにセット</strong> — 大物がかかった時にラインが切れないよう、ドラグは手で引っ張ってジワッと出るくらいに設定</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">4.</span>
                <span><strong>サビキ竿と泳がせ竿を2本出す</strong> — サビキでエサを確保しながら、もう1本で泳がせ。効率的に釣果を上げるコツ</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-amber-700">5.</span>
                <span><strong>朝マズメ・夕マズメが最もチャンス</strong> — フィッシュイーターの活性が上がる時間帯。この時間にエサが準備できているように逆算する</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 注意点 */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold sm:text-2xl">注意点</h2>
        <Card className="border-red-200 bg-red-50/30 py-0">
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <span><strong>タモ網は必ず用意する</strong> — 大物は抜き上げると竿が折れるかラインが切れます</span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <span><strong>置き竿にする場合はドラグフリーで</strong> — 突然の大物に竿ごと海に引き込まれる事故があります。尻手ロープも必須</span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <span><strong>周囲の釣り人に配慮</strong> — エサが横に走って隣の方の仕掛けと絡むことがあるので、混雑時は控えめに</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 関連ガイド */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <h2 className="mb-4 text-lg font-bold">関連ガイド</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/guide/sabiki" className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md">
            <p className="font-semibold group-hover:text-primary">サビキ釣りガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">エサ確保の基本</p>
          </Link>
          <Link href="/guide/rigs" className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md">
            <p className="font-semibold group-hover:text-primary">仕掛け図解ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">基本仕掛けの作り方</p>
          </Link>
          <Link href="/guide/handling" className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md">
            <p className="font-semibold group-hover:text-primary">魚の締め方ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">大物を美味しく持ち帰る</p>
          </Link>
        </div>
      </div>

      {/* LINE登録バナー */}
      <div className="mt-8 sm:mt-12">
        <LineBanner variant="compact" />
      </div>
    </main>
  );
}
