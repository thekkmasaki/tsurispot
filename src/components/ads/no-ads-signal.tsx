"use client";

import { useEffect } from "react";

/**
 * 有料店舗ページなど、広告を非表示にしたいページでレンダリングする。
 * body に data-no-ads="true" を付与し、全広告コンポーネントを抑制する。
 */
export function NoAdsSignal() {
  useEffect(() => {
    document.body.setAttribute("data-no-ads", "true");
    return () => {
      document.body.removeAttribute("data-no-ads");
    };
  }, []);

  return null;
}
