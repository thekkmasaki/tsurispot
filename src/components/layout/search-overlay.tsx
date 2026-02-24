"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, MapPin, Fish, BookOpen, FileText, Wrench, LoaderCircle } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { blogPosts } from "@/lib/data/blog";

type ResultType = "fish" | "spot" | "guide" | "blog" | "tool";

interface SearchResult {
  type: ResultType;
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

// 検索用の別名は各魚のaliasesフィールドから動的取得

// --- 静的ガイドページリスト ---
const guidePages: SearchResult[] = [
  { type: "guide", name: "サビキ釣りガイド", slug: "/guide/sabiki", sub: "釣り方ガイド", searchText: "さびき釣り サビキ釣り ガイド sabiki 初心者 堤防 アジ サバ イワシ" },
  { type: "guide", name: "初心者ガイド", slug: "/guide/beginner", sub: "釣り方ガイド", searchText: "初心者 ガイド 入門 はじめて beginner 始め方" },
  { type: "guide", name: "ルアー釣りガイド", slug: "/guide/lure", sub: "釣り方ガイド", searchText: "ルアー釣り るあー lure ルアーフィッシング メタルジグ ミノー ワーム" },
  { type: "guide", name: "エギングガイド", slug: "/guide/eging", sub: "釣り方ガイド", searchText: "エギング えぎんぐ eging イカ アオリイカ エギ" },
  { type: "guide", name: "投げ釣り（ちょい投げ）ガイド", slug: "/guide/casting", sub: "釣り方ガイド", searchText: "投げ釣り なげつり ちょい投げ casting サーフ キス カレイ" },
  { type: "guide", name: "ウキ釣りガイド", slug: "/guide/float-fishing", sub: "釣り方ガイド", searchText: "ウキ釣り うき釣り 浮き釣り float フカセ クロダイ メジナ グレ チヌ" },
  { type: "guide", name: "ジギングガイド", slug: "/guide/jigging", sub: "釣り方ガイド", searchText: "ジギング じぎんぐ jigging ショアジギ メタルジグ 青物 ブリ カンパチ" },
  { type: "guide", name: "穴釣りガイド", slug: "/guide/anazuri", sub: "釣り方ガイド", searchText: "穴釣り あなつり anazuri テトラ カサゴ メバル 根魚 ブラクリ" },
  { type: "guide", name: "泳がせ釣りガイド", slug: "/guide/oyogase", sub: "釣り方ガイド", searchText: "泳がせ釣り およがせ oyogase 生き餌 ヒラメ 青物 ブリ" },
  { type: "guide", name: "ラインの選び方", slug: "/guide/line", sub: "道具ガイド", searchText: "ライン 道糸 ハリス ナイロン フロロカーボン peライン 選び方 line" },
  { type: "guide", name: "おもりの種類と選び方", slug: "/guide/sinker", sub: "道具ガイド", searchText: "おもり 重り シンカー ガン玉 ナス型 天秤 ブラクリ sinker オモリ 号数" },
  { type: "guide", name: "仕掛けの種類", slug: "/guide/rigs", sub: "道具ガイド", searchText: "仕掛け しかけ rigs 天秤 胴付き ウキ仕掛け サビキ仕掛け" },
  { type: "guide", name: "結び方ガイド", slug: "/guide/knots", sub: "テクニックガイド", searchText: "結び方 ノット knots クリンチノット ユニノット FGノット 糸の結び方" },
  { type: "guide", name: "潮見表の読み方", slug: "/guide/tide", sub: "知識ガイド", searchText: "潮見表 しおみひょう tide 潮汐 大潮 中潮 小潮 潮回り 干潮 満潮" },
  { type: "guide", name: "安全ガイド", slug: "/safety", sub: "マナー・安全", searchText: "安全 あんぜん safety ライフジャケット 落水 事故 注意" },
  { type: "guide", name: "釣りの予算ガイド", slug: "/guide/budget", sub: "初心者向けガイド", searchText: "予算 budget お金 費用 コスト いくら 安い 安く始める" },
  { type: "guide", name: "ナイトフィッシングガイド", slug: "/guide/night-fishing", sub: "釣り方ガイド", searchText: "夜釣り ナイトフィッシング night 夜 ヘッドライト メバリング アジング タチウオ" },
  { type: "guide", name: "はじめての釣り", slug: "/for-beginners", sub: "初心者向けガイド", searchText: "はじめて 初めて 入門 始め方 初心者 for beginners 釣りデビュー" },
  { type: "guide", name: "魚の持ち帰り方ガイド", slug: "/guide/fish-handling", sub: "知識ガイド", searchText: "持ち帰り もちかえり 締め方 しめかた 血抜き クーラーボックス 鮮度 fish handling" },
  { type: "guide", name: "釣り方一覧", slug: "/methods", sub: "釣り方ガイド", searchText: "釣り方 一覧 メソッド methods 種類 やり方" },
  { type: "guide", name: "月別釣りカレンダー", slug: "/fishing-calendar", sub: "知識ガイド", searchText: "カレンダー 月別 季節 旬 いつ 時期 calendar シーズン 春 夏 秋 冬" },
];

// --- 便利ツールページリスト ---
const toolPages: SearchResult[] = [
  { type: "tool", name: "釣り場診断", slug: "/fish-finder", sub: "おすすめスポット検索", searchText: "釣り場 診断 おすすめ 探す fish finder どこ" },
  { type: "tool", name: "おすすめ診断", slug: "/recommendation", sub: "あなたに合った釣りを診断", searchText: "おすすめ 診断 recommendation ぴったり 合う 相性" },
  { type: "tool", name: "今釣れる魚", slug: "/catchable-now", sub: "現在のシーズン情報", searchText: "今 釣れる 魚 シーズン 旬 catchable now いま 今月" },
  { type: "tool", name: "ボウズチェッカー", slug: "/bouzu-checker", sub: "坊主回避ツール", searchText: "ボウズ ぼうず 坊主 チェッカー bouzu 釣れない 回避" },
  { type: "tool", name: "釣り用語集", slug: "/glossary", sub: "釣り用語辞典", searchText: "用語 用語集 辞典 glossary 言葉 意味 わからない" },
  { type: "tool", name: "お気に入り", slug: "/favorites", sub: "保存したスポット", searchText: "お気に入り ブックマーク 保存 favorites 気になる" },
];

// --- ブログ記事（blogPostsから動的に構築） ---
const blogItems: SearchResult[] = blogPosts.map((post) => ({
  type: "blog" as const,
  name: post.title,
  slug: `/blog/${post.slug}`,
  sub: post.tags.slice(0, 3).join(" / "),
  searchText: [
    post.title,
    katakanaToHiragana(post.title),
    ...post.tags,
    ...post.tags.map(katakanaToHiragana),
    post.description,
  ].join(" ").toLowerCase(),
}));

// --- 全アイテム統合 ---
const allItems: SearchResult[] = [
  ...fishSpecies.map((f) => {
    const aliases = f.aliases || [];
    return {
      type: "fish" as const,
      name: f.name,
      slug: `/fish/${f.slug}`,
      sub: aliases.length > 0 ? aliases.slice(0, 2).join("・") : f.nameKana,
      searchText: [
        f.name,
        f.nameKana,
        katakanaToHiragana(f.nameKana),
        f.nameEnglish,
        ...aliases,
        ...aliases.map(katakanaToHiragana),
      ].join(" ").toLowerCase(),
    };
  }),
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
  ...guidePages.map((g) => ({ ...g, searchText: g.searchText.toLowerCase() })),
  ...blogItems,
  ...toolPages.map((t) => ({ ...t, searchText: t.searchText.toLowerCase() })),
];

// --- カテゴリ表示設定 ---
const CATEGORY_CONFIG: Record<ResultType, { label: string; icon: string; color: string; bgColor: string }> = {
  fish:  { label: "魚種",          icon: "fish",     color: "text-green-600", bgColor: "bg-green-100" },
  spot:  { label: "スポット",      icon: "mappin",   color: "text-blue-600",  bgColor: "bg-blue-100" },
  guide: { label: "ガイド・釣り方", icon: "bookopen", color: "text-orange-600", bgColor: "bg-orange-100" },
  blog:  { label: "コラム",        icon: "filetext", color: "text-purple-600", bgColor: "bg-purple-100" },
  tool:  { label: "便利ツール",    icon: "wrench",   color: "text-rose-600",  bgColor: "bg-rose-100" },
};

// カテゴリの表示順序
const CATEGORY_ORDER: ResultType[] = ["fish", "spot", "guide", "blog", "tool"];

function ResultIcon({ type }: { type: ResultType }) {
  switch (type) {
    case "fish":  return <Fish className="size-4" />;
    case "spot":  return <MapPin className="size-4" />;
    case "guide": return <BookOpen className="size-4" />;
    case "blog":  return <FileText className="size-4" />;
    case "tool":  return <Wrench className="size-4" />;
  }
}

export function SearchOverlay() {
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

    const matched = allItems.filter((item) => {
      // 双方向: クエリがデータに含まれる OR データがクエリに含まれる
      if (item.searchText.includes(q) || item.searchText.includes(qHiragana)) return true;
      if (q.includes(item.name.toLowerCase()) || qHiragana.includes(katakanaToHiragana(item.name).toLowerCase())) return true;
      return false;
    });

    // カテゴリ別にグループ化（各カテゴリ最大5件、合計最大15件）
    const groups: Partial<Record<ResultType, SearchResult[]>> = {};
    let total = 0;
    const MAX_TOTAL = 15;

    for (const cat of CATEGORY_ORDER) {
      if (total >= MAX_TOTAL) break;
      const items = matched.filter((m) => m.type === cat);
      if (items.length > 0) {
        const remaining = MAX_TOTAL - total;
        const sliced = items.slice(0, Math.min(5, remaining));
        groups[cat] = sliced;
        total += sliced.length;
      }
    }

    return Object.keys(groups).length > 0 ? groups : null;
  }, [debouncedQuery]);

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
              <div className="max-h-[28rem] overflow-y-auto p-2">
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
                      const items = groupedResults[cat];
                      if (!items || items.length === 0) return null;
                      const config = CATEGORY_CONFIG[cat];
                      return (
                        <div key={cat}>
                          {/* カテゴリヘッダー */}
                          <div className="flex items-center gap-1.5 px-3 pb-1 pt-2">
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {config.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                              ({items.length})
                            </span>
                          </div>
                          {/* カテゴリ内の結果 */}
                          <ul>
                            {items.map((result) => (
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
