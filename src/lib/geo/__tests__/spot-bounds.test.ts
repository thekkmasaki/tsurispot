import { describe, it, expect } from "vitest";
import { spotBounds, prefectureLabels } from "../spot-bounds";

const p = (latitude: number, longitude: number, prefecture = "兵庫県") => ({
  latitude,
  longitude,
  region: { prefecture },
});

describe("spotBounds", () => {
  it("0件なら null", () => {
    expect(spotBounds([])).toBeNull();
  });

  it("全件が収まる範囲を返す", () => {
    expect(spotBounds([p(34, 135), p(35, 134), p(34.5, 136)])).toEqual([
      [34, 134],
      [35, 136],
    ]);
  });

  it("trim 指定で離島の外れ値を外す", () => {
    // 本土 38件 + 1,000km 南の離島 2件
    const mainland = Array.from({ length: 38 }, (_, i) => p(35.5 + i * 0.01, 139.5 + i * 0.01));
    const islands = [p(27.0, 142.2), p(26.6, 142.1)];
    const b = spotBounds([...mainland, ...islands], 0.05)!;
    expect(b[0][0]).toBeGreaterThan(35);
    expect(b[1][1]).toBeLessThan(140);
    // trim なしなら離島まで入る
    expect(spotBounds([...mainland, ...islands])![0][0]).toBeCloseTo(26.6);
  });

  it("20件未満は trim しない", () => {
    const pts = [p(35, 139), p(35.1, 139.1), p(27, 142)];
    expect(spotBounds(pts, 0.05)![0][0]).toBe(27);
  });
});

describe("prefectureLabels", () => {
  it("県ごとの件数と重心を返す", () => {
    const labels = prefectureLabels([
      p(34, 135),
      p(36, 137),
      p(43, 141, "北海道"),
    ]);
    expect(labels).toHaveLength(2);
    const hyogo = labels.find((l) => l.name === "兵庫県")!;
    expect(hyogo.count).toBe(2);
    expect(hyogo.lat).toBe(35);
    expect(hyogo.lng).toBe(136);
  });
});
