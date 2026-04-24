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

// 楽天トラベルアフィリエイトID
const RAKUTEN_TRAVEL_AFF_ID = "53244533.679e45cf.53244534.4a0f19f1";

function buildRakutenTravelAffUrl(latitude: number, longitude: number) {
  const destUrl = `https://travel.rakuten.co.jp/yado/?f_latitude=${latitude}&f_longitude=${longitude}&f_sort=distance`;
  const encoded = encodeURIComponent(destUrl);
  return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_TRAVEL_AFF_ID}/?pc=${encoded}&m=${encoded}`;
}

// ---- まとめセクション下のコンパクトCTA ----
export function RakutenTravelCta({
  spotName,
  latitude,
  longitude,
  areaName,
}: {
  spotName: string;
  latitude: number;
  longitude: number;
  areaName: string;
}) {
  const url = buildRakutenTravelAffUrl(latitude, longitude);

  const handleClick = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "click_travel_cta", {
        event_category: "affiliate",
        event_label: `rakuten_travel_cta_${spotName}`,
        spot_name: spotName,
      });
    }
  };

  return (
    <section className="mt-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="group flex items-center gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-amber-50 px-4 py-3 transition-all hover:shadow-md hover:border-red-300"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg group-hover:bg-red-200 transition-colors">
          🏨
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-red-700">{areaName}エリアの宿を探す</div>
          <div className="text-xs text-muted-foreground">遠征・早朝釣行に便利な周辺の宿泊施設</div>
        </div>
        <ExternalLink className="size-4 shrink-0 text-red-400 group-hover:text-red-600 transition-colors" />
      </a>
      <p className="mt-1 text-right text-[10px] text-muted-foreground">PR</p>
    </section>
  );
}

export function NearbyAccommodation({ spotName, latitude, longitude, prefecture, areaName }: NearbyAccommodationProps) {
  const rakutenTravelUrl = buildRakutenTravelAffUrl(latitude, longitude);

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
              href={rakutenTravelUrl}
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
            ※ 外部サイトに移動します（PR）
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
