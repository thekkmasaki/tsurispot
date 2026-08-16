"use client";
/**
 * 匿名でも動く活動記録ストア（案②）。
 * - 訪問日 (Lv1) / アクション日 (Lv2) を localStorage に YYYY-MM-DD 配列で保存
 * - ログイン時は /api/user/activity へ push して Redis 側と union（SADD なので冪等）
 * - Lv3（釣行）はログイン機能（チェックイン・釣果投稿）のみ。匿名は Lv1/Lv2 まで
 * 実装パターンは use-favorites.ts（localStorage + カスタムイベント + ログイン時マージ）を踏襲。
 */
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { todayJST } from "@/lib/activity";

const VISITS_KEY = "tsurispot-visits";
const ACTIONS_KEY = "tsurispot-actions";
const UPDATED_EVENT = "activity-updated";
/** localStorage の肥大防止。ヒートマップは26週なので400日あれば十分 */
const MAX_DATES = 400;

function readDates(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((d) => typeof d === "string") : [];
  } catch {
    return [];
  }
}

function appendToday(key: string): boolean {
  if (typeof window === "undefined") return false;
  const today = todayJST();
  const dates = readDates(key);
  if (dates.includes(today)) return false;
  const next = [...dates, today].slice(-MAX_DATES);
  try {
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(UPDATED_EVENT));
  } catch {
    // プライベートモード等では諦める
  }
  return true;
}

/** 今日を「見た」として記録。新規記録なら true */
export function recordVisit(): boolean {
  return appendToday(VISITS_KEY);
}

/** 今日を「動いた」として記録（お気に入り追加・「釣ったことある」等の操作から呼ぶ） */
export function recordAction(): boolean {
  return appendToday(ACTIONS_KEY);
}

export function getVisits(): string[] {
  return readDates(VISITS_KEY);
}

export function getActions(): string[] {
  return readDates(ACTIONS_KEY);
}

/** ログイン中ならローカルの活動履歴をサーバーへ反映（SADD なので何度呼んでも安全）。成功可否を返す */
export function syncActivityToServer(): Promise<boolean> {
  const visits = getVisits();
  const actions = getActions();
  if (visits.length === 0 && actions.length === 0) return Promise.resolve(true);
  return fetch("/api/user/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visits, actions }),
  })
    .then((r) => r.ok)
    .catch(() => false);
}

export function useActivity() {
  const { status } = useSession();
  const [visits, setVisits] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  useEffect(() => {
    const load = () => {
      setVisits(getVisits());
      setActions(getActions());
    };
    load();
    window.addEventListener("storage", load);
    window.addEventListener(UPDATED_EVENT, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(UPDATED_EVENT, load);
    };
  }, []);

  const isAuthenticated = status === "authenticated";

  const refresh = useCallback(() => {
    setVisits(getVisits());
    setActions(getActions());
  }, []);

  return { visits, actions, isAuthenticated, refresh };
}
