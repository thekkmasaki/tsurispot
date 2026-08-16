import { describe, it, expect } from "vitest";
import {
  clusterByDistance,
  pickHomeClusterIndex,
} from "@/lib/geo/activity-cluster";
import { haversineKm } from "@/lib/geo/distance";

// 実在スポットの概算座標
const HONMOKU = { slug: "honmoku", lat: 35.4245, lng: 139.6675 }; // 横浜
const WAKASU = { slug: "wakasu", lat: 35.6178, lng: 139.8282 }; // 東京
const UMIKAZE = { slug: "umikaze", lat: 35.2705, lng: 139.6724 }; // 横須賀
const WAKAYAMA = { slug: "wakayama", lat: 34.1495, lng: 135.1662 }; // 和歌山
const MAIZURU = { slug: "maizuru", lat: 35.4917, lng: 135.321 }; // 京都北部

describe("haversineKm", () => {
  it("横浜〜和歌山は日帰り圏(60km)を大きく超える", () => {
    const d = haversineKm(HONMOKU.lat, HONMOKU.lng, WAKAYAMA.lat, WAKAYAMA.lng);
    expect(d).toBeGreaterThan(300);
  });
  it("横浜〜若洲は日帰り圏内", () => {
    const d = haversineKm(HONMOKU.lat, HONMOKU.lng, WAKASU.lat, WAKASU.lng);
    expect(d).toBeLessThan(60);
  });
});

describe("clusterByDistance", () => {
  it("東京湾一円は1クラスタ、和歌山・舞鶴は別クラスタになる", () => {
    const clusters = clusterByDistance([
      HONMOKU,
      WAKAYAMA,
      WAKASU,
      MAIZURU,
      UMIKAZE,
    ]);
    expect(clusters).toHaveLength(3);
    const tokyoBay = clusters.find((c) => c.spotSlugs.includes("honmoku"))!;
    expect(tokyoBay.spotSlugs).toEqual(
      expect.arrayContaining(["honmoku", "wakasu", "umikaze"]),
    );
    expect(tokyoBay.spotSlugs).toHaveLength(3);
  });

  it("空入力で空配列", () => {
    expect(clusterByDistance([])).toEqual([]);
  });
});

describe("pickHomeClusterIndex", () => {
  const clusters = clusterByDistance([WAKAYAMA, HONMOKU, WAKASU, UMIKAZE]);
  // clusters[0] = 和歌山(1件), clusters[1] = 東京湾(3件)

  it("現在地があれば最近傍クラスタが勝つ（件数より優先）", () => {
    const i = pickHomeClusterIndex(clusters, {
      location: { lat: 34.2, lng: 135.2 }, // 和歌山付近
    });
    expect(clusters[i].spotSlugs).toContain("wakayama");
  });

  it("現在地がなければ件数の多いクラスタがホーム", () => {
    const i = pickHomeClusterIndex(clusters, {});
    expect(clusters[i].spotSlugs).toContain("honmoku");
  });

  it("件数同点なら閲覧履歴が新しい方", () => {
    const two = clusterByDistance([WAKAYAMA, HONMOKU]);
    const i = pickHomeClusterIndex(two, { recentSlugs: ["wakayama"] });
    expect(two[i].spotSlugs).toContain("wakayama");
  });

  it("クラスタ1つならそれ", () => {
    const one = clusterByDistance([HONMOKU, WAKASU]);
    expect(pickHomeClusterIndex(one, {})).toBe(0);
  });

  it("空なら-1", () => {
    expect(pickHomeClusterIndex([], {})).toBe(-1);
  });
});
