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

// JST基準の日付キー14日分（"YYYY-MM-DD"）。SSR/クライアントどちらで実行されてもJSTで揃える
function buildDayKeys(): string[] {
  const fmt = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" });
  const now = Date.now();
  const keys: string[] = [];
  for (let i = 0; i < 14; i++) {
    keys.push(fmt.format(new Date(now + i * 86400000)));
  }
  return keys;
}

function keyMonth(key: string): number {
  return Number(key.slice(5, 7));
}
function keyDay(key: string): number {
  return Number(key.slice(8, 10));
}
function keyDow(key: string): number {
  // 12:00 JST = 03:00 UTC の同日なので getUTCDay で JST の曜日が取れる
  return new Date(`${key}T12:00:00+09:00`).getUTCDay();
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
  const H = 280;
  const PAD_L = 44;
  const PAD_R = 12;
  const PAD_T = 30; // 満潮ラベル（点の上8px+文字高）が枠内に収まる余白
  const PAD_B = 42; // 干潮ラベル（点の下18px）と時刻軸ラベルが重ならない余白
  // レンジは毎時24点に加え満干の極値（毎時サンプルの範囲外に出る）も含める
  const extremes = [...day.hi, ...day.lo].map(([, cm]) => cm);
  const min = Math.min(...hourly, ...extremes);
  const max = Math.max(...hourly, ...extremes);
  const span = Math.max(max - min, 40); // 潮差が小さい日でも潰れないように最小レンジ
  const yOf = (cm: number) =>
    PAD_T + (H - PAD_T - PAD_B) * (1 - (cm - min) / span);
  // 0〜24時スケール（満干は23時台まで取り得るため /23 だと右端からはみ出す）
  const xOf = (hour: number) => PAD_L + ((W - PAD_L - PAD_R) * hour) / 24;

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
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
          <text key={h} x={xOf(h)} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748b">
            {h}
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
  // 日付はマウント後にクライアントで確定させる（SSGの焼き込み時刻と閲覧時刻のズレによる
  // hydration不一致・古い「今日」の表示を避ける。SEO用の実コンテンツはサーバー側の
  // 7日間テーブルが担う）
  const [dayKeys, setDayKeys] = useState<string[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tideDays, setTideDays] = useState<Record<string, TideDay> | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    setDayKeys(buildDayKeys());
  }, []);

  useEffect(() => {
    // 地点間のソフトナビゲーション（/tides/A → /tides/B）ではコンポーネントが再マウント
    // されず state が残るため、code が変わったら前地点のデータを必ず破棄する
    setTideDays(null);
    setFetchFailed(false);
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

  if (!dayKeys) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-12 rounded bg-muted" />
        <div className="h-72 rounded bg-muted" />
      </div>
    );
  }

  const dateKey = dayKeys[Math.min(selectedIndex, dayKeys.length - 1)];
  const phase = getTideTypeFromMoonAge(getMoonAgeJST(dateKey));
  const day = tideDays?.[dateKey] ?? null;
  const isToday = selectedIndex === 0;

  return (
    <div className="space-y-4">
      {/* 日付セレクター（14日間） */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
        {dayKeys.map((key, i) => {
          const dow = keyDow(key);
          const isSelected = i === selectedIndex;
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
                {i === 0 ? "今日" : `${keyMonth(key)}/${keyDay(key)}(${DAY_LABELS[dow]})`}
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
            {keyMonth(dateKey)}月{keyDay(dateKey)}日（{DAY_LABELS[keyDow(dateKey)]}）の{name}の潮
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
          ) : fetchFailed ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              潮汐データの読み込みに失敗しました。通信環境をご確認のうえ、ページを再読み込みしてください。
            </p>
          ) : tideDays ? (
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
