"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopInfoForm } from "./shop-info-form";

type StockStatus = "available" | "low" | "out";

interface BaitItem {
  name: string;
  available: boolean;
  status: StockStatus;
  price: string;
}

const PRESET_BAITS = [
  "アオイソメ",
  "石ゴカイ",
  "シラサエビ",
  "オキアミ 3kg",
  "アミエビ 2kg",
  "ユムシ",
  "マムシ（本虫）",
  "ボケ",
  "サシアミ",
  "アジ（活きエサ）",
  "コーン",
];

type TabType = "bait" | "info";

export function ShopUpdateForm({ shopName }: { shopName?: string }) {
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");
  const token = searchParams.get("token");

  const [activeTab, setActiveTab] = useState<TabType>("bait");
  const [items, setItems] = useState<BaitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedShop, setSavedShop] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!shop) {
      setLoading(false);
      return;
    }
    fetch(`/api/bait-stock?shop=${shop}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stock && data.stock.length > 0) {
          setItems(
            data.stock.map((s: { name: string; available: boolean; status?: StockStatus; price?: string }) => ({
              name: s.name,
              available: s.available,
              status: s.status || (s.available ? "available" : "out"),
              price: s.price || "",
            }))
          );
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [shop]);

  const cycleStatus = useCallback((index: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next: StockStatus =
          item.status === "available" ? "low" : item.status === "low" ? "out" : "available";
        return { ...item, status: next, available: next !== "out" };
      })
    );
    setSaved(false);
  }, []);

  const updatePrice = useCallback((index: number, price: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, price } : item))
    );
    setSaved(false);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  }, []);

  const addPreset = useCallback((name: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.name === name)) return prev;
      return [...prev, { name, available: true, status: "available" as StockStatus, price: "" }];
    });
    setSaved(false);
  }, []);

  const addCustom = useCallback(() => {
    if (!newName.trim()) return;
    setItems((prev) => [
      ...prev,
      { name: newName.trim(), available: true, status: "available" as StockStatus, price: "" },
    ]);
    setNewName("");
    setSaved(false);
  }, [newName]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/bait-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, token, stock: items }),
      });
      if (res.ok) {
        setSaved(true);
        setSavedShop(shop);
      } else {
        const data = await res.json();
        setError(data.error || "更新に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました。電波の良い場所で再度お試しください。");
    }
    setSaving(false);
  };

  const isDemo = shop === "sample-premium" || shop === "sample-basic" || shop === "sample-free";

  if (!shop || (!token && !isDemo)) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg font-bold text-muted-foreground">
          専用リンクからアクセスしてください
        </p>
        <p className="text-sm text-muted-foreground">
          リンクが不明な場合は fishingspotjapan@gmail.com までご連絡ください。
        </p>
        <div className="pt-4 border-t">
          <Link
            href="/shops/update?shop=sample-premium&token=demo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            デモを体験してみる →
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  const unusedPresets = PRESET_BAITS.filter(
    (name) => !items.some((item) => item.name === name)
  );

  return (
    <div className="space-y-6">
      {/* デモモードバナー */}
      {isDemo && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 dark:bg-blue-950/30 dark:border-blue-800">
          <p className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">
            🎮 デモモード
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            これはお試し用のデモページです。実際にボタンをタップして操作感をお確かめください。無料プラン（1日10回まで更新可）のほか、ベーシック（最初の1年は月額500円、その後月額980円・写真3枚・公式バッジ・Googleのお店情報を整備）、プロ（最初の1年は月額1,980円、その後月額2,980円・1日50回更新・写真20枚・クーポン掲載・Googleのお店情報を整備）もお選びいただけます。
          </p>
          <a
            href="mailto:fishingspotjapan@gmail.com?subject=店舗管理について"
            className="inline-block mt-2 text-xs font-medium text-blue-600 underline dark:text-blue-400"
          >
            お申し込み・お問い合わせ →
          </a>
        </div>
      )}

      {/* タブ切り替え */}
      <div className="flex rounded-lg border bg-muted/50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("bait")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "bait"
              ? "bg-white dark:bg-gray-800 shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          エサ在庫
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "info"
              ? "bg-white dark:bg-gray-800 shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          店舗情報
        </button>
      </div>

      {/* 店舗情報タブ */}
      {activeTab === "info" && <ShopInfoForm />}

      {/* エサ在庫タブ */}
      {activeTab !== "bait" ? null : (<>
      {/* エサ一覧 */}
      {items.length === 0 ? (
        <div className="text-center py-8 rounded-xl border-2 border-dashed">
          <p className="text-muted-foreground mb-2">
            エサが登録されていません
          </p>
          <p className="text-sm text-muted-foreground">
            下のボタンから追加してください
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className={`rounded-xl border-2 transition-colors ${
                item.status === "available"
                  ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                  : item.status === "low"
                    ? "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30"
              }`}
            >
              <div className="p-4">
                {/* 上段: エサ名 + 削除 */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-base">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={`${item.name}を削除`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 中段: 3段階トグル（タップで切り替え） */}
                <button
                  type="button"
                  onClick={() => cycleStatus(index)}
                  className={`w-full py-3 rounded-lg text-base font-bold transition-all active:scale-[0.98] ${
                    item.status === "available"
                      ? "bg-green-500 text-white shadow-sm"
                      : item.status === "low"
                        ? "bg-yellow-400 text-yellow-900 shadow-sm"
                        : "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  }`}
                >
                  {item.status === "available"
                    ? "✓ 在庫あり"
                    : item.status === "low"
                      ? "△ 在庫少ない"
                      : "✕ 在庫なし"}
                </button>
                <p className="text-[11px] text-center text-muted-foreground mt-1">
                  タップで切り替え: あり → 少ない → なし
                </p>

                {/* 下段: 価格 */}
                <div className="mt-2">
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => updatePrice(index, e.target.value)}
                    placeholder="価格（例: 500円/パック）"
                    className="w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* エサ追加セクション */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-2 text-sm font-medium text-primary"
        >
          <Plus className="w-4 h-4" />
          エサを追加する
        </button>

        {showPresets && (
          <div className="rounded-xl border p-4 space-y-4">
            {/* よく使うエサ（プリセット） */}
            {unusedPresets.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  タップで追加
                </p>
                <div className="flex flex-wrap gap-2">
                  {unusedPresets.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => addPreset(name)}
                      className="px-3 py-1.5 text-sm rounded-full border bg-white hover:bg-primary/5 hover:border-primary/30 transition-colors dark:bg-gray-800"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* カスタム追加 */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                その他のエサを入力
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="エサ名を入力"
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustom}
                  disabled={!newName.trim()}
                  className="px-4"
                >
                  追加
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 保存ボタン（固定フッター風） */}
      <div className="sticky bottom-4 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving || saved || items.length === 0}
          size="lg"
          className={`w-full text-base font-bold py-6 rounded-xl shadow-lg transition-all ${
            saved
              ? "bg-green-500 hover:bg-green-600"
              : ""
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              保存中...
            </>
          ) : saved ? (
            "✓ 保存しました！"
          ) : (
            "在庫情報を保存する"
          )}
        </Button>
      </div>

      {/* 保存後: 店舗ページ確認リンク */}
      {saved && savedShop && (
        <a
          href={`/shops/${savedShop}`}
          className="block text-center rounded-xl border-2 border-green-300 bg-green-50 p-4 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
        >
          🏪 店舗ページで反映を確認する →
        </a>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ヘルプ */}
      <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4 space-y-2 text-xs text-muted-foreground">
        <p className="font-medium text-foreground text-sm">使い方</p>
        <ul className="space-y-1 list-disc pl-4">
          <li>ボタンをタップすると「在庫あり → 在庫少ない → 在庫なし」の3段階で切り替わります</li>
          <li>価格は入力しなくてもOKです</li>
          <li>変更したら「在庫情報を保存する」を押してください</li>
          <li>保存した情報はツリスポの店舗ページにすぐ反映されます</li>
        </ul>
        <p className="pt-2">
          ご不明な点は{" "}
          <a
            href="mailto:fishingspotjapan@gmail.com"
            className="text-primary underline"
          >
            fishingspotjapan@gmail.com
          </a>{" "}
          までお気軽にどうぞ。
        </p>
      </div>
      </>)}
    </div>
  );
}
