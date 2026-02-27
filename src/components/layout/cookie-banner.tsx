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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-md md:rounded-lg md:border">
      <p className="text-sm text-muted-foreground">
        当サイトでは、サービス向上やアクセス解析のためにCookieを使用しています。
        サイトの利用を続けることで、Cookieの使用に同意したものとみなします。
        詳しくは
        <Link
          href="/privacy"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
        >
          プライバシーポリシー
        </Link>
        をご確認ください。
      </p>
      <div className="mt-3 flex items-center justify-end gap-3">
        <button
          onClick={handleAccept}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          同意する
        </button>
      </div>
    </div>
  );
}
