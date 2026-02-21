import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Star,
  Fish,
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  Users,
  Swords,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { areaGuides, getAreaGuideBySlug, getRelatedAreaGuides } from "@/lib/data/area-guides";
import { fishingSpots } from "@/lib/data/spots";
import { DIFFICULTY_LABELS } from "@/types";

export async function generateStaticParams() {
  return areaGuides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getAreaGuideBySlug(slug);
  if (!guide) return {};

  const title = `${guide.name}の釣り場おすすめガイド｜釣れる魚・時期・スポット一覧｜ツリスポ`;
  const description = `${guide.name}のおすすめ釣りスポットを初心者〜上級者別に厳選紹介。釣れる魚・ベストシーズン・アクセス情報まで${guide.name}の釣りを完全攻略。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://tsurispot.com/area-guide/${slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/area-guide/${slug}`,
    },
  };
}

function getAreaSpots(prefectures: string[]) {
  return fishingSpots
    .filter((s) => prefectures.includes(s.region.prefecture))
    .sort((a, b) => b.rating - a.rating);
}

function getDifficultyColor(d: string) {
  if (d === "beginner") return "bg-green-100 text-green-800";
  if (d === "intermediate") return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function getSpotTags(spot: (typeof fishingSpots)[0]): string[] {
  const tags: string[] = [];
  if (spot.difficulty === "beginner") tags.push("初心者おすすめ");
  if (spot.hasParking && spot.hasToilet) tags.push("設備充実");
  if (spot.isFree) tags.push("無料");
  if (spot.catchableFish.some((cf) => cf.catchDifficulty === "easy"))
    tags.push("釣りやすい");
  return tags.slice(0, 2);
}

export default async function AreaGuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getAreaGuideBySlug(slug);
  if (!guide) notFound();

  const allSpots = getAreaSpots(guide.prefectures);
  const top10 = allSpots.slice(0, 10);
  const beginnerSpots = allSpots
    .filter((s) => s.difficulty === "beginner")
    .slice(0, 3);
  const intermediateSpots = allSpots
    .filter((s) => s.difficulty === "intermediate")
    .slice(0, 3);
  const advancedSpots = allSpots
    .filter((s) => s.difficulty === "advanced")
    .slice(0, 3);

  const relatedGuides = getRelatedAreaGuides(slug);

  const breadcrumbItems = [
    { label: "ホーム", href: "/" },
    { label: "エリアガイド", href: "/area-guide" },
    { label: guide.name },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "エリアガイド", item: "https://tsurispot.com/area-guide" },
      { "@type": "ListItem", position: 3, name: guide.name, item: `https://tsurispot.com/area-guide/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-background py-12">
          <div className="mx-auto max-w-7xl px-4">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                <MapPin className="h-4 w-4" />
                <span>{guide.prefectures.join(" / ")}</span>
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl">{guide.title}</h1>
              <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
                {guide.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm">
                  <Fish className="h-4 w-4 text-primary" />
                  <span className="font-medium">ベストシーズン:</span>
                  <span>{guide.bestSeason}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{allSpots.length}スポット掲載</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 space-y-12">
          {/* エリアの特徴 */}
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              {guide.name}の特徴
            </h2>
            <Card>
              <CardContent className="pt-5">
                <ul className="space-y-3">
                  {guide.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* おすすめスポットTOP10 */}
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              おすすめスポット TOP{Math.min(10, top10.length)}
            </h2>
            {top10.length === 0 ? (
              <p className="text-muted-foreground text-sm">スポットデータを準備中です。</p>
            ) : (
              <div className="space-y-3">
                {top10.map((spot, index) => {
                  const tags = getSpotTags(spot);
                  return (
                    <Card key={spot.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/spots/${spot.slug}`}
                                className="font-semibold hover:text-primary hover:underline text-sm sm:text-base"
                              >
                                {spot.name}
                              </Link>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-yellow-500 text-xs">
                                  {renderStars(spot.rating)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {spot.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              <Badge
                                className={`text-xs ${getDifficultyColor(spot.difficulty)}`}
                                variant="outline"
                              >
                                {DIFFICULTY_LABELS[spot.difficulty]}
                              </Badge>
                              {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Fish className="h-3 w-3" />
                                {spot.catchableFish
                                  .slice(0, 3)
                                  .map((cf) => cf.fish.name)
                                  .join("・")}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {spot.address.substring(0, 20)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* レベル別おすすめ */}
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              レベル別おすすめスポット
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {/* 初心者 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-green-700">
                    <Shield className="h-4 w-4" />
                    初心者向け
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {beginnerSpots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">データ準備中</p>
                  ) : (
                    beginnerSpots.map((spot) => (
                      <Link
                        key={spot.id}
                        href={`/spots/${spot.slug}`}
                        className="block rounded-lg border p-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{spot.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          評価 {spot.rating.toFixed(1)} / 設備{" "}
                          {[
                            spot.hasParking && "駐車場",
                            spot.hasToilet && "トイレ",
                          ]
                            .filter(Boolean)
                            .join("・") || "要確認"}
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* 中級者 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-yellow-700">
                    <Swords className="h-4 w-4" />
                    中級者向け
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {intermediateSpots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">データ準備中</p>
                  ) : (
                    intermediateSpots.map((spot) => (
                      <Link
                        key={spot.id}
                        href={`/spots/${spot.slug}`}
                        className="block rounded-lg border p-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{spot.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          評価 {spot.rating.toFixed(1)} /{" "}
                          {spot.catchableFish[0]?.fish.name || ""}
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* 上級者 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-red-700">
                    <Star className="h-4 w-4" />
                    上級者向け
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {advancedSpots.length === 0 ? (
                    <p className="text-xs text-muted-foreground">データ準備中</p>
                  ) : (
                    advancedSpots.map((spot) => (
                      <Link
                        key={spot.id}
                        href={`/spots/${spot.slug}`}
                        className="block rounded-lg border p-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium text-sm">{spot.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          評価 {spot.rating.toFixed(1)} /{" "}
                          {spot.catchableFish[0]?.fish.name || ""}
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* メイン魚種と時期 */}
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Fish className="h-5 w-5 text-primary" />
              釣れる魚と時期
            </h2>
            <Card>
              <CardContent className="pt-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left font-semibold w-24">魚種</th>
                        {["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].map(
                          (m) => (
                            <th key={m} className="pb-2 text-center text-xs w-8">
                              {m}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {guide.mainFish.map((fishName) => {
                        // スポットデータからこの魚の月情報を取得
                        const fishData = allSpots
                          .flatMap((s) => s.catchableFish)
                          .find((cf) => cf.fish.name === fishName);
                        const start = fishData?.monthStart ?? 1;
                        const end = fishData?.monthEnd ?? 12;
                        const peak = fishData?.peakSeason ?? false;

                        return (
                          <tr key={fishName} className="border-b last:border-0">
                            <td className="py-2 font-medium text-sm">{fishName}</td>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                              const inSeason = start <= end ? m >= start && m <= end : m >= start || m <= end;
                              return (
                                <td key={m} className="py-2 text-center">
                                  {inSeason ? (
                                    <span
                                      className={`inline-block h-5 w-5 rounded-sm text-xs ${peak ? "bg-primary text-primary-foreground" : "bg-primary/30 text-primary"}`}
                                    >
                                      ○
                                    </span>
                                  ) : (
                                    <span className="inline-block h-5 w-5 text-xs text-muted-foreground/30">
                                      −
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  ● ピークシーズン / ○ 釣れる時期 / − オフシーズン（目安）
                </p>
              </CardContent>
            </Card>
          </section>

          {/* エリア固有のTips */}
          <section>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              {guide.name}釣り攻略Tips
            </h2>
            <div className="space-y-3">
              {guide.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 関連エリアガイド */}
          {relatedGuides.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                関連エリアガイド
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedGuides.map((rg) => (
                  <Link key={rg.slug} href={`/area-guide/${rg.slug}`}>
                    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{rg.name}</h3>
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {rg.description.substring(0, 60)}...
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {rg.mainFish.slice(0, 3).map((f) => (
                            <Badge key={f} variant="secondary" className="text-xs">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
            <h2 className="text-xl font-bold mb-2">{guide.name}の全スポットを見る</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {allSpots.length}か所の釣りスポット情報を詳しくチェック
            </p>
            <Link
              href={`/spots?prefecture=${encodeURIComponent(guide.prefectures[0])}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              スポット一覧を見る
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
