"use client";

import { Trophy, Ruler } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PersonalBestCardProps {
  maxByFish: Record<string, number>;
}

export function PersonalBestCard({ maxByFish }: PersonalBestCardProps) {
  const entries = Object.entries(maxByFish)
    .filter(([, size]) => typeof size === "number" && size > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span className="font-medium">魚種別 自己ベスト</span>
          <span className="text-xs text-muted-foreground">
            ({entries.length}種)
          </span>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            釣果を投稿すると、魚種別の自己ベストサイズが自動で記録されます。
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map(([fish, size]) => (
              <li
                key={fish}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{fish}</span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Ruler className="h-3.5 w-3.5" />
                  {size}cm
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
