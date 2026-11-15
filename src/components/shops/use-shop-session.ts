"use client";

import { useEffect, useRef, useState } from "react";

export type ShopAuthStatus = "checking" | "ok" | "denied";

const DEMO_SHOPS = new Set(["sample-premium", "sample-basic", "sample-free"]);

/**
 * 店舗オーナー管理ページの認証フック。
 *
 * - URL に ?token= があれば /api/shop-auth/session に送って HttpOnly Cookie（shop_session）と交換し、
 *   history.replaceState で即座に URL からトークンを消す（履歴・Referer・スクショからの漏えい防止）。
 * - トークンが無ければ Cookie で /api/shop-auth/verify を呼んで認証状態を確認する。
 * - opts.allowDemo 指定時、デモ店舗（sample-*）は従来どおり認証なしで操作体験できる（status=ok, isDemo=true）。
 *
 * 返す token は「このタブで URL から受け取った生トークン」（後方互換用・メモリ上のみ）。
 * API へは body で送ってよいが、URL のクエリには絶対に載せないこと。
 */
export function useShopSession(
  shop: string | null | undefined,
  opts?: { allowDemo?: boolean },
): {
  status: ShopAuthStatus;
  token: string | null;
  isDemo: boolean;
} {
  const isDemo = !!opts?.allowDemo && !!shop && DEMO_SHOPS.has(shop);
  const [status, setStatus] = useState<ShopAuthStatus>("checking");
  const [token, setToken] = useState<string | null>(null);
  // URL から受け取ったトークン（Strict Mode の effect 二重実行で URL から消えた後も交換できるよう保持）
  const urlTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shop) {
      setStatus("denied");
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("token")) urlTokenRef.current = url.searchParams.get("token");
    const urlToken = urlTokenRef.current;

    if (isDemo) {
      setToken(urlToken || "demo");
      setStatus("ok");
      return;
    }

    if (urlToken) {
      // 交換結果を待たずに URL からトークンを消す
      if (url.searchParams.has("token")) {
        url.searchParams.delete("token");
        window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      }
      setToken(urlToken);
    }

    let active = true;
    const req = urlToken
      ? fetch("/api/shop-auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ shop, token: urlToken }),
        })
      : fetch("/api/shop-auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ shop }),
        });
    req
      .then((r) => r.json())
      .then((d) => {
        if (active) setStatus(d?.ok ? "ok" : "denied");
      })
      .catch(() => {
        if (active) setStatus("denied");
      });
    return () => {
      active = false;
    };
  }, [shop, isDemo]);

  return { status, token, isDemo };
}
