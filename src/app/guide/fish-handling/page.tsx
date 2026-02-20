import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Scissors, Droplets, Snowflake, Timer, ChefHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "釣った魚の持ち帰り方ガイド - 締め方・血抜き・保冷のコツ",
  description:
    "釣った魚を美味しく持ち帰るための完全ガイド。脳締め・神経締めの方法、血抜きの手順、クーラーボックスの使い方、氷の量と保冷時間、自宅での下処理まで詳しく解説。",
  openGraph: {
    title: "釣った魚の持ち帰り方ガイド - 締め方・血抜き・保冷のコツ",
    description:
      "締め方・血抜き・保冷の方法から自宅での下処理まで詳しく解説。",
    type: "article",
    url: "https://tsurispot.com/guide/fish-handling",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/fish-handling",
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
      name: "釣った魚の持ち帰り方ガイド",
      item: "https://tsurispot.com/guide/fish-handling",
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

export default function FishHandlingGuidePage() {
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
            釣った魚の持ち帰り方ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            正しい処理で釣りたての鮮度をキープ。美味しく食べるための手順を解説します。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">なぜ持ち帰り方が大切なのか：</span>
          釣った魚の味は「釣り場での処理」で8割決まると言われています。どんなに高級な魚でも、処理が悪ければスーパーの魚以下。逆に正しく処理すれば、お店では味わえない最高の一皿になります。
        </div>

        <div className="space-y-6">
          {/* 締め方 */}
          <SectionCard title="締め方（脳締め・神経締め）" icon={Scissors}>
            <p className="mb-4 text-sm text-muted-foreground">
              魚を素早く絶命させることで、身の劣化を防ぎ、旨味を最大限に保ちます。
            </p>

            <h3 className="mb-3 font-medium text-foreground">脳締め</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              魚の脳を専用ピックで破壊し、即死させる方法。中型魚以上（20cm以上）に推奨。
            </p>
            <ol className="mb-4 list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">魚をタオルやグリップで固定</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    暴れる魚をしっかり押さえます。鯛やカサゴなど、ヒレにトゲがある魚は特に注意。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">目と目の間のやや後方をピックで刺す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    脳の位置は目の後ろ上方。成功すると魚がビクッと硬直し、その後脱力します。口が開けば成功のサインです。
                  </p>
                </div>
              </li>
            </ol>

            <h3 className="mb-3 font-medium text-foreground">神経締め</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              脳締めの後、脊髄にワイヤーを通して神経を破壊する上級テクニック。死後硬直を大幅に遅らせ、最高の鮮度を実現します。
            </p>
            <ol className="mb-4 list-none space-y-3">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">脳締めで開けた穴から脊髄管を探す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    背骨の上に沿って走る脊髄管（直径1〜2mm程度の穴）を見つけます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">専用ワイヤーを尾まで通す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ワイヤーを前後に動かして神経を破壊。成功すると体がビクビクと痙攣します。これにより死後硬直の開始が遅れ、鮮度が長持ちします。
                  </p>
                </div>
              </li>
            </ol>

            <div className="my-4 rounded-lg border p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">魚のサイズ別の締め方ガイド</p>
              <ul className="mt-2 space-y-1">
                <li>小型魚（20cm以下：アジ・イワシなど）&rarr; 氷締め（氷水に入れるだけ）</li>
                <li>中型魚（20〜40cm：マダイ・クロダイなど）&rarr; 脳締め＋血抜き</li>
                <li>大型魚（40cm以上：ブリ・ヒラマサなど）&rarr; 脳締め＋血抜き＋神経締め</li>
              </ul>
            </div>

            <Hint>
              神経締めは慣れが必要です。まずは脳締めと血抜きを確実にできるようになってから挑戦しましょう。この2つだけでも十分美味しく持ち帰れます。
            </Hint>
          </SectionCard>

          {/* 血抜きの方法 */}
          <SectionCard title="血抜きの方法" icon={Droplets}>
            <p className="mb-4 text-sm text-muted-foreground">
              魚の血液は時間とともに臭みの原因になります。脳締めの直後に血抜きを行いましょう。
            </p>

            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">エラの付け根を切る</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    エラ蓋を開き、エラの付け根にある太い血管をナイフやハサミで切ります。両側切ると効率が良いですが、片側だけでもOK。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">尾の付け根にも切り込みを入れる（大型魚の場合）</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    40cm以上の大型魚は、尾の付け根にもナイフで切り込みを入れると血抜き効率がアップします。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">海水バケツに頭から浸ける</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    汲んだ海水のバケツに魚を入れ、5〜10分間血を出します。時々魚を動かすと血の排出が促進されます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">水気を拭いてクーラーボックスへ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    血抜きが済んだら、キッチンペーパーやタオルで水気を拭き取ります。
                  </p>
                </div>
              </li>
            </ol>

            <Warning>
              ナイフの取り扱いに注意。フィッシュグリップで魚をしっかり固定し、刃は自分の体から離す方向に使いましょう。釣り場にはバンドエイドも持っていくと安心です。
            </Warning>
          </SectionCard>

          {/* クーラーボックスの使い方 */}
          <SectionCard title="クーラーボックスの使い方" icon={Snowflake}>
            <p className="mb-4 text-sm text-muted-foreground">
              適切な保冷が鮮度を守る最後の砦。クーラーボックスの正しい使い方を知りましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">サイズの選び方</span>
                  &nbsp;&mdash;&nbsp;堤防釣りなら15〜25L、ショアジギングなど大物狙いなら25〜35Lが目安。大きすぎると氷が多く必要になり、持ち運びも大変です。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">保冷力のランク</span>
                  &nbsp;&mdash;&nbsp;断熱材の種類で保冷力が変わります。発泡スチロール &lt; 発泡ウレタン &lt; 真空パネル の順に高性能。日帰り釣りなら発泡ウレタン以上がおすすめ。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">魚を直接氷に触れさせない</span>
                  &nbsp;&mdash;&nbsp;新聞紙で魚を包んでからビニール袋に入れます。直接氷に触れると「氷焼け」を起こし、身が白くなって食感が悪くなります。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">開閉は最小限に</span>
                  &nbsp;&mdash;&nbsp;フタを開けるたびに内部温度が上昇。魚を入れたらできるだけ開けないようにしましょう。
                </span>
              </div>
            </div>

            <Hint>
              出発前にクーラーボックスを氷水で冷やしておく（予冷）と、保冷効果が格段にアップします。ペットボトルの水を凍らせたものを前日からクーラーに入れておくのがおすすめです。
            </Hint>
          </SectionCard>

          {/* 氷の量と保冷時間 */}
          <SectionCard title="氷の量と保冷時間" icon={Timer}>
            <p className="mb-4 text-sm text-muted-foreground">
              適切な氷の量を知っておくと、帰宅まで鮮度をキープできます。
            </p>

            <div className="my-4 rounded-lg border p-4 text-sm text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">氷の量の目安</p>
              <ul className="space-y-1">
                <li>クーラーボックスの容量の1/3〜1/2を氷で満たすのが基本</li>
                <li>15Lのクーラー：板氷1〜2枚＋ペットボトル凍結1〜2本</li>
                <li>25Lのクーラー：板氷2〜3枚＋ペットボトル凍結2〜3本</li>
              </ul>
            </div>

            <div className="my-4 rounded-lg border p-4 text-sm text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">保冷時間の目安</p>
              <ul className="space-y-1">
                <li>発泡スチロール：6〜8時間（夏場は4〜6時間）</li>
                <li>発泡ウレタン：12〜24時間（夏場は8〜12時間）</li>
                <li>真空パネル：24〜48時間（夏場は18〜24時間）</li>
              </ul>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">板氷がおすすめ</span>
                  &nbsp;&mdash;&nbsp;砕いた氷より溶けにくく、保冷時間が長い。釣具店やコンビニで購入できます。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ペットボトル凍結を併用</span>
                  &nbsp;&mdash;&nbsp;2Lペットボトルに水を入れて凍らせたもの。溶けたら飲料水にもなり便利。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">海水氷を作らない</span>
                  &nbsp;&mdash;&nbsp;氷締めの海水は帰る際に捨て、真水の氷だけで保冷しましょう。長時間の海水浸けは身が水っぽくなります。
                </span>
              </div>
            </div>

            <Warning>
              夏場は氷の消耗が激しいため、予備の氷を車に積んでおくか、途中のコンビニで補充する計画を立てましょう。
            </Warning>
          </SectionCard>

          {/* 自宅での下処理 */}
          <SectionCard title="自宅での下処理" icon={ChefHat}>
            <p className="mb-4 text-sm text-muted-foreground">
              帰宅後はできるだけ早く下処理をしましょう。内臓は傷みやすく、放置すると身に臭みが移ります。
            </p>

            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">ウロコを取る</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    尾から頭に向かって、包丁の背やウロコ取りでウロコを丁寧に取り除きます。ウロコが飛び散るので、シンクの中や新聞紙の上で作業しましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">頭を落とし、内臓を取り除く</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    胸ビレの後ろから包丁を入れて頭を落とし、腹を開いて内臓を取り出します。苦玉（胆のう）を潰さないよう注意。苦味が身に移ります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">血合いを洗い流す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    背骨に沿った血合い（暗い赤色の血の塊）を歯ブラシなどでこすり取り、流水で丁寧に洗います。この血合いが残ると臭みの原因に。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">水気を拭き取って保存</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    キッチンペーパーでしっかりと水気を拭き取り、新しいキッチンペーパーで包んでからラップで密封。チルド室（0〜2℃）で保存します。
                  </p>
                </div>
              </li>
            </ol>

            <div className="my-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">保存期間の目安：</span>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>刺身：当日〜翌日がベスト（鮮度の良い魚のみ）</li>
                <li>冷蔵保存（チルド室）：処理後2〜3日</li>
                <li>冷凍保存：ラップ＋ジップロックで空気を抜いて1ヶ月以内</li>
              </ul>
            </div>

            <Hint>
              熟成（寝かせ）という方法もあります。キッチンペーパーで包んでチルド室で1〜3日寝かせると、ATPが旨味成分（イノシン酸）に変わり、味に深みが出ます。マダイやヒラメなどの白身魚に特におすすめです。
            </Hint>

            <Warning>
              すぐに処理できない場合は、内臓がついたままでもチルド室に入れましょう。常温での放置は厳禁。翌朝までには必ず処理してください。
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
                  <Link href="/guide/handling" className="text-primary hover:underline">
                    魚の締め方・持ち帰りガイド（詳細版）
                  </Link>
                  <span className="text-muted-foreground"> - 氷締め・脳締め・血抜き・神経締めの詳細解説</span>
                </li>
                <li>
                  <Link href="/guide/jigging" className="text-primary hover:underline">
                    ショアジギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 大型青物の取り込みと処理</span>
                </li>
                <li>
                  <Link href="/guide/eging" className="text-primary hover:underline">
                    エギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - アオリイカの締め方と持ち帰り</span>
                </li>
                <li>
                  <Link href="/guide/sabiki" className="text-primary hover:underline">
                    サビキ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 小型魚の氷締めの基本</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            釣り場選びに役立つ、潮の読み方も学びましょう。
          </p>
          <Link
            href="/guide/tide"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            潮汐の読み方ガイドへ
          </Link>
        </div>
      </main>
    </>
  );
}
