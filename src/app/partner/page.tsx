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
  Megaphone,
  TrendingUp,
  Star,
  Phone,
  Clock,
  Shield,
  Zap,
  Award,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "釣具店・船宿の有料掲載プラン - ツリスポ パートナー",
  description:
    "全国600+釣りスポット掲載の「ツリスポ」に釣具店・管理釣り場・遊漁船を掲載しませんか。月額0円〜のプランをご用意。SEO最適化済みで新規顧客獲得に貢献します。",
  openGraph: {
    title: "釣具店・船宿の有料掲載プラン - ツリスポ パートナー",
    description:
      "全国600+釣りスポット掲載の「ツリスポ」に釣具店・管理釣り場・遊漁船を掲載しませんか。",
    type: "website",
    url: "https://tsurispot.com/partner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/partner",
  },
};

const PLANS = [
  {
    name: "ライトプラン",
    price: "無料",
    priceNote: "0円 / 月",
    highlight: false,
    badge: null,
    description: "まずは無料で始めたい方に",
    features: [
      { label: "店舗情報掲載", included: true },
      { label: "地図上に表示", included: false },
      { label: "おすすめスポット連携", included: false },
      { label: "トップページ掲載", included: false },
      { label: "バナー広告", included: false },
      { label: "釣果レポート代行", included: false },
      { label: "アクセス解析レポート", included: false },
    ],
    cta: "無料で始める",
    ctaStyle: "outline",
  },
  {
    name: "スタンダードプラン",
    price: "9,800円",
    priceNote: "9,800円 / 月（税込）",
    highlight: true,
    badge: "人気No.1",
    description: "集客強化を本格的に始めたい方に",
    features: [
      { label: "店舗情報掲載", included: true },
      { label: "地図上に表示", included: true },
      { label: "おすすめスポット連携", included: true },
      { label: "トップページ掲載", included: false },
      { label: "バナー広告", included: false },
      { label: "釣果レポート代行", included: false },
      { label: "アクセス解析レポート（月次）", included: true },
    ],
    cta: "スタンダードで始める",
    ctaStyle: "primary",
  },
  {
    name: "プレミアムプラン",
    price: "29,800円",
    priceNote: "29,800円 / 月（税込）",
    highlight: false,
    badge: null,
    description: "最大限の露出と集客を求める方に",
    features: [
      { label: "店舗情報掲載", included: true },
      { label: "地図上に表示", included: true },
      { label: "おすすめスポット連携", included: true },
      { label: "トップページ掲載", included: true },
      { label: "バナー広告", included: true },
      { label: "釣果レポート代行", included: true },
      { label: "アクセス解析レポート（週次）", included: true },
    ],
    cta: "プレミアムで始める",
    ctaStyle: "outline",
  },
];

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "全国600+スポット掲載・成長中のメディア",
    description:
      "ツリスポは全国の釣りスポット情報を網羅し、SEO最適化済みのコンテンツでGoogle検索からの流入が増加中。釣り人が情報収集する場に貴店を掲載できます。",
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
      "ツリスポは初めて釣りをする方から経験豊富なアングラーまで幅広い層が利用。新規顧客の獲得から既存顧客のリピート促進まで対応できます。",
  },
  {
    icon: BarChart3,
    title: "データで効果を可視化",
    description:
      "スタンダードプラン以上では月次・週次のアクセス解析レポートを提供。掲載効果を数字で確認しながら、集客改善のPDCAを回せます。",
  },
];

const TESTIMONIALS = [
  {
    type: "釣具店（関東）",
    content: "掲載後、近隣の釣り場ページから来店される新規のお客様が増えました。特にエサ在庫情報の更新で、電話での在庫確認も減り業務効率も改善しています。",
    author: "店主 / 40代",
    stars: 5,
    status: "準備中",
  },
  {
    type: "遊漁船（東海）",
    content: "スポットページからの問い合わせが増加。釣果レポート代行のおかげで、更新作業の手間がなくなりました。費用対効果は十分感じています。",
    author: "船長 / 50代",
    stars: 5,
    status: "準備中",
  },
  {
    type: "管理釣り場（関西）",
    content: "初めての方向けに施設の詳細情報を掲載できるのが助かっています。「ツリスポで見ました」という来場者も増えてきました。",
    author: "管理者 / 30代",
    stars: 5,
    status: "準備中",
  },
];

const FAQS = [
  {
    q: "契約期間はどのくらいですか？",
    a: "月単位のご契約です。最低契約期間はなく、いつでも解約いただけます。毎月自動更新となりますので、解約希望の場合は翌月末までにご連絡ください。",
  },
  {
    q: "掲載開始までの流れを教えてください。",
    a: "お申込み → 店舗情報のご提供 → 弊社での掲載設定（3営業日以内）→ 掲載開始、という流れです。掲載内容の確認はメールで行います。",
  },
  {
    q: "効果測定はできますか？",
    a: "スタンダードプランでは月次、プレミアムプランでは週次のアクセス解析レポートをご提供します。閲覧数、クリック数、流入経路などのデータをご確認いただけます。",
  },
  {
    q: "掲載内容はあとから変更できますか？",
    a: "はい、いつでも変更可能です。営業時間・料金・在庫情報などの更新は随時対応いたします。プレミアムプランでは優先対応（翌営業日以内）となります。",
  },
  {
    q: "どのような事業者が対象ですか？",
    a: "釣具店・管理釣り場・釣り堀・レンタルボート・遊漁船・釣り船など、釣りに関連するすべての事業者様が対象です。まずはお気軽にお問い合わせください。",
  },
];

export default function PartnerPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
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
          釣り情報サイト「ツリスポ」は全国<strong>600+スポット</strong>を掲載し、
          SEO最適化済みのコンテンツで成長中。
          掲載することでGoogle検索からの新規顧客獲得をサポートします。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>全国600+スポット掲載</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>SEO最適化済み</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>無料プランから始められる</span>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="mailto:partner@tsurispot.com">
            <Button size="lg" className="min-h-[48px] gap-2 bg-blue-600 px-8 text-white hover:bg-blue-700">
              <Mail className="size-4" />
              まずは無料プランから始める
            </Button>
          </a>
          <a href="#plans">
            <Button size="lg" variant="outline" className="min-h-[48px] px-8">
              プランを比較する
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
          数字で見るツリスポの集客力
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

      {/* 掲載プラン */}
      <section id="plans" className="mb-14 scroll-mt-20 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          掲載プラン
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          事業規模・目的に合わせて3つのプランをご用意
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative gap-0 py-0 ${
                plan.highlight
                  ? "border-blue-500 shadow-lg ring-2 ring-blue-500 dark:border-blue-400 dark:ring-blue-400"
                  : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-600">
                    <Award className="mr-1 size-3" />
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardContent className="p-5 sm:p-6">
                <div className="mb-5">
                  <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {plan.price}
                    {plan.price !== "無料" && (
                      <span className="text-sm font-normal text-muted-foreground"> / 月</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="mb-6 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2 text-xs sm:text-sm">
                      {feature.included ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      ) : (
                        <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                          <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                        </span>
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <a href="mailto:partner@tsurispot.com">
                  <Button
                    className={`w-full min-h-[44px] ${
                      plan.highlight
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : ""
                    }`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          ※ 料金はすべて税込表示です。月単位のご契約でいつでも解約可能です。
        </p>
      </section>

      {/* お客様の声 */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          お客様の声
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          掲載事業者様からのご感想（準備中）
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.type} className="gap-0 py-0">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{testimonial.type}</Badge>
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-center text-xs text-muted-foreground">
                    ※ 掲載開始後、実際のお声をご紹介予定です
                  </p>
                </div>
                <p className="mt-3 text-xs text-muted-foreground text-right">
                  — {testimonial.author}
                </p>
              </CardContent>
            </Card>
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
                まずは無料プランから始める
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100 sm:text-base">
                お申込みから3営業日以内に掲載を開始します。
                ご不明な点はメールにてお気軽にご相談ください。
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <a href="mailto:partner@tsurispot.com">
                <Button
                  size="lg"
                  className="min-h-[48px] gap-2 bg-white px-8 text-blue-800 hover:bg-blue-50"
                >
                  <Mail className="size-4" />
                  partner@tsurispot.com
                </Button>
              </a>
              <a href="mailto:partner@tsurispot.com?subject=掲載希望（電話希望）">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-[48px] gap-2 border-white/40 px-8 text-white hover:bg-white/10"
                >
                  <Phone className="size-4" />
                  お電話でのご相談
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>返信2営業日以内</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                <span>いつでも解約可能</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>メール件名「掲載希望」でスムーズ</span>
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
            href="mailto:partner@tsurispot.com"
            className="text-primary underline"
          >
            partner@tsurispot.com
          </a>{" "}
          までご連絡ください。
        </p>
      </div>
    </div>
  );
}
