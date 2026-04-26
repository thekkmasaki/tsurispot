"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface SubscribeButtonProps {
  plan: "basic" | "pro";
}

export function SubscribeButton({ plan }: SubscribeButtonProps) {
  const searchParams = useSearchParams();
  const shopSlug = searchParams.get("shop");
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (!shopSlug || !token) {
      setError("店舗情報が不足しています。管理画面からお申し込みください。");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopSlug, plan, token }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "エラーが発生しました");
        setLoading(false);
      }
    } catch {
      setError("ネットワークエラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1">
      <Button
        onClick={handleClick}
        disabled={loading || !shopSlug || !token}
        className="w-full gap-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CreditCard className="size-4" />
        )}
        {loading ? "処理中..." : "申し込む（決済画面へ）"}
      </Button>
      {error && (
        <p className="mt-2 text-center text-sm text-red-600">{error}</p>
      )}
      {(!shopSlug || !token) && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          ※ 管理画面からアクセスしてください
        </p>
      )}
    </div>
  );
}
