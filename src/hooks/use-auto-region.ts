"use client";

import { useState, useEffect, useCallback } from "react";
import type { RegionSlug } from "@/types";
import { getRegionFromCoords } from "@/lib/geo-to-region";
import { REGION_SLUG_TO_NAME } from "@/lib/data/fish-regional-seasons";

const STORAGE_KEY = "tsurispot-region";

interface UseAutoRegionResult {
  selectedRegion: RegionSlug | null;
  setSelectedRegion: (region: RegionSlug | null) => void;
  detectedRegion: RegionSlug | null;
  detecting: boolean;
  detectRegion: () => void;
  regionLabel: string;
}

/**
 * 地域の自動検出 + 手動選択を統合するhook
 * - localStorage に前回選択を保存
 * - Geolocation APIで自動検出（ユーザー許可制）
 */
export function useAutoRegion(): UseAutoRegionResult {
  const [selectedRegion, setSelectedRegionState] = useState<RegionSlug | null>(null);
  const [detectedRegion, setDetectedRegion] = useState<RegionSlug | null>(null);
  const [detecting, setDetecting] = useState(false);

  // localStorage から復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== "null") {
        setSelectedRegionState(saved as RegionSlug);
      }
    } catch {}
  }, []);

  const setSelectedRegion = useCallback((region: RegionSlug | null) => {
    setSelectedRegionState(region);
    try {
      localStorage.setItem(STORAGE_KEY, region ?? "null");
    } catch {}
  }, []);

  const detectRegion = useCallback(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const region = getRegionFromCoords(pos.coords.latitude, pos.coords.longitude);
        setDetecting(false);
        if (region) {
          setDetectedRegion(region);
          setSelectedRegion(region);
        }
      },
      () => {
        setDetecting(false);
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, [setSelectedRegion]);

  const regionLabel = selectedRegion ? REGION_SLUG_TO_NAME[selectedRegion] : "全国";

  return {
    selectedRegion,
    setSelectedRegion,
    detectedRegion,
    detecting,
    detectRegion,
    regionLabel,
  };
}
