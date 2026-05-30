"use client";

import type { SpotAnalysisResult } from "@/lib/patent/types";
import type { SpotMapAnalysis } from "./spot-leaflet-map";
import React, { useState, useEffect, useRef } from "react";

interface SpotBasicInfo {
  name: string;
  address: string;
  spotType: string;
  isFree: boolean;
  feeDetail?: string;
  managementInfo?: {
    organizationName: string;
    contactPhone?: string;
    openingHours?: string;
    closedDays?: string;
    fishingFee?: string;
  };
}

interface SpotFacilitiesInfo {
  hasParking: boolean;
  parkingDetail?: string;
  parkingGuide?: { parkingLatitude?: number; parkingLongitude?: number };
  hasToilet: boolean;
  hasConvenienceStore: boolean;
  hasFishingShop: boolean;
  hasRentalRod: boolean;
  rentalDetail?: string;
}

interface NearbySpotData {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  spotType: string;
  distanceKm: number;
}

interface LeafletMapSectionProps {
  analysisResult: SpotAnalysisResult;
  spot?: SpotBasicInfo;
  spotFacilities?: SpotFacilitiesInfo;
  restrictedAreas?: string[];
  nearbySpots?: NearbySpotData[];
}

function toMapData(
  r: SpotAnalysisResult,
  spot?: SpotBasicInfo,
  spotFacilities?: SpotFacilitiesInfo,
  restrictedAreas?: string[],
  nearbySpots?: NearbySpotData[],
): SpotMapAnalysis {
  return {
    coordinates: r.coordinates,
    zones: r.zones.map((z) => ({
      id: z.id,
      name: z.name,
      xRange: z.xRange,
      structures: z.structures,
      seaBottomFeatures: z.seaBottomFeatures,
      estimatedDepth: z.estimatedDepth,
      currentFlow: z.currentFlow,
      estimatedFish: z.estimatedFish.map((f) => ({
        name: f.name,
        method: f.method,
        season: f.season,
        difficulty: f.difficulty,
        probability: f.probability,
      })),
      rating: z.rating,
    })),
    facilities: r.facilities.map((f) => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
      relativePosition: f.relativePosition,
    })),
    structureLength: r.structureLength,
    structureLabel: r.structureLabel,
    seaLabel: r.seaLabel,
    structureEndpoints: r.structureEndpoints,
    detectedTetrapods: r.detectedTetrapods,
    spotInfo: spot,
    spotFacilities,
    restrictedAreas,
    nearbySpots,
  };
}

export function LeafletMapSection({ analysisResult, spot, spotFacilities, restrictedAreas, nearbySpots }: LeafletMapSectionProps) {
  const [MapComp, setMapComp] = useState<React.ComponentType<{ data: SpotMapAnalysis }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 地図はスポット詳細のかなり下部にあるため、ファーストビューで即ロードせず
  // IntersectionObserver で可視直前(rootMargin 400px)になってから leaflet チャンクを import する。
  // Leaflet CSS は spot-leaflet-map 側で self-host import 済み（unpkg 依存を排除）。
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let cancelled = false;

    const load = () => {
      if (loaded.current) return;
      loaded.current = true;
      import("@/components/map/spot-leaflet-map")
        .then((m) => {
          if (!cancelled) setMapComp(() => m.SpotLeafletMap);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("[LeafletMap]", err);
          setError(err?.message || "地図の読み込みに失敗しました");
        });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, []);

  if (error) {
    return (
      <div className="mt-6 rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        地図の読み込みに失敗しました
      </div>
    );
  }

  if (!MapComp) {
    return (
      <div ref={rootRef} className="mt-6">
        <h3 className="mb-3 text-lg font-bold">AI解析 釣りマップ</h3>
        <div className="h-[360px] w-full animate-pulse rounded-lg bg-muted sm:h-[480px]" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-lg font-bold">AI解析 釣りマップ</h3>
      <ErrorCatcher onError={(msg) => setError(msg)}>
        <MapComp data={toMapData(analysisResult, spot, spotFacilities, restrictedAreas, nearbySpots)} />
      </ErrorCatcher>
    </div>
  );
}

class ErrorCatcher extends React.Component<
  { children: React.ReactNode; onError: (msg: string) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (msg: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[LeafletMap Error]", error.message);
    this.props.onError(error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[360px] items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground sm:h-[480px]">
          地図の読み込みに失敗しました
        </div>
      );
    }
    return this.props.children;
  }
}
