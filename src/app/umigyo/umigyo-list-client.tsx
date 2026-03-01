"use client";

import { useState, useMemo } from "react";
import { Search, Award, MapPin, Filter, ChevronDown } from "lucide-react";
import type { UmigyoDistrict } from "@/lib/data/umigyo";

interface UmigyoListClientProps {
  districts: UmigyoDistrict[];
  prefectures: string[];
}

export function UmigyoListClient({ districts, prefectures }: UmigyoListClientProps) {
  const [query, setQuery] = useState("");
  const [selectedPrefecture, setSelectedPrefecture] = useState("");
  const [showModelOnly, setShowModelOnly] = useState(false);

  const filtered = useMemo(() => {
    return districts.filter((d) => {
      if (selectedPrefecture && d.prefecture !== selectedPrefecture) return false;
      if (showModelOnly && !d.isModelDistrict) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          d.portName.toLowerCase().includes(q) ||
          d.prefecture.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.activities.some((a) => a.toLowerCase().includes(q)) ||
          d.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [districts, query, selectedPrefecture, showModelOnly]);

  // 都道府県ごとにグルーピング
  const grouped = useMemo(() => {
    const map = new Map<string, UmigyoDistrict[]>();
    for (const d of filtered) {
      const arr = map.get(d.prefecture) || [];
      arr.push(d);
      map.set(d.prefecture, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      {/* 検索・フィルタ */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="地区名・都道府県・活動内容で検索..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-8 text-sm outline-none transition-colors focus:border-blue-400"
            >
              <option value="">全都道府県</option>
              {prefectures.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={() => setShowModelOnly(!showModelOnly)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              showModelOnly
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Award className="size-3.5" />
            モデル地区のみ
          </button>
          <span className="text-sm text-gray-500">
            {filtered.length}地区 表示中
          </span>
        </div>
      </div>

      {/* 地区一覧（都道府県グルーピング） */}
      {grouped.size === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">条件に一致する地区が見つかりません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([prefecture, items]) => (
            <div key={prefecture}>
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="size-4 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">{prefecture}</h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {items.length}地区
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((d) => (
                  <div
                    key={d.id}
                    className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
                      d.isModelDistrict
                        ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/30"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{d.portName}</h4>
                        <p className="text-xs text-gray-500">{d.city}</p>
                      </div>
                      {d.isModelDistrict && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          <Award className="size-3" />
                          モデル
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-xs leading-relaxed text-gray-600 line-clamp-3">
                      {d.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {d.activities.map((a) => (
                        <span
                          key={a}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            d.isModelDistrict
                              ? "bg-amber-100/70 text-amber-700"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
