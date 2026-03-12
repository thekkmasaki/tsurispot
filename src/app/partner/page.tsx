import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  MapPin,
  Mail,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  QrCode,
  ArrowRight,
  Fish,

  Smartphone,
  UserCheck,
  CalendarDays,
  BookOpen,
  Globe,
  Map,
  Compass,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ShopListingForm } from "@/components/shops/shop-listing-form";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { tackleShops } from "@/lib/data/shops";

const spotCount = fishingSpots.length;
const fishCount = fishSpecies.length;
const tackleShopCount = tackleShops.length;

export const metadata: Metadata = {
  title: "釣具店の集客を無料で強化｜店舗ページ作成・エサ在庫管理 - ツリスポ",
  description: `釣具店・エサ店の集客にお困りではありませんか？ツリスポなら無料で店舗ページを作成、エサ在庫をリアルタイム公開。全国${spotCount}+の釣りスポットページからお店へ直接送客。初期費用0円・スマホだけで運用OK。個人経営の釣具店から大手チェーンまで全国${tackleShopCount}店舗が掲載中。`,
  keywords: ["釣具店 集客", "釣具店 集客方法", "釣具店 ホームページ", "エサ店 在庫管理", "釣具店 Googleマップ", "釣具店 無料掲載", "釣具店 MEO対策", "釣具店 ネット集客", "釣具店 売上アップ", "エサ 在庫 公開", "釣具店 開業"],
  openGraph: {
    title: "釣具店の集客を無料で強化｜ツリスポ",
    description: `初期費用0円で店舗ページ作成＋エサ在庫管理。全国${spotCount}+スポットの釣り人をお店に送客。${tackleShopCount}店舗が掲載中。`,
    type: "website",
    url: "https://tsurispot.com/partner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/partner",
  },
};

const BEFORE_AFTER = [
  {
    before: "「どこで釣れますか？」",
    after: "スマホで近くのスポットを即検索",
    icon: MapPin,
  },
  {
    before: "「何が必要ですか？」",
    after: "釣り方・道具リストを自動表示",
    icon: Fish,
  },
  {
    before: "「今何が釣れますか？」",
    after: "季節別の釣れる魚カレンダー",
    icon: CalendarDays,
  },
  {
    before: "「初心者ですが...」",
    after: "初心者ガイドが完備",
    icon: BookOpen,
  },
];

const QR_TYPES = [
  {
    name: "全国版",
    url: "tsurispot.com",
    description: "トップページへ誘導。全国どこの店舗でも使える汎用タイプ。",
    icon: Globe,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    name: "都道府県版",
    url: "tsurispot.com/prefecture/XXX",
    description:
      "ご希望の都道府県ページへ直行。地元の釣りスポット一覧が表示されます。",
    icon: Map,
    color:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  {
    name: "初心者版",
    url: "tsurispot.com/for-beginners",
    description: "完全初心者向けガイドへ誘導。道具・マナー・釣り方を網羅。",
    icon: UserCheck,
    color:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  {
    name: "診断版",
    url: "tsurispot.com/fish-finder",
    description:
      "「何を釣りたいか」診断ページへ。お客様の好みに合った魚種を提案。",
    icon: Compass,
    color:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  },
];

const STEPS = [
  {
    step: "1",
    icon: Mail,
    title: "お問い合わせ",
    description:
      "下記のメールアドレスまたはお問い合わせフォームからご連絡ください。",
  },
  {
    step: "2",
    icon: MapPin,
    title: "都道府県を指定",
    description:
      "ご希望のQRコードの種類と、都道府県版の場合は対象地域をお伝えください。",
  },
  {
    step: "3",
    icon: QrCode,
    title: "QRコードをお届け",
    description:
      "メールでPDFファイルをお送りします。印刷してすぐにご利用いただけます。",
  },
  {
    step: "4",
    icon: Zap,
    title: "店頭に設置するだけ",
    description:
      "レジ横やカウンター、入口など目立つ場所に掲示。お客様がスマホで読み取れます。",
  },
];

const FAQS = [
  {
    q: "掲載に費用はかかりますか？",
    a: "基本掲載は永久無料です。店舗名・住所・電話番号・営業時間・エサ在庫更新（1日10回）など、集客に必要な機能が初期費用0円・月額0円でご利用いただけます。より充実した集客機能が使える有料プラン（月額500円〜）もご用意しています。",
  },
  {
    q: "掲載までどのくらいかかりますか？",
    a: "基本情報をお送りいただいてから、通常1〜3営業日で掲載が完了します。掲載完了後、お店専用の管理URLをメールでお届けします。",
  },
  {
    q: "掲載するとどうやって集客につながるんですか？",
    a: `ツリスポには全国${spotCount.toLocaleString()}件以上の釣りスポット詳細ページがあり、各ページに「近くの釣具店」として貴店が自動表示されます。釣り場に行く前にお店に寄る動線ができるため、新規のお客様の来店につながります。さらにGoogleの構造化データでお店の情報が検索結果にも表示されやすくなります。`,
  },
  {
    q: "個人経営の小さなお店でも掲載できますか？",
    a: "はい、個人経営の釣具店やエサ店こそ大歓迎です。大手チェーンと並んで同じ条件で掲載されるため、地元のお客様にしっかりアピールできます。現在掲載中の店舗の多くが個人経営の地域密着型のお店です。",
  },
  {
    q: "エサの在庫管理はどうやって使うんですか？",
    a: "掲載完了後にお届けする管理URLにスマホからアクセスするだけ。餌の名前・価格・在庫状況を入力すると、お店のページにリアルタイムで反映されます。パソコンは不要で、スマホだけで完結します。",
  },
  {
    q: "掲載した情報は後から変更できますか？",
    a: "はい、いつでも変更可能です。営業時間の変更、定休日の更新、取り扱い商品の追加など、メールでご連絡いただければ対応いたします。有料プランではご自身で管理画面から直接編集も可能です。",
  },
  {
    q: "有料プランと無料掲載の違いは何ですか？",
    a: "無料掲載では基本情報の掲載とエサ在庫更新（1日10回）が使えます。有料プランでは、検索結果での優先表示・公式バッジ・写真掲載・Googleのお店情報の整備など、集客力をさらに強化する機能が追加されます。まずは無料で試して、効果を実感してからアップグレードをご検討いただけます。",
  },
  {
    q: "QRコードも設置できますか？",
    a: "はい、QRコードの作成・送付も完全無料です。店頭に設置すると、お客様がスマホで読み取って近くの釣りスポットや釣り方を確認できます。「どこで釣れる？」「何が必要？」といったよくある質問への対応を減らせます。",
  },
];

export default function PartnerPage() {
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
        name: "パートナー（釣具店様向け）",
        item: "https://tsurispot.com/partner",
      },
    ],
  };

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

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ツリスポ 釣具店パートナー",
    description: "釣具店・エサ店向けの無料集客支援サービス。店舗ページ作成、エサ在庫リアルタイム公開、SEO最適化。",
    url: "https://tsurispot.com/partner",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "無料プラン",
        price: "0",
        priceCurrency: "JPY",
        description: "店舗基本情報掲載、エサ在庫更新（1日10回）、近くの釣りスポットとの連携",
      },
      {
        "@type": "Offer",
        name: "ベーシックプラン",
        price: "500",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        description: "初年度月額500円（2年目以降980円）。公式バッジ、検索優先表示、写真3枚掲載、Googleのお店情報を整備",
      },
      {
        "@type": "Offer",
        name: "プロプラン",
        price: "1980",
        priceCurrency: "JPY",
        priceValidUntil: "2027-03-31",
        description: "初年度月額1,980円（2年目以降2,980円）。写真20枚、クーポン配信、Googleのお店情報を整備",
      },
    ],
    provider: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
      email: "fishingspotjapan@gmail.com",
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "パートナー（釣具店様向け）" }]} />

      {/* ===== ヒーローセクション ===== */}
      <section className="mb-14 text-center sm:mb-20">
        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
          <Store className="mr-1 size-3" />
          全国{tackleShopCount}店舗が掲載中
        </Badge>

        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          釣具店の集客を
          <br />
          <span className="text-blue-600">無料</span>で強化しませんか？
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          ツリスポは全国{spotCount.toLocaleString()}件以上の釣りスポットを掲載する釣り情報サイトです。
          <br className="hidden sm:block" />
          お店の情報を掲載するだけで、<strong>釣り人が自然にお店を見つけて来店</strong>します。
        </p>

        <div className="mx-auto mt-6 flex max-w-lg items-center justify-center gap-3 rounded-xl border-2 border-dashed border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-950/20">
          <Store className="size-10 shrink-0 text-green-600 dark:text-green-400" />
          <div className="text-left">
            <p className="text-sm font-bold text-green-800 dark:text-green-300">
              初期費用0円・月額0円で掲載スタート
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              基本情報を送るだけ。確認後すぐにお店のページが公開されます
            </p>
          </div>
        </div>

        {/* 数字で訴求 */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            {
              value: `${spotCount.toLocaleString()}+`,
              label: "掲載釣りスポット",
            },
            { value: `${tackleShopCount}+`, label: "掲載釣具店" },
            { value: "47", label: "都道府県カバー" },
            { value: `${fishCount}+`, label: "対応魚種" },
          ].map((stat) => (
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
      </section>

      {/* ===== 掲載のメリット ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          ツリスポに掲載するとこうなります
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          お店のページが釣り人の導線上に自動で表示されます
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="gap-0 py-0">
            <CardContent className="p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                <MapPin className="size-5 text-green-600" />
              </div>
              <h3 className="mt-3 text-sm font-bold">釣りスポットページから送客</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                「○○漁港の近くの釣具店」として、{spotCount.toLocaleString()}件以上のスポット詳細ページからお店を直接案内。釣り場に行く前にお店に寄る動線を作ります。
              </p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <Search className="size-5 text-blue-600" />
              </div>
              <h3 className="mt-3 text-sm font-bold">Google検索に自動配信</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                お店の情報はLocalBusiness構造化データとしてGoogleに配信。「○○市 釣具店」「近くのエサ店」などの検索で表示されやすくなります。
              </p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <Smartphone className="size-5 text-amber-600" />
              </div>
              <h3 className="mt-3 text-sm font-bold">エサの在庫をリアルタイム公開</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                「今日エサある？」の電話対応を削減。スマホから在庫を更新するだけで、お客様がサイト上でいつでも確認できます。
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===== Before → After セクション ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          QRコード設置で変わること
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          お客様の疑問を、スマホ1つで解決
        </p>
        <div className="space-y-3 sm:space-y-4">
          {BEFORE_AFTER.map((item) => (
            <Card key={item.before} className="gap-0 py-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <item.icon className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        Before
                      </span>
                      <span className="text-sm font-medium line-through decoration-red-300 sm:text-base">
                        {item.before}
                      </span>
                    </div>
                    <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                        After
                      </span>
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 sm:text-base">
                        {item.after}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== QRコードの種類 ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          選べるQRコードの種類
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          お店のニーズに合わせて、複数のタイプをご用意しています
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {QR_TYPES.map((qr) => (
            <Card key={qr.name} className="gap-0 py-0">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${qr.color}`}
                  >
                    <qr.icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold sm:text-base">
                        {qr.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal"
                      >
                        無料
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {qr.url}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {qr.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== 設置の流れ ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          設置までの流れ
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          かんたん4ステップで設置完了
        </p>
        <div className="grid gap-4 sm:grid-cols-4">
          {STEPS.map((item) => (
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
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 費用について ===== */}
      <section className="mb-14 sm:mb-20">
        <Card className="gap-0 overflow-hidden border-2 border-blue-200 py-0 dark:border-blue-800">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:p-10">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <Shield className="size-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                QRコード設置は完全無料
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                現在、QRコードの作成・デザイン・送付はすべて
                <strong>無料</strong>
                でご提供しています。
                <br />
                初期費用・月額料金・追加費用は一切かかりません。
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>初期費用 0円</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>月額料金 0円</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>追加費用 なし</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ※QRコード設置は無料です。エサ在庫管理などの追加機能は、無料プラン（永久無料）・ベーシック（初年度 月額500円）・プロ（初年度 月額1,980円）をご用意しています。今なら有料プランは3ヶ月無料でお試しいただけます。
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ===== サイトの特徴 ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-2 text-center text-xl font-bold sm:text-2xl">
          ツリスポの特徴
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          お客様が安心して使える釣り情報サイト
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Search,
              title: "SEO最適化済み",
              description:
                "Google検索で釣り情報を探すユーザーに届く設計。すべてのページが検索エンジンに最適化されています。",
            },
            {
              icon: Smartphone,
              title: "スマホ完全対応",
              description:
                "スマホでの閲覧に最適化。釣り場で見ても読みやすいレスポンシブデザインです。",
            },
            {
              icon: CalendarDays,
              title: "季節情報が充実",
              description:
                "月別の釣れる魚・混雑予想・旬の情報など、季節に応じた情報を自動更新しています。",
            },
            {
              icon: MapPin,
              title: "現在地から検索",
              description:
                "GPSで現在地から近い釣りスポットを自動表示。来店したお客様の地元情報がすぐ見つかります。",
            },
            {
              icon: Fish,
              title: "魚種別ガイド",
              description: `${fishCount}種以上の魚種別に、釣り方・道具・料理法まで網羅。「何を釣りたいか」から情報を探せます。`,
            },
            {
              icon: BookOpen,
              title: "初心者ガイド完備",
              description:
                "釣り初心者向けの入門ガイド・チェックリスト・用語集を用意。初めてのお客様にも安心です。",
            },
          ].map((feature) => (
            <Card key={feature.title} className="gap-0 py-0">
              <CardContent className="p-5 sm:p-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <feature.icon className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-3 text-sm font-bold">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== 対象事業者 ===== */}
      <section className="mb-14 sm:mb-20">
        <h2 className="mb-4 text-center text-xl font-bold sm:text-2xl">
          こんな事業者様におすすめ
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          釣りに関わるすべての事業者様が対象です
        </p>
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

      {/* ===== FAQ ===== */}
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
                <p className="mt-3 flex items-start gap-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
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

      {/* ===== 無料掲載申し込み ===== */}
      <section className="mb-14 sm:mb-20">
        <ShopListingForm />
      </section>

      {/* ===== CTA ===== */}
      <section id="contact" className="scroll-mt-20">
        <Card className="gap-0 overflow-hidden border-0 bg-gradient-to-br from-blue-700 to-blue-900 py-0">
          <CardContent className="flex flex-col items-center gap-6 px-5 py-10 text-center sm:px-12 sm:py-14">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
              <QrCode className="size-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white sm:text-3xl">
                まずはお気軽にご相談ください
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-blue-100 sm:text-base">
                QRコード設置は完全無料。
                <br />
                メール1通で、お客様の満足度を上げる第一歩を踏み出せます。
              </p>
            </div>
            <a href="mailto:fishingspotjapan@gmail.com?subject=QRコード設置希望">
              <Button
                size="lg"
                className="min-h-[52px] gap-2 bg-white px-10 text-base text-blue-800 hover:bg-blue-50"
              >
                <Mail className="size-5" />
                メールで問い合わせる
              </Button>
            </a>
            <p className="text-sm font-medium text-blue-100">
              fishingspotjapan@gmail.com
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>返信2営業日以内</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="size-3.5" />
                <span>設置完全無料</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>複数QR対応可</span>
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
