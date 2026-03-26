"use client";

import type { SpotAnalysisResult } from "@/lib/patent/types";
import type { SpotMapAnalysis } from "./spot-leaflet-map";
import React, { useState, useEffect, useRef } from "react";

interface LeafletMapSectionProps {
  analysisResult: SpotAnalysisResult;
}

function toMapData(r: SpotAnalysisResult): SpotMapAnalysis {
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
  };
}

export function LeafletMapSection({ analysisResult }: LeafletMapSectionProps) {
  const [MapComp, setMapComp] = useState<React.ComponentType<{ data: SpotMapAnalysis }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // CSS をheadに注入
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("@/components/map/spot-leaflet-map")
      .then((m) => {
        setMapComp(() => m.SpotLeafletMap);
      })
      .catch((err) => {
        console.error("[LeafletMap]", err);
        setError(err?.message || "地図の読み込みに失敗しました");
      });
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
      <div className="mt-6">
        <h3 className="mb-3 text-lg font-bold">AI解析 釣りマップ</h3>
        <div className="h-[480px] w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-lg font-bold">AI解析 釣りマップ</h3>
      <ErrorCatcher onError={(msg) => setError(msg)}>
        <MapComp data={toMapData(analysisResult)} />
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
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
