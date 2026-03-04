import type { Metadata } from "next";
import { TidesClient } from "./tides-client";

export const metadata: Metadata = {
  title: "潮見表・潮汐情報",
  description: "今日の潮回り・潮位グラフ・満潮干潮時刻をチェック。釣りに最適な時間帯がひと目でわかる潮見表です。",
};

export default function TidesPage() {
  return <TidesClient />;
}
