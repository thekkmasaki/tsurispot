import type { MetadataRoute } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { regions } from "@/lib/data/regions";
import { prefectures } from "@/lib/data/prefectures";
import { areaGuides } from "@/lib/data/area-guides";
import { monthlyGuides } from "@/lib/data/monthly-guides";

const baseUrl = "https://tsurispot.com";

// カテゴリID: 0=static+guides, 1=spots, 2=fish, 3=prefectures+areas
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 0: 固定ページ + ガイド系
  if (id === 0) {
    return [
      { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/spots`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/fish`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/catchable-now`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${baseUrl}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/setup`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/knots`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/sabiki`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/casting`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/beginner`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guide/choinage`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/anazuri`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guide/oyogase`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/seasonal`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/beginner-checklist`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/fishing-rules`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/sabiki`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/rod-beginner`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/gear/tackle-box`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/methods/sabiki`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/ajing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/eging`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/mebaring`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/shore-jigging`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/choi-nage`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/uki-zuri`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/methods/ana-zuri`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/fishing-calendar`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      { url: `${baseUrl}/safety`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/recommendation`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/tides`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
      { url: `${baseUrl}/ranking`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/bouzu-checker`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
      { url: `${baseUrl}/partner`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
      { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
      { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
      // エリアガイド
      { url: `${baseUrl}/area-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
      ...areaGuides.map((guide) => ({
        url: `${baseUrl}/area-guide/${guide.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      // 月別ガイド
      { url: `${baseUrl}/monthly`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
      ...monthlyGuides.map((guide) => ({
        url: `${baseUrl}/monthly/${guide.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  }

  // 1: スポット詳細ページ
  if (id === 1) {
    return fishingSpots.map((spot) => ({
      url: `${baseUrl}/spots/${spot.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  // 2: 魚種詳細ページ
  if (id === 2) {
    return fishSpecies.map((fish) => ({
      url: `${baseUrl}/fish/${fish.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  }

  // 3: 都道府県・エリアページ
  return [
    { url: `${baseUrl}/prefecture`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    ...prefectures.map((pref) => ({
      url: `${baseUrl}/prefecture/${pref.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${baseUrl}/area`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    ...regions.map((region) => ({
      url: `${baseUrl}/area/${region.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
