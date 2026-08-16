"use client";
/**
 * 匿名でも動く魚図鑑ストア（案①: 魚図鑑の匿名開放）。
 * - 「釣ったことある」魚の slug を localStorage に配列で保存
 * - ログイン時は /api/user/fishdex と union merge（use-favorites.ts と同じ構造）
 *   サーバー側は釣果投稿由来の caught + 追加分(auth:fishdex_extra)の合成
 */
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { recordAction } from "@/hooks/use-activity";

const STORAGE_KEY = "tsurispot-fishdex";
const UPDATED_EVENT = "fishdex-updated";
const MAX_SLUGS = 300;

interface FishdexApiEntry {
  slug: string;
  caught: boolean;
}

/** スタンドアロン関数（hookの外で使える） */
export function getCaughtFish(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr.filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

function saveCaughtFish(slugs: string[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(slugs.slice(-MAX_SLUGS)),
    );
    window.dispatchEvent(new Event(UPDATED_EVENT));
  } catch {
    // プライベートモード等では諦める
  }
}

export function useFishdex() {
  const { status } = useSession();
  const [caught, setCaught] = useState<string[]>([]);

  useEffect(() => {
    const load = () => setCaught(getCaughtFish());
    load();
    window.addEventListener("storage", load);
    window.addEventListener(UPDATED_EVENT, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(UPDATED_EVENT, load);
    };
  }, []);

  // ログイン時: サーバー側（釣果投稿由来 + 追加分）と union merge
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/user/fishdex")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { fish?: FishdexApiEntry[] } | null) => {
        if (cancelled || !data || !Array.isArray(data.fish)) return;
        const serverSlugs = data.fish
          .filter((f) => f.caught)
          .map((f) => f.slug);
        const localSlugs = getCaughtFish();
        const merged = Array.from(new Set([...localSlugs, ...serverSlugs]));
        const localChanged =
          localSlugs.length !== merged.length ||
          localSlugs.some((s) => !merged.includes(s));
        const serverChanged = merged.some((s) => !serverSlugs.includes(s));
        if (localChanged) {
          saveCaughtFish(merged);
          setCaught(merged);
        }
        if (serverChanged) {
          fetch("/api/user/fishdex", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slugs: merged }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

  const syncToServer = useCallback(
    (slugs: string[]) => {
      if (status !== "authenticated") return;
      fetch("/api/user/fishdex", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs }),
      }).catch(() => {});
    },
    [status],
  );

  /** トグル。追加時は活動カレンダーの「動いた」(Lv2) も記録する */
  const toggle = useCallback(
    (slug: string) => {
      const current = getCaughtFish();
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      saveCaughtFish(next);
      setCaught(next);
      syncToServer(next);
      if (next.length > current.length) {
        recordAction();
      }
    },
    [syncToServer],
  );

  const isCaught = useCallback(
    (slug: string) => caught.includes(slug),
    [caught],
  );

  return {
    caught,
    count: caught.length,
    isCaught,
    toggle,
    isAuthenticated: status === "authenticated",
  };
}
