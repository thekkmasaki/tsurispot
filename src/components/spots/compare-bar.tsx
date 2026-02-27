"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "tsurispot-compare";
const MAX_COMPARE = 3;

export function getCompareList(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCompareList(slugs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event("compare-updated"));
}

export function toggleCompare(slug: string): boolean {
  const list = getCompareList();
  const idx = list.indexOf(slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    setCompareList(list);
    return false;
  }
  if (list.length >= MAX_COMPARE) return false;
  list.push(slug);
  setCompareList(list);
  return true;
}

export function isInCompare(slug: string): boolean {
  return getCompareList().includes(slug);
}

export function CompareBar() {
  const [list, setList] = useState<string[]>([]);

  const sync = useCallback(() => setList(getCompareList()), []);

  useEffect(() => {
    sync();
    window.addEventListener("compare-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("compare-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  if (list.length === 0) return null;

  return (
    <div className="fixed bottom-[60px] left-0 right-0 z-40 border-t bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-lg md:bottom-0">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <GitCompareArrows className="size-4 text-primary" />
          <span className="font-medium">{list.length}/{MAX_COMPARE} スポット選択中</span>
          <button
            onClick={() => setCompareList([])}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground"
          >
            すべて解除
          </button>
        </div>
        <Link href={`/spots/compare?slugs=${list.join(",")}`}>
          <Button
            size="sm"
            disabled={list.length < 2}
            className={cn("gap-1.5 min-h-[40px]", list.length < 2 && "opacity-50")}
          >
            <GitCompareArrows className="size-4" />
            比較する
          </Button>
        </Link>
      </div>
    </div>
  );
}

/** Small button to add/remove from compare list */
export function CompareToggleButton({ slug, name }: { slug: string; name: string }) {
  const [inCompare, setInCompare] = useState(false);
  const [full, setFull] = useState(false);

  const sync = useCallback(() => {
    setInCompare(isInCompare(slug));
    setFull(getCompareList().length >= MAX_COMPARE);
  }, [slug]);

  useEffect(() => {
    sync();
    window.addEventListener("compare-updated", sync);
    return () => window.removeEventListener("compare-updated", sync);
  }, [sync]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inCompare && full) return;
        toggleCompare(slug);
      }}
      title={inCompare ? "比較から外す" : full ? "最大3つまで" : "比較に追加"}
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        inCompare
          ? "bg-primary text-primary-foreground"
          : full
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-muted/80 text-muted-foreground hover:bg-primary/10 hover:text-primary"
      )}
    >
      {inCompare ? (
        <>
          <X className="size-3" />
          比較中
        </>
      ) : (
        <>
          <GitCompareArrows className="size-3" />
          比較
        </>
      )}
    </button>
  );
}
