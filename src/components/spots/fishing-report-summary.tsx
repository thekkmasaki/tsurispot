"use client";

import { useState, useEffect } from "react";
import { Fish, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FishInfo {
  slug: string;
  name: string;
}

interface FishingReportSummaryProps {
  spotSlug: string;
  fishList: FishInfo[];
}

interface FishReport {
  fishSlug: string;
  fishName: string;
  dates: string[];
  lastDate: string | null;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDatesForFish(spotSlug: string, fishSlug: string): string[] {
  const key = `fish_like:${spotSlug}:${fishSlug}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    const ts = Number(raw);
    if (!isNaN(ts)) {
      const d = new Date(ts);
      return [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`];
    }
  }
  return [];
}

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** 直近14日のアクティビティドット */
function RecentDots({ dates }: { dates: string[] }) {
  const dots: { date: string; active: boolean }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dots.push({ date: key, active: dates.includes(key) });
  }
  return (
    <div className="flex items-center gap-0.5" title="直近14日間の釣果">
      {dots.map((dot) => (
        <div
          key={dot.date}
          className={`size-1.5 rounded-full ${
            dot.active ? "bg-blue-500" : "bg-gray-200"
          }`}
          title={dot.active ? `${formatDate(dot.date)} 釣れた` : formatDate(dot.date)}
        />
      ))}
    </div>
  );
}

export function FishingReportSummary({ spotSlug, fishList }: FishingReportSummaryProps) {
  const [reports, setReports] = useState<FishReport[]>([]);

  useEffect(() => {
    const data: FishReport[] = fishList
      .map((f) => {
        const dates = getDatesForFish(spotSlug, f.slug);
        return {
          fishSlug: f.slug,
          fishName: f.name,
          dates,
          lastDate: dates.length > 0 ? dates[dates.length - 1] : null,
        };
      })
      .filter((r) => r.dates.length > 0);
    setReports(data);
  }, [spotSlug, fishList]);

  if (reports.length === 0) return null;

  const totalReports = reports.reduce((sum, r) => sum + r.dates.length, 0);
  const todayStr = getTodayStr();
  const todayCount = reports.filter((r) => r.dates.includes(todayStr)).length;

  return (
    <Card className="border-blue-200 bg-blue-50/50 py-3">
      <CardContent className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800">
            <TrendingUp className="size-4" />
            あなたの釣果記録
          </h3>
          <div className="flex items-center gap-3 text-[10px] text-blue-600">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              累計 {totalReports}回
            </span>
            {todayCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium">
                今日 {todayCount}種
              </span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {reports.map((r) => (
            <div
              key={r.fishSlug}
              className="flex items-center justify-between gap-2 rounded-md bg-white/80 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Fish className="size-3.5 shrink-0 text-blue-500" />
                <span className="truncate text-xs font-medium">{r.fishName}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {r.dates.length}回
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <RecentDots dates={r.dates} />
                {r.lastDate && (
                  <span className="text-[10px] text-muted-foreground">
                    最新 {formatDate(r.lastDate)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-blue-600/60">
          ※ データはこのブラウザに保存されています
        </p>
      </CardContent>
    </Card>
  );
}
