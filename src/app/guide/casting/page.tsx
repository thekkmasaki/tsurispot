import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import type { YouTubeSearchLink } from "@/types";

const castingVideos: YouTubeSearchLink[] = [
  {
    label: "ちょい投げのやり方",
    searchQuery: "ちょい投げ やり方 初心者 スピニング",
    description: "初心者が最初に覚えるべき軽い投げ方",
  },
  {
    label: "オーバーヘッドキャスト",
    searchQuery: "オーバーヘッドキャスト やり方 釣り 初心者",
    description: "最も基本的な投げ方を動画でマスター",
  },
  {
    label: "糸の放すタイミング",
    searchQuery: "スピニングリール 投げ方 指 離すタイミング",
    description: "飛距離を出すための指を離すタイミングを解説",
  },
];

export const metadata: Metadata = {
  title: "投げ方（キャスティング）の基本 - 初心者ガイド",
  description:
    "オーバーヘッドキャスト、サイドキャスト、ちょい投げの3つの投げ方を解説。よくある失敗と対策も紹介。初心者が安全にキャスティングを学べるガイド。",
  openGraph: {
    title: "投げ方（キャスティング）の基本 - 初心者ガイド",
    description:
      "オーバーヘッドキャスト、サイドキャスト、ちょい投げの3つの投げ方を解説。",
    type: "article",
    url: "https://tsurispot.com/guide/casting",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/casting",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "投げ方（キャスティング）の基本 - ちょい投げ・オーバーヘッド・サイドキャスト",
  description:
    "オーバーヘッドキャスト、サイドキャスト、ちょい投げの3つの投げ方を解説。よくある失敗と対策も紹介。初心者が安全にキャスティングを学べるガイド。",
  totalTime: "PT20M",
  tool: [
    { "@type": "HowToTool", name: "釣り竿" },
    { "@type": "HowToTool", name: "スピニングリール（ライン付き）" },
    { "@type": "HowToTool", name: "練習用おもり（本番前の練習時）" },
  ],
  step: [
    {
      "@type": "HowToSection",
      name: "ちょい投げ（初心者向け）",
      itemListElement: [
        {
          "@type": "HowToStep",
          name: "後方の安全確認をする",
          text: "振りかぶる方向に人がいないか必ず確認します。左右も見渡しましょう。",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "ベイルを起こし、人差し指で糸を押さえる",
          text: "リールのベイルを起こして、人差し指の第一関節あたりに糸をかけて押さえます。",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "竿を軽く後ろに引く",
          text: "大きく振りかぶる必要はありません。竿先を肩の高さくらいまで後ろに引きます。",
          position: 3,
        },
        {
          "@type": "HowToStep",
          name: "前方に振り出し、指を離す",
          text: "竿を前に振り出すと同時に、人差し指から糸を放します。竿が前方45度くらいの角度のときに離すのがベストです。",
          position: 4,
        },
        {
          "@type": "HowToStep",
          name: "着水したらベイルを戻す",
          text: "仕掛けが着水したら、ベイルを手で戻して糸を巻ける状態にします。余分な糸のたるみを巻き取りましょう。",
          position: 5,
        },
      ],
    },
    {
      "@type": "HowToSection",
      name: "オーバーヘッドキャスト（基本の投げ方）",
      itemListElement: [
        {
          "@type": "HowToStep",
          name: "後方の安全確認",
          text: "背後と左右に人がいないか確認します。仕掛けの垂らしは30〜50cmが目安です。",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "ベイルを起こし、人差し指で糸を押さえる",
          text: "ちょい投げと同じ要領で、糸を人差し指にかけて押さえます。",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "竿を頭上まで振りかぶる",
          text: "竿を真っすぐ後ろに振りかぶります。竿先が真後ろまで来たところで一瞬止めると、竿にしなりが生まれます。",
          position: 3,
        },
        {
          "@type": "HowToStep",
          name: "前方に振り下ろし、タイミングよく指を離す",
          text: "竿を前方に力強く振り下ろします。竿が正面より少し上（約45度）を向いたときに指を離して糸を放します。",
          position: 4,
        },
        {
          "@type": "HowToStep",
          name: "着水後、ベイルを戻す",
          text: "仕掛けが着水したらベイルを戻し、余分な糸のたるみを巻き取ります。",
          position: 5,
        },
      ],
    },
    {
      "@type": "HowToSection",
      name: "サイドキャスト（狭い場所で）",
      itemListElement: [
        {
          "@type": "HowToStep",
          name: "周囲の安全確認",
          text: "特に竿を振る側の横方向に人がいないか確認します。",
          position: 1,
        },
        {
          "@type": "HowToStep",
          name: "竿を横に構える",
          text: "竿を体の横（利き手側）に水平に構えます。ベイルを起こして糸を指で押さえます。",
          position: 2,
        },
        {
          "@type": "HowToStep",
          name: "横方向に振り出し、指を離す",
          text: "体をひねりながら竿を前方に振り出します。正面に向いたタイミングで指を離します。",
          position: 3,
        },
      ],
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
      name: "投げ方の基本",
      item: "https://tsurispot.com/guide/casting",
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

export default function CastingGuidePage() {
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
          { label: "キャスティングの基本" },
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
            投げ方（キャスティング）の基本
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            安全に遠くへ飛ばすための基本テクニックを学びましょう。
          </p>
        </div>

        <Danger>
          キャスティングの前に必ず後方と周囲の安全確認をしてください。釣り針は鋭く、他の人に当たると大けがにつながります。
        </Danger>

        <div className="space-y-6">
          {/* ちょい投げ */}
          <SectionCard title="ちょい投げ（初心者はここから）">
            <p className="mb-4 text-sm text-muted-foreground">
              軽く投げる方法で、初心者が最初に覚えるべきキャスティングです。10〜30m程度飛ばすことを目標にします。
            </p>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    後方の安全確認をする
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    振りかぶる方向に人がいないか必ず確認します。左右も見渡しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ベイルを起こし、人差し指で糸を押さえる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    リールのベイルを起こして、人差し指の第一関節あたりに糸をかけて押さえます。このとき糸がたるまないようにしましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿を軽く後ろに引く
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    大きく振りかぶる必要はありません。竿先を肩の高さくらいまで後ろに引きます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    前方に振り出し、指を離す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を前に振り出すと同時に、人差し指から糸を放します。竿が前方45度くらいの角度のときに離すのがベストです。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    着水したらベイルを戻す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    仕掛けが着水したら、ベイルを手で戻して糸を巻ける状態にします。余分な糸のたるみを巻き取りましょう。
                  </p>
                </div>
              </li>
            </ol>
            <Hint>
              最初は飛距離を気にせず、コントロール（狙った方向に投げること）を意識しましょう。距離は慣れてから伸ばせます。
            </Hint>
          </SectionCard>

          {/* オーバーヘッドキャスト */}
          <SectionCard title="オーバーヘッドキャスト（基本の投げ方）">
            <p className="mb-4 text-sm text-muted-foreground">
              頭上から振り下ろす最も基本的な投げ方です。飛距離が出やすく、コントロールもしやすいのが特徴です。
            </p>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    後方の安全確認
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    背後と左右に人がいないか確認します。仕掛けの垂らし（竿先から仕掛けまでの距離）は30〜50cmが目安です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ベイルを起こし、人差し指で糸を押さえる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ちょい投げと同じ要領で、糸を人差し指にかけて押さえます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿を頭上まで振りかぶる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を真っすぐ後ろに（頭上を通るように）振りかぶります。竿先が真後ろまで来たところで一瞬止めると、竿にしなりが生まれます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    前方に振り下ろし、タイミングよく指を離す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を前方に力強く振り下ろします。竿が正面より少し上（約45度）を向いたときに指を離して糸を放します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    着水後、ベイルを戻す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    仕掛けが着水したらベイルを戻し、余分な糸のたるみを巻き取ります。
                  </p>
                </div>
              </li>
            </ol>
            <Hint>
              振りかぶりから振り下ろしまで、竿の軌道は一直線になるようにします。斜めに振ると仕掛けが横にずれてしまいます。
            </Hint>
          </SectionCard>

          {/* サイドキャスト */}
          <SectionCard title="サイドキャスト（狭い場所で）">
            <p className="mb-4 text-sm text-muted-foreground">
              横方向に振るキャストで、頭上に障害物がある場所や、後ろのスペースが狭い場所で使います。
            </p>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    周囲の安全確認
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    特に竿を振る側の横方向に人がいないか確認します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿を横に構える
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を体の横（利き手側）に水平に構えます。ベイルを起こして糸を指で押さえます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    横方向に振り出し、指を離す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    体をひねりながら竿を前方に振り出します。正面に向いたタイミングで指を離します。
                  </p>
                </div>
              </li>
            </ol>
            <Warning>
              サイドキャストは仕掛けが低い位置を飛ぶため、周囲の人に当たりやすくなります。特に混雑した釣り場では十分注意してください。
            </Warning>
          </SectionCard>

          {/* よくある失敗と対策 */}
          <SectionCard title="よくある失敗と対策">
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="font-medium text-foreground">
                  糸がぐちゃぐちゃに絡まる（バックラッシュ）
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">原因：</span>
                  ベイルを戻し忘れたまま糸が出続けた、または糸がガイドに絡んでいた。
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">対策：</span>
                  投げる前にベイルの状態を確認する習慣をつけましょう。着水後はすぐにベイルを戻します。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium text-foreground">
                  仕掛けが全然飛ばない
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">原因：</span>
                  糸を離すタイミングが遅い。竿が下を向いてから離すと飛距離が出ません。
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">対策：</span>
                  竿が前方45度を向いた時点で離しましょう。早すぎると真上に飛び、遅すぎると足元に落ちます。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium text-foreground">
                  仕掛けが真上に飛んでしまう
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">原因：</span>
                  糸を離すタイミングが早すぎる。
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">対策：</span>
                  指を離すタイミングを少しだけ遅らせましょう。竿の振りを止めずに、前方に振り切る途中で離します。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium text-foreground">
                  隣の人の方に飛んでしまう
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">原因：</span>
                  竿の振りが斜めになっている。
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium">対策：</span>
                  投げたい方向に向かって真っすぐ振ることを意識します。最初は人の少ない場所で練習しましょう。
                </p>
              </div>
            </div>

            <Danger>
              万が一、他の人に針を引っかけてしまった場合は、無理に抜かず、すぐに謝罪して救急処置を行いましょう。深く刺さった場合は病院を受診してください。
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
            投げ方は動画で見るのが一番わかりやすいです。
          </p>
          <YouTubeVideoList links={castingVideos} />
        </section>

        {/* ガイドに戻る */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            基本をマスターしたら、実際に釣り場に行ってみましょう！
          </p>
          <Link
            href="/guide"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            ガイドトップに戻る
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
