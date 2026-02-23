import type { Metadata } from "next";
import Link from "next/link";
import {
  Waves,
  Package,
  MapPin,
  Sunrise,
  HandHeart,
  Wrench,
  Link2,
  Fish,
  Target,
  ChevronRight,
  DollarSign,
  Users,
  Ruler,
  Scissors,
  Zap,
  CircleDot,
  Anchor,
  Crosshair,
  Moon,
  Snowflake,
  Clock,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StepCard } from "@/components/guide/step-card";
import { ProductList } from "@/components/affiliate/product-list";
import { getTopProducts } from "@/lib/data/products";
import { Badge } from "@/components/ui/badge";
import { type LucideIcon } from "lucide-react";
import { LineBanner } from "@/components/line-banner";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface GuideItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: "beginner" | "method" | "scene";
}

const categoryLabels = {
  beginner: { label: "入門", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  method: { label: "釣り方別", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  scene: { label: "シーン別", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
};

const detailGuides: GuideItem[] = [
  {
    href: "/guide/beginner",
    title: "釣り初心者完全ガイド",
    description:
      "釣りの魅力、道具選び、おすすめの釣り方、スポット選び、マナーまで完全網羅。これから釣りを始める方の必読ガイド。",
    icon: Sparkles,
    category: "beginner",
  },
  {
    href: "/guide/setup",
    title: "竿とリールのセッティング方法",
    description:
      "リールの取り付け方、竿の継ぎ方、糸の通し方をステップバイステップで解説。",
    icon: Wrench,
    category: "beginner",
  },
  {
    href: "/guide/knots",
    title: "釣り糸の結び方",
    description:
      "ユニノット・クリンチノット・電車結びの3つの基本を覚えましょう。",
    icon: Link2,
    category: "beginner",
  },
  {
    href: "/guide/line",
    title: "釣り糸（ライン）の選び方",
    description:
      "PE・ナイロン・フロロカーボンの違いと号数別の強度表。太さの使い分けも解説。",
    icon: Ruler,
    category: "beginner",
  },
  {
    href: "/guide/sabiki",
    title: "サビキ釣り完全ガイド",
    description:
      "初心者の定番、サビキ釣りの準備から釣り方、片付けまで丁寧に解説。",
    icon: Fish,
    category: "method",
  },
  {
    href: "/guide/choinage",
    title: "ちょい投げ釣り完全ガイド",
    description:
      "キスやハゼを狙うちょい投げ釣り。仕掛けの作り方、投げ方、誘い方を初心者向けに解説。",
    icon: Target,
    category: "method",
  },
  {
    href: "/guide/anazuri",
    title: "穴釣り完全ガイド",
    description:
      "テトラの穴でカサゴやメバルを狙う穴釣り。ブラクリ仕掛け、ポイント選び、安全対策を解説。",
    icon: Waves,
    category: "method",
  },
  {
    href: "/guide/casting",
    title: "投げ方（キャスティング）の基本",
    description:
      "ちょい投げ・オーバーヘッド・サイドキャストの3つの投げ方を習得。",
    icon: Target,
    category: "beginner",
  },
  {
    href: "/guide/budget",
    title: "釣りの費用ガイド",
    description:
      "予算3千円〜3万円の3コース別に必要な道具と費用を徹底解説。節約のコツも紹介。",
    icon: DollarSign,
    category: "beginner",
  },
  {
    href: "/guide/family",
    title: "ファミリーフィッシングガイド",
    description:
      "子供の年齢別おすすめ、安全対策、持ち物リストなど家族で楽しむ釣りの始め方。",
    icon: Users,
    category: "scene",
  },
  {
    href: "/guide/rigs",
    title: "釣り仕掛け図解ガイド",
    description:
      "サビキ・ウキ釣り・ちょい投げ・穴釣り・ルアーの5つの基本仕掛けをイラスト付きで解説。",
    icon: Ruler,
    category: "beginner",
  },
  {
    href: "/guide/handling",
    title: "魚の締め方・持ち帰りガイド",
    description:
      "氷締め・脳締め・血抜き・神経締めの方法を難易度別に解説。美味しく食べるコツも。",
    icon: Scissors,
    category: "scene",
  },
  {
    href: "/guide/lure",
    title: "ルアー釣り入門ガイド",
    description:
      "ミノー・バイブレーション・ワーム・メタルジグなどルアーの種類と選び方、アクションの付け方を解説。",
    icon: Zap,
    category: "method",
  },
  {
    href: "/guide/float-fishing",
    title: "ウキ釣り完全ガイド",
    description:
      "ウキの種類と選び方、仕掛けの作り方、エサの付け方、アタリの取り方を詳しく解説。",
    icon: CircleDot,
    category: "method",
  },
  {
    href: "/guide/jigging",
    title: "ショアジギング入門ガイド",
    description:
      "メタルジグの選び方、ロッドとリール、キャストとアクション、青物の取り込みと安全対策。",
    icon: Anchor,
    category: "method",
  },
  {
    href: "/guide/eging",
    title: "エギング入門ガイド",
    description:
      "エギの選び方、シャクリ方とフォール、季節別のポイント、アオリイカの締め方を解説。",
    icon: Crosshair,
    category: "method",
  },
  {
    href: "/guide/oyogase",
    title: "泳がせ釣り入門ガイド",
    description:
      "サビキで釣ったアジやイワシを生きエサに大物を狙う！仕掛け・エサの付け方・やり取りのコツを解説。",
    icon: Fish,
    category: "method",
  },
  {
    href: "/guide/night-fishing",
    title: "夜釣り入門ガイド",
    description:
      "ヘッドライトやケミホタルなど必要装備、夜に釣れる魚種、安全対策、マナーを解説。",
    icon: Moon,
    category: "scene",
  },
  {
    href: "/guide/fish-handling",
    title: "釣った魚の持ち帰り方ガイド",
    description:
      "締め方・血抜き・クーラーボックスの使い方・氷の量と保冷時間・自宅での下処理を解説。",
    icon: Snowflake,
    category: "scene",
  },
  {
    href: "/guide/tide",
    title: "潮汐の読み方ガイド",
    description:
      "大潮・小潮の違い、潮見表の読み方、釣れる潮のタイミング、朝マズメ・夕マズメの重要性。",
    icon: Clock,
    category: "beginner",
  },
];

export const metadata: Metadata = {
  title: "釣りの始め方ガイド - 初心者が知るべき5つのステップ",
  description:
    "釣り初心者のための完全ガイド。釣りの種類選び、道具の揃え方、釣り場の選び方、当日の持ち物チェックリスト、マナーまでステップバイステップで解説。サビキセットなど初心者向けおすすめ道具も紹介します。",
  openGraph: {
    title: "釣りの始め方ガイド - 初心者が知るべき5つのステップ",
    description:
      "釣り初心者のための完全ガイド。道具の揃え方から釣り場の選び方、マナーまでステップバイステップで解説。",
    type: "article",
    url: "https://tsurispot.com/guide",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide",
  },
};

export default function GuidePage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="mb-4">
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "釣りガイド" }]} />
      </div>
      {/* ヘッダー */}
      <div className="mb-8 text-center sm:mb-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
          釣りの始め方ガイド
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
          初めての釣りでも大丈夫。ステップバイステップで解説します。
        </p>
        <div className="mx-auto mt-4 max-w-lg rounded-xl bg-emerald-50 p-4 text-center">
          <p className="text-sm font-medium text-emerald-800">
            🎣 釣りが初めてなら、まずは
            <Link href="/guide/beginner" className="font-bold underline hover:text-emerald-900">初心者完全ガイド</Link>
            から！
          </p>
        </div>
      </div>

      {/* ステップ一覧 */}
      <div className="space-y-6">
        {/* Step 1 */}
        <StepCard stepNumber={1} title="釣りの種類を知ろう" icon={Waves}>
          <p className="mb-3">
            釣りにはさまざまな種類があります。まずは自分に合ったスタイルを見つけましょう。
          </p>
          <ul className="list-inside list-disc space-y-1.5">
            <li>
              <span className="font-medium text-foreground">堤防釣り</span>
              &nbsp;&mdash;&nbsp;足場が安定していて初心者におすすめ。サビキ釣りで手軽に楽しめます。
            </li>
            <li>
              <span className="font-medium text-foreground">磯釣り</span>
              &nbsp;&mdash;&nbsp;自然の岩場で本格的な釣りが楽しめます。中級者以上向け。
            </li>
            <li>
              <span className="font-medium text-foreground">船釣り</span>
              &nbsp;&mdash;&nbsp;沖合で大物を狙えます。船酔い対策を忘れずに。
            </li>
            <li>
              <span className="font-medium text-foreground">川釣り</span>
              &nbsp;&mdash;&nbsp;渓流や湖でのんびり楽しめます。遊漁券が必要な場合も。
            </li>
          </ul>
        </StepCard>

        {/* Step 2 */}
        <StepCard stepNumber={2} title="道具を揃えよう" icon={Package}>
          <p className="mb-3">最低限必要な道具を揃えましょう。</p>
          <ul className="list-inside list-disc space-y-1.5">
            <li>竿（ロッド）</li>
            <li>リール</li>
            <li>仕掛け（針・オモリ・ウキなど）</li>
            <li>バケツ</li>
            <li>ハサミ・プライヤー</li>
            <li>クーラーボックス</li>
          </ul>
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <span className="font-medium">初心者には「サビキセット」がおすすめ！</span>
            <br />
            竿・リール・仕掛けが全部入りで、3,000円前後から購入できます。
          </div>
        </StepCard>

        {/* Step 3 */}
        <StepCard stepNumber={3} title="釣り場を選ぼう" icon={MapPin}>
          <p className="mb-3">
            初心者には管理された海釣り施設がおすすめです。トイレや売店があり、安全に釣りが楽しめます。
          </p>
          <ul className="list-inside list-disc space-y-1.5">
            <li>海釣り公園や海釣り施設は足場がよく安全</li>
            <li>レンタル竿がある施設なら手ぶらでもOK</li>
            <li>スタッフに釣り方を教えてもらえることも</li>
          </ul>
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-green-800 dark:bg-green-950 dark:text-green-200">
            ツリスポで
            <span className="font-medium">「初心者OK」</span>
            のスポットを探してみましょう！
          </div>
        </StepCard>

        {/* Step 4 */}
        <StepCard stepNumber={4} title="釣りに行こう" icon={Sunrise}>
          <p className="mb-3 font-medium text-foreground">持ち物チェックリスト</p>
          <ul className="mb-4 list-inside list-disc space-y-1.5">
            <li>釣り道具一式</li>
            <li>日焼け止め・帽子</li>
            <li>飲み物・軽食</li>
            <li>タオル</li>
            <li>ゴミ袋</li>
            <li>ライフジャケット（必要に応じて）</li>
          </ul>
          <div className="space-y-2">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <span className="font-medium">ベストな時間帯は「朝マヅメ」!</span>
              <br />
              日の出前後の時間帯は魚の活性が高く、最も釣れやすい時間です。
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
              出発前に<span className="font-medium">天気予報</span>と
              <span className="font-medium">潮汐情報</span>
              をチェックしましょう。風が強い日や波が高い日は避けるのが安全です。
            </div>
          </div>
        </StepCard>

        {/* Step 5 */}
        <StepCard stepNumber={5} title="マナーを守ろう" icon={HandHeart}>
          <p className="mb-3">
            みんなが気持ちよく釣りを楽しめるよう、マナーを守りましょう。
          </p>
          <ul className="list-inside list-disc space-y-1.5">
            <li>
              <span className="font-medium text-foreground">ゴミは必ず持ち帰る</span>
              &nbsp;&mdash;&nbsp;釣り糸や仕掛けのゴミは海洋生物に悪影響を与えます。
            </li>
            <li>
              <span className="font-medium text-foreground">釣り禁止区域を確認する</span>
              &nbsp;&mdash;&nbsp;立入禁止の場所では絶対に釣りをしないでください。
            </li>
            <li>
              <span className="font-medium text-foreground">
                ライフジャケットを着用する
              </span>
              &nbsp;&mdash;&nbsp;堤防や磯では必ず着用しましょう。
            </li>
            <li>
              <span className="font-medium text-foreground">
                近隣住民や他の釣り人への配慮
              </span>
              &nbsp;&mdash;&nbsp;騒がない、場所を独占しない、挨拶を忘れずに。
            </li>
          </ul>
        </StepCard>
      </div>

      {/* もっと詳しく学ぶ */}
      <div className="mt-10 sm:mt-14">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          もっと詳しく学ぶ
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          各テーマごとに、実践的な手順を詳しく解説しています。
        </p>

        {/* カテゴリフィルタ表示 */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {(Object.entries(categoryLabels) as [keyof typeof categoryLabels, typeof categoryLabels[keyof typeof categoryLabels]][]).map(
            ([key, { label, color }]) => (
              <span
                key={key}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
              >
                {label}（{detailGuides.filter((g) => g.category === key).length}件）
              </span>
            )
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {detailGuides.map((guide) => (
            <Link key={guide.href} href={guide.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <guide.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-medium text-foreground group-hover:text-primary">
                        {guide.title}
                      </p>
                    </div>
                    <div className="mb-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryLabels[guide.category].color}`}
                      >
                        {categoryLabels[guide.category].label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {guide.description}
                    </p>
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 道具を揃えるなら */}
      <div className="mt-10 sm:mt-14">
        <ProductList
          products={getTopProducts(3)}
          title="道具を揃えるなら"
          description="初心者が最初に買うべき、人気の定番アイテムを厳選しました。"
          maxItems={3}
        />
        <div className="mt-4 text-center">
          <Button asChild variant="outline" className="min-h-[44px] rounded-full">
            <Link href="/gear">
              すべてのおすすめ道具を見る
              <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* LINE登録バナー */}
      <div className="mt-8 sm:mt-12">
        <LineBanner />
      </div>

      {/* CTA */}
      <div className="mt-8 text-center sm:mt-12">
        <p className="mb-4 text-base font-medium sm:text-lg">
          さっそく釣りスポットを探してみよう！
        </p>
        <Button asChild size="lg" className="min-h-[48px] rounded-full px-8">
          <Link href="/spots">スポットを探す</Link>
        </Button>
      </div>
    </main>
  );
}
