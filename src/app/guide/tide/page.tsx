import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Waves, BookOpen, Clock, Sunrise, PauseCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "潮汐の読み方ガイド - 大潮・小潮・潮見表の見方を解説",
  description:
    "釣りに重要な潮汐の読み方を初心者向けに解説。大潮・中潮・小潮・長潮・若潮の違い、潮見表の読み方、釣れる潮のタイミング、朝マズメ・夕マズメの重要性、潮止まりの対策まで。",
  openGraph: {
    title: "潮汐の読み方ガイド - 大潮・小潮・潮見表の見方を解説",
    description:
      "大潮・小潮の違いから潮見表の読み方、釣れるタイミングまで解説。",
    type: "article",
    url: "https://tsurispot.com/guide/tide",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/tide",
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
      name: "潮汐の読み方ガイド",
      item: "https://tsurispot.com/guide/tide",
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

/* 潮の満ち引き図（大潮/中潮/小潮/長潮の1日の水位変化グラフ） */
function TideCycleDiagram() {
  return (
    <div className="my-6">
      <p className="mb-2 text-sm font-medium text-center text-muted-foreground">潮回りごとの1日の水位変化</p>
      <svg
        viewBox="0 0 700 260"
        width="100%"
        style={{ maxWidth: 700 }}
        aria-label="大潮、中潮、小潮、長潮の1日の水位変化を重ねて表示したグラフ。大潮が最も干満差が大きく、長潮が最も小さい。"
        className="mx-auto"
      >
        <rect x="0" y="0" width="700" height="260" rx="8" fill="#F9FAFB" />

        {/* グラフエリア */}
        <rect x="60" y="30" width="580" height="170" rx="4" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />

        {/* Y軸ラベル */}
        <text x="15" y="115" textAnchor="middle" fontSize="10" fill="#6B7280" transform="rotate(-90, 15, 115)">潮位 (cm)</text>
        <text x="55" y="42" textAnchor="end" fontSize="9" fill="#6B7280">200</text>
        <text x="55" y="72" textAnchor="end" fontSize="9" fill="#6B7280">150</text>
        <text x="55" y="102" textAnchor="end" fontSize="9" fill="#6B7280">100</text>
        <text x="55" y="132" textAnchor="end" fontSize="9" fill="#6B7280">50</text>
        <text x="55" y="162" textAnchor="end" fontSize="9" fill="#6B7280">0</text>
        <text x="55" y="197" textAnchor="end" fontSize="9" fill="#6B7280">-20</text>

        {/* Y軸グリッド */}
        <line x1="60" y1="38" x2="640" y2="38" stroke="#F3F4F6" strokeWidth="0.8" />
        <line x1="60" y1="68" x2="640" y2="68" stroke="#F3F4F6" strokeWidth="0.8" />
        <line x1="60" y1="98" x2="640" y2="98" stroke="#F3F4F6" strokeWidth="0.8" />
        <line x1="60" y1="128" x2="640" y2="128" stroke="#F3F4F6" strokeWidth="0.8" />
        <line x1="60" y1="158" x2="640" y2="158" stroke="#E5E7EB" strokeWidth="1" />

        {/* X軸時間ラベル */}
        {["0時", "3時", "6時", "9時", "12時", "15時", "18時", "21時", "24時"].map((t, i) => (
          <text key={t} x={60 + i * 72.5} y={212} textAnchor="middle" fontSize="9" fill="#6B7280">{t}</text>
        ))}

        {/* 大潮カーブ（青・最も振幅大） */}
        <path
          d="M60,50 C110,50 130,170 205,175 C280,180 300,40 350,38 C400,36 420,175 495,180 C570,185 590,45 640,42"
          fill="none" stroke="#3B82F6" strokeWidth="2.5"
        />

        {/* 中潮カーブ（緑） */}
        <path
          d="M60,65 C110,65 135,155 205,155 C275,155 305,55 350,55 C395,55 425,155 495,158 C565,160 595,60 640,58"
          fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="6,3"
        />

        {/* 小潮カーブ（オレンジ） */}
        <path
          d="M60,82 C110,82 140,140 205,138 C270,136 310,72 350,72 C390,72 430,138 495,140 C560,142 600,78 640,76"
          fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4,4"
        />

        {/* 長潮カーブ（赤・最も振幅小） */}
        <path
          d="M60,95 C110,95 145,128 205,126 C265,124 315,88 350,88 C385,88 435,126 495,128 C555,130 605,92 640,90"
          fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2,3"
        />

        {/* 凡例 */}
        <g>
          <line x1="80" y1="238" x2="105" y2="238" stroke="#3B82F6" strokeWidth="2.5" />
          <text x="110" y="242" fontSize="10" fill="#3B82F6">大潮</text>

          <line x1="160" y1="238" x2="185" y2="238" stroke="#22C55E" strokeWidth="2" strokeDasharray="6,3" />
          <text x="190" y="242" fontSize="10" fill="#22C55E">中潮</text>

          <line x1="240" y1="238" x2="265" y2="238" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4,4" />
          <text x="270" y="242" fontSize="10" fill="#F59E0B">小潮</text>

          <line x1="320" y1="238" x2="345" y2="238" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2,3" />
          <text x="350" y="242" fontSize="10" fill="#EF4444">長潮</text>

          <text x="450" y="242" fontSize="9" fill="#6B7280">干満差が大きいほど魚の活性UP</text>
        </g>
      </svg>
    </div>
  );
}

/* 上げ潮・下げ潮と魚の活性図 */
function TideActivityDiagram() {
  return (
    <div className="my-6">
      <p className="mb-2 text-sm font-medium text-center text-muted-foreground">潮の動きと魚の活性の関係</p>
      <svg
        viewBox="0 0 700 240"
        width="100%"
        style={{ maxWidth: 700 }}
        aria-label="上げ潮と下げ潮の動きに対する魚の活性度を示す図。潮が動き始めるタイミングと潮止まりで活性がどう変化するかを表す。"
        className="mx-auto"
      >
        <rect x="0" y="0" width="700" height="240" rx="8" fill="#F9FAFB" />

        {/* グラフエリア */}
        <rect x="70" y="25" width="580" height="155" rx="4" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />

        {/* Y軸（潮位） */}
        <text x="20" y="102" textAnchor="middle" fontSize="10" fill="#3B82F6" transform="rotate(-90, 20, 102)">潮位</text>

        {/* 潮位カーブ */}
        <path
          d="M70,160 C140,160 170,40 265,38 C360,36 370,170 430,170 C490,170 540,40 600,38 C620,37 640,45 650,55"
          fill="none" stroke="#3B82F6" strokeWidth="2.5"
        />

        {/* 干潮マーク */}
        <text x="70" y="175" textAnchor="start" fontSize="9" fontWeight="bold" fill="#3B82F6">干潮</text>
        <text x="430" y="185" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3B82F6">干潮</text>

        {/* 満潮マーク */}
        <text x="265" y="32" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3B82F6">満潮</text>
        <text x="600" y="32" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#3B82F6">満潮</text>

        {/* 潮止まりゾーン */}
        <rect x="250" y="25" width="30" height="155" fill="#EF4444" opacity="0.06" />
        <rect x="415" y="25" width="30" height="155" fill="#EF4444" opacity="0.06" />
        <text x="265" y="145" textAnchor="middle" fontSize="8" fill="#EF4444">潮止まり</text>
        <text x="430" y="145" textAnchor="middle" fontSize="8" fill="#EF4444">潮止まり</text>

        {/* 魚の活性バー（下段） */}
        {/* 上げ潮ゾーン */}
        <rect x="90" y="195" width="155" height="18" rx="4" fill="#22C55E" opacity="0.15" stroke="#22C55E" strokeWidth="1" />
        <text x="167" y="207" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#22C55E">上げ潮</text>

        {/* 活性が高い部分（上げ3分） */}
        <rect x="140" y="195" width="50" height="18" rx="0" fill="#22C55E" opacity="0.3" />
        <text x="165" y="230" textAnchor="middle" fontSize="8" fill="#22C55E">上げ3分</text>

        {/* 潮止まりゾーン */}
        <rect x="248" y="195" width="34" height="18" rx="4" fill="#EF4444" opacity="0.15" stroke="#EF4444" strokeWidth="1" />
        <text x="265" y="207" textAnchor="middle" fontSize="8" fill="#EF4444">停</text>

        {/* 下げ潮ゾーン */}
        <rect x="285" y="195" width="125" height="18" rx="4" fill="#F59E0B" opacity="0.15" stroke="#F59E0B" strokeWidth="1" />
        <text x="347" y="207" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#F59E0B">下げ潮</text>

        {/* 活性が高い部分（下げ7分） */}
        <rect x="340" y="195" width="65" height="18" rx="0" fill="#F59E0B" opacity="0.3" />
        <text x="372" y="230" textAnchor="middle" fontSize="8" fill="#F59E0B">下げ7分</text>

        {/* 潮止まりゾーン */}
        <rect x="413" y="195" width="34" height="18" rx="4" fill="#EF4444" opacity="0.15" stroke="#EF4444" strokeWidth="1" />
        <text x="430" y="207" textAnchor="middle" fontSize="8" fill="#EF4444">停</text>

        {/* 次の上げ潮 */}
        <rect x="450" y="195" width="195" height="18" rx="4" fill="#22C55E" opacity="0.15" stroke="#22C55E" strokeWidth="1" />
        <text x="547" y="207" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#22C55E">上げ潮</text>

        {/* 魚活性ラベル */}
        <text x="350" y="222" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">「上げ3分・下げ7分」が釣れるタイミング</text>
      </svg>
    </div>
  );
}

/* 潮見表の読み方図 */
function TideChartReadingDiagram() {
  return (
    <div className="my-6">
      <p className="mb-2 text-sm font-medium text-center text-muted-foreground">潮見表（タイドグラフ）の読み方</p>
      <svg
        viewBox="0 0 700 280"
        width="100%"
        style={{ maxWidth: 700 }}
        aria-label="潮見表（タイドグラフ）の読み方。満潮、干潮、潮止まりの位置をラベル付きの曲線で示す。"
        className="mx-auto"
      >
        <rect x="0" y="0" width="700" height="280" rx="8" fill="#EFF6FF" />

        {/* タイトル */}
        <text x="350" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1E40AF">タイドグラフの見方（例: 大潮の日）</text>

        {/* グラフエリア */}
        <rect x="70" y="35" width="580" height="170" rx="4" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1" />

        {/* Y軸 */}
        <text x="55" y="48" textAnchor="end" fontSize="9" fill="#6B7280">180cm</text>
        <text x="55" y="90" textAnchor="end" fontSize="9" fill="#6B7280">120cm</text>
        <text x="55" y="132" textAnchor="end" fontSize="9" fill="#6B7280">60cm</text>
        <text x="55" y="174" textAnchor="end" fontSize="9" fill="#6B7280">0cm</text>
        <text x="55" y="202" textAnchor="end" fontSize="9" fill="#6B7280">-20cm</text>

        {/* Y軸グリッド */}
        <line x1="70" y1="45" x2="650" y2="45" stroke="#EFF6FF" strokeWidth="0.8" />
        <line x1="70" y1="87" x2="650" y2="87" stroke="#EFF6FF" strokeWidth="0.8" />
        <line x1="70" y1="129" x2="650" y2="129" stroke="#EFF6FF" strokeWidth="0.8" />
        <line x1="70" y1="171" x2="650" y2="171" stroke="#E5E7EB" strokeWidth="1" />

        {/* X軸時間 */}
        {["0", "3", "6", "9", "12", "15", "18", "21", "24"].map((t, i) => (
          <text key={t} x={70 + i * 72.5} y={220} textAnchor="middle" fontSize="9" fill="#6B7280">{t}時</text>
        ))}

        {/* 潮位カーブ（メインのタイドグラフ） */}
        <path
          d="M70,80 C100,80 130,185 215,190 C300,195 330,42 360,40 C390,38 420,190 505,195 C590,200 620,50 650,48"
          fill="none" stroke="#3B82F6" strokeWidth="3"
        />

        {/* 干潮ラベル & ポイント */}
        <circle cx="215" cy="190" r="4" fill="#3B82F6" />
        <line x1="215" y1="190" x2="215" y2="225" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3,2" />
        <text x="215" y="240" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3B82F6">干潮 5:42</text>
        <text x="215" y="253" textAnchor="middle" fontSize="9" fill="#6B7280">潮位: 8cm</text>

        {/* 満潮ラベル & ポイント */}
        <circle cx="360" cy="40" r="4" fill="#EF4444" />
        <line x1="360" y1="40" x2="390" y2="30" stroke="#EF4444" strokeWidth="1" />
        <text x="420" y="30" textAnchor="start" fontSize="10" fontWeight="bold" fill="#EF4444">満潮 11:58</text>
        <text x="420" y="43" textAnchor="start" fontSize="9" fill="#6B7280">潮位: 172cm</text>

        {/* 第2干潮 */}
        <circle cx="505" cy="195" r="4" fill="#3B82F6" />
        <line x1="505" y1="195" x2="505" y2="225" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3,2" />
        <text x="505" y="240" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3B82F6">干潮 18:15</text>
        <text x="505" y="253" textAnchor="middle" fontSize="9" fill="#6B7280">潮位: -5cm</text>

        {/* 潮止まりマーク */}
        <rect x="207" y="183" width="16" height="14" rx="3" fill="#EF4444" opacity="0.15" stroke="#EF4444" strokeWidth="0.8" />
        <text x="180" y="178" fontSize="8" fill="#EF4444">潮止まり</text>

        <rect x="352" y="33" width="16" height="14" rx="3" fill="#EF4444" opacity="0.15" stroke="#EF4444" strokeWidth="0.8" />
        <text x="340" y="28" fontSize="8" fill="#EF4444" textAnchor="end">潮止まり</text>

        {/* 傾きが急な部分のハイライト（よく釣れるゾーン） */}
        <rect x="240" y="35" width="85" height="170" fill="#22C55E" opacity="0.06" rx="3" />
        <text x="282" y="60" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#22C55E">よく釣れる</text>
        <text x="282" y="72" textAnchor="middle" fontSize="8" fill="#22C55E">（急な上げ潮）</text>

        <rect x="380" y="35" width="85" height="170" fill="#F59E0B" opacity="0.06" rx="3" />
        <text x="422" y="60" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#F59E0B">よく釣れる</text>
        <text x="422" y="72" textAnchor="middle" fontSize="8" fill="#F59E0B">（急な下げ潮）</text>

        {/* 注釈 */}
        <text x="350" y="272" textAnchor="middle" fontSize="9" fill="#6B7280">曲線の傾きが急な部分ほど潮がよく動き、魚の活性が高い</text>
      </svg>
    </div>
  );
}

export default function TideGuidePage() {
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
            潮汐の読み方ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            潮の動きを理解すれば、釣果が格段にアップします。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">なぜ潮汐が重要なのか：</span>
          潮の満ち引きは月と太陽の引力によって起こります。潮が動くと海水が流れ、プランクトンが運ばれ、それを食べに小魚が集まり、さらに大きな魚が寄ってきます。潮の動きを知ることは、魚が「いつ・どこで食うか」を予測する上で最も重要なファクターの一つです。
        </div>

        <div className="space-y-6">
          {/* 潮の種類 */}
          <SectionCard title="大潮・中潮・小潮・長潮・若潮の違い" icon={Waves}>
            <TideCycleDiagram />
            <p className="mb-4 text-sm text-muted-foreground">
              潮の種類は月の満ち欠けに連動して、約15日周期で変化します。釣りへの影響度を理解しましょう。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">大潮（おおしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                    釣りやすさ：高
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  新月と満月の前後に起きる、干満の差が最も大きい潮。潮の流れが速く、海中に変化が生まれるため魚の活性が最も高くなります。釣りに最も適した潮回り。ただし潮が速すぎて仕掛けが流される場合もあります。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">中潮（なかしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                    釣りやすさ：高
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  大潮と小潮の間の潮回り。干満の差は大潮ほどではないが、程よい潮の流れがあり、非常に釣りやすい潮。月の約半分がこの潮回りにあたるため、釣行計画が立てやすいのも魅力です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">小潮（こしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    釣りやすさ：中
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  上弦の月と下弦の月の前後に起きる、干満の差が小さい潮。潮の流れが穏やかで、仕掛けが流されにくい。ウキ釣りやエギングなど繊細な釣りがしやすい反面、魚の活性はやや低めです。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">長潮（ながしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                    釣りやすさ：低
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  小潮の後に来る、干満の差が最も小さい潮。潮がほとんど動かないため、魚の活性は低くなりがち。釣りには不向きとされますが、潮の流れが弱い分、初心者には仕掛けの扱いが楽という一面も。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">若潮（わかしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    釣りやすさ：中
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  長潮の翌日にあたり、潮が「若返る」（再び大きくなり始める）潮。長潮より潮の動きが回復し、徐々に魚の活性も上がってきます。大潮に向かう転換点です。
                </p>
              </div>
            </div>

            <div className="my-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">潮回りの周期：</span>
              大潮 &rarr; 中潮 &rarr; 小潮 &rarr; 長潮 &rarr; 若潮 &rarr; 中潮 &rarr; 大潮... と約15日で一巡します。
            </div>
          </SectionCard>

          {/* 潮見表の読み方 */}
          <SectionCard title="潮見表の読み方" icon={BookOpen}>
            <TideChartReadingDiagram />
            <p className="mb-4 text-sm text-muted-foreground">
              潮見表（タイドグラフ）は、一日の潮の満ち引きをグラフで表したもの。釣行前に必ずチェックしましょう。
            </p>

            <h3 className="mb-3 font-medium text-foreground">潮見表に書いてある情報</h3>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">潮回り</span>
                  &nbsp;&mdash;&nbsp;大潮・中潮・小潮・長潮・若潮のいずれか。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">満潮・干潮の時刻</span>
                  &nbsp;&mdash;&nbsp;1日に2回ずつ満潮と干潮があります（場所によって1回のこともあり）。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">潮位（cm）</span>
                  &nbsp;&mdash;&nbsp;満潮時と干潮時の水位の高さ。その差が大きいほど潮の流れが強い。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">タイドグラフ（曲線）</span>
                  &nbsp;&mdash;&nbsp;横軸が時間、縦軸が潮位のグラフ。曲線の傾きが急な部分ほど潮の流れが速い。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">日の出・日の入り時刻</span>
                  &nbsp;&mdash;&nbsp;マズメ時間の判断に使います。
                </span>
              </div>
            </div>

            <h3 className="mb-3 font-medium text-foreground">潮見表の見方のポイント</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">グラフの傾きに注目</span>
                  &nbsp;&mdash;&nbsp;傾きが急な部分 = 潮がよく動いている時間帯。この時間帯が最も魚が釣れやすい。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">「上げ3分・下げ7分」を意識</span>
                  &nbsp;&mdash;&nbsp;満潮前の3割の時間帯と、干潮に向かう7割の時間帯が特に釣れやすいとされています。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">潮位差をチェック</span>
                  &nbsp;&mdash;&nbsp;満潮と干潮の潮位差が大きい日ほど、潮がよく動き魚の活性が高まります。
                </span>
              </div>
            </div>

            <Hint>
              潮見表は釣り情報サイトやアプリで無料で確認できます。場所ごとに潮の時間が異なるため、必ず釣り場の最寄りの観測地点のデータを参照しましょう。
            </Hint>
          </SectionCard>

          {/* 釣れる潮のタイミング */}
          <SectionCard title="釣れる潮のタイミング" icon={Clock}>
            <TideActivityDiagram />
            <p className="mb-4 text-sm text-muted-foreground">
              潮の動きと魚の活性には密接な関係があります。ベストなタイミングを把握しましょう。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">潮が動き始めるタイミング</h3>
                <p className="text-sm text-muted-foreground">
                  満潮・干潮の前後で潮が動き始める瞬間は、魚のスイッチが入りやすいゴールデンタイム。特に「上げ始め」と「下げ始め」は要注目です。潮見表でグラフの曲線が変化し始めるポイントを確認しましょう。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">潮の流れが最も速い時間帯</h3>
                <p className="text-sm text-muted-foreground">
                  満潮と干潮の中間あたりが最も潮の流れが速くなります。この時間帯はプランクトンや小魚が流されて、フィッシュイーターの捕食活動が活発に。ショアジギングやルアー釣りには最高のタイミングです。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">大潮の下げ潮</h3>
                <p className="text-sm text-muted-foreground">
                  多くの釣り人が「最も釣れる」と実感するのが大潮の下げ潮。特に満潮から下げに転じる瞬間は、魚の活性が一気に上がるポイント。このタイミングにマズメが重なれば最強です。
                </p>
              </div>
            </div>

            <div className="my-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">最強の組み合わせ：</span>
              「大潮の下げ潮」＋「朝マズメ」が重なる日は、年に数回しかない最高のタイミング。潮見表とカレンダーを照らし合わせて、この日を狙いましょう。
            </div>
          </SectionCard>

          {/* 朝マズメ・夕マズメ */}
          <SectionCard title="朝マズメ・夕マズメの重要性" icon={Sunrise}>
            <p className="mb-4 text-sm text-muted-foreground">
              「マズメ」とは日の出前後と日の入り前後の薄明るい時間帯のこと。魚が最も活発にエサを食べる時間として、釣り人の間では最重要視されています。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">朝マズメ（あさまずめ）</h3>
                <p className="text-sm text-muted-foreground">
                  日の出前の約1時間〜日の出後の約1時間。夜の間に空腹になった魚が一斉にエサを食べ始めるタイミングです。青物の回遊、シーバスの捕食、イカの接岸など、あらゆる魚種で最もアタリが出やすい時間帯。早起きの価値は十分にあります。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">夕マズメ（ゆうまずめ）</h3>
                <p className="text-sm text-muted-foreground">
                  日の入り前の約1時間〜日没後の約30分。夜に備えてエサを食い溜めする魚や、夜行性の魚が活動を始めるタイミング。朝マズメに次いで釣れやすい時間帯です。夜釣りの開始時間としても最適。
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">なぜマズメに釣れるのか</span>
                  &nbsp;&mdash;&nbsp;光量の変化がトリガー（きっかけ）となり、プランクトンが浮上 &rarr; 小魚が集まる &rarr; 大型魚が捕食、という食物連鎖が活性化するためです。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">季節による時間の変化</span>
                  &nbsp;&mdash;&nbsp;夏は日の出が早く（4:30頃）、冬は遅い（6:30頃）。出発時間は季節に合わせて調整しましょう。
                </span>
              </div>
            </div>

            <Hint>
              「釣りは朝イチ」と言われる所以です。できれば日の出の30分前には釣り場に到着し、準備を済ませておくのが理想。特に人気ポイントでは場所取りも考慮して、さらに早めに到着しましょう。
            </Hint>
          </SectionCard>

          {/* 潮止まりの対策 */}
          <SectionCard title="潮止まりの対策" icon={PauseCircle}>
            <p className="mb-4 text-sm text-muted-foreground">
              「潮止まり」とは、満潮・干潮のピーク付近で潮の流れがほぼ止まる時間帯。魚の活性が下がりやすい時間ですが、対策次第で釣果を出すことは可能です。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">狙うポイントを変える</span>
                  &nbsp;&mdash;&nbsp;潮止まりでも海水が動く場所はあります。河口や水路の出口、堤防の先端など、地形による潮流が発生しやすいポイントに移動しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">仕掛けを軽くする</span>
                  &nbsp;&mdash;&nbsp;潮が止まると、重い仕掛けではルアーやエサの動きが不自然に。軽い仕掛けに変えて、ナチュラルな漂いを演出しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">底物（根魚）を狙う</span>
                  &nbsp;&mdash;&nbsp;カサゴやハタなどの根魚は、潮の動きに関係なく捕食します。潮止まりの間は穴釣りやワーム釣りで根魚を狙うのが効率的。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">休憩時間にする</span>
                  &nbsp;&mdash;&nbsp;潮止まりは通常30分〜1時間程度。無理に釣り続けるより、食事や道具の整理、次の潮動きに備えた準備の時間に充てるのも賢い選択です。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">タナ（深さ）を変える</span>
                  &nbsp;&mdash;&nbsp;潮が止まると魚が定位するレンジ（層）が変わることがあります。表層・中層・底層と幅広く探ってみましょう。
                </span>
              </div>
            </div>

            <Warning>
              大潮の干潮時は水位が極端に下がることがあります。磯場では普段水没している岩が露出し、足元が滑りやすくなるため注意。また、干上がった場所で釣りをしていると、上げ潮で退路を断たれる危険があります。
            </Warning>
          </SectionCard>
        </div>

        {/* まとめ */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">まとめ</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">大潮・中潮が狙い目。</span>
                    潮の動きが活発な日は魚の活性も高くなります。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">潮見表を事前にチェック。</span>
                    満潮・干潮の時刻と潮回りを確認して釣行計画を立てましょう。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">マズメ×潮の動きが最強。</span>
                    朝マズメ・夕マズメと潮の動き始めが重なる時間帯を狙いましょう。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">潮止まりも工夫次第。</span>
                    ポイント移動や根魚狙いで、釣果ゼロの時間をなくしましょう。
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 関連ガイド */}
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guide/float-fishing" className="text-primary hover:underline">
                    ウキ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 潮を読むことが重要なウキ釣りの基本</span>
                </li>
                <li>
                  <Link href="/guide/jigging" className="text-primary hover:underline">
                    ショアジギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 青物回遊と潮の関係</span>
                </li>
                <li>
                  <Link href="/guide/eging" className="text-primary hover:underline">
                    エギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - イカの活性と潮の動き</span>
                </li>
                <li>
                  <Link href="/guide/night-fishing" className="text-primary hover:underline">
                    夜釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 夜釣りの時間帯と潮の関係</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            潮の知識を活かして、さっそく釣りに出かけましょう。
          </p>
          <Link
            href="/spots"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            釣りスポットを探す
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
