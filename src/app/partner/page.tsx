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
  FileText,
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
          <Link href="/contact?from=partner">
            <Button size="lg" className="min-h-[48px] gap-2 bg-blue-600 px-8 text-white hover:bg-blue-700">
              <Mail className="size-4" />
              まずはお問い合わせ（無料）
            </Button>
          </Link>
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

      {/* 掲載について */}
      <section id="plans" className="mb-14 scroll-mt-20 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          掲載について
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          まずはお気軽にご相談ください。貴店に最適なプランをご提案します。
        </p>
        <Card className="gap-0 py-0">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
            <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
              <MessageSquare className="size-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">無料相談受付中</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                掲載プランや費用について、まずはお問い合わせフォームからお気軽にご相談ください。
                <br />
                事業内容やご要望をお伺いし、最適なご提案をさせていただきます。
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>相談無料</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>返信2営業日以内</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>無料プランあり</span>
              </div>
            </div>
            <Link href="/contact?from=partner">
              <Button size="lg" className="min-h-[48px] gap-2 bg-blue-600 px-8 text-white hover:bg-blue-700">
                <Mail className="size-4" />
                お問い合わせフォームへ
              </Button>
            </Link>
          </CardContent>
        </Card>
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
            <Link href="/contact?from=partner">
              <Button
                size="lg"
                className="min-h-[48px] gap-2 bg-white px-8 text-blue-800 hover:bg-blue-50"
              >
                <Mail className="size-4" />
                お問い合わせフォームへ
              </Button>
            </Link>
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
