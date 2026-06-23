import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFavorites } from "@/lib/user-store";
import { getSpotBySlug } from "@/lib/data/spots";
import { getMoonAge, getTideInfo } from "@/lib/weather/calculations";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const today = new Date();
  const moonAge = getMoonAge(today);
  const slugs = await getUserFavorites(userId);

  if (slugs.length === 0) {
    return NextResponse.json({
      items: [],
      moonAge,
      date: today.toISOString().slice(0, 10),
    });
  }

  const items = slugs
    .slice(0, 20)
    .map((slug) => {
      const spot = getSpotBySlug(slug);
      if (!spot) return null;
      const lng = spot.longitude ?? 135;
      const tide = getTideInfo(moonAge, lng);
      return {
        slug: spot.slug,
        name: spot.name,
        prefecture: spot.region?.prefecture ?? "",
        spotType: spot.spotType,
        tideLabel: tide.tideLabel,
        tideType: tide.tideType,
        fishingScore: tide.fishingScore,
        highTides: tide.highTides,
        lowTides: tide.lowTides,
        description: tide.description,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.fishingScore - a.fishingScore);

  return NextResponse.json({
    items,
    moonAge,
    date: today.toISOString().slice(0, 10),
  });
}
