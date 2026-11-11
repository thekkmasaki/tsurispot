"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Fish, Wrench, Car, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SpotDetailTabsProps {
  overviewTab: ReactNode;
  fishTab: ReactNode;
  gearTab: ReactNode;
  accessTab: ReactNode;
  /** タブ見出しに出す件数（サウナイキタイ式「サ活(820)」のように中身の量を見せる） */
  fishCount?: number;
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
  fishCount,
}: SpotDetailTabsProps) {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- URL からの一度きりの復元
      setActiveTab(urlTab);
    }
  }, []);

  // tab 変更 → URL 更新（初回実行はスキップ: 復元前に ?tab= を消さないため）。
  // router.replace は同一ルートでも RSC ペイロード（数百KB）を取りに行くため、
  // History API で URL だけ書き換える（App Router 公式サポート）。
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
    window.history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      {/* サウナイキタイ式: 下線タブ＋件数。影・角丸の塗りタブはやめて線で区切る */}
      <TabsList className="sticky top-14 z-20 h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b bg-background/95 p-0 scrollbar-hide backdrop-blur-sm">
        {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="relative flex min-h-[44px] flex-none items-center gap-1 rounded-none border-0 border-b-2 border-transparent px-3 py-2 text-sm font-bold text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:px-4"
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
            {value === "fish" && fishCount != null && fishCount > 0 && (
              <span className="text-xs font-normal tabular-nums">({fishCount})</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* forceMount: 非アクティブなタブの中身も SSR HTML に出す。
          Radix は既定で非アクティブな TabsContent を DOM に描画しないため、
          「釣れる魚」「装備・仕掛け」「アクセス」タブの本文が検索エンジンから見えていなかった。
          表示の切替は data-state による CSS の hidden で行う（中身は常に HTML にある）。 */}
      <TabsContent forceMount value="overview" className="mt-4 space-y-6 data-[state=inactive]:hidden sm:space-y-8">
        {overviewTab}
      </TabsContent>
      <TabsContent forceMount value="fish" className="mt-4 space-y-6 data-[state=inactive]:hidden sm:space-y-8">
        {fishTab}
      </TabsContent>
      <TabsContent forceMount value="gear" className="mt-4 space-y-6 data-[state=inactive]:hidden sm:space-y-8">
        {gearTab}
      </TabsContent>
      <TabsContent forceMount value="access" className="mt-4 space-y-6 data-[state=inactive]:hidden sm:space-y-8">
        {accessTab}
      </TabsContent>
    </Tabs>
  );
}
