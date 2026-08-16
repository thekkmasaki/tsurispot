"use client";

import { Fish } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { FishdexGrid } from "@/components/fish/fishdex-grid";
import { FishdexLoginPrompt } from "@/components/fish/fishdex-login-prompt";
import { useFishdex } from "@/hooks/use-fishdex";

interface FishListItem {
  slug: string;
  name: string;
  imageUrl: string;
}

export function FishdexClient({ fishList }: { fishList: FishListItem[] }) {
  const { count, isCaught, toggle, isAuthenticated } = useFishdex();

  const entries = fishList.map((f) => ({
    ...f,
    caught: isCaught(f.slug),
  }));

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[{ label: "ホーム", href: "/" }, { label: "あなたの魚図鑑" }]}
      />

      <div className="mb-4 mt-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Fish className="h-6 w-6 text-primary" />
            あなたの魚図鑑
          </h1>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
              isAuthenticated
                ? "border-emerald-300 text-emerald-700"
                : "border-border text-muted-foreground"
            }`}
          >
            {isAuthenticated ? "同期済み" : "この端末に保存中"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          釣ったことのある魚を○でタップ。ログインは要りません。
        </p>
      </div>

      <FishdexLoginPrompt caughtCount={count} className="mb-4" />

      <FishdexGrid entries={entries} onToggle={toggle} />
    </div>
  );
}
