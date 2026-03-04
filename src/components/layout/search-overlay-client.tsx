"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Fish, BookOpen, FileText, Wrench, LoaderCircle } from "lucide-react";
import type { SearchItem, SearchItemType } from "@/lib/data/search-index";

// カタカナ → ひらがな変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// --- カテゴリ表示設定 ---
const CATEGORY_CONFIG: Record<SearchItemType, { label: string; icon: string; color: string; bgColor: string }> = {
  fish:  { label: "魚種",          icon: "fish",     color: "text-green-600", bgColor: "bg-green-100" },
  spot:  { label: "スポット",      icon: "mappin",   color: "text-blue-600",  bgColor: "bg-blue-100" },
  guide: { label: "ガイド・釣り方", icon: "bookopen", color: "text-orange-600", bgColor: "bg-orange-100" },
  blog:  { label: "コラム",        icon: "filetext", color: "text-purple-600", bgColor: "bg-purple-100" },
  tool:  { label: "便利ツール",    icon: "wrench",   color: "text-rose-600",  bgColor: "bg-rose-100" },
};

// カテゴリの表示順序
const CATEGORY_ORDER: SearchItemType[] = ["fish", "spot", "guide", "blog", "tool"];

function ResultIcon({ type }: { type: SearchItemType }) {
  switch (type) {
    case "fish":  return <Fish className="size-4" />;
    case "spot":  return <MapPin className="size-4" />;
    case "guide": return <BookOpen className="size-4" />;
    case "blog":  return <FileText className="size-4" />;
    case "tool":  return <Wrench className="size-4" />;
  }
}

export function SearchOverlayClient({ items }: { items: SearchItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // デバウンス処理: 入力中はisLoading=true、300ms後に検索実行
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (value.trim() === "") {
      setDebouncedQuery("");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(value);
      setIsLoading(false);
    }, 300);
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const groupedResults = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    const q = debouncedQuery.toLowerCase();
    const qHiragana = katakanaToHiragana(q);

    const matched = items.filter((item) => {
      // 双方向: クエリがデータに含まれる OR データがクエリに含まれる
      if (item.searchText.includes(q) || item.searchText.includes(qHiragana)) return true;
      if (q.includes(item.name.toLowerCase()) || qHiragana.includes(katakanaToHiragana(item.name).toLowerCase())) return true;
      return false;
    });

    // カテゴリ別にグループ化（各カテゴリ最大5件、合計最大15件）
    const groups: Partial<Record<SearchItemType, SearchItem[]>> = {};
    let total = 0;
    const MAX_TOTAL = 15;

    for (const cat of CATEGORY_ORDER) {
      if (total >= MAX_TOTAL) break;
      const catItems = matched.filter((m) => m.type === cat);
      if (catItems.length > 0) {
        const remaining = MAX_TOTAL - total;
        const sliced = catItems.slice(0, Math.min(5, remaining));
        groups[cat] = sliced;
        total += sliced.length;
      }
    }

    return Object.keys(groups).length > 0 ? groups : null;
  }, [debouncedQuery, items]);

  const hasResults = groupedResults !== null;

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        handleQueryChange("");
      }
      // Ctrl+K or Cmd+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleQueryChange]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        handleQueryChange("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleQueryChange]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    handleQueryChange("");
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
        <span>何でも検索</span>
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

          <div className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[28rem] sm:px-0 sm:pt-0">
            <div className="rounded-xl border border-border bg-white shadow-lg">
              {/* Search input */}
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="スポット・魚種・ガイド・コラムを検索..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {isLoading && (
                  <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
                )}
                <button
                  onClick={() => { setIsOpen(false); handleQueryChange(""); }}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[28rem] overflow-y-auto p-2" onMouseDown={(e) => e.preventDefault()}>
                {query.trim() === "" ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    スポット名・魚種名・ガイド・コラムなど<br />何でも検索できます
                  </p>
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-3 py-8">
                    <LoaderCircle className="size-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">検索中...</p>
                  </div>
                ) : !hasResults ? (
                  <div className="px-3 py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      「{query}」に一致する結果が見つかりませんでした
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground/70">
                      別のキーワードやひらがな・カタカナで試してみてください
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {CATEGORY_ORDER.map((cat) => {
                      const catItems = groupedResults[cat];
                      if (!catItems || catItems.length === 0) return null;
                      const config = CATEGORY_CONFIG[cat];
                      return (
                        <div key={cat}>
                          {/* カテゴリヘッダー */}
                          <div className="flex items-center gap-1.5 px-3 pb-1 pt-2">
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {config.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                              ({catItems.length})
                            </span>
                          </div>
                          {/* カテゴリ内の結果 */}
                          <ul>
                            {catItems.map((result) => (
                              <li key={result.slug}>
                                <button
                                  onClick={() => handleSelect(result.slug)}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                                >
                                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.bgColor} ${config.color}`}>
                                    <ResultIcon type={result.type} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                      {result.name}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                      {result.sub}
                                    </p>
                                  </div>
                                  <span className={`shrink-0 text-[10px] ${config.color}`}>
                                    {config.label}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
