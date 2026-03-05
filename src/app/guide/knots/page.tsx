import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ChevronLeft, Play, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeEmbedList } from "@/components/youtube-embed";
import { fishingMethodVideos } from "@/lib/data/youtube-videos";

export const metadata: Metadata = {
  title: "釣り糸の結び方｜初心者はユニノットだけでOK｜ツリスポ",
  description:
    "釣り初心者がまず覚えるべき結び方はユニノット1つだけ。針・サルカン・スナップ、なんでも結べる万能ノット。図解つきでわかりやすく解説。",
  openGraph: {
    title: "釣り糸の結び方｜初心者はユニノットだけでOK",
    description:
      "まずはユニノット1つだけ覚えれば釣りはできる。図解つきでわかりやすく解説。",
    type: "article",
    url: "https://tsurispot.com/guide/knots",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/knots",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "ユニノットの結び方（釣り糸の基本）",
  description:
    "釣り初心者が最初に覚えるべきユニノットの結び方を4ステップで解説。針・サルカン・スナップなど何にでも使える万能ノット。",
  totalTime: "PT5M",
  supply: [
    { "@type": "HowToSupply", name: "釣り糸（ナイロンライン推奨）" },
    { "@type": "HowToSupply", name: "ハサミ" },
  ],
  tool: [
    { "@type": "HowToTool", name: "サルカンまたはスナップ（練習用）" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "穴に糸を通して折り返す",
      text: "金具の穴（アイ）に糸を通して、15cmくらい出す。端の糸を折り返してループ（輪っか）を作る。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "ループの中をくぐらせながら5回巻く",
      text: "端の糸をループの中に通しながら、本線にくるくると5回巻きつける。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "唾で湿らせてゆっくり締める",
      text: "糸を唾で湿らせてから、端の糸をゆっくり引っ張って巻いた部分を締める。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "本線を引いて完成",
      text: "本線を引っ張って結び目を金具のすぐそばまでスライドさせ、余った糸を2mmほど残してカット。",
      position: 4,
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
      name: "釣り糸の結び方",
      item: "https://tsurispot.com/guide/knots",
    },
  ],
};

/* メインのユニノット図解 - 大きくわかりやすく */
function UniKnotDiagram() {
  return (
    <div className="my-6">
      <svg
        viewBox="0 0 800 520"
        width="100%"
        style={{ maxWidth: 800 }}
        aria-label="ユニノットの結び方4ステップ図解"
        className="mx-auto"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="800" height="520" rx="12" fill="#F0F9FF" />

        {/* Step 1: 穴に通す */}
        <g>
          <rect x="15" y="15" width="375" height="230" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <rect x="15" y="15" width="375" height="36" rx="8" fill="#0EA5E9" />
          <rect x="15" y="35" width="375" height="16" fill="#0EA5E9" />
          <text x="30" y="38" fontSize="15" fontWeight="bold" fill="#FFFFFF">Step 1</text>
          <text x="95" y="38" fontSize="13" fill="#E0F2FE">穴に糸を通して折り返す</text>

          {/* 金具（サルカン） */}
          <rect x="80" y="120" width="30" height="45" rx="6" fill="#E5E7EB" stroke="#6B7280" strokeWidth="2.5" />
          <circle cx="95" cy="118" r="10" fill="none" stroke="#6B7280" strokeWidth="2.5" />
          <text x="95" y="185" textAnchor="middle" fontSize="11" fill="#6B7280">金具</text>

          {/* 本線（左から来る） */}
          <line x1="25" y1="140" x2="85" y2="140" stroke="#3B82F6" strokeWidth="3" />
          <text x="40" y="132" fontSize="11" fontWeight="bold" fill="#3B82F6">本線</text>

          {/* 穴を通った糸 */}
          <line x1="105" y1="140" x2="280" y2="140" stroke="#3B82F6" strokeWidth="3" />

          {/* 折り返し */}
          <path d="M280,140 C310,140 310,170 280,170 L180,170" stroke="#EF4444" strokeWidth="3" fill="none" />

          {/* 端糸ラベル */}
          <text x="240" y="130" fontSize="11" fontWeight="bold" fill="#EF4444">端糸（15cm）</text>

          {/* ループ表示 */}
          <path d="M200,140 L200,170" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x="220" y="200" fontSize="12" fontWeight="bold" fill="#A855F7">← ループ（輪っか）</text>

          {/* 15cm表示 */}
          <line x1="110" y1="150" x2="280" y2="150" stroke="#6B7280" strokeWidth="0.8" />
          <line x1="110" y1="147" x2="110" y2="153" stroke="#6B7280" strokeWidth="0.8" />
          <line x1="280" y1="147" x2="280" y2="153" stroke="#6B7280" strokeWidth="0.8" />
        </g>

        {/* Step 2: 5回巻く */}
        <g>
          <rect x="410" y="15" width="375" height="230" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <rect x="410" y="15" width="375" height="36" rx="8" fill="#0EA5E9" />
          <rect x="410" y="35" width="375" height="16" fill="#0EA5E9" />
          <text x="425" y="38" fontSize="15" fontWeight="bold" fill="#FFFFFF">Step 2</text>
          <text x="490" y="38" fontSize="13" fill="#E0F2FE">ループの中を通しながら5回巻く</text>

          {/* 本線 */}
          <line x1="430" y1="140" x2="760" y2="140" stroke="#3B82F6" strokeWidth="3" />

          {/* 巻き付けコイル - 大きく見やすく */}
          <ellipse cx="520" cy="140" rx="10" ry="22" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
          <ellipse cx="545" cy="140" rx="10" ry="22" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
          <ellipse cx="570" cy="140" rx="10" ry="22" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
          <ellipse cx="595" cy="140" rx="10" ry="22" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
          <ellipse cx="620" cy="140" rx="10" ry="22" fill="none" stroke="#F59E0B" strokeWidth="2.5" />

          {/* 巻き数カウント */}
          <text x="520" y="180" textAnchor="middle" fontSize="10" fill="#92400E">1</text>
          <text x="545" y="180" textAnchor="middle" fontSize="10" fill="#92400E">2</text>
          <text x="570" y="180" textAnchor="middle" fontSize="10" fill="#92400E">3</text>
          <text x="595" y="180" textAnchor="middle" fontSize="10" fill="#92400E">4</text>
          <text x="620" y="180" textAnchor="middle" fontSize="10" fill="#92400E">5</text>

          {/* ポイント */}
          <text x="570" y="210" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#D97706">くるくる5回！</text>

          {/* 巻く方向の矢印 */}
          <path d="M510,115 C510,100 530,100 530,115" stroke="#F59E0B" strokeWidth="1.5" fill="none" markerEnd="url(#arrowY)" />
          <defs>
            <marker id="arrowY" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6" fill="#F59E0B" />
            </marker>
          </defs>
        </g>

        {/* Step 3: 湿らせて締める */}
        <g>
          <rect x="15" y="265" width="375" height="240" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <rect x="15" y="265" width="375" height="36" rx="8" fill="#0EA5E9" />
          <rect x="15" y="285" width="375" height="16" fill="#0EA5E9" />
          <text x="30" y="288" fontSize="15" fontWeight="bold" fill="#FFFFFF">Step 3</text>
          <text x="95" y="288" fontSize="13" fill="#E0F2FE">唾で湿らせてゆっくり締める</text>

          {/* 本線 */}
          <line x1="30" y1="380" x2="370" y2="380" stroke="#3B82F6" strokeWidth="3" />

          {/* 巻いた部分（まだ緩い） */}
          <ellipse cx="170" cy="380" rx="8" ry="18" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="190" cy="380" rx="8" ry="18" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="210" cy="380" rx="8" ry="18" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="230" cy="380" rx="8" ry="18" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <ellipse cx="250" cy="380" rx="8" ry="18" fill="none" stroke="#F59E0B" strokeWidth="2" />

          {/* 端糸を引く矢印 */}
          <line x1="300" y1="380" x2="350" y2="380" stroke="#EF4444" strokeWidth="2.5" />
          <polygon points="355,380 345,374 345,386" fill="#EF4444" />
          <text x="330" y="410" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#EF4444">端糸を引く</text>

          {/* 水滴マーク */}
          <path d="M100,340 Q108,325 116,340 Q116,352 100,352 Q84,352 100,340" fill="#60A5FA" opacity="0.5" />
          <path d="M128,348 Q133,340 138,348 Q138,355 128,355 Q118,355 128,348" fill="#60A5FA" opacity="0.4" />
          <text x="115" y="370" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2563EB">ペロッと湿らせる</text>

          {/* 超重要ポイント */}
          <rect x="40" y="430" width="330" height="55" rx="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="205" y="453" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#92400E">最重要ポイント</text>
          <text x="205" y="473" textAnchor="middle" fontSize="11" fill="#92400E">湿らせないと摩擦熱で糸が弱くなる！</text>
        </g>

        {/* Step 4: 完成 */}
        <g>
          <rect x="410" y="265" width="375" height="240" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
          <rect x="410" y="265" width="375" height="36" rx="8" fill="#22C55E" />
          <rect x="410" y="285" width="375" height="16" fill="#22C55E" />
          <text x="425" y="288" fontSize="15" fontWeight="bold" fill="#FFFFFF">Step 4</text>
          <text x="490" y="288" fontSize="13" fill="#DCFCE7">本線を引いてスライド → 完成！</text>

          {/* 金具 */}
          <rect x="470" y="365" width="24" height="35" rx="5" fill="#E5E7EB" stroke="#6B7280" strokeWidth="2" />
          <circle cx="482" cy="363" r="8" fill="none" stroke="#6B7280" strokeWidth="2" />

          {/* 本線 */}
          <line x1="430" y1="380" x2="470" y2="380" stroke="#3B82F6" strokeWidth="3" />
          <line x1="494" y1="380" x2="750" y2="380" stroke="#3B82F6" strokeWidth="3" />

          {/* 締まった結び目 */}
          <rect x="496" y="370" width="24" height="20" rx="5" fill="#F59E0B" opacity="0.3" stroke="#F59E0B" strokeWidth="2" />

          {/* 本線を引く矢印 */}
          <polygon points="745,380 735,374 735,386" fill="#22C55E" />
          <text x="720" y="410" fontSize="12" fontWeight="bold" fill="#22C55E">本線を引く</text>

          {/* 端糸カット */}
          <line x1="510" y1="372" x2="535" y2="350" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,3" />
          <text x="550" y="345" fontSize="11" fill="#EF4444">余りをカット</text>
          <text x="550" y="360" fontSize="10" fill="#6B7280">（2mmほど残す）</text>

          {/* 完成マーク */}
          <rect x="440" y="430" width="320" height="55" rx="8" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1.5" />
          <text x="600" y="455" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#166534">完成！これで釣りができます</text>
          <text x="600" y="475" textAnchor="middle" fontSize="11" fill="#166534">引っ張ってみてすっぽ抜けなければOK</text>
        </g>
      </svg>
    </div>
  );
}

export default function KnotsGuidePage() {
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
          { label: "釣り糸の結び方" },
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

        {/* ヘッダー - 明確なメッセージ */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣り糸の結び方
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            初心者は<strong className="text-foreground">「ユニノット」1つだけ</strong>覚えればOK。
          </p>
        </div>

        {/* 安心メッセージ */}
        <div className="mb-8 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950">
          <p className="text-center text-sm font-medium text-emerald-800 dark:text-emerald-200 sm:text-base">
            結び方は何十種類もありますが、<strong>ユニノット1つで針も金具も全部結べます</strong>。<br className="hidden sm:inline" />
            他の結び方は釣りに慣れてからで大丈夫です。
          </p>
        </div>

        {/* ユニノットでできること */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="mb-4 text-lg font-bold">ユニノットで結べるもの</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">針（フック）</p>
                  <p className="text-xs text-muted-foreground">糸と釣り針の接続</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">サルカン・スナップ</p>
                  <p className="text-xs text-muted-foreground">仕掛けとの接続金具</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">ルアー</p>
                  <p className="text-xs text-muted-foreground">ルアーのアイに直結</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* メインの図解 */}
        <h2 className="mb-2 text-xl font-bold">ユニノットの結び方（4ステップ）</h2>
        <p className="mb-4 text-sm text-muted-foreground">家で太い紐とクリップで練習するのがおすすめです。</p>

        <UniKnotDiagram />

        {/* テキストでも手順説明 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="mb-4 font-bold">手順のおさらい</h3>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">1</span>
                <div>
                  <p className="font-medium">穴に糸を通して折り返す</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">金具の穴に糸を通して、端を15cmくらい出す。端の糸を折り返してループ（輪っか）を作る。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">2</span>
                <div>
                  <p className="font-medium">ループの中をくぐらせながら5回巻く</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">端の糸をループの中に通しながら、本線にくるくると5回巻きつける。</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">3</span>
                <div>
                  <p className="font-medium">唾で湿らせてゆっくり締める</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    糸を唾でペロッと湿らせてから、端の糸をゆっくり引っ張る。
                    <span className="font-medium text-amber-600"> ※湿らせないと摩擦熱で糸が切れやすくなる</span>
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">4</span>
                <div>
                  <p className="font-medium">本線を引いてスライド → 余りをカット</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">本線を引っ張って結び目を金具のそばまで寄せる。余った糸を2mm残してカット。引っ張ってすっぽ抜けなければ完成！</p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* 失敗しやすいポイント - シンプルに */}
        <Card className="mb-8 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <h3 className="mb-3 font-bold text-amber-700 dark:text-amber-400">よくある失敗3つ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-amber-500">1.</span>
                <div>
                  <span className="font-medium">湿らせずに締める</span>
                  <span className="text-muted-foreground"> → 摩擦熱で糸が弱くなり、魚がかかった時に切れる</span>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-amber-500">2.</span>
                <div>
                  <span className="font-medium">巻きが3回以下</span>
                  <span className="text-muted-foreground"> → すっぽ抜ける。最低5回は巻こう</span>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-amber-500">3.</span>
                <div>
                  <span className="font-medium">端糸をギリギリでカット</span>
                  <span className="text-muted-foreground"> → ほどける原因。2mmは残す</span>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 参考動画 */}
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Play className="size-5 text-primary" />
            動画で見る
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            文字だけだとピンとこない方は、動画で手の動きを確認しましょう。
          </p>
          <YouTubeEmbedList
            videos={fishingMethodVideos.knots}
            sectionTitle=""
            description=""
          />
        </section>

        {/* 慣れてきたら（折りたたみ） */}
        <details className="mb-8 rounded-xl border">
          <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-muted-foreground hover:text-foreground">
            慣れてきたら覚えたい結び方（クリンチノット・電車結び）
          </summary>
          <div className="space-y-6 px-5 pb-5">
            <div>
              <h3 className="mb-2 font-bold">クリンチノット</h3>
              <p className="mb-2 text-sm text-muted-foreground">サルカンやスナップへの接続に使う定番。ユニノットと同じくらい使われる。</p>
              <ol className="space-y-1 text-sm">
                <li>1. 穴に糸を通して10〜15cm出す</li>
                <li>2. 端糸を本線に5〜7回巻きつける</li>
                <li>3. 穴のそばにできた小さな輪に端糸を通す</li>
                <li>4. さらにできた大きな輪にも端糸を通す（改良クリンチ）</li>
                <li>5. 湿らせてゆっくり締める → 余りをカット</li>
              </ol>
            </div>
            <div>
              <h3 className="mb-2 font-bold">電車結び</h3>
              <p className="mb-2 text-sm text-muted-foreground">2本の糸をつなぐ結び方。道糸とハリスの接続に。</p>
              <ol className="space-y-1 text-sm">
                <li>1. 2本の糸を10cmほど重ねる</li>
                <li>2. 片方の糸でもう片方にユニノット（3〜5回巻き）</li>
                <li>3. 反対側も同じようにユニノット</li>
                <li>4. 両方の本線を引っ張って2つの結び目を密着させる</li>
                <li>5. 余りをカット</li>
              </ol>
            </div>
          </div>
        </details>

        {/* 次のステップ */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-center text-white sm:p-8">
          <p className="mb-2 text-sm text-sky-100">結び方を覚えたら</p>
          <h2 className="mb-3 text-xl font-bold sm:text-2xl">サビキ釣りに挑戦しよう！</h2>
          <p className="mb-4 text-sm text-sky-100">
            初心者でも簡単に釣れるサビキ釣り。仕掛けのセット方法から魚の釣り方まで解説。
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/guide/sabiki"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-medium text-sky-700 hover:bg-sky-50"
            >
              サビキ釣りガイドへ
            </Link>
            <Link
              href="/guide/beginner-setup"
              className="inline-flex items-center rounded-full bg-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/30"
            >
              仕掛けの準備ガイド
            </Link>
            <Link
              href="/guide/beginner"
              className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              釣りの始め方ガイド
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
