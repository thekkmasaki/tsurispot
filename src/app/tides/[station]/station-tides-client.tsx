"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Moon, Waves } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getMoonAgeJST, getTideTypeFromMoonAge } from "@/lib/tide/moon";
import type { TideDay } from "@/lib/tide/tide-data";

interface StationTidesClientProps {
  code: string;
  name: string;
}

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

// ローカル日付 → "YYYY-MM-DD"（クライアント実行なので日本のユーザーは実質JST）
function fmtDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tideTypeColor(tideType: string): string {
  switch (tideType) {
    case "大潮":
      return "bg-orange-500 text-white hover:bg-orange-500";
    case "中潮":
      return "bg-blue-500 text-white hover:bg-blue-500";
    case "小潮":
      return "bg-teal-500 text-white hover:bg-teal-500";
    case "長潮":
      return "bg-slate-500 text-white hover:bg-slate-500";
    case "若潮":
      return "bg-violet-500 text-white hover:bg-violet-500";
    default:
      return "bg-gray-500 text-white hover:bg-gray-500";
  }
}

/** 毎時潮位（cm）の実データ曲線グラフ。満干マーカーと今日の現在時刻ラインつき */
function TideCurve({ day, isToday }: { day: TideDay; isToday: boolean }) {
  const hourly = day.hourly;
  if (!hourly || hourly.length < 24) return null;

  const W = 720;
  const H = 260;
  const PAD_L = 44;
  const PAD_R = 12;
  const PAD_T = 16;
  const PAD_B = 28;
  const min = Math.min(...hourly);
  const max = Math.max(...hourly);
  const span = Math.max(max - min, 40); // 潮差が小さい日でも潰れないように最小レンジ
  const yOf = (cm: number) =>
    PAD_T + (H - PAD_T - PAD_B) * (1 - (cm - min) / span);
  const xOf = (hour: number) =>
    PAD_L + ((W - PAD_L - PAD_R) * hour) / 23;

  const path = hourly
    .map((cm, h) => `${h === 0 ? "M" : "L"}${xOf(h).toFixed(1)},${yOf(cm).toFixed(1)}`)
    .join(" ");

  const timeToHour = (t: string) =>
    Number(t.slice(0, 2)) + Number(t.slice(3, 5)) / 60;
  const nowHour = isToday
    ? new Date().getHours() + new Date().getMinutes() / 60
    : null;

  // Y軸目盛（4分割）
  const ticks = [0, 1, 2, 3, 4].map((i) => Math.round(min + (span * i) / 4));

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="min-w-[560px] w-full"
        role="img"
        aria-label="潮位グラフ（cm）"
      >
        {ticks.map((cm) => (
          <g key={cm}>
            <line
              x1={PAD_L}
              y1={yOf(cm)}
              x2={W - PAD_R}
              y2={yOf(cm)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text x={PAD_L - 6} y={yOf(cm) + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {cm}
            </text>
          </g>
        ))}
        {[0, 3, 6, 9, 12, 15, 18, 21].map((h) => (
          <text key={h} x={xOf(h)} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748b">
            {h}時
          </text>
        ))}
        <path d={path} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
        {day.hi.map(([t, cm]) => (
          <g key={`hi-${t}`}>
            <circle cx={xOf(timeToHour(t))} cy={yOf(cm)} r="4" fill="#0369a1" />
            <text x={xOf(timeToHour(t))} y={yOf(cm) - 8} textAnchor="middle" fontSize="11" fill="#0369a1" fontWeight="bold">
              {t}
            </text>
          </g>
        ))}
        {day.lo.map(([t, cm]) => (
          <g key={`lo-${t}`}>
            <circle cx={xOf(timeToHour(t))} cy={yOf(cm)} r="4" fill="#64748b" />
            <text x={xOf(timeToHour(t))} y={yOf(cm) + 18} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="bold">
              {t}
            </text>
          </g>
        ))}
        {nowHour !== null && (
          <line
            x1={xOf(nowHour)}
            y1={PAD_T}
            x2={xOf(nowHour)}
            y2={H - PAD_B}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}
      </svg>
    </div>
  );
}

export function StationTidesClient({ code, name }: StationTidesClientProps) {
  const [days] = useState(() => {
    const list: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push(d);
    }
    return list;
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tideDays, setTideDays] = useState<Record<string, TideDay> | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/tide/${code}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        if (json?.days) setTideDays(json.days as Record<string, TideDay>);
        else setFetchFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const selectedDate = days[selectedIndex];
  const dateKey = fmtDateKey(selectedDate);
  const phase = getTideTypeFromMoonAge(getMoonAgeJST(dateKey));
  const day = tideDays?.[dateKey] ?? null;
  const isToday = selectedIndex === 0;

  return (
    <div className="space-y-4">
      {/* 日付セレクター（14日間） */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
        {days.map((d, i) => {
          const dow = d.getDay();
          const isSelected = i === selectedIndex;
          const key = fmtDateKey(d);
          const p = getTideTypeFromMoonAge(getMoonAgeJST(key));
          return (
            <button
              key={key}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center rounded-lg px-2 py-1.5 min-w-[52px] border transition-colors",
                isSelected ? "border-sky-600 bg-sky-600 text-white" : "border-transparent bg-muted hover:bg-muted/70",
                !isSelected && dow === 6 && "text-blue-600",
                !isSelected && dow === 0 && "text-red-600",
              )}
            >
              <span className="text-[10px] leading-tight">
                {i === 0 ? "今日" : `${d.getMonth() + 1}/${d.getDate()}(${DAY_LABELS[dow]})`}
              </span>
              <span className={cn("text-[10px] font-medium leading-tight", isSelected ? "text-white/90" : "text-muted-foreground")}>
                {p.tideType}
              </span>
            </button>
          );
        })}
      </div>

      {/* 潮回り・月齢 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <Waves className="h-5 w-5 text-sky-600" />
            {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日（{DAY_LABELS[selectedDate.getDay()]}）の{name}の潮
            <Badge className={cn("text-sm", tideTypeColor(phase.tideType))}>{phase.tideType}</Badge>
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <Moon className="h-3.5 w-3.5" />
              月齢 {phase.moonAge.toFixed(1)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {day ? (
            <>
              {day.hourly && day.hourly.length >= 24 && <TideCurve day={day} isToday={isToday} />}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                  <div className="mb-1 flex items-center gap-1 text-sm font-bold text-sky-800">
                    <ArrowUp className="h-4 w-4" />
                    満潮
                  </div>
                  {day.hi.length > 0 ? (
                    <ul className="space-y-0.5 text-sm text-sky-900">
                      {day.hi.map(([t, cm]) => (
                        <li key={t} className="flex justify-between tabular-nums">
                          <span>{t}</span>
                          <span>{cm}cm</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">この日は満潮の記載がありません</p>
                  )}
                </div>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <div className="mb-1 flex items-center gap-1 text-sm font-bold text-slate-700">
                    <ArrowDown className="h-4 w-4" />
                    干潮
                  </div>
                  {day.lo.length > 0 ? (
                    <ul className="space-y-0.5 text-sm text-slate-800">
                      {day.lo.map(([t, cm]) => (
                        <li key={t} className="flex justify-between tabular-nums">
                          <span>{t}</span>
                          <span>{cm}cm</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">この日は干潮の記載がありません</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{phase.description}</p>
            </>
          ) : tideDays || fetchFailed ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              この日の潮汐データは準備中です（翌年分は毎年11月頃の気象庁公開後に反映されます）。
            </p>
          ) : (
            <div className="animate-pulse space-y-3 py-2">
              <div className="h-40 rounded bg-muted" />
              <div className="h-16 rounded bg-muted" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
