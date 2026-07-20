"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Fish, Wrench, Car, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SpotDetailTabsProps {
  overviewTab: ReactNode;
  fishTab: ReactNode;
  gearTab: ReactNode;
  accessTab: ReactNode;
}

const TAB_ITEMS = [
  { value: "overview", label: "概要", icon: Info },
  { value: "fish", label: "釣れる魚", icon: Fish },
  { value: "gear", label: "装備・仕掛け", icon: Wrench },
  { value: "access", label: "アクセス", icon: Car },
] as const;

const VALID_TAB_VALUES = new Set(TAB_ITEMS.map((t) => t.value));

export function SpotDetailTabs({
  overviewTab,
  fishTab,
  gearTab,
  accessTab,
}: SpotDetailTabsProps) {
  // UX-5: tab state を URL に同期 (share/back/reload で復元)
  const router = useRouter();
  const pathname = usePathname();

  // useSearchParams() は使わない: Suspense 境界なしで呼ぶとページ全体が CSR へ
  // バックアウトし、スポット詳細の SSR HTML から本文・広告が丸ごと消える
  // （2026-07 判明: h1 なし・広告 ins が pre_footer のみの本番 HTML の原因）。
  // SSR は overview 固定で描画し、マウント後に window.location.search から復元する。
  const [activeTab, setActiveTab] = useState<string>("overview");
  const didMount = useRef(false);

  // マウント後: URL の tab パラメータを復元 (share/back/reload で復元)
  useEffect(() => {
    const urlTab = new URLSearchParams(window.location.search).get("tab") ?? "";
    if (VALID_TAB_VALUES.has(urlTab as typeof TAB_ITEMS[number]["value"])) {
      setActiveTab(urlTab);
    }
  }, []);

  // tab 変更 → URL 更新（初回実行はスキップ: 復元前に ?tab= を消さないため）
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (activeTab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", activeTab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="w-full overflow-x-auto scrollbar-hide bg-sand-light/80 rounded-2xl p-1.5 sticky top-14 z-20 backdrop-blur-sm shadow-sm">
        {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-1 px-2 py-2 text-xs rounded-xl font-bold font-display data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-ocean-deep sm:gap-1.5 sm:px-3 sm:text-sm min-h-[40px]"
          >
            <Icon className="size-3.5 sm:size-4" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-4 space-y-6 sm:space-y-8">
        {overviewTab}
      </TabsContent>
      <TabsContent value="fish" className="mt-4 space-y-6 sm:space-y-8">
        {fishTab}
      </TabsContent>
      <TabsContent value="gear" className="mt-4 space-y-6 sm:space-y-8">
        {gearTab}
      </TabsContent>
      <TabsContent value="access" className="mt-4 space-y-6 sm:space-y-8">
        {accessTab}
      </TabsContent>
    </Tabs>
  );
}
