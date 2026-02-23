import Link from "next/link";
import { Star, MapPin, TriangleAlert, Skull } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS } from "@/types";
import type { FishSpecies } from "@/types";
import { FishImage } from "@/components/ui/spot-image";

interface FishCardProps {
  fish: FishSpecies;
  showPeakBadge?: boolean;
  showSpots?: boolean;
}

export function FishCard({ fish, showPeakBadge, showSpots = false }: FishCardProps) {
  return (
    <Link href={`/fish/${fish.slug}`}>
      <Card className={`group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md ${fish.isPoisonous ? "ring-2 ring-red-200" : ""}`}>
        {/* 魚画像 */}
        <div className="relative">
          <FishImage
            src={fish.imageUrl}
            alt={fish.name}
            category={fish.category}
            height="h-28"
          />
          {fish.isPoisonous && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white shadow">
              {fish.dangerLevel === "high" ? <Skull className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
              毒
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
          {/* 魚名 */}
          <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
            {fish.name}
          </h3>
          {fish.aliases && fish.aliases.length > 0 && (
            <p className="text-[10px] text-muted-foreground -mt-0.5 truncate">
              {fish.aliases.slice(0, 2).join("・")}
            </p>
          )}

          {/* バッジ行 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-xs">
              {DIFFICULTY_LABELS[fish.difficulty]}
            </Badge>
            {fish.isPoisonous && (
              <Badge className="bg-red-100 text-xs text-red-700 hover:bg-red-100">
                {fish.poisonType || "毒あり"}
              </Badge>
            )}
            {showPeakBadge && (
              <Badge className="bg-orange-100 text-xs text-orange-700 hover:bg-orange-100">
                旬
              </Badge>
            )}
          </div>

          {/* 食味 */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">食味</span>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-3 ${
                    i < fish.tasteRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* サイズ */}
          <p className="text-xs text-muted-foreground">{fish.sizeCm}</p>

          {/* 主な釣りスポット */}
          {showSpots && fish.spots.length > 0 && (
            <div className="flex items-start gap-1 border-t pt-1.5 mt-0.5">
              <MapPin className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground line-clamp-2">
                {fish.spots.slice(0, 3).map((s) => s.name).join("、")}
                {fish.spots.length > 3 && ` 他${fish.spots.length - 3}件`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
