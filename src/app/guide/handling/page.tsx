import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "魚の締め方・持ち帰りガイド - 釣った魚を美味しく食べるために",
  description:
    "氷締め・脳締め・血抜き・神経締めの方法を難易度別に解説。釣った魚を新鮮なまま持ち帰り、美味しく食べるためのコツを初心者にもわかりやすく紹介します。",
  openGraph: {
    title: "魚の締め方・持ち帰りガイド - 釣った魚を美味しく食べるために",
    description:
      "釣った魚を新鮮に持ち帰る方法を難易度別に解説。氷締めから神経締めまで。",
    type: "article",
    url: "https://tsurispot.jp/guide/handling",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.jp/guide/handling",
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
      name: "魚の締め方・持ち帰りガイド",
      item: "https://tsurispot.jp/guide/handling",
    },
  ],
};

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

function DifficultyBadge({
  level,
}: {
  level: "初心者向け" | "中級者向け" | "上級者向け";
}) {
  const colorMap = {
    初心者向け:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
    中級者向け:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    上級者向け:
      "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${colorMap[level]}`}
    >
      {level}
    </span>
  );
}

function SectionCard({
  title,
  difficulty,
  children,
}: {
  title: string;
  difficulty?: "初心者向け" | "中級者向け" | "上級者向け";
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold">{title}</h2>
          {difficulty && <DifficultyBadge level={difficulty} />}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export default function HandlingGuidePage() {
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
            魚の締め方・持ち帰りガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            釣った魚を美味しく食べるために。締め方から持ち帰りまで解説します。
          </p>
        </div>

        <div className="space-y-6">
          {/* なぜ締めるのか */}
          <SectionCard title="なぜ魚を締めるのか">
            <p className="mb-3 text-sm text-muted-foreground">
              釣った魚をそのままクーラーボックスに入れると、魚が暴れてストレスを受け、体内にATP（旨味の元になる物質）が消費されてしまいます。適切に締めることで、以下のメリットがあります。
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">
                    鮮度を保つ
                  </span>
                  &nbsp;&mdash;&nbsp;魚が暴れることによる身の劣化を防ぎ、鮮度が長持ちします。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">
                    味が良くなる
                  </span>
                  &nbsp;&mdash;&nbsp;ATP（旨味成分の元）が保たれ、刺身にしたときの味が格段に違います。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">
                    苦しみを減らす
                  </span>
                  &nbsp;&mdash;&nbsp;素早く締めることで、魚が苦しむ時間を最小限にできます。命をいただく以上、できるだけ苦痛を減らすのは釣り人の心得です。
                </span>
              </li>
            </ul>

            <div className="my-4 rounded-lg border p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                締め方を選ぶ目安
              </p>
              <ul className="mt-2 space-y-1">
                <li>
                  小型魚（アジ・イワシ・サバなど 20cm以下）
                  &rarr;&nbsp;氷締め
                </li>
                <li>
                  中型魚（クロダイ・シーバス・マダイなど 20〜50cm）
                  &rarr;&nbsp;脳締め + 血抜き
                </li>
                <li>
                  大型魚・高級魚（ブリ・ヒラマサ・マグロなど 50cm以上）
                  &rarr;&nbsp;脳締め + 血抜き + 神経締め
                </li>
              </ul>
            </div>
          </SectionCard>

          {/* 氷締め */}
          <SectionCard title="氷締め（こおりじめ）" difficulty="初心者向け">
            <p className="mb-4 text-sm text-muted-foreground">
              海水と氷を混ぜた「氷水」に魚をすぐに入れて急速に冷やす方法です。小型魚に最適で、最も簡単な締め方です。数秒で仮死状態になるため、魚への負担も少なくて済みます。
            </p>

            <h3 className="mb-3 font-medium text-foreground">手順</h3>
            <ol className="list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    クーラーボックスに氷と海水を入れる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    氷と海水を3:7くらいの割合で混ぜます。真水ではなく海水を使うのがポイント。温度は0℃近くが理想です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    釣れた魚をすぐに入れる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    針を外したら、素早く氷水の中に入れます。時間が経つほど鮮度が落ちるので、手早さが大切です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    そのまま冷やし続ける
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    魚が動かなくなったら締まった証拠です。そのまま帰るまで冷やし続けましょう。
                  </p>
                </div>
              </li>
            </ol>

            <Hint>
              真水で氷水を作ると、浸透圧の差で魚の身が水っぽくなります。必ず海水を使いましょう。海水汲みバケツで汲んだ海水が便利です。
            </Hint>

            <Warning>
              大型の魚を氷締めにすると、体の中心まで冷えるのに時間がかかり、鮮度が落ちます。20cmを超える魚は脳締め以上の方法がおすすめです。
            </Warning>
          </SectionCard>

          {/* 脳締め */}
          <SectionCard title="脳締め（のうじめ）" difficulty="中級者向け">
            <p className="mb-4 text-sm text-muted-foreground">
              魚の脳を専用の道具で突いて即死させる方法です。「活け締め」とも呼ばれます。魚が暴れる前に瞬時に絶命させるため、身の劣化を最小限に抑えられます。中型以上の魚に適しています。
            </p>

            <h3 className="mb-3 font-medium text-foreground">手順</h3>
            <ol className="list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    魚をしっかり押さえる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    タオルやフィッシュグリップで魚を固定します。ヒレやエラ蓋のトゲに注意してください。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    脳の位置を確認する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    脳は目と目の間のやや後方、眉間の少し上あたりにあります。魚種によって多少異なりますが、目の後ろ上方が目安です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ピックを脳に突き刺す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    イケ締めピック（活け締め用のアイスピックのような道具）を脳の位置に素早く突き刺します。成功すると魚が一瞬ビクッと痙攣し、その後動かなくなります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    クーラーボックスに入れる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    脳締めした後はすぐにクーラーボックスで冷やします。血抜きも併せて行うとさらに効果的です。
                  </p>
                </div>
              </li>
            </ol>

            <Hint>
              うまく脳に当たると、口がパカッと開き、体の色が変わる（体色が白っぽくなる）ことがあります。これが成功のサインです。
            </Hint>

            <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <span className="font-medium">必要な道具：</span>
              イケ締めピック（専用品が1,000〜2,000円程度）、またはナイフの先端でも代用できます。釣具店やネット通販で購入可能です。
            </div>
          </SectionCard>

          {/* 血抜き */}
          <SectionCard title="血抜き（ちぬき）" difficulty="中級者向け">
            <p className="mb-4 text-sm text-muted-foreground">
              魚の血液は時間が経つと臭みの原因になります。エラや尾の付け根を切って血を抜くことで、臭みのない美味しい身になります。脳締めとセットで行うのが基本です。
            </p>

            <h3 className="mb-3 font-medium text-foreground">手順</h3>
            <ol className="list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    脳締めを先に行う
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    脳締めで魚を絶命させてから血抜きを行います。生きている状態で心臓が動いているうちに血を抜く方が効率的です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    エラの付け根を切る
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    エラ蓋を開き、エラの付け根（エラ膜のあたり）をナイフやハサミで切ります。太い血管が通っているので、ここを切ると効率よく血が抜けます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    海水に入れて血を抜く
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    バケツに汲んだ海水の中に魚を頭から入れます。5〜10分ほど浸けると血が抜けます。海水が赤く染まっていくのが見えます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    クーラーボックスで冷やす
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    血抜きが終わったら、水気を拭いてクーラーボックスに入れます。魚が直接氷に触れないよう、新聞紙やビニール袋で包むと身焼け（氷焼け）を防げます。
                  </p>
                </div>
              </li>
            </ol>

            <Warning>
              血抜きにはナイフやハサミを使うため、ケガに十分注意してください。フィッシュグリップで魚をしっかり固定し、刃物は自分の体から離す方向に使いましょう。
            </Warning>

            <Hint>
              尾の付け根にもナイフで切り込みを入れると、血抜きの効率がさらに上がります。特に大きな魚では、エラと尾の両方から血を抜くのが効果的です。
            </Hint>
          </SectionCard>

          {/* 神経締め */}
          <SectionCard title="神経締め（しんけいじめ）" difficulty="上級者向け">
            <p className="mb-4 text-sm text-muted-foreground">
              脊髄にワイヤーを通して神経を破壊する、最も高度な締め方です。脳締め・血抜きに加えて行うことで、死後硬直を大幅に遅らせ、最高の鮮度を保てます。高級魚や大型魚に行われる方法で、料理店でも使われる技術です。
            </p>

            <h3 className="mb-3 font-medium text-foreground">手順</h3>
            <ol className="list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    脳締め・血抜きを行う
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    まず脳締めで魚を絶命させ、血抜きを行います。神経締めは必ず脳締めの後に行います。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    神経の穴を探す
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    脳締めで開けた穴、または尾の切り込みから脊髄の穴（神経が通る管）を探します。背骨の上側に沿って脊髄管が通っています。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ワイヤーを挿入する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    神経締め専用のワイヤーを脊髄管に差し込み、尾まで（または頭まで）通します。ワイヤーを前後に動かして神経を破壊します。成功すると魚の体がビクビクと痙攣します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    すぐに冷やす
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    神経締め後はすぐに氷水で冷やします。適切に処理された魚は、死後硬直が通常より大幅に遅れ、数日間刺身で楽しめます。
                  </p>
                </div>
              </li>
            </ol>

            <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <span className="font-medium">必要な道具：</span>
              神経締め専用ワイヤー（魚のサイズに合った太さ・長さのもの）。釣具店やネット通販で500〜2,000円程度で購入できます。
            </div>

            <Warning>
              神経締めは慣れが必要です。最初は動画を見て学び、小さめの魚で練習してからチャレンジしましょう。無理に行うと身を傷つけてしまうことがあります。
            </Warning>
          </SectionCard>

          {/* 持ち帰り方 */}
          <SectionCard title="持ち帰り方">
            <p className="mb-4 text-sm text-muted-foreground">
              せっかく締めた魚も、持ち帰り方が悪いと鮮度が落ちてしまいます。ポイントは「冷やし続けること」と「直接氷に触れさせないこと」です。
            </p>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">
                    クーラーボックスは必須
                  </span>
                  &nbsp;&mdash;&nbsp;夏場は特に、クーラーボックスがないと魚はあっという間に傷みます。最低でも10L以上のサイズがおすすめ。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">
                    氷は十分に
                  </span>
                  &nbsp;&mdash;&nbsp;ペットボトルを凍らせたものや板氷を使います。釣り場に向かう途中のコンビニで板氷を購入するのも定番です。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">
                    新聞紙やビニール袋で包む
                  </span>
                  &nbsp;&mdash;&nbsp;魚が直接氷に触れると「氷焼け」（身が白くなり食感が悪くなる）を起こします。新聞紙で包んでからビニール袋に入れましょう。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">
                    クーラーボックスの開閉は最小限に
                  </span>
                  &nbsp;&mdash;&nbsp;開けるたびに温度が上がります。魚を入れたらなるべく開けないようにしましょう。
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">
                    車内はエアコンの効いた場所に
                  </span>
                  &nbsp;&mdash;&nbsp;クーラーボックスをトランクに入れると、夏場は車内温度が非常に高くなります。できるだけ涼しい場所に置きましょう。
                </span>
              </li>
            </ul>

            <Hint>
              氷締めで使った海水は帰り際に捨て、水気を切ってから氷だけで冷やす方法もあります。海水に長時間浸けすぎると身が水っぽくなることがあるためです。
            </Hint>
          </SectionCard>

          {/* 帰宅後の処理 */}
          <SectionCard title="帰宅後の処理">
            <p className="mb-4 text-sm text-muted-foreground">
              帰宅したらできるだけ早く魚を処理しましょう。内臓は傷みやすく、放置すると身にまで臭みが移ります。
            </p>

            <h3 className="mb-3 font-medium text-foreground">基本の流れ</h3>
            <ol className="list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ウロコを取る
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    尾から頭に向かって、包丁の背やウロコ取りでウロコを取ります。飛び散るので、シンクの中で行うか新聞紙を敷きましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    内臓とエラを取り除く
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    腹を切り開いて内臓を取り出し、エラも取り除きます。内臓の臭みが身に移る前に、できるだけ早く処理しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    腹の中をきれいに洗う
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    背骨に沿って血合い（黒い血の塊）が残っていることがあります。歯ブラシなどで丁寧にこすり取り、流水で洗います。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    水気を拭いて保存する
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    キッチンペーパーでしっかり水気を拭き取ります。ラップで包むか、ジップロックに入れて冷蔵庫で保存しましょう。
                  </p>
                </div>
              </li>
            </ol>

            <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <span className="font-medium">保存の目安：</span>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>冷蔵保存（チルド室）：処理後2〜3日以内に食べる</li>
                <li>冷凍保存：ラップ+ジップロックで空気を抜いて、1ヶ月以内に食べる</li>
                <li>刺身にする場合：鮮度の良い当日〜翌日がベスト</li>
              </ul>
            </div>

            <Warning>
              すぐに処理できない場合は、内臓がついたまま冷蔵庫のチルド室に入れ、翌日の朝には必ず処理しましょう。常温での放置は厳禁です。
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
                    <span className="font-medium text-foreground">
                      まずは氷締めから始めよう。
                    </span>
                    クーラーボックスに氷と海水を入れておくだけで、小型魚は十分美味しく持ち帰れます。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">
                      中型以上は脳締め+血抜きがおすすめ。
                    </span>
                    この2つをマスターすれば、刺身の味が劇的に変わります。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">
                      神経締めは余裕ができてから。
                    </span>
                    上級テクニックなので、まずは脳締めと血抜きを確実にできるようになってから挑戦しましょう。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">
                      持ち帰りと帰宅後の処理も大切。
                    </span>
                    締め方だけでなく、冷やし方・保存方法までが「美味しく食べる」ための一連の流れです。
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            仕掛けの作り方も学んで、釣りの準備を万全にしましょう。
          </p>
          <Link
            href="/guide/rigs"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            仕掛け図解ガイドへ
          </Link>
        </div>
      </main>
    </>
  );
}
