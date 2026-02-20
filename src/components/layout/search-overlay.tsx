"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Fish } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";

interface SearchResult {
  type: "spot" | "fish";
  name: string;
  slug: string;
  sub: string;
  searchText: string; // 検索対象テキスト（名前+読み+漢字+英語をすべて結合）
}

// カタカナ → ひらがな変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// 魚の漢字名マッピング
const FISH_KANJI: Record<string, string[]> = {
  アジ: ["鯵", "鰺", "アジ", "あじ"],
  サバ: ["鯖", "サバ", "さば"],
  カサゴ: ["笠子", "瘡魚", "カサゴ", "かさご", "ガシラ"],
  メバル: ["眼張", "メバル", "めばる"],
  イワシ: ["鰯", "鰮", "イワシ", "いわし"],
  シーバス: ["鱸", "スズキ", "すずき", "シーバス"],
  タチウオ: ["太刀魚", "タチウオ", "たちうお"],
  クロダイ: ["黒鯛", "チヌ", "ちぬ", "クロダイ", "くろだい"],
  マダイ: ["真鯛", "マダイ", "まだい"],
  キス: ["鱚", "シロギス", "しろぎす", "キス", "きす"],
  ヒラメ: ["鮃", "平目", "ヒラメ", "ひらめ"],
  カレイ: ["鰈", "カレイ", "かれい"],
  アオリイカ: ["障泥烏賊", "アオリイカ", "あおりいか"],
  アイナメ: ["鮎並", "アイナメ", "あいなめ"],
  カワハギ: ["皮剥", "カワハギ", "かわはぎ"],
  ハゼ: ["鯊", "沙魚", "ハゼ", "はぜ"],
  サヨリ: ["鱵", "細魚", "サヨリ", "さより"],
  アナゴ: ["穴子", "アナゴ", "あなご"],
  カマス: ["魳", "カマス", "かます"],
  コチ: ["鯒", "マゴチ", "まごち", "コチ"],
  カンパチ: ["間八", "勘八", "カンパチ", "かんぱち"],
  イシダイ: ["石鯛", "イシダイ", "いしだい"],
  メジナ: ["目仁奈", "グレ", "ぐれ", "メジナ", "めじな"],
  フグ: ["河豚", "フグ", "ふぐ"],
  ブリ: ["鰤", "ブリ", "ぶり", "ハマチ", "はまち"],
  サワラ: ["鰆", "サワラ", "さわら"],
  コイ: ["鯉", "コイ", "こい"],
  アユ: ["鮎", "アユ", "あゆ"],
  イワナ: ["岩魚", "イワナ", "いわな"],
  ヤマメ: ["山女", "ヤマメ", "やまめ"],
  ニジマス: ["虹鱒", "ニジマス", "にじます"],
  ワカサギ: ["公魚", "ワカサギ", "わかさぎ"],
  ナマズ: ["鯰", "ナマズ", "なまず"],
  ブラックバス: ["黒鱒", "ブラックバス", "ぶらっくばす", "バス"],
  ゴンズイ: ["権瑞", "ゴンズイ", "ごんずい"],
  アイゴ: ["藍子", "アイゴ", "あいご", "バリ"],
  アカエイ: ["赤鱝", "アカエイ", "あかえい"],
  ウツボ: ["靱", "ウツボ", "うつぼ"],
  ヘラブナ: ["箆鮒", "ヘラブナ", "へらぶな"],
  オイカワ: ["追河", "オイカワ", "おいかわ"],
  アマゴ: ["甘子", "アマゴ", "あまご"],
  ソウダガツオ: ["宗太鰹", "ソウダガツオ", "そうだがつお"],
  イシモチ: ["石持", "シログチ", "イシモチ", "いしもち"],
  ウミタナゴ: ["海鱮", "ウミタナゴ", "うみたなご"],
  コノシロ: ["鰶", "コノシロ", "このしろ"],
  ベラ: ["倍良", "ベラ", "べら", "キュウセン"],
  エソ: ["鱛", "エソ", "えそ"],
  ホウボウ: ["魴鮄", "ホウボウ", "ほうぼう"],
  シマアジ: ["縞鯵", "シマアジ", "しまあじ"],
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
    ].join(" ").toLowerCase(),
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
      ].join(" ").toLowerCase(),
    };
  }),
];

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    // ひらがな・カタカナ両方で検索
    const qHiragana = katakanaToHiragana(q);
    return allItems
      .filter(
        (item) =>
          item.searchText.includes(q) ||
          item.searchText.includes(qHiragana)
      )
      .slice(0, 10);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
      // Ctrl+K or Cmd+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(slug);
  };

  return (
    <div className="relative" ref={overlayRef}>
      {/* Desktop trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-foreground sm:flex"
      >
        <Search className="h-4 w-4" />
        <span>場所・魚種で検索</span>
        <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          Ctrl+K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-foreground sm:hidden"
        aria-label="検索"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Search dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 bg-black/20 sm:hidden" />

          <div className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:px-0 sm:pt-0">
            <div className="rounded-xl border border-border bg-white shadow-lg">
              {/* Search input */}
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="スポット名・魚種名で検索..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {query.trim() === "" ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    スポット名や魚の名前を入力してください
                  </p>
                ) : results.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    「{query}」に一致する結果がありません
                  </p>
                ) : (
                  <ul>
                    {results.map((result) => (
                      <li key={result.slug}>
                        <button
                          onClick={() => handleSelect(result.slug)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                        >
                          <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                            result.type === "spot"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                          }`}>
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
                              {result.type === "spot" ? result.sub : result.sub}
                            </p>
                          </div>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {result.type === "spot" ? "スポット" : "魚種"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
