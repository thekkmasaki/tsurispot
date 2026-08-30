// 潮汐観測地点マッピングの手動上書きテーブル
//
// STATION_OVERRIDES: 直線距離の最寄りが地形上不適切なスポット（半島の反対側・湾奥など）の
//   観測地点codeを上書きする。null を指定すると潮汐表示そのものを止める。
// ESTUARY_FULL_TIDE_SLUGS: spotType="river" は既定で「潮回りのみ」表示だが、
//   河口・汽水域で満干時刻が実用になるスポットをフル表示へ昇格する。
//   候補は node scripts/audit-tide-stations.mjs の出力から選定する。
export const STATION_OVERRIDES: Record<string, string | null> = {
  // 淡水・汽水湖の護岸が海型spotTypeで登録されているスポット（2026-08 監査で検出）
  // 海の満干時刻は実態と乖離するため潮汐表示を止める
  "koyamaike-gogan-a12": null, // 鳥取・湖山池（汽水化された湖。水門管理で潮汐の影響は限定的）
  "mikatagoko-kukushi-gogan": null, // 福井・三方五湖 久々子湖（汽水湖）
  "shinjiko-onsen-gokan": null, // 島根・宍道湖（汽水湖。海の満干時刻は実態と乖離）
};

export const ESTUARY_FULL_TIDE_SLUGS: string[] = [
  // 名称に「河口」等を含む river スポットは nearest-station.ts の名称判定で自動的に full になる。
  // ここには名称から判定できない河口・汽水域スポットだけを追加する。
];
