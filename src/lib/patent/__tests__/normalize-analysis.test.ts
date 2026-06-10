import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  haversineMeters,
  isAnalysisLocationConsistent,
  normalizeAnalysisResult,
} from "../normalize-analysis";
import type { SpotAnalysisResult } from "../types";

const STRUCTURES_DIR = path.join(process.cwd(), "patent", "data", "structures");

function loadRaw(slug: string): SpotAnalysisResult {
  const raw = fs.readFileSync(
    path.join(STRUCTURES_DIR, `${slug}.json`),
    "utf-8"
  );
  return JSON.parse(raw) as SpotAnalysisResult;
}

describe("haversineMeters", () => {
  it("平磯の端点間距離が手仕上げ値1400mとほぼ一致する", () => {
    const hiraiso = loadRaw("hiraiso-fishing-park");
    const { west, east } = hiraiso.structureEndpoints!;
    const dist = haversineMeters(west, east);
    expect(dist).toBeGreaterThan(1300);
    expect(dist).toBeLessThan(1500);
  });

  it("同一点は距離0", () => {
    const p = { lat: 34.6271, lng: 135.067 };
    expect(haversineMeters(p, p)).toBe(0);
  });
});

describe("normalizeAnalysisResult — 手仕上げ済みデータの非破壊", () => {
  const hiraiso = normalizeAnalysisResult(loadRaw("hiraiso-fishing-park"));

  it("structureLength 1400m を上書きしない", () => {
    expect(hiraiso.structureLength).toBe(1400);
  });

  it("手仕上げの detectedTetrapods 48件を再導出しない", () => {
    expect(hiraiso.detectedTetrapods).toHaveLength(48);
    expect(hiraiso.detectedTetrapods![0].brightness).toBeCloseTo(123.7, 1);
  });

  it("facilities 5件を維持する", () => {
    expect(hiraiso.facilities).toHaveLength(5);
  });
});

describe("normalizeAnalysisResult — 生出力の補完", () => {
  const akashi = normalizeAnalysisResult(loadRaw("akashi-port"));

  it("structureLength=0 を端点距離から導出する（10m単位）", () => {
    expect(akashi.structureLength).toBeGreaterThan(300);
    expect(akashi.structureLength).toBeLessThan(600);
    expect(akashi.structureLength % 10).toBe(0);
  });

  it("ノイズ構造物を除去する（209件→大幅減）", () => {
    const rawCount = loadRaw("akashi-port").detectedStructures.length;
    expect(rawCount).toBe(209);
    expect(akashi.detectedStructures.length).toBeLessThan(rawCount);
    expect(akashi.detectedStructures.length).toBeGreaterThanOrEqual(3);
    for (const s of akashi.detectedStructures) {
      expect(s.confidence).toBeGreaterThanOrEqual(0.24);
      expect(s.areaRatio).toBeGreaterThanOrEqual(0.001);
    }
  });

  it("テトラポッド座標を導出する（上限60件・端点近傍）", () => {
    expect(akashi.detectedTetrapods!.length).toBeGreaterThan(0);
    expect(akashi.detectedTetrapods!.length).toBeLessThanOrEqual(60);
    const { west, east } = akashi.structureEndpoints!;
    for (const tp of akashi.detectedTetrapods!) {
      expect(tp.lat).toBeGreaterThan(Math.min(west.lat, east.lat) - 0.01);
      expect(tp.lat).toBeLessThan(Math.max(west.lat, east.lat) + 0.01);
      expect(tp.lng).toBeGreaterThan(Math.min(west.lng, east.lng) - 0.01);
      expect(tp.lng).toBeLessThan(Math.max(west.lng, east.lng) + 0.01);
    }
  });

  it("決定論的である（2回実行で同一結果）", () => {
    const again = normalizeAnalysisResult(loadRaw("akashi-port"));
    expect(again).toEqual(akashi);
  });

  it("positionCount を自動設定する", () => {
    expect(akashi.positionCount).toBeGreaterThanOrEqual(5);
    expect(akashi.positionCount).toBeLessThanOrEqual(15);
  });
});

describe("normalizeAnalysisResult — 全解析済みスポットが正規化後も妥当", () => {
  const slugs = fs
    .readdirSync(STRUCTURES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));

  it("解析済みJSONが存在する（亀崎港は座標不一致で rejected/ に隔離済み）", () => {
    expect(slugs.length).toBeGreaterThanOrEqual(5);
    expect(slugs).not.toContain("kamezaki-kou");
  });

  it.each(slugs)("%s: 構造物長>0・ゾーンあり・テトラ妥当", (slug) => {
    const result = normalizeAnalysisResult(loadRaw(slug));
    expect(result.structureLength).toBeGreaterThan(0);
    expect(result.zones.length).toBeGreaterThan(0);
    expect(result.detectedStructures.length).toBeGreaterThanOrEqual(3);
    expect((result.detectedTetrapods ?? []).length).toBeLessThanOrEqual(60);
  });
});

describe("isAnalysisLocationConsistent — 座標整合ガード", () => {
  const hiraiso = loadRaw("hiraiso-fishing-park");

  it("解析座標と同じ場所なら整合", () => {
    expect(
      isAnalysisLocationConsistent(
        hiraiso,
        hiraiso.coordinates.lat,
        hiraiso.coordinates.lng
      )
    ).toBe(true);
  });

  it("1km程度の乖離は許容する", () => {
    // 緯度0.008° ≈ 890m
    expect(
      isAnalysisLocationConsistent(
        hiraiso,
        hiraiso.coordinates.lat + 0.008,
        hiraiso.coordinates.lng
      )
    ).toBe(true);
  });

  it("5km級の乖離は不整合（別の場所の解析結果）", () => {
    expect(
      isAnalysisLocationConsistent(
        hiraiso,
        hiraiso.coordinates.lat,
        hiraiso.coordinates.lng + 0.05
      )
    ).toBe(false);
  });

  it("実データ: akashi-shinhato のスポット座標乖離を検出する", () => {
    const shinhato = loadRaw("akashi-shinhato");
    // スポットデータ側の座標（約7km乖離している既知の不整合）
    expect(isAnalysisLocationConsistent(shinhato, 34.64, 134.9013)).toBe(false);
  });
});
