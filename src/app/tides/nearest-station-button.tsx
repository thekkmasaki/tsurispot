"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { TIDE_STATIONS } from "@/lib/tide/stations";
import { getStationSlug } from "@/lib/tide/station-slugs";

/** 現在地から最寄りの観測地点の潮見表へ移動するボタン（位置情報は端末内でのみ使用） */
export function NearestStationButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "locating" | "error">("idle");

  const locate = () => {
    if (!navigator.geolocation) {
      setState("error");
      return;
    }
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const rad = Math.PI / 180;
        let best: { slug: string } | null = null;
        let bestDist = Infinity;
        for (const st of TIDE_STATIONS) {
          const dLat = (st.lat - latitude) * rad;
          const dLng = (st.lng - longitude) * rad;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(latitude * rad) * Math.cos(st.lat * rad) * Math.sin(dLng / 2) ** 2;
          const d = 2 * 6371 * Math.asin(Math.sqrt(a));
          const slug = getStationSlug(st.code);
          if (slug && d < bestDist) {
            bestDist = d;
            best = { slug };
          }
        }
        if (best) router.push(`/tides/${best.slug}`);
        else setState("error");
      },
      () => setState("error"),
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  return (
    <div>
      <button
        type="button"
        onClick={locate}
        disabled={state === "locating"}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow transition-colors hover:bg-sky-700 disabled:opacity-60"
      >
        <LocateFixed className="h-4 w-4" />
        {state === "locating" ? "現在地を取得中..." : "現在地から最寄りの潮見表を開く"}
      </button>
      {state === "error" && (
        <p className="mt-1 text-xs text-muted-foreground">
          位置情報を取得できませんでした。下の一覧から地点を選んでください。
        </p>
      )}
    </div>
  );
}
