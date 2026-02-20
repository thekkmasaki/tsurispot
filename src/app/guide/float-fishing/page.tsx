import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, CircleDot, Anchor, Bug, Eye, Fish } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ウキ釣り完全ガイド - ウキの種類・仕掛け・アタリの取り方",
  description:
    "ウキ釣り初心者のための完全ガイド。ウキの種類と選び方、仕掛けの作り方、エサの付け方、アタリの取り方を詳しく解説。チヌ・グレ・メバルなど代表的なターゲットも紹介。",
  openGraph: {
    title: "ウキ釣り完全ガイド - ウキの種類・仕掛け・アタリの取り方",
    description:
      "ウキの種類と選び方から仕掛けの作り方、アタリの取り方まで初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/float-fishing",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/float-fishing",
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
      name: "ウキ釣り完全ガイド",
      item: "https://tsurispot.com/guide/float-fishing",
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

export default function FloatFishingGuidePage() {
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
            ウキ釣り完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            ウキの動きでアタリを取る、伝統的で奥深い釣り方を学びましょう。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">ウキ釣りの魅力：</span>
          ウキが水面に浮かぶ様子を眺めながら、沈む瞬間のドキドキ感を味わえるのがウキ釣りの最大の魅力。狙う深さ（タナ）を自由に調整でき、堤防から磯まで幅広い場所で楽しめます。
        </div>

        <div className="space-y-6">
          {/* ウキの種類と選び方 */}
          <SectionCard title="ウキの種類と選び方" icon={CircleDot}>
            <p className="mb-4 text-sm text-muted-foreground">
              ウキにはさまざまな種類があり、釣り方や状況によって使い分けます。代表的なウキを紹介します。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">棒ウキ</h3>
                <p className="text-sm text-muted-foreground">
                  細長い棒状のウキ。感度が高く、小さなアタリも見逃しにくいのが特徴です。風が弱く波が穏やかな日に適しています。堤防での釣りにおすすめです。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">円錐ウキ（ドングリウキ）</h3>
                <p className="text-sm text-muted-foreground">
                  丸みを帯びた安定感のあるウキ。波や風の影響を受けにくく、遠投にも対応できます。磯釣りでグレやチヌを狙う際の定番ウキです。道糸が中通しになっているため仕掛けが絡みにくい利点もあります。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">玉ウキ</h3>
                <p className="text-sm text-muted-foreground">
                  球状のシンプルなウキ。安価で視認性が良く、初心者にも扱いやすいのが特徴。堤防でのちょい投げウキ釣りや、子供と一緒の釣りに最適です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">電気ウキ</h3>
                <p className="text-sm text-muted-foreground">
                  LEDライトが内蔵されたウキ。夜釣りでもアタリが見えるため、夜のウキ釣りには必須です。赤や緑の発光色があり、暗闇でもくっきりと見えます。
                </p>
              </div>
            </div>

            <Hint>
              初心者は視認性の良い「棒ウキ」か「玉ウキ」から始めるのがおすすめ。慣れてきたら状況に応じて円錐ウキにステップアップしましょう。
            </Hint>
          </SectionCard>

          {/* 仕掛けの作り方 */}
          <SectionCard title="仕掛けの作り方" icon={Anchor}>
            <p className="mb-4 text-sm text-muted-foreground">
              基本的なウキ釣り仕掛けの構成を上から順番に解説します。
            </p>

            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">ウキ止めを付ける</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸にウキ止め糸を結びます。ウキ止めの位置がタナ（狙う深さ）を決めます。水深2mを狙うなら、ウキから針まで2mになるよう調整します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">シモリ玉を通す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ウキ止めの下にシモリ玉（小さなビーズ）を通します。これがウキのストッパーの役割を果たします。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">ウキを通す</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸にウキを通します。中通しタイプ（円錐ウキ）は道糸が中を通る構造。棒ウキはスナップで接続します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">ガン玉（オモリ）を打つ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ウキの浮力に合わせたガン玉を道糸に打ちます。ウキのトップ（先端）がちょうど水面に出るくらいが最適な浮力バランスです。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">サルカンを結ぶ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸とハリスの接続にサルカンを使います。糸のヨレ（ねじれ）を防ぐ効果があります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  6
                </span>
                <div>
                  <p className="font-medium text-foreground">ハリスと針を結ぶ</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    サルカンの下にハリス（1〜2号程度）を30〜100cm結び、先端に針を付けます。ハリス付き針を使うと簡単です。
                  </p>
                </div>
              </li>
            </ol>

            <Warning>
              ウキの浮力表示とガン玉の重さを必ず合わせましょう。浮力が合っていないと、ウキが沈みすぎたり浮きすぎたりしてアタリが取れません。
            </Warning>
          </SectionCard>

          {/* エサの付け方 */}
          <SectionCard title="エサの付け方" icon={Bug}>
            <p className="mb-4 text-sm text-muted-foreground">
              ウキ釣りで使う代表的なエサと、針への付け方を紹介します。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">オキアミ</h3>
                <p className="text-sm text-muted-foreground">
                  最も万能なエサ。尾を取り除き、背中側から針を通して腹側に抜きます。身崩れしやすいので、ハリ先がエサから少し出るようにセットするのがコツ。チヌ・グレ狙いの定番です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">虫エサ（アオイソメ・ゴカイ）</h3>
                <p className="text-sm text-muted-foreground">
                  頭の部分から針を刺し、体に沿って通し刺しにします。長い場合は2〜3cmにカットしてもOK。動きで魚を誘うため、できるだけ活きの良い状態で付けましょう。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">練りエサ</h3>
                <p className="text-sm text-muted-foreground">
                  粉末を水で練って作るエサ。針に丸く付けます。手が汚れにくく、虫が苦手な方にもおすすめ。チヌ狙い用の集魚剤入りタイプが人気です。
                </p>
              </div>
            </div>

            <Hint>
              エサが針からズレやすい場合は、針のサイズを見直しましょう。エサに対して針が大きすぎると外れやすくなります。
            </Hint>
          </SectionCard>

          {/* アタリの取り方 */}
          <SectionCard title="アタリの取り方" icon={Eye}>
            <p className="mb-4 text-sm text-muted-foreground">
              ウキ釣り最大の醍醐味は、ウキの動きからアタリ（魚が食いついた合図）を読み取ること。代表的なアタリのパターンを覚えましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">消し込みアタリ</span>
                  &nbsp;&mdash;&nbsp;ウキが一気に水中に沈む。最もわかりやすいアタリで、魚がしっかりエサを咥えた状態。合わせ（ロッドを上げる）のタイミングです。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">モゾモゾアタリ</span>
                  &nbsp;&mdash;&nbsp;ウキが小刻みに上下する。エサを突いている段階。まだ合わせずに待ちましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">横走りアタリ</span>
                  &nbsp;&mdash;&nbsp;ウキが横方向に移動する。魚がエサを咥えたまま泳いでいる状態。ウキが沈んだ瞬間に合わせます。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">浮き上がりアタリ</span>
                  &nbsp;&mdash;&nbsp;ウキが逆に浮き上がる。魚がエサを持ち上げた状態で、チヌに多いパターン。ウキが浮き上がりきったら合わせましょう。
                </span>
              </div>
            </div>

            <div className="my-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">合わせのコツ：</span>
              慌てて合わせると針が外れることが多いです。「ウキが完全に消し込んだ」のを確認してから、ロッドを真上にシャープに持ち上げましょう。グレの場合はやや早め、チヌの場合はしっかり食い込ませてから合わせるのがセオリーです。
            </div>

            <Warning>
              エサ取り（本命以外の小魚）がいると、エサばかり取られてアタリが出ないことがあります。コマセ（撒き餌）を遠くに撒いてエサ取りを分散させる、タナを変える、エサを硬めにするなどの対策が有効です。
            </Warning>
          </SectionCard>

          {/* 代表的なターゲット */}
          <SectionCard title="代表的なターゲット" icon={Fish}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">チヌ（クロダイ）</h3>
                <p className="text-sm text-muted-foreground">
                  堤防や磯で狙える人気ターゲット。引きが強く、食味も良い。オキアミや練りエサで狙います。警戒心が強いため、繊細な仕掛けと静かなアプローチが求められます。
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  時期：通年（春〜秋が好シーズン）/ タナ：底付近〜中層
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">グレ（メジナ）</h3>
                <p className="text-sm text-muted-foreground">
                  磯釣りの王道ターゲット。コマセワークで寄せて食わせる「フカセ釣り」が主流。引きが強く、磯際でのスリリングなやり取りが醍醐味です。
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  時期：秋〜春（冬が最盛期）/ タナ：中層〜やや深め
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">メバル</h3>
                <p className="text-sm text-muted-foreground">
                  夜行性の根魚で、冬〜春が好シーズン。小型の電気ウキを使った夜釣りが人気。虫エサやオキアミで狙います。繊細なアタリを楽しめる釣りものです。
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  時期：冬〜春 / タナ：表層〜中層（夜間）
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 関連ガイド */}
        <div className="mt-8 sm:mt-12">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guide/rigs" className="text-primary hover:underline">
                    釣り仕掛け図解ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ウキ釣り仕掛けの構成を図解で確認</span>
                </li>
                <li>
                  <Link href="/guide/knots" className="text-primary hover:underline">
                    釣り糸の結び方
                  </Link>
                  <span className="text-muted-foreground"> - 仕掛け作りに必要な結び方</span>
                </li>
                <li>
                  <Link href="/guide/tide" className="text-primary hover:underline">
                    潮汐の読み方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ウキ釣りに重要な潮の読み方</span>
                </li>
                <li>
                  <Link href="/guide/night-fishing" className="text-primary hover:underline">
                    夜釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 電気ウキを使った夜のウキ釣り</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            ウキ釣りの基本がわかったら、潮の読み方を学んで釣果アップを目指しましょう。
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
