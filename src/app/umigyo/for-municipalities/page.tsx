import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Mail,
  CheckCircle2,
  Zap,
  Shield,
  ChevronRight,
  Globe,
  BarChart3,
  Users,
  MapPin,
  Megaphone,
  FileText,
  TrendingUp,
  Landmark,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { fishingSpots } from "@/lib/data/spots";

const spotCount = fishingSpots.length;

export const metadata: Metadata = {
  title: "自治体・漁協向け 海業推進 × デジタル集客プラン - ツリスポ",
  description:
    "海業推進地区の自治体・漁協向け掲載プラン。ツリスポの月間数万PVの釣り情報プラットフォームで漁港への集客を支援します。無料プランから始められます。",
  openGraph: {
    title: "自治体・漁協向け 海業推進 × デジタル集客プラン - ツリスポ",
    description:
      "釣り情報サイトNo.1を目指すツリスポで、海業推進地区の情報を発信しませんか？無料プランあり。",
    type: "website",
    url: "https://tsurispot.com/umigyo/for-municipalities",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/umigyo/for-municipalities",
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
      name: "海業推進",
      item: "https://tsurispot.com/umigyo",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "自治体向けご案内",
      item: "https://tsurispot.com/umigyo/for-municipalities",
    },
  ],
};

const FAQS = [
  {
    q: "掲載費用はかかりますか？",
    a: "基本情報の掲載は完全無料です。スタンダードプランやプレミアムプランは有料ですが、水産庁の補助金を活用することで実質負担を抑えられる場合があります。まずはお気軽にご相談ください。",
  },
  {
    q: "掲載までにどれくらいの期間がかかりますか？",
    a: "無料プランであれば、情報をいただいてから最短1週間で掲載可能です。スタンダード以上のプランは取材・撮影を含むため、2〜4週間程度のお時間をいただきます。",
  },
  {
    q: "補助金は使えますか？",
    a: "はい。水産庁「浜の活力再生・成長促進交付金」等の海業関連補助金をはじめ、デジタルマーケティング関連の地方自治体独自の補助金が活用可能な場合があります。申請のアドバイスも行っています。",
  },
  {
    q: "どのような情報を掲載できますか？",
    a: "漁港の基本情報（所在地・アクセス・駐車場）、釣りスポット情報（釣れる魚・おすすめ時期）、海業関連施設（直売所・レストラン・体験プログラム）、イベント情報などを掲載できます。",
  },
  {
    q: "掲載情報の更新は可能ですか？",
    a: "はい、いつでも更新可能です。季節ごとのイベント情報やキャンペーンなども随時反映いたします。無料プランではメールでの更新依頼、スタンダード以上では管理画面からの更新にも対応予定です。",
  },
  {
    q: "効果測定はできますか？",
    a: "スタンダード以上のプランでは、掲載ページの閲覧数・流入キーワード・ユーザーの行動分析などのレポートを定期的にお届けします。",
  },
];

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

const CHALLENGES = [
  {
    icon: Users,
    title: "釣り人の来訪が少ない",
    description: "漁港の魅力が十分に発信できておらず、釣り観光客が少ない。",
  },
  {
    icon: Globe,
    title: "デジタル発信が弱い",
    description: "公式サイトやSNSでの情報発信が不十分で、検索流入が少ない。",
  },
  {
    icon: BarChart3,
    title: "効果測定ができない",
    description: "観光施策の効果が数値で見えず、PDCAが回しにくい。",
  },
  {
    icon: TrendingUp,
    title: "リピーターが増えない",
    description: "一度来た釣り人が再訪しにくく、持続的な集客ができない。",
  },
];

const SOLUTIONS = [
  {
    icon: MapPin,
    title: "釣りスポット情報の掲載",
    description: `全国${spotCount}+スポットを掲載するプラットフォームに貴地区の漁港を掲載。SEO最適化で検索流入を獲得します。`,
  },
  {
    icon: Megaphone,
    title: "SEO記事による情報発信",
    description:
      "「○○漁港 釣り」「○○ 釣果」などのキーワードで上位表示を目指す専門記事を作成・公開します。",
  },
  {
    icon: BarChart3,
    title: "アクセス分析レポート",
    description:
      "GA4連携による詳細なアクセスレポートを提供。どの地域・キーワードから来訪者が多いか可視化します。",
  },
  {
    icon: FileText,
    title: "イベント・体験情報の発信",
    description:
      "季節ごとのイベントや漁業体験プログラムの情報を掲載。旬の情報でタイムリーに集客します。",
  },
];

const PLANS = [
  {
    name: "無料プラン",
    price: "0円",
    period: "",
    description: "まずは基本情報の掲載から",
    features: [
      "漁港基本情報の掲載",
      "海業推進地区バッジ表示",
      "釣りスポットページへの紐付け",
      "サイトマップ・検索エンジン登録",
    ],
    notIncluded: ["専用記事の作成", "アクセスレポート", "優先サポート"],
    recommended: false,
    color: "border-gray-200",
    badge: "無料",
    badgeColor: "bg-gray-100 text-gray-700",
  },
  {
    name: "スタンダード",
    price: "要相談",
    period: "/月",
    description: "本格的な情報発信をサポート",
    features: [
      "無料プランの全機能",
      "専用エリアガイド記事の作成（月1本）",
      "季節別の釣り情報更新",
      "月次アクセスレポート",
      "メールサポート",
    ],
    notIncluded: ["SNS運用代行"],
    recommended: true,
    color: "border-blue-300 ring-2 ring-blue-100",
    badge: "おすすめ",
    badgeColor: "bg-blue-600 text-white",
  },
  {
    name: "プレミアム",
    price: "要相談",
    period: "/月",
    description: "包括的なデジタル集客支援",
    features: [
      "スタンダードの全機能",
      "専用エリアガイド記事の作成（月3本）",
      "イベント・キャンペーン告知",
      "SNS連携・投稿支援",
      "週次アクセスレポート",
      "専任担当者による優先サポート",
      "周辺施設との連携提案",
    ],
    notIncluded: [],
    recommended: false,
    color: "border-amber-200",
    badge: "フルサポート",
    badgeColor: "bg-amber-100 text-amber-800",
  },
];

const SUBSIDY_INFO = [
  {
    title: "浜の活力再生・成長促進交付金",
    org: "水産庁",
    description:
      "海業推進地区における漁港の利活用促進に関する事業に活用可能。デジタルマーケティング施策も対象となる場合があります。",
  },
  {
    title: "地方創生推進交付金",
    org: "内閣府",
    description:
      "地方版総合戦略に位置づけた事業に活用可能。観光DXや地域情報発信基盤の整備にも対応。",
  },
  {
    title: "IT導入補助金",
    org: "経済産業省",
    description:
      "中小企業・小規模事業者のIT導入を支援。漁協等が申請主体となる場合に活用可能な場合があります。",
  },
];

export default function ForMunicipalitiesPage() {
  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 right-0 h-32">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              className="absolute bottom-0 w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z"
                fill="white"
                fillOpacity="0.3"
              />
            </svg>
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
              <Building2 className="size-4" />
              <span>自治体・漁協 向け</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              海業推進 × デジタルで
              <br />
              漁港に賑わいを
            </h1>
            <p className="max-w-lg text-base text-blue-100 sm:text-lg">
              釣り情報プラットフォーム「ツリスポ」で
              <br className="hidden sm:block" />
              漁港への集客とブランド向上を実現しませんか？
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="mailto:info@tsurispot.com?subject=海業推進地区の掲載について">
                <Button
                  size="lg"
                  className="min-h-[52px] gap-2 bg-white px-8 text-base text-blue-800 hover:bg-blue-50"
                >
                  <Mail className="size-5" />
                  お問い合わせ
                </Button>
              </a>
              <a href="#plans">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-[52px] gap-2 border-white/30 px-8 text-base text-white hover:bg-white/10"
                >
                  掲載プランを見る
                  <ChevronRight className="size-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* パンくず */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "海業推進", href: "/umigyo" },
            { label: "自治体向けご案内" },
          ]}
        />
      </div>

      {/* 課題提起 */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-xl font-bold sm:text-2xl">
            こんなお悩みはありませんか？
          </h2>
          <p className="text-sm text-gray-600">
            海業推進地区に選定されたものの、具体的な集客施策にお困りではありませんか
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHALLENGES.map((item) => (
            <Card key={item.title} className="border">
              <CardContent className="p-5">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <item.icon className="size-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ソリューション */}
      <section className="bg-blue-50/30 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2">
              <Sparkles className="size-5 text-blue-600" />
              <h2 className="text-xl font-bold sm:text-2xl">
                ツリスポができること
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              釣り情報プラットフォームの強みを活かした集客支援
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SOLUTIONS.map((item) => (
              <Card key={item.title} className="border bg-white">
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <item.icon className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 掲載プラン */}
      <section id="plans" className="scroll-mt-20 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <Zap className="size-5 text-blue-600" />
            <h2 className="text-xl font-bold sm:text-2xl">掲載プラン</h2>
          </div>
          <p className="text-sm text-gray-600">
            無料プランから始められます。地域のニーズに合わせて柔軟に対応
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden ${plan.color}`}
            >
              {plan.recommended && (
                <div className="absolute right-0 top-0 rounded-bl-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                  おすすめ
                </div>
              )}
              <CardContent className="p-6">
                <Badge className={`${plan.badgeColor} mb-3`}>
                  {plan.badge}
                </Badge>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-blue-700">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-600">{plan.description}</p>

                <div className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span className="text-xs text-gray-700">{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2 opacity-50">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-xs text-gray-400">
                        -
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="mailto:info@tsurispot.com?subject=海業推進地区の掲載について"
                  className="mt-6 block"
                >
                  <Button
                    className={`w-full ${
                      plan.recommended
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : ""
                    }`}
                    variant={plan.recommended ? "default" : "outline"}
                  >
                    お問い合わせ
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 補助金活用ガイド */}
      <section className="bg-gradient-to-b from-emerald-50/50 to-emerald-50/20 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2">
              <Landmark className="size-5 text-emerald-600" />
              <h2 className="text-xl font-bold sm:text-2xl">
                補助金活用ガイド
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              海業関連の補助金を活用することで、実質負担を抑えた情報発信が可能です
            </p>
          </div>

          <div className="space-y-4">
            {SUBSIDY_INFO.map((item) => (
              <Card key={item.title} className="border bg-white">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold">{item.title}</h3>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {item.org}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-sm text-emerald-800">
              補助金の申請方法や活用可能性については、個別にアドバイスいたします。
              <br className="hidden sm:block" />
              お気軽にお問い合わせください。
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="mb-8 text-center text-xl font-bold sm:text-2xl">
          よくある質問
        </h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <Card key={faq.q}>
              <CardContent className="p-5 sm:p-6">
                <p className="flex items-start gap-3 text-sm font-bold sm:text-base">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    Q
                  </span>
                  {faq.q}
                </p>
                <p className="mt-3 flex items-start gap-3 text-xs leading-relaxed text-gray-600 sm:text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
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
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-700 to-indigo-900">
          <CardContent className="flex flex-col items-center gap-6 px-5 py-10 text-center sm:px-12 sm:py-14">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
              <Building2 className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white sm:text-3xl">
                海業推進の第一歩を踏み出しませんか？
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100 sm:text-base">
                無料プランから始められます。
                <br />
                まずはお気軽にご相談ください。
              </p>
            </div>
            <a href="mailto:info@tsurispot.com?subject=海業推進地区の掲載について">
              <Button
                size="lg"
                className="min-h-[52px] gap-2 bg-white px-10 text-base text-blue-800 hover:bg-blue-50"
              >
                <Mail className="size-5" />
                メールで問い合わせる
              </Button>
            </a>
            <p className="text-sm font-medium text-blue-100">
              info@tsurispot.com
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>返信2営業日以内</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                <span>無料プランあり</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>補助金活用可</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 海業推進ページへ戻る */}
      <div className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/umigyo">
            <Button variant="outline" className="gap-1.5">
              海業推進ページに戻る
              <ChevronRight className="size-4" />
            </Button>
          </Link>
          <a
            href="https://www.jfa.maff.go.jp/j/keikaku/230718.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-1.5">
              水産庁公式ページ
              <ExternalLink className="size-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
