import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import type { YouTubeSearchLink } from "@/types";

const knotVideos: YouTubeSearchLink[] = [
  {
    label: "ユニノットの結び方",
    searchQuery: "ユニノット 結び方 わかりやすい",
    description: "最も基本的な結び方をゆっくり丁寧に解説",
  },
  {
    label: "クリンチノットの結び方",
    searchQuery: "改良クリンチノット 結び方 初心者",
    description: "サルカンやスナップへの接続に使う定番の結び方",
  },
  {
    label: "電車結びの結び方",
    searchQuery: "電車結び 結び方 初心者",
    description: "2本の糸をつなぐ基本の結び方を動画で確認",
  },
];

export const metadata: Metadata = {
  title: "釣り糸の結び方 - ユニノット・クリンチノット・電車結び",
  description:
    "初心者が覚えるべき3つの結び方（ユニノット・クリンチノット・電車結び）をステップバイステップで解説。コツとよくある失敗も紹介。",
  openGraph: {
    title: "釣り糸の結び方 - ユニノット・クリンチノット・電車結び",
    description:
      "初心者が覚えるべき3つの結び方をステップバイステップで解説。",
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
  name: "釣り糸の結び方 - ユニノット・クリンチノット・電車結び",
  description:
    "初心者が覚えるべき3つの結び方（ユニノット・クリンチノット・電車結び）をステップバイステップで解説。コツとよくある失敗も紹介。",
  totalTime: "PT30M",
  supply: [
    { "@type": "HowToSupply", name: "釣り糸（ナイロンライン推奨）" },
    { "@type": "HowToSupply", name: "ハサミ" },
  ],
  tool: [
    { "@type": "HowToTool", name: "練習用の太い紐（家での練習用）" },
    { "@type": "HowToTool", name: "サルカンまたはスナップ" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "ユニノット: 糸をアイ（穴）に通す",
      text: "針やサルカンの穴（アイ）に糸を通し、先端を15cmほど出します。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "ユニノット: 本線と端糸で輪を作る",
      text: "通した糸（端糸）を折り返し、本線と一緒に指で輪を作ります。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "ユニノット: 端糸を輪に5〜6回巻きつける",
      text: "端糸を作った輪の中に通しながら、本線に5〜6回巻きつけます。巻き数が多いほど強くなります。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "ユニノット: 端糸を引いて結び目を締める",
      text: "端糸をゆっくり引っ張り、巻きつけた部分を締めていきます。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "ユニノット: 本線を引いてアイまでスライドさせる",
      text: "本線を引っ張って、結び目をアイ（穴）のすぐそばまでスライドさせます。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "ユニノット: 余った端糸をカット",
      text: "結び目から2〜3mm残して余った端糸をハサミでカットします。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "クリンチノット: 糸をアイに通す",
      text: "サルカンやスナップのアイに糸を通し、先端を10〜15cm出します。",
      position: 7,
    },
    {
      "@type": "HowToStep",
      name: "クリンチノット: 端糸を本線に5〜7回巻きつける",
      text: "端糸を本線にくるくると5〜7回巻きつけます。細い糸は多め、太い糸は少なめに巻きます。",
      position: 8,
    },
    {
      "@type": "HowToStep",
      name: "クリンチノット: アイのそばの輪に端糸を通す",
      text: "巻きつけ始めの位置（アイのすぐ上）にできた小さな輪に、端糸を通します。",
      position: 9,
    },
    {
      "@type": "HowToStep",
      name: "クリンチノット: 折り返してできた大きな輪にも端糸を通す",
      text: "新しくできた大きな輪にも端糸をくぐらせます。これが改良クリンチノットの特徴です。",
      position: 10,
    },
    {
      "@type": "HowToStep",
      name: "クリンチノット: 糸を湿らせてゆっくり締める",
      text: "本線と端糸の両方を持ち、糸を湿らせてからゆっくり引っ張って締めます。",
      position: 11,
    },
    {
      "@type": "HowToStep",
      name: "電車結び: 2本の糸を10cmほど重ねる",
      text: "つなぎたい2本の糸の端を、10cmほど重ねて並べます。",
      position: 12,
    },
    {
      "@type": "HowToStep",
      name: "電車結び: 片方の糸でユニノットを結ぶ",
      text: "一方の糸の端で、もう一方の糸を芯にしてユニノット（3〜5回巻き）を結びます。",
      position: 13,
    },
    {
      "@type": "HowToStep",
      name: "電車結び: もう片方の糸でも同じようにユニノットを結ぶ",
      text: "反対側も同様に、もう一方の糸を芯にしてユニノットを結びます。",
      position: 14,
    },
    {
      "@type": "HowToStep",
      name: "電車結び: 両方の本線を引っ張って締める",
      text: "2本の本線をそれぞれ左右に引っ張ると、2つの結び目が中央に寄ってぴったりくっつくまで締めます。",
      position: 15,
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

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
      <span className="font-medium">コツ：</span>
      {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span className="font-medium">よくある失敗：</span>
      {children}
    </div>
  );
}

function KnotSection({
  number,
  title,
  purpose,
  steps,
  tips,
  mistakes,
}: {
  number: number;
  title: string;
  purpose: string;
  steps: { title: string; description: string }[];
  tips: string[];
  mistakes: string[];
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {number}
          </span>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">用途：</span>
          {purpose}
        </p>

        <h3 className="mb-3 font-medium text-foreground">結び方の手順</h3>
        <ol className="list-none space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-foreground">{step.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Hint>
          <ul className="ml-4 mt-1 list-disc space-y-1">
            {tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </Hint>

        <Warning>
          <ul className="ml-4 mt-1 list-disc space-y-1">
            {mistakes.map((mistake, i) => (
              <li key={i}>{mistake}</li>
            ))}
          </ul>
        </Warning>
      </CardContent>
    </Card>
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

        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣り糸の結び方
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            初心者が必ず覚えるべき3つの結び方をマスターしましょう。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">練習のポイント：</span>
          結び方は家で太い紐を使って練習するのがおすすめです。実際の釣り糸は細くて扱いにくいため、まずは太い紐で手順を覚えましょう。
        </div>

        <div className="space-y-6">
          {/* ユニノット */}
          <KnotSection
            number={1}
            title="ユニノット（基本中の基本）"
            purpose="針やサルカン（金具）に糸を結ぶ、最も基本的な結び方です。"
            steps={[
              {
                title: "糸をアイ（穴）に通す",
                description:
                  "針やサルカンの穴（アイ）に糸を通し、先端を15cmほど出します。",
              },
              {
                title: "本線と端糸で輪を作る",
                description:
                  "通した糸（端糸）を折り返し、本線と一緒に指で輪を作ります。",
              },
              {
                title: "端糸を輪に5〜6回巻きつける",
                description:
                  "端糸を作った輪の中に通しながら、本線に5〜6回巻きつけます。巻き数が多いほど強くなります。",
              },
              {
                title: "端糸を引いて結び目を締める",
                description:
                  "端糸をゆっくり引っ張り、巻きつけた部分を締めていきます。",
              },
              {
                title: "本線を引いてアイまでスライドさせる",
                description:
                  "本線を引っ張って、結び目をアイ（穴）のすぐそばまでスライドさせます。",
              },
              {
                title: "余った端糸をカット",
                description:
                  "結び目から2〜3mm残して余った端糸をハサミでカットします。",
              },
            ]}
            tips={[
              "締める前に糸を湿らせると、摩擦熱で糸が弱くなるのを防げます",
              "巻きつけ回数は5〜6回が最適。少なすぎると抜けやすくなります",
              "ゆっくり均一に締めることで、結び目がきれいに仕上がります",
            ]}
            mistakes={[
              "糸を湿らせずに締めると、摩擦熱で強度が落ちる",
              "巻きつけが重なってしまう（均一に巻くのがポイント）",
              "端糸を短く切りすぎて結び目がほどける",
            ]}
          />

          {/* クリンチノット */}
          <KnotSection
            number={2}
            title="クリンチノット"
            purpose="サルカンやスナップ（接続金具）への接続に使います。ユニノットと並ぶ定番の結び方です。"
            steps={[
              {
                title: "糸をアイ（穴）に通す",
                description:
                  "サルカンやスナップのアイに糸を通し、先端を10〜15cm出します。",
              },
              {
                title: "端糸を本線に5〜7回巻きつける",
                description:
                  "端糸を本線にくるくると5〜7回巻きつけます。細い糸は多め、太い糸は少なめに巻きます。",
              },
              {
                title: "アイのそばの輪に端糸を通す",
                description:
                  "巻きつけ始めの位置（アイのすぐ上）にできた小さな輪に、端糸を通します。",
              },
              {
                title: "折り返してできた大きな輪にも端糸を通す",
                description:
                  "前の手順で端糸を通したことで新しくできた大きな輪にも、端糸をくぐらせます。これが「改良クリンチノット」の特徴です。",
              },
              {
                title: "糸を湿らせてゆっくり締める",
                description:
                  "本線と端糸の両方を持ち、糸を湿らせてからゆっくり引っ張って締めます。",
              },
              {
                title: "余った端糸をカット",
                description:
                  "結び目から2〜3mm残して端糸をカットします。",
              },
            ]}
            tips={[
              "改良クリンチノットの方が強度が高いので、こちらを覚えましょう",
              "巻きつける方向を途中で変えないようにしましょう",
              "太い糸（3号以上）では巻き数を5回に減らすときれいに結べます",
            ]}
            mistakes={[
              "最後の輪（大きな輪）に通し忘れる（通常のクリンチノットになってしまう）",
              "巻きつけが緩くてほどける",
              "一気に締めると結び目が崩れる（ゆっくり締めるのがコツ）",
            ]}
          />

          {/* 電車結び */}
          <KnotSection
            number={3}
            title="電車結び（糸と糸の接続）"
            purpose="道糸とハリス（2本の糸）をつなぐ結び方。名前の由来は、2つの結び目が電車のように寄っていくことから。"
            steps={[
              {
                title: "2本の糸を10cmほど重ねる",
                description:
                  "つなぎたい2本の糸の端を、10cmほど重ねて並べます。",
              },
              {
                title: "片方の糸でユニノットを結ぶ",
                description:
                  "一方の糸の端で、もう一方の糸を芯にしてユニノット（3〜5回巻き）を結びます。軽く締めます。",
              },
              {
                title: "もう片方の糸でも同じようにユニノットを結ぶ",
                description:
                  "反対側も同様に、もう一方の糸を芯にしてユニノットを結びます。",
              },
              {
                title: "両方の本線を引っ張る",
                description:
                  "2本の本線をそれぞれ左右に引っ張ると、2つの結び目が中央に寄ってきます。",
              },
              {
                title: "しっかり締める",
                description:
                  "糸を湿らせてから、2つの結び目がぴったりくっつくまでしっかり引っ張ります。",
              },
              {
                title: "余った端糸をカット",
                description:
                  "両方の端糸を2〜3mm残してカットします。",
              },
            ]}
            tips={[
              "2つの結び目の巻き数を揃えると、バランスよく締まります",
              "太さが違う糸をつなぐ場合、細い方の巻き数を多めにすると安定します",
              "結び目のそばに瞬間接着剤を少量つけると、さらに安心です",
            ]}
            mistakes={[
              "2つのユニノットの向きが同じ方向になっている（逆向きに結ぶのが正解）",
              "巻き数が少なすぎて抜ける",
              "結び目同士が離れてしまう（しっかり引っ張って密着させましょう）",
            ]}
          />
        </div>

        {/* 参考動画 */}
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Play className="size-5 text-primary" />
            参考動画
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            実際の手の動きを動画で見ると、格段にわかりやすくなります。
          </p>
          <YouTubeVideoList links={knotVideos} />
        </section>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            結び方をマスターしたら、サビキ釣りに挑戦してみましょう。
          </p>
          <Link
            href="/guide/sabiki"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            サビキ釣り完全ガイドへ
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
