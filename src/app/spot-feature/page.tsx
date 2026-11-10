import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FeatureChipGrid } from "@/components/spots/spot-feature-ui";
import { SPOT_FEATURES, getFeatureSpots } from "@/lib/data/spot-features";

const URL = "https://tsurispot.com/spot-feature";
const TITLE = "特徴から釣り場を探す｜トイレあり・夜釣りOK・ファミリー向けなど";
const DESC =
  "トイレあり・駐車場あり・無料・夜釣りOK・投げ釣りOK・ルアーOK・レンタル竿ありなど、条件から全国の釣り場を探せます。都道府県別の一覧つき。";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESC, url: URL, type: "website", siteName: "ツリスポ" },
};

export default function SpotFeatureIndexPage() {
  const items = SPOT_FEATURES.map((feature) => ({
    feature,
    count: getFeatureSpots(feature).length,
  }));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "特徴から探す", item: URL },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "特徴から探す" }]} />
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">特徴から釣り場を探す</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
        釣り場選びで本当に知りたいのは「トイレはあるか」「車で行けるか」「夜も釣れるか」といった条件です。
        ツリスポでは点数のランキングではなく、条件から自分に合う釣り場を探せるようにしています。
      </p>
      <FeatureChipGrid items={items} className="mt-6" />
    </div>
  );
}
