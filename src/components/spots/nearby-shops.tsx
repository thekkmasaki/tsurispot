"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Store, MapPin, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface NearbyShopItem {
  slug: string;
  name: string;
  address: string;
  distanceKm: number;
  isPremium: boolean;
  planLevel?: "free" | "basic" | "pro";
  hasLiveBait: boolean;
  hasFrozenBait: boolean;
}

interface NearbyShopsProps {
  spotName: string;
  shops: NearbyShopItem[];
}

// spot 詳細に近くの釣具店を表示し、表示/クリックを GA4 で計測する。
// 計測は B2B（釣具店掲載料）の「送客実績」を示す根拠データになる。
export function NearbyShops({ spotName, shops }: NearbyShopsProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || shops.length === 0) return;
    tracked.current = true;
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "nearby_shops_impression", {
        event_category: "b2b_shop",
        spot_name: spotName,
        shop_count: shops.length,
      });
    }
  }, [spotName, shops.length]);

  if (shops.length === 0) return null;

  const handleClick = (slug: string, planLevel: string) => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "nearby_shop_click", {
        event_category: "b2b_shop",
        event_label: slug,
        spot_name: spotName,
        shop_slug: slug,
        plan_level: planLevel,
      });
    }
  };

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Store className="size-5" />
        近くの釣具店・エサ店
      </h3>
      <p className="mb-3 text-sm text-muted-foreground">
        {spotName}の近くにある釣具店・エサ店です。エサや仕掛けの調達にどうぞ。
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {shops.map((shop) => {
          const isOfficial = shop.isPremium || (!!shop.planLevel && shop.planLevel !== "free");
          const baitLabel = shop.hasLiveBait
            ? "・活きエサあり"
            : shop.hasFrozenBait
              ? "・冷凍エサあり"
              : "";
          return (
            <Link prefetch={false}
              key={shop.slug}
              href={`/shops/${shop.slug}`}
              onClick={() => handleClick(shop.slug, shop.planLevel || "free")}
              className="group block"
            >
              <Card className="h-full gap-0 py-0 transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold group-hover:text-primary">
                      {shop.name}
                    </h4>
                    {isOfficial && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        <BadgeCheck className="size-3" />
                        公式
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3 shrink-0" />
                    {shop.address}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    約{shop.distanceKm.toFixed(1)}km{baitLabel}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
