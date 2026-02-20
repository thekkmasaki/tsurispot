import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import { ProductList } from "@/components/affiliate/product-list";
import { getProductsByMethod } from "@/lib/data/products";
import type { YouTubeSearchLink } from "@/types";

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
  title: "サビキ釣り完全ガイド - 初心者でも釣れる手順とコツ",
  description:
    "サビキ釣りの準備から釣り方、片付けまで完全解説。コマセの使い方、タナの探し方、手返しのコツなど初心者が釣果を上げるポイントを紹介。",
  openGraph: {
    title: "サビキ釣り完全ガイド - 初心者でも釣れる手順とコツ",
    description:
      "サビキ釣りの準備から釣り方、片付けまで完全解説。初心者でも釣れるコツを紹介。",
    type: "article",
    url: "https://tsurispot.jp/guide/sabiki",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.jp/guide/sabiki",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "サビキ釣りの始め方 - 準備から釣り方・片付けまで",
  description:
    "サビキ釣りの準備から釣り方、片付けまで完全解説。コマセの使い方、タナの探し方、手返しのコツなど初心者が釣果を上げるポイントを紹介。",
  totalTime: "PT3H",
  supply: [
    { "@type": "HowToSupply", name: "サビキ仕掛け（針サイズ4〜6号）" },
    { "@type": "HowToSupply", name: "コマセ（冷凍アミエビまたはチューブタイプ）" },
    { "@type": "HowToSupply", name: "コマセカゴ" },
  ],
  tool: [
    { "@type": "HowToTool", name: "釣り竿（2〜3mの万能竿）" },
    { "@type": "HowToTool", name: "スピニングリール（2000〜3000番）" },
    { "@type": "HowToTool", name: "バケツ（コマセ用・水くみ用）" },
    { "@type": "HowToTool", name: "ゴム手袋" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "コマセ（撒き餌）を解凍する",
      text: "冷凍アミエビの場合、釣りに行く前日の夜に冷蔵庫に移すか、当日の朝にバケツにぬるま湯を入れて解凍します。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "サビキ仕掛けを竿にセットする",
      text: "竿にリールをセットし、糸をガイドに通したら、糸の先にサビキ仕掛けのスナップを結びます。仕掛けの下（または上）にコマセカゴを取り付けます。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "カゴにコマセを詰める",
      text: "コマセカゴにアミエビを7〜8分目まで詰めます。詰めすぎると海中で出にくくなるので、少し余裕を持たせましょう。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "仕掛けを海に投入する",
      text: "足元にそのまま落とすだけでOKです。投げる必要はありません。ベイルを起こして、仕掛けの重さで自然に沈めます。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "底まで沈めてから少し巻き上げる",
      text: "糸がたるんだら底に着いた合図です。リールを2〜3回巻いて底から少し浮かせます。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "竿を上下にゆっくりシャクる",
      text: "竿を50cm〜1mほど上下に動かして、カゴからコマセを出します。2〜3回シャクったら、竿を止めてアタリを待ちます。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "アタリがあったら竿を立てる",
      text: "ブルブルと手元に振動が伝わったら魚がかかった合図です。竿をゆっくり立てて、魚を逃がさないようにします。",
      position: 7,
    },
    {
      "@type": "HowToStep",
      name: "リールを巻いて魚を取り込む",
      text: "一定の速度でリールを巻いて、仕掛けを回収します。魚が複数かかっている場合は重くなりますが、焦らず巻きましょう。",
      position: 8,
    },
    {
      "@type": "HowToStep",
      name: "片付け: コマセの残りは持ち帰る",
      text: "余ったコマセは海に捨てず、ゴミ袋に入れて持ち帰ります。環境保護と釣り場のマナーです。",
      position: 9,
    },
    {
      "@type": "HowToStep",
      name: "片付け: 仕掛けは丁寧に巻き取る",
      text: "サビキ仕掛けは針が多いので、絡まないように仕掛け巻きに丁寧に巻き取ります。",
      position: 10,
    },
    {
      "@type": "HowToStep",
      name: "片付け: 釣り場を水で流す",
      text: "コマセや魚の汁で汚れた釣り場を、水くみバケツで海水をくんで洗い流します。来たときよりもきれいに。",
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
      item: "https://tsurispot.jp",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "釣りの始め方ガイド",
      item: "https://tsurispot.jp/guide",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "サビキ釣り完全ガイド",
      item: "https://tsurispot.jp/guide/sabiki",
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
      <span className="font-medium">重要：</span>
      {children}
    </div>
  );
}

export default function SabikiGuidePage() {
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
            サビキ釣り完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            初心者の定番、サビキ釣り。準備から片付けまで丁寧に解説します。
          </p>
        </div>

        {/* サビキ釣りとは */}
        <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">サビキ釣りとは？</p>
          <p className="mt-1">
            コマセ（撒き餌）で魚を集め、疑似餌がついた複数の針で一度にたくさんの魚を釣る方法です。アジ、サバ、イワシなどの回遊魚が主なターゲット。堤防から足元に落とすだけなので、投げる技術が不要で初心者に最適です。
          </p>
        </div>

        <div className="space-y-6">
          {/* 必要な道具 */}
          <SectionCard title="必要な道具">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">竿：</span>
                2〜3mの万能竿やサビキ用の竿。初心者セットに含まれていることが多い。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">リール：</span>
                小〜中型のスピニングリール。2000〜3000番が使いやすい。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">
                  サビキ仕掛け：
                </span>
                針のサイズは4〜6号が万能。ピンクスキンやハゲ皮などの種類がある。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">
                  コマセカゴ：
                </span>
                仕掛けの上カゴ式か下カゴ式かで選ぶ。下カゴ式が一般的。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">
                  コマセ（撒き餌）：
                </span>
                冷凍アミエビが定番。釣具店で購入できる。チューブタイプもあり手軽。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">バケツ：</span>
                コマセを入れるバケツと、釣った魚を入れる水くみバケツ。
              </li>
            </ul>
            <Hint>
              初心者は「サビキ釣りセット」を購入するのが最も簡単。竿・リール・仕掛け・カゴがセットで3,000〜5,000円程度です。
            </Hint>
          </SectionCard>

          {/* 準備 */}
          <SectionCard title="準備">
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    コマセ（撒き餌）を解凍する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    冷凍アミエビの場合、釣りに行く前日の夜に冷蔵庫に移すか、当日の朝にバケツにぬるま湯を入れて解凍します。完全に溶けなくても、現場で自然に溶けます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    サビキ仕掛けを竿にセットする
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿にリールをセットし、糸をガイドに通したら、糸の先にサビキ仕掛けのスナップ（接続金具）を結びます。仕掛けの下（または上）にコマセカゴを取り付けます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    カゴにコマセを詰める
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    コマセカゴにアミエビを7〜8分目まで詰めます。詰めすぎると海中で出にくくなるので、少し余裕を持たせましょう。
                  </p>
                </div>
              </li>
            </ol>
            <Warning>
              コマセはにおいが強いので、服や手に付くと落ちにくくなります。使い捨てのゴム手袋があると便利です。
            </Warning>
          </SectionCard>

          {/* 釣り方 */}
          <SectionCard title="釣り方">
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    仕掛けを海に投入する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    足元にそのまま落とすだけでOKです。投げる必要はありません。ベイルを起こして、仕掛けの重さで自然に沈めます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    底まで沈めてから少し巻き上げる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    糸がたるんだら底に着いた合図です。リールを2〜3回巻いて底から少し浮かせます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    竿を上下にゆっくりシャクる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿を50cm〜1mほど上下に動かして、カゴからコマセを出します。2〜3回シャクったら、竿を止めてアタリを待ちます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    アタリがあったら竿を立てる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ブルブルと手元に振動が伝わったら魚がかかった合図です。竿をゆっくり立てて、魚を逃がさないようにします。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    リールを巻いて魚を取り込む
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    一定の速度でリールを巻いて、仕掛けを回収します。魚が複数かかっている場合は重くなりますが、焦らず巻きましょう。
                  </p>
                </div>
              </li>
            </ol>
            <Hint>
              アタリがなければ、タナ（深さ）を変えてみましょう。リールを巻いて浅くしたり、糸を出して深くしたりして、魚のいる層を探します。
            </Hint>
          </SectionCard>

          {/* 釣果アップのコツ */}
          <SectionCard title="釣果アップのコツ">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    コマセは少しずつ出す
                  </span>
                  <br />
                  一度に大量に出すと魚がコマセだけ食べて針に食いつきません。シャクりは2〜3回で十分です。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    タナ（深さ）を変えて探る
                  </span>
                  <br />
                  魚は日によって、時間帯によって泳いでいる深さが変わります。底から中層まで幅広く探りましょう。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    群れが来たら手返しよく
                  </span>
                  <br />
                  回遊魚は群れで移動するため、釣れ始めたらチャンスタイム。素早く仕掛けを回収して再投入を繰り返しましょう。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    朝・夕マヅメを狙う
                  </span>
                  <br />
                  日の出・日の入り前後は魚の活性が高い時間帯。この時間に合わせて釣り場に到着しましょう。
                </div>
              </li>
            </ul>
          </SectionCard>

          {/* 片付け */}
          <SectionCard title="片付け">
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
                    余ったコマセは海に捨てず、ゴミ袋に入れて持ち帰ります。環境保護と釣り場のマナーです。
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
                    サビキ仕掛けは針が多いので、絡まないように仕掛け巻きに丁寧に巻き取ります。再利用できることもあります。
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
                    コマセや魚の汁で汚れた釣り場を、水くみバケツで海水をくんで洗い流します。来たときよりもきれいに。
                  </p>
                </div>
              </li>
            </ol>
            <Danger>
              釣り場を汚したまま帰ると、釣り禁止になる原因になります。必ず掃除して帰りましょう。次に来る人のためにも、マナーを守ることが大切です。
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

        {/* サビキ釣りに必要な道具 */}
        <section className="mt-8 sm:mt-10">
          <ProductList
            products={getProductsByMethod("sabiki")}
            title="サビキ釣りに必要な道具"
            description="サビキ釣りを始めるなら、まずはこれを揃えましょう。セット購入が一番お得です。"
          />
        </section>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            サビキ釣りに慣れたら、次はキャスティング（投げ方）を覚えましょう。
          </p>
          <Link
            href="/guide/casting"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            投げ方の基本を学ぶ
          </Link>
        </div>
      </main>
    </>
  );
}
