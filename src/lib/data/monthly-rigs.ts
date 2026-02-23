export interface RigItem {
  name: string;
  spec: string;
}

export interface MonthlyRigSet {
  targetFish: string;
  fishSlug?: string;
  method: string;
  guideLink?: string;
  guideLinkLabel?: string;
  items: RigItem[];
}

export interface MonthlyRigs {
  month: number;
  sets: MonthlyRigSet[];
}

export const monthlyRigsData: MonthlyRigs[] = [
  {
    month: 1,
    sets: [
      {
        targetFish: "メバル",
        fishSlug: "mebaru",
        method: "ウキ釣り",
        guideLink: "/guide/float-fishing",
        guideLinkLabel: "ウキ釣りガイド",
        items: [
          { name: "メバル針", spec: "5~7号" },
          { name: "ハリス", spec: "フロロ 0.8~1号" },
          { name: "ガン玉", spec: "B~2B" },
          { name: "電気ウキ", spec: "小型（夜釣り用）" },
          { name: "エサ", spec: "イソメ・シラサエビ" },
        ],
      },
      {
        targetFish: "カサゴ",
        fishSlug: "kasago",
        method: "ブラクリ（穴釣り）",
        guideLink: "/guide/anazuri",
        guideLinkLabel: "穴釣りガイド",
        items: [
          { name: "ブラクリ仕掛け", spec: "2~3号" },
          { name: "道糸", spec: "ナイロン 3~4号" },
          { name: "エサ", spec: "サバ切り身・イソメ" },
        ],
      },
    ],
  },
  {
    month: 2,
    sets: [
      {
        targetFish: "メバル",
        fishSlug: "mebaru",
        method: "ウキ釣り",
        guideLink: "/guide/float-fishing",
        guideLinkLabel: "ウキ釣りガイド",
        items: [
          { name: "メバル針", spec: "5~7号" },
          { name: "ハリス", spec: "フロロ 0.8~1号" },
          { name: "ガン玉", spec: "B~2B" },
          { name: "電気ウキ", spec: "小型（夜釣り用）" },
          { name: "エサ", spec: "イソメ・シラサエビ" },
        ],
      },
      {
        targetFish: "カサゴ",
        fishSlug: "kasago",
        method: "ブラクリ（穴釣り）",
        guideLink: "/guide/anazuri",
        guideLinkLabel: "穴釣りガイド",
        items: [
          { name: "ブラクリ仕掛け", spec: "2~3号" },
          { name: "道糸", spec: "ナイロン 3~4号" },
          { name: "エサ", spec: "サバ切り身・イソメ" },
        ],
      },
      {
        targetFish: "カレイ",
        fishSlug: "karei",
        method: "投げ釣り",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "カレイ針", spec: "10~13号" },
          { name: "天秤オモリ", spec: "15~25号" },
          { name: "ハリス", spec: "フロロ 3~4号" },
          { name: "エサ", spec: "アオイソメ（房掛け）" },
        ],
      },
    ],
  },
  {
    month: 3,
    sets: [
      {
        targetFish: "メバル",
        fishSlug: "mebaru",
        method: "ウキ釣り",
        guideLink: "/guide/float-fishing",
        guideLinkLabel: "ウキ釣りガイド",
        items: [
          { name: "メバル針", spec: "5~7号" },
          { name: "ハリス", spec: "フロロ 0.8~1号" },
          { name: "ガン玉", spec: "B~2B" },
          { name: "エサ", spec: "イソメ・シラサエビ" },
        ],
      },
      {
        targetFish: "カレイ",
        fishSlug: "karei",
        method: "投げ釣り",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "カレイ針", spec: "10~13号" },
          { name: "天秤オモリ", spec: "15~25号" },
          { name: "ハリス", spec: "フロロ 3~4号" },
          { name: "エサ", spec: "アオイソメ（房掛け）" },
        ],
      },
      {
        targetFish: "グレ（メジナ）",
        fishSlug: "gure",
        method: "フカセ釣り（ウキ）",
        guideLink: "/guide/float-fishing",
        guideLinkLabel: "ウキ釣りガイド",
        items: [
          { name: "グレ針", spec: "4~6号" },
          { name: "ハリス", spec: "フロロ 1~1.5号" },
          { name: "円錐ウキ", spec: "B~3B" },
          { name: "エサ", spec: "オキアミ" },
          { name: "コマセ", spec: "オキアミ+集魚剤" },
        ],
      },
    ],
  },
  {
    month: 4,
    sets: [
      {
        targetFish: "アジ",
        fishSlug: "aji",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "4~6号（ピンクスキン）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "6~8号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "チヌ（クロダイ）",
        fishSlug: "chinu",
        method: "フカセ釣り（ウキ）",
        guideLink: "/guide/float-fishing",
        guideLinkLabel: "ウキ釣りガイド",
        items: [
          { name: "チヌ針", spec: "1~3号" },
          { name: "ハリス", spec: "フロロ 1.2~1.5号" },
          { name: "円錐ウキ", spec: "B~2B" },
          { name: "エサ", spec: "オキアミ・練りエサ" },
          { name: "コマセ", spec: "オキアミ+集魚剤" },
        ],
      },
      {
        targetFish: "キス（シロギス）",
        fishSlug: "kisu",
        method: "ちょい投げ",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "キス針", spec: "7~9号" },
          { name: "天秤オモリ", spec: "5~10号" },
          { name: "ハリス", spec: "フロロ 1~1.5号" },
          { name: "エサ", spec: "アオイソメ・ジャリメ" },
        ],
      },
    ],
  },
  {
    month: 5,
    sets: [
      {
        targetFish: "アジ",
        fishSlug: "aji",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "4~6号（ピンクスキン）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "6~8号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "キス（シロギス）",
        fishSlug: "kisu",
        method: "ちょい投げ",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "キス針", spec: "7~9号" },
          { name: "天秤オモリ", spec: "5~10号" },
          { name: "ハリス", spec: "フロロ 1~1.5号" },
          { name: "エサ", spec: "アオイソメ・ジャリメ" },
        ],
      },
      {
        targetFish: "チヌ（クロダイ）",
        fishSlug: "chinu",
        method: "フカセ釣り（ウキ）",
        guideLink: "/guide/float-fishing",
        guideLinkLabel: "ウキ釣りガイド",
        items: [
          { name: "チヌ針", spec: "1~3号" },
          { name: "ハリス", spec: "フロロ 1.2~1.5号" },
          { name: "円錐ウキ", spec: "B~2B" },
          { name: "エサ", spec: "オキアミ・練りエサ" },
          { name: "コマセ", spec: "オキアミ+集魚剤" },
        ],
      },
    ],
  },
  {
    month: 6,
    sets: [
      {
        targetFish: "アジ",
        fishSlug: "aji",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "5~7号（ピンクスキン）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "6~8号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "キス（シロギス）",
        fishSlug: "kisu",
        method: "ちょい投げ",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "キス針", spec: "7~9号" },
          { name: "天秤オモリ", spec: "5~10号" },
          { name: "ハリス", spec: "フロロ 1~1.5号" },
          { name: "エサ", spec: "アオイソメ・ジャリメ" },
        ],
      },
      {
        targetFish: "イサキ",
        fishSlug: "isaki",
        method: "船釣り（天秤仕掛け）",
        items: [
          { name: "イサキ針", spec: "6~8号" },
          { name: "天秤", spec: "クッションゴム付き" },
          { name: "オモリ", spec: "60~80号" },
          { name: "エサ", spec: "オキアミ" },
        ],
      },
    ],
  },
  {
    month: 7,
    sets: [
      {
        targetFish: "アジ",
        fishSlug: "aji",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "5~7号（ピンクスキン）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "6~8号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "キス（シロギス）",
        fishSlug: "kisu",
        method: "ちょい投げ",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "キス針", spec: "7~9号" },
          { name: "天秤オモリ", spec: "5~10号" },
          { name: "ハリス", spec: "フロロ 1~1.5号" },
          { name: "エサ", spec: "アオイソメ・ジャリメ" },
        ],
      },
      {
        targetFish: "サバ",
        fishSlug: "saba",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "6~8号（やや大きめ）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "8~10号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
    ],
  },
  {
    month: 8,
    sets: [
      {
        targetFish: "アジ",
        fishSlug: "aji",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "5~7号（ピンクスキン）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "6~8号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "サバ",
        fishSlug: "saba",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "6~8号（やや大きめ）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "8~10号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "ハゼ",
        fishSlug: "haze",
        method: "ちょい投げ",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "ハゼ針", spec: "6~8号" },
          { name: "天秤オモリ", spec: "3~5号" },
          { name: "ハリス", spec: "フロロ 0.8~1号" },
          { name: "エサ", spec: "アオイソメ" },
        ],
      },
    ],
  },
  {
    month: 9,
    sets: [
      {
        targetFish: "アジ",
        fishSlug: "aji",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "5~7号（ピンクスキン）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "6~8号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "ハゼ",
        fishSlug: "haze",
        method: "ちょい投げ",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "ハゼ針", spec: "6~8号" },
          { name: "天秤オモリ", spec: "3~5号" },
          { name: "ハリス", spec: "フロロ 0.8~1号" },
          { name: "エサ", spec: "アオイソメ" },
        ],
      },
      {
        targetFish: "アオリイカ",
        fishSlug: "aoriika",
        method: "エギング",
        guideLink: "/guide/eging",
        guideLinkLabel: "エギングガイド",
        items: [
          { name: "エギ", spec: "3~3.5号（秋イカ用）" },
          { name: "リーダー", spec: "フロロ 2~2.5号" },
          { name: "PEライン", spec: "0.6~0.8号" },
        ],
      },
    ],
  },
  {
    month: 10,
    sets: [
      {
        targetFish: "アジ",
        fishSlug: "aji",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "5~7号（ピンクスキン）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "6~8号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "タチウオ",
        fishSlug: "tachiuo",
        method: "テンヤ・ウキ釣り",
        items: [
          { name: "タチウオテンヤ", spec: "2~3号" },
          { name: "ワイヤーリーダー", spec: "30cm" },
          { name: "電気ウキ", spec: "2~3号" },
          { name: "エサ", spec: "キビナゴ・サンマ切り身" },
        ],
      },
      {
        targetFish: "アオリイカ",
        fishSlug: "aoriika",
        method: "エギング",
        guideLink: "/guide/eging",
        guideLinkLabel: "エギングガイド",
        items: [
          { name: "エギ", spec: "3~3.5号" },
          { name: "リーダー", spec: "フロロ 2~2.5号" },
          { name: "PEライン", spec: "0.6~0.8号" },
        ],
      },
    ],
  },
  {
    month: 11,
    sets: [
      {
        targetFish: "アジ",
        fishSlug: "aji",
        method: "サビキ釣り",
        guideLink: "/guide/sabiki",
        guideLinkLabel: "サビキ釣りガイド",
        items: [
          { name: "サビキ仕掛け", spec: "5~7号（ピンクスキン）" },
          { name: "コマセカゴ", spec: "下カゴ式" },
          { name: "オモリ", spec: "6~8号" },
          { name: "コマセ", spec: "アミエビ" },
        ],
      },
      {
        targetFish: "タチウオ",
        fishSlug: "tachiuo",
        method: "テンヤ・ウキ釣り",
        items: [
          { name: "タチウオテンヤ", spec: "2~3号" },
          { name: "ワイヤーリーダー", spec: "30cm" },
          { name: "電気ウキ", spec: "2~3号" },
          { name: "エサ", spec: "キビナゴ・サンマ切り身" },
        ],
      },
      {
        targetFish: "メバル",
        fishSlug: "mebaru",
        method: "ウキ釣り",
        guideLink: "/guide/float-fishing",
        guideLinkLabel: "ウキ釣りガイド",
        items: [
          { name: "メバル針", spec: "5~7号" },
          { name: "ハリス", spec: "フロロ 0.8~1号" },
          { name: "ガン玉", spec: "B~2B" },
          { name: "電気ウキ", spec: "小型（夜釣り用）" },
          { name: "エサ", spec: "イソメ・シラサエビ" },
        ],
      },
    ],
  },
  {
    month: 12,
    sets: [
      {
        targetFish: "メバル",
        fishSlug: "mebaru",
        method: "ウキ釣り",
        guideLink: "/guide/float-fishing",
        guideLinkLabel: "ウキ釣りガイド",
        items: [
          { name: "メバル針", spec: "5~7号" },
          { name: "ハリス", spec: "フロロ 0.8~1号" },
          { name: "ガン玉", spec: "B~2B" },
          { name: "電気ウキ", spec: "小型（夜釣り用）" },
          { name: "エサ", spec: "イソメ・シラサエビ" },
        ],
      },
      {
        targetFish: "カサゴ",
        fishSlug: "kasago",
        method: "ブラクリ（穴釣り）",
        guideLink: "/guide/anazuri",
        guideLinkLabel: "穴釣りガイド",
        items: [
          { name: "ブラクリ仕掛け", spec: "2~3号" },
          { name: "道糸", spec: "ナイロン 3~4号" },
          { name: "エサ", spec: "サバ切り身・イソメ" },
        ],
      },
      {
        targetFish: "カレイ",
        fishSlug: "karei",
        method: "投げ釣り",
        guideLink: "/guide/choinage",
        guideLinkLabel: "ちょい投げ釣りガイド",
        items: [
          { name: "カレイ針", spec: "10~13号" },
          { name: "天秤オモリ", spec: "15~25号" },
          { name: "ハリス", spec: "フロロ 3~4号" },
          { name: "エサ", spec: "アオイソメ（房掛け）" },
        ],
      },
    ],
  },
];

export function getMonthlyRigs(month: number): MonthlyRigSet[] {
  const data = monthlyRigsData.find((d) => d.month === month);
  return data?.sets ?? [];
}
