import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Package,
  Footprints,
  Lightbulb,
  HelpCircle,
  MapPin,
  Fish,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fishingSpots } from "@/lib/data/spots";
import { ProductList } from "@/components/affiliate/product-list";
import { getProductsByMethod } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "ちょい投げ釣り完全ガイド - キス・ハゼの釣り方と仕掛け【初心者向け】",
  description:
    "ちょい投げ釣りの仕掛け、投げ方、誘い方を初心者向けに完全解説。キスやハゼの釣り方、必要な道具、おすすめスポット、釣果アップのコツまで。天ぷらにして最高に美味しい魚を自分の手で釣ってみよう。",
  openGraph: {
    title: "ちょい投げ釣り完全ガイド - キス・ハゼの釣り方と仕掛け",
    description:
      "ちょい投げの仕掛け、投げ方、誘い方を初心者向けに解説。キス・ハゼを釣ろう。",
    type: "article",
    url: "https://tsurispot.com/guide/choinage",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/choinage",
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
      name: "ちょい投げ釣り完全ガイド",
      item: "https://tsurispot.com/guide/choinage",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "ちょい投げ釣りの始め方 - 仕掛けの準備から実釣まで",
  description:
    "ちょい投げ釣りの仕掛け作りから投げ方、誘い方、取り込みまで。初心者でもキスやハゼが釣れる手順を解説。",
  totalTime: "PT3H",
  supply: [
    { "@type": "HowToSupply", name: "ちょい投げ仕掛け（天秤式またはジェット天秤）" },
    { "@type": "HowToSupply", name: "オモリ（5〜10号）" },
    { "@type": "HowToSupply", name: "青イソメ（エサ）" },
  ],
  tool: [
    { "@type": "HowToTool", name: "釣り竿（2.1〜3.6mの万能竿）" },
    { "@type": "HowToTool", name: "スピニングリール（2500〜3000番）" },
    { "@type": "HowToTool", name: "ハサミまたはラインカッター" },
    { "@type": "HowToTool", name: "クーラーボックス" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "仕掛けをセットする",
      text: "道糸の先にスナップサルカンを結び、天秤オモリを取り付けます。天秤の先にちょい投げ用の針仕掛け（キス針7〜9号）を接続します。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "エサ（青イソメ）を針に付ける",
      text: "青イソメの頭から針を刺し、針先を出します。イソメは2〜3cmにカットして使うのがコツ。長すぎるとアタリがあっても針がかりしにくくなります。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "仕掛けを軽く投げる",
      text: "竿を後ろに構え、正面に向かってゆっくり振りかぶって投げます。20〜30mほど飛べば十分。力いっぱい投げる必要はありません。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "底に着いたら糸ふけを取る",
      text: "オモリが着底したら、リールを巻いて糸のたるみ（糸ふけ）を取ります。糸が張った状態でアタリを待ちます。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "ゆっくりサビいて誘う",
      text: "30秒〜1分待ってアタリがなければ、リールをゆっくり1〜2回巻いて仕掛けを少し手前に動かします。これを「サビく」と言い、広い範囲を探ることができます。",
      position: 5,
    },
    {
      "@type": "HowToStep",
      name: "アタリがあったら軽く合わせる",
      text: "ブルブルと竿先に振動が伝わったら魚がかかった合図。竿先を軽く上げて合わせ、一定の速度でリールを巻いて取り込みます。",
      position: 6,
    },
    {
      "@type": "HowToStep",
      name: "手前まで来たら仕掛けを回収する",
      text: "足元まで引いてきたら仕掛けを回収します。エサが取られていたら付け替え、再度投入しましょう。",
      position: 7,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "ちょい投げ釣りと本格的な投げ釣りの違いは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ちょい投げは軽いオモリ（5〜10号）を使い、20〜30m程度投げる手軽な釣りです。万能竿やルアーロッドでもできます。一方、本格的な投げ釣りは専用の竿と重いオモリ（25〜30号）で100m以上投げます。初心者にはちょい投げがおすすめです。",
      },
    },
    {
      "@type": "Question",
      name: "ちょい投げで釣れる魚は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "キス（シロギス）とハゼが主なターゲットです。他にもカレイ、メゴチ、ベラ、小型のマダイなども釣れることがあります。砂地の海底にいる魚がメインです。",
      },
    },
    {
      "@type": "Question",
      name: "青イソメの代わりに使えるエサはありますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ジャリメ（石ゴカイ）はキス釣りに特に効果的です。また、パワーイソメなどの人工エサは虫エサが苦手な方でも使えて、保存も効くので便利です。ただし、天然の青イソメが最も万能で釣果も安定します。",
      },
    },
    {
      "@type": "Question",
      name: "ちょい投げに最適な時期はいつですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "キスは5〜9月（特に6〜8月がベスト）、ハゼは7〜11月（特に9〜10月がベスト）です。夏場はキス、秋口はハゼと季節によってターゲットを変えると年間を通して楽しめます。",
      },
    },
    {
      "@type": "Question",
      name: "ちょい投げの仕掛けは何号がいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "オモリは5〜10号が標準。潮の流れが速い場所では10号、穏やかな場所では5〜8号を使います。針はキス針なら7〜9号、ハゼなら6〜8号が目安です。市販のちょい投げ仕掛けセットを使えば選ぶ手間が省けます。",
      },
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

export default function ChoinageGuidePage() {
  // ちょい投げ向けスポット（漁港・堤防・砂浜の初心者向け）
  const choinageSpots = fishingSpots
    .filter(
      (s) =>
        (s.spotType === "port" ||
          s.spotType === "breakwater" ||
          s.spotType === "beach") &&
        s.difficulty === "beginner"
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "ガイド", href: "/guide" },
          { label: "ちょい投げ釣りガイド" },
        ]} />
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
            ちょい投げ釣り完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            キスやハゼを手軽に狙える、ちょい投げ釣り。
            <br className="hidden sm:inline" />
            仕掛けの作り方から投げ方、誘い方まで丁寧に解説します。
          </p>
        </div>

        {/* ちょい投げ釣りとは */}
        <div className="mb-6 rounded-lg border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">ちょい投げ釣りとは？</p>
          <p className="mt-1">
            ちょい投げ釣りは、軽いオモリを使って仕掛けを20〜30m程度投げ、海底に生息するキスやハゼなどを狙う釣り方です。本格的な投げ釣りのように100m以上投げる必要がなく、万能竿やルアーロッドでも楽しめるのが特徴。エサは青イソメ（虫エサ）を使うのが一般的で、砂浜や漁港内の砂地が主なポイントです。天ぷらの王様であるキスを自分で釣って食べる喜びは格別です。
          </p>
        </div>

        <div className="space-y-6">
          {/* 必要な道具 */}
          <SectionCard title="必要な道具" icon={Package}>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">竿：</span>
                2.1〜3.6mの万能竿やコンパクトロッド。振り出し式が便利。サビキ用の竿でもOK。投げ竿でなくても十分対応できます。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">リール：</span>
                スピニングリール2500〜3000番。ナイロンライン3号が100m以上巻けるもの。糸付きリールでも問題ありません。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">ちょい投げ仕掛け：</span>
                市販のちょい投げ仕掛けセットが便利。天秤オモリと針仕掛け（2〜3本針）がセットになっています。キス針7〜9号が万能。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">オモリ：</span>
                ジェット天秤またはL型天秤。5〜10号が標準。根掛かりの少ないジェット天秤が初心者向け。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">エサ（青イソメ）：</span>
                釣具店で500〜700円程度で購入。1パック（約50g）で半日は持ちます。虫エサが苦手な方はパワーイソメなどの人工エサもあります。
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">小物類：</span>
                ハサミ（イソメを切る）、フィッシングプライヤー（針外し）、バケツ、タオル、クーラーボックス。
              </li>
            </ul>
            <Hint>
              サビキ釣りセットの竿・リールに、ちょい投げ仕掛け（200〜400円）とイソメを追加購入すれば、すぐにちょい投げ釣りが始められます。新たに竿を買い直す必要はありません。
            </Hint>
          </SectionCard>

          {/* 釣り方の手順 */}
          <SectionCard title="釣り方の手順" icon={Footprints}>
            <ol className="list-none space-y-4">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  1
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    仕掛けをセットする
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    道糸の先にスナップサルカンを結び、天秤オモリを取り付けます。天秤の先にちょい投げ用の針仕掛け（キス針7〜9号）を接続。仕掛けの袋に図解があるので参考にしましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  2
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    エサ（青イソメ）を針に付ける
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    青イソメの頭側から針を刺し、針先を少し出します。イソメは2〜3cmにカットして使うと食いが良くなります。長すぎるとアタリがあっても針がかりしにくく、短すぎるとアピール不足になります。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  3
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    仕掛けを軽く投げる（キャスト）
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ベイルを起こし、人差し指で糸を押さえます。竿を後ろに構え、正面に向かってゆっくり振りかぶって投げます。糸を離すタイミングは竿が頭上を通過した瞬間。20〜30m飛べば十分です。力みすぎず、コンパクトに振るのがコツ。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  4
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    底に着いたら糸ふけを取る
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    オモリが着底すると糸がたるみます。リールをゆっくり巻いて糸のたるみ（糸ふけ）を取り、糸がピンと張った状態にします。竿先を少し上げた角度で構えてアタリを待ちます。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  5
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    ゆっくりサビいて誘う
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    30秒〜1分待ってもアタリがなければ、リールをゆっくり1〜2回巻いて仕掛けを少し手前に動かします。この動作を「サビく」と呼び、広い範囲を探ることで魚に出会う確率が上がります。サビいて止める、サビいて止める...を繰り返します。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  6
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    アタリがあったら軽く合わせる
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    竿先にブルブルと振動が伝わったら魚がかかった合図です。竿先を軽く上げて合わせ（強く合わせすぎると針が外れる）、一定の速度でリールを巻いて取り込みます。キスは口が柔らかいので、優しくやり取りしましょう。
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  7
                </span>
                <div>
                  <p className="font-medium text-foreground">
                    エサを付け替えて再投入
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    魚を釣り上げたり、エサが取られていたりしたら、新しいイソメを付けて再度投入しましょう。エサは頻繁にチェックして、常に新鮮な状態を保つのが釣果アップの秘訣です。
                  </p>
                </div>
              </li>
            </ol>

            <Warning>
              投げる前に必ず後方を確認しましょう。背後に人がいると、針やオモリが当たって大怪我をする恐れがあります。投げ方の詳しい手順は
              <Link
                href="/guide/casting"
                className="font-medium text-amber-900 underline dark:text-amber-100"
              >
                キャスティングの基本
              </Link>
              をご覧ください。
            </Warning>
          </SectionCard>

          {/* 釣れる魚 */}
          <SectionCard title="ちょい投げで釣れる魚" icon={Fish}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">キス（シロギス）</h3>
                  <Badge variant="secondary" className="text-xs">
                    天ぷらの王様
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  ちょい投げの代表的なターゲット。白くて上品な身は天ぷらにすると絶品です。砂底を好み、群れで行動するため、1匹釣れたら同じポイントに投げると連続して釣れることも。シーズンは5〜9月で、特に6〜8月の夏が最盛期。初心者でも20cmクラスのキスを釣ることができます。
                </p>
                <Link
                  href="/fish/kisu"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  キスの詳細を見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-bold text-foreground">ハゼ（マハゼ）</h3>
                  <Badge variant="secondary" className="text-xs">
                    秋の定番ターゲット
                  </Badge>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  秋のちょい投げの主役。河口や汽水域に多く生息し、小さいながらもアタリが明確で釣る楽しさがあります。シーズンは7〜11月で、9〜10月が最盛期。初夏の小さなハゼ（デキハゼ）から秋の大型ハゼまで、成長を追いかけるのも楽しみの一つ。天ぷらや唐揚げが定番料理です。
                </p>
                <Link
                  href="/fish/haze"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  ハゼの詳細を見る
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  その他にもこんな魚が釣れることも
                </p>
                <p className="mt-1">
                  カレイ（冬）、メゴチ、ベラ、小型のマダイ、イシモチなど。何が釣れるかわからないのも、ちょい投げの楽しさです。
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 釣果アップのコツ */}
          <SectionCard title="釣果アップのコツ" icon={Lightbulb}>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    エサはこまめに付け替える
                  </span>
                  <br />
                  イソメは時間が経つと弱って動かなくなります。動きが鈍くなったら新しいイソメに交換しましょう。アタリがなくても5〜10分に一度はチェックするのがおすすめです。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    ゆっくりサビいて広い範囲を探る
                  </span>
                  <br />
                  魚のいるポイントに仕掛けが来ないと釣れません。サビいて（ゆっくり引いて）仕掛けを動かし、広い範囲を探りましょう。サビくスピードはリールのハンドル半回転を5〜10秒かけて巻くイメージです。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    砂地のポイントを狙う
                  </span>
                  <br />
                  キスやハゼは砂底に生息しています。岩場やゴロタ石のエリアでは根掛かりが多くなるだけでなく、ターゲットもいません。砂浜の延長線上や、漁港内の砂底エリアを選びましょう。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    時合い（じあい）を逃さない
                  </span>
                  <br />
                  潮が動いている時間帯（上げ潮・下げ潮）が最もチャンス。満潮や干潮の前後1〜2時間は特に魚の活性が上がります。朝マズメ・夕マズメと潮の動きが重なる時間帯が最高のタイミングです。
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">&#9679;</span>
                <div>
                  <span className="font-medium text-foreground">
                    投げる距離を変えてみる
                  </span>
                  <br />
                  遠くばかり投げるのではなく、10m、20m、30mと距離を変えてみましょう。意外と足元近くにキスの群れがいることもあります。
                </div>
              </li>
            </ul>
          </SectionCard>

          {/* おすすめスポット */}
          <SectionCard title="おすすめスポット" icon={MapPin}>
            <p className="mb-4 text-sm text-muted-foreground">
              ちょい投げ釣りに適した釣り場は、砂底が広がる漁港や堤防、砂浜です。足場が安定していて、砂地が続くポイントを選びましょう。
            </p>

            {choinageSpots.length > 0 && (
              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {choinageSpots.map((spot) => (
                    <Link
                      key={spot.id}
                      href={`/spots/${spot.slug}`}
                      className="group flex items-center gap-2 rounded-lg border p-3 transition-colors hover:border-primary"
                    >
                      <MapPin className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium group-hover:text-primary">
                          {spot.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {spot.region.prefecture} {spot.region.areaName}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/spots">
                      すべてのスポットを見る
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </SectionCard>

          {/* よくある質問 */}
          <SectionCard title="よくある質問（FAQ）" icon={HelpCircle}>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. ちょい投げ釣りと本格的な投げ釣りの違いは？
                </h3>
                <p className="text-sm text-muted-foreground">
                  ちょい投げは軽いオモリ（5〜10号）を使い、20〜30m程度投げる手軽な釣りです。万能竿やルアーロッドでもできます。一方、本格的な投げ釣りは専用の竿と重いオモリ（25〜30号）で100m以上投げます。初心者にはちょい投げがおすすめです。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. ちょい投げで釣れる魚は？
                </h3>
                <p className="text-sm text-muted-foreground">
                  <Link
                    href="/fish/kisu"
                    className="text-primary hover:underline"
                  >
                    キス（シロギス）
                  </Link>
                  と
                  <Link
                    href="/fish/haze"
                    className="text-primary hover:underline"
                  >
                    ハゼ（マハゼ）
                  </Link>
                  が主なターゲットです。他にもカレイ、メゴチ、ベラ、小型のマダイなども釣れることがあります。砂地の海底にいる魚がメインです。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. 青イソメの代わりに使えるエサはありますか？
                </h3>
                <p className="text-sm text-muted-foreground">
                  ジャリメ（石ゴカイ）はキス釣りに特に効果的です。また、パワーイソメなどの人工エサは虫エサが苦手な方でも使えて、保存も効くので便利です。ただし、天然の青イソメが最も万能で釣果も安定します。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. ちょい投げに最適な時期はいつですか？
                </h3>
                <p className="text-sm text-muted-foreground">
                  <Link
                    href="/fish/kisu"
                    className="text-primary hover:underline"
                  >
                    キス
                  </Link>
                  は5〜9月（特に6〜8月がベスト）、
                  <Link
                    href="/fish/haze"
                    className="text-primary hover:underline"
                  >
                    ハゼ
                  </Link>
                  は7〜11月（特に9〜10月がベスト）です。夏場はキス、秋口はハゼと季節によってターゲットを変えると年間を通して楽しめます。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Q. ちょい投げの仕掛けは何号がいい？
                </h3>
                <p className="text-sm text-muted-foreground">
                  オモリは5〜10号が標準。潮の流れが速い場所では10号、穏やかな場所では5〜8号を使います。針はキス針なら7〜9号、ハゼなら6〜8号が目安です。市販のちょい投げ仕掛けセットを使えば選ぶ手間が省けます。
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* 道具を揃えるなら */}
        <section className="mt-8 sm:mt-10">
          <ProductList
            products={getProductsByMethod("choinage")}
            title="ちょい投げ釣りに必要な道具"
            description="ちょい投げを始めるなら、まずはこれを揃えましょう。"
          />
        </section>

        {/* 関連ガイド */}
        <section className="mt-8 sm:mt-10">
          <h2 className="mb-4 text-center text-xl font-bold">
            関連ガイド
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/guide/casting" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Target className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    投げ方（キャスティング）の基本
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ちょい投げのキャストを上達させるコツ
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/guide/beginner" className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="pt-6">
                  <Fish className="mb-2 size-5 text-primary" />
                  <p className="font-medium group-hover:text-primary">
                    釣り初心者完全ガイド
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    釣りの基本から道具選びまで完全網羅
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            ちょい投げで釣れるスポットを探してみよう
          </p>
          <Button asChild size="lg" className="min-h-[48px] rounded-full px-8">
            <Link href="/spots">スポットを探す</Link>
          </Button>
        </div>
      {/* LINE登録バナー */}
      <div className="mt-8 sm:mt-12">
        <LineBanner variant="compact" />
      </div>
      </main>
    </>
  );
}
