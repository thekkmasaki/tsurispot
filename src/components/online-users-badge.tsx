"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";

function getEstimatedUsers(): number {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  // 時間帯別の基本値
  const hourlyBase: Record<number, number> = {
    0: 8, 1: 5, 2: 3, 3: 2, 4: 3, 5: 12,
    6: 20, 7: 28, 8: 32, 9: 35, 10: 38, 11: 40,
    12: 42, 13: 38, 14: 35, 15: 36, 16: 40, 17: 45,
    18: 50, 19: 55, 20: 52, 21: 45, 22: 30, 23: 15,
  };

  let base = hourlyBase[hour] ?? 20;
  if (isWeekend) base = Math.round(base * 1.4);

  // ランダム変動（±15%）
  const variance = base * 0.15;
  return Math.max(1, Math.round(base + (Math.random() * 2 - 1) * variance));
}

export function OnlineUsersBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(getEstimatedUsers());
    const timer = setInterval(() => {
      setCount(getEstimatedUsers());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (count === null) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-green-400" />
      </span>
      <Users className="size-3" />
      <span>{count}人が閲覧中</span>
    </div>
  );
}
