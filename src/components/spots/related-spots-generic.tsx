import { type LucideIcon } from "lucide-react";
import { SpotCardCompact } from "@/components/spots/spot-card";
import type { FishingSpot } from "@/types";

interface Props {
  spots: FishingSpot[];
  title: string;
  description?: string;
  Icon: LucideIcon;
}

/**
 * 汎用「関連スポット」リスト。
 * タイトル・説明・アイコンを props で受ける。
 * 内部リンク強化 (Phase C) でマイナースポットへの誘導を増やす。
 */
export function RelatedSpotsGeneric({ spots, title, description, Icon }: Props) {
  if (spots.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-ocean-mid" />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {description && <p className="mb-3 text-sm text-muted-foreground">{description}</p>}
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
