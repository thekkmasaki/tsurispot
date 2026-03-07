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
        "bottom-4 right-4 sm:bottom-6 sm:right-6",
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
