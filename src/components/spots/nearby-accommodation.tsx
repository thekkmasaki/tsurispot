"use client";

import { ExternalLink, BedDouble } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NearbyAccommodationProps {
  spotName: string;
  latitude: number;
  longitude: number;
  prefecture: string;
  areaName: string;
}

export function NearbyAccommodation({ spotName, latitude, longitude, prefecture, areaName }: NearbyAccommodationProps) {
  const searchQuery = encodeURIComponent(`${areaName} 釣り 宿`);

  const handleClick = (service: string) => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "click_accommodation", {
        event_category: "affiliate",
        event_label: `${service}_${spotName}`,
        spot_name: spotName,
        service,
      });
    }
  };

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <BedDouble className="size-5" />
        近くの宿を探す
      </h3>
      <Card className="border-amber-200 bg-amber-50/30 py-4">
        <CardContent className="px-4">
          <p className="mb-3 text-sm text-muted-foreground">
            {spotName}周辺の宿泊施設を検索できます。遠征や早朝釣行に便利です。
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://travel.rakuten.co.jp/yado/?f_latitude=${latitude}&f_longitude=${longitude}&f_sort=distance`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => handleClick("rakuten_travel")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 min-h-[40px]"
            >
              <BedDouble className="size-4" />
              楽天トラベルで探す
              <ExternalLink className="size-3" />
            </a>
            <a
              href={`https://www.jalan.net/kankou/map/?screenId=OUW3701&latitude=${latitude}&longitude=${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick("jalan")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 min-h-[40px]"
            >
              <BedDouble className="size-4" />
              じゃらんで探す
              <ExternalLink className="size-3" />
            </a>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            ※ 外部サイトに移動します
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
