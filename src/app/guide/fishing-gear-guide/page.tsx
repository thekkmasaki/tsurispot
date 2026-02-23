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
  Wrench,
  CircleDollarSign,
  ShieldCheck,
  BookOpen,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LineBanner } from "@/components/line-banner";

export const metadata: Metadata = {
  title: "釣り道具の選び方完全ガイド｜初心者が揃えるべき道具と予算【2026年版】",
  description:
    "釣り道具の選び方を初心者向けに完全解説。竿（ロッド）・リール・ライン・仕掛けの選び方、予算別おすすめセット、釣り方別の必要道具リストまで網羅。3,000円から始められる道具ガイドです。",
  openGraph: {
    title: "釣り道具の選び方完全ガイド｜初心者が揃えるべき道具と予算【2026年版】",
    description:
      "釣り道具の選び方を初心者向けに完全解説。竿・リール・ライン・仕掛けの基礎知識と予算別おすすめセットを紹介。",
    type: "article",
    url: "https://tsurispot.com/guide/fishing-gear-guide",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/fishing-gear-guide",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
    { "@type": "ListItem", position: 2, name: "釣りの始め方ガイド", item: "https://tsurispot.com/guide" },
    { "@type": "ListItem", position: 3, name: "釣り道具の選び方ガイド", item: "https://tsurispot.com/guide/fishing-gear-guide" },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "釣り道具は最低いくらで揃えられる？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "サビキ釣りセット（竿・リール・仕掛け）は3,000〜5,000円で購入可能です。エサ代を含めても5,000円以内で釣りを始められます。100円ショップのバケツやハサミも活用できます。",
      },
    },
    {
      "@type": "Question",
      name: "初心者が最初に買うべき竿は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "2.7〜3.6mの万能竿（磯竿2〜3号）がおすすめです。サビキ釣り・ちょい投げ・ウキ釣りなど複数の釣り方に対応できます。セット竿なら竿とリールが一式揃って手軽です。",
      },
    },
    {
      "@type": "Question",
      name: "リールは何番を選べばいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者には2500番のスピニングリールが最もおすすめです。軽すぎず重すぎず、サビキ・ちょい投げ・ルアーなど幅広い釣り方に使えます。糸付きのモデルを選べば別途ラインを買う必要もありません。",
      },
    },
    {
      "@type": "Question",
      name: "PEラインとナイロンラインの違いは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ナイロンラインは伸びがあり扱いやすく初心者向け。PEラインは伸びが少なく感度が高いですが、風に弱くリーダーが必要。初心者はまずナイロンラインから始め、ルアー釣りに進む際にPEラインを検討しましょう。",
      },
    },
    {
      "@type": "Question",
      name: "釣り道具はどこで買えばいい？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "釣具専門店（上州屋・キャスティング・かめやなど）が品揃え豊富でスタッフに相談もできます。Amazon・楽天などのネット通販も価格比較に便利。初心者セットならホームセンターにもあります。",
      },
    },
    {
      "@type": "Question",
      name: "中古の釣り道具でも大丈夫？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "竿やリールは中古でも十分使えます。メルカリやリサイクルショップで状態の良いものが安く手に入ることもあります。ただし、ラインや仕掛けは消耗品なので新品を購入しましょう。",
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

export default function FishingGearGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ガイド", href: "/guide" },
            { label: "釣り道具の選び方ガイド" },
          ]}
        />
        <div className="mb-6">
          <Link href="/guide" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 size-4" />
            釣りの始め方ガイドに戻る
          </Link>
        </div>

        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">釣り道具の選び方完全ガイド</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            竿・リール・ライン・仕掛けの選び方から予算別おすすめセットまで。
            <br className="hidden sm:inline" />
            初心者が失敗しない道具選びのポイントを徹底解説します。
          </p>
        </div>

        {/* 目次 */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="mb-3 font-medium text-foreground">この記事の内容</p>
            <ol className="space-y-1.5 text-sm text-muted-foreground">
              {[
                { href: "#rod", label: "竿（ロッド）の選び方" },
                { href: "#reel", label: "リールの選び方" },
                { href: "#line", label: "ライン（釣り糸）の選び方" },
                { href: "#rig", label: "仕掛け・ルアーの選び方" },
                { href: "#accessories", label: "あると便利な小物・アクセサリー" },
                { href: "#budget", label: "予算別おすすめセット" },
                { href: "#method-gear", label: "釣り方別の必要道具一覧" },
                { href: "#maintenance", label: "道具のメンテナンス方法" },
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
          {/* 1. 竿の選び方 */}
          <SectionCard id="rod" title="竿（ロッド）の選び方" icon={Wrench}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              竿は釣りの基本となる道具です。長さ・硬さ・種類によって適した釣り方が異なります。初心者はまず「万能竿」を1本持っておくと、さまざまな釣り方に対応できます。
            </p>

            <h3 className="mb-3 font-medium text-foreground">竿の種類</h3>
            <div className="mb-4 space-y-2">
              {[
                { name: "万能竿（磯竿2〜3号）", desc: "2.7〜3.6m。サビキ・ちょい投げ・ウキ釣りに対応。初心者の最初の1本に最適。", badge: "初心者おすすめ" },
                { name: "投げ竿", desc: "3.6〜4.2m。遠投に特化。砂浜からのキス釣りやカレイ釣りに。" },
                { name: "ルアーロッド", desc: "6〜10ft。ルアー釣り専用。対象魚に合わせて硬さと長さを選ぶ。" },
                { name: "渓流竿（のべ竿）", desc: "3.6〜5.4m。リール不要。渓流でのヤマメ・イワナ釣りに。" },
                { name: "船竿", desc: "1.5〜2.4m。短くて丈夫。船釣り専用。" },
              ].map((item) => (
                <div key={item.name} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    {item.badge && <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs">{item.badge}</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <span className="font-medium">選び方のポイント：</span>
              最初の1本は「磯竿3号 3.6m」または「万能竿セット」がおすすめ。サビキ・ちょい投げ・ウキ釣りの3つの釣り方をカバーできます。予算は3,000〜8,000円が目安です。
            </div>
          </SectionCard>

          {/* 2. リールの選び方 */}
          <SectionCard id="reel" title="リールの選び方" icon={Wrench}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              リールは糸を巻き取るための道具で、スピニングリールとベイトリールの2種類があります。初心者には扱いやすいスピニングリールがおすすめです。
            </p>

            <h3 className="mb-3 font-medium text-foreground">リールの番手（サイズ）の選び方</h3>
            <div className="mb-4 space-y-2">
              {[
                { size: "1000〜2000番", use: "アジング・メバリングなどのライトゲーム", target: "小型魚向け" },
                { size: "2500番", use: "サビキ・ちょい投げ・エギングなど万能", target: "初心者に最適", badge: "おすすめ" },
                { size: "3000〜4000番", use: "ショアジギング・シーバス・遠投カゴ", target: "中〜大型魚向け" },
                { size: "5000番以上", use: "大型青物・磯釣り・投げ釣り", target: "上級者向け" },
              ].map((item) => (
                <div key={item.size} className="flex gap-3 rounded-lg border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{item.size}</p>
                      {item.badge && <Badge className="bg-green-500 text-white hover:bg-green-600 text-xs">{item.badge}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.use}（{item.target}）</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
              <span className="font-medium">初心者へのアドバイス：</span>
              最初は「2500番のスピニングリール（糸付き）」を選べば間違いありません。糸（ナイロン3号）があらかじめ巻いてあるモデルなら、別途ラインを買う必要もなく手軽です。
            </div>
          </SectionCard>

          {/* 3. ラインの選び方 */}
          <SectionCard id="line" title="ライン（釣り糸）の選び方" icon={Wrench}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              ラインは竿と魚をつなぐ重要な道具です。素材によって特性が異なるので、釣り方に合ったラインを選びましょう。
            </p>

            <div className="mb-4 space-y-3">
              <div className="rounded-lg border-2 border-green-200 bg-green-50/50 p-4 dark:bg-green-950/50">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white hover:bg-green-600">初心者おすすめ</Badge>
                  <h3 className="font-bold text-foreground">ナイロンライン</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  しなやかで扱いやすく、初心者に最適。適度な伸びがあり、魚のバイト時のショックを吸収してくれます。サビキ・ちょい投げ・ウキ釣りなど幅広い釣りに対応。2〜3号が汎用的です。
                </p>
                <p className="mt-1 text-xs text-green-700">おすすめ号数：2〜3号 / 価格帯：300〜800円</p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-bold text-foreground">フロロカーボンライン</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  ナイロンより硬く、根ズレ（岩などとの摩擦）に強い。感度も高め。水中での屈折率が水に近いため、魚に見えにくいのが特徴。リーダー（先糸）としても多用されます。
                </p>
                <p className="mt-1 text-xs text-muted-foreground">おすすめ号数：1.5〜3号 / 価格帯：500〜1,500円</p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-bold text-foreground">PEライン</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  超高感度で伸びがほぼゼロ。同じ太さならナイロンの3〜4倍の強度があります。ルアー釣り・エギング・ショアジギングに最適。ただし風に弱く、リーダー（フロロカーボン）の接続が必要。中級者以上向け。
                </p>
                <p className="mt-1 text-xs text-muted-foreground">おすすめ号数：0.6〜1.5号 / 価格帯：1,000〜3,000円</p>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
              <span className="font-medium">まとめ：</span>
              初心者はナイロンライン2〜3号から始めて、ルアー釣りに進みたくなったらPEラインを検討しましょう。「糸付きリール」を買えばライン選びに悩む必要もありません。
            </div>
          </SectionCard>

          {/* 4. 仕掛け・ルアー */}
          <SectionCard id="rig" title="仕掛け・ルアーの選び方" icon={Anchor}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              仕掛けは釣り方ごとに専用のものがあります。釣具店で「○○釣り用仕掛け」と書かれたパッケージを選べばOKです。初心者は予備を含めて2〜3セット用意しましょう。
            </p>

            <div className="mb-4 space-y-2">
              {[
                { name: "サビキ仕掛け", desc: "ピンクスキンまたはハゲ皮。針4〜6号が汎用的。コマセカゴとセットで使う。", price: "200〜500円/セット" },
                { name: "ちょい投げ仕掛け", desc: "天秤+針のセット。キス狙いなら針6〜8号。カレイ狙いは針10〜12号。", price: "300〜600円/セット" },
                { name: "ウキ仕掛け", desc: "ウキ+オモリ+針のセット。完成仕掛けが便利。対象魚で号数を選ぶ。", price: "500〜1,000円/セット" },
                { name: "ジグヘッド+ワーム", desc: "アジング・メバリング用。ジグヘッド0.5〜1.5g、ワーム1.5〜2インチ。", price: "ジグヘッド300〜600円 / ワーム400〜800円" },
                { name: "メタルジグ", desc: "ショアジギング用。20〜40gが汎用的。ブルーピンクが定番カラー。", price: "500〜1,500円/個" },
                { name: "エギ", desc: "エギング（イカ釣り）用。2.5〜3.5号。オレンジ・ピンク系が定番。", price: "600〜1,200円/個" },
              ].map((item) => (
                <div key={item.name} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <span className="text-xs text-muted-foreground">{item.price}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 5. 小物・アクセサリー */}
          <SectionCard id="accessories" title="あると便利な小物・アクセサリー" icon={Package}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣り場での快適さと安全性を高める小物類です。すべて揃える必要はありませんが、あると釣りがもっと楽しくなります。
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { name: "クーラーボックス", desc: "釣った魚の鮮度キープに必須。10〜15Lが日帰り釣行に最適。", priority: "必須" },
                { name: "折りたたみバケツ", desc: "水汲み・手洗い・魚の一時保管に。コンパクトに収納できて便利。", priority: "必須" },
                { name: "ハサミ / ラインカッター", desc: "釣り糸を切る。小型のフィッシングハサミがあると便利。", priority: "必須" },
                { name: "プライヤー", desc: "魚から針を外す。先端が細いフィッシングプライヤーが使いやすい。", priority: "必須" },
                { name: "フィッシュグリップ", desc: "魚を掴む。ヒレのトゲが危険な魚に必須。1,000円前後。", priority: "推奨" },
                { name: "タオル", desc: "手拭き・魚掴み用に2〜3枚。使い古しでOK。", priority: "推奨" },
                { name: "ライフジャケット", desc: "安全のために着用推奨。膨張式なら普段は嵩張らない。", priority: "推奨" },
                { name: "ヘッドライト", desc: "夜釣りや薄暗い時間帯に必須。赤色LEDモード付きが理想。", priority: "夜釣り必須" },
                { name: "偏光サングラス", desc: "水面の反射をカットして水中が見える。紫外線対策にも。", priority: "推奨" },
                { name: "ロッドスタンド", desc: "竿を地面に置かずに立てかけられる。竿の傷防止にも。", priority: "あると便利" },
              ].map((item) => (
                <div key={item.name} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <Badge variant="outline" className="text-xs">{item.priority}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 6. 予算別おすすめセット */}
          <SectionCard id="budget" title="予算別おすすめセット" icon={CircleDollarSign}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              予算に合わせた道具の揃え方を3パターン紹介します。まずは「お手軽コース」から始めて、釣りにハマったら少しずつグレードアップしていくのがおすすめです。
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border-2 border-green-200 bg-green-50/50 p-4 dark:bg-green-950/50">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-green-500 text-white hover:bg-green-600">コスパ最強</Badge>
                  <h3 className="font-bold text-foreground">お手軽コース（3,000〜5,000円）</h3>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>- サビキ釣りセット（竿+リール+仕掛け）: 3,000〜4,000円</p>
                  <p>- アミエビ（チューブタイプ）: 300〜500円</p>
                  <p>- 100均バケツ+ハサミ+ゴミ袋: 300円</p>
                </div>
                <p className="mt-2 text-xs text-green-700">サビキ釣りを始めるなら十分な装備。まず釣りを体験したい方に。</p>
              </div>

              <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-950/50">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white hover:bg-blue-600">バランス型</Badge>
                  <h3 className="font-bold text-foreground">安心コース（8,000〜15,000円）</h3>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>- 万能竿セット（竿+リール）: 5,000〜8,000円</p>
                  <p>- サビキ仕掛け x 3 + ちょい投げ仕掛け x 2: 1,500円</p>
                  <p>- エサ（アミエビ+アオイソメ）: 1,000円</p>
                  <p>- クーラーボックス: 1,500〜3,000円</p>
                  <p>- バケツ+ハサミ+プライヤー: 1,000〜2,000円</p>
                </div>
                <p className="mt-2 text-xs text-blue-700">サビキ+ちょい投げの2つの釣りが楽しめる。長く続けたい方に。</p>
              </div>

              <div className="rounded-lg border-2 border-purple-200 bg-purple-50/50 p-4 dark:bg-purple-950/50">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className="bg-purple-500 text-white hover:bg-purple-600">本格派</Badge>
                  <h3 className="font-bold text-foreground">しっかりコース（20,000〜40,000円）</h3>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>- 竿（メーカー品）: 8,000〜15,000円</p>
                  <p>- リール（シマノ or ダイワ）: 5,000〜15,000円</p>
                  <p>- ライン+仕掛け各種: 2,000〜5,000円</p>
                  <p>- クーラーボックス+小物類: 3,000〜5,000円</p>
                </div>
                <p className="mt-2 text-xs text-purple-700">品質の良い道具で快適に釣りを楽しみたい方に。感度や耐久性が段違い。</p>
              </div>
            </div>
          </SectionCard>

          {/* 7. 釣り方別の必要道具一覧 */}
          <SectionCard id="method-gear" title="釣り方別の必要道具一覧" icon={Target}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣り方ごとに必要な道具をまとめました。自分がやりたい釣り方に合わせて道具を揃えましょう。
            </p>

            <div className="space-y-4">
              {[
                {
                  method: "サビキ釣り",
                  gear: ["万能竿 2.7〜3.6m", "スピニングリール 2500番", "ナイロン3号", "サビキ仕掛け 4〜6号", "コマセカゴ", "アミエビ", "バケツ"],
                  link: "/methods/sabiki",
                },
                {
                  method: "ちょい投げ",
                  gear: ["万能竿 2.7〜3.6m", "スピニングリール 2500番", "ナイロン3号", "天秤仕掛け", "アオイソメ", "ハサミ"],
                  link: "/methods/choi-nage",
                },
                {
                  method: "ウキ釣り",
                  gear: ["磯竿 1.5〜3号 3.6〜5.3m", "スピニングリール 2500番", "ナイロン2〜3号", "ウキ+仕掛けセット", "オキアミ（エサ）"],
                  link: "/methods/uki-zuri",
                },
                {
                  method: "アジング",
                  gear: ["アジングロッド 5〜7ft", "スピニングリール 1000〜2000番", "エステル0.3号+フロロリーダー", "ジグヘッド0.5〜1.5g", "ワーム1.5〜2in", "ヘッドライト"],
                  link: "/methods/ajing",
                },
                {
                  method: "エギング",
                  gear: ["エギングロッド 8〜8.6ft", "スピニングリール 2500〜3000番", "PE0.6〜0.8号+フロロリーダー", "エギ2.5〜3.5号"],
                  link: "/methods/eging",
                },
                {
                  method: "ショアジギング",
                  gear: ["ショアジギングロッド 9〜10ft", "スピニングリール 4000番", "PE1〜1.5号+フロロリーダー", "メタルジグ20〜40g"],
                  link: "/methods/shore-jigging",
                },
              ].map((item) => (
                <div key={item.method} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-bold text-foreground">{item.method}</h3>
                    <Link href={item.link} className="text-xs text-primary hover:underline">
                      詳しく見る <ChevronRight className="ml-0.5 inline size-3" />
                    </Link>
                  </div>
                  <ul className="space-y-1">
                    {item.gear.map((g) => (
                      <li key={g} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-1.5 shrink-0 rounded-full bg-primary" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 8. メンテナンス方法 */}
          <SectionCard id="maintenance" title="道具のメンテナンス方法" icon={ShieldCheck}>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              釣りの後に適切なメンテナンスを行うことで、道具を長持ちさせることができます。特に海釣りの後は塩分によるサビ防止が重要です。
            </p>

            <div className="space-y-3">
              {[
                {
                  title: "竿（ロッド）",
                  steps: "帰宅後に真水のシャワーで全体を洗い流す。ガイド部分は特に念入りに。布で水分を拭き取り、日陰で乾燥させてから収納。",
                },
                {
                  title: "リール",
                  steps: "ドラグを締めた状態でシャワーの弱い水流で10秒ほど洗う。タオルで拭いて陰干し。乾いたらドラグを緩めて保管。月に1回はオイルとグリスの注油を。",
                },
                {
                  title: "ライン",
                  steps: "PEラインは劣化が遅いが、毛羽立ちや色落ちが出たら交換。ナイロンは3〜6ヶ月で交換するのが目安。フロロカーボンは傷がなければ長持ち。",
                },
                {
                  title: "仕掛け・ルアー",
                  steps: "使用後は真水で洗って乾燥。針先が鈍ったら交換。ルアーのフックはサビが出たらすぐ交換。ワームは直射日光を避けて保管。",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border p-3">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.steps}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 9. FAQ */}
          <SectionCard id="faq" title="よくある質問（FAQ）" icon={HelpCircle}>
            <div className="space-y-3">
              {[
                { q: "釣り道具は最低いくらで揃えられる？", a: "サビキ釣りセットなら3,000〜5,000円で一式揃います。エサ代を含めても5,000円以内で始められます。" },
                { q: "初心者が最初に買うべき竿は？", a: "2.7〜3.6mの万能竿（磯竿2〜3号）がおすすめ。サビキ・ちょい投げ・ウキ釣りに対応できます。" },
                { q: "リールは何番を選べばいい？", a: "2500番のスピニングリールが万能。軽すぎず重すぎず、幅広い釣りに使えます。糸付きモデルが手軽。" },
                { q: "PEラインとナイロンラインの違いは？", a: "ナイロンは伸びがあり扱いやすく初心者向け。PEは感度が高いがリーダーが必要で中級者向け。" },
                { q: "道具はどこで買える？", a: "釣具専門店が品揃え豊富。Amazon・楽天でも購入可。初心者セットはホームセンターにもあります。" },
                { q: "中古の釣り道具でも大丈夫？", a: "竿やリールは中古でもOK。ただしライン・仕掛けは消耗品なので新品を買いましょう。" },
              ].map((item, i) => (
                <details key={i} className="group rounded-lg border transition-colors hover:border-primary">
                  <summary className="cursor-pointer list-none p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">Q</span>
                      <p className="text-sm font-medium text-foreground">{item.q}</p>
                      <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                    </div>
                  </summary>
                  <div className="border-t px-4 pb-4 pt-3">
                    <div className="flex gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">A</span>
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
                { href: "/guide/how-to-fish", title: "釣りのやり方完全ガイド", desc: "基本手順を5ステップで詳しく解説", icon: BookOpen },
                { href: "/guide/fishing-for-beginners", title: "釣り初心者完全ガイド", desc: "ゼロから始める釣り入門", icon: Fish },
                { href: "/guide/fishing-tips", title: "釣りのコツ・テクニック集", desc: "もっと釣れるようになる実践テクニック", icon: Zap },
                { href: "/methods", title: "釣り方・釣法ガイド", desc: "サビキ・ルアー・エギングなど釣り方別ガイド", icon: Target },
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

        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-base font-medium sm:text-lg">道具が揃ったら釣りスポットを探そう！</p>
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
