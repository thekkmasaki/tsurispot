"use client";

import { useEffect } from "react";
import { detectAdBlock } from "@/lib/adblock-detect";
import { trackAdBlock } from "@/lib/ads-tracking";

/**
 * 広告ブロック率の実測コンポーネント。layout に1回だけマウントする。
 * ページのフルロード毎に detectAdBlock() を1回実行し、結果を GA4 へ送る。
 *
 * detectAdBlock はイベント駆動（bait 即判定 + adsbygoogle.js の load/error 確定待ち）で、
 * スクリプト状態が確定する前に離脱したセッションでは resolve されない＝送信されない。
 * このため集計は誤陽性を含まない「真の下限値」になる（壁時計タイマーだった旧実装は
 * 遅い回線の正常ユーザーを過大計上していた。監査 F4 で修正）。
 *
 * App Router の layout はクライアント遷移でアンマウントされないため、
 * mount-once = フルロード毎1回で過剰送信にならない（SPA遷移では再送しない）。
 */
export function AdBlockMeasure() {
  useEffect(() => {
    let cancelled = false;
    detectAdBlock().then((detection) => {
      if (!cancelled) trackAdBlock(detection);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
