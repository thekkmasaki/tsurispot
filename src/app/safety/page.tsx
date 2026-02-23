import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  LifeBuoy,
  CloudSun,
  AlertTriangle,
  Skull,
  Baby,
  Phone,
  Thermometer,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣りの安全ガイド - ツリスポ",
  description:
    "釣りを安全に楽しむための総合ガイド。ライフジャケットの着用、天候・潮流の確認方法、転落リスク、毒魚への対処、子どもとの釣り、緊急時の連絡先、熱中症・低体温症対策まで網羅的に解説します。",
  openGraph: {
    title: "釣りの安全ガイド - ツリスポ",
    description:
      "釣りを安全に楽しむための総合ガイド。ライフジャケット、天候確認、転落リスク、毒魚、緊急連絡先まで網羅。",
    type: "article",
    url: "https://tsurispot.com/safety",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/safety",
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
      name: "釣りの安全ガイド",
      item: "https://tsurispot.com/safety",
    },
  ],
};

export default function SafetyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "釣りの安全ガイド" }]} />
        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣りの安全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            安全に楽しく釣りをするために、知っておきたい大切な知識をまとめました。
          </p>
        </div>

        {/* 緊急連絡先バナー */}
        <div className="mb-8 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
          <div className="flex items-center gap-2 font-bold">
            <Phone className="h-5 w-5" />
            海での緊急時は「118番」（海上保安庁）
          </div>
          <p className="mt-1 text-sm">
            海での事故・遭難時はすぐに118番に電話してください。陸上での救急は119番です。
            携帯電話の電波が届かない場所もあるため、釣行前に通信状況を確認しましょう。
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. ライフジャケット */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                ライフジャケット着用の重要性
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                釣り中の水難事故で最も多いのが転落・溺水です。ライフジャケットを着用していれば、
                万が一海に落ちても浮力を確保でき、救助されるまでの時間を稼ぐことができます。
              </p>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-3 font-semibold">ライフジャケットの種類</h3>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <span className="font-medium text-foreground">固型式（フローティングベスト）</span>
                      <p className="mt-0.5 text-muted-foreground">
                        浮力材が内蔵されたベスト型。常に浮力があり、水に落ちた瞬間から機能します。子どもや初心者に特におすすめ。
                      </p>
                    </li>
                    <li>
                      <span className="font-medium text-foreground">膨張式（自動・手動）</span>
                      <p className="mt-0.5 text-muted-foreground">
                        水を感知して自動で膨らむタイプと、手動で膨らませるタイプがあります。
                        コンパクトで動きやすいですが、定期的なボンベ交換が必要です。
                      </p>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  重要
                </div>
                <p className="text-sm">
                  2018年より小型船舶乗船時のライフジャケット着用が義務化されています。
                  堤防・磯での着用は義務ではありませんが、強く推奨されます。
                  国土交通省の「桜マーク」付き製品を選びましょう。
                </p>
              </div>
            </div>
          </section>

          {/* 2. 天候・波・潮流 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                天候・波・潮流の確認方法
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                天候の急変は釣り中の事故の大きな原因です。出発前と釣り場での天候確認を徹底しましょう。
              </p>

              <div className="space-y-3">
                {[
                  {
                    title: "天気予報を必ず確認",
                    desc: "出発前に天気予報をチェック。風速5m/s以上、波高1.5m以上の場合は中止を検討しましょう。雷注意報が出ている場合は絶対に釣りに行かないでください。",
                  },
                  {
                    title: "潮汐情報を確認",
                    desc: "満潮・干潮の時刻を事前に確認。特に磯釣りでは潮の満ち引きで足場が水没する危険があります。大潮の日は潮位の変動が大きいため注意。",
                  },
                  {
                    title: "現地での変化に注意",
                    desc: "急に風が強くなった、雲が厚くなった、うねりが大きくなったなどの変化があれば、すぐに撤収しましょう。「もう少しだけ」が命取りになることがあります。",
                  },
                  {
                    title: "離岸流に注意",
                    desc: "砂浜では離岸流（リップカレント）に巻き込まれる危険があります。流されたら岸と平行に泳いで脱出しましょう。",
                  },
                ].map((item) => (
                  <Card key={item.title}>
                    <CardContent className="p-4">
                      <h3 className="mb-1 font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* 3. 転落リスク */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                磯・堤防での転落リスク
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                堤防や磯からの転落事故は毎年数多く発生しています。足場の状況に常に気を配りましょう。
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "テトラポッドの危険",
                    desc: "テトラポッドは滑りやすく、隙間に足を取られやすい。落下すると脱出困難で非常に危険です。",
                  },
                  {
                    title: "堤防の縁に注意",
                    desc: "柵のない堤防の縁は風や波しぶきで滑りやすい。夜釣りでは特に転落のリスクが高まります。",
                  },
                  {
                    title: "磯場の波かぶり",
                    desc: "磯ではうねりや大波が足元まで来ることがあります。波打ち際に立たず、常に高い位置に退避できるように。",
                  },
                  {
                    title: "滑りにくい靴を着用",
                    desc: "フェルトスパイクシューズやスパイクブーツを着用しましょう。サンダルやスニーカーは厳禁です。",
                  },
                ].map((item) => (
                  <Card key={item.title}>
                    <CardContent className="p-4">
                      <h3 className="mb-1 font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
                <p className="text-sm">
                  <span className="font-semibold">
                    立入禁止の防波堤には絶対に入らないでください。
                  </span>
                  フェンスを乗り越えて侵入し、転落する事故が後を絶ちません。
                  どんなに釣れると聞いても、命に代えられるものはありません。
                </p>
              </div>
            </div>
          </section>

          {/* 4. 毒魚・危険な海洋生物 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Skull className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                毒魚・危険な海洋生物
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                釣りでは危険な毒を持つ魚や海洋生物に遭遇することがあります。
                正しい知識を身につけて、安全に対処しましょう。
              </p>

              <div className="space-y-3">
                {[
                  {
                    name: "ゴンズイ",
                    danger: "背ビレと胸ビレに毒棘あり。刺されると激しい痛み。",
                    action: "素手で触らない。プライヤーで針を外し、リリースする。",
                  },
                  {
                    name: "アイゴ（バリ）",
                    danger: "背ビレ・腹ビレ・尻ビレに毒棘あり。刺されると激痛。",
                    action: "タオルで魚体を抑え、ハサミで棘を切ってから処理する。",
                  },
                  {
                    name: "ハオコゼ",
                    danger: "背ビレに毒棘あり。小さいため見落としやすい。",
                    action: "フィッシュグリップで掴む。素手は絶対に避ける。",
                  },
                  {
                    name: "オニオコゼ",
                    danger: "背ビレに強力な毒棘。刺されると激痛で数時間続く。",
                    action: "見かけたら触らない。釣れた場合はプライヤーで慎重に処理。",
                  },
                  {
                    name: "アカエイ",
                    danger: "尾に毒棘あり。砂地に潜んでいるため踏みつけやすい。",
                    action: "浅瀬を歩く際はすり足で。釣れた場合は尾に近づかない。",
                  },
                  {
                    name: "フグ",
                    danger: "内臓にテトロドトキシン（猛毒）。食べると死に至る場合も。",
                    action: "素人調理は絶対にしない。釣れたらリリース。",
                  },
                ].map((creature) => (
                  <div
                    key={creature.name}
                    className="rounded-lg border p-4"
                  >
                    <h3 className="font-semibold text-foreground">
                      {creature.name}
                    </h3>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {creature.danger}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      対処法: {creature.action}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <p className="text-sm">
                  毒棘に刺された場合は、まず患部を40~45度のお湯に30分ほど浸けると痛みが和らぎます。
                  症状がひどい場合はすぐに病院を受診してください。
                </p>
              </div>

              <div className="mt-2">
                <Link
                  href="/fish"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  魚種図鑑で危険な魚を詳しく見る
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* 5. 子どもと釣りに行く際の注意 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Baby className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                子どもと釣りに行く際の注意
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                子どもと一緒の釣りは素晴らしい体験になりますが、安全面での配慮が特に重要です。
              </p>

              <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">ライフジャケットは必ず着用</span>
                  &nbsp;&mdash;&nbsp;子ども用サイズを必ず用意。体に合ったものを選びましょう。
                </li>
                <li>
                  <span className="font-medium text-foreground">常に目を離さない</span>
                  &nbsp;&mdash;&nbsp;水辺では一瞬の油断が事故につながります。大人が必ず付き添いましょう。
                </li>
                <li>
                  <span className="font-medium text-foreground">足場の良い場所を選ぶ</span>
                  &nbsp;&mdash;&nbsp;柵のある堤防や海釣り施設がおすすめ。磯やテトラポッドは避けましょう。
                </li>
                <li>
                  <span className="font-medium text-foreground">釣り針の扱いに注意</span>
                  &nbsp;&mdash;&nbsp;キャスト時は周囲を確認。子どもの後ろに立ち、針が刺さらないよう注意。
                </li>
                <li>
                  <span className="font-medium text-foreground">日差し・水分対策</span>
                  &nbsp;&mdash;&nbsp;帽子・日焼け止めを忘れずに。こまめな水分補給を促しましょう。
                </li>
                <li>
                  <span className="font-medium text-foreground">無理のないスケジュール</span>
                  &nbsp;&mdash;&nbsp;子どもが飽きたら無理に続けず、2~3時間を目安に切り上げましょう。
                </li>
              </ul>

              <div className="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-200">
                <p className="text-sm">
                  <span className="font-medium">おすすめ: </span>
                  海釣り施設やレンタル竿のある釣り堀なら、安全な環境で気軽に楽しめます。
                  ツリスポで「初心者OK」のスポットを探してみましょう。
                </p>
              </div>
            </div>
          </section>

          {/* 6. 緊急時の連絡先 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                緊急時の連絡先
              </h2>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 pr-4 font-medium">連絡先</th>
                          <th className="pb-2 pr-4 font-medium">番号</th>
                          <th className="pb-2 font-medium">用途</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-muted-foreground">
                        <tr>
                          <td className="py-2 pr-4 font-medium text-foreground">海上保安庁</td>
                          <td className="py-2 pr-4 font-bold text-red-600">118</td>
                          <td className="py-2">海での事故・遭難・不審船</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium text-foreground">消防・救急</td>
                          <td className="py-2 pr-4 font-bold text-red-600">119</td>
                          <td className="py-2">ケガ・急病・火災</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium text-foreground">警察</td>
                          <td className="py-2 pr-4 font-bold text-red-600">110</td>
                          <td className="py-2">事件・事故</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <p className="mb-2 text-sm font-medium">
                  通報時に伝えること
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>事故の状況（転落・溺水・ケガなど）</li>
                  <li>場所（釣り場の名前、目印になるもの）</li>
                  <li>けが人の人数と状態</li>
                  <li>自分の名前と電話番号</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. 熱中症・低体温症対策 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                熱中症・低体温症対策
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-red-600">
                      <Thermometer className="h-4 w-4" />
                      熱中症対策（夏）
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>こまめに水分・塩分を補給する</li>
                      <li>帽子・日焼け止めを必ず使用</li>
                      <li>日陰を確保する（パラソル・タープ）</li>
                      <li>最も暑い10時~14時は休憩を取る</li>
                      <li>めまい・吐き気が出たらすぐ涼しい場所へ</li>
                      <li>クーラーボックスに冷たい飲み物を用意</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-600">
                      <Thermometer className="h-4 w-4" />
                      低体温症対策（冬）
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>防寒着を重ね着する（レイヤリング）</li>
                      <li>防風・防水のアウターを着用</li>
                      <li>温かい飲み物を魔法瓶で持参</li>
                      <li>手袋・ネックウォーマー・カイロを用意</li>
                      <li>濡れたらすぐに着替える</li>
                      <li>震えが止まらない場合はすぐに撤収</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>

        {/* 安全チェックリスト */}
        <div className="mt-10 rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-primary" />
            釣行前の安全チェックリスト
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "天気予報・波の高さ・風速を確認した",
              "潮汐表で満潮・干潮の時刻を調べた",
              "ライフジャケットを準備した",
              "滑りにくい靴を履いている",
              "家族や知人に行き先と帰宅予定を伝えた",
              "携帯電話を充電し、防水ケースに入れた",
              "応急処置セット（絆創膏・消毒液）を持った",
              "十分な飲み物と食料を用意した",
              "季節に応じた服装・装備を準備した",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">&#9744;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center sm:mt-14">
          <p className="mb-4 text-base font-medium sm:text-lg">
            安全を確認して、楽しい釣りに出かけよう！
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="min-h-[48px] gap-1.5 rounded-full px-8">
              <Link href="/spots">
                スポットを探す
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-[48px] gap-1.5 rounded-full px-8"
            >
              <Link href="/beginner-checklist">
                持ち物チェックリスト
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
