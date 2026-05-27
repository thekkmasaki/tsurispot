import Link from "next/link";
import { MapPin, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
          <Link key={s.slug} href={`/spots/${s.slug}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-3">
                <div className="font-medium">{s.name}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {s.region.prefecture}・{s.region.areaName}
                </div>
                {s.catchableFish.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {Array.from(new Set(s.catchableFish.map((cf) => cf.fish.name)))
                      .slice(0, 4)
                      .map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-ocean-mid/10 px-2 py-0.5 text-[10px] text-ocean-mid"
                        >
                          {name}
                        </span>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
