import { describe, it, expect } from "vitest";
import { parseStationWalk, isTrainAccessible, TRAIN_WALK_MAX_MINUTES } from "../station-access";
import { getAllTrainSpots, getTrainRegions, MIN_TRAIN_SPOTS_PER_REGION } from "../train-spots";
import { isSitemapEligible } from "@/lib/seo-quality";

describe("駅から徒歩N分の読み取り（station-access）", () => {
  it("よくある書き方を読める", () => {
    expect(parseStationWalk("JR小樽駅から徒歩約15分")).toEqual({ station: "JR小樽駅", minutes: 15 });
    expect(parseStationWalk("京急県立大学駅より徒歩 10 分")).toEqual({ station: "京急県立大学駅", minutes: 10 });
    expect(parseStationWalk("阪神大石駅徒歩8分。駐車場なし")).toEqual({ station: "阪神大石駅", minutes: 8 });
    expect(parseStationWalk("〇〇線△△駅から歩いて約5分")).toEqual({ station: "〇〇線△△駅", minutes: 5 });
  });

  it("乗り換えの前段は駅名に含めない", () => {
    expect(parseStationWalk("JR山陰本線長門市駅から仙崎線に乗り換え仙崎駅から徒歩約10分")).toEqual({
      station: "仙崎駅",
      minutes: 10,
    });
  });

  it("駅から徒歩でないもの・駅名が無いものは読まない", () => {
    expect(parseStationWalk("〇〇駅から車で10分")).toBeNull();
    expect(parseStationWalk("バス停から徒歩3分")).toBeNull();
    expect(parseStationWalk("最寄り駅から徒歩5分")).toBeNull();
    expect(parseStationWalk("")).toBeNull();
    expect(parseStationWalk(undefined)).toBeNull();
  });

  it("徒歩の上限", () => {
    expect(isTrainAccessible(`〇〇駅から徒歩${TRAIN_WALK_MAX_MINUTES}分`)).toBe(true);
    expect(isTrainAccessible(`〇〇駅から徒歩${TRAIN_WALK_MAX_MINUTES + 1}分`)).toBe(false);
  });
});

describe("電車で行ける釣り場（train-spots）", () => {
  it("対象は掲載品質を満たし、釣り禁止情報が無く、徒歩上限以内", () => {
    const all = getAllTrainSpots();
    expect(all.length).toBeGreaterThan(0);
    for (const { spot, walk } of all) {
      expect(isSitemapEligible(spot), spot.slug).toBe(true);
      expect(spot.fishingBan, spot.slug).toBeFalsy();
      expect(walk.minutes).toBeLessThanOrEqual(TRAIN_WALK_MAX_MINUTES);
    }
  });

  it("ページを作る地域は件数の下限を満たす", () => {
    for (const { region, count } of getTrainRegions()) {
      expect(count, region.name).toBeGreaterThanOrEqual(MIN_TRAIN_SPOTS_PER_REGION);
    }
  });
});
