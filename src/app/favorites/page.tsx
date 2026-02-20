"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Map, List } from "lucide-react";
import { SpotCard } from "@/components/spots/spot-card";
import { Button } from "@/components/ui/button";
import { fishingSpots } from "@/lib/data/spots";
import { getFavorites } from "@/components/spots/favorite-button";

export default function FavoritesPage() {
  const [favoritesSlugs, setFavoritesSlugs] = useState<string[]>([]);

  useEffect(() => {
    setFavoritesSlugs(getFavorites());

    const handleStorage = () => {
      setFavoritesSlugs(getFavorites());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const favoriteSpots = fishingSpots.filter((spot) =>
    favoritesSlugs.includes(spot.slug)
  );

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-5 sm:mb-8">
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl md:text-3xl">
          <Heart className="size-6 fill-red-500 text-red-500 sm:size-7" />
          お気に入りスポット
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
          お気に入りに登録した釣りスポット一覧
        </p>
      </div>

      {favoriteSpots.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {favoriteSpots.length}件のお気に入り
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {favoriteSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="mb-4 size-16 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            まだお気に入りがありません
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            気になる釣りスポットのハートアイコンをクリックして、お気に入りに追加しましょう
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/spots">
                <List className="mr-1 size-4" />
                スポット一覧を見る
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <Map className="mr-1 size-4" />
                地図で探す
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
