import Link from "next/link";
import { MapPin, Fish, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import type { FishingSpot, FishSpecies } from "@/types";

interface RelatedSpotsProps {
  spots: FishingSpot[];
  title?: string;
}

export function RelatedSpots({
  spots,
  title = "関連する釣りスポット",
}: RelatedSpotsProps) {
  if (spots.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <MapPin className="size-5 text-primary" />
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((spot) => (
          <Link key={spot.id} href={`/spots/${spot.slug}`}>
            <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <h3 className="truncate font-semibold group-hover:text-primary">
                  {spot.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {spot.region.prefecture} {spot.region.areaName}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {SPOT_TYPE_LABELS[spot.spotType]}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span>{spot.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface RelatedFishProps {
  fishList: FishSpecies[];
  title?: string;
}

export function RelatedFish({
  fishList,
  title = "関連する魚種",
}: RelatedFishProps) {
  if (fishList.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Fish className="size-5 text-primary" />
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {fishList.map((fish) => (
          <Link key={fish.id} href={`/fish/${fish.slug}`}>
            <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="p-4 text-center">
                <Fish
                  className={`mx-auto mb-2 size-8 ${
                    fish.category === "sea" ? "text-sky-300" : "text-green-300"
                  }`}
                />
                <h3 className="text-sm font-semibold group-hover:text-primary">
                  {fish.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {DIFFICULTY_LABELS[fish.difficulty]}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface FishSpotLinksProps {
  catchableFish: { fish: FishSpecies }[];
}

export function FishSpotLinks({ catchableFish }: FishSpotLinksProps) {
  if (catchableFish.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold">この釣り場で狙える魚の詳細</h2>
      <div className="flex flex-wrap gap-2">
        {catchableFish.map((cf) => (
          <Link key={cf.fish.id} href={`/fish/${cf.fish.slug}`}>
            <Badge
              variant="outline"
              className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {cf.fish.name}の釣り情報
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}
