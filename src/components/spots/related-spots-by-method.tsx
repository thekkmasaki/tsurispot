import Link from "next/link";
import { Anchor, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
        <h2 className="text-lg font-bold">{methodLabel}ができる他のスポット</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        {methodLabel}を楽しめるスポットを探す
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((s) => (
          <Link prefetch={false} key={s.slug} href={`/spots/${s.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-3">
                <div className="font-medium">{s.name}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {s.region.prefecture}・{s.region.areaName}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {s.catchableFish.length}種が狙える
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
