import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFavorites } from "@/lib/user-store";
import { getSpotBySlug } from "@/lib/data/spots";
import { todayJST } from "@/lib/activity";
import { getMoonAgeJST } from "@/lib/tide/moon";
import { getTideDisplayMode, getTideStationForSpot } from "@/lib/tide/nearest-station";
import { getTideInfoForDate } from "@/lib/tide/tide-info";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // サーバー(App Runner)はUTCなので「今日」は必ずJSTで決める
  const dateStr = todayJST();
  const moonAge = getMoonAgeJST(dateStr);
  const slugs = await getUserFavorites(userId);

  if (slugs.length === 0) {
    return NextResponse.json({ items: [], moonAge, date: dateStr });
  }

  const items = slugs
    .slice(0, 20)
    .map((slug) => {
      const spot = getSpotBySlug(slug);
      if (!spot) return null;
      const tideMode = getTideDisplayMode(spot);
      const station = getTideStationForSpot(spot);
      // 満干時刻は最寄り観測地点の気象庁 潮位表データ（淡水は潮回りのみ）
      const tide = getTideInfoForDate(
        tideMode === "full" ? (station?.code ?? null) : null,
        dateStr,
      );
      return {
        slug: spot.slug,
        name: spot.name,
        prefecture: spot.region?.prefecture ?? "",
        spotType: spot.spotType,
        tideMode,
        stationName: station?.name ?? null,
        tideLabel: tide.tideLabel,
        tideType: tide.tideType,
        fishingScore: tide.fishingScore,
        highTides: tide.highTides,
        lowTides: tide.lowTides,
        description: tide.description,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    // 潮汐が無関係な淡水スポット（tideMode=none）は潮ベースの好機度で並べず末尾へ
    .sort((a, b) => {
      const rank = (x: { tideMode: string; fishingScore: number }) =>
        x.tideMode === "none" ? -1 : x.fishingScore;
      return rank(b) - rank(a);
    });

  return NextResponse.json({ items, moonAge, date: dateStr });
}
