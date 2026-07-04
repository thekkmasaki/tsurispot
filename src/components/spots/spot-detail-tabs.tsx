"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlTab = searchParams.get("tab") ?? "";
  const initialTab = VALID_TAB_VALUES.has(urlTab as typeof TAB_ITEMS[number]["value"])
    ? urlTab
    : "overview";

  const [activeTab, setActiveTab] = useState(initialTab);

  // tab 変更 → URL 更新
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
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

      {/* SEO: forceMount で全タブ内容を初期HTMLに含め、非活性タブは CSS で隠す
          （ui/tabs.tsx は props 透過なのでスポット詳細のタブにのみ適用される） */}
      <TabsContent value="overview" forceMount className="mt-4 space-y-6 data-[state=inactive]:hidden sm:space-y-8">
        {overviewTab}
      </TabsContent>
      <TabsContent value="fish" forceMount className="mt-4 space-y-6 data-[state=inactive]:hidden sm:space-y-8">
        {fishTab}
      </TabsContent>
      <TabsContent value="gear" forceMount className="mt-4 space-y-6 data-[state=inactive]:hidden sm:space-y-8">
        {gearTab}
      </TabsContent>
      <TabsContent value="access" forceMount className="mt-4 space-y-6 data-[state=inactive]:hidden sm:space-y-8">
        {accessTab}
      </TabsContent>
    </Tabs>
  );
}
