"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Fish, ChevronRight } from "lucide-react";
import { FishImage } from "@/components/ui/spot-image";

interface CarouselFish {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  category: "sea" | "freshwater" | "brackish";
  difficulty: "beginner" | "intermediate" | "advanced";
  isPeak: boolean;
  spotCount: number;
}

const DIFFICULTY_BADGE: Record<string, { label: string; className: string }> = {
  beginner: { label: "初心者", className: "bg-emerald-100 text-emerald-700" },
  intermediate: { label: "中級者", className: "bg-amber-100 text-amber-700" },
  advanced: { label: "上級者", className: "bg-red-100 text-red-700" },
};

export function CatchableNowCarousel({ fish }: { fish: CarouselFish[] }) {
  if (fish.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 sm:pt-10">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <Fish className="size-5 text-orange-500" />
          <h2 className="text-lg font-bold sm:text-xl">今釣れている魚</h2>
        </div>
        <Link
          href="/catchable-now"
          className="flex items-center gap-0.5 text-sm font-medium text-primary hover:text-primary/80"
        >
          もっと見る
          <ChevronRight className="size-4" />
        </Link>
      </div>
      <div className="relative">
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x snap-mandatory sm:-mx-0 sm:px-0">
          {fish.map((f) => {
            const diff = DIFFICULTY_BADGE[f.difficulty];
            return (
              <Link
                key={f.id}
                href={`/fish/${f.slug}`}
                className="w-40 shrink-0 snap-start overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md sm:w-44"
              >
                <div className="relative">
                  <FishImage
                    src={f.imageUrl}
                    alt={f.name}
                    category={f.category}
                  />
                  {f.isPeak && (
                    <div className="absolute top-2 left-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow">
                      旬
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-semibold">{f.name}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Badge className={`text-xs hover:opacity-100 ${diff.className}`}>
                      {diff.label}
                    </Badge>
                    {f.spotCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {f.spotCount}スポット
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" />
      </div>
    </section>
  );
}
