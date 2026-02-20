import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import type { YouTubeSearchLink } from "@/types";

const setupVideos: YouTubeSearchLink[] = [
  {
    label: "リールの取り付け方",
    searchQuery: "リール 取り付け方 初心者",
    description: "スピニングリールを竿に正しくセットする方法を動画で確認",
  },
  {
    label: "振り出し竿の伸ばし方",
    searchQuery: "振り出し竿 伸ばし方 初心者",
    description: "振り出し竿の正しい伸ばし方と収納方法",
  },
  {
    label: "ガイドへの糸の通し方",
    searchQuery: "釣り竿 糸の通し方 初心者",
    description: "ラインをガイドに通す手順とコツ",
  },
  {
    label: "釣り竿セッティング完全ガイド",
    searchQuery: "釣り竿 セッティング 初心者 やり方",
    description: "竿・リール・ラインの準備を一通り解説",
  },
];

export const metadata: Metadata = {
  title: "竿とリールのセッティング方法 - 初心者ガイド",
  description:
    "リールの取り付け方、竿の継ぎ方、糸の通し方をステップバイステップで解説。初めての釣りでも迷わないセッティング手順ガイド。",
  openGraph: {
    title: "竿とリールのセッティング方法 - 初心者ガイド",
    description:
      "リールの取り付け方、竿の継ぎ方、糸の通し方をステップバイステップで解説。",
    type: "article",
    url: "https://tsurispot.com/guide/setup",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/setup",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "竿とリールのセッティング方法",
  description:
    "リールの取り付け方、竿の継ぎ方、糸の通し方をステップバイステップで解説。初めての釣りでも迷わないセッティング手順ガイド。",
  totalTime: "PT15M",
  tool: [
    { "@type": "HowToTool", name: "釣り竿（振り出し竿）" },
    { "@type": "HowToTool", name: "スピニングリール" },
    { "@type": "HowToTool", name: "釣り糸（ライン）" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "リールシートの位置を確認する",
      text: "竿のグリップ部分にある、リールを取り付けるための金具（リールシート）を探します。ナット（ネジ）を緩めておきましょう。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "リールフットを差し込む",
      text: "リールの足の部分（リールフット）をリールシートの溝に差し込みます。片方を先に引っかけてから、もう片方をはめると簡単です。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "ナットを締めて固定する",
      text: "ナットを手で回して、リールがしっかり固定されるまで締めます。工具は不要です。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "ガタつきがないか確認する",
      text: "リールを軽く揺すってみて、グラグラしなければOKです。ガタつく場合はナットをもう少し締めましょう。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "竿先（穂先）から順番に伸ばす",
      text: "竿の一番細い部分（穂先）から順番に引き出します。一番太い部分（元竿）は最後です。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "各ガイドが一直線になるよう調整する",
      text: "糸を通す輪っか（ガイド）がすべて同じ方向を向くように、各節を回して調整します。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "各節をしっかり固定する",
      text: "引き出した各節がしっかり止まっていることを確認します。緩いと釣りの最中に縮んでしまいます。",
      position: 7,
    },
    {
      "@type": "HowToStep",
      name: "リールのベイル（糸押さえ）を起こす",
      text: "リールの半円形の金属パーツ（ベイル）を上に起こします。これで糸が自由に出るようになります。",
      position: 8,
    },
    {
      "@type": "HowToStep",
      name: "リールから糸を出す",
      text: "糸の先端を持って、50cmほど引き出します。",
      position: 9,
    },
    {
      "@type": "HowToStep",
      name: "竿のガイドに下から順番に通す",
      text: "リールに一番近いガイド（元ガイド）から順番に、竿先のガイドまで糸を通していきます。一つも飛ばさないように注意しましょう。",
      position: 10,
    },
    {
      "@type": "HowToStep",
      name: "穂先まで通したらベイルを戻す",
      text: "すべてのガイドに糸を通し終えたら、ベイルを元に戻します。これで糸がリールに巻き取れる状態になります。",
      position: 11,
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
      name: "竿とリールのセッティング方法",
      item: "https://tsurispot.com/guide/setup",
    },
  ],
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
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

export default function SetupGuidePage() {
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
            竿とリールのセッティング方法
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            釣りを始める前の準備。正しいセッティングで快適な釣りを楽しみましょう。
          </p>
        </div>

        <div className="space-y-6">
          {/* リールの取り付け方 */}
          <SectionCard title="リールの取り付け方">
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールシートの位置を確認する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿のグリップ部分にある、リールを取り付けるための金具（リールシート）を探します。ナット（ネジ）を緩めておきましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールフットを差し込む
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールの足の部分（リールフット）をリールシートの溝に差し込みます。片方を先に引っかけてから、もう片方をはめると簡単です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ナットを締めて固定する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ナットを手で回して、リールがしっかり固定されるまで締めます。工具は不要です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ガタつきがないか確認する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールを軽く揺すってみて、グラグラしなければOKです。ガタつく場合はナットをもう少し締めましょう。
                  </p>
                </div>
              </li>
            </ol>
            <Hint>
              リールが竿の下側に来るように取り付けます。ハンドルは利き手側に来るようにセットしましょう。
            </Hint>
          </SectionCard>

          {/* 竿の継ぎ方 */}
          <SectionCard title="竿の継ぎ方（振り出し竿の場合）">
            <p className="mb-4 text-sm text-muted-foreground">
              振り出し竿は、伸縮式の竿で初心者に最も一般的なタイプです。
            </p>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿先（穂先）から順番に伸ばす
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿の一番細い部分（穂先）から順番に引き出します。一番太い部分（元竿）は最後です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    各ガイドが一直線になるよう調整する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    糸を通す輪っか（ガイド）がすべて同じ方向を向くように、各節を回して調整します。ガイドがずれていると糸の通りが悪くなります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    各節をしっかり固定する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    引き出した各節がしっかり止まっていることを確認します。緩いと釣りの最中に縮んでしまいます。
                  </p>
                </div>
              </li>
            </ol>
            <Danger>
              無理に引っ張ると折れの原因になります。固い場合は接続部分を温かい手で握って温めると外れやすくなります。
            </Danger>
          </SectionCard>

          {/* 糸の通し方 */}
          <SectionCard title="糸の通し方（ラインの通し方）">
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールのベイル（糸押さえ）を起こす
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールの半円形の金属パーツ（ベイル）を上に起こします。これで糸が自由に出るようになります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールから糸を出す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    糸の先端を持って、50cmほど引き出します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿のガイドに下から順番に通す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールに一番近いガイド（元ガイド）から順番に、竿先のガイドまで糸を通していきます。一つも飛ばさないように注意しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    穂先まで通したらベイルを戻す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    すべてのガイドに糸を通し終えたら、ベイルを元に戻します。これで糸がリールに巻き取れる状態になります。
                  </p>
                </div>
              </li>
            </ol>
            <Warning>
              ガイドを一つでも飛ばすと、竿に負担がかかって折れる原因になります。通し終わったら必ず全ガイドを確認しましょう。
            </Warning>
            <Hint>
              糸が細くて通しにくい場合は、糸の先端をセロテープで太くすると通しやすくなります。
            </Hint>
          </SectionCard>
        </div>

        {/* 参考動画 */}
        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Play className="size-5 text-primary" />
            参考動画
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            文字だけではわかりにくい手順を動画で確認しましょう。
          </p>
          <YouTubeVideoList links={setupVideos} />
        </section>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            セッティングができたら、次は糸の結び方を覚えましょう。
          </p>
          <Link
            href="/guide/knots"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            釣り糸の結び方を学ぶ
          </Link>
        </div>
      </main>
    </>
  );
}
