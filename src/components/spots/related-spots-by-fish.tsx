import { Fish } from "lucide-react";
import { SpotCardCompact } from "@/components/spots/spot-card";
import type { FishingSpot } from "@/types";

interface Props {
  spots: FishingSpot[];
  fishName: string;
}

/**
 * 「{魚名} が釣れる他のスポット」を表示する Server Component。
 * 内部リンク強化で回遊率向上を狙う。
 */
export function RelatedSpotsByFish({ spots, fishName }: Props) {
  if (spots.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Fish className="h-5 w-5 text-ocean-mid" />
        <h2 className="text-lg font-bold">{fishName}が釣れる近くのスポット</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        同じく{fishName}が狙える、この釣り場の周辺エリアのスポット
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((s) => (
          <SpotCardCompact
            key={s.slug}
            className="h-full"
            spot={{
              slug: s.slug,
              name: s.name,
              spotType: s.spotType,
              region: s.region,
              fishNames: Array.from(new Set(s.catchableFish.map((cf) => cf.fish.name).filter(Boolean))),
              rating: s.rating,
            }}
          />
        ))}
      </div>
    </section>
  );
}
