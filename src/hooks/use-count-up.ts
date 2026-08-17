"use client";
/**
 * 数字のカウントアップ（ワクワク演出の基盤）。
 * - ease-out cubic で目標値まで数え上げる
 * - prefers-reduced-motion では即時確定
 * - 目標値が変わるたびに現在表示値から再カウント
 */
import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target);
  const shownRef = useRef<number | null>(null);

  useEffect(() => {
    const from = shownRef.current ?? 0;
    if (from === target) {
      shownRef.current = target;
      setValue(target);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      shownRef.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = Math.round(from + (target - from) * eased);
      shownRef.current = v;
      setValue(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}
