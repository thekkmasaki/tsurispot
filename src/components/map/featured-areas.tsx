import Link from "next/link";
import { MapPin } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { prefectures } from "@/lib/data/prefectures";

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
  const items = FEATURED_PREFECTURE_SLUGS.map((slug) => {
    const pref = prefectures.find((p) => p.slug === slug);
    if (!pref) return null;
    const count = fishingSpots.filter(
      (s) => s.region.prefecture === pref.name
    ).length;
    if (count === 0) return null;
    return { pref, count };
  }).filter((v): v is { pref: (typeof prefectures)[number]; count: number } => v !== null);

  if (items.length === 0) return null;

  return (
    <section className="mb-4 sm:mb-6">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold sm:text-base">
        <MapPin className="size-4 text-primary" />
        注目エリア
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {items.map(({ pref, count }) => (
          <Link
            key={pref.slug}
            href={`/prefecture/${pref.slug}`}
            className="group rounded-lg border bg-card p-2 text-center transition-shadow hover:shadow-md sm:p-3"
          >
            <div className="text-xs font-semibold group-hover:text-primary sm:text-sm">
              {pref.nameShort}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
              {count}件
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
