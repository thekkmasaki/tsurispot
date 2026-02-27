"use client";

import { type ReactNode } from "react";
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

export function SpotDetailTabs({
  overviewTab,
  fishTab,
  gearTab,
  accessTab,
}: SpotDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList className="w-full overflow-x-auto scrollbar-hide">
        {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-1 px-2 py-2 text-xs sm:gap-1.5 sm:px-3 sm:text-sm min-h-[40px]"
          >
            <Icon className="size-3.5 sm:size-4" />
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
