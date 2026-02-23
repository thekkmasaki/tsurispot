import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Fish,
  MapPin,
  Package,
  HelpCircle,
  Anchor,
  Target,
  Waves,
  Zap,
  Crosshair,
  AlertTriangle,
  Calendar,
  PiggyBank,
  Trophy,
  BookOpen,
  ShieldCheck,
  Footprints,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";

export const metadata: Metadata = {
  title: "釣り初心者完全ガイド｜ゼロから始める釣り入門【2026年版】",
  description:
    "釣り初心者のための完全ガイド。最初にやるべきこと、おすすめスポット、必要な道具リスト、初心者向け釣り方TOP5、狙いやすい魚TOP10、費用を抑えるコツまで徹底解説。この記事だけで釣りデビューできます。",
  openGraph: {
    title: "釣り初心者完全ガイド｜ゼロから始める釣り入門【2026年版】",
    description:
      "釣り初心者のための完全ガイド。道具選び・場所選び・釣り方・狙いやすい魚まで網羅的に解説。",
    type: "article",
    url: "https://tsurispot.com/guide/fishing-for-beginners",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/fishing-for-beginners",
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
      name: "釣り初心者完全ガイド",
      item: "https://tsurispot.com/guide/fishing-for-beginners",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "釣り初心者が最初に買うべき道具は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "サビキ釣りセット（竿・リール・仕掛け付きで3,000〜5,000円）が最もおすすめです。これに加えて、アミエビ（エサ）、折りたたみバケツ、ハサミがあれば釣りを始められます。",
      },
    },
    {
      "@type": "Question",
      name: "釣り初心者が一番釣りやすい魚は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "アジとイワシが最も釣りやすい魚です。夏〜秋に堤防でサビキ釣りをすれば、群れが回っている限り初心者でも高確率で釣れます。数十匹の大漁になることも珍しくありません。",
      },
    },
    {
      "@type": "Question",
      name: "釣り初心者におすすめの場所は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "足場が安定している堤防や漁港がおすすめです。トイレや駐車場が近くにある場所を選びましょう。管理釣り場や海釣り公園ならスタッフが常駐しており、初めてでも安心です。",
      },
    },
    {
      "@type": "Question",
      name: "釣りデビューに最適な季節は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "夏〜秋（6〜10月）がベストです。水温が高く魚の活性が上がるため、サビキ釣りでアジ・サバ・イワシが大量に釣れます。気候も過ごしやすく、初めての釣りに最適な季節です。",
      },
    },
    {
      "@type": "Question",
      name: "釣り初心者が犯しやすい失敗は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "最も多い失敗は「糸のトラブル（糸絡み）」です。リールの糸がたるんだ状態で巻くとバックラッシュが起きます。常に糸にテンションをかけた状態でリールを巻くことを意識しましょう。",
      },
    },
    {
      "@type": "Question",
      name: "釣り道具はレンタルできる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "海釣り公園や管理釣り場ではレンタル竿が用意されていることが多いです。手ぶらで行ける施設もあります。まずはレンタルで体験してみて、続けたいと思ったら自分の道具を買うのが賢い方法です。",
      },
    },
    {
      "@type": "Question",
      name: "釣り初心者は何から始めればいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "まず「釣り方を決める」→「道具を揃える」→「釣り場を選ぶ」の3ステップです。初心者にはサビキ釣りが最もおすすめ。堤防や漁港で手軽にアジやイワシが釣れます。",
      },
    },
    {
      "@type": "Question",
      name: "釣り初心者に必要な予算は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "最低3,000〜5,000円でサビキ釣りセットとエサが揃います。バケツやクーラーボックスを加えても1万円以内で始められます。毎回の釣行コストはエサ代500〜1,500円程度です。",
      },
    },
  ],
};

function SectionCard({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id}>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-2">
            {Icon && <Icon className="size-5 text-primary" />}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          {children}
        </CardContent>
      </Card>
    </section>
  );
}

export default function FishingForBeginnersPage() {
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
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ガイド", href: "/guide" },
            { label: "釣り初心者完全ガイド" },
          ]}
        />
        <div className="mb-6">
          <Link
            href="/guide"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 size-4" />
            釣りの始め方ガイドに戻る
          </Link>
        </div>

        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣り初心者完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            ゼロから始める釣り入門。
            <br className="hidden sm:inline" />
            最初にやるべきこと・道具・釣り方・狙える魚まで、すべてをこの1ページで解説します。
          </p>
        </div>

        {/* 目次 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="mb-3 font-medium text-foreground">この記事の内容</p>
            <ol className="space-y-1.5 text-sm text-muted-foreground">
              {[
                { href: "#first3", label: "釣り初心者が最初にやるべき3つのこと" },
                { href: "#spot", label: "初心者向け釣りスポットの選び方" },
                { href: "#gear", label: "初心者に必要な釣り道具リスト" },
                { href: "#methods", label: "初心者におすすめの釣り方TOP5" },
                { href: "#fish", label: "初心者が狙いやすい魚TOP10" },
                { href: "#mistakes", label: "初心者が犯しやすい失敗と対策" },
                { href: "#calendar", label: "初心者向け釣りカレンダー" },
                { href: "#save", label: "費用を抑える裏ワザ" },
                { href: "#faq", label: "よくある質問（FAQ）" },
                { href: "#next", label: "次のステップ" },
              ].map((item, i) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-primary hover:underline">
                    {i + 1}. {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* 1. 最初にやるべき3つのこと */}
          <SectionCard id="first3" title="釣り初心者が最初にやるべき3つのこと" icon={Footprints}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りを始めたいと思ったら、まずこの3つのステップから。シンプルですが、この順番で進めると無駄なくスムーズにスタートできます。
            </p>

            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: "釣り方を決める",
                  desc: "最初はサビキ釣りが断然おすすめです。投げる技術が不要で、足元に仕掛けを落とすだけで魚が釣れます。まずはサビキ釣りで「魚を釣る楽しさ」を体験しましょう。",
                },
                {
                  step: 2,
                  title: "道具を揃える",
                  desc: "釣具店で「初心者サビキセット」を買うのが最も簡単。竿・リール・仕掛けが一式揃って3,000〜5,000円です。あとはアミエビ（エサ）とバケツがあればOK。",
                },
                {
                  step: 3,
                  title: "釣り場を選んで行ってみる",
                  desc: "足場が安定した堤防や漁港が初心者には最適。トイレと駐車場がある場所を選びましょう。天気予報を確認し、朝早めに出発するのがコツです。",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 rounded-lg border p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <span className="font-medium">ヒント：</span>
              考えすぎるよりも、まず一度行ってみるのが上達の近道です。レンタル竿がある
              <Link href="/spots" className="font-medium text-blue-600 hover:underline dark:text-blue-300">管理釣り場や海釣り公園</Link>
              なら、手ぶらで体験できます。
            </div>
          </SectionCard>

          {/* 2. スポットの選び方 */}
          <SectionCard id="spot" title="初心者向け釣りスポットの選び方" icon={MapPin}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              初心者のスポット選びで最も大切なのは「安全で快適な場所」を選ぶこと。釣果よりもまず、楽しく安全に過ごせる場所を選びましょう。
            </p>

            <div className="mb-4 rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-950/50">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white hover:bg-blue-600">おすすめ</Badge>
                <h3 className="font-bold text-foreground">堤防釣りがおすすめな理由</h3>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <span>コンクリートで足場がフラット。転倒や滑落のリスクが低い</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <span>車を近くに停められることが多い。荷物の運搬が楽</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <span>サビキ釣りで回遊魚が狙える。高確率で魚が釣れる</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-500">&#9679;</span>
                  <span>他の釣り人がいるので安心感がある。分からないことを聞ける</span>
                </li>
              </ul>
              <div className="mt-3">
                <Link
                  href="/fishing-spots/breakwater-beginner"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  初心者向け堤防釣りスポットを見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">スポット選びのチェックリスト</span>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>トイレがあるか</li>
                <li>駐車場があるか（有料/無料）</li>
                <li>近くにコンビニや釣具店があるか</li>
                <li>足場は安定しているか</li>
                <li>釣り禁止エリアではないか</li>
                <li>レンタル竿がある施設か（手ぶらOK）</li>
              </ul>
            </div>
          </SectionCard>

          {/* 3. 道具リスト */}
          <SectionCard id="gear" title="初心者に必要な釣り道具リスト" icon={Package}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              初心者が最初に揃えるべき道具をリストアップしました。最低限のセットなら3,000〜5,000円で始められます。必要なものを予算に合わせて選びましょう。
            </p>

            <h3 className="mb-3 font-medium text-foreground">必須の道具（予算：3,000〜10,000円）</h3>
            <div className="mb-4 space-y-2">
              {[
                { name: "竿（ロッド）", desc: "万能竿またはサビキ用（2.7〜3.6m）。初心者セットに付属。" },
                { name: "リール", desc: "小型スピニングリール（2000〜3000番）。糸付きが便利。" },
                { name: "仕掛け", desc: "サビキ仕掛け（4〜6号）+ コマセカゴ。2〜3セット。" },
                { name: "エサ", desc: "アミエビ（チューブタイプが手軽）。1回の釣行で1〜2個。" },
                { name: "バケツ", desc: "折りたたみ式。水汲み・手洗い・魚の一時保管に使用。" },
                { name: "ハサミ", desc: "釣り糸を切るために必要。小さなハサミやラインカッターでOK。" },
              ].map((item) => (
                <div key={item.name} className="flex gap-3 rounded-lg border p-3">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mb-3 font-medium text-foreground">あると便利な道具</h3>
            <div className="mb-4 space-y-2">
              {[
                { name: "クーラーボックス", desc: "釣った魚を新鮮に持ち帰る。発泡スチロールの箱でも代用可。" },
                { name: "プライヤー", desc: "魚から針を外す時に使用。フィッシングプライヤーが便利。" },
                { name: "タオル", desc: "手拭き・魚掴み用に2〜3枚。" },
                { name: "ゴミ袋", desc: "ゴミは必ず持ち帰り。2〜3枚用意。" },
              ].map((item) => (
                <div key={item.name} className="flex gap-3 rounded-lg border p-3">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/gear">
                  おすすめ道具を見る
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/beginner-checklist">
                  持ち物チェックリスト
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/guide/fishing-gear-guide">
                  道具の選び方ガイド
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          {/* 4. おすすめ釣り方TOP5 */}
          <SectionCard id="methods" title="初心者におすすめの釣り方TOP5" icon={Anchor}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              初心者が最初に挑戦すべき釣り方を、おすすめ順に5つ紹介します。いずれも特別な技術が不要で、魚が釣れやすいものを厳選しました。
            </p>

            <div className="space-y-4">
              {[
                {
                  rank: 1,
                  name: "サビキ釣り",
                  icon: Anchor,
                  badge: "一番おすすめ",
                  badgeColor: "bg-green-500 text-white hover:bg-green-600",
                  desc: "コマセで魚を集めて疑似餌で釣る方法。投げる技術不要、足元に落とすだけ。アジ・サバ・イワシが群れで釣れるので初心者でも大漁が期待できます。",
                  link: "/guide/sabiki",
                },
                {
                  rank: 2,
                  name: "ちょい投げ",
                  icon: Target,
                  badge: "キス・ハゼ狙い",
                  badgeColor: "",
                  desc: "軽いオモリとエサを20〜30m先に投げて底の魚を釣る方法。キスやハゼなど天ぷらが美味しい魚が釣れます。投げる楽しさも味わえます。",
                  link: "/guide/choinage",
                },
                {
                  rank: 3,
                  name: "ウキ釣り",
                  icon: Waves,
                  badge: "万能",
                  badgeColor: "",
                  desc: "ウキの動きでアタリを見る最も基本的な釣り方。ウキがスッと沈む瞬間のドキドキ感は格別。メジナ・クロダイ・メバルなど幅広い魚種が狙えます。",
                  link: "/guide/float-fishing",
                },
                {
                  rank: 4,
                  name: "アジング",
                  icon: Zap,
                  badge: "ルアー入門",
                  badgeColor: "",
                  desc: "小さなワーム（ソフトルアー）でアジを狙う釣り方。エサ不要で手が汚れず、繊細なアタリを楽しめるゲーム性の高さが人気。夜の常夜灯周りが好ポイント。",
                  link: "/guide/lure",
                },
                {
                  rank: 5,
                  name: "エギング",
                  icon: Crosshair,
                  badge: "イカ狙い",
                  badgeColor: "",
                  desc: "エギ（餌木）というルアーでアオリイカを狙う人気の釣り方。シャクリとフォールの繰り返しが基本動作。秋は小型が多く初心者でも釣りやすいシーズンです。",
                  link: "/guide/eging",
                },
              ].map((item) => (
                <div key={item.rank} className={`rounded-lg border p-4 ${item.rank === 1 ? "border-2 border-green-200" : ""}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {item.rank}
                    </span>
                    <item.icon className="size-5 text-primary" />
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <Badge variant={item.badgeColor ? "default" : "secondary"} className={`text-xs ${item.badgeColor}`}>
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <Link
                    href={item.link}
                    className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    詳しいやり方を見る
                    <ChevronRight className="ml-0.5 size-4" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Button asChild variant="outline" size="sm">
                <Link href="/methods">
                  すべての釣り方を見る
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          {/* 5. 狙いやすい魚TOP10 */}
          <SectionCard id="fish" title="初心者が狙いやすい魚TOP10" icon={Fish}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              初心者でも比較的簡単に釣れる魚を10種厳選しました。それぞれの特徴と釣り方を簡潔に紹介します。
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { name: "アジ", slug: "aji", desc: "サビキの定番ターゲット。刺身・フライが絶品", season: "通年（夏〜秋がベスト）" },
                { name: "イワシ", slug: "iwashi", desc: "群れで大量に釣れる。唐揚げ・煮付けに", season: "夏〜秋" },
                { name: "サバ", slug: "saba", desc: "引きが強く楽しい。味噌煮・しめ鯖に", season: "夏〜秋" },
                { name: "メバル", slug: "mebaru", desc: "冬の人気ターゲット。煮付けが美味", season: "冬〜春" },
                { name: "カサゴ", slug: "kasago", desc: "穴釣りの定番。唐揚げが最高", season: "通年" },
                { name: "キス", slug: "kisu", desc: "ちょい投げの定番。天ぷらの王様", season: "夏" },
                { name: "ハゼ", slug: "haze", desc: "河口のちょい投げで。天ぷらが絶品", season: "秋" },
                { name: "アオリイカ", slug: "aoriika", desc: "エギングの人気ターゲット。刺身が美味", season: "秋" },
                { name: "カレイ", slug: "karei", desc: "投げ釣りの定番。煮付け・唐揚げに", season: "冬" },
                { name: "シーバス", slug: "seabass", desc: "ルアー釣りの王道。大型の引きが魅力", season: "通年" },
              ].map((fish, i) => (
                <Link
                  key={fish.slug}
                  href={`/fish/${fish.slug}`}
                  className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:border-primary"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground group-hover:text-primary">{fish.name}</p>
                    <p className="text-xs text-muted-foreground">{fish.desc}</p>
                    <p className="mt-1 text-xs text-primary">シーズン：{fish.season}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/fish">
                  すべての魚種を見る
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/catchable-now">
                  今釣れる魚を見る
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          {/* 6. 犯しやすい失敗 */}
          <SectionCard id="mistakes" title="初心者が犯しやすい失敗と対策" icon={AlertTriangle}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              初心者がよく経験する失敗パターンと、その対策を紹介します。事前に知っておけば、当日のトラブルを最小限に抑えられます。
            </p>

            <div className="space-y-3">
              {[
                {
                  title: "糸のトラブル（バックラッシュ）",
                  problem: "リールの糸がたるんだ状態で巻くと、糸が絡まってグチャグチャに。",
                  solution: "常に糸にテンション（張り）をかけた状態でリールを巻くこと。仕掛けを回収する時もゆっくり巻きましょう。",
                },
                {
                  title: "エサの付け方ミス",
                  problem: "針先が出ていない、エサが大きすぎるなどで魚が食いつかない。",
                  solution: "針先は必ず少し出しておく。青イソメは2〜3cmにカットして使うと食いが良くなります。",
                },
                {
                  title: "場所選びの失敗",
                  problem: "魚がいない場所で何時間も粘ってしまう。",
                  solution: "周りの釣り人が釣れているか観察。30分〜1時間アタリがなければ場所を変えましょう。釣具店で最近の釣果情報を聞くのも有効。",
                },
                {
                  title: "日焼け・熱中症",
                  problem: "夏場に長時間日差しの下にいて体調を崩す。",
                  solution: "帽子・日焼け止め・十分な飲み物を用意。日陰がない場所ではパラソルも検討。こまめに水分補給を。",
                },
                {
                  title: "道具の片付け忘れ",
                  problem: "竿やリールを汚れたまま放置して錆びさせてしまう。",
                  solution: "帰宅後は真水で竿とリールを軽く洗い、乾燥させてから収納。特にリールの塩対策は重要です。",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border p-4">
                  <h3 className="mb-1 font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-red-600 dark:text-red-400">失敗：{item.problem}</p>
                  <p className="mt-1 text-sm text-green-700 dark:text-green-400">対策：{item.solution}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 7. 釣りカレンダー */}
          <SectionCard id="calendar" title="初心者向け釣りカレンダー" icon={Calendar}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              月別におすすめの釣り方と狙える魚をまとめました。計画を立てる参考にしてください。
            </p>

            <div className="space-y-2">
              {[
                { months: "1〜2月", fish: "メバル・カサゴ・カレイ", method: "メバリング・穴釣り・投げ釣り", note: "防寒対策必須。管理釣り場でトラウト釣りも人気。" },
                { months: "3〜4月", fish: "メバル・アイナメ・渓流魚", method: "メバリング・渓流釣り", note: "渓流釣り解禁。徐々に水温が上がり始める。" },
                { months: "5〜6月", fish: "キス・アジ・メジナ", method: "ちょい投げ・サビキ・ウキ釣り", note: "堤防の回遊魚が増え始め、サビキ釣りシーズンイン。" },
                { months: "7〜8月", fish: "アジ・サバ・イワシ・キス", method: "サビキ・ちょい投げ", note: "サビキ釣りの最盛期。ファミリーフィッシングに最適。" },
                { months: "9〜10月", fish: "アジ・アオリイカ・青物・ハゼ", method: "サビキ・エギング・ショアジギング", note: "年間で最も釣れる黄金期。釣り方の選択肢も豊富。" },
                { months: "11〜12月", fish: "カレイ・メバル・カサゴ・ハゼ", method: "投げ釣り・穴釣り・メバリング", note: "徐々に魚種が絞られるが、脂の乗った魚が美味。" },
              ].map((item) => (
                <div key={item.months} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-bold">{item.months}</Badge>
                    <span className="text-sm font-medium text-foreground">{item.fish}</span>
                  </div>
                  <p className="mt-1 text-xs text-primary">おすすめ釣り方：{item.method}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/fishing-calendar">
                  詳しい釣りカレンダーを見る
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/catchable-now">
                  今釣れる魚をチェック
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          {/* 8. 費用を抑える裏ワザ */}
          <SectionCard id="save" title="費用を抑える裏ワザ" icon={PiggyBank}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りはお金がかかると思われがちですが、工夫次第で費用をグッと抑えられます。特に初心者のうちはコスパ重視でOKです。
            </p>

            <div className="space-y-3">
              {[
                {
                  title: "レンタル竿を活用する",
                  desc: "海釣り公園や管理釣り場ではレンタル竿（500〜1,000円程度）が用意されています。まずはレンタルで体験し、続けたいと思ったら自分の道具を買いましょう。",
                },
                {
                  title: "初心者セットを購入する",
                  desc: "竿・リール・仕掛けをバラで買うより、セット商品の方が圧倒的にお得。3,000〜5,000円で一式揃います。品質も初心者には十分です。",
                },
                {
                  title: "エサの種類を工夫する",
                  desc: "チューブタイプのアミエビは保存がきき、使い切れない分は次回に回せます。冷凍アミエビの方が安いですが、チューブの方が手軽で無駄が少ないです。",
                },
                {
                  title: "100均アイテムを活用する",
                  desc: "ハサミ、タオル、ゴミ袋、プラスチックケースなど、釣り専用品でなくても100円ショップのアイテムで十分代用できるものは多いです。",
                },
                {
                  title: "釣った魚を食べる",
                  desc: "釣りの最大の「節約術」は、釣った魚を食卓に並べること。スーパーで買えば数千円する新鮮なアジの刺身が、実質エサ代500円で楽しめます。",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-2 text-sm">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">{item.title}</span>
                    <br />
                    <span className="text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/guide/budget">
                  予算別ガイドを見る
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          {/* 9. FAQ */}
          <SectionCard id="faq" title="よくある質問（FAQ）" icon={HelpCircle}>
            <div className="space-y-3">
              {[
                { q: "釣り初心者が最初に買うべき道具は？", a: "サビキ釣りセット（3,000〜5,000円）が最もおすすめ。竿・リール・仕掛けが一式揃います。エサ（アミエビ）とバケツを追加すれば始められます。" },
                { q: "釣り初心者が一番釣りやすい魚は？", a: "アジとイワシです。夏〜秋に堤防でサビキ釣りをすれば、初心者でも高確率で釣れます。" },
                { q: "初心者におすすめの場所は？", a: "堤防・漁港が最適。管理釣り場ならスタッフ常駐・レンタル竿ありで安心です。" },
                { q: "釣りデビューに最適な季節は？", a: "夏〜秋（6〜10月）がベスト。魚の活性が高く、サビキ釣りで大漁が期待できます。" },
                { q: "犯しやすい失敗は？", a: "糸のトラブル（バックラッシュ）が最多。リール巻き取り時に常に糸を張ることを意識しましょう。" },
                { q: "道具はレンタルできる？", a: "海釣り公園・管理釣り場でレンタル可能。手ぶらで行ける施設もあります。" },
                { q: "何から始めればいい？", a: "釣り方を決める→道具を揃える→釣り場を選ぶの3ステップ。まずはサビキ釣りからがおすすめです。" },
                { q: "必要な予算は？", a: "最低3,000〜5,000円で始められます。毎回のエサ代は500〜1,500円程度です。" },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group rounded-lg border transition-colors hover:border-primary"
                >
                  <summary className="cursor-pointer list-none p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        Q
                      </span>
                      <p className="text-sm font-medium text-foreground">{item.q}</p>
                      <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                    </div>
                  </summary>
                  <div className="border-t px-4 pb-4 pt-3">
                    <div className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                        A
                      </span>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </SectionCard>

          {/* 10. 次のステップ */}
          <section id="next">
            <h2 className="mb-4 text-center text-xl font-bold">次のステップ</h2>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              釣りの基本がわかったら、さらに詳しいガイドで知識を深めましょう。
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { href: "/guide/how-to-fish", title: "釣りのやり方完全ガイド", desc: "基本手順を5ステップで詳しく解説", icon: BookOpen },
                { href: "/guide/sabiki", title: "サビキ釣り完全ガイド", desc: "初心者の定番、サビキ釣りを詳しく解説", icon: Anchor },
                { href: "/guide/fishing-gear-guide", title: "道具の選び方ガイド", desc: "竿・リール・ラインの選び方と予算別おすすめ", icon: Package },
                { href: "/guide/fishing-tips", title: "釣りのコツ・テクニック集", desc: "もっと釣れるようになる実践テクニック", icon: Trophy },
                { href: "/guide/beginner", title: "釣り初心者完全ガイド（詳細版）", desc: "釣りの魅力からマナーまで完全網羅", icon: Fish },
                { href: "/spots", title: "釣りスポットを探す", desc: "全国1,000以上のスポットから最適な場所を検索", icon: MapPin },
                { href: "/methods", title: "釣り方・釣法ガイド", desc: "9つの釣法を初心者向けに徹底解説", icon: Target },
                { href: "/safety", title: "安全ガイド", desc: "安全に釣りを楽しむための必読ガイド", icon: ShieldCheck },
              ].map((guide) => (
                <Link key={guide.href} href={guide.href} className="group">
                  <Card className="h-full transition-colors group-hover:border-primary">
                    <CardContent className="flex items-start gap-3 pt-6">
                      <guide.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium group-hover:text-primary">{guide.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{guide.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-base font-medium sm:text-lg">
            さっそく釣りスポットを探してみよう！
          </p>
          <Button asChild size="lg" className="min-h-[48px] rounded-full px-8">
            <Link href="/spots">スポットを探す</Link>
          </Button>
        </div>

        <div className="mt-8 sm:mt-12">
          <LineBanner variant="compact" />
        </div>
      </main>
    </>
  );
}
