"use client";

import { useEffect } from "react";
import { detectAdBlock } from "@/lib/adblock-detect";
import { trackAdBlock } from "@/lib/ads-tracking";

/**
 * 広告ブロック率の実測コンポーネント。layout に1回だけマウントする。
 * ページのフルロード毎に detectAdBlock() を1回実行し、結果を GA4 へ送る。
 *
 * App Router の layout はクライアント遷移でアンマウントされないため、
 * mount-once = フルロード毎1回で過剰送信にならない（SPA遷移では再送しない）。
 */
export function AdBlockMeasure() {
  useEffect(() => {
    let cancelled = false;
    detectAdBlock().then((blocked) => {
      if (!cancelled) trackAdBlock(blocked);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
