import { describe, it, expect } from "vitest";
import { resolveSeaLabel, resolveBroadSea } from "../sea-label";

/**
 * 座標→海域判定の代表点回帰テスト。
 * scripts/lib/sea-label-resolver.mjs と同一ロジックであることの担保も兼ねる
 * （どちらかを変えたら両方を同期し、ここの期待値を更新すること）。
 */
describe("resolveSeaLabel / resolveBroadSea", () => {
  const cases: [string, number, number, string, string][] = [
    // [地名, lat, lng, 期待ラベル, 期待大分類]
    ["香住(兵庫・但馬)", 35.63, 134.63, "日本海", "日本海"],
    ["明石", 34.65, 135.0, "大阪湾", "瀬戸内海"],
    ["境港(鳥取)", 35.54, 133.23, "日本海", "日本海"],
    ["横浜", 35.45, 139.65, "東京湾", "太平洋"],
    ["江の島(相模湾)", 35.3, 139.48, "相模湾", "太平洋"],
    ["呼子(佐賀・玄界灘)", 33.9, 129.9, "玄界灘", "日本海"],
    ["唐津(佐賀)", 33.47, 129.97, "玄界灘", "日本海"],
    ["佐賀・有明海側", 33.1, 130.25, "有明海", "東シナ海"],
    ["広島", 34.3, 132.5, "瀬戸内海", "瀬戸内海"],
    ["敦賀(福井)", 35.68, 136.06, "日本海", "日本海"],
    ["紋別(オホーツク)", 44.35, 143.35, "オホーツク海", "オホーツク海"],
    ["石巻(宮城)", 38.4, 141.3, "太平洋", "太平洋"],
    ["留萌(北海道日本海側)", 43.94, 141.63, "日本海", "日本海"],
    ["那覇", 26.2, 127.68, "東シナ海", "東シナ海"],
  ];

  it.each(cases)("%s → %s", (_name, lat, lng, label, broad) => {
    expect(resolveSeaLabel(lat, lng)).toBe(label);
    expect(resolveBroadSea(lat, lng)).toBe(broad);
  });
});
