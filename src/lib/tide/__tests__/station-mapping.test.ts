/**
 * 全スポット×潮汐観測地点マッピングの点検テスト（2026-08 潮汐正確化）。
 *
 * UGC指摘「干潮情報が間違っている」への対応で満干時刻を気象庁 潮位表データへ置き換えた。
 * このテストは「全公開スポットが妥当な観測地点に紐づくこと」「淡水スポットに海の
 * 満干時刻を出さないこと」をデータ増減後も保証する回帰ゲート。
 */
import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { TIDE_STATIONS } from "@/lib/tide/stations";
import {
  getTideDisplayMode,
  getTideStationForSpot,
} from "@/lib/tide/nearest-station";
import {
  ESTUARY_FULL_TIDE_SLUGS,
  STATION_OVERRIDES,
} from "@/lib/tide/station-overrides";

const TIDAL_SPOT_TYPES = new Set([
  "port",
  "breakwater",
  "beach",
  "rocky",
  "pier",
  "surf",
]);

describe("観測地点マスタ（stations.ts）", () => {
  it("239地点・code一意・日本近海の座標", () => {
    expect(TIDE_STATIONS.length).toBe(239);
    const codes = new Set(TIDE_STATIONS.map((s) => s.code));
    expect(codes.size).toBe(TIDE_STATIONS.length);
    for (const s of TIDE_STATIONS) {
      expect(s.code).toMatch(/^[A-Z0-9]{2}$/);
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.lat).toBeGreaterThan(20);
      expect(s.lat).toBeLessThan(46);
      expect(s.lng).toBeGreaterThan(122);
      expect(s.lng).toBeLessThan(155);
    }
  });
});

describe("全スポットの観測地点マッピング点検", () => {
  it("海のスポット全件が観測地点100km圏内に割り当てられる", () => {
    const tooFar: string[] = [];
    let count = 0;
    for (const spot of fishingSpots) {
      if (!TIDAL_SPOT_TYPES.has(spot.spotType)) continue;
      count++;
      const st = getTideStationForSpot(spot);
      expect(st, `${spot.slug} に観測地点が割り当てられていない`).not.toBeNull();
      if (st && st.distanceKm > 100) {
        tooFar.push(`${spot.slug} → ${st.name} ${st.distanceKm}km`);
      }
    }
    expect(count).toBeGreaterThan(3000); // 海のスポットが大量に存在すること自体の健全性
    expect(tooFar, `100km超のスポット: ${tooFar.join(", ")}`).toEqual([]);
  });

  it("湖・管理池では潮汐を表示しない", () => {
    for (const spot of fishingSpots) {
      if (spot.spotType !== "lake" && spot.spotType !== "pond") continue;
      expect(getTideDisplayMode(spot), spot.slug).toBe("none");
      expect(getTideStationForSpot(spot), spot.slug).toBeNull();
    }
  });

  it("河川は潮回りのみ（河口の昇格リストを除く）", () => {
    const estuarySet = new Set(ESTUARY_FULL_TIDE_SLUGS);
    for (const spot of fishingSpots) {
      if (spot.spotType !== "river") continue;
      const mode = getTideDisplayMode(spot);
      if (STATION_OVERRIDES[spot.slug] === null) {
        expect(mode, spot.slug).toBe("none");
      } else if (estuarySet.has(spot.slug)) {
        expect(mode, spot.slug).toBe("full");
      } else {
        expect(mode, spot.slug).toBe("phase-only");
      }
    }
  });
});

describe("手動上書きテーブル（station-overrides.ts）の整合性", () => {
  it("上書き先の地点codeが実在する", () => {
    const codes = new Set(TIDE_STATIONS.map((s) => s.code));
    for (const [slug, code] of Object.entries(STATION_OVERRIDES)) {
      if (code === null) continue;
      expect(codes.has(code), `${slug} → ${code} は未知の地点code`).toBe(true);
    }
  });

  it("上書き対象のslugが公開スポットに実在する（dedup敗者を指していない）", () => {
    const slugs = new Set(fishingSpots.map((s) => s.slug));
    for (const slug of Object.keys(STATION_OVERRIDES)) {
      expect(slugs.has(slug), `override対象 ${slug} が公開スポットに無い`).toBe(true);
    }
    for (const slug of ESTUARY_FULL_TIDE_SLUGS) {
      expect(slugs.has(slug), `河口昇格 ${slug} が公開スポットに無い`).toBe(true);
    }
  });

  it("河口昇格リストは river スポットのみ", () => {
    const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));
    for (const slug of ESTUARY_FULL_TIDE_SLUGS) {
      const spot = bySlug.get(slug);
      if (!spot) continue; // 実在チェックは上のテストで担保
      expect(spot.spotType, `${slug} は river ではない`).toBe("river");
    }
  });
});
