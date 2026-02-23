import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Fish,
  MapPin,
  ShieldCheck,
  HelpCircle,
  Anchor,
  Target,
  Waves,
  Package,
  Heart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Sun,
  CloudRain,
  Scissors,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { fishSpecies } from "@/lib/data/fish";

export const metadata: Metadata = {
  title: "はじめての釣り完全ガイド",
  description:
    "釣り初心者のための完全ガイド。道具選びから釣り場の見つけ方、基本の釣り方、安全対策まで、このページだけで全部わかります。釣具店でQRコードからアクセスした方もぜひご活用ください。",
  openGraph: {
    title: "はじめての釣り完全ガイド | ツリスポ",
    description:
      "今日初めて釣りに来た方のための完全ガイド。道具選び・釣り場の見つけ方・基本の釣り方まで全部わかります。",
    type: "article",
    url: "https://tsurispot.com/for-beginners",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/for-beginners",
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
      name: "はじめての釣り完全ガイド",
      item: "https://tsurispot.com/for-beginners",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "釣り竿はどれを選べばいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者には万能竿（2.7〜3.6m）がおすすめです。サビキ釣り・ちょい投げ・ウキ釣りなど幅広い釣り方に対応でき、1本でいろいろな釣りが楽しめます。釣具店で「万能竿」または「初心者セット」と伝えれば、店員さんが最適なものを選んでくれます。",
      },
    },
    {
      "@type": "Question",
      name: "エサはどこで買える？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "釣具店で購入するのが最も確実です。サビキ釣り用のアミエビはチューブタイプなら釣具店以外にも一部のコンビニやホームセンターで購入できます。青イソメなどの生きエサは釣具店でのみ購入可能です。釣り場近くの釣具店なら、その日のおすすめエサも教えてもらえます。",
      },
    },
    {
      "@type": "Question",
      name: "何時に行けばいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "朝マズメ（日の出前後の1〜2時間）が最も釣れやすい時間帯です。夕マズメ（日没前後）も好タイミングです。日中でも釣れないわけではありませんが、魚の活性が高い朝夕がおすすめ。初めてなら午前中の早い時間帯に行くと良いでしょう。",
      },
    },
    {
      "@type": "Question",
      name: "雨の日でも釣れる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "小雨程度なら問題なく釣りができます。むしろ雨の日は釣り人が少なく、魚の警戒心も薄れるため、好釣果になることもあります。ただし、雷を伴う雨や強風の日は大変危険なので、釣りは中止してください。レインウェアと滑りにくい靴は必須です。",
      },
    },
    {
      "@type": "Question",
      name: "釣りに免許は必要？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "海釣りの場合、基本的に免許は不要です。ただし、一部の釣り施設では入場料がかかります。川や湖での釣りは遊漁券（遊漁料）が必要な場合が多いので、事前に確認しましょう。",
      },
    },
    {
      "@type": "Question",
      name: "釣った魚はどうすればいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "クーラーボックスに氷と一緒に入れて持ち帰り、自宅で調理できます。アジならフライや刺身、イワシなら煮付けが定番です。食べない場合や小さすぎる魚は、優しく海に戻してあげましょう。",
      },
    },
  ],
};

// 月名を取得
function getMonthName(month: number): string {
  return `${month}月`;
}

export default function ForBeginnersPage() {
  // 現在月を取得（SSG時にビルド月が入る）
  const currentMonth = new Date().getMonth() + 1;

  // 初心者向け（difficulty: "beginner"）かつ今月がシーズンの魚をフィルタ
  const beginnerFishThisMonth = fishSpecies
    .filter(
      (f) =>
        f.difficulty === "beginner" &&
        (f.seasonMonths.includes(currentMonth) ||
          f.peakMonths.includes(currentMonth))
    )
    .sort((a, b) => {
      // 旬（peakMonths）の魚を優先
      const aIsPeak = a.peakMonths.includes(currentMonth) ? 1 : 0;
      const bIsPeak = b.peakMonths.includes(currentMonth) ? 1 : 0;
      if (bIsPeak !== aIsPeak) return bIsPeak - aIsPeak;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* セクション1: ヒーロー */}
      <section className="bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:py-20">
          <Badge className="mb-4 border-white/30 bg-white/20 text-white hover:bg-white/30">
            <Fish className="mr-1 size-3" />
            初心者の方へ
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            はじめての釣り、
            <br />
            完全ガイド
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-sky-100 sm:text-lg">
            このページだけで、道具選びから釣り場の見つけ方まで全部わかります。
            <br className="hidden sm:inline" />
            今日が釣りデビューの日になります。
          </p>

          {/* 目次ナビ */}
          <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { href: "#gear", icon: Package, label: "道具選び" },
              { href: "#fish-now", icon: Fish, label: "今月の魚" },
              { href: "#where", icon: MapPin, label: "釣り場探し" },
              { href: "#methods", icon: Anchor, label: "釣り方" },
              { href: "#safety", icon: ShieldCheck, label: "安全対策" },
              { href: "#faq", icon: HelpCircle, label: "よくある質問" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "はじめての釣り完全ガイド" },
          ]}
        />

        <div className="space-y-8">
          {/* セクション2: まず何を買えばいい？ */}
          <section id="gear">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Package className="size-5" />
                  <h2 className="text-lg font-bold sm:text-xl">
                    まず何を買えばいい？
                  </h2>
                </div>
                <p className="mt-1 text-sm text-amber-100">
                  5,000円あれば今日から釣りが始められます
                </p>
              </div>
              <CardContent className="space-y-6 pt-6">
                {/* 最低限の道具 */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                    <CheckCircle2 className="size-4 text-green-500" />
                    最低限必要な道具
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        name: "釣り竿（ロッド）",
                        detail:
                          "万能竿またはサビキセット用。2.7〜3.6m程度。",
                      },
                      {
                        name: "リール",
                        detail:
                          "小型スピニングリール（2000〜3000番）。糸付きが便利。",
                      },
                      {
                        name: "仕掛け",
                        detail:
                          "サビキ仕掛け（4〜6号）+ コマセカゴ。2〜3セットあると安心。",
                      },
                      {
                        name: "エサ",
                        detail:
                          "サビキ釣りならアミエビ（チューブタイプが手軽）。",
                      },
                      {
                        name: "バケツ",
                        detail:
                          "折りたたみ式が便利。水汲み・魚入れ・手洗いに使用。",
                      },
                      {
                        name: "ハサミ",
                        detail: "釣り糸を切るために必要。小さなハサミでOK。",
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex gap-3 rounded-lg border p-3"
                      >
                        <div className="mt-0.5 size-2 shrink-0 rounded-full bg-amber-400" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 予算別 */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                    <Scissors className="size-4 text-amber-500" />
                    予算別セット提案
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:bg-green-950">
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        3,000円
                      </p>
                      <p className="text-xs font-medium text-green-600 dark:text-green-400">
                        お試しコース
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-green-800 dark:text-green-200">
                        <li>- サビキ竿+リールセット</li>
                        <li>- サビキ仕掛け 1セット</li>
                        <li>- アミエビ（チューブ）</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:bg-blue-950">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          5,000円
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                        >
                          おすすめ
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        安心スタートコース
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-200">
                        <li>- サビキ竿+リールセット</li>
                        <li>- サビキ仕掛け 2〜3セット</li>
                        <li>- アミエビ + 予備エサ</li>
                        <li>- 折りたたみバケツ</li>
                        <li>- ハサミ + タオル</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 dark:bg-purple-950">
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        10,000円
                      </p>
                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        しっかりコース
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-purple-800 dark:text-purple-200">
                        <li>- ワンランク上の竿+リール</li>
                        <li>- 仕掛け各種</li>
                        <li>- クーラーボックス</li>
                        <li>- バケツ + 小物一式</li>
                        <li>- プライヤー（針外し）</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  <span className="font-medium">ヒント：</span>
                  釣具店で「初心者セットをください」と伝えるのが一番簡単です。店員さんがその日の状況に合わせたベストなセットを選んでくれます。
                </div>

                <div className="text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/guide/budget">
                      予算の詳しいガイドを見る
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* セクション3: 今月釣れる魚は？ */}
          <section id="fish-now">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Fish className="size-5" />
                  <h2 className="text-lg font-bold sm:text-xl">
                    {getMonthName(currentMonth)}に釣れる魚は？
                  </h2>
                </div>
                <p className="mt-1 text-sm text-teal-100">
                  初心者でも釣りやすい今月のおすすめ魚種
                </p>
              </div>
              <CardContent className="pt-6">
                {beginnerFishThisMonth.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {beginnerFishThisMonth.map((fish) => {
                      const isPeak = fish.peakMonths.includes(currentMonth);
                      return (
                        <Link
                          key={fish.slug}
                          href={`/fish/${fish.slug}`}
                          className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:border-teal-400 hover:bg-teal-50/50"
                        >
                          <div className="shrink-0">
                            <div className="flex size-10 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                              <Fish className="size-5" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground group-hover:text-teal-700">
                                {fish.name}
                              </p>
                              {isPeak && (
                                <Badge
                                  variant="secondary"
                                  className="bg-orange-100 text-orange-700 text-[10px] px-1.5"
                                >
                                  旬
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                              {fish.description}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-teal-600">
                              この魚の釣り方を見る
                              <ChevronRight className="size-3" />
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <Fish className="mx-auto mb-2 size-8 text-gray-300" />
                    <p>
                      {getMonthName(currentMonth)}
                      は初心者向けの魚種が少ない時期です。
                    </p>
                    <p className="mt-1">
                      管理釣り場なら季節を問わず楽しめます。
                    </p>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/fish">
                      すべての魚種を見る
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* セクション4: どこで釣ればいい？ */}
          <section id="where">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="size-5" />
                  <h2 className="text-lg font-bold sm:text-xl">
                    どこで釣ればいい？
                  </h2>
                </div>
                <p className="mt-1 text-sm text-blue-100">
                  初心者に安全でおすすめの釣り場タイプ
                </p>
              </div>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-950/50">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                        おすすめ No.1
                      </Badge>
                      <h3 className="font-bold text-foreground">
                        堤防・漁港
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      足場がフラットで安全。車を近くに停められることが多く、トイレがある場所も。サビキ釣りでアジやイワシが狙えます。初心者は堤防の内海側（港内側）がおすすめです。
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">道具レンタルあり</Badge>
                      <h3 className="font-bold text-foreground">
                        管理釣り場・海釣り公園
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      釣り竿のレンタルがあるので手ぶらでOK。スタッフが常駐しており、釣り方を教えてもらえます。柵があるので安全性も高く、ファミリーにぴったりです。
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">砂浜・サーフ</Badge>
                      <h3 className="font-bold text-foreground">
                        砂浜（サーフ）
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      ちょい投げ釣りでキスやハゼが狙えます。広いスペースでのびのび楽しめますが、波打ち際には注意が必要です。
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  <span className="font-medium">ヒント：</span>
                  初めての場所に行くときは、「トイレ」「駐車場」「釣具店が近い」の3つを事前にチェックしておくと安心です。
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button asChild size="lg" className="min-h-[48px] w-full sm:w-auto">
                    <Link href="/spots">
                      <Compass className="mr-2 size-4" />
                      近くの釣りスポットを探す
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Link href="/guide/family">
                      ファミリー向けガイドを見る
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* セクション5: 基本の釣り方3選 */}
          <section id="methods">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <Anchor className="size-5" />
                  <h2 className="text-lg font-bold sm:text-xl">
                    基本の釣り方3選
                  </h2>
                </div>
                <p className="mt-1 text-sm text-green-100">
                  初心者でもすぐにできる、定番の釣り方
                </p>
              </div>
              <CardContent className="space-y-4 pt-6">
                {/* サビキ釣り */}
                <div className="rounded-lg border-2 border-green-200 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Anchor className="size-5 text-green-600" />
                    <h3 className="text-lg font-bold">サビキ釣り</h3>
                    <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs">
                      最もおすすめ
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    コマセ（撒き餌）で魚を集め、疑似餌のついた仕掛けで釣ります。足元に落とすだけなので投げる技術が不要。アジ・サバ・イワシなど群れで釣れるので、初心者でもたくさんの魚に出会えます。
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/guide/sabiki"
                      className="inline-flex items-center text-sm font-medium text-green-600 hover:underline"
                    >
                      サビキ釣りの詳しいやり方を見る
                      <ChevronRight className="ml-0.5 size-4" />
                    </Link>
                  </div>
                </div>

                {/* ちょい投げ */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Target className="size-5 text-blue-500" />
                    <h3 className="text-lg font-bold">ちょい投げ</h3>
                    <Badge variant="secondary" className="text-xs">
                      砂浜で楽しめる
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    軽いオモリとエサ（青イソメ）を20〜30mほど投げて、海底の魚を狙います。キスやハゼなど天ぷらが美味しい魚が釣れます。投げる楽しさも味わえる釣り方です。
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/guide/casting"
                      className="inline-flex items-center text-sm font-medium text-blue-500 hover:underline"
                    >
                      ちょい投げの詳しいやり方を見る
                      <ChevronRight className="ml-0.5 size-4" />
                    </Link>
                  </div>
                </div>

                {/* ウキ釣り */}
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Waves className="size-5 text-red-500" />
                    <h3 className="text-lg font-bold">ウキ釣り</h3>
                    <Badge variant="secondary" className="text-xs">
                      いろんな魚が狙える
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ウキの動きで魚のアタリを見る、最も基本的な釣り方です。ウキがスッと沈む瞬間はドキドキの一言。メジナ・クロダイ・メバルなど幅広い魚種が狙えます。
                  </p>
                  <div className="mt-3">
                    <Link
                      href="/guide/float-fishing"
                      className="inline-flex items-center text-sm font-medium text-red-500 hover:underline"
                    >
                      ウキ釣りの詳しいやり方を見る
                      <ChevronRight className="ml-0.5 size-4" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* セクション6: 安全に楽しむために */}
          <section id="safety">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <ShieldCheck className="size-5" />
                  <h2 className="text-lg font-bold sm:text-xl">
                    安全に楽しむために
                  </h2>
                </div>
                <p className="mt-1 text-sm text-red-100">
                  楽しい釣りのために、必ず確認してください
                </p>
              </div>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:bg-red-950/30">
                    <Heart className="mt-0.5 size-5 shrink-0 text-red-500" />
                    <div>
                      <p className="font-medium text-foreground">
                        ライフジャケット必須
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        特に堤防や磯では必ず着用。レンタルできる釣り場もあります。お子さんは必須です。
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-lg border p-4">
                    <Sun className="mt-0.5 size-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="font-medium text-foreground">
                        天候チェック
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        出発前に天気予報を確認。風速5m以上や雷注意報が出ている日は中止しましょう。
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-lg border p-4">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-orange-500" />
                    <div>
                      <p className="font-medium text-foreground">
                        滑りにくい靴を履く
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        堤防やテトラは滑りやすいです。スニーカーよりも底がゴム製の靴やスパイクシューズが安全。
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-lg border p-4">
                    <CloudRain className="mt-0.5 size-5 shrink-0 text-blue-500" />
                    <div>
                      <p className="font-medium text-foreground">
                        釣り場のマナー
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ゴミは必ず持ち帰る。釣り場を水で洗い流す。隣の人との間隔をあける。挨拶を忘れずに。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/safety">
                      安全ガイドをもっと読む
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* セクション7: よくある質問 */}
          <section id="faq">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
                <div className="flex items-center gap-2 text-white">
                  <HelpCircle className="size-5" />
                  <h2 className="text-lg font-bold sm:text-xl">
                    よくある質問
                  </h2>
                </div>
                <p className="mt-1 text-sm text-violet-100">
                  初心者の方からよく聞かれる質問
                </p>
              </div>
              <CardContent className="space-y-3 pt-6">
                {[
                  {
                    q: "釣り竿はどれを選べばいい？",
                    a: '万能竿（2.7〜3.6m）がおすすめです。1本でサビキ・ちょい投げ・ウキ釣りと幅広く使えます。釣具店で「初心者セットをください」と言うのが一番確実です。',
                  },
                  {
                    q: "エサはどこで買える？",
                    a: "釣具店で購入するのが最も確実です。サビキ用のアミエビはチューブタイプなら一部コンビニやホームセンターでも買えます。生きエサ（青イソメ等）は釣具店のみ。",
                  },
                  {
                    q: "何時に行けばいい？",
                    a: "朝マズメ（日の出前後の1〜2時間）が最も釣れやすい時間帯です。夕方も好タイミング。初めてなら午前中の早い時間がおすすめです。",
                  },
                  {
                    q: "雨の日でも釣れる？",
                    a: "小雨なら問題なし。むしろ釣り人が少なく、魚の警戒心が薄れて好釣果になることも。ただし雷や強風の日は絶対に中止してください。",
                  },
                  {
                    q: "釣りに免許は必要？",
                    a: "海釣りなら基本的に不要です。川や湖での釣りは遊漁券が必要な場合が多いので事前に確認を。",
                  },
                  {
                    q: "釣った魚はどうすればいい？",
                    a: "クーラーボックスに氷と一緒に入れて持ち帰り、自宅で調理できます。食べない分は優しく海に戻してあげましょう。",
                  },
                ].map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-lg border transition-colors hover:border-violet-300"
                  >
                    <summary className="cursor-pointer list-none p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                          Q
                        </span>
                        <p className="text-sm font-medium text-foreground">
                          {item.q}
                        </p>
                        <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                      </div>
                    </summary>
                    <div className="border-t px-4 pb-4 pt-3">
                      <div className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                          A
                        </span>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </details>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* セクション8: CTA */}
          <section className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-8 text-center text-white sm:p-12">
            <Fish className="mx-auto mb-4 size-12 text-sky-200" />
            <h2 className="text-xl font-bold sm:text-2xl">
              さっそく釣り場を探してみよう！
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-sky-100">
              全国1,000以上の釣りスポットから、あなたにぴったりの場所が見つかります
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="min-h-[48px] w-full bg-white text-blue-600 hover:bg-sky-50 sm:w-auto"
              >
                <Link href="/spots">
                  <MapPin className="mr-2 size-4" />
                  釣りスポットを探す
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-[48px] w-full border-white/40 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
              >
                <Link href="/guide">
                  <Clock className="mr-2 size-4" />
                  もっと詳しいガイドを読む
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
