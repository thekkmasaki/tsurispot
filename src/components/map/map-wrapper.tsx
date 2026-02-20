"use client";

import dynamic from "next/dynamic";

const SpotMap = dynamic(
  () => import("@/components/map/spot-map").then((m) => m.SpotMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[60vh] w-full animate-pulse rounded-lg bg-muted sm:h-[70vh] md:h-[80vh]" />
    ),
  }
);

export function MapWrapper() {
  return <SpotMap />;
}
