import type { FishRegionalAptitude } from "../types";
import { seaPopularAptitude } from "./sea-popular";
import { seaKaiyuuAptitude } from "./sea-kaiyuu";
import { seaTaiSuzukiAptitude } from "./sea-tai-suzuki";
import { seaRootHataAptitude } from "./sea-root-hata";
import { seaIkaTakoAptitude } from "./sea-ika-tako";
import { freshwaterAptitude } from "./freshwater";
import { brackishAptitude } from "./brackish";

/**
 * 全魚種の地域適性の集約。ファイル分割は魚種マスタ（fish-sea-*.ts等）と1:1。
 * ここに未定義の魚種は従来ロジック（peakSeasonのみ）で表示される
 * — 段階投入のためのフォールバック（fish-aptitude/index.ts 参照）。
 */
export const fishRegionalAptitude: Record<string, FishRegionalAptitude> = {
  ...seaPopularAptitude,
  ...seaKaiyuuAptitude,
  ...seaTaiSuzukiAptitude,
  ...seaRootHataAptitude,
  ...seaIkaTakoAptitude,
  ...freshwaterAptitude,
  ...brackishAptitude,
};
