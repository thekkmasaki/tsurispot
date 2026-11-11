import { Anchor } from "lucide-react";
import { SpotCardCompact } from "@/components/spots/spot-card";
import type { FishingSpot } from "@/types";

interface Props {
  spots: FishingSpot[];
  methodLabel: string;
}

/**
 * 「{釣り方} ができる他のスポット」を表示する Server Component。
 * 内部リンク強化で SEO の話題関連性向上を狙う。
 */
export function RelatedSpotsByMethod({ spots, methodLabel }: Props) {
  if (spots.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Anchor className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-bold">{methodLabel}ができる近くのスポット</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        この釣り場の周辺エリアで{methodLabel}を楽しめるスポット
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
              rating: s.rating,
            }}
          >
            <span className="text-muted-foreground">{s.catchableFish.length}種が狙える</span>
          </SpotCardCompact>
        ))}
      </div>
    </section>
  );
}
