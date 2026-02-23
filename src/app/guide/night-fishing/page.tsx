import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Flashlight, Fish, ShieldAlert, MapPin, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "夜釣り入門ガイド - 必要装備・釣れる魚・安全対策を解説",
  description:
    "夜釣り初心者のための入門ガイド。ヘッドライトやケミホタルなど必要な装備、夜に釣れる魚種、安全対策、常夜灯周りのポイント、夜釣りのマナーまで詳しく解説。",
  openGraph: {
    title: "夜釣り入門ガイド - 必要装備・釣れる魚・安全対策を解説",
    description:
      "夜釣りの装備・釣れる魚・安全対策・マナーを初心者向けに解説。",
    type: "article",
    url: "https://tsurispot.com/guide/night-fishing",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/night-fishing",
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
      name: "夜釣り入門ガイド",
      item: "https://tsurispot.com/guide/night-fishing",
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

function Danger({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
      <span className="font-medium">危険：</span>
      {children}
    </div>
  );
}

export default function NightFishingGuidePage() {
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
            夜釣り入門ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            夜ならではの魚が狙える、静かで特別な釣り体験を楽しみましょう。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">夜釣りの魅力：</span>
          夜行性の魚が活発に動き出す夜は、日中とは異なるターゲットが狙えます。人が少なく静かな環境で、大物がヒットするチャンスも増加。涼しい夏の夜釣りは特に人気があります。
        </div>

        <div className="space-y-6">
          {/* 必要な装備 */}
          <SectionCard title="必要な装備" icon={Flashlight}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜釣りでは昼間の装備に加えて、暗闘対策の道具が必要です。事前にしっかり準備しましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ヘッドライト（必須）</span>
                  &nbsp;&mdash;&nbsp;両手が自由に使えるヘッドライトは夜釣りの必需品。明るさ200〜400ルーメンが目安。赤色LEDモードがあると、魚を警戒させずに手元を照らせます。予備の電池も忘れずに。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ケミホタル（ケミカルライト）</span>
                  &nbsp;&mdash;&nbsp;折ると発光する使い捨てライト。竿先やウキに取り付けてアタリを目視します。25mm、37mm、50mmなどサイズがあり、竿先用には25mmが一般的です。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">電気ウキ</span>
                  &nbsp;&mdash;&nbsp;LEDで発光するウキ。夜のウキ釣りには必須。赤、緑、白などの色があり、周囲の釣り人と色を変えると自分のウキがわかりやすくなります。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ランタン・投光器</span>
                  &nbsp;&mdash;&nbsp;足元を照らすための固定光源。作業時に便利ですが、常に海面を照らし続けると魚が散る可能性があるので注意。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">防寒着・フィッシンググローブ</span>
                  &nbsp;&mdash;&nbsp;夜は昼間より気温がぐっと下がります。夏でも海沿いは風が冷たいため、上着を1枚持っていきましょう。冬の夜釣りは防寒装備が生命線です。指先が出るタイプのフィッシンググローブがあると操作性と防寒を両立できます。
                  <a href="https://amzn.to/3ZOdinM" target="_blank" rel="noopener noreferrer" className="ml-1 text-xs font-medium text-blue-600 hover:underline">おすすめの手袋を見る &rarr;</a>
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ライフジャケット</span>
                  &nbsp;&mdash;&nbsp;暗闇では足元が見えにくく、落水のリスクが日中より高まります。必ず着用してください。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">虫よけスプレー</span>
                  &nbsp;&mdash;&nbsp;夏場は蚊やブヨが多いため必須。虫よけリングや蚊取り線香もあると安心です。
                </span>
              </div>
            </div>

            <Hint>
              ヘッドライトは釣りの最中は消しておくか赤色モードにしましょう。白い光で海面を照らすと魚が驚いて散ってしまいます。手元の作業時だけ点灯するのがマナーです。
            </Hint>
          </SectionCard>

          {/* 夜に釣れる魚種 */}
          <SectionCard title="夜に釣れる魚種" icon={Fish}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜行性の魚は夜になると活発にエサを捕食します。夜釣りならではのターゲットを紹介します。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">メバル</h3>
                <p className="text-sm text-muted-foreground">
                  夜釣りの代表的なターゲット。常夜灯の明暗部に潜み、プランクトンに集まる小魚を捕食します。ルアー（メバリング）でもウキ釣りでも狙えます。冬〜春がベストシーズン。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">アジ</h3>
                <p className="text-sm text-muted-foreground">
                  常夜灯周りに集まる習性があり、夜のアジング（ルアー）やサビキ釣りが人気。群れで回遊するため、回ってくれば連続ヒットが期待できます。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">シーバス（スズキ）</h3>
                <p className="text-sm text-muted-foreground">
                  夜になると浅場に出てきてエサを漁る、ナイトゲームの人気ターゲット。常夜灯の明暗の境目や橋脚周りがポイント。ミノーやバイブレーションで狙います。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">アオリイカ</h3>
                <p className="text-sm text-muted-foreground">
                  ナイトエギングで狙うアオリイカ。日中よりも浅場に寄ってくるため、岸からの射程内に入りやすい。常夜灯周りが好ポイントです。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">タチウオ</h3>
                <p className="text-sm text-muted-foreground">
                  夕方から夜にかけて接岸するタチウオは、ケミホタル付きのテンヤ仕掛けやルアーで狙います。鋭い歯を持つため、ワイヤーリーダーが必要。秋が最盛期です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">カサゴ・アカハタなど根魚</h3>
                <p className="text-sm text-muted-foreground">
                  根魚は夜になると岩から出てきてエサを探します。穴釣りやルアーのワーム釣りで狙えます。日中より警戒心が薄れ、食い気が増します。
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 安全対策 */}
          <SectionCard title="安全対策" icon={ShieldAlert}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜釣りは昼間以上に安全への配慮が必要です。以下の点を必ず守りましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">明るいうちに下見する</span>
                  &nbsp;&mdash;&nbsp;初めての場所には必ず明るい時間帯に到着し、足場の状況、危険箇所、トイレの場所などを確認しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">単独行動は避ける</span>
                  &nbsp;&mdash;&nbsp;夜の釣り場は人が少なく、万が一の事故に対応しにくい環境。できるだけ二人以上で行動しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">足元に細心の注意を払う</span>
                  &nbsp;&mdash;&nbsp;暗闘では段差やロープ、テトラポッドの隙間に気づきにくくなります。移動時は必ずヘッドライトを点灯し、ゆっくり歩きましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ライフジャケットを必ず着用</span>
                  &nbsp;&mdash;&nbsp;暗闘での落水は命に関わります。自動膨張式のライフジャケットでもOK。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">家族に行き先と帰宅予定を伝える</span>
                  &nbsp;&mdash;&nbsp;どこで何時まで釣りをするか、家族や友人に知らせておきましょう。
                </span>
              </div>
            </div>

            <Danger>
              夜の堤防で柵のない場所は特に危険です。海際ギリギリに立たず、余裕を持った位置から釣りをしましょう。酒を飲みながらの夜釣りは落水リスクが大幅に上がるため厳禁です。
            </Danger>
          </SectionCard>

          {/* 常夜灯周りのポイント */}
          <SectionCard title="常夜灯周りのポイント" icon={MapPin}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜釣りの一等地は常夜灯（街灯）の周り。光に集まるプランクトンを食べに小魚が集まり、さらにそれを狙うフィッシュイーターも寄ってきます。
            </p>

            <h3 className="mb-3 font-medium text-foreground">常夜灯周りの攻略法</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">明暗の境目を狙う</span>
                  &nbsp;&mdash;&nbsp;フィッシュイーター（シーバス・メバルなど）は暗い側に潜み、明るい側に出てくる小魚を待ち伏せています。光と影の境界線が最もアタリの出やすいポイントです。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">暗い側からアプローチ</span>
                  &nbsp;&mdash;&nbsp;自分は暗い側に立ち、明るい方向に向かってキャスト。ルアーやエサを暗い側から明るい側に通すのが基本です。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">常夜灯直下も忘れずに</span>
                  &nbsp;&mdash;&nbsp;真下のエリアにはアジやイワシが溜まっていることが多い。サビキ釣りや足元にジグヘッドを落とすだけでも釣れることがあります。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">複数の常夜灯を回る</span>
                  &nbsp;&mdash;&nbsp;一つの常夜灯で反応がなくても、隣の常夜灯には魚がいることも。ランガン（場所を移動しながら釣る）スタイルが効率的です。
                </span>
              </div>
            </div>

            <Hint>
              漁港の常夜灯は特にアジやメバルの実績が高いポイントです。地元の釣具店で「夜釣りでアジが釣れる漁港」を聞くのが近道です。
            </Hint>
          </SectionCard>

          {/* 夜釣りのマナー */}
          <SectionCard title="夜釣りのマナー" icon={Heart}>
            <p className="mb-4 text-sm text-muted-foreground">
              夜釣りでは昼間以上に周囲への配慮が大切です。マナーを守って気持ちよく釣りを楽しみましょう。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ヘッドライトで海面を照らさない</span>
                  &nbsp;&mdash;&nbsp;海面に光を当てると魚が散ってしまいます。周囲の釣り人にも迷惑になるため、手元だけを照らすか赤色モードを使いましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">騒がない・大声を出さない</span>
                  &nbsp;&mdash;&nbsp;夜は音が響きやすく、近隣住民への迷惑になります。また、魚も警戒するため静かに釣りをしましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">車のエンジンを切る</span>
                  &nbsp;&mdash;&nbsp;釣り場近くに車を停める場合、エンジンをかけっぱなしにするのは近隣への騒音になります。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">ゴミは必ず持ち帰る</span>
                  &nbsp;&mdash;&nbsp;暗いと足元のゴミに気づきにくくなります。ゴミ袋を用意し、帰る前にヘッドライトで周囲を確認してすべて持ち帰りましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">先行者への挨拶を忘れずに</span>
                  &nbsp;&mdash;&nbsp;暗いとお互いの存在に気づきにくいため、近くに入る際は「こんばんは、隣に入っていいですか？」と声をかけましょう。
                </span>
              </div>
            </div>

            <Warning>
              夜釣り禁止の釣り場もあります。事前に看板や地元のルールを確認し、禁止されている場所では絶対に夜釣りをしないでください。
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
                  <Link href="/guide/lure" className="text-primary hover:underline">
                    ルアー釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - メバリング・アジングの基本</span>
                </li>
                <li>
                  <Link href="/guide/eging" className="text-primary hover:underline">
                    エギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - ナイトエギングの詳細</span>
                </li>
                <li>
                  <Link href="/guide/float-fishing" className="text-primary hover:underline">
                    ウキ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 電気ウキを使った夜のウキ釣り</span>
                </li>
                <li>
                  <Link href="/guide/tide" className="text-primary hover:underline">
                    潮汐の読み方ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 夜釣りの時間帯選びに役立つ潮の知識</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            潮の読み方を知ると、夜釣りの釣果がさらにアップします。
          </p>
          <Link
            href="/guide/tide"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            潮汐の読み方ガイドへ
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
