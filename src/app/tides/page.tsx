"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Moon,
  Waves,
  Clock,
  Info,
  Fish,
  Sun,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- 潮汐計算ロジック ---

/** 月齢を計算（既知の新月基準） */
function getMoonAge(date: Date): number {
  const knownNewMoon = new Date(2024, 0, 11); // 2024年1月11日は新月
  const diffDays =
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  return ((diffDays % 29.53) + 29.53) % 29.53;
}

/** 潮回りを判定 */
function getTideType(
  moonAge: number
): "大潮" | "中潮" | "小潮" | "長潮" | "若潮" {
  if (moonAge < 2 || (moonAge >= 13.5 && moonAge < 16.5)) return "大潮";
  if (
    (moonAge >= 2 && moonAge < 5) ||
    (moonAge >= 10 && moonAge < 13.5) ||
    (moonAge >= 16.5 && moonAge < 20) ||
    (moonAge >= 25 && moonAge < 28)
  )
    return "中潮";
  if ((moonAge >= 5 && moonAge < 8) || (moonAge >= 20 && moonAge < 23))
    return "小潮";
  if ((moonAge >= 8 && moonAge < 9) || (moonAge >= 23 && moonAge < 24))
    return "長潮";
  if ((moonAge >= 9 && moonAge < 10) || (moonAge >= 24 && moonAge < 25))
    return "若潮";
  return "中潮";
}

/** 潮位を計算（0-100の相対値） */
function getTideHeight(hour: number, moonAge: number): number {
  const phase = (moonAge / 29.53) * 2 * Math.PI;
  const hourRad = (hour / 12.42) * 2 * Math.PI; // 半日周潮の周期
  const amplitude = 0.7 + 0.3 * Math.cos(phase);
  const mainTide = 40 * amplitude * Math.cos(hourRad + phase / 2);
  const subTide = 8 * Math.cos((hour / 23.93) * 2 * Math.PI + phase * 0.7);
  return Math.max(2, Math.min(98, 50 + mainTide + subTide));
}

/** 満潮・干潮を検出 */
interface TideExtreme {
  type: "満潮" | "干潮";
  hour: number;
  minute: number;
  height: number;
  timeStr: string;
}

function findTideExtremes(moonAge: number): TideExtreme[] {
  const points: { hour: number; height: number }[] = [];
  for (let m = 0; m < 1440; m += 1) {
    points.push({ hour: m / 60, height: getTideHeight(m / 60, moonAge) });
  }

  const extremes: TideExtreme[] = [];
  for (let i = 10; i < points.length - 10; i++) {
    const prev = points[i - 1].height;
    const curr = points[i].height;
    const next = points[i + 1].height;

    if (curr > prev && curr > next && curr > 55) {
      const h = Math.floor(points[i].hour);
      const min = Math.round((points[i].hour - h) * 60);
      extremes.push({
        type: "満潮",
        hour: h,
        minute: min,
        height: Math.round(curr),
        timeStr: `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
      });
    } else if (curr < prev && curr < next && curr < 45) {
      const h = Math.floor(points[i].hour);
      const min = Math.round((points[i].hour - h) * 60);
      extremes.push({
        type: "干潮",
        hour: h,
        minute: min,
        height: Math.round(curr),
        timeStr: `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
      });
    }
  }

  // 近接する同型の極値を統合（最も極端な値を採用）
  const merged: TideExtreme[] = [];
  for (const ext of extremes) {
    const last = merged[merged.length - 1];
    if (last && last.type === ext.type && ext.hour - last.hour < 2) {
      if (
        (ext.type === "満潮" && ext.height > last.height) ||
        (ext.type === "干潮" && ext.height < last.height)
      ) {
        merged[merged.length - 1] = ext;
      }
    } else {
      merged.push(ext);
    }
  }

  return merged;
}

/** 潮回りの色を返す */
function getTideTypeColor(type: string): string {
  switch (type) {
    case "大潮":
      return "bg-orange-500 text-white hover:bg-orange-600";
    case "中潮":
      return "bg-blue-500 text-white hover:bg-blue-600";
    case "小潮":
      return "bg-gray-500 text-white hover:bg-gray-600";
    case "長潮":
    case "若潮":
      return "bg-emerald-500 text-white hover:bg-emerald-600";
    default:
      return "bg-gray-500 text-white hover:bg-gray-600";
  }
}

/** 釣りやすさ情報 */
function getFishingAdvice(tideType: string): {
  label: string;
  rating: number;
  color: string;
  description: string;
} {
  switch (tideType) {
    case "大潮":
      return {
        label: "最適",
        rating: 5,
        color: "text-orange-600",
        description:
          "潮の動きが最も大きく、魚の活性が高まりやすい日。回遊魚を狙うなら絶好のチャンス。潮が動く時間帯（上げ3〜7分、下げ3〜7分）を中心に狙いましょう。",
      };
    case "中潮":
      return {
        label: "良い",
        rating: 4,
        color: "text-blue-600",
        description:
          "適度な潮の動きがあり、安定して釣れやすい日。どの釣り方でもチャンスがあります。満潮前後や潮の変わり目が狙い目。",
      };
    case "小潮":
      return {
        label: "普通",
        rating: 3,
        color: "text-gray-600",
        description:
          "潮の動きが小さい日。底物や根魚など、潮の影響を受けにくい魚が狙い目。じっくり粘る釣りに向いています。",
      };
    case "長潮":
      return {
        label: "やや厳しい",
        rating: 2,
        color: "text-emerald-600",
        description:
          "潮の動きが最も弱い日。魚の活性が低く難易度が上がります。エサの質や仕掛けの工夫で差が出る日。穴釣りや根魚狙いがおすすめ。",
      };
    case "若潮":
      return {
        label: "やや厳しい",
        rating: 2,
        color: "text-emerald-600",
        description:
          "長潮の翌日で、少しずつ潮が戻り始めます。徐々に活性が上がる傾向があるので、潮変わりのタイミングに集中しましょう。",
      };
    default:
      return {
        label: "普通",
        rating: 3,
        color: "text-gray-600",
        description: "",
      };
  }
}

/** 月相の絵文字的テキスト表現 */
function getMoonPhaseLabel(moonAge: number): string {
  if (moonAge < 1.85) return "新月";
  if (moonAge < 7.38) return "三日月（上弦へ）";
  if (moonAge < 9.23) return "上弦の月";
  if (moonAge < 13.69) return "十三夜（満月へ）";
  if (moonAge < 16.54) return "満月";
  if (moonAge < 22.07) return "十八夜（下弦へ）";
  if (moonAge < 23.92) return "下弦の月";
  return "二十六夜（新月へ）";
}

/** 日付フォーマット */
function formatDate(date: Date): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayOfWeek = days[date.getDay()];
  return `${m}月${d}日（${dayOfWeek}）`;
}

function formatDateFull(date: Date): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const dayOfWeek = days[date.getDay()];
  return `${y}年${m}月${d}日（${dayOfWeek}）`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// --- SVG 潮位グラフ ---

function TideChart({
  moonAge,
  isToday,
  currentHour,
}: {
  moonAge: number;
  isToday: boolean;
  currentHour: number;
}) {
  const width = 720;
  const height = 300;
  const padding = { top: 30, right: 20, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // 潮位データポイント生成
  const points: { x: number; y: number; hour: number; height: number }[] = [];
  for (let m = 0; m <= 1440; m += 6) {
    const hour = m / 60;
    const h = getTideHeight(hour, moonAge);
    const x = padding.left + (hour / 24) * chartW;
    const y = padding.top + chartH - (h / 100) * chartH;
    points.push({ x, y, hour, height: h });
  }

  // パスデータ
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} Z`;

  // 満潮・干潮マーカー
  const extremes = findTideExtremes(moonAge);

  // 現在時刻ライン
  const nowX = padding.left + (currentHour / 24) * chartW;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[480px]"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Y軸グリッド */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padding.top + chartH - (v / 100) * chartH;
          return (
            <g key={v}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-gray-400"
              >
                {v}%
              </text>
            </g>
          );
        })}

        {/* X軸（時間）ラベル */}
        {Array.from({ length: 9 }, (_, i) => i * 3).map((h) => {
          const x = padding.left + (h / 24) * chartW;
          return (
            <g key={h}>
              <line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={padding.top + chartH}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={x}
                y={padding.top + chartH + 20}
                textAnchor="middle"
                className="text-[11px] fill-gray-500"
              >
                {h}時
              </text>
            </g>
          );
        })}

        {/* 塗りつぶしエリア */}
        <path d={areaPath} fill="url(#tideGrad)" />

        {/* 潮位曲線 */}
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 満潮・干潮マーカー */}
        {extremes.map((ext, i) => {
          const x =
            padding.left + ((ext.hour + ext.minute / 60) / 24) * chartW;
          const y = padding.top + chartH - (ext.height / 100) * chartH;
          const isHigh = ext.type === "満潮";
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill={isHigh ? "#ef4444" : "#3b82f6"}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={x}
                y={isHigh ? y - 14 : y + 20}
                textAnchor="middle"
                className="text-[10px] font-semibold"
                fill={isHigh ? "#ef4444" : "#3b82f6"}
              >
                {ext.type}
              </text>
              <text
                x={x}
                y={isHigh ? y - 4 : y + 30}
                textAnchor="middle"
                className="text-[9px]"
                fill={isHigh ? "#ef4444" : "#3b82f6"}
              >
                {ext.timeStr}
              </text>
            </g>
          );
        })}

        {/* 現在時刻インジケーター（今日のみ） */}
        {isToday && (
          <g>
            <line
              x1={nowX}
              y1={padding.top}
              x2={nowX}
              y2={padding.top + chartH}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x={nowX}
              y={padding.top - 6}
              textAnchor="middle"
              className="text-[9px] font-bold fill-red-500"
            >
              現在
            </text>
          </g>
        )}

        {/* 軸枠 */}
        <rect
          x={padding.left}
          y={padding.top}
          width={chartW}
          height={chartH}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

// --- メインページ ---

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "潮見表・潮汐情報",
      item: "https://tsurispot.com/tides",
    },
  ],
};

export default function TidesPage() {
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const navigateDate = useCallback((delta: number) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const isToday = isSameDay(selectedDate, today);

  const moonAge = useMemo(() => getMoonAge(selectedDate), [selectedDate]);
  const tideType = useMemo(() => getTideType(moonAge), [moonAge]);
  const extremes = useMemo(() => findTideExtremes(moonAge), [moonAge]);
  const fishingAdvice = useMemo(() => getFishingAdvice(tideType), [tideType]);
  const moonPhaseLabel = useMemo(() => getMoonPhaseLabel(moonAge), [moonAge]);
  const currentHour = today.getHours() + today.getMinutes() / 60;

  // ±7日の潮回りカレンダー
  const weekDays = useMemo(() => {
    const days: { date: Date; tideType: string; isSelected: boolean }[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + i);
      const ma = getMoonAge(d);
      days.push({
        date: d,
        tideType: getTideType(ma),
        isSelected: i === 0,
      });
    }
    return days;
  }, [selectedDate]);

  const highTides = extremes.filter((e) => e.type === "満潮");
  const lowTides = extremes.filter((e) => e.type === "干潮");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* ヘッダー */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">
                ホーム
              </Link>
              <ChevronRight className="size-3" />
              <span>潮見表</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Waves className="size-7 sm:size-8" />
              潮見表・潮汐情報
            </h1>
            <p className="mt-2 text-blue-100 text-sm sm:text-base">
              今日の潮回りと潮位グラフで、最適な釣り時間がわかります
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
          {/* 日付ナビゲーション */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate(-1)}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">前日</span>
                </Button>

                <div className="text-center">
                  <p className="text-lg sm:text-xl font-bold">
                    {formatDateFull(selectedDate)}
                  </p>
                  {!isToday && (
                    <button
                      onClick={goToToday}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      今日に戻る
                    </button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate(1)}
                  className="flex items-center gap-1"
                >
                  <span className="hidden sm:inline">翌日</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* ミニカレンダー */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((wd, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(new Date(wd.date))}
                    className={`rounded-lg p-1.5 text-center transition-all ${
                      wd.isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : isSameDay(wd.date, today)
                          ? "bg-blue-50 ring-1 ring-blue-300 hover:bg-blue-100"
                          : "hover:bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-[10px] ${wd.isSelected ? "text-blue-100" : "text-gray-500"}`}
                    >
                      {wd.date.getMonth() + 1}/{wd.date.getDate()}
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 font-medium ${
                        wd.isSelected ? "text-white" : ""
                      }`}
                    >
                      {wd.tideType}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 潮回り＋月齢情報 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="sm:col-span-1">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">潮回り</p>
                <Badge
                  className={`text-lg px-4 py-1.5 ${getTideTypeColor(tideType)}`}
                >
                  {tideType}
                </Badge>
              </CardContent>
            </Card>

            <Card className="sm:col-span-1">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">月齢</p>
                <div className="flex items-center justify-center gap-2">
                  <Moon className="size-5 text-yellow-500" />
                  <span className="text-lg font-bold">
                    {moonAge.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{moonPhaseLabel}</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-1">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">釣りやすさ</p>
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Fish
                      key={i}
                      className={`size-5 ${i < fishingAdvice.rating ? fishingAdvice.color : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <p className={`text-sm font-semibold mt-1 ${fishingAdvice.color}`}>
                  {fishingAdvice.label}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 潮位グラフ */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Waves className="size-5 text-blue-500" />
                潮位グラフ（24時間）
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <TideChart
                moonAge={moonAge}
                isToday={isToday}
                currentHour={currentHour}
              />
              <div className="flex flex-wrap items-center gap-4 mt-3 px-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-0.5 bg-blue-500 rounded" />
                  潮位曲線
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                  満潮
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                  干潮
                </div>
                {isToday && (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-4 h-0 border-t-2 border-dashed border-red-500" />
                    現在時刻
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 満潮・干潮テーブル */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUp className="size-5 text-red-500" />
                  満潮
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {highTides.length > 0 ? (
                  <div className="space-y-3">
                    {highTides.map((ht, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="size-4 text-red-400" />
                          <span className="font-bold text-lg">
                            {ht.timeStr}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-200">
                          {ht.height}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-3">
                    この日は顕著な満潮がありません
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowDown className="size-5 text-blue-500" />
                  干潮
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {lowTides.length > 0 ? (
                  <div className="space-y-3">
                    {lowTides.map((lt, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="size-4 text-blue-400" />
                          <span className="font-bold text-lg">
                            {lt.timeStr}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {lt.height}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-3">
                    この日は顕著な干潮がありません
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 釣りやすさ指標 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Fish className="size-5 text-green-500" />
                今日の釣りやすさ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Fish
                        key={i}
                        className={`size-4 ${i < fishingAdvice.rating ? fishingAdvice.color : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <Badge className={getTideTypeColor(tideType)}>
                    {tideType}
                  </Badge>
                </div>
                <div>
                  <p className={`font-semibold ${fishingAdvice.color}`}>
                    {fishingAdvice.label}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {fishingAdvice.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 潮汐と釣りのコツ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="size-5 text-amber-500" />
                潮汐と釣りのコツ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <h3 className="font-semibold text-sm text-orange-800">
                    上げ潮・下げ潮を意識する
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    干潮から満潮に向かう「上げ潮」と、満潮から干潮に向かう「下げ潮」。特に「上げ3分〜7分」「下げ3分〜7分」が魚の活性が高い時間帯です。潮が動いている時間を狙いましょう。
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h3 className="font-semibold text-sm text-blue-800">
                    潮止まりは休憩タイム
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    満潮・干潮のピーク前後は「潮止まり」と呼ばれ、潮が止まるため魚の活性が低下します。この時間は仕掛けの準備や休憩に充てるのが効率的です。
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <h3 className="font-semibold text-sm text-green-800">
                    大潮は回遊魚のチャンス
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    大潮は潮の流れが最も強く、プランクトンの移動に伴って小魚が集まり、それを追う回遊魚（アジ、サバ、イナダなど）の活性が上がります。サビキ釣りやルアーに最適。
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <h3 className="font-semibold text-sm text-purple-800">
                    小潮・長潮は根魚狙いで
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    潮の動きが小さい日は、流れに左右されにくい根魚（カサゴ、メバルなど）や底物がおすすめ。穴釣りやブラクリでテトラの隙間を丁寧に探りましょう。
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <h3 className="font-semibold text-sm text-amber-800">
                    マヅメ時＋潮の動きで最強
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    「朝マヅメ」「夕マヅメ」と潮が動くタイミングが重なると、最も釣れやすい条件になります。潮見表でこの重なりをチェックして、効率よく釣行計画を立てましょう。
                  </p>
                </div>
              </div>

              <div className="text-xs text-gray-400 p-2">
                ※ 本ページの潮汐データは月齢を基にした簡易計算です。実際の潮位は地形・気象条件により異なります。正確な情報は気象庁の潮位表をご確認ください。
              </div>
            </CardContent>
          </Card>

          {/* 関連ページリンク */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
            <Link href="/recommendation">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2.5">
                    <Sun className="size-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      今日のおすすめスポット
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      潮回りも考慮した最適な釣り場を提案
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/spots">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2.5">
                    <Calendar className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">釣りスポット一覧</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      全国の人気釣り場をチェック
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-gray-400 ml-auto" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
