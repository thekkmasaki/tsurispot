import type { Metadata } from "next";
import type { Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Store } from "lucide-react";
import { ShopUpdateForm } from "@/components/shops/shop-update-form";

export const metadata: Metadata = {
  title: "エサ在庫更新 | ツリスポ",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0c4a6e",
};

export default function ShopUpdatePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            <span className="font-bold text-primary">ツリスポ</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            エサ在庫管理
          </span>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="mb-6">
          <h1 className="text-xl font-bold">エサ在庫の更新</h1>
          <p className="text-sm text-muted-foreground mt-1">
            在庫状況を更新すると、お店のページにすぐ反映されます。
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-muted-foreground">読み込み中...</div>}>
          <ShopUpdateForm />
        </Suspense>
      </div>
    </div>
  );
}
