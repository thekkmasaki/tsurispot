"use client";
/**
 * 全ページ共通の訪問記録（案②: 訪問だけで Lv1 が付く）。
 * providers.tsx に常駐させる、何もレンダーしない Client Component。
 * - マウント時に今日を「見た」として localStorage に記録
 * - ログイン中は1日1回だけローカル履歴をサーバーへ反映（別端末との union は SADD 任せ）
 */
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { todayJST } from "@/lib/activity";
import { recordVisit, syncActivityToServer } from "@/hooks/use-activity";

const SYNC_FLAG_KEY = "tsurispot-activity-synced";

export function VisitTracker() {
  const { status } = useSession();

  useEffect(() => {
    recordVisit();
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    try {
      const today = todayJST();
      if (localStorage.getItem(SYNC_FLAG_KEY) === today) return;
      localStorage.setItem(SYNC_FLAG_KEY, today);
    } catch {
      // localStorage 不可でも同期自体は試す
    }
    syncActivityToServer();
  }, [status]);

  return null;
}
