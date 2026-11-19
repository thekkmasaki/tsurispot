"use client";

import dynamic from "next/dynamic";
import type { MapSpot } from "@/types";

const SpotMap = dynamic(
  () => import("@/components/map/spot-map").then((m) => m.SpotMap),
  {
    ssr: false,
    loading: () => (
      <div className="map-viewport-h w-full animate-pulse rounded-lg bg-muted" />
    ),
  }
);

export function MapWrapper({ spots }: { spots: MapSpot[] }) {
  return <SpotMap spots={spots} />;
}
