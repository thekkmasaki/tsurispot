"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import { SearchNavigationIndicator } from "@/components/search/search-navigation-indicator";

export function NotFoundSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  // 押してからスポット一覧が出るまでの表示
  const [isNavigating, startNavigation] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim() && !isNavigating) {
      startNavigation(() => {
        router.push(`/spots?q=${encodeURIComponent(query.trim())}`);
      });
    }
  }

  return (
    <form
      onSubmit={handleSearch}
      className="mb-10 flex w-full max-w-sm gap-2"
    >
      <SearchNavigationIndicator active={isNavigating} label={`「${query.trim()}」の釣り場を探しています`} />
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="釣りスポットを検索..."
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-9 pr-4 text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <button
        type="submit"
        aria-busy={isNavigating}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {isNavigating && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        {isNavigating ? "検索中" : "検索"}
      </button>
    </form>
  );
}
