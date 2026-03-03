import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Scale,
  Calendar,
  Ruler,
  MapPin,
  ChevronRight,
  Info,
  FileText,
  Fish,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { prefectures } from "@/lib/data/prefectures";
import {
  prefectureFishingRules,
  getFishingRuleByPrefSlug,
  COMMON_RULES,
} from "@/lib/data/fishing-rules-data";
import { fishingSpots } from "@/lib/data/spots";

interface Props {
  params: Promise<{ prefecture: string }>;
}

export async function generateStaticParams() {
  return prefectures.map((pref) => ({ prefecture: pref.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { prefecture: prefSlug } = await params;
  const pref = prefectures.find((p) => p.slug === prefSlug);
  if (!pref) return {};

  const title = `${pref.name}の釣りルール・規制情報｜禁漁期間・遊漁券・サイズ制限`;
  const description = `${pref.name}で釣りをする前に知っておきたいルールと規制をまとめました。禁漁期間、遊漁券が必要な河川、サイズ制限、漁業権に関する注意事項を解説。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://tsurispot.com/fishing-rules/${pref.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/fishing-rules/${pref.slug}`,
    },
  };
}

export default async function PrefectureFishingRulesPage({ params }: Props) {
  const { prefecture: prefSlug } = await params;
  const pref = prefectures.find((p) => p.slug === prefSlug);
  if (!pref) notFound();

  const rule = getFishingRuleByPrefSlug(prefSlug);

  // この都道府県のスポット取得
  const prefSpots = fishingSpots
    .filter((s) => s.region.prefecture === pref.name)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  // JSON-LD
  const pageUrl = `https://tsurispot.com/fishing-rules/${pref.slug}`;

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
        name: "釣りのルールとマナー",
        item: "https://tsurispot.com/fishing-rules",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${pref.name}の釣りルール`,
        item: pageUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${pref.name}の釣りルール・規制情報｜禁漁期間・遊漁券・サイズ制限`,
    description: `${pref.name}で釣りをする前に知っておきたいルールと規制。禁漁期間、遊漁券が必要な河川、サイズ制限、漁業権に関する注意事項を解説。`,
    datePublished: "2025-06-01",
    dateModified: new Date().toISOString().split("T")[0],
    author: {
      "@type": "Person",
      name: "正木 家康",
      jobTitle: "編集長",
      url: "https://tsurispot.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
      logo: {
        "@type": "ImageObject",
        url: "https://tsurispot.com/logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };

  // FAQ JSON-LD をルールデータから動的生成
  const faqItems: { question: string; answer: string }[] = [];

  if (rule && rule.yugyokenRivers.length > 0) {
    faqItems.push({
      question: `${pref.name}で遊漁券が必要な河川は？`,
      answer: `${pref.name}では${rule.yugyokenRivers.join("、")}などの河川で遊漁券が必要です。${COMMON_RULES.yugyoken}`,
    });
  }

  if (rule && rule.closedSeasons.length > 0) {
    const seasonTexts = rule.closedSeasons
      .map((cs) => `${cs.fish}: ${cs.period}`)
      .join("。");
    faqItems.push({
      question: `${pref.name}の禁漁期間はいつですか？`,
      answer: `${pref.name}の主な禁漁期間は以下の通りです。${seasonTexts}。河川によって異なる場合がありますので、各漁協にご確認ください。`,
    });
  }

  if (rule && rule.sizeLimits.length > 0) {
    const sizeTexts = rule.sizeLimits
      .map((sl) => `${sl.fish}: ${sl.minSize}以上`)
      .join("、");
    faqItems.push({
      question: `${pref.name}の釣りのサイズ制限は？`,
      answer: `${pref.name}では${sizeTexts}のサイズ制限があります。${COMMON_RULES.sizeLimit}`,
    });
  }

  // ルールデータがない場合でも汎用FAQを追加
  if (faqItems.length === 0) {
    faqItems.push({
      question: `${pref.name}で釣りをする際に注意することは？`,
      answer: `${pref.name}で釣りをする際は、漁業権の対象となる貝類・海藻の採取禁止、渓流魚の禁漁期間、遊漁券の必要性を事前に確認してください。${COMMON_RULES.penalty}`,
    });
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, articleJsonLd, faqJsonLd]),
        }}
      />

      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "ルール・マナー", href: "/fishing-rules" },
              { label: pref.name },
            ]}
          />
        </div>

        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            {pref.name}の釣りルール・規制情報
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            {pref.name}で釣りを楽しむために、知っておきたいルールをまとめました。
          </p>
        </div>

        <div className="space-y-8">
          {/* 共通注意事項 */}
          <section>
            <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                重要な注意事項
              </div>
              <p className="text-sm">
                {COMMON_RULES.penalty}「知らなかった」では済まないため、事前の確認が重要です。
              </p>
            </div>
          </section>

          {/* 漁業権について */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">漁業権について</h2>
            </div>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {COMMON_RULES.fishingRights}
                </p>
                <div className="mt-3 rounded-lg bg-blue-50 p-3 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Info className="h-4 w-4" />
                    一般的な竿釣り・手釣りで魚を釣ることは、多くの場合漁業権の侵害にはなりません。
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* 遊漁券が必要な河川 */}
          {rule && rule.yugyokenRivers.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold sm:text-2xl">
                  遊漁券が必要な主な河川
                </h2>
              </div>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {COMMON_RULES.yugyoken}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rule.yugyokenRivers.map((river) => (
                      <Badge key={river} variant="secondary" className="text-sm">
                        {river}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    ※ 上記以外の河川でも遊漁券が必要な場合があります。各漁協にご確認ください。
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 禁漁期間 */}
          {rule && rule.closedSeasons.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold sm:text-2xl">
                  主な禁漁期間
                </h2>
              </div>
              <div className="space-y-3">
                {rule.closedSeasons.map((cs) => (
                  <Card key={cs.fish}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Fish className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold">{cs.fish}</h3>
                          </div>
                          {cs.note && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {cs.note}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-200">
                          {cs.period}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  禁漁期間は河川によって異なる場合があります。必ず各漁協に確認してください。
                </div>
              </div>
            </section>
          )}

          {/* サイズ制限 */}
          {rule && rule.sizeLimits.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold sm:text-2xl">
                  サイズ制限
                </h2>
              </div>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                    {COMMON_RULES.sizeLimit}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 pr-4 font-medium">魚種</th>
                          <th className="pb-2 font-medium">最小サイズ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-muted-foreground">
                        {rule.sizeLimits.map((sl) => (
                          <tr key={sl.fish}>
                            <td className="py-2 pr-4">{sl.fish}</td>
                            <td className="py-2">{sl.minSize}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* 特記事項 */}
          {rule && rule.specialNotes.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold sm:text-2xl">
                  {pref.name}の特記事項
                </h2>
              </div>
              <div className="space-y-3">
                {rule.specialNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 rounded-lg border p-4"
                  >
                    <Info className="h-5 w-5 shrink-0 text-blue-600" />
                    <p className="text-sm text-muted-foreground">{note}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 管轄機関 */}
          {rule && (
            <section>
              <Card className="bg-slate-50 dark:bg-slate-900">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-2 font-semibold">規則の確認先</h3>
                  <p className="text-sm text-muted-foreground">
                    {rule.referenceText}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    管轄: {rule.authority}
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          {/* この県の釣りスポット */}
          {prefSpots.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold sm:text-2xl">
                  {pref.name}の主な釣りスポット
                </h2>
              </div>
              <div className="space-y-2">
                {prefSpots.map((spot) => (
                  <Link key={spot.slug} href={`/spots/${spot.slug}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3 flex items-center gap-3">
                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium truncate">
                            {spot.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {spot.address}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <div className="mt-3 text-center">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/prefecture/${pref.slug}`}>
                    {pref.name}のスポットをすべて見る
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </section>
          )}
        </div>

        {/* 全国ルールへのリンク */}
        <div className="mt-10 text-center sm:mt-14">
          <p className="mb-4 text-base font-medium sm:text-lg">
            ルールを守って、楽しい釣りライフを！
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="min-h-[48px] gap-1.5 rounded-full px-8">
              <Link href="/fishing-rules">
                全国共通のルールを見る
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-[48px] gap-1.5 rounded-full px-8"
            >
              <Link href="/spots">
                スポットを探す
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
