"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { tackleShops } from "@/lib/data/shops";
import { BaitStock } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Store,
  ShieldCheck,
} from "lucide-react";

const TOKENS: Record<string, string> = {
  "point-honmoku": "demo1234",
  "joshunya-enoshima": "demo1234",
  "casting-toyosu": "demo1234",
  "joshunya-wakayama": "demo1234",
  "fishing-yu-oiso": "demo1234",
};

function getStorageKey(slug: string) {
  return `tsurispot-baitstock-${slug}`;
}

export default function ShopDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const token = searchParams.get("token");

  const shop = tackleShops.find((s) => s.slug === slug);
  const isAuthenticated = token === TOKENS[slug];

  const [baitStock, setBaitStock] = useState<BaitStock[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!shop) return;
    const stored = localStorage.getItem(getStorageKey(slug));
    if (stored) {
      setBaitStock(JSON.parse(stored));
    } else if (shop.baitStock) {
      setBaitStock(shop.baitStock);
    }
  }, [slug, shop]);

  if (!shop) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">店舗が見つかりません。</p>
        <Link href="/shops" className="mt-4 inline-block text-primary hover:underline">
          釣具店一覧へ
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="size-8 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-xl font-bold">認証が必要です</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          この管理ページにアクセスするには、ツリスポから発行された専用URLが必要です。
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          掲載店舗のオーナー様は、お問い合わせ時にお送りした管理URLからアクセスしてください。
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  function addBait() {
    setBaitStock((prev) => [
      ...prev,
      { name: "", available: true, price: "", updatedAt: today },
    ]);
    setSaved(false);
  }

  function removeBait(index: number) {
    setBaitStock((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }

  function updateBait(index: number, field: keyof BaitStock, value: string | boolean) {
    setBaitStock((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value, updatedAt: today } : item
      )
    );
    setSaved(false);
  }

  function handleSave() {
    const filtered = baitStock.filter((b) => b.name.trim() !== "");
    setBaitStock(filtered);
    localStorage.setItem(getStorageKey(slug), JSON.stringify(filtered));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        href={`/shops/${slug}`}
        className="mb-5 inline-flex min-h-[44px] items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        店舗ページに戻る
      </Link>

      <div className="mb-6">
        <Badge className="mb-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <Store className="mr-1 size-3" />
          管理画面
        </Badge>
        <h1 className="text-xl font-bold sm:text-2xl">{shop.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          エサの在庫情報を更新できます。変更は保存ボタンを押すと反映されます。
        </p>
      </div>

      <Card className="gap-0 py-0">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold">エサ在庫管理</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={addBait}
              className="gap-1"
            >
              <Plus className="size-4" />
              追加
            </Button>
          </div>

          {baitStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              エサ情報がありません。「追加」ボタンで追加してください。
            </p>
          ) : (
            <div className="space-y-3">
              {baitStock.map((bait, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-3 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="エサの名前（例: アオイソメ）"
                      value={bait.name}
                      onChange={(e) => updateBait(index, "name", e.target.value)}
                      className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => removeBait(index)}
                      className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="削除"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={bait.available}
                        onChange={(e) =>
                          updateBait(index, "available", e.target.checked)
                        }
                        className="rounded"
                      />
                      在庫あり
                    </label>
                    <input
                      type="text"
                      placeholder="価格（例: 500円/パック）"
                      value={bait.price || ""}
                      onChange={(e) =>
                        updateBait(index, "price", e.target.value)
                      }
                      className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={handleSave} className="gap-1.5">
              <Save className="size-4" />
              保存する
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600 font-medium">
                保存しました
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        ※ 現在はブラウザのローカルストレージに保存されます。同じブラウザからのみ変更内容が反映されます。
      </p>
    </div>
  );
}
