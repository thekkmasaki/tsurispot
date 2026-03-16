"use client";

import dynamic from "next/dynamic";
import type { FishingPointMapProps } from "./fishing-point-map";

const FishingPointMap = dynamic(
  () => import("./fishing-point-map").then((m) => m.FishingPointMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[450px] w-full animate-pulse rounded-xl bg-muted" />
    ),
  }
);

export function FishingPointMapWrapper(props: FishingPointMapProps) {
  return <FishingPointMap {...props} />;
}
