"use client";

import { Fish, Car, Cloud, MapPin } from "lucide-react";

const NAV_ITEMS = [
  { id: "fish-season", label: "釣れる魚", icon: Fish },
  { id: "weather-tide", label: "天気・潮汐", icon: Cloud },
  { id: "access-info", label: "アクセス", icon: Car },
  { id: "nearby-spots", label: "近くの釣り場", icon: MapPin },
];

export function MobileQuickNav() {
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <div className="lg:hidden -mx-4 mb-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 pb-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600 min-h-[44px]"
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
