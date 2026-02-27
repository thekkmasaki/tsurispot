"use client";

import { useEffect } from "react";
import { saveRecentSpot, type RecentSpot } from "./recently-viewed";

export function RecentlyViewedTracker({ spot }: { spot: RecentSpot }) {
  useEffect(() => {
    saveRecentSpot(spot);
  }, [spot]);

  return null;
}
