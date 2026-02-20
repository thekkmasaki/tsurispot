import { TideAdvice, MazumeInfo } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sunrise, Sunset, Waves } from "lucide-react";

function getCurrentSeason(): "spring" | "summer" | "autumn" | "winter" {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

const SEASON_LABELS = {
  spring: "春 (3〜5月)",
  summer: "夏 (6〜8月)",
  autumn: "秋 (9〜11月)",
  winter: "冬 (12〜2月)",
} as const;

export function TideMazumeInfo({
  tideAdvice,
  mazumeInfo,
}: {
  tideAdvice?: TideAdvice;
  mazumeInfo?: MazumeInfo;
}) {
  if (!tideAdvice && !mazumeInfo) return null;

  const season = getCurrentSeason();

  const getSunrise = (info: MazumeInfo) => {
    switch (season) {
      case "spring": return info.springSunrise;
      case "summer": return info.summerSunrise;
      case "autumn": return info.autumnSunrise;
      case "winter": return info.winterSunrise;
    }
  };

  const getSunset = (info: MazumeInfo) => {
    switch (season) {
      case "spring": return info.springSunset;
      case "summer": return info.summerSunset;
      case "autumn": return info.autumnSunset;
      case "winter": return info.winterSunset;
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* マヅメ情報 */}
      {mazumeInfo && (
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-orange-50 to-amber-50 py-0">
          <CardContent className="p-3 sm:p-4">
            <h3 className="mb-2 text-xs font-bold text-orange-800 sm:mb-3 sm:text-sm">
              マヅメ時間帯（{SEASON_LABELS[season]}）
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* 朝マヅメ */}
              <div className="rounded-lg bg-white/80 p-2.5 sm:p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <Sunrise className="size-4 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-700 sm:text-sm">
                    朝マヅメ
                  </span>
                </div>
                <p className="text-base font-bold text-orange-900 sm:text-lg">
                  {getSunrise(mazumeInfo)}
                </p>
                <p className="mt-0.5 text-[10px] text-orange-600 sm:text-xs">
                  日の出前後 約1時間
                </p>
              </div>
              {/* 夕マヅメ */}
              <div className="rounded-lg bg-white/80 p-2.5 sm:p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <Sunset className="size-4 text-purple-500" />
                  <span className="text-xs font-semibold text-purple-700 sm:text-sm">
                    夕マヅメ
                  </span>
                </div>
                <p className="text-base font-bold text-purple-900 sm:text-lg">
                  {getSunset(mazumeInfo)}
                </p>
                <p className="mt-0.5 text-[10px] text-purple-600 sm:text-xs">
                  日没前後 約1時間
                </p>
              </div>
            </div>
            {mazumeInfo.tip && (
              <p className="mt-3 rounded-md bg-white/60 p-2 text-xs text-amber-800">
                {mazumeInfo.tip}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 潮汐アドバイス */}
      {tideAdvice && (
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-sky-50 to-cyan-50 py-0">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Waves className="size-4 text-sky-600" />
              <h3 className="text-sm font-bold text-sky-800">潮の影響</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-sky-600 text-xs hover:bg-sky-600">
                {tideAdvice.bestTide}
              </Badge>
              <span className="text-sm font-medium text-sky-700">
                {tideAdvice.bestTidePhase}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-sky-700">
              {tideAdvice.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
