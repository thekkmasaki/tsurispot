"use client";

import { useState, useMemo } from "react";
import { Search, CalendarCheck, Fish as FishIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FishCard } from "@/components/fish/fish-card";
import { DIFFICULTY_LABELS } from "@/types";
import type { FishSpecies } from "@/types";

// 釣れやすい順ソート（難易度→スポット数→人気順）
function sortByEase<
  T extends { difficulty: string; popularity?: number; spots: unknown[] },
>(list: T[]): T[] {
  const diffOrder: Record<string, number> = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
  };
  return [...list].sort((a, b) => {
    const dDiff =
      (diffOrder[a.difficulty] ?? 2) - (diffOrder[b.difficulty] ?? 2);
    if (dDiff !== 0) return dDiff;
    const spotDiff = (b.spots?.length ?? 0) - (a.spots?.length ?? 0);
    if (spotDiff !== 0) return spotDiff;
    return (a.popularity ?? 999) - (b.popularity ?? 999);
  });
}

const CATEGORY_CONFIG = {
  sea: { label: "海水魚", color: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
  brackish: {
    label: "汽水魚",
    color: "bg-teal-100 text-teal-700 hover:bg-teal-200",
  },
  freshwater: {
    label: "淡水魚",
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
} as const;

type Category = keyof typeof CATEGORY_CONFIG;
type Difficulty = "beginner" | "intermediate" | "advanced";

// --- 釣りカテゴリ（サブカテゴリ）マッピング ---
type FishingCategory = "rockfish" | "pelagic" | "flatfish" | "migratory" | "shore" | "freshwater_sub" | "squid_octopus";

const FISHING_CATEGORY_CONFIG: Record<FishingCategory, { label: string; color: string }> = {
  rockfish: { label: "根魚・ロックフィッシュ", color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  pelagic: { label: "青物", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  flatfish: { label: "フラットフィッシュ", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  migratory: { label: "回遊魚", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
  shore: { label: "堤防・磯魚", color: "bg-teal-100 text-teal-700 hover:bg-teal-200" },
  freshwater_sub: { label: "淡水魚", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  squid_octopus: { label: "イカ・タコ・甲殻類", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
};

// slugベースのマッピング（日本語キーの文字化け問題を回避）
const FISHING_CATEGORY_MAP: Record<string, FishingCategory> = {
  // 根魚・ロックフィッシュ
  mebaru: "rockfish",
  kasago: "rockfish",
  ainame: "rockfish",
  kurosoi: "rockfish",
  kijihata: "rockfish",
  akahata: "rockfish",
  mahata: "rockfish",
  oomonhata: "rockfish",
  kue: "rockfish",
  onikasago: "rockfish",
  hokke: "rockfish",
  hatahata: "rockfish",
  kawahagi: "rockfish",
  kobudai: "rockfish",
  sujiara: "rockfish",
  // 青物
  buri: "pelagic",
  inada: "pelagic",
  kanpachi: "pelagic",
  hiramasa: "pelagic",
  sawara: "pelagic",
  shiira: "pelagic",
  soudagatuo: "pelagic",
  katsuo: "pelagic",
  rouninaji: "pelagic", // 旧slug互換
  shimaaji: "pelagic",
  // フラットフィッシュ
  hirame: "flatfish",
  magochi: "flatfish",
  karei: "flatfish",
  megochi: "flatfish",
  // 回遊魚
  aji: "migratory",
  saba: "migratory",
  iwashi: "migratory",
  sayori: "migratory",
  tachiuo: "migratory",
  kamasu: "migratory",
  konoshiro: "migratory",
  kisu: "migratory",
  ishimochi: "migratory",
  // 淡水魚
  ayu: "freshwater_sub",
  yamame: "freshwater_sub",
  iwana: "freshwater_sub",
  nijimasu: "freshwater_sub",
  blackbass: "freshwater_sub",
  bluegill: "freshwater_sub",
  herabuna: "freshwater_sub",
  mabuna: "freshwater_sub",
  koi: "freshwater_sub",
  namazu: "freshwater_sub",
  wakasagi: "freshwater_sub",
  amago: "freshwater_sub",
  oikawa: "freshwater_sub",
  ugui: "freshwater_sub",
  kawamutsu: "freshwater_sub",
  tanago: "freshwater_sub",
  dojou: "freshwater_sub",
  raigyo: "freshwater_sub",
  hasu: "freshwater_sub",
  itou: "freshwater_sub",
  biwako_oonamazu: "freshwater_sub", // 旧slug互換
  biwamasu: "freshwater_sub",
  himemasu: "freshwater_sub",
  browntrout: "freshwater_sub", // 旧slug互換
  "brown-trout": "freshwater_sub",
  "biwako-oonamazu": "freshwater_sub",
  unagi: "freshwater_sub",
  sakuramasu: "freshwater_sub",
  tenagaebi: "freshwater_sub",
  // 堤防・磯魚
  kurodai: "shore",
  mejina: "shore",
  suzumedai: "shore",
  nenbutsudai: "shore",
  bora: "shore",
  haze: "shore",
  mahaze: "shore",
  shirogisu: "shore",
  bera: "shore",
  umitanago: "shore",
  hiiragi: "shore",
  fugu: "shore",
  kusafugu: "shore",
  haokoze: "shore",
  aigo: "shore",
  ishidai: "shore",
  shimadai: "shore",
  gure: "shore",
  chinu: "shore",
  madai: "shore",
  hedai: "shore",
  akaei: "shore",
  gonzui: "shore",
  oniokoze: "shore",
  seigo: "shore",
  seabass: "shore",
  // イカ・タコ・甲殻類
  aoriika: "squid_octopus",
  yariika: "squid_octopus",
  surumeika: "squid_octopus",
  kouika: "squid_octopus",
  "kensaki-ika": "squid_octopus",
  madako: "squid_octopus",
  iidako: "squid_octopus",
  watarigani: "squid_octopus",
  nokogirigazami: "squid_octopus",
  // 追加の堤防・磯魚
  anago: "shore",
  utsubo: "shore",
  eso: "shore",
  houbou: "shore",
  dochizame: "shore",
  nekozame: "shore",
  hoshizame: "shore",
  koshoudai: "shore",
  akame: "shore",
  hirasuzuki: "shore",
  taman: "shore",
  oonibe: "shore",
  kibire: "shore",
  // 追加の根魚
  hata: "rockfish",
  isaki: "rockfish",
  ishigakidai: "rockfish",
  // 追加の青物
  "rounin-aji": "pelagic",
  // 追加の回遊魚・中深海魚
  kinmedai: "migratory",
  akamutsu: "migratory",
  madara: "migratory",
  mutsu: "migratory",
  amadai: "migratory",
  itoyoridai: "migratory",
  medai: "migratory",
};

function getFishingCategory(fish: FishSpecies): FishingCategory | null {
  return FISHING_CATEGORY_MAP[fish.slug] ?? null;
}

const MONTH_NAMES = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

export function FishListClient({
  fishSpecies,
}: {
  fishSpecies: FishSpecies[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeFishingCategory, setActiveFishingCategory] = useState<FishingCategory | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(
    null,
  );
  const [showInSeason, setShowInSeason] = useState(false);

  const currentMonth = new Date().getMonth() + 1;

  // カテゴリごとの件数（フィルター前）
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = { sea: 0, brackish: 0, freshwater: 0 };
    for (const f of fishSpecies) {
      counts[f.category]++;
    }
    return counts;
  }, [fishSpecies]);

  // 釣りカテゴリごとの件数
  const fishingCategoryCounts = useMemo(() => {
    const counts: Record<FishingCategory, number> = {
      rockfish: 0, pelagic: 0, flatfish: 0, migratory: 0, shore: 0, freshwater_sub: 0, squid_octopus: 0,
    };
    for (const f of fishSpecies) {
      const fc = getFishingCategory(f);
      if (fc) counts[fc]++;
    }
    return counts;
  }, [fishSpecies]);

  // 難易度ごとの件数（フィルター前）
  const difficultyCounts = useMemo(() => {
    const counts: Record<Difficulty, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };
    for (const f of fishSpecies) {
      counts[f.difficulty]++;
    }
    return counts;
  }, [fishSpecies]);

  // フィルタリング
  const filteredFish = useMemo(() => {
    let result = fishSpecies;

    // テキスト検索
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.nameKana.toLowerCase().includes(q) ||
          f.nameEnglish.toLowerCase().includes(q) ||
          (f.aliases && f.aliases.some((a) => a.toLowerCase().includes(q))),
      );
    }

    // カテゴリフィルター
    if (activeCategory) {
      result = result.filter((f) => f.category === activeCategory);
    }

    // 釣りカテゴリフィルター
    if (activeFishingCategory) {
      result = result.filter((f) => getFishingCategory(f) === activeFishingCategory);
    }

    // 難易度フィルター
    if (activeDifficulty) {
      result = result.filter((f) => f.difficulty === activeDifficulty);
    }

    // 旬フィルター
    if (showInSeason) {
      result = result.filter((f) => f.peakMonths.includes(currentMonth));
    }

    return sortByEase(result);
  }, [
    fishSpecies,
    searchQuery,
    activeCategory,
    activeFishingCategory,
    activeDifficulty,
    showInSeason,
    currentMonth,
  ]);

  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    activeCategory !== null ||
    activeFishingCategory !== null ||
    activeDifficulty !== null ||
    showInSeason;

  return (
    <>
      {/* フィルターセクション */}
      <div className="mb-8 space-y-4">
        {/* 検索ボックス */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="魚名で検索（例: アジ、カサゴ）"
            className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-10 sm:text-sm"
          />
        </div>

        {/* フィルターボタン群 */}
        <div className="space-y-3">
          {/* カテゴリフィルター */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className="min-h-[40px] focus:outline-none"
            >
              <Badge
                variant={activeCategory === null ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                すべて
                <span className="ml-1 opacity-70">
                  ({fishSpecies.length})
                </span>
              </Badge>
            </button>
            {(Object.keys(CATEGORY_CONFIG) as Category[]).map((key) => {
              const count = categoryCounts[key];
              if (count === 0) return null;
              const config = CATEGORY_CONFIG[key];
              return (
                <button
                  key={key}
                  onClick={() =>
                    setActiveCategory(activeCategory === key ? null : key)
                  }
                  className="min-h-[40px] focus:outline-none"
                >
                  <Badge
                    variant={activeCategory === key ? "default" : "outline"}
                    className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                      activeCategory === key
                        ? ""
                        : config.color
                    }`}
                  >
                    {config.label}
                    <span className="ml-1 opacity-70">({count})</span>
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* 釣りカテゴリフィルター */}
          <div className="flex flex-wrap gap-2 pb-1">
            <button
              onClick={() => setActiveFishingCategory(null)}
              className="min-h-[40px] shrink-0 focus:outline-none"
            >
              <Badge
                variant={activeFishingCategory === null ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                全ジャンル
              </Badge>
            </button>
            {(Object.keys(FISHING_CATEGORY_CONFIG) as FishingCategory[]).map((key) => {
              const count = fishingCategoryCounts[key];
              if (count === 0) return null;
              const config = FISHING_CATEGORY_CONFIG[key];
              return (
                <button
                  key={key}
                  onClick={() =>
                    setActiveFishingCategory(activeFishingCategory === key ? null : key)
                  }
                  className="min-h-[40px] shrink-0 focus:outline-none"
                >
                  <Badge
                    variant={activeFishingCategory === key ? "default" : "outline"}
                    className={`cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm transition-colors ${
                      activeFishingCategory === key ? "" : config.color
                    }`}
                  >
                    {config.label}
                    <span className="ml-1 opacity-70">({count})</span>
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* 難易度フィルター + 旬フィルター */}
          <div className="flex flex-wrap gap-2">
            {(
              Object.entries(DIFFICULTY_LABELS) as [
                Difficulty,
                string,
              ][]
            ).map(([key, label]) => {
              const count = difficultyCounts[key];
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  onClick={() =>
                    setActiveDifficulty(
                      activeDifficulty === key ? null : key,
                    )
                  }
                  className="min-h-[40px] focus:outline-none"
                >
                  <Badge
                    variant={activeDifficulty === key ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary/10"
                  >
                    {label}
                    <span className="ml-1 opacity-70">({count})</span>
                  </Badge>
                </button>
              );
            })}

            {/* 区切り線 */}
            <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

            {/* 今月釣れるトグル */}
            <button
              onClick={() => setShowInSeason(!showInSeason)}
              className="min-h-[40px] focus:outline-none"
            >
              <Badge
                variant={showInSeason ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                  showInSeason
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                }`}
              >
                <CalendarCheck className="size-3.5" />
                {MONTH_NAMES[currentMonth - 1]}に釣れる魚
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* 件数表示 */}
      <div className="mb-4 flex items-center gap-2">
        <FishIcon className="size-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {hasActiveFilter ? (
            <>
              <span className="font-semibold text-foreground">
                {filteredFish.length}種
              </span>
              がヒット
              {filteredFish.length !== fishSpecies.length && (
                <span className="ml-1">
                  （全{fishSpecies.length}種中）
                </span>
              )}
            </>
          ) : (
            <>
              全<span className="font-semibold text-foreground">{fishSpecies.length}種</span>を釣れやすい順に表示
            </>
          )}
        </p>
      </div>

      {/* 魚カードグリッド */}
      {filteredFish.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {filteredFish.map((fish) => (
            <FishCard
              key={fish.slug}
              fish={fish}
              showPeakBadge={fish.peakMonths.includes(currentMonth)}
              showSpots
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <FishIcon className="mx-auto mb-4 size-12 opacity-30" />
          <p className="mb-2 text-base">
            条件に一致する魚が見つかりませんでした
          </p>
          <p className="text-sm">
            検索ワードやフィルター条件を変更してみてください
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory(null);
              setActiveFishingCategory(null);
              setActiveDifficulty(null);
              setShowInSeason(false);
            }}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            フィルターをリセット
          </button>
        </div>
      )}
    </>
  );
}
