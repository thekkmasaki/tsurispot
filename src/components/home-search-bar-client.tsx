"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Fish, BookOpen, FileText, Wrench, LoaderCircle } from "lucide-react";
import type { SearchItemType } from "@/lib/data/search-index";

// API レスポンスの型（searchText を除いた SearchItem）
interface SearchResult {
  type: SearchItemType;
  name: string;
  slug: string;
  sub: string;
}

function ResultIcon({ type }: { type: SearchItemType }) {
  switch (type) {
    case "fish":  return <Fish className="size-4" />;
    case "spot":  return <MapPin className="size-4" />;
    case "guide": return <BookOpen className="size-4" />;
    case "blog":  return <FileText className="size-4" />;
    case "tool":  return <Wrench className="size-4" />;
  }
}

const ICON_STYLE: Record<SearchItemType, { color: string; bg: string }> = {
  fish:  { color: "text-green-600",  bg: "bg-green-100" },
  spot:  { color: "text-blue-600",   bg: "bg-blue-100" },
  guide: { color: "text-orange-600", bg: "bg-orange-100" },
  blog:  { color: "text-purple-600", bg: "bg-purple-100" },
  tool:  { color: "text-rose-600",   bg: "bg-rose-100" },
};

const TYPE_LABEL: Record<SearchItemType, string> = {
  fish: "魚種",
  spot: "スポット",
  guide: "ガイド",
  blog: "コラム",
  tool: "ツール",
};

export function HomeSearchBarClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  // API fetch
  const fetchResults = useCallback(async (q: string) => {
    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!q.trim()) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Search failed");
      const data: SearchResult[] = await res.json();
      setResults(data.slice(0, 8));
      setHasSearched(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setResults([]);
      setHasSearched(true);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // デバウンス付きクエリ変更
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (value.trim() === "") {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }
    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchResults(value);
    }, 300);
  }, [fetchResults]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const showDropdown = isFocused && query.trim().length > 0;

  const handleSelect = useCallback(
    (slug: string) => {
      setQuery("");
      setResults([]);
      setHasSearched(false);
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
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="スポット名・地域・魚種で検索..."
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
        />
        {isLoading && (
          <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
        )}
        <button
          onMouseDown={(e) => { e.preventDefault(); handleSearch(); }}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:text-sm"
        >
          検索
        </button>
      </div>

      {/* ドロップダウン候補 */}
      {showDropdown && (
        <>
          {/* モバイル用：背景オーバーレイでドロップダウン外のタッチを防ぐ */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onMouseDown={() => setIsFocused(false)}
          />
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-white shadow-xl" onMouseDown={(e) => e.preventDefault()}>
          <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-3 py-6">
                <LoaderCircle className="size-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">検索中...</p>
              </div>
            ) : hasSearched && results.length === 0 ? (
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
            ) : results.length > 0 ? (
              <ul>
                {results.map((result, i) => {
                  const style = ICON_STYLE[result.type];
                  return (
                    <li key={result.slug}>
                      <button
                        onClick={() => handleSelect(result.slug)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          i === activeIndex ? "bg-muted" : "hover:bg-muted"
                        }`}
                      >
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full ${style.bg} ${style.color}`}
                        >
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
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {TYPE_LABEL[result.type]}
                        </span>
                      </button>
                    </li>
                  );
                })}
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
            ) : null}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
