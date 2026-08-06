"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { UserCard } from "@/components/social/user-card";
import type { UserSearchEntry } from "@/lib/social-store";

// ニックネーム前方一致のユーザー検索（300msデバウンス）
export function UserSearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchEntry[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setResults(data?.users ?? []);
          setSearched(true);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ニックネームで釣り人を検索"
          aria-label="ユーザー検索"
          maxLength={30}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      {loading && <p className="mt-3 text-center text-sm text-muted-foreground">検索中...</p>}
      {!loading && searched && results.length === 0 && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          「{query.trim()}」に一致するユーザーは見つかりませんでした。
        </p>
      )}
      {results.length > 0 && (
        <div className="mt-3 divide-y rounded-2xl border bg-card">
          {results.map((u) => (
            <UserCard key={u.tsuriId} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}
