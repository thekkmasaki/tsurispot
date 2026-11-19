import { MapPin } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { prefectures } from "@/lib/data/prefectures";
import { FeaturedAreaChips, type FeaturedAreaItem } from "./featured-area-chips";

const FEATURED_PREFECTURE_SLUGS = [
  "chiba",
  "kanagawa",
  "shizuoka",
  "shiga",
  "hyogo",
  "fukuoka",
  "hokkaido",
  "okinawa",
];

export function FeaturedAreas() {
  const items: FeaturedAreaItem[] = [];
  for (const slug of FEATURED_PREFECTURE_SLUGS) {
    const pref = prefectures.find((p) => p.slug === slug);
    if (!pref) continue;
    const count = fishingSpots.filter((s) => s.region.prefecture === pref.name).length;
    if (count === 0) continue;
    items.push({ slug: pref.slug, name: pref.name, nameShort: pref.nameShort, count });
  }

  if (items.length === 0) return null;

  return (
    <section className="mb-4 sm:mb-6">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold sm:text-base">
        <MapPin className="size-4 text-primary" />
        注目エリア
        <span className="text-[11px] font-normal text-muted-foreground sm:text-xs">
          タップすると地図がその県へ移動します
        </span>
      </h2>
      <FeaturedAreaChips items={items} />
    </section>
  );
}
