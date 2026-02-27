import Link from "next/link";
import { Star, Car, Toilet, Fish, ShoppingBag, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FishingSpot, SPOT_TYPE_LABELS } from "@/types";
import { SpotImage } from "@/components/ui/spot-image";
import { FavoriteButton } from "@/components/spots/favorite-button";
import { CompareToggleButton } from "@/components/spots/compare-bar";

export function SpotCard({ spot, distance }: { spot: FishingSpot; distance?: number | null }) {
  const fishNames = spot.catchableFish.map((cf) => cf.fish.name);
  const displayFish = fishNames.slice(0, 3);
  const remainingCount = fishNames.length - 3;

  return (
    <Link href={`/spots/${spot.slug}`}>
      <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        {/* スポット画像 */}
        <div className="relative">
          <SpotImage
            src={(spot.mainImageUrl?.startsWith("http") || spot.mainImageUrl?.startsWith("/images/spots/wikimedia/")) ? spot.mainImageUrl : undefined}
            alt={spot.name}
            spotType={spot.spotType}
            height="h-40"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/40 px-2 py-0.5 text-xs text-white">
            {SPOT_TYPE_LABELS[spot.spotType]}
          </span>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <CompareToggleButton slug={spot.slug} name={spot.name} />
            <FavoriteButton spotSlug={spot.slug} />
          </div>
        </div>

        <CardContent className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
          {/* Spot name and region */}
          <div>
            <h3 className="text-sm font-semibold leading-tight group-hover:text-primary sm:text-base">
              {spot.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {spot.region.prefecture} {spot.region.areaName}
              {distance != null && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                  <Navigation className="size-3" />
                  約{distance < 1 ? `${Math.round(distance * 1000)}m` : distance < 10 ? `${distance.toFixed(1)}km` : `${Math.round(distance)}km`}
                </span>
              )}
            </p>
          </div>

          {/* Fish badges */}
          <div className="flex flex-wrap gap-1">
            {displayFish.map((name) => (
              <Badge key={name} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingCount}
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{spot.rating.toFixed(1)}</span>
          </div>

          {/* Badges and facilities */}
          <div className="flex flex-wrap items-center gap-1.5">
            {spot.difficulty === "beginner" && (
              <Badge className="bg-green-600 text-xs hover:bg-green-600">
                初心者OK
              </Badge>
            )}
            {spot.isFree && (
              <Badge className="bg-orange-500 text-xs hover:bg-orange-500">
                無料
              </Badge>
            )}
            {spot.hasParking && (
              <span className="text-muted-foreground" title="駐車場あり">
                <Car className="size-4" />
              </span>
            )}
            {spot.hasToilet && (
              <span className="text-muted-foreground" title="トイレあり">
                <Toilet className="size-4" />
              </span>
            )}
            {spot.hasRentalRod && (
              <span className="text-muted-foreground" title="レンタル竿あり">
                <Fish className="size-4" />
              </span>
            )}
            {spot.hasConvenienceStore && (
              <span className="text-muted-foreground" title="コンビニ近く">
                <ShoppingBag className="size-4" />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
