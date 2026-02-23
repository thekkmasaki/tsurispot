import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import { ChevronLeft, Waves, BookOpen, Clock, Sunrise, PauseCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "潮汐の読み方ガイド - 大潮・小潮・潮見表の見方を解説",
  description:
    "釣りに重要な潮汐の読み方を初心者向けに解説。大潮・中潮・小潮・長潮・若潮の違い、潮見表の読み方、釣れる潮のタイミング、朝マズメ・夕マズメの重要性、潮止まりの対策まで。",
  openGraph: {
    title: "潮汐の読み方ガイド - 大潮・小潮・潮見表の見方を解説",
    description:
      "大潮・小潮の違いから潮見表の読み方、釣れるタイミングまで解説。",
    type: "article",
    url: "https://tsurispot.com/guide/tide",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/tide",
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
      name: "潮汐の読み方ガイド",
      item: "https://tsurispot.com/guide/tide",
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

export default function TideGuidePage() {
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
            潮汐の読み方ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            潮の動きを理解すれば、釣果が格段にアップします。
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <span className="font-medium">なぜ潮汐が重要なのか：</span>
          潮の満ち引きは月と太陽の引力によって起こります。潮が動くと海水が流れ、プランクトンが運ばれ、それを食べに小魚が集まり、さらに大きな魚が寄ってきます。潮の動きを知ることは、魚が「いつ・どこで食うか」を予測する上で最も重要なファクターの一つです。
        </div>

        <div className="space-y-6">
          {/* 潮の種類 */}
          <SectionCard title="大潮・中潮・小潮・長潮・若潮の違い" icon={Waves}>
            <p className="mb-4 text-sm text-muted-foreground">
              潮の種類は月の満ち欠けに連動して、約15日周期で変化します。釣りへの影響度を理解しましょう。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">大潮（おおしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                    釣りやすさ：高
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  新月と満月の前後に起きる、干満の差が最も大きい潮。潮の流れが速く、海中に変化が生まれるため魚の活性が最も高くなります。釣りに最も適した潮回り。ただし潮が速すぎて仕掛けが流される場合もあります。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">中潮（なかしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                    釣りやすさ：高
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  大潮と小潮の間の潮回り。干満の差は大潮ほどではないが、程よい潮の流れがあり、非常に釣りやすい潮。月の約半分がこの潮回りにあたるため、釣行計画が立てやすいのも魅力です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">小潮（こしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    釣りやすさ：中
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  上弦の月と下弦の月の前後に起きる、干満の差が小さい潮。潮の流れが穏やかで、仕掛けが流されにくい。ウキ釣りやエギングなど繊細な釣りがしやすい反面、魚の活性はやや低めです。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">長潮（ながしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                    釣りやすさ：低
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  小潮の後に来る、干満の差が最も小さい潮。潮がほとんど動かないため、魚の活性は低くなりがち。釣りには不向きとされますが、潮の流れが弱い分、初心者には仕掛けの扱いが楽という一面も。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-medium text-foreground">若潮（わかしお）</h3>
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    釣りやすさ：中
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  長潮の翌日にあたり、潮が「若返る」（再び大きくなり始める）潮。長潮より潮の動きが回復し、徐々に魚の活性も上がってきます。大潮に向かう転換点です。
                </p>
              </div>
            </div>

            <div className="my-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">潮回りの周期：</span>
              大潮 &rarr; 中潮 &rarr; 小潮 &rarr; 長潮 &rarr; 若潮 &rarr; 中潮 &rarr; 大潮... と約15日で一巡します。
            </div>
          </SectionCard>

          {/* 潮見表の読み方 */}
          <SectionCard title="潮見表の読み方" icon={BookOpen}>
            <p className="mb-4 text-sm text-muted-foreground">
              潮見表（タイドグラフ）は、一日の潮の満ち引きをグラフで表したもの。釣行前に必ずチェックしましょう。
            </p>

            <h3 className="mb-3 font-medium text-foreground">潮見表に書いてある情報</h3>
            <div className="mb-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">潮回り</span>
                  &nbsp;&mdash;&nbsp;大潮・中潮・小潮・長潮・若潮のいずれか。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">満潮・干潮の時刻</span>
                  &nbsp;&mdash;&nbsp;1日に2回ずつ満潮と干潮があります（場所によって1回のこともあり）。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">潮位（cm）</span>
                  &nbsp;&mdash;&nbsp;満潮時と干潮時の水位の高さ。その差が大きいほど潮の流れが強い。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">タイドグラフ（曲線）</span>
                  &nbsp;&mdash;&nbsp;横軸が時間、縦軸が潮位のグラフ。曲線の傾きが急な部分ほど潮の流れが速い。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">日の出・日の入り時刻</span>
                  &nbsp;&mdash;&nbsp;マズメ時間の判断に使います。
                </span>
              </div>
            </div>

            <h3 className="mb-3 font-medium text-foreground">潮見表の見方のポイント</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">グラフの傾きに注目</span>
                  &nbsp;&mdash;&nbsp;傾きが急な部分 = 潮がよく動いている時間帯。この時間帯が最も魚が釣れやすい。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">「上げ3分・下げ7分」を意識</span>
                  &nbsp;&mdash;&nbsp;満潮前の3割の時間帯と、干潮に向かう7割の時間帯が特に釣れやすいとされています。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">潮位差をチェック</span>
                  &nbsp;&mdash;&nbsp;満潮と干潮の潮位差が大きい日ほど、潮がよく動き魚の活性が高まります。
                </span>
              </div>
            </div>

            <Hint>
              潮見表は釣り情報サイトやアプリで無料で確認できます。場所ごとに潮の時間が異なるため、必ず釣り場の最寄りの観測地点のデータを参照しましょう。
            </Hint>
          </SectionCard>

          {/* 釣れる潮のタイミング */}
          <SectionCard title="釣れる潮のタイミング" icon={Clock}>
            <p className="mb-4 text-sm text-muted-foreground">
              潮の動きと魚の活性には密接な関係があります。ベストなタイミングを把握しましょう。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">潮が動き始めるタイミング</h3>
                <p className="text-sm text-muted-foreground">
                  満潮・干潮の前後で潮が動き始める瞬間は、魚のスイッチが入りやすいゴールデンタイム。特に「上げ始め」と「下げ始め」は要注目です。潮見表でグラフの曲線が変化し始めるポイントを確認しましょう。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">潮の流れが最も速い時間帯</h3>
                <p className="text-sm text-muted-foreground">
                  満潮と干潮の中間あたりが最も潮の流れが速くなります。この時間帯はプランクトンや小魚が流されて、フィッシュイーターの捕食活動が活発に。ショアジギングやルアー釣りには最高のタイミングです。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">大潮の下げ潮</h3>
                <p className="text-sm text-muted-foreground">
                  多くの釣り人が「最も釣れる」と実感するのが大潮の下げ潮。特に満潮から下げに転じる瞬間は、魚の活性が一気に上がるポイント。このタイミングにマズメが重なれば最強です。
                </p>
              </div>
            </div>

            <div className="my-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">最強の組み合わせ：</span>
              「大潮の下げ潮」＋「朝マズメ」が重なる日は、年に数回しかない最高のタイミング。潮見表とカレンダーを照らし合わせて、この日を狙いましょう。
            </div>
          </SectionCard>

          {/* 朝マズメ・夕マズメ */}
          <SectionCard title="朝マズメ・夕マズメの重要性" icon={Sunrise}>
            <p className="mb-4 text-sm text-muted-foreground">
              「マズメ」とは日の出前後と日の入り前後の薄明るい時間帯のこと。魚が最も活発にエサを食べる時間として、釣り人の間では最重要視されています。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">朝マズメ（あさまずめ）</h3>
                <p className="text-sm text-muted-foreground">
                  日の出前の約1時間〜日の出後の約1時間。夜の間に空腹になった魚が一斉にエサを食べ始めるタイミングです。青物の回遊、シーバスの捕食、イカの接岸など、あらゆる魚種で最もアタリが出やすい時間帯。早起きの価値は十分にあります。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">夕マズメ（ゆうまずめ）</h3>
                <p className="text-sm text-muted-foreground">
                  日の入り前の約1時間〜日没後の約30分。夜に備えてエサを食い溜めする魚や、夜行性の魚が活動を始めるタイミング。朝マズメに次いで釣れやすい時間帯です。夜釣りの開始時間としても最適。
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">なぜマズメに釣れるのか</span>
                  &nbsp;&mdash;&nbsp;光量の変化がトリガー（きっかけ）となり、プランクトンが浮上 &rarr; 小魚が集まる &rarr; 大型魚が捕食、という食物連鎖が活性化するためです。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">季節による時間の変化</span>
                  &nbsp;&mdash;&nbsp;夏は日の出が早く（4:30頃）、冬は遅い（6:30頃）。出発時間は季節に合わせて調整しましょう。
                </span>
              </div>
            </div>

            <Hint>
              「釣りは朝イチ」と言われる所以です。できれば日の出の30分前には釣り場に到着し、準備を済ませておくのが理想。特に人気ポイントでは場所取りも考慮して、さらに早めに到着しましょう。
            </Hint>
          </SectionCard>

          {/* 潮止まりの対策 */}
          <SectionCard title="潮止まりの対策" icon={PauseCircle}>
            <p className="mb-4 text-sm text-muted-foreground">
              「潮止まり」とは、満潮・干潮のピーク付近で潮の流れがほぼ止まる時間帯。魚の活性が下がりやすい時間ですが、対策次第で釣果を出すことは可能です。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">狙うポイントを変える</span>
                  &nbsp;&mdash;&nbsp;潮止まりでも海水が動く場所はあります。河口や水路の出口、堤防の先端など、地形による潮流が発生しやすいポイントに移動しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">仕掛けを軽くする</span>
                  &nbsp;&mdash;&nbsp;潮が止まると、重い仕掛けではルアーやエサの動きが不自然に。軽い仕掛けに変えて、ナチュラルな漂いを演出しましょう。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">底物（根魚）を狙う</span>
                  &nbsp;&mdash;&nbsp;カサゴやハタなどの根魚は、潮の動きに関係なく捕食します。潮止まりの間は穴釣りやワーム釣りで根魚を狙うのが効率的。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">休憩時間にする</span>
                  &nbsp;&mdash;&nbsp;潮止まりは通常30分〜1時間程度。無理に釣り続けるより、食事や道具の整理、次の潮動きに備えた準備の時間に充てるのも賢い選択です。
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <span>
                  <span className="font-medium text-foreground">タナ（深さ）を変える</span>
                  &nbsp;&mdash;&nbsp;潮が止まると魚が定位するレンジ（層）が変わることがあります。表層・中層・底層と幅広く探ってみましょう。
                </span>
              </div>
            </div>

            <Warning>
              大潮の干潮時は水位が極端に下がることがあります。磯場では普段水没している岩が露出し、足元が滑りやすくなるため注意。また、干上がった場所で釣りをしていると、上げ潮で退路を断たれる危険があります。
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
                    <span className="font-medium text-foreground">大潮・中潮が狙い目。</span>
                    潮の動きが活発な日は魚の活性も高くなります。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">潮見表を事前にチェック。</span>
                    満潮・干潮の時刻と潮回りを確認して釣行計画を立てましょう。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">マズメ×潮の動きが最強。</span>
                    朝マズメ・夕マズメと潮の動き始めが重なる時間帯を狙いましょう。
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <span>
                    <span className="font-medium text-foreground">潮止まりも工夫次第。</span>
                    ポイント移動や根魚狙いで、釣果ゼロの時間をなくしましょう。
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 関連ガイド */}
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-xl font-bold">関連ガイド</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guide/float-fishing" className="text-primary hover:underline">
                    ウキ釣り完全ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 潮を読むことが重要なウキ釣りの基本</span>
                </li>
                <li>
                  <Link href="/guide/jigging" className="text-primary hover:underline">
                    ショアジギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 青物回遊と潮の関係</span>
                </li>
                <li>
                  <Link href="/guide/eging" className="text-primary hover:underline">
                    エギング入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - イカの活性と潮の動き</span>
                </li>
                <li>
                  <Link href="/guide/night-fishing" className="text-primary hover:underline">
                    夜釣り入門ガイド
                  </Link>
                  <span className="text-muted-foreground"> - 夜釣りの時間帯と潮の関係</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            潮の知識を活かして、さっそく釣りに出かけましょう。
          </p>
          <Link
            href="/spots"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            釣りスポットを探す
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
