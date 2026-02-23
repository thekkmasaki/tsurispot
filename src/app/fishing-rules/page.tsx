import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Scale,
  ShieldAlert,
  Ban,
  MapPinOff,
  Calendar,
  Ruler,
  HandHeart,
  Trash2,
  Car,
  Users,
  LifeBuoy,
  ChevronRight,
  ExternalLink,
  Info,
  Shell,
  Fish,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣りのルールとマナー - 漁業権・禁漁期間・リリースサイズまとめ",
  description:
    "釣りをする前に知っておきたいルールとマナーを解説。漁業権の基礎知識、採ってはいけない魚介類、禁漁期間のある魚、リリースサイズの目安、釣り禁止区域、釣り場でのマナーまで網羅的にまとめています。",
  openGraph: {
    title: "釣りのルールとマナー - 漁業権・禁漁期間・リリースサイズまとめ",
    description:
      "釣りをする前に知っておきたいルールとマナーを解説。漁業権、禁漁期間、リリースサイズ、マナーまで網羅。",
    type: "article",
    url: "https://tsurispot.com/fishing-rules",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fishing-rules",
  },
};

const jsonLd = {
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
      name: "釣りのルールとマナー",
      item: "https://tsurispot.com/fishing-rules",
    },
  ],
};

const closedSeasonFish = [
  {
    name: "アユ",
    period: "10月〜5月（河川による）",
    note: "遊漁券が必要。各河川の漁協に確認を。",
  },
  {
    name: "ヤマメ・イワナ",
    period: "10月〜2月（地域による）",
    note: "渓流魚全般に禁漁期あり。渓流釣りは遊漁券必須。",
  },
  {
    name: "ウナギ",
    period: "地域による",
    note: "資源保護のため禁漁期を設ける地域が増加中。",
  },
  {
    name: "ニジマス",
    period: "管理釣り場以外は確認必要",
    note: "自然河川では禁漁期がある場合あり。",
  },
];

export default function FishingRulesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-4">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "ルール・マナー" }]} />
        </div>
        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣りのルールとマナー
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            釣りを楽しむために、知っておきたい大切なルールをまとめました。
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. 漁業権について */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">漁業権について</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                漁業権とは、漁業協同組合（漁協）などが特定の水面で特定の漁業を営む権利のことです。
                一般の人が漁業権の対象となる魚介類を勝手に採ると、漁業権の侵害となり法律で罰せられます。
              </p>

              <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  漁業権侵害の罰則
                </div>
                <p className="text-sm">
                  漁業権を侵害すると、<span className="font-bold">20万円以下の罰金</span>が科される場合があります（漁業法第195条）。
                  「知らなかった」では済まないため、事前の確認が重要です。
                </p>
              </div>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-3 font-semibold">漁業権の種類</h3>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <span className="font-medium text-foreground">第一種共同漁業権</span>
                      <p className="mt-0.5 text-muted-foreground">
                        アワビ、サザエ、ウニ、ナマコ、ワカメなどの定着性の水産動植物を対象とした漁業権。
                        これらは竿釣り・手釣りであっても採取は禁止されています。
                      </p>
                    </li>
                    <li>
                      <span className="font-medium text-foreground">第二種共同漁業権</span>
                      <p className="mt-0.5 text-muted-foreground">
                        刺し網、建網などの漁法を用いた漁業を対象とした漁業権。
                        一般の釣り人が竿で魚を釣る行為は、通常この漁業権には抵触しません。
                      </p>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <Info className="h-4 w-4" />
                  ポイント
                </div>
                <p className="text-sm">
                  一般的な竿釣り・手釣りで魚を釣ることは、多くの場合漁業権の侵害にはなりません。
                  ただし、漁業権の対象となっている貝類や海藻を採ることは禁止です。
                </p>
              </div>
            </div>
          </section>

          {/* 2. 採ってはいけない魚介類 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                採ってはいけない魚介類
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                以下の魚介類は漁業権の対象となっていることが多く、
                一般の人が採取すると罰せられる可能性があります。
              </p>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                <div className="mb-3 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
                  <Ban className="h-4 w-4" />
                  採取禁止の代表例
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  {["アワビ", "サザエ", "ウニ", "ナマコ", "ワカメ", "テングサ", "イセエビ", "タコ（一部地域）", "カキ（天然）"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-1.5 text-amber-800 dark:text-amber-200"
                      >
                        <Shell className="h-3.5 w-3.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <p className="mb-2 text-sm font-medium">
                  対象となる魚介類は都道府県によって異なります。確認方法:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>各都道府県の水産課に問い合わせ</li>
                  <li>各地域の漁業協同組合のWebサイトを確認</li>
                  <li>釣り場の看板や案内表示をチェック</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. 禁漁期間のある魚 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                禁漁期間のある魚
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                魚の産卵期や資源保護のために、一定の期間釣りが禁止される魚種があります。
                特に川釣り・渓流釣りでは禁漁期が設けられていることが多いです。
              </p>

              <div className="space-y-3">
                {closedSeasonFish.map((fish) => (
                  <Card key={fish.name}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Fish className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold">{fish.name}</h3>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {fish.note}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-200">
                          {fish.period}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  注意
                </div>
                <p className="text-sm">
                  禁漁期間は地域や河川によって異なります。
                  必ず釣行前に各都道府県の内水面漁業調整規則や漁協のルールを確認してください。
                </p>
              </div>
            </div>
          </section>

          {/* 4. サイズ制限（リリースサイズ） */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                サイズ制限（リリースサイズ）
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                小さすぎる魚はまだ成長途中です。資源を守るため、一定のサイズ以下の魚はリリース（放流）しましょう。
              </p>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-3 font-semibold">一般的なリリースサイズの目安</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 pr-4 font-medium">魚種</th>
                          <th className="pb-2 font-medium">目安サイズ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-muted-foreground">
                        <tr><td className="py-2 pr-4">メバル</td><td className="py-2">15cm以下はリリース</td></tr>
                        <tr><td className="py-2 pr-4">アジ</td><td className="py-2">15cm以下はリリース</td></tr>
                        <tr><td className="py-2 pr-4">クロダイ（チヌ）</td><td className="py-2">25cm以下はリリース</td></tr>
                        <tr><td className="py-2 pr-4">スズキ（シーバス）</td><td className="py-2">40cm以下はリリース</td></tr>
                        <tr><td className="py-2 pr-4">ヒラメ</td><td className="py-2">30cm以下はリリース</td></tr>
                        <tr><td className="py-2 pr-4">マゴチ</td><td className="py-2">30cm以下はリリース</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    ※ 上記は一般的な目安です。地域の漁業調整規則で定められたサイズ制限がある場合はそちらを優先してください。
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 5. 釣り禁止区域 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <MapPinOff className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">釣り禁止区域</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                以下のような場所では釣りが禁止されている場合があります。看板や案内に従いましょう。
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "港の立入禁止区域",
                    desc: "フェンスや「立入禁止」の看板がある場所。事故防止のため厳守。",
                  },
                  {
                    title: "海水浴場（シーズン中）",
                    desc: "夏期の海水浴場では、遊泳者の安全のため釣りが禁止されます。",
                  },
                  {
                    title: "自然保護区域",
                    desc: "海洋保護区や自然公園の特別保護地区など。採捕が禁止されています。",
                  },
                  {
                    title: "河口付近の規制区域",
                    desc: "サケ・マスの遡上時期は河口付近での釣りが制限される場合があります。",
                  },
                ].map((area) => (
                  <Card key={area.title}>
                    <CardContent className="p-4">
                      <h3 className="mb-1 font-semibold text-foreground">
                        {area.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{area.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
                <p className="text-sm">
                  <span className="font-semibold">立入禁止区域への侵入は絶対にやめましょう。</span>
                  毎年、立入禁止の防波堤からの転落事故が後を絶ちません。自分の命を守るためにもルールを厳守してください。
                </p>
              </div>
            </div>
          </section>

          {/* 6. マナー */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">
                釣り場でのマナー
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                みんなが気持ちよく釣りを楽しめるよう、マナーを守りましょう。
                マナー違反が続くと釣り禁止になる場所もあります。
              </p>

              <div className="space-y-3">
                {[
                  {
                    icon: Trash2,
                    title: "ゴミは必ず持ち帰る",
                    desc: "仕掛けのパッケージ、切れた釣り糸、エサの袋など、すべてのゴミを持ち帰りましょう。釣り糸は海鳥や海洋生物に絡まる危険があります。",
                    color: "text-green-600",
                  },
                  {
                    icon: Car,
                    title: "駐車ルールを守る",
                    desc: "路上駐車や漁港内の無断駐車は厳禁。決められた駐車場を利用し、地元の方の迷惑にならないようにしましょう。",
                    color: "text-blue-600",
                  },
                  {
                    icon: Users,
                    title: "地元漁師への配慮",
                    desc: "漁港は漁師さんの仕事場です。漁船の近くや作業場所では釣りを避け、作業の邪魔にならないよう注意しましょう。",
                    color: "text-amber-600",
                  },
                  {
                    icon: LifeBuoy,
                    title: "安全装備を着用する",
                    desc: "堤防や磯ではライフジャケットの着用を強く推奨します。夜釣りではヘッドライトも必須。自分の安全は自分で守りましょう。",
                    color: "text-red-600",
                  },
                ].map((manner) => (
                  <div
                    key={manner.title}
                    className="flex gap-3 rounded-lg border p-4"
                  >
                    <manner.icon
                      className={`h-5 w-5 shrink-0 ${manner.color}`}
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {manner.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {manner.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center sm:mt-14">
          <p className="mb-4 text-base font-medium sm:text-lg">
            ルールを守って、楽しい釣りライフを！
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
              <Link href="/guide">
                初心者ガイドを見る
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
