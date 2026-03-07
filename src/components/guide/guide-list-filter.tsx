"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GuideItem {
  href: string;
  title: string;
  description: string;
  iconName: string;
  category: "beginner" | "method" | "scene";
}

const categoryLabels = {
  all: { label: "すべて", color: "" },
  beginner: { label: "入門", color: "bg-green-100 text-green-800" },
  method: { label: "釣り方別", color: "bg-blue-100 text-blue-800" },
  scene: { label: "シーン別", color: "bg-purple-100 text-purple-800" },
} as const;

type FilterKey = keyof typeof categoryLabels;

interface GuideListFilterProps {
  guides: GuideItem[];
}

export function GuideListFilter({ guides }: GuideListFilterProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return guides;
    return guides.filter((g) => g.category === filter);
  }, [guides, filter]);

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        {(Object.entries(categoryLabels) as [FilterKey, typeof categoryLabels[FilterKey]][]).map(
          ([key, { label, color }]) => {
            const count = key === "all" ? guides.length : guides.filter((g) => g.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                  filter === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : key === "all"
                    ? "bg-background text-muted-foreground hover:bg-muted border"
                    : `${color} hover:opacity-80`
                }`}
              >
                {label}({count})
              </button>
            );
          }
        )}
      </div>

      {/* Guide cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((guide) => (
          <Link key={guide.href} href={guide.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ChevronRight className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-medium text-foreground group-hover:text-primary">
                      {guide.title}
                    </p>
                  </div>
                  <div className="mb-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        categoryLabels[guide.category]?.color || ""
                      }`}
                    >
                      {categoryLabels[guide.category]?.label || ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {guide.description}
                  </p>
                </div>
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
