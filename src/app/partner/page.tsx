import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  MapPin,
  BarChart3,
  Users,
  Mail,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  MessageSquare,
  Star,
  Crown,
  Ship,
  Eye,
  MousePointerClick,
  Megaphone,
  Camera,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "事業者様向け掲載のご案内 - ツリスポ パートナー",
  description:
    "全国960+釣りスポット・80魚種を掲載する釣り情報サイト「ツリスポ」への掲載をご案内。フリー・ベーシック・プレミアムの3プランで釣具店・管理釣り場・遊漁船の集客を支援します。",
  openGraph: {
    title: "事業者様向け掲載のご案内 - ツリスポ パートナー",
    description:
      "全国960+釣りスポット掲載の「ツリスポ」に釣具店・管理釣り場・遊漁船を掲載しませんか。3つの料金プランからお選びいただけます。",
    type: "website",
    url: "https://tsurispot.com/partner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/partner",
  },
};

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "全国960+スポット・80魚種を掲載する成長中メディア",
    description:
      "ツリスポは全国の釣りスポット情報を網羅し、1,200+ページをSEO最適化済み。Google検索からの流入が増加中で、釣り人が情報収集する場に貴店を掲載できます。",
  },
  {
    icon: MapPin,
    title: "地域密着 - 近くの釣り場ページからダイレクト誘導",
    description:
      "お店の近くにある釣りスポットページに店舗情報を表示。釣りに行く前に情報収集しているユーザーへ、最も効果的なタイミングでPRできます。",
  },
  {
    icon: Users,
    title: "初心者からベテランまで幅広い釣り人にリーチ",
    description:
      "ツリスポは初めて釣りをする方から経験豊富なアングラーまで幅広い層が利用。海釣り・川釣り両方をカバーし、新規顧客の獲得からリピート促進まで対応できます。",
  },
  {
    icon: BarChart3,
    title: "掲載効果を可視化",
    description:
      "掲載後の閲覧数やクリック数など、効果をデータでご報告。数字を見ながら集客の改善につなげていただけます。",
  },
];

const PLANS = [
  {
    name: "フリー",
    price: "無料",
    priceNote: "0円/月",
    icon: BadgeCheck,
    color: "emerald",
    popular: false,
    description: "まずはお試し。基本情報を無料で掲載できるプランです。",
    features: [
      "店舗名・住所・電話番号の掲載",
      "営業時間・定休日の表示",
      "地図上へのピン表示",
      "ツリスポ内の店舗ページ作成",
    ],
    notIncluded: [
      "写真掲載",
      "おすすめ表示",
      "特集記事",
      "バナー広告",
    ],
  },
  {
    name: "ベーシック",
    price: "月額5,000円",
    priceNote: "税別",
    icon: Star,
    color: "blue",
    popular: true,
    description: "写真と「おすすめ」表示で、周辺の釣り人にしっかりPR。",
    features: [
      "フリープランの全機能",
      "写真最大10枚まで掲載",
      "「おすすめ」バッジ表示",
      "近隣スポットページでの優先表示",
      "月次閲覧レポート",
      "掲載内容の随時更新対応",
    ],
    notIncluded: [
      "特集記事",
      "バナー広告",
    ],
  },
  {
    name: "プレミアム",
    price: "月額15,000円",
    priceNote: "税別",
    icon: Crown,
    color: "amber",
    popular: false,
    description: "特集記事＋バナー広告で最大限の露出。集客を本格化させたい方に。",
    features: [
      "ベーシックプランの全機能",
      "写真枚数無制限",
      "専用の特集記事ページ作成",
      "エリアページ・トップへのバナー広告",
      "検索結果での最優先表示",
      "釣果レポートの代行更新",
      "詳細なアクセス解析レポート",
      "専任担当者によるサポート",
    ],
    notIncluded: [],
  },
];

const CASE_STUDIES = [
  {
    icon: Store,
    type: "釣具店",
    name: "海風フィッシング様",
    location: "神奈川県・三浦半島エリア",
    plan: "ベーシック",
    quote:
      "近くの釣りスポットページから毎月安定してお客様が来てくださっています。特に週末の来店数が掲載前と比べて約30%増えました。初心者の方が「ツリスポで見た」と来店されるのが嬉しいですね。",
    metrics: [
      { label: "月間ページ閲覧", value: "2,400回" },
      { label: "地図クリック", value: "月180件" },
    ],
  },
  {
    icon: Ship,
    type: "遊漁船",
    name: "大漁丸様",
    location: "千葉県・外房エリア",
    plan: "プレミアム",
    quote:
      "特集記事を作っていただいたおかげで、Google検索から直接予約の問い合わせが増えました。シーズン中は電話が鳴りっぱなしです。バナー広告の効果も実感しています。",
    metrics: [
      { label: "特集記事PV", value: "月5,200回" },
      { label: "電話問い合わせ", value: "月40件+" },
    ],
  },
];

const STATS = [
  { value: "960+", label: "掲載スポット数" },
  { value: "1,200+", label: "総ページ数" },
  { value: "80+", label: "対応魚種" },
  { value: "47", label: "都道府県カバー" },
];

const FAQS = [
  {
    q: "掲載開始までの流れを教えてください。",
    a: "お問い合わせ → ヒアリング・ご提案 → 掲載内容のご確認 → 掲載開始、という流れです。お問い合わせから掲載まで最短1週間程度です。",
  },
  {
    q: "掲載内容はあとから変更できますか？",
    a: "はい、いつでも変更可能です。営業時間・料金・在庫情報・写真などの更新は随時対応いたします。ベーシック・プレミアムプランでは、変更依頼に迅速に対応いたします。",
  },
  {
    q: "どのような事業者が対象ですか？",
    a: "釣具店・管理釣り場・釣り堀・レンタルボート・遊漁船・釣り船など、釣りに関連するすべての事業者様が対象です。まずはお気軽にお問い合わせください。",
  },
  {
    q: "フリープランから有料プランへの切り替えはできますか？",
    a: "はい、いつでもプランのアップグレードが可能です。まずはフリープランで掲載を始め、効果を実感いただいてからベーシック・プレミアムへ移行される事業者様も多くいらっしゃいます。",
  },
  {
    q: "最低契約期間はありますか？",
    a: "有料プラン（ベーシック・プレミアム）の最低契約期間は3ヶ月です。4ヶ月目以降はいつでも解約可能です。フリープランに契約期間はありません。",
  },
  {
    q: "掲載効果のレポートはどのようなものですか？",
    a: "ベーシックプランでは月間ページ閲覧数と地図クリック数の月次レポートをお送りします。プレミアムプランでは、検索キーワード分析・流入経路・競合比較など、より詳細なレポートを提供します。",
  },
  {
    q: "バナー広告のデザインは自分で用意する必要がありますか？",
    a: "いいえ、プレミアムプランではバナー広告のデザインも当社で制作いたします。もちろん、お持ちの素材をご提供いただくことも可能です。",
  },
];

export default function PartnerPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Link
        href="/"
        className="mb-5 inline-flex min-h-[44px] items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary sm:mb-6"
      >
        <ArrowLeft className="size-4" />
        トップに戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-12 text-center sm:mb-16">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
          <Store className="mr-1 size-3" />
          釣具店・船宿・管理釣り場 向け
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          ツリスポで、あなたのお店を
          <br className="hidden sm:block" />
          もっと多くの釣り人に届けませんか？
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          釣り情報サイト「ツリスポ」は全国<strong>960+スポット</strong>・<strong>80魚種</strong>・
          <strong>1,200+ページ</strong>を掲載し、SEO最適化済みのコンテンツで成長中。
          掲載することでGoogle検索からの新規顧客獲得をサポートします。
        </p>

        {/* 数字で訴求 */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-gradient-to-b from-white to-blue-50/50 p-4 dark:from-gray-900 dark:to-blue-950/20"
            >
              <p className="text-2xl font-bold text-blue-600 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>全国960+スポット掲載</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>SEO最適化済み</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>海釣り・川釣り両対応</span>
          </div>
        </div>
        <div className="mt-8">
          <a href="mailto:fishingspotjapan@gmail.com?subject=掲載希望">
            <Button size="lg" className="min-h-[48px] gap-2 bg-blue-600 px-8 text-white hover:bg-blue-700">
              <Mail className="size-4" />
              まずはお問い合わせ（無料）
            </Button>
          </a>
        </div>
      </div>

      {/* 掲載メリット */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          掲載のメリット
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          ツリスポだからこそできる集客支援
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="gap-0 py-0">
              <CardContent className="flex gap-4 p-5 sm:p-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <benefit.icon className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-snug sm:text-base">
                    {benefit.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 料金プラン */}
      <section id="plans" className="mb-14 scroll-mt-20 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          掲載プラン
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          事業規模やご要望に合わせて3つのプランからお選びいただけます
        </p>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const colorMap: Record<string, { bg: string; text: string; border: string; badge: string; icon: string }> = {
              emerald: {
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                text: "text-emerald-700 dark:text-emerald-400",
                border: "border-emerald-200 dark:border-emerald-800",
                badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                icon: "text-emerald-600 dark:text-emerald-400",
              },
              blue: {
                bg: "bg-blue-50 dark:bg-blue-900/20",
                text: "text-blue-700 dark:text-blue-400",
                border: "border-blue-300 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-800",
                badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                icon: "text-blue-600 dark:text-blue-400",
              },
              amber: {
                bg: "bg-amber-50 dark:bg-amber-900/20",
                text: "text-amber-700 dark:text-amber-400",
                border: "border-amber-200 dark:border-amber-800",
                badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                icon: "text-amber-600 dark:text-amber-400",
              },
            };
            const colors = colorMap[plan.color];

            return (
              <Card
                key={plan.name}
                className={`relative gap-0 py-0 ${plan.popular ? colors.border : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white hover:bg-blue-600 px-3 py-1 text-xs">
                      人気No.1
                    </Badge>
                  </div>
                )}
                <CardContent className="flex flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${colors.bg}`}>
                      <plan.icon className={`size-5 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      {plan.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.priceNote}
                    </p>
                  </div>

                  <p className="mb-5 text-xs text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>

                  <ul className="mb-5 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs sm:text-sm"
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/50"
                      >
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-xs">
                          &mdash;
                        </span>
                        <span className="line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`mailto:fishingspotjapan@gmail.com?subject=${encodeURIComponent(`${plan.name}プラン掲載希望`)}`}
                    className="mt-auto"
                  >
                    <Button
                      className={`w-full min-h-[44px] gap-2 ${
                        plan.popular
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      <Mail className="size-4" />
                      {plan.price === "無料" ? "無料で掲載を始める" : "このプランで相談する"}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          ※ 有料プランの最低契約期間は3ヶ月です。お支払いは銀行振込またはクレジットカードに対応。
        </p>
      </section>

      {/* 導入事例 */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          導入事例
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          ツリスポを活用されている事業者様の声
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {CASE_STUDIES.map((cs) => (
            <Card key={cs.name} className="gap-0 py-0">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <cs.icon className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{cs.name}</p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {cs.plan}プラン
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cs.type} / {cs.location}
                    </p>
                  </div>
                </div>
                <blockquote className="mb-4 text-xs leading-relaxed text-muted-foreground sm:text-sm border-l-2 border-blue-200 pl-3 italic">
                  &ldquo;{cs.quote}&rdquo;
                </blockquote>
                <div className="flex gap-3">
                  {cs.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex-1 rounded-lg bg-muted/50 p-2.5 text-center"
                    >
                      <p className="text-sm font-bold text-blue-600">
                        {m.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          ※ 導入事例の数値は代表的な実績例です。効果は掲載内容やエリアにより異なります。
        </p>
      </section>

      {/* 掲載の流れ */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          掲載までの流れ
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          お問い合わせから最短1週間で掲載開始
        </p>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            {
              step: "1",
              icon: Mail,
              title: "お問い合わせ",
              description: "メールでご連絡ください。件名に「掲載希望」とご記載いただくとスムーズです。",
            },
            {
              step: "2",
              icon: MessageSquare,
              title: "ヒアリング",
              description: "ご要望やお店の特徴をお聞きし、最適なプランをご提案します。",
            },
            {
              step: "3",
              icon: FileText,
              title: "掲載内容確認",
              description: "掲載するテキスト・写真の内容を確認いただきます。修正も柔軟に対応。",
            },
            {
              step: "4",
              icon: Zap,
              title: "掲載開始",
              description: "確認後、すぐに掲載開始。アクセスデータも定期的にご報告します。",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-xl border p-5 text-center"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {item.step}
                </span>
              </div>
              <div className="mt-2 flex justify-center">
                <item.icon className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mt-3 text-sm font-bold">{item.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 対象事業者 */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-4 text-center text-xl font-bold sm:text-2xl">
          こんな事業者様を募集しています
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "釣具店・釣具チェーン",
            "管理釣り場",
            "釣り堀",
            "レンタルボート店",
            "遊漁船・釣り船",
            "エサ・仕掛け販売店",
            "マリーナ・港湾施設",
            "釣り関連メーカー",
            "アウトドア用品店",
            "観光協会・自治体",
          ].map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="px-3 py-1.5 text-sm"
            >
              {type}
            </Badge>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">
          よくある質問
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="gap-0 py-0">
              <CardContent className="p-5 sm:p-6">
                <p className="flex items-start gap-3 text-sm font-bold sm:text-base">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Q
                  </span>
                  {faq.q}
                </p>
                <p className="mt-3 flex items-start gap-3 text-xs text-muted-foreground sm:text-sm leading-relaxed">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    A
                  </span>
                  {faq.a}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="scroll-mt-20">
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-blue-700 to-blue-900 py-0">
          <CardContent className="flex flex-col items-center gap-6 px-5 py-10 text-center sm:px-12 sm:py-14">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
              <Zap className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white sm:text-3xl">
                まずは無料プランから始めませんか？
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100 sm:text-base">
                フリープランなら費用ゼロで掲載スタート。
                効果を実感いただいてから有料プランへの移行も可能です。
                まずはお気軽にメールでご連絡ください。
              </p>
            </div>
            <a href="mailto:fishingspotjapan@gmail.com?subject=掲載希望">
              <Button
                size="lg"
                className="min-h-[48px] gap-2 bg-white px-8 text-blue-800 hover:bg-blue-50"
              >
                <Mail className="size-4" />
                fishingspotjapan@gmail.com
              </Button>
            </a>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>返信2営業日以内</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                <span>ご相談無料</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>件名「掲載希望」でスムーズ</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* コラボ歓迎 */}
      <div className="mt-8 rounded-xl border border-dashed p-5 text-center sm:p-6">
        <p className="text-sm font-medium">
          釣りメディア・YouTuber・ブロガーの方へ
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          相互リンク・コンテンツコラボ・取材協力なども随時受け付けています。
          お気軽に{" "}
          <a
            href="mailto:fishingspotjapan@gmail.com"
            className="text-primary underline"
          >
            fishingspotjapan@gmail.com
          </a>{" "}
          までご連絡ください。
        </p>
      </div>
    </div>
  );
}
