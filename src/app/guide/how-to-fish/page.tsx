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
  TreePine,
  Sun,
  Leaf,
  Snowflake,
  Flower2,
  ShieldCheck,
  BookOpen,
  Footprints,
  Clock,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";

export const metadata: Metadata = {
  title: "釣りのやり方完全ガイド｜初めてでもわかる基本の釣り方【2026年版】",
  description:
    "釣りのやり方を初心者にもわかりやすく解説。場所の選び方から道具の準備、エサの付け方、魚の釣り方まで、釣りの基本をステップバイステップで紹介。サビキ釣り・投げ釣り・ルアー釣りの始め方も。",
  openGraph: {
    title: "釣りのやり方完全ガイド｜初めてでもわかる基本の釣り方【2026年版】",
    description:
      "釣りのやり方を初心者にもわかりやすく解説。場所の選び方から道具の準備、エサの付け方、釣り方まで基本をステップバイステップで紹介。",
    type: "article",
    url: "https://tsurispot.com/guide/how-to-fish",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/how-to-fish",
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
      name: "釣りのやり方完全ガイド",
      item: "https://tsurispot.com/guide/how-to-fish",
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "釣りのやり方｜初心者でもわかる5ステップ",
  description:
    "釣りをゼロから始めるための手順を5つのステップで解説。場所選びから道具の準備、エサのセット、投入、魚の取り込みまで。",
  totalTime: "PT3H",
  supply: [
    { "@type": "HowToSupply", name: "釣り竿（万能竿またはサビキセット）" },
    { "@type": "HowToSupply", name: "スピニングリール（2000〜3000番）" },
    { "@type": "HowToSupply", name: "仕掛け（サビキ仕掛け・ちょい投げ仕掛けなど）" },
    { "@type": "HowToSupply", name: "エサ（アミエビまたは青イソメ）" },
    { "@type": "HowToSupply", name: "バケツ" },
    { "@type": "HowToSupply", name: "クーラーボックス" },
  ],
  tool: [
    { "@type": "HowToTool", name: "ハサミまたはラインカッター" },
    { "@type": "HowToTool", name: "プライヤー（針外し）" },
    { "@type": "HowToTool", name: "タオル" },
    { "@type": "HowToTool", name: "ゴミ袋" },
  ],
  step: [
    {
      "@type": "HowToStep",
      name: "場所を決める",
      text: "初心者には足場が安定した堤防や漁港がおすすめです。トイレや駐車場の有無を事前に確認しましょう。",
      position: 1,
    },
    {
      "@type": "HowToStep",
      name: "道具を準備する",
      text: "竿・リール・仕掛け・エサなど必要な道具を準備します。初心者セットなら3,000〜5,000円で一式揃います。",
      position: 2,
    },
    {
      "@type": "HowToStep",
      name: "エサ・仕掛けをセットする",
      text: "竿にリールを取り付け、ガイドに糸を通して仕掛けを結びます。サビキならカゴにアミエビを詰め、ちょい投げなら針に青イソメを付けます。",
      position: 3,
    },
    {
      "@type": "HowToStep",
      name: "投げる・待つ",
      text: "サビキ釣りなら足元に仕掛けを落とし、ちょい投げなら20〜30m先に投入します。竿先の動きに注意しながら、アタリを待ちましょう。",
      position: 4,
    },
    {
      "@type": "HowToStep",
      name: "魚を釣り上げる",
      text: "竿先がグッと引き込まれたら合わせを入れ、リールを巻いて魚を寄せます。取り込んだらプライヤーで針を外し、クーラーボックスへ。",
      position: 5,
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "釣りは何歳からできる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "明確な年齢制限はありません。3〜4歳頃から親と一緒にサビキ釣りを楽しむお子さんもいます。海釣り公園や管理釣り場なら柵があり安全です。小学生以上ならほとんどの釣りに挑戦できます。",
      },
    },
    {
      "@type": "Question",
      name: "1人でも釣りはできる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい、釣りはソロでも十分楽しめるレジャーです。自分のペースで釣りができ、リフレッシュにもなります。ただし安全面を考慮し、最初は人がいる堤防や漁港を選びましょう。",
      },
    },
    {
      "@type": "Question",
      name: "釣り道具はどこで買える？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "釣具専門店（上州屋・かめや釣具・キャスティングなど）が最も品揃えが豊富です。Amazon・楽天などのネット通販でも購入可能。ホームセンターにも初心者セットが置いてあることがあります。",
      },
    },
    {
      "@type": "Question",
      name: "初心者でも魚は釣れる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい、サビキ釣りなら初心者でも高確率で釣れます。特に夏〜秋の堤防では、アジやイワシの群れが回遊していれば、初めてでも数十匹の釣果が期待できます。",
      },
    },
    {
      "@type": "Question",
      name: "釣りにかかる費用は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "最も安く始めるなら3,000〜5,000円でサビキ釣りセットとエサが揃います。毎回の釣行ではエサ代（500〜1,500円）と交通費が主な出費です。管理釣り場の場合は入場料（1,000〜3,000円程度）が別途かかります。",
      },
    },
    {
      "@type": "Question",
      name: "雨の日でも釣りはできる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "小雨程度なら釣りは可能で、むしろ釣り人が少なく好釣果になることもあります。ただし、雷を伴う雨や強風の日は大変危険なので必ず中止してください。レインウェアと滑りにくい靴は必須です。",
      },
    },
    {
      "@type": "Question",
      name: "釣った魚はどうする？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "クーラーボックスに氷と一緒に入れて持ち帰り、自宅で調理できます。アジなら刺身やフライ、キスなら天ぷらが定番です。食べきれない分や小さな魚は優しくリリースしましょう。",
      },
    },
    {
      "@type": "Question",
      name: "釣りの服装は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "動きやすく汚れてもよい服装が基本です。帽子・偏光サングラス・滑りにくい靴を着用し、夏は日焼け止め、冬は防寒着を忘れずに。堤防では風が強いので、風を通しにくい上着があると快適です。",
      },
    },
    {
      "@type": "Question",
      name: "子供でも安全に釣りができる場所は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "海釣り公園や管理釣り場がおすすめです。柵が設置されており、スタッフも常駐しているため安全性が高いです。レンタル竿があるので手ぶらでも楽しめます。お子さんには必ずライフジャケットを着用させてください。",
      },
    },
    {
      "@type": "Question",
      name: "釣りに許可は必要？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "海釣りの場合、基本的に免許や許可は不要です。ただし、立入禁止の場所や釣り禁止区域では釣りができません。川や湖での釣りは遊漁券（遊漁料）が必要な場合が多いので、事前に漁協のサイトなどで確認しましょう。",
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

export default function HowToFishPage() {
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
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ガイド", href: "/guide" },
            { label: "釣りのやり方完全ガイド" },
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

        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣りのやり方完全ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            初めてでもわかる基本の釣り方。
            <br className="hidden sm:inline" />
            場所選び・道具・仕掛け・釣り方まで、すべてをステップバイステップで解説します。
          </p>
        </div>

        {/* 目次 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="mb-3 font-medium text-foreground">この記事の内容</p>
            <ol className="space-y-1.5 text-sm text-muted-foreground">
              {[
                { href: "#basics", label: "釣りとは？初心者が知るべき基礎知識" },
                { href: "#types", label: "釣りの種類｜海釣り・川釣り・湖釣りの違い" },
                { href: "#place", label: "釣り場の選び方｜初心者におすすめの場所" },
                { href: "#gear", label: "必要な道具と準備物" },
                { href: "#steps", label: "釣りの基本手順｜5ステップで解説" },
                { href: "#methods", label: "初心者におすすめの釣り方3選" },
                { href: "#season", label: "季節別おすすめの釣り方" },
                { href: "#manner", label: "釣りのマナーと注意点" },
                { href: "#faq", label: "よくある質問（FAQ）" },
                { href: "#related", label: "関連ガイド" },
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
          {/* 1. 釣りとは？ */}
          <SectionCard id="basics" title="釣りとは？初心者が知るべき基礎知識" icon={Fish}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りとは、竿や糸、針を使って魚を捕まえるレジャーです。日本では古くから親しまれており、海・川・湖など全国どこでも楽しめます。近年はファミリーフィッシングやソロ釣りの人気が高まり、性別・年齢を問わず幅広い層が楽しんでいます。
            </p>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りの最大の魅力は、自然の中で魚との駆け引きを楽しめることです。釣った魚をその日のうちに食べる贅沢、家族や友人との思い出づくり、一人で静かに自然と向き合う時間など、楽しみ方は人それぞれ。初期費用3,000円程度から始められる手軽さも大きな魅力です。
            </p>
            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <span className="font-medium">ポイント：</span>
              釣りは「魚を釣ること」だけが目的ではありません。自然の中でリフレッシュできるアウトドア活動として、心身のリラックス効果も注目されています。
            </div>
          </SectionCard>

          {/* 2. 釣りの種類 */}
          <SectionCard id="types" title="釣りの種類｜海釣り・川釣り・湖釣りの違い" icon={Waves}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りは大きく「海釣り」「川釣り」「湖釣り」の3つに分けられます。それぞれフィールドの特徴や釣れる魚が異なるので、自分の住んでいる場所や興味に合わせて選びましょう。
            </p>

            <div className="mb-4 space-y-3">
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Waves className="size-4 text-blue-500" />
                  <h3 className="font-medium text-foreground">海釣り（ソルトウォーター）</h3>
                  <Badge variant="secondary" className="text-xs">最も人気</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  堤防・漁港・磯・砂浜・船など多彩なフィールドがあります。アジ・サバ・イワシなどの回遊魚から、シーバス・クロダイなどの大物まで幅広い魚種が狙えます。基本的に免許不要で始められるのが大きなメリットです。初心者には堤防からのサビキ釣りが最適です。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TreePine className="size-4 text-green-500" />
                  <h3 className="font-medium text-foreground">川釣り（フレッシュウォーター）</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  渓流ではヤマメ・イワナ、中〜下流域ではアユ・オイカワ・ブラックバスなどが釣れます。自然豊かな環境で釣りを楽しめますが、多くの河川では遊漁券の購入が必要です。渓流釣りは解禁期間（3〜9月頃）があるので事前確認を。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="size-4 text-teal-500" />
                  <h3 className="font-medium text-foreground">湖釣り・管理釣り場</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  湖沼ではブラックバス・ワカサギ・コイ・ヘラブナなどが狙えます。管理釣り場（トラウト釣り堀）はニジマスなどが放流されており、初心者でも確実に魚が釣れる環境が整っています。道具レンタルがあるので手ぶらで行ける施設も多いです。
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              どの釣りから始めればいいか迷ったら、まずは
              <Link href="/guide/fishing-for-beginners" className="text-primary hover:underline">
                釣り初心者ガイド
              </Link>
              を参考にしてみてください。全国の釣りスポットは
              <Link href="/spots" className="text-primary hover:underline">
                釣りスポット一覧
              </Link>
              から検索できます。
            </p>
          </SectionCard>

          {/* 3. 釣り場の選び方 */}
          <SectionCard id="place" title="釣り場の選び方｜初心者におすすめの場所" icon={MapPin}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              初心者が釣り場を選ぶ際に最も重要なのは「安全性」と「アクセスの良さ」です。足場が安定していて、トイレや駐車場が近くにある場所を選びましょう。
            </p>

            <div className="mb-4 space-y-3">
              <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-950/50">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white hover:bg-blue-600">おすすめ No.1</Badge>
                  <h3 className="font-bold text-foreground">堤防・漁港</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  コンクリートで整備された足場で安全。車を横付けできる場所も多く、初心者やファミリーに最適です。サビキ釣りでアジ・イワシ・サバなどの回遊魚が狙えます。
                </p>
                <div className="mt-2">
                  <Link
                    href="/fishing-spots/breakwater-beginner"
                    className="inline-flex items-center text-sm text-primary hover:underline"
                  >
                    初心者向け堤防釣りスポットを探す
                    <ChevronRight className="ml-0.5 size-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-bold text-foreground">管理釣り場・海釣り公園</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  スタッフ常駐で安全。柵があるのでお子さんも安心。レンタル竿がある施設なら手ぶらでもOKです。入場料（1,000〜3,000円程度）がかかりますが、確実に魚が釣れる環境が整っています。
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-bold text-foreground">砂浜（サーフ）</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  ちょい投げ釣りでキスやハゼが狙えます。広いスペースでのびのび楽しめますが、波打ち際では足を取られないよう注意が必要です。
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">釣り場選びのチェックリスト</span>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>足場は安定しているか</li>
                <li>トイレがあるか</li>
                <li>駐車場があるか</li>
                <li>近くにコンビニや釣具店があるか</li>
                <li>釣り禁止エリアではないか</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <Button asChild variant="outline" size="sm">
                <Link href="/spots">
                  全国の釣りスポットを探す
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          {/* 4. 必要な道具 */}
          <SectionCard id="gear" title="必要な道具と準備物" icon={Package}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りに必要な道具は釣り方によって異なりますが、基本的なものは共通しています。初心者はまず「サビキ釣りセット」を購入するのが最も手軽でおすすめです。
            </p>

            <h3 className="mb-3 font-medium text-foreground">必須の道具</h3>
            <div className="mb-4 space-y-2">
              {[
                { name: "釣り竿（ロッド）", desc: "万能竿（2.7〜3.6m）または釣り方に合わせた専用竿。初心者セットなら竿とリールがセットになっています。" },
                { name: "リール", desc: "小〜中型スピニングリール（2000〜3000番）。糸付きのものを選べば手間が省けます。" },
                { name: "釣り糸（ライン）", desc: "ナイロン2〜3号が万能。PEラインは感度が良いですが扱いに慣れが必要です。" },
                { name: "仕掛け", desc: "サビキ仕掛け、ちょい投げ仕掛けなど。予備を2〜3セット用意すると安心です。" },
                { name: "エサ", desc: "サビキ釣りならアミエビ（チューブタイプが手軽）、ちょい投げなら青イソメ。釣具店で購入できます。" },
              ].map((item) => (
                <div key={item.name} className="flex gap-3 rounded-lg border p-3">
                  <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
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
                { name: "バケツ", desc: "水汲み・手洗い・魚の一時保管に。折りたたみ式が持ち運びに便利。" },
                { name: "クーラーボックス", desc: "釣った魚を新鮮に持ち帰るために必要。氷を入れて使用します。" },
                { name: "ハサミ・プライヤー", desc: "釣り糸を切ったり、魚から針を外したりするのに使います。" },
                { name: "タオル・ゴミ袋", desc: "手を拭いたり、ゴミを持ち帰るために。2〜3枚あると重宝します。" },
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

            <div className="rounded-lg border p-4">
              <p className="mb-2 text-sm font-medium text-foreground">予算の目安</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>お試しコース（約3,000円）：サビキセット + エサ</p>
                <p>安心コース（約5,000〜10,000円）：セット + バケツ + 小物類</p>
                <p>しっかりコース（約20,000〜30,000円）：良い竿・リールを個別購入</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
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

          {/* 5. 基本手順 */}
          <SectionCard id="steps" title="釣りの基本手順｜5ステップで解説" icon={Footprints}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りの基本的な流れを5つのステップで解説します。初めての方はこの手順に沿って進めれば、スムーズに釣りが楽しめます。
            </p>

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "場所を決める",
                  desc: "釣りたい魚や釣り方に合わせて場所を選びます。初心者には足場が安定した堤防や漁港がおすすめ。天気予報と潮汐情報を事前にチェックし、朝マズメ（日の出前後）に合わせて出発しましょう。",
                  link: { href: "/spots", label: "釣りスポットを探す" },
                },
                {
                  step: 2,
                  title: "道具を準備する",
                  desc: "竿にリールをセットし、ガイド（竿の輪）に糸を通します。竿は伸ばす前にリールを取り付け、一番手元のガイドから順に糸を通していきます。初心者セットなら説明書通りに組み立てるだけでOKです。",
                  link: { href: "/guide/setup", label: "セッティング方法を見る" },
                },
                {
                  step: 3,
                  title: "エサ・仕掛けをセットする",
                  desc: "サビキ釣りならカゴにアミエビを8分目まで詰めます。ちょい投げなら針に青イソメを通し刺しにします。仕掛けは糸に結ぶ前に、構造を確認しておくとトラブルが減ります。",
                  link: { href: "/guide/rigs", label: "仕掛けの作り方を見る" },
                },
                {
                  step: 4,
                  title: "投げる・待つ",
                  desc: "サビキ釣りなら足元に仕掛けを静かに落とし、竿を上下に軽く動かしてコマセを出します。ちょい投げなら20〜30m先に投入して底まで沈め、ゆっくりリールを巻きながらアタリを待ちます。竿先に集中しましょう。",
                  link: { href: "/guide/casting", label: "投げ方の基本を見る" },
                },
                {
                  step: 5,
                  title: "魚を釣り上げる",
                  desc: "竿先がグッと引き込まれたら、軽く竿を立てて合わせを入れます。その後はリールを一定の速さで巻いて魚を寄せましょう。取り込んだらプライヤーで針を外し、クーラーボックスに氷と一緒に入れて鮮度をキープします。",
                  link: { href: "/guide/handling", label: "魚の締め方を見る" },
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 rounded-lg border p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                    <Link
                      href={item.link.href}
                      className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
                    >
                      {item.link.label}
                      <ChevronRight className="ml-0.5 size-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 6. おすすめの釣り方3選 */}
          <SectionCard id="methods" title="初心者におすすめの釣り方3選" icon={Anchor}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              数ある釣り方の中から、初心者が最初に挑戦すべき3つの釣り方を紹介します。いずれも特別な技術がなくても楽しめ、魚が釣れやすいのが特徴です。
            </p>

            <div className="space-y-4">
              {/* サビキ釣り */}
              <div className="rounded-lg border-2 border-green-200 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Anchor className="size-5 text-green-600" />
                  <h3 className="text-lg font-bold">サビキ釣り</h3>
                  <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs">一番おすすめ</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  コマセ（撒き餌）で魚を集め、疑似餌のついた複数の針で一度にたくさんの魚を釣る方法です。投げる技術が不要で、足元に仕掛けを落とすだけ。
                  <Link href="/fish/aji" className="text-primary hover:underline">アジ</Link>・
                  <Link href="/fish/saba" className="text-primary hover:underline">サバ</Link>・
                  <Link href="/fish/iwashi" className="text-primary hover:underline">イワシ</Link>
                  が主なターゲットで、群れが回遊していれば初心者でも数十匹の釣果が期待できます。
                </p>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">ベストシーズン：</span>6〜10月（夏〜秋）</p>
                  <p><span className="font-medium text-foreground">おすすめの場所：</span>漁港、堤防</p>
                  <p><span className="font-medium text-foreground">予算目安：</span>3,000〜5,000円</p>
                </div>
                <Link
                  href="/guide/sabiki"
                  className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  サビキ釣り完全ガイドを読む
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              {/* ちょい投げ */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="size-5 text-blue-500" />
                  <h3 className="text-lg font-bold">ちょい投げ釣り</h3>
                  <Badge variant="secondary" className="text-xs">砂浜でも楽しめる</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  軽いオモリとエサ（青イソメ）をつけた仕掛けを20〜30m先に投げ、海底にいる
                  <Link href="/fish/kisu" className="text-primary hover:underline">キス</Link>や
                  <Link href="/fish/haze" className="text-primary hover:underline">ハゼ</Link>
                  を狙う釣り方です。投げる動作が楽しく、天ぷらが美味しい魚が釣れるのも魅力。サビキ釣りに慣れたら次のステップとしておすすめです。
                </p>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">ベストシーズン：</span>キスは5〜9月、ハゼは7〜11月</p>
                  <p><span className="font-medium text-foreground">おすすめの場所：</span>砂浜、漁港内の砂地</p>
                </div>
                <Link
                  href="/guide/choinage"
                  className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  ちょい投げ釣り完全ガイドを読む
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>

              {/* ルアー釣り */}
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Zap className="size-5 text-purple-500" />
                  <h3 className="text-lg font-bold">ルアー釣り（アジング）</h3>
                  <Badge variant="secondary" className="text-xs">ゲーム性が高い</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  小さなワーム（ソフトルアー）を使って
                  <Link href="/fish/aji" className="text-primary hover:underline">アジ</Link>を狙う「アジング」は、ルアー釣り入門に最適です。エサを使わないので手が汚れず、繊細なアタリを感じるゲーム性の高さが人気。夜の常夜灯周りが好ポイントです。
                </p>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">ベストシーズン：</span>通年（秋〜冬がベスト）</p>
                  <p><span className="font-medium text-foreground">おすすめの場所：</span>漁港の常夜灯周り</p>
                </div>
                <Link
                  href="/guide/lure"
                  className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  ルアー釣り入門ガイドを読む
                  <ChevronRight className="ml-0.5 size-4" />
                </Link>
              </div>
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

          {/* 7. 季節別おすすめ */}
          <SectionCard id="season" title="季節別おすすめの釣り方" icon={Sun}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              魚は季節によって活動パターンが変わります。時期に合った釣り方を選ぶことが釣果アップの鍵です。
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border-2 border-pink-200 bg-pink-50/50 p-4 dark:bg-pink-950/30">
                <div className="mb-2 flex items-center gap-2">
                  <Flower2 className="size-4 text-pink-500" />
                  <h3 className="font-bold text-foreground">春（3〜5月）</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  産卵前で体力をつけたい魚が活発に。メバリング、カレイ釣り、渓流釣りの解禁シーズン。水温が上がるにつれて堤防のサビキ釣りも始まります。
                </p>
              </div>

              <div className="rounded-lg border-2 border-orange-200 bg-orange-50/50 p-4 dark:bg-orange-950/30">
                <div className="mb-2 flex items-center gap-2">
                  <Sun className="size-4 text-orange-500" />
                  <h3 className="font-bold text-foreground">夏（6〜8月）</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  サビキ釣りのベストシーズン。アジ・サバ・イワシが堤防に大量に回遊します。キス釣り、アユ釣りも最盛期。朝マズメと夕マズメを狙いましょう。
                </p>
              </div>

              <div className="rounded-lg border-2 border-amber-200 bg-amber-50/50 p-4 dark:bg-amber-950/30">
                <div className="mb-2 flex items-center gap-2">
                  <Leaf className="size-4 text-amber-600" />
                  <h3 className="font-bold text-foreground">秋（9〜11月）</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  年間で最も釣れる黄金シーズン。サビキ釣りに加え、エギング（アオリイカ）、ショアジギング（青物）、ハゼ釣りなど選択肢が豊富。脂の乗った魚が美味しい時期です。
                </p>
              </div>

              <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-950/30">
                <div className="mb-2 flex items-center gap-2">
                  <Snowflake className="size-4 text-blue-500" />
                  <h3 className="font-bold text-foreground">冬（12〜2月）</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  魚の活性は下がりますが、メバリング、穴釣り、カレイ釣りなど冬ならではの釣りが楽しめます。管理釣り場でのトラウト釣りも人気。防寒対策をしっかりと。
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/seasonal">
                  季節の釣り情報を見る
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/catchable-now">
                  今釣れる魚を見る
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/fishing-calendar">
                  釣りカレンダー
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>

          {/* 8. マナーと注意点 */}
          <SectionCard id="manner" title="釣りのマナーと注意点" icon={ShieldCheck}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りを長く楽しむためには、マナーとルールを守ることが大切です。マナー違反が原因で釣り禁止になるスポットが年々増えています。一人ひとりの心がけが、釣り場の未来を守ります。
            </p>

            <div className="space-y-3 text-sm text-muted-foreground">
              {[
                { title: "ゴミは必ず持ち帰る", desc: "釣り糸の切れ端、仕掛けの袋、エサの容器、飲食のゴミはすべて持ち帰りましょう。特に切れた釣り糸は鳥や海洋生物に絡まり命を奪うこともあります。" },
                { title: "釣り場を洗い流す", desc: "コマセや魚の血で汚れた場所は、帰る前にバケツの海水で洗い流しましょう。「来た時よりもきれいに」が釣り人の心得です。" },
                { title: "釣り禁止区域を守る", desc: "立入禁止や釣り禁止の標識がある場所では絶対に釣りをしないでください。違反すると罰金や書類送検の対象になることもあります。" },
                { title: "他の釣り人への配慮", desc: "隣の人との間隔を最低2〜3m空ける、大声を出さない、仕掛けが交差しないよう注意する。釣り場では挨拶を忘れずに。" },
                { title: "安全対策を怠らない", desc: "ライフジャケット着用を推奨。滑りにくい靴を履く。天候が悪化したら無理せず撤退。子供からは目を離さないでください。" },
                { title: "小さな魚はリリースする", desc: "食べきれない量や小さすぎる魚は優しく海に戻しましょう。水面に叩きつけず、両手で包むように海に返すのがコツです。" },
              ].map((item) => (
                <div key={item.title} className="flex gap-2">
                  <span className="text-primary">&#9679;</span>
                  <div>
                    <span className="font-medium text-foreground">{item.title}</span>
                    <br />
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/fishing-rules"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                釣りのルールをもっと詳しく見る
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
              <Link
                href="/safety"
                className="ml-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                安全ガイドを見る
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </div>
          </SectionCard>

          {/* 9. FAQ */}
          <SectionCard id="faq" title="よくある質問（FAQ）" icon={HelpCircle}>
            <div className="space-y-3">
              {[
                { q: "釣りは何歳からできる？", a: "明確な年齢制限はありません。3〜4歳頃から親と一緒にサビキ釣りを楽しむお子さんもいます。海釣り公園や管理釣り場なら柵があり安全です。" },
                { q: "1人でも釣りはできる？", a: "はい、ソロ釣りも人気です。自分のペースで楽しめ、リフレッシュにもなります。安全のため、最初は人がいる堤防や漁港を選びましょう。" },
                { q: "釣り道具はどこで買える？", a: "釣具専門店（上州屋・かめや・キャスティングなど）が品揃え豊富。Amazon・楽天などネット通販でも購入可能。ホームセンターにも初心者セットがあります。" },
                { q: "初心者でも魚は釣れる？", a: "サビキ釣りなら高確率で釣れます。夏〜秋の堤防ではアジやイワシの群れが回遊していれば、初めてでも数十匹の釣果が期待できます。" },
                { q: "釣りにかかる費用は？", a: "サビキ釣りセットなら3,000〜5,000円で一式揃います。毎回の出費はエサ代500〜1,500円と交通費が主。管理釣り場は入場料1,000〜3,000円が別途かかります。" },
                { q: "雨の日でも釣りはできる？", a: "小雨なら問題なし。むしろ釣り人が少なく好釣果になることも。雷や強風の日は絶対に中止してください。" },
                { q: "釣った魚はどうする？", a: "クーラーボックスに氷と入れて持ち帰り、自宅で調理。アジなら刺身やフライ、キスなら天ぷらが定番です。食べない分は優しくリリースしましょう。" },
                { q: "釣りの服装は？", a: "動きやすく汚れてもよい服装が基本。帽子・偏光サングラス・滑りにくい靴を着用。夏は日焼け止め、冬は防寒着を忘れずに。" },
                { q: "子供でも安全に釣りができる場所は？", a: "海釣り公園や管理釣り場がおすすめ。柵・スタッフ常駐で安全性が高く、レンタル竿で手ぶらでも楽しめます。お子さんにはライフジャケットを必ず着用させてください。" },
                { q: "釣りに許可は必要？", a: "海釣りなら基本的に免許不要。川や湖は遊漁券が必要な場合が多いので、事前に漁協のサイトなどで確認しましょう。" },
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

          {/* 10. 関連ガイド */}
          <section id="related">
            <h2 className="mb-4 text-center text-xl font-bold">関連ガイド</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { href: "/guide/beginner", title: "釣り初心者完全ガイド", desc: "釣りの魅力から道具選び、おすすめ釣り方まで完全網羅", icon: BookOpen },
                { href: "/guide/fishing-for-beginners", title: "釣り初心者ガイド", desc: "ゼロから始める釣り入門。最初にやるべきことがわかる", icon: Fish },
                { href: "/guide/fishing-gear-guide", title: "釣り道具の選び方ガイド", desc: "竿・リール・ラインの選び方と予算別おすすめセット", icon: Package },
                { href: "/guide/fishing-tips", title: "釣りのコツ・テクニック集", desc: "もっと釣れるようになるための実践的なコツを紹介", icon: Target },
                { href: "/guide/sabiki", title: "サビキ釣り完全ガイド", desc: "初心者の定番、サビキ釣りを詳しく解説", icon: Anchor },
                { href: "/methods", title: "釣り方・釣法ガイド", desc: "9つの釣法を初心者向けにわかりやすく解説", icon: Waves },
                { href: "/fish", title: "魚図鑑", desc: "80種以上の魚の特徴・釣り方・旬を紹介", icon: Fish },
                { href: "/spots", title: "釣りスポット一覧", desc: "全国1,000以上の釣りスポットを検索", icon: MapPin },
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

        {/* CTA */}
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
