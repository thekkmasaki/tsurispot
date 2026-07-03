import type { Metadata } from "next";
import Link from "next/link";
import { BedDouble, MapPin } from "lucide-react";
import { accommodations } from "@/lib/data/accommodations";
import { prefectures, getPrefecturesByRegionGroup } from "@/lib/data/prefectures";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { HeaderBannerAd, InArticleAd, NativeAdBreak } from "@/components/ads/ad-unit";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "全国の釣り宿・釣り客向け宿泊施設一覧｜ツリスポ",
  description: "全国の釣り宿・釣り客歓迎の旅館・民宿・ゲストハウスを都道府県別に紹介。 早朝出船・釣果料理対応・タックルレンタル可の宿を厳選掲載。",
  alternates: { canonical: "https://tsurispot.com/accommodations" },
  openGraph: {
    title: "全国の釣り宿・釣り客向け宿泊施設一覧",
    description: "全国の釣り宿を都道府県別に紹介。",
    type: "website",
    url: "https://tsurispot.com/accommodations",
    siteName: "ツリスポ",
  },
};

const PREFECTURE_NAME_TO_SLUG: Record<string, string> = Object.fromEntries(
  prefectures.map((p) => [p.name, p.slug])
);

export default function AccommodationsIndexPage() {
  // 都道府県別の宿数を集計
  const countByPref = new Map<string, number>();
  for (const a of accommodations) {
    if ((a.rakutenUrl && a.rakutenUrl !== "#") || (a.jalanUrl && a.jalanUrl !== "#")) {
      countByPref.set(a.prefecture, (countByPref.get(a.prefecture) ?? 0) + 1);
    }
  }

  const groupedPrefs = getPrefecturesByRegionGroup();

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣り宿" },
        ]}
      />

      <HeaderBannerAd />

      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <BedDouble className="size-4" />
          全国
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">全国の釣り宿・釣り客向け宿泊施設</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          全国の釣り宿・旅館・民宿・ゲストハウスを都道府県別に掲載。 早朝出船や釣果料理など、 釣り旅行に最適な宿を探せます。
        </p>
      </header>

      <InArticleAd />

      <div className="space-y-8">
        {Array.from(groupedPrefs.entries()).map(([region, prefs]) => (
          <section key={region}>
            <h2 className="mb-3 text-lg font-bold border-b pb-1">{region}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {prefs.map((p) => {
                const count = countByPref.get(p.name) ?? 0;
                if (count === 0) return null;
                return (
                  <Link prefetch={false}
                    key={p.slug}
                    href={`/accommodations/${p.slug}`}
                    className="rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="size-3" />
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {count}件の宿
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <NativeAdBreak />

      <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 sm:p-6">
        <h2 className="text-base font-bold text-emerald-900 sm:text-lg">釣り場とセットで宿を探す</h2>
        <p className="mt-2 text-sm text-emerald-700">
          各スポット詳細ページの「近くの釣り宿」セクションから、 釣り場と宿をまとめて検討できます。
        </p>
        <Link prefetch={false}
          href="/spots"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
        >
          釣りスポットを探す →
        </Link>
      </div>
    </div>
  );
}
