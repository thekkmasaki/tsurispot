import { NextResponse } from "next/server";
import { getCatchableNow } from "@/lib/data/fish";

export const dynamic = "force-static";

export function GET() {
  const currentMonth = new Date().getMonth() + 1;
  const fish = getCatchableNow(currentMonth);

  const light = fish.map((f) => ({
    id: f.id,
    name: f.name,
    slug: f.slug,
    category: f.category,
    difficulty: f.difficulty,
    description: f.description,
    imageUrl: f.imageUrl,
    peakMonths: f.peakMonths,
    seasonMonths: f.seasonMonths,
    isPoisonous: f.isPoisonous ?? false,
    poisonType: f.poisonType,
    dangerLevel: f.dangerLevel,
  }));

  return NextResponse.json(
    { currentMonth, fish: light },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    },
  );
}
