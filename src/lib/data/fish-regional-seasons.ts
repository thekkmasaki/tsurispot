/**
 * 地域別の魚シーズンオーバーライドデータ
 *
 * 全国共通データ（fish-sea.ts等のseasonMonths/peakMonths）に対して、
 * 地域差がある魚のみオーバーライドする。
 * 指定のない地域は全国データにフォールバック。
 *
 * データ方針:
 * - 水温・産卵期・回遊パターンを基に設定
 * - 北ほどシーズンが遅く短い、南ほど早く長い傾向
 * - 日本海側と太平洋側の差も考慮
 */

import type { RegionSlug, RegionalSeasonData } from "@/types";

export const fishRegionalSeasons: Record<
  string,
  Partial<Record<RegionSlug, RegionalSeasonData>>
> = {
  // ── マダイ ──
  // 全国デフォルト: season [3-6,9-12], peak [4,5,10,11]
  madai: {
    hokkaido: {
      seasonMonths: [5, 6, 7, 8, 9, 10],
      peakMonths: [6, 7, 9],
    },
    tohoku: {
      seasonMonths: [4, 5, 6, 7, 9, 10, 11],
      peakMonths: [5, 6, 10],
    },
    kanto: {
      seasonMonths: [3, 4, 5, 6, 9, 10, 11, 12],
      peakMonths: [4, 5, 10, 11],
    },
    chubu: {
      seasonMonths: [3, 4, 5, 6, 9, 10, 11, 12],
      peakMonths: [4, 5, 10, 11],
    },
    kinki: {
      seasonMonths: [4, 5, 6, 9, 10, 11, 12],
      peakMonths: [4, 5, 10, 11],
    },
    chugoku: {
      seasonMonths: [3, 4, 5, 6, 9, 10, 11, 12],
      peakMonths: [4, 5, 10, 11],
    },
    shikoku: {
      seasonMonths: [3, 4, 5, 6, 9, 10, 11, 12],
      peakMonths: [3, 4, 5, 10, 11],
    },
    kyushu: {
      seasonMonths: [2, 3, 4, 5, 6, 9, 10, 11, 12],
      peakMonths: [3, 4, 5, 10, 11],
    },
  },

  // ── アジ ──
  // 全国デフォルト: season [5-12], peak [6,7,8,9]
  aji: {
    hokkaido: {
      seasonMonths: [6, 7, 8, 9, 10],
      peakMonths: [7, 8, 9],
    },
    tohoku: {
      seasonMonths: [6, 7, 8, 9, 10, 11],
      peakMonths: [7, 8, 9],
    },
    kinki: {
      seasonMonths: [4, 5, 6, 7, 8, 9, 10, 11, 12],
      peakMonths: [6, 7, 8, 9, 10],
    },
    kyushu: {
      seasonMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      peakMonths: [5, 6, 7, 8, 9, 10],
    },
  },

  // ── サバ ──
  // 全国デフォルト: season [6-12], peak [8,9,10]
  saba: {
    hokkaido: {
      seasonMonths: [7, 8, 9, 10],
      peakMonths: [8, 9],
    },
    tohoku: {
      seasonMonths: [7, 8, 9, 10, 11],
      peakMonths: [8, 9, 10],
    },
    kyushu: {
      seasonMonths: [5, 6, 7, 8, 9, 10, 11, 12],
      peakMonths: [7, 8, 9, 10, 11],
    },
  },

  // ── クロダイ（チヌ）──
  // 全国デフォルト: season [3-12], peak [4,5,9,10]
  kurodai: {
    hokkaido: {
      seasonMonths: [5, 6, 7, 8, 9, 10],
      peakMonths: [7, 8],
    },
    tohoku: {
      seasonMonths: [4, 5, 6, 7, 8, 9, 10, 11],
      peakMonths: [5, 6, 9, 10],
    },
    kinki: {
      seasonMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      peakMonths: [4, 5, 6, 9, 10, 11],
    },
    kyushu: {
      seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      peakMonths: [3, 4, 5, 9, 10, 11],
    },
  },

  // ── カレイ ──
  // 全国デフォルト: season [10-3], peak [11,12,1,2]
  karei: {
    hokkaido: {
      seasonMonths: [4, 5, 6, 9, 10, 11],
      peakMonths: [4, 5, 10, 11],
    },
    tohoku: {
      seasonMonths: [10, 11, 12, 1, 2, 3, 4],
      peakMonths: [11, 12, 1, 2, 3],
    },
    kanto: {
      seasonMonths: [10, 11, 12, 1, 2, 3],
      peakMonths: [11, 12, 1, 2],
    },
    kinki: {
      seasonMonths: [10, 11, 12, 1, 2, 3],
      peakMonths: [11, 12, 1],
    },
    kyushu: {
      seasonMonths: [11, 12, 1, 2],
      peakMonths: [12, 1],
    },
  },

  // ── メバル ──
  // 全国デフォルト: season [11-5], peak [1,2,3]
  mebaru: {
    hokkaido: {
      seasonMonths: [3, 4, 5, 6, 7],
      peakMonths: [4, 5, 6],
    },
    tohoku: {
      seasonMonths: [12, 1, 2, 3, 4, 5],
      peakMonths: [2, 3, 4],
    },
    kinki: {
      seasonMonths: [11, 12, 1, 2, 3, 4, 5],
      peakMonths: [12, 1, 2, 3],
    },
    kyushu: {
      seasonMonths: [11, 12, 1, 2, 3, 4],
      peakMonths: [12, 1, 2],
    },
  },

  // ── カサゴ ──
  // 全国デフォルト: season [10-5], peak [12,1,2,3]
  kasago: {
    hokkaido: {
      seasonMonths: [4, 5, 6, 7, 8, 9, 10],
      peakMonths: [5, 6, 7],
    },
    tohoku: {
      seasonMonths: [11, 12, 1, 2, 3, 4, 5],
      peakMonths: [1, 2, 3, 4],
    },
    kyushu: {
      seasonMonths: [10, 11, 12, 1, 2, 3, 4, 5],
      peakMonths: [11, 12, 1, 2],
    },
  },

  // ── シーバス（スズキ）──
  // 全国デフォルト: season [3-12], peak [6,7,9,10,11]
  seabass: {
    hokkaido: {
      seasonMonths: [5, 6, 7, 8, 9, 10, 11],
      peakMonths: [7, 8, 9, 10],
    },
    tohoku: {
      seasonMonths: [4, 5, 6, 7, 8, 9, 10, 11, 12],
      peakMonths: [6, 7, 9, 10, 11],
    },
    kinki: {
      seasonMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      peakMonths: [4, 5, 6, 9, 10, 11],
    },
    kyushu: {
      seasonMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      peakMonths: [3, 4, 5, 9, 10, 11, 12],
    },
  },

  // ── タチウオ ──
  // 全国デフォルト: season [7-12], peak [8,9,10]
  tachiuo: {
    hokkaido: {
      seasonMonths: [8, 9, 10],
      peakMonths: [9],
    },
    tohoku: {
      seasonMonths: [8, 9, 10, 11],
      peakMonths: [9, 10],
    },
    kanto: {
      seasonMonths: [7, 8, 9, 10, 11, 12],
      peakMonths: [8, 9, 10],
    },
    kinki: {
      seasonMonths: [7, 8, 9, 10, 11, 12, 1],
      peakMonths: [8, 9, 10, 11],
    },
    kyushu: {
      seasonMonths: [6, 7, 8, 9, 10, 11, 12, 1, 2],
      peakMonths: [7, 8, 9, 10, 11],
    },
  },

  // ── アオリイカ ──
  // 全国デフォルト: season [4-6,9-12], peak [5,10,11]
  aoriika: {
    hokkaido: {
      seasonMonths: [6, 7, 8, 9],
      peakMonths: [7, 8],
    },
    tohoku: {
      seasonMonths: [5, 6, 7, 9, 10, 11],
      peakMonths: [6, 10],
    },
    kanto: {
      seasonMonths: [4, 5, 6, 9, 10, 11, 12],
      peakMonths: [5, 10, 11],
    },
    kinki: {
      seasonMonths: [4, 5, 6, 9, 10, 11, 12],
      peakMonths: [5, 6, 10, 11],
    },
    kyushu: {
      seasonMonths: [3, 4, 5, 6, 9, 10, 11, 12, 1],
      peakMonths: [4, 5, 10, 11],
    },
  },

  // ── ヒラメ ──
  // 全国デフォルト: season [9-3], peak [10,11,12]
  hirame: {
    hokkaido: {
      seasonMonths: [5, 6, 7, 8, 9, 10],
      peakMonths: [6, 7, 8],
    },
    tohoku: {
      seasonMonths: [4, 5, 6, 9, 10, 11, 12],
      peakMonths: [5, 6, 10, 11],
    },
    kanto: {
      seasonMonths: [9, 10, 11, 12, 1, 2, 3],
      peakMonths: [10, 11, 12],
    },
    kinki: {
      seasonMonths: [10, 11, 12, 1, 2, 3],
      peakMonths: [11, 12, 1],
    },
    kyushu: {
      seasonMonths: [10, 11, 12, 1, 2, 3],
      peakMonths: [11, 12, 1, 2],
    },
  },

  // ── ブリ ──
  // 全国デフォルト: season [9-2], peak [11,12,1]
  buri: {
    hokkaido: {
      seasonMonths: [7, 8, 9, 10, 11],
      peakMonths: [8, 9, 10],
    },
    tohoku: {
      seasonMonths: [9, 10, 11, 12, 1],
      peakMonths: [10, 11, 12],
    },
    kanto: {
      seasonMonths: [9, 10, 11, 12, 1, 2],
      peakMonths: [11, 12, 1],
    },
    kinki: {
      seasonMonths: [10, 11, 12, 1, 2],
      peakMonths: [11, 12, 1],
    },
    kyushu: {
      seasonMonths: [10, 11, 12, 1, 2, 3],
      peakMonths: [12, 1, 2],
    },
  },

  // ── キス ──
  // 全国デフォルト: season [5-10], peak [6,7,8]
  kisu: {
    hokkaido: {
      seasonMonths: [6, 7, 8, 9],
      peakMonths: [7, 8],
    },
    tohoku: {
      seasonMonths: [6, 7, 8, 9, 10],
      peakMonths: [7, 8],
    },
    kinki: {
      seasonMonths: [5, 6, 7, 8, 9, 10, 11],
      peakMonths: [6, 7, 8, 9],
    },
    kyushu: {
      seasonMonths: [4, 5, 6, 7, 8, 9, 10, 11],
      peakMonths: [5, 6, 7, 8, 9],
    },
  },

  // ── サクラマス ──
  // 全国デフォルト: season [2-6], peak [3,4,5]
  sakuramasu: {
    hokkaido: {
      seasonMonths: [3, 4, 5, 6, 7],
      peakMonths: [4, 5, 6],
    },
    tohoku: {
      seasonMonths: [2, 3, 4, 5, 6],
      peakMonths: [3, 4, 5],
    },
    chubu: {
      seasonMonths: [2, 3, 4, 5],
      peakMonths: [3, 4],
    },
    // 近畿以南ではサクラマスはほぼ釣れない（河川の降海型が希少）
  },

  // ── コノシロ ──
  // 全国デフォルト: season [9-3], peak [10,11,12]
  konoshiro: {
    hokkaido: {
      seasonMonths: [8, 9, 10],
      peakMonths: [9, 10],
    },
    tohoku: {
      seasonMonths: [9, 10, 11, 12],
      peakMonths: [10, 11],
    },
    kinki: {
      seasonMonths: [9, 10, 11, 12, 1, 2],
      peakMonths: [10, 11, 12],
    },
    kyushu: {
      seasonMonths: [8, 9, 10, 11, 12, 1, 2, 3],
      peakMonths: [10, 11, 12, 1],
    },
  },
};

/** 地域名→RegionSlugの変換マップ */
export const REGION_NAME_TO_SLUG: Record<string, RegionSlug> = {
  "北海道": "hokkaido",
  "東北": "tohoku",
  "関東": "kanto",
  "中部": "chubu",
  "近畿": "kinki",
  "中国": "chugoku",
  "四国": "shikoku",
  "九州・沖縄": "kyushu",
};

/** RegionSlug→地域名の変換マップ */
export const REGION_SLUG_TO_NAME: Record<RegionSlug, string> = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  chubu: "中部",
  kinki: "近畿",
  chugoku: "中国",
  shikoku: "四国",
  kyushu: "九州・沖縄",
};

/** 全RegionSlugの配列 */
export const ALL_REGION_SLUGS: RegionSlug[] = [
  "hokkaido", "tohoku", "kanto", "chubu",
  "kinki", "chugoku", "shikoku", "kyushu",
];
