import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Palette, Settings, Waves, Calendar, Scissors } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "エギング入門ガイド - エギの選び方・シャクリ方・季節別攻略",
  description:
    "エギング初心者のための入門ガイド。エギの選び方（サイズ・カラー・沈下速度）、ロッドとリール、シャクリ方とフォールの使い分け、季節別のポイント、アオリイカの締め方まで解説。",
  openGraph: {
    title: "エギング入門ガイド - エギの選び方・シャクリ方・季節別攻略",
    description:
      "エギの選び方からシャクリ方、季節別攻略まで初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/eging",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/eging",
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
      name: "エギング入門ガイド",
      item: "https://tsurispot.com/guide/eging",
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

export default function EgingGuidePage() {
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
            エギング入門ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            エギ（餌木）を使ったアオリイカ釣り。手軽に始められる人気の釣りスタイルです。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">エギングとは：</span>
          エビの形をした日本発祥の疑似餌「エギ（餌木）」を使ってイカを狙う釣り方。シャクリ（竿をしゃくる動作）でエギを跳ね上げ、フォール（沈下）で抱かせるのが基本。独特の引き味と、食べて美味しいアオリイカは釣り人に大人気のターゲットです。
        </div>

        <div className="space-y-6">
          {/* エギの選び方 */}
          <SectionCard title="エギの選び方" icon={Palette}>
            <p className="mb-4 text-sm text-muted-foreground">
              エギにはサイズ、カラー、沈下速度の違いがあり、状況に応じて使い分けることが釣果に直結します。
            </p>

            <h3 className="mb-3 font-medium text-foreground">サイズの選び方</h3>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">2.5号</span>
                  &nbsp;&mdash;&nbsp;秋の新子（子イカ）シーズンに最適。小さなイカでも抱きやすいサイズ。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">3.0号</span>
                  &nbsp;&mdash;&nbsp;オールシーズン使える万能サイズ。初心者が最初に揃えるべきサイズ。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">3.5号</span>
                  &nbsp;&mdash;&nbsp;春の親イカ（大型）シーズンの定番。飛距離も出やすく、広範囲を探れる。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">4.0号</span>
                  &nbsp;&mdash;&nbsp;深場や潮流の速い場所で使う大型サイズ。大型のアオリイカを狙う上級者向け。
                </span>
              </div>
            </div>

            <h3 className="mb-3 font-medium text-foreground">カラーの選び方</h3>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">オレンジ・ピンク系</span>
                  &nbsp;&mdash;&nbsp;万能カラー。日中の晴天時、朝夕のマズメ時に有効。まずこれから始めましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ナチュラル系（オリーブ・ブラウン）</span>
                  &nbsp;&mdash;&nbsp;クリアウォーターで警戒心の強いイカに有効。日中のプレッシャーが高い場所で活躍。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">赤・紫系</span>
                  &nbsp;&mdash;&nbsp;夜釣りやローライト時のシルエットカラー。水中での存在感が強い。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ケイムラ（蛍光紫）</span>
                  &nbsp;&mdash;&nbsp;紫外線に反応して発光。曇天や深場で威力を発揮する人気カラー。
                </span>
              </div>
            </div>

            <h3 className="mb-3 font-medium text-foreground">沈下速度の選び方</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">シャロー（浅場用）</span>
                  &nbsp;&mdash;&nbsp;沈下速度が遅い。水深1〜3mの浅場や藻場の攻略に。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ベーシック（標準）</span>
                  &nbsp;&mdash;&nbsp;約3秒/mの標準的な沈下速度。水深3〜10mの汎用タイプ。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ディープ（深場用）</span>
                  &nbsp;&mdash;&nbsp;沈下速度が速い。水深10m以上や潮流の速い場所で底取りしやすい。
                </span>
              </div>
            </div>

            <Hint>
              初心者はまず3.0号のオレンジ系ベーシックタイプを2〜3本揃えましょう。根がかりでロストすることもあるので、同じカラーを複数持っておくと安心です。
            </Hint>
          </SectionCard>

          {/* ロッドとリールの選び方 */}
          <SectionCard title="ロッドとリールの選び方" icon={Settings}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ロッド</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>長さ：8〜8.6フィートが標準。取り回しと飛距離のバランスが良い</li>
                  <li>硬さ：ML（ミディアムライト）〜M（ミディアム）。3.5号のエギが快適に扱える硬さ</li>
                  <li>種類：エギング専用ロッドがベスト。軽くてシャクリやすい設計になっている</li>
                  <li>ティップ（穂先）：チューブラーが操作性が良く初心者向け</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">リール</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>番手：2500〜3000番のスピニングリール。シャロースプール（浅溝）タイプが使いやすい</li>
                  <li>ギア比：ノーマルギアでOK。ハイギアだとフォール中のラインスラック管理がしやすい</li>
                  <li>重さ：200〜250g前後の軽量モデル。一日中シャクるため軽さが大切</li>
                  <li>ドラグ：滑らかなドラグ性能。イカは身切れ（イカの身が裂ける）しやすいため</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ラインシステム</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>メインライン：PEライン0.6〜0.8号（150m以上）</li>
                  <li>リーダー：フロロカーボン1.75〜2.5号を1〜1.5m</li>
                  <li>接続：FGノットが理想。電車結びでもOK</li>
                </ul>
              </div>
            </div>

            <Warning>
              エギングではPEラインが主流ですが、風でラインが大きく膨らむ（ラインスラック）ことがあります。風の強い日は風上に向かってキャストするか、PEラインの号数を落として対応しましょう。
            </Warning>
          </SectionCard>

          {/* シャクリ方とフォールの使い分け */}
          <SectionCard title="シャクリ方とフォールの使い分け" icon={Waves}>
            <p className="mb-4 text-sm text-muted-foreground">
              エギングの核心は「シャクリ」と「フォール」の組み合わせ。エギを跳ね上げてイカの注意を引き、沈む間に抱かせるのが基本です。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">2段シャクリ（基本）</h3>
                <p className="text-sm text-muted-foreground">
                  ロッドを素早く2回しゃくり上げる基本アクション。「シャッシャッ」と2回のリズムでエギを跳ね上げます。シャクった後はリールでラインスラック（糸のたるみ）を回収し、ロッドを倒してフォールに入ります。
                </p>
                <div className="mt-2 rounded-lg bg-green-50 p-3 text-xs text-green-800 dark:bg-green-950 dark:text-green-200">
                  難易度：初心者向け / 最もスタンダードなシャクリ方
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">ワンピッチジャーク</h3>
                <p className="text-sm text-muted-foreground">
                  1回のシャクリと1回のリール巻きを連動させる動作。細かいアクションをリズミカルに繰り返すことで、エギが左右にダートし、イカの捕食本能を刺激します。
                </p>
                <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  難易度：中級者向け / 活性の高いイカに有効
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">フォール（沈下）の使い分け</h3>
                <p className="text-sm text-muted-foreground">
                  シャクリの後、エギを沈ませる方法には3種類あります。
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">フリーフォール</span>
                    ：ラインをたるませて自然に沈下。最もナチュラルな動き。着底のアタリが取りにくい。
                  </li>
                  <li>
                    <span className="font-medium text-foreground">テンションフォール</span>
                    ：ラインを張った状態で沈下。カーブを描いて沈むため、アタリが取りやすい。初心者はこちらがおすすめ。
                  </li>
                  <li>
                    <span className="font-medium text-foreground">カーブフォール</span>
                    ：テンションフォールの一種で、より大きなカーブを描かせる。手前に寄ってくるため浅場で有効。
                  </li>
                </ul>
              </div>
            </div>

            <Hint>
              イカがエギを抱くのは主にフォール中。シャクリは「イカの注意を引くため」、フォールは「食わせるため」と意識しましょう。フォール中に「ラインが急に張る」「ラインがふけ（たるむ）」たらアタリのサインです。
            </Hint>
          </SectionCard>

          {/* 季節別のポイント */}
          <SectionCard title="季節別のポイント" icon={Calendar}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">春（3〜6月）- 親イカシーズン</h3>
                <p className="text-sm text-muted-foreground">
                  産卵のために浅場に接岸する大型のアオリイカが狙える最高のシーズン。1kg超の大物も期待できます。藻場（海藻が生えている場所）の近くがポイント。エギは3.5号がメインで、ゆっくりとした動きに反応しやすい。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">夏（7〜8月）- 端境期</h3>
                <p className="text-sm text-muted-foreground">
                  産卵後の親イカは減り、新子がまだ小さいため、やや釣りにくい時期。深場やナイトエギングで狙う中・上級者向けのシーズンです。水温の高い地域では通年で狙えることも。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">秋（9〜11月）- 新子シーズン</h3>
                <p className="text-sm text-muted-foreground">
                  春に生まれたイカが手のひらサイズに成長し、数釣りが楽しめるシーズン。好奇心旺盛でエギに積極的に反応するため、初心者に最もおすすめの時期。エギは2.5〜3.0号で、テンポよく広範囲を探りましょう。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">冬（12〜2月）- ディープエギング</h3>
                <p className="text-sm text-muted-foreground">
                  水温低下に伴いイカは深場へ移動。岸からのエギングは難しくなりますが、ティップランエギング（船釣り）や、温暖な地域ではまだ岸から狙える場所も。ディープタイプのエギで底をじっくり攻める釣りになります。
                </p>
              </div>
            </div>

            <div className="my-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">初心者のベストシーズン：</span>
              秋（9〜11月）が断然おすすめ。イカの数が多く活性も高いため、エギングの基本を身につけるのに最適です。
            </div>
          </SectionCard>

          {/* アオリイカの締め方 */}
          <SectionCard title="アオリイカの締め方" icon={Scissors}>
            <p className="mb-4 text-sm text-muted-foreground">
              アオリイカは締めることで、墨を吐かず鮮度も保てます。釣れたらその場で締めましょう。
            </p>

            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">イカ締めピックを用意する</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    専用のイカ締めピック（先の尖った棒）を使います。ナイフの先端でも代用可能です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">目と目の間を刺す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    イカの頭（実は胴体部分）の目と目の間にピックを刺します。成功すると体の色が一瞬で白く変わります。これが半身が締まった証拠です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">反対側も同様に刺す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    1回では半身しか締まりません。少し位置をずらしてもう一度刺し、反対側も白くなれば全身が締まった状態です。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">ジップロックに入れてクーラーへ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    締めたイカをジップロックなどのビニール袋に入れ、クーラーボックスで冷やします。氷に直接触れないようにしましょう。
                  </p>
                </div>
              </li>
            </ol>

            <Warning>
              締める前のイカは墨を吐きます。イカの胴体側に立つと墨をかけられるため、足（腕）側から近づきましょう。服に墨が付くと落ちにくいので注意してください。
            </Warning>

            <Hint>
              締めたイカは鮮度が保たれ、帰宅後に美味しい刺身やお造りが楽しめます。当日〜翌日が最も美味しいタイミングです。
            </Hint>
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
                  <span className="text-muted-foreground"> - ルアーフィッシングの基本</span>
                </li>
                <li>
                  <Link href="/guide/night-fishing" className="text-primary hover:underline">
                    夜釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ナイトエギングの基本と装備</span>
                </li>
                <li>
                  <Link href="/guide/tide" className="text-primary hover:underline">
                    潮汐の読み方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - エギングに重要な潮の読み方</span>
                </li>
                <li>
                  <Link href="/guide/knots" className="text-primary hover:underline">
                    釣り糸の結び方
                  </Link>
                  <span className="text-muted-foreground"> - エギとの接続に必要な結び方</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            ナイトエギングも人気。夜釣りの基本を学びましょう。
          </p>
          <Link
            href="/guide/night-fishing"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            夜釣り入門ガイドへ
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
