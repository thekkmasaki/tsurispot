"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const BADGE_IMG = "https://tsurispot.com/badge/tsurispot-badge.svg";

export function BadgeSnippet() {
  const [shopUrl, setShopUrl] = useState("https://tsurispot.com/shops/");
  const [copied, setCopied] = useState(false);

  const href = shopUrl.trim() || "https://tsurispot.com/shops";
  const snippet = `<a href="${href}" target="_blank" rel="noopener">
  <img src="${BADGE_IMG}" alt="釣り情報サイト ツリスポ掲載店" width="220" height="64" loading="lazy" />
</a>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard非対応環境ではテキスト選択で対応してもらう
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" htmlFor="shop-url">
        貴店の店舗ページURL（
        <Link prefetch={false} href="/shops" className="text-primary hover:underline">
          釣具店ガイド
        </Link>
        で貴店を開いてURLをコピーしてください）
      </label>
      <input
        id="shop-url"
        type="url"
        value={shopUrl}
        onChange={(e) => setShopUrl(e.target.value)}
        placeholder="https://tsurispot.com/shops/your-shop-slug"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-xs leading-relaxed">
        <code>{snippet}</code>
      </pre>
      <Button size="sm" className="gap-1.5" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="size-4" aria-hidden="true" />
            コピーしました
          </>
        ) : (
          <>
            <Copy className="size-4" aria-hidden="true" />
            HTMLをコピー
          </>
        )}
      </Button>
    </div>
  );
}
