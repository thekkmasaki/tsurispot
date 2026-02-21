"use client";

import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// 無料枠制御: Upstash無料枠 10,000コマンド/日
// ハートビート60秒間隔 × 1リクエスト = 1ユーザーが1時間で60コマンド
// → 1日中滞在しても1,440コマンド。数十人同時でも余裕
const HEARTBEAT_INTERVAL_MS = 60_000; // 60秒間隔（30秒から延長して節約）

export function ActiveUsers() {
  const [count, setCount] = useState(0);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = generateSessionId();

    async function heartbeat() {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current }),
        });
        const data = await res.json();
        if (typeof data.count === "number") {
          setCount(data.count);
        }
      } catch {
        // Redis未設定 or エラー時は表示しない
      }
    }

    // 初回ハートビート
    heartbeat();

    // 60秒ごとにハートビート
    const interval = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);

    // タブが非アクティブ時はハートビートを止めて節約
    function handleVisibilityChange() {
      if (document.hidden) {
        clearInterval(interval);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:flex">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Users className="h-3 w-3" />
      <span>{count}人が閲覧中</span>
    </div>
  );
}
