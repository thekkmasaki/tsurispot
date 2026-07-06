"use client";

import { useEffect, useState } from "react";

// 自動化ブラウザ(Playwright/Selenium/headless Chrome等)では false のまま。
// SSR・初回クライアントレンダーも false を返すため hydration ミスマッチは起きない。
export function useAutomationGuard(): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    // SSR・初回レンダーでは必ず false を返し（navigator不在／hydration一致）、
    // マウント後に webdriver でないことを確認してから許可へ切り替える意図的な設計。
    // これ以外の書き方（useState初期化関数など）は SSR で navigator を参照できず不可。
    if (navigator.webdriver !== true) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAllowed(true);
    }
  }, []);
  return allowed;
}
