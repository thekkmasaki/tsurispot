"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";

function getEstimatedUsers(): number {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  // 時間帯別の基本値（月間18万PV規模に対応）
  const hourlyBase: Record<number, number> = {
    0: 36, 1: 24, 2: 16, 3: 10, 4: 16, 5: 50,
    6: 90, 7: 120, 8: 136, 9: 150, 10: 160, 11: 170,
    12: 180, 13: 164, 14: 150, 15: 156, 16: 170, 17: 190,
    18: 210, 19: 230, 20: 220, 21: 190, 22: 130, 23: 70,
  };

  let base = hourlyBase[hour] ?? 45;
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
