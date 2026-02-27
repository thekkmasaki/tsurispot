"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, Car, Toilet, Fish, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SpotImage } from "@/components/ui/spot-image";
import { SPOT_TYPE_LABELS } from "@/types";
import { FavoriteButton } from "@/components/spots/favorite-button";

/** SpotCardに必要な最小限のフィールドだけを持つ軽量型 */
export type SpotCardData = {
  id: string;
  slug: string;
  name: string;
  spotType: string;
  difficulty: string;
  rating: number;
  isFree: boolean;
  hasParking: boolean;
  hasToilet: boolean;
  hasRentalRod: boolean;
  hasConvenienceStore: boolean;
  mainImageUrl?: string;
  region: { prefecture: string; areaName: string };
  fishNames: string[];
};

type RegionKey = "hokkaido" | "tohoku" | "kanto" | "chubu" | "kinki" | "chugoku" | "shikoku" | "kyushu";

const REGION_CONFIG: Record<RegionKey, { label: string; prefectures: string[] }> = {
  hokkaido: {
    label: "北海道",
    prefectures: ["北海道"],
  },
  tohoku: {
    label: "東北",
    prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  kanto: {
    label: "関東",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  chubu: {
    label: "中部",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  },
  kinki: {
    label: "近畿",
    prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
  chugoku: {
    label: "中国",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  },
  shikoku: {
    label: "四国",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"],
  },
  kyushu: {
    label: "九州・沖縄",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  },
};

function getRegionKey(prefecture: string): RegionKey | null {
  for (const [key, config] of Object.entries(REGION_CONFIG)) {
    if (config.prefectures.includes(prefecture)) {
      return key as RegionKey;
    }
  }
  return null;
}

function LightSpotCard({ spot }: { spot: SpotCardData }) {
  const displayFish = spot.fishNames.slice(0, 3);
  const remainingCount = spot.fishNames.length - 3;
  return (
    <Link href={`/spots/${spot.slug}`}>
      <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="relative">
          <SpotImage
            src={(spot.mainImageUrl?.startsWith("http") || spot.mainImageUrl?.startsWith("/images/spots/wikimedia/")) ? spot.mainImageUrl : undefined}
            alt={spot.name}
            spotType={spot.spotType as "port" | "beach" | "rocky" | "pier" | "breakwater" | "river" | "lake" | "canal" | "managed" | "surf" | "estuary"}
            height="h-40"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/40 px-2 py-0.5 text-xs text-white">
            {SPOT_TYPE_LABELS[spot.spotType as keyof typeof SPOT_TYPE_LABELS] ?? spot.spotType}
          </span>
          <div className="absolute top-2 right-2">
            <FavoriteButton spotSlug={spot.slug} />
          </div>
        </div>
        <CardContent className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
          <div>
            <h3 className="text-sm font-semibold leading-tight group-hover:text-primary sm:text-base">{spot.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{spot.region.prefecture} {spot.region.areaName}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {displayFish.map((name) => (<Badge key={name} variant="secondary" className="text-xs">{name}</Badge>))}
            {remainingCount > 0 && <Badge variant="outline" className="text-xs">+{remainingCount}</Badge>}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{spot.rating.toFixed(1)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {spot.difficulty === "beginner" && <Badge className="bg-green-600 text-xs hover:bg-green-600">初心者OK</Badge>}
            {spot.isFree && <Badge className="bg-orange-500 text-xs hover:bg-orange-500">無料</Badge>}
            {spot.hasParking && <span className="text-muted-foreground" title="駐車場あり"><Car className="size-4" /></span>}
            {spot.hasToilet && <span className="text-muted-foreground" title="トイレあり"><Toilet className="size-4" /></span>}
            {spot.hasRentalRod && <span className="text-muted-foreground" title="レンタル竿あり"><Fish className="size-4" /></span>}
            {spot.hasConvenienceStore && <span className="text-muted-foreground" title="コンビニ近く"><ShoppingBag className="size-4" /></span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AreaFilteredSpotList({ spots }: { spots: SpotCardData[] }) {
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);

  // 地方ごとの件数
  const regionCounts = useMemo(() => {
    const counts: Record<RegionKey, number> = {
      hokkaido: 0, tohoku: 0, kanto: 0, chubu: 0,
      kinki: 0, chugoku: 0, shikoku: 0, kyushu: 0,
    };
    for (const s of spots) {
      const key = getRegionKey(s.region.prefecture);
      if (key) counts[key]++;
    }
    return counts;
  }, [spots]);

  const filteredSpots = useMemo(() => {
    if (!activeRegion) return spots;
    const prefectures = REGION_CONFIG[activeRegion].prefectures;
    return spots.filter((s) => prefectures.includes(s.region.prefecture));
  }, [spots, activeRegion]);

  return (
    <>
      {/* エリアフィルター */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveRegion(null)}
          className="min-h-[40px] shrink-0 focus:outline-none"
        >
          <Badge
            variant={activeRegion === null ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            全国
            <span className="ml-1 opacity-70">({spots.length})</span>
          </Badge>
        </button>
        {(Object.keys(REGION_CONFIG) as RegionKey[]).map((key) => {
          const count = regionCounts[key];
          if (count === 0) return null;
          const config = REGION_CONFIG[key];
          return (
            <button
              key={key}
              onClick={() => setActiveRegion(activeRegion === key ? null : key)}
              className="min-h-[40px] shrink-0 focus:outline-none"
            >
              <Badge
                variant={activeRegion === key ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm transition-colors hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
              >
                {config.label}
                <span className="ml-1 opacity-70">({count})</span>
              </Badge>
            </button>
          );
        })}
      </div>

      {/* 件数表示 */}
      <p className="mb-4 text-sm text-muted-foreground">
        {activeRegion ? (
          <>
            {REGION_CONFIG[activeRegion].label}の
            <span className="font-semibold text-foreground">{filteredSpots.length}件</span>
            のスポット（全{spots.length}件中）
          </>
        ) : (
          <>{spots.length}件のスポットが見つかりました</>
        )}
      </p>

      {/* スポットグリッド */}
      {filteredSpots.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSpots.map((spot) => (
            <LightSpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50 py-12 text-center">
          <p className="text-muted-foreground">
            この地方のスポットはまだ登録されていません。
          </p>
          <button
            onClick={() => setActiveRegion(null)}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            全国のスポットを表示
          </button>
        </div>
      )}
    </>
  );
}
