"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Fish } from "lucide-react";
import { cn } from "@/lib/utils";

interface CatchReportButtonProps {
  spotSlug: string;
}

function getSessionId(): string {
  const KEY = "tsurispot_sid";
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

export function CatchReportButton({ spotSlug }: CatchReportButtonProps) {
  const [count, setCount] = useState(0);
  const [reported, setReported] = useState(false);
  const [animating, setAnimating] = useState(false);
  const sessionIdRef = useRef("");

  // ローカルストレージで報告済みチェック（API節約）
  const localKey = `catch_reported:${spotSlug}`;

  useEffect(() => {
    sessionIdRef.current = getSessionId();

    // ローカルで報告済みかチェック
    const savedTime = localStorage.getItem(localKey);
    if (savedTime && Date.now() - parseInt(savedTime) < 86400000) {
      setReported(true);
    }

    // サーバーからカウント取得
    fetch(`/api/catch-report?spot=${encodeURIComponent(spotSlug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {});
  }, [spotSlug, localKey]);

  const handleReport = useCallback(async () => {
    if (reported) return;

    setReported(true);
    setAnimating(true);
    localStorage.setItem(localKey, Date.now().toString());
    setTimeout(() => setAnimating(false), 600);

    try {
      const res = await fetch("/api/catch-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotSlug,
          sessionId: sessionIdRef.current,
        }),
      });
      const data = await res.json();
      if (typeof data.count === "number") {
        setCount(data.count);
      }
      if (data.error === "already_reported") {
        // すでに報告済み（別タブなどで）
      }
    } catch {
      // オフライン時はローカルのみ記録
    }
  }, [reported, spotSlug, localKey]);

  return (
    <button
      onClick={handleReport}
      disabled={reported}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
        reported
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95",
        animating && "scale-110"
      )}
    >
      <Fish
        className={cn(
          "size-5 transition-transform",
          reported && "text-emerald-500",
          animating && "animate-bounce"
        )}
      />
      <span>{reported ? "釣れた！" : "釣れた！を報告"}</span>
      {count > 0 && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-bold",
            reported ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
