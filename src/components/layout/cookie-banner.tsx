"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "tsurispot-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 py-2 shadow-lg md:px-4 md:py-2.5">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground md:text-sm">
          <span className="hidden sm:inline">当サイトではCookieを使用しています。</span>
          <span className="sm:hidden">Cookie使用に同意しますか？</span>
          <Link
            href="/privacy"
            className="ml-1 text-primary underline underline-offset-2 hover:text-primary/80"
          >
            詳細
          </Link>
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors md:px-4 md:py-1.5 md:text-sm"
        >
          同意する
        </button>
      </div>
    </div>
  );
}
