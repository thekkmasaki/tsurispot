"use client";

import dynamic from "next/dynamic";
import type { SpotMapAnalysis } from "./spot-leaflet-map";

const SpotLeafletMap = dynamic(
  () =>
    import("@/components/map/spot-leaflet-map").then(
      (m) => m.SpotLeafletMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted sm:h-[450px]" />
    ),
  }
);

export function SpotLeafletMapWrapper({ data }: { data: SpotMapAnalysis }) {
  return (
    <>
      <style>{`.spot-analysis-map .leaflet-container { height: 450px !important; }`}</style>
      <div className="spot-analysis-map">
        <SpotLeafletMap data={data} />
      </div>
    </>
  );
}
