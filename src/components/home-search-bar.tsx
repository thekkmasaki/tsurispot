"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Fish } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";

interface SearchResult {
  type: "spot" | "fish";
  name: string;
  slug: string;
  sub: string;
  searchText: string;
}

function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

const FISH_KANJI: Record<string, string[]> = {
  アジ: ["鯵", "鰺", "あじ"],
  サバ: ["鯖", "さば"],
  カサゴ: ["笠子", "かさご", "ガシラ"],
  メバル: ["眼張", "めばる"],
  イワシ: ["鰯", "いわし"],
  シーバス: ["鱸", "スズキ", "すずき"],
  タチウオ: ["太刀魚", "たちうお"],
  クロダイ: ["黒鯛", "チヌ", "ちぬ", "くろだい"],
  マダイ: ["真鯛", "まだい"],
  キス: ["鱚", "シロギス", "きす"],
  ヒラメ: ["鮃", "平目", "ひらめ"],
  カレイ: ["鰈", "かれい"],
  アオリイカ: ["障泥烏賊", "あおりいか"],
  ハゼ: ["鯊", "はぜ"],
  ブリ: ["鰤", "ぶり", "ハマチ"],
  サワラ: ["鰆", "さわら"],
  アユ: ["鮎", "あゆ"],
  ヤマメ: ["山女", "やまめ"],
  ニジマス: ["虹鱒", "にじます"],
  ワカサギ: ["公魚", "わかさぎ"],
};

const allItems: SearchResult[] = [
  ...fishingSpots.map((s) => ({
    type: "spot" as const,
    name: s.name,
    slug: `/spots/${s.slug}`,
    sub: `${s.region.prefecture} ${s.region.areaName}`,
    searchText: [
      s.name,
      s.region.prefecture,
      s.region.areaName,
      katakanaToHiragana(s.name),
    ]
      .join(" ")
      .toLowerCase(),
  })),
  ...fishSpecies.map((f) => {
    const kanjiAliases = FISH_KANJI[f.nameKana] || FISH_KANJI[f.name] || [];
    return {
      type: "fish" as const,
      name: f.name,
      slug: `/fish/${f.slug}`,
      sub: f.nameKana,
      searchText: [
        f.name,
        f.nameKana,
        katakanaToHiragana(f.nameKana),
        f.nameEnglish,
        ...kanjiAliases,
      ]
        .join(" ")
        .toLowerCase(),
    };
  }),
];

export function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const qHiragana = katakanaToHiragana(q);
    return allItems
      .filter((item) => {
        if (item.searchText.includes(q) || item.searchText.includes(qHiragana))
          return true;
        if (
          q.includes(item.name.toLowerCase()) ||
          qHiragana.includes(katakanaToHiragana(item.name).toLowerCase())
        )
          return true;
        return false;
      })
      .slice(0, 8);
  }, [query]);

  const showDropdown = isFocused && query.trim().length > 0;

  const handleSelect = useCallback(
    (slug: string) => {
      setQuery("");
      setIsFocused(false);
      router.push(slug);
    },
    [router]
  );

  const handleSearch = useCallback(() => {
    setIsFocused(false);
    if (!query.trim()) {
      router.push("/spots");
    } else {
      router.push(`/spots?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex].slug);
        } else {
          handleSearch();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev > -1 ? prev - 1 : -1));
      } else if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [activeIndex, results, handleSelect, handleSearch]
  );

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-lg mb-5 sm:mb-6">
      {/* 検索入力 */}
      <div className="flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3.5 shadow-lg backdrop-blur-sm transition-shadow hover:shadow-xl sm:px-5 sm:py-4">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="スポット名・地域・魚種で検索..."
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
        />
        <button
          onMouseDown={(e) => { e.preventDefault(); handleSearch(); }}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:text-sm"
        >
          検索
        </button>
      </div>

      {/* ドロップダウン候補 */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-white shadow-xl">
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  「{query}」に一致する結果がありません
                </p>
                <button
                  onClick={handleSearch}
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                >
                  スポット一覧で検索する →
                </button>
              </div>
            ) : (
              <ul>
                {results.map((result, i) => (
                  <li key={result.slug}>
                    <button
                      onClick={() => handleSelect(result.slug)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        i === activeIndex ? "bg-muted" : "hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                          result.type === "spot"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {result.type === "spot" ? (
                          <MapPin className="size-4" />
                        ) : (
                          <Fish className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {result.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {result.sub}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {result.type === "spot" ? "スポット" : "魚種"}
                      </span>
                    </button>
                  </li>
                ))}
                {/* 全件検索リンク */}
                <li>
                  <button
                    onClick={handleSearch}
                    className="flex w-full items-center gap-3 rounded-lg border-t px-3 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-muted"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Search className="size-4" />
                    </div>
                    「{query}」でスポット一覧を検索
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
