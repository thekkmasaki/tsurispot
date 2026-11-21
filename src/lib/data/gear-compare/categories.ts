import type { GearCompareCategory, GearModel } from "./types";
import shoreJiggingRods from "./models/shore-jigging-rod.json";

export const GEAR_COMPARE_CATEGORIES: GearCompareCategory[] = [
  {
    slug: "shore-jigging-rod",
    name: "ショアジギングロッド",
    title: "安いショアジギングロッド比較｜1万円前後〜の入門22機種をスペック表で絞り込み",
    description:
      "希望本体価格1万円前後〜1万円台のショアジギングロッド22機種（メジャークラフト・シマノ・アブガルシア・ダイワ）を、メーカー公式スペック（全長・ルアー重量・PE号数・自重・価格）の横並び表で比較。使いたいジグの重さと予算で絞り込めます。",
    lead:
      "堤防や磯から青物を狙うショアジギングの入門向けロッド22機種を、メーカー公式のスペックだけで横に並べました。使いたいジグの重さと予算を選ぶと、条件に合う機種だけが残ります。",
    guide: [
      {
        heading: "まず「投げたいジグの重さ」で選ぶ",
        body:
          "ロッドごとに投げられるルアーの重さ（ルアーウェイト）が決まっています。堤防で30〜40gのジグを使うなら最大60g前後、潮の速い場所や磯で60g以上を使うなら最大80〜100gのモデルが目安です。表の「使いたいジグの重さ」で絞り込むと、その重さが範囲に入る機種だけが表示されます。",
      },
      {
        heading: "長さは9〜10フィートが基準",
        body:
          "足場の高い堤防や遠投が必要な場所では長め（10フィート前後）、取り回しや軽さを重視するなら短め（9フィート台）が扱いやすくなります。継数が多いほど仕舞寸法が短くなり、電車や車での持ち運びが楽になります。",
      },
      {
        heading: "PEラインの号数を合わせる",
        body:
          "ロッドごとに適合するPEラインの号数が示されています。ライトショアジギング（〜40g前後）は0.8〜1.5号、青物を本格的に狙うなら1.5〜3号が一般的です。リールに巻くラインもこの範囲に合わせると、ガイドやロッドに無理がかかりません。",
      },
    ],
    methodSlug: "jigging",
    models: shoreJiggingRods as GearModel[],
  },
];

export function getGearCompareCategory(slug: string): GearCompareCategory | undefined {
  return GEAR_COMPARE_CATEGORIES.find((c) => c.slug === slug);
}
