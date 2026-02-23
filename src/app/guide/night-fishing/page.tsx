import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Flashlight, Fish, ShieldAlert, MapPin, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "夜釣り入門ガイド - 必要装備・釣れる魚・安全対策を解説",
  description:
    "夜釣り初心者のための入門ガイド。ヘッドライトやケミホタルなど必要な装備、夜に釣れる魚種、安全対策、常夜灯周りのポイント、夜釣りのマナーまで詳しく解説。",
  openGraph: {
    title: "夜釣り入門ガイド - 必要装備・釣れる魚・安全対策を解説",
    description:
      "夜釣りの装備・釣れる魚・安全対策・マナーを初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/night-fishing",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/night-fishing",
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
      name: "夜釣り入門ガイド",
      item: "https://tsurispot.com/guide/night-fishing",
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

/* 夜釣りの装備チェックリスト図 */
function NightFishingEquipmentDiagram() {
  return (
    <div className="my-6">
      <p className="mb-2 text-sm font-medium text-center text-muted-foreground">夜釣り必須装備チェックリスト</p>
      <svg
        viewBox="0 0 700 260"
        width="100%"
        style={{ maxWidth: 700 }}
        aria-label="夜釣りに必要な装備をアイコンと名称で配置した図。ヘッドライト、ケミホタル、ライフジャケット、防寒着、ランタン、虫よけの6つ。"
        className="mx-auto"
      >
        <rect x="0" y="0" width="700" height="260" rx="8" fill="#1E293B" />
        <text x="350" y="28" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#FBBF24">夜釣りの必須装備</text>

        {/* Row 1 */}
        {/* ヘッドライト */}
        <g>
          <rect x="20" y="45" width="200" height="90" rx="6" fill="#334155" stroke="#FBBF24" strokeWidth="1.5" />
          {/* ライトアイコン */}
          <circle cx="65" cy="85" r="18" fill="#FBBF24" opacity="0.2" stroke="#FBBF24" strokeWidth="1.5" />
          <line x1="65" y1="67" x2="65" y2="58" stroke="#FBBF24" strokeWidth="1.5" />
          <line x1="50" y1="72" x2="44" y2="66" stroke="#FBBF24" strokeWidth="1.2" />
          <line x1="80" y1="72" x2="86" y2="66" stroke="#FBBF24" strokeWidth="1.2" />
          <line x1="47" y1="85" x2="40" y2="85" stroke="#FBBF24" strokeWidth="1.2" />
          <line x1="83" y1="85" x2="90" y2="85" stroke="#FBBF24" strokeWidth="1.2" />
          <circle cx="65" cy="85" r="6" fill="#FBBF24" />
          <text x="145" y="78" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#FBBF24">ヘッドライト</text>
          <text x="145" y="94" textAnchor="middle" fontSize="9" fill="#94A3B8">200~400lm / 赤色LED付</text>
          <text x="145" y="108" textAnchor="middle" fontSize="9" fill="#94A3B8">予備電池も忘れずに</text>
          <text x="210" y="57" textAnchor="end" fontSize="10" fontWeight="bold" fill="#EF4444">必須</text>
        </g>

        {/* ケミホタル */}
        <g>
          <rect x="240" y="45" width="200" height="90" rx="6" fill="#334155" stroke="#22C55E" strokeWidth="1.5" />
          {/* ケミホタルアイコン（棒状の発光体） */}
          <rect x="280" y="72" width="30" height="8" rx="4" fill="#22C55E" opacity="0.6" stroke="#22C55E" strokeWidth="1" />
          {/* 発光表現 */}
          <circle cx="295" cy="76" r="15" fill="#22C55E" opacity="0.1" />
          <circle cx="295" cy="76" r="22" fill="#22C55E" opacity="0.05" />
          <text x="375" y="78" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#22C55E">ケミホタル</text>
          <text x="375" y="94" textAnchor="middle" fontSize="9" fill="#94A3B8">竿先やウキに装着</text>
          <text x="375" y="108" textAnchor="middle" fontSize="9" fill="#94A3B8">25/37/50mm各サイズ</text>
          <text x="430" y="57" textAnchor="end" fontSize="10" fontWeight="bold" fill="#EF4444">必須</text>
        </g>

        {/* ライフジャケット */}
        <g>
          <rect x="460" y="45" width="220" height="90" rx="6" fill="#334155" stroke="#EF4444" strokeWidth="1.5" />
          {/* ベストアイコン */}
          <path d="M505,70 L495,90 L500,105 L520,105 L525,90 L515,70 Z" fill="#EF4444" opacity="0.3" stroke="#EF4444" strokeWidth="1.5" />
          <line x1="510" y1="70" x2="510" y2="105" stroke="#EF4444" strokeWidth="1" />
          <text x="600" y="78" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#EF4444">ライフジャケット</text>
          <text x="600" y="94" textAnchor="middle" fontSize="9" fill="#94A3B8">暗闇の落水は命に関わる</text>
          <text x="600" y="108" textAnchor="middle" fontSize="9" fill="#94A3B8">自動膨張式でもOK</text>
          <text x="670" y="57" textAnchor="end" fontSize="10" fontWeight="bold" fill="#EF4444">必須</text>
        </g>

        {/* Row 2 */}
        {/* 防寒着 */}
        <g>
          <rect x="20" y="150" width="200" height="90" rx="6" fill="#334155" stroke="#60A5FA" strokeWidth="1.5" />
          {/* 上着アイコン */}
          <path d="M55,175 L45,195 L50,210 L80,210 L85,195 L75,175 Z" fill="#60A5FA" opacity="0.3" stroke="#60A5FA" strokeWidth="1.5" />
          <line x1="65" y1="175" x2="65" y2="210" stroke="#60A5FA" strokeWidth="1" />
          <text x="145" y="188" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#60A5FA">防寒着・手袋</text>
          <text x="145" y="204" textAnchor="middle" fontSize="9" fill="#94A3B8">夜は気温が急激に低下</text>
          <text x="145" y="218" textAnchor="middle" fontSize="9" fill="#94A3B8">指先カットグローブが便利</text>
        </g>

        {/* ランタン */}
        <g>
          <rect x="240" y="150" width="200" height="90" rx="6" fill="#334155" stroke="#F59E0B" strokeWidth="1.5" />
          {/* ランタンアイコン */}
          <rect x="282" y="180" width="16" height="20" rx="3" fill="#F59E0B" opacity="0.3" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="285" y1="180" x2="285" y2="174" stroke="#F59E0B" strokeWidth="1" />
          <line x1="295" y1="180" x2="295" y2="174" stroke="#F59E0B" strokeWidth="1" />
          <line x1="285" y1="174" x2="295" y2="174" stroke="#F59E0B" strokeWidth="1" />
          <circle cx="290" cy="190" r="5" fill="#FBBF24" opacity="0.5" />
          <text x="375" y="188" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F59E0B">ランタン</text>
          <text x="375" y="204" textAnchor="middle" fontSize="9" fill="#94A3B8">足元照明・作業用</text>
          <text x="375" y="218" textAnchor="middle" fontSize="9" fill="#94A3B8">海面に向けないこと</text>
        </g>

        {/* 虫よけ */}
        <g>
          <rect x="460" y="150" width="220" height="90" rx="6" fill="#334155" stroke="#A78BFA" strokeWidth="1.5" />
          {/* スプレーアイコン */}
          <rect x="500" y="180" width="14" height="24" rx="3" fill="#A78BFA" opacity="0.3" stroke="#A78BFA" strokeWidth="1.5" />
          <rect x="503" y="175" width="8" height="6" rx="1" fill="#A78BFA" opacity="0.5" />
          {/* スプレー噴射 */}
          <circle cx="510" y="170" r="2" fill="#A78BFA" opacity="0.3" />
          <circle cx="515" y="167" r="1.5" fill="#A78BFA" opacity="0.2" />
          <text x="600" y="188" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#A78BFA">虫よけスプレー</text>
          <text x="600" y="204" textAnchor="middle" fontSize="9" fill="#94A3B8">夏場は蚊・ブヨ対策</text>
          <text x="600" y="218" textAnchor="middle" fontSize="9" fill="#94A3B8">蚊取り線香も有効</text>
        </g>
      </svg>
    </div>
  );
}

/* ケミホタルの取り付け図 */
function ChemiLightDiagram() {
  return (
    <div className="my-6">
      <p className="mb-2 text-sm font-medium text-center text-muted-foreground">ケミホタルの取り付け方</p>
      <svg
        viewBox="0 0 700 200"
        width="100%"
        style={{ maxWidth: 700 }}
        aria-label="ケミホタルをウキと竿先に取り付ける方法を示す図。ウキのスリットに差し込む方法と竿先にテープで固定する方法。"
        className="mx-auto"
      >
        <rect x="0" y="0" width="700" height="200" rx="8" fill="#EFF6FF" />

        {/* Step 1: 折って発光させる */}
        <g>
          <rect x="10" y="10" width="200" height="180" rx="6" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="110" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E40AF">Step 1: 発光させる</text>
          {/* ケミホタル棒 */}
          <rect x="60" y="60" width="100" height="14" rx="7" fill="#D1FAE5" stroke="#22C55E" strokeWidth="1.5" />
          {/* 折り位置マーク */}
          <line x1="110" y1="55" x2="110" y2="80" stroke="#EF4444" strokeWidth="1" strokeDasharray="3,2" />
          <text x="110" y="50" textAnchor="middle" fontSize="9" fill="#EF4444">ここを折る</text>
          {/* 矢印 */}
          <path d="M90,90 C90,110 110,110 110,95" stroke="#6B7280" strokeWidth="1" fill="none" markerEnd="url(#arrowNF)" />
          <path d="M130,90 C130,110 110,110 110,95" stroke="#6B7280" strokeWidth="1" fill="none" />
          {/* 発光状態 */}
          <rect x="60" y="130" width="100" height="14" rx="7" fill="#22C55E" opacity="0.6" stroke="#22C55E" strokeWidth="1.5" />
          <circle cx="110" cy="137" r="20" fill="#22C55E" opacity="0.1" />
          <text x="110" y="165" textAnchor="middle" fontSize="9" fill="#22C55E">パキッと折ると発光</text>
          <defs>
            <marker id="arrowNF" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#6B7280" />
            </marker>
          </defs>
        </g>

        {/* Step 2: ウキに装着 */}
        <g>
          <rect x="230" y="10" width="220" height="180" rx="6" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="340" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E40AF">Step 2a: ウキに装着</text>
          {/* ウキ本体 */}
          <ellipse cx="340" cy="110" rx="20" ry="35" fill="#EF4444" opacity="0.2" stroke="#EF4444" strokeWidth="2" />
          {/* ウキのトップ */}
          <line x1="340" y1="75" x2="340" y2="55" stroke="#EF4444" strokeWidth="2" />
          {/* ケミホタルスロット */}
          <rect x="335" y="55" width="10" height="22" rx="2" fill="#22C55E" opacity="0.6" stroke="#22C55E" strokeWidth="1" />
          {/* 発光表現 */}
          <circle cx="340" cy="66" r="12" fill="#22C55E" opacity="0.1" />
          {/* ケミホタルをスロットに差し込む矢印 */}
          <rect x="370" y="50" width="25" height="8" rx="4" fill="#22C55E" opacity="0.5" stroke="#22C55E" strokeWidth="1" />
          <path d="M370,54 L350,54" stroke="#6B7280" strokeWidth="1" markerEnd="url(#arrowNF)" />
          <text x="400" y="57" fontSize="8" fill="#6B7280">差し込む</text>
          {/* ライン */}
          <line x1="340" y1="145" x2="340" y2="170" stroke="#3B82F6" strokeWidth="1.5" />
          <text x="340" y="185" textAnchor="middle" fontSize="9" fill="#6B7280">ウキのトップに差し込む</text>
        </g>

        {/* Step 3: 竿先に装着 */}
        <g>
          <rect x="470" y="10" width="220" height="180" rx="6" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="580" y="30" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1E40AF">Step 2b: 竿先に装着</text>
          {/* 竿先 */}
          <line x1="490" y1="100" x2="670" y2="100" stroke="#6B7280" strokeWidth="3" />
          <line x1="670" y1="100" x2="680" y2="100" stroke="#6B7280" strokeWidth="2" />
          {/* ケミホタル */}
          <rect x="630" y="85" width="30" height="10" rx="5" fill="#22C55E" opacity="0.6" stroke="#22C55E" strokeWidth="1" />
          {/* 発光表現 */}
          <circle cx="645" cy="90" r="14" fill="#22C55E" opacity="0.1" />
          {/* テープ */}
          <rect x="632" y="95" width="26" height="4" rx="1" fill="#94A3B8" opacity="0.6" />
          <rect x="632" y="81" width="26" height="4" rx="1" fill="#94A3B8" opacity="0.6" />
          <text x="645" y="75" textAnchor="middle" fontSize="8" fill="#6B7280">テープで固定</text>
          {/* ガイド */}
          <circle cx="540" cy="100" r="4" fill="none" stroke="#6B7280" strokeWidth="1" />
          <circle cx="580" cy="100" r="3.5" fill="none" stroke="#6B7280" strokeWidth="1" />
          <circle cx="610" cy="100" r="3" fill="none" stroke="#6B7280" strokeWidth="1" />
          <text x="580" y="130" textAnchor="middle" fontSize="9" fill="#6B7280">竿先（穂先）にテープで巻く</text>
          <text x="580" y="145" textAnchor="middle" fontSize="9" fill="#6B7280">アタリの視認に使用</text>
        </g>
      </svg>
    </div>
  );
}

export default function NightFishingGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* パンくず */}
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
            夜釣り入門ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            夜ならではの魚が狙える、静かで特別な釣り体験を楽しみましょう。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">夜釣りの魅力：</span>
          夜行性の魚が活発に動き出す夜は、日中とは異なるターゲットが狙えます。人が少なく静かな環境で、大物がヒットするチャンスも増加。涼しい夏の夜釣りは特に人気があります。
        </div>

        <div className="space-y-6">
          {/* 必要な装備 */}
          <SectionCard title="必要な装備" icon={Flashlight}>
            <NightFishingEquipmentDiagram />
            <p className="mb-4 text-sm text-muted-foreground">
              夜釣りでは昼間の装備に加えて、暗闘対策の道具が必要です。事前にしっかり準備しましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ヘッドライト（必須）</span>
                  &nbsp;&mdash;&nbsp;両手が自由に使えるヘッドライトは夜釣りの必需品。明るさ200〜400ルーメンが目安。赤色LEDモードがあると、魚を警戒させずに手元を照らせます。予備の電池も忘れずに。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ケミホタル（ケミカルライト）</span>
                  &nbsp;&mdash;&nbsp;折ると発光する使い捨てライト。竿先やウキに取り付けてアタリを目視します。25mm、37mm、50mmなどサイズがあり、竿先用には25mmが一般的です。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">電気ウキ</span>
                  &nbsp;&mdash;&nbsp;LEDで発光するウキ。夜のウキ釣りには必須。赤、緑、白などの色があり、周囲の釣り人と色を変えると自分のウキがわかりやすくなります。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ランタン・投光器</span>
                  &nbsp;&mdash;&nbsp;足元を照らすための固定光源。作業時に便利ですが、常に海面を照らし続けると魚が散る可能性があるので注意。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">防寒着・フィッシンググローブ</span>
                  &nbsp;&mdash;&nbsp;夜は昼間より気温がぐっと下がります。夏でも海沿いは風が冷たいため、上着を1枚持っていきましょう。冬の夜釣りは防寒装備が生命線です。指先が出るタイプのフィッシンググローブがあると操作性と防寒を両立できます。
                  <a href="https://amzn.to/3ZOdinM" target="_blank" rel="noopener noreferrer" className="ml-1 text-xs font-medium text-blue-600 hover:underline">おすすめの手袋を見る &rarr;</a>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ライフジャケット</span>
                  &nbsp;&mdash;&nbsp;暗闇では足元が見えにくく、落水のリスクが日中より高まります。必ず着用してください。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">虫よけスプレー</span>
                  &nbsp;&mdash;&nbsp;夏場は蚊やブヨが多いため必須。虫よけリングや蚊取り線香もあると安心です。
                </span>
              </div>
            </div>

            <Hint>
              ヘッドライトは釣りの最中は消しておくか赤色モードにしましょう。白い光で海面を照らすと魚が驚いて散ってしまいます。手元の作業時だけ点灯するのがマナーです。
            </Hint>

            <ChemiLightDiagram />
          </SectionCard>

          {/* 夜に釣れる魚種 */}
          <SectionCard title="夜に釣れる魚種" icon={Fish}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜行性の魚は夜になると活発にエサを捕食します。夜釣りならではのターゲットを紹介します。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">メバル</h3>
                <p className="text-sm text-muted-foreground">
                  夜釣りの代表的なターゲット。常夜灯の明暗部に潜み、プランクトンに集まる小魚を捕食します。ルアー（メバリング）でもウキ釣りでも狙えます。冬〜春がベストシーズン。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">アジ</h3>
                <p className="text-sm text-muted-foreground">
                  常夜灯周りに集まる習性があり、夜のアジング（ルアー）やサビキ釣りが人気。群れで回遊するため、回ってくれば連続ヒットが期待できます。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">シーバス（スズキ）</h3>
                <p className="text-sm text-muted-foreground">
                  夜になると浅場に出てきてエサを漁る、ナイトゲームの人気ターゲット。常夜灯の明暗の境目や橋脚周りがポイント。ミノーやバイブレーションで狙います。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">アオリイカ</h3>
                <p className="text-sm text-muted-foreground">
                  ナイトエギングで狙うアオリイカ。日中よりも浅場に寄ってくるため、岸からの射程内に入りやすい。常夜灯周りが好ポイントです。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">タチウオ</h3>
                <p className="text-sm text-muted-foreground">
                  夕方から夜にかけて接岸するタチウオは、ケミホタル付きのテンヤ仕掛けやルアーで狙います。鋭い歯を持つため、ワイヤーリーダーが必要。秋が最盛期です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">カサゴ・アカハタなど根魚</h3>
                <p className="text-sm text-muted-foreground">
                  根魚は夜になると岩から出てきてエサを探します。穴釣りやルアーのワーム釣りで狙えます。日中より警戒心が薄れ、食い気が増します。
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 安全対策 */}
          <SectionCard title="安全対策" icon={ShieldAlert}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜釣りは昼間以上に安全への配慮が必要です。以下の点を必ず守りましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">明るいうちに下見する</span>
                  &nbsp;&mdash;&nbsp;初めての場所には必ず明るい時間帯に到着し、足場の状況、危険箇所、トイレの場所などを確認しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">単独行動は避ける</span>
                  &nbsp;&mdash;&nbsp;夜の釣り場は人が少なく、万が一の事故に対応しにくい環境。できるだけ二人以上で行動しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">足元に細心の注意を払う</span>
                  &nbsp;&mdash;&nbsp;暗闘では段差やロープ、テトラポッドの隙間に気づきにくくなります。移動時は必ずヘッドライトを点灯し、ゆっくり歩きましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ライフジャケットを必ず着用</span>
                  &nbsp;&mdash;&nbsp;暗闘での落水は命に関わります。自動膨張式のライフジャケットでもOK。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">家族に行き先と帰宅予定を伝える</span>
                  &nbsp;&mdash;&nbsp;どこで何時まで釣りをするか、家族や友人に知らせておきましょう。
                </span>
              </div>
            </div>

            <Danger>
              夜の堤防で柵のない場所は特に危険です。海際ギリギリに立たず、余裕を持った位置から釣りをしましょう。酒を飲みながらの夜釣りは落水リスクが大幅に上がるため厳禁です。
            </Danger>
          </SectionCard>

          {/* 常夜灯周りのポイント */}
          <SectionCard title="常夜灯周りのポイント" icon={MapPin}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜釣りの一等地は常夜灯（街灯）の周り。光に集まるプランクトンを食べに小魚が集まり、さらにそれを狙うフィッシュイーターも寄ってきます。
            </p>

            <h3 className="mb-3 font-medium text-foreground">常夜灯周りの攻略法</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">明暗の境目を狙う</span>
                  &nbsp;&mdash;&nbsp;フィッシュイーター（シーバス・メバルなど）は暗い側に潜み、明るい側に出てくる小魚を待ち伏せています。光と影の境界線が最もアタリの出やすいポイントです。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">暗い側からアプローチ</span>
                  &nbsp;&mdash;&nbsp;自分は暗い側に立ち、明るい方向に向かってキャスト。ルアーやエサを暗い側から明るい側に通すのが基本です。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">常夜灯直下も忘れずに</span>
                  &nbsp;&mdash;&nbsp;真下のエリアにはアジやイワシが溜まっていることが多い。サビキ釣りや足元にジグヘッドを落とすだけでも釣れることがあります。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">複数の常夜灯を回る</span>
                  &nbsp;&mdash;&nbsp;一つの常夜灯で反応がなくても、隣の常夜灯には魚がいることも。ランガン（場所を移動しながら釣る）スタイルが効率的です。
                </span>
              </div>
            </div>

            <Hint>
              漁港の常夜灯は特にアジやメバルの実績が高いポイントです。地元の釣具店で「夜釣りでアジが釣れる漁港」を聞くのが近道です。
            </Hint>
          </SectionCard>

          {/* 夜釣りのマナー */}
          <SectionCard title="夜釣りのマナー" icon={Heart}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜釣りでは昼間以上に周囲への配慮が大切です。マナーを守って気持ちよく釣りを楽しみましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ヘッドライトで海面を照らさない</span>
                  &nbsp;&mdash;&nbsp;海面に光を当てると魚が散ってしまいます。周囲の釣り人にも迷惑になるため、手元だけを照らすか赤色モードを使いましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">騒がない・大声を出さない</span>
                  &nbsp;&mdash;&nbsp;夜は音が響きやすく、近隣住民への迷惑になります。また、魚も警戒するため静かに釣りをしましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">車のエンジンを切る</span>
                  &nbsp;&mdash;&nbsp;釣り場近くに車を停める場合、エンジンをかけっぱなしにするのは近隣への騒音になります。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ゴミは必ず持ち帰る</span>
                  &nbsp;&mdash;&nbsp;暗いと足元のゴミに気づきにくくなります。ゴミ袋を用意し、帰る前にヘッドライトで周囲を確認してすべて持ち帰りましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">先行者への挨拶を忘れずに</span>
                  &nbsp;&mdash;&nbsp;暗いとお互いの存在に気づきにくいため、近くに入る際は「こんばんは、隣に入っていいですか？」と声をかけましょう。
                </span>
              </div>
            </div>

            <Warning>
              夜釣り禁止の釣り場もあります。事前に看板や地元のルールを確認し、禁止されている場所では絶対に夜釣りをしないでください。
            </Warning>
          </SectionCard>
        </div>

        {/* 関連ガイド */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guide/lure" className="text-primary hover:underline">
                    ルアー釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - メバリング・アジングの基本</span>
                </li>
                <li>
                  <Link href="/guide/eging" className="text-primary hover:underline">
                    エギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ナイトエギングの詳細</span>
                </li>
                <li>
                  <Link href="/guide/float-fishing" className="text-primary hover:underline">
                    ウキ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 電気ウキを使った夜のウキ釣り</span>
                </li>
                <li>
                  <Link href="/guide/tide" className="text-primary hover:underline">
                    潮汐の読み方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 夜釣りの時間帯選びに役立つ潮の知識</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            潮の読み方を知ると、夜釣りの釣果がさらにアップします。
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
