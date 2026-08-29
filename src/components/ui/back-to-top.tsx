"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisible(window.scrollY > 400);
    }, 100);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="トップへ戻る"
      className={cn(
        "fixed z-40 flex items-center justify-center rounded-full",
        "size-10 sm:size-11",
        // モバイルは「ボトムナビ(60px+safe-area) + 固定広告(99px) + ✕のはみ出し(24px) + 分離(16px)」の上へ。
        // 旧値(60px+safe-area)は固定広告と完全に同一座標・同一 z-40 で、layout.tsx の描画順により
        // このボタンが広告の上に乗っていた（広告面積の約4.3%を半透明で覆う）。AdSense の
        // 「広告にナビゲーション等のアクション要素を重ねない」規定に触れるため座標を分離する。
        // ブレークポイントは sm(640px) ではなく md(768px)。固定広告は ad-unit.tsx の
        // useMediaQuery("(max-width: 767px)") で表示されるため、md 未満は常に広告を避ける必要がある。
        "bottom-[calc(215px+env(safe-area-inset-bottom,0px))] right-4 md:bottom-6 md:right-6",
        "bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm",
        "text-gray-700 dark:text-gray-200",
        "shadow-lg border border-gray-200/50 dark:border-gray-700/50",
        "transition-all duration-300 ease-in-out",
        "hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-xl",
        "cursor-pointer",
        visible
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-75 opacity-0"
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
