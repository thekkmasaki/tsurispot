import type { FishingSpot, FishSpecies } from "@/types";
import type { AptitudeLevel } from "./types";

type SpotType = FishingSpot["spotType"];

/**
 * 魚種×地形（spotType 9値）の適合表。
 * カテゴリ別デフォルト + 魚種ごとの差分オーバーライドで全116種をカバーする。
 * 0 は「その地形では実質狙えない」＝一覧から除外（例: 砂浜のメバル穴釣り、
 * 河川のアオリイカ、湖沼の海水魚）。
 * 値の根拠は各魚種の生態・一般的な釣法（QUALITY-RUBRIC の地形×魚種マトリクスと整合）。
 */
const CATEGORY_DEFAULTS: Record<FishSpecies["category"], Record<SpotType, AptitudeLevel>> = {
  sea: { port: 3, breakwater: 3, pier: 2, rocky: 2, beach: 1, surf: 1, river: 0, lake: 0, pond: 0 },
  freshwater: { port: 0, breakwater: 0, pier: 0, rocky: 0, beach: 0, surf: 0, river: 3, lake: 3, pond: 2 },
  brackish: { port: 3, breakwater: 3, pier: 2, rocky: 1, beach: 2, surf: 1, river: 3, lake: 0, pond: 0 },
};

/** 魚種ごとの差分（カテゴリデフォルトと異なる地形のみ記述） */
export const spotTypeOverrides: Record<string, Partial<Record<SpotType, AptitudeLevel>>> = {
  // ── 海水・堤防定番（fish-sea-popular）──
  aji: { port: 4, breakwater: 4, pier: 3 },
  saba: { port: 4, breakwater: 4, pier: 3 },
  mebaru: { breakwater: 4, rocky: 3, beach: 0, surf: 0 },
  iwashi: { port: 4, breakwater: 4, pier: 3, rocky: 1 },
  kisu: { beach: 4, surf: 4, port: 2, breakwater: 2, rocky: 0 },
  megochi: { beach: 4, surf: 3, port: 2, breakwater: 2, rocky: 0 },
  karei: { beach: 4, surf: 3, pier: 2, rocky: 1 },
  kawahagi: { rocky: 3, beach: 0, surf: 0 },
  sayori: { beach: 2 },
  kamasu: { surf: 2, beach: 2 },
  ishimochi: { surf: 4, beach: 4, port: 2, breakwater: 2, rocky: 0 },
  umitanago: { rocky: 3 },
  aigo: { rocky: 3, port: 2 },
  suzumedai: {},
  nenbutsudai: {},
  bora: { river: 3, beach: 2 },
  hiiragi: { beach: 2, river: 2 },

  // ── 海水・回遊魚（fish-sea-kaiyuu）──
  tachiuo: { port: 4, breakwater: 4 },
  inada: { breakwater: 4, rocky: 3, surf: 3 },
  buri: { rocky: 4, surf: 2, port: 2 },
  kanpachi: { rocky: 4, port: 2 },
  soudagatuo: { surf: 4, rocky: 3, beach: 3, port: 2 },
  shimaaji: { rocky: 3, surf: 2, port: 2 },
  katsuo: { rocky: 3, surf: 2, breakwater: 2, port: 1 },
  sawara: { surf: 3 },
  hiramasa: { rocky: 4, surf: 3, port: 1 },
  shiira: { surf: 3, rocky: 3, breakwater: 2, port: 1 },
  "rounin-aji": { rocky: 4, port: 2 },

  // ── 海水・タイスズキ（fish-sea-tai-suzuki）──
  suzuki: { river: 3, surf: 3, beach: 2 },
  madai: { rocky: 3, surf: 2, port: 2 },
  hirame: { surf: 4, beach: 4 },
  magochi: { surf: 4, beach: 4, river: 2, port: 2, breakwater: 2 },
  ishidai: { rocky: 4, breakwater: 2, port: 1 },
  mejina: { rocky: 4, port: 2 },
  koshoudai: { rocky: 3, port: 2 },
  houbou: { surf: 3, beach: 3, port: 2, breakwater: 2 },
  bera: { rocky: 3, beach: 2 },
  isaki: { rocky: 4, port: 2 },
  amadai: { port: 1, breakwater: 1, surf: 2, beach: 2, rocky: 0 },
  kobudai: { rocky: 4, port: 2, breakwater: 2 },
  ishigakidai: { rocky: 4, breakwater: 2, port: 1 },
  hirasuzuki: { rocky: 4, surf: 2, breakwater: 1, port: 1 },
  itoyoridai: { beach: 3, surf: 3, port: 2, breakwater: 2 },
  medai: { rocky: 2, port: 1, breakwater: 1 },
  hedai: { beach: 2 },
  kibire: { river: 3, beach: 2 },

  // ── 海水・根魚ほか（fish-sea-root-hata）──
  kasago: { port: 4, breakwater: 4, rocky: 4, beach: 0, surf: 0 },
  ainame: { breakwater: 4, rocky: 4 },
  kurosoi: { port: 4, breakwater: 4, rocky: 3 },
  anago: { beach: 3, surf: 2, river: 2 },
  utsubo: { rocky: 4, breakwater: 2, port: 1 },
  hata: { rocky: 3, breakwater: 2, port: 2 },
  akahata: { rocky: 4, breakwater: 2, port: 1 },
  eso: { surf: 3, beach: 3, breakwater: 2, port: 2 },
  fugu: { beach: 2 },
  gonzui: {},
  haokoze: {},
  oniokoze: { rocky: 2, port: 2, breakwater: 2 },
  akaei: { beach: 3, surf: 3, river: 2, breakwater: 2 },
  dochizame: { surf: 3, beach: 3, port: 2, breakwater: 2 },
  nekozame: { rocky: 3, breakwater: 2, port: 2 },
  hoshizame: { surf: 3, beach: 3, breakwater: 2, port: 2 },
  kinmedai: { rocky: 2, port: 0, breakwater: 1 },
  hatahata: { port: 4, breakwater: 4, beach: 3, surf: 2 },
  hokke: { rocky: 3 },
  akamutsu: { rocky: 1, port: 1, breakwater: 1 },
  madara: { surf: 2, rocky: 2, port: 1, breakwater: 1 },
  kue: { rocky: 4, breakwater: 2, port: 1 },
  mutsu: { rocky: 2, port: 2, breakwater: 2 },
  akame: { river: 3, surf: 3, port: 1, breakwater: 1, rocky: 1 },
  mahata: { rocky: 3, breakwater: 2, port: 1 },
  oomonhata: { rocky: 3, port: 2, breakwater: 2 },
  onikasago: { rocky: 1, port: 0, breakwater: 1 },
  taman: { rocky: 3, beach: 3, surf: 3 },
  oonibe: { surf: 4, beach: 3, port: 1, breakwater: 1, river: 2 }, // 宮崎の河口サーフはオオニベの主戦場
  sujiara: { rocky: 3, port: 1, breakwater: 1 },

  // ── イカ・タコ・甲殻類（fish-sea-ika-tako）──
  aoriika: { rocky: 4, beach: 1, surf: 1 },
  madako: { port: 4, breakwater: 4, rocky: 3 },
  yariika: { rocky: 3 },
  surumeika: { port: 2, breakwater: 2 },
  kouika: { beach: 2 },
  "kensaki-ika": { rocky: 3 },
  watarigani: { beach: 3 },
  nokogirigazami: { river: 3, port: 2, beach: 2, breakwater: 2 },
  iidako: { beach: 3 },

  // ── 淡水（fish-freshwater）──
  nijimasu: { pond: 4 },
  houraimasu: { pond: 4, river: 2, lake: 1 },
  yamame: { river: 4, lake: 1 },
  tenagaebi: { river: 4, lake: 2, pond: 0 },
  blackbass: { lake: 4, pond: 3 },
  bluegill: { lake: 4, river: 2 },
  namazu: { river: 4, lake: 2, pond: 0 },
  koi: { river: 4 },
  herabuna: { lake: 4, pond: 3 },
  wakasagi: { lake: 4, river: 1 },
  iwana: { river: 4, lake: 1 },
  amago: { river: 4, lake: 1, pond: 2 },
  ayu: { river: 4, lake: 0, pond: 0 },
  oikawa: { river: 4, lake: 1, pond: 0 },
  dojou: { lake: 1, pond: 0 },
  tanago: { lake: 2, pond: 1 },
  raigyo: { pond: 1 },
  hasu: { lake: 3, pond: 0 },
  itou: { river: 4, lake: 2, pond: 1 },
  "biwako-oonamazu": { lake: 4, river: 1, pond: 0 },
  biwamasu: { lake: 4, river: 1, pond: 0 },
  "brown-trout": { lake: 3, pond: 2 },
  ugui: { river: 4, lake: 2 },
  kawamutsu: { river: 4, lake: 1, pond: 0 },
  mabuna: {},
  himemasu: { lake: 4, river: 0, pond: 1 },
  // ウナギは降河回遊魚のため港湾・運河・汽水湖（宍道湖等）でも実釣が成立する
  unagi: { river: 4, lake: 2, port: 1, breakwater: 1, beach: 1, pond: 0 },

  // ── 汽水（fish-brackish）──
  kurodai: { port: 4, breakwater: 4, rocky: 3, pier: 3 },
  haze: { river: 4, beach: 3, breakwater: 2 },
  konoshiro: { port: 4, river: 1 },
  sakuramasu: { surf: 3, river: 3, port: 1, breakwater: 1, beach: 2 },
};

/** 魚種×地形の適性を返す（オーバーライド → カテゴリデフォルトの順） */
export function getSpotTypeAptitude(
  fishSlug: string,
  category: FishSpecies["category"],
  spotType: SpotType
): AptitudeLevel {
  return spotTypeOverrides[fishSlug]?.[spotType] ?? CATEGORY_DEFAULTS[category][spotType];
}
