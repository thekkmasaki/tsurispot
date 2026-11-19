"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/** MCP エンドポイント URL の表示＋コピーボタン */
export function CopyEndpoint({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 非対応環境ではテキスト選択でコピーしてもらう
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <pre className="min-w-0 flex-1 overflow-x-auto rounded-md border bg-muted px-3 py-2.5 text-sm">
        <code className="select-all font-mono">{value}</code>
      </pre>
      <Button size="sm" className="min-h-[40px] shrink-0 gap-1.5" onClick={handleCopy} aria-label="エンドポイントURLをコピー">
        {copied ? (
          <>
            <Check className="size-4" aria-hidden="true" />
            コピーしました
          </>
        ) : (
          <>
            <Copy className="size-4" aria-hidden="true" />
            URLをコピー
          </>
        )}
      </Button>
    </div>
  );
}
