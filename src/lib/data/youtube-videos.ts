import type { YouTubeVideo } from "@/components/youtube-embed";

/**
 * 釣り方カテゴリごとのYouTube動画データ
 * 全て実在する動画IDを使用
 */
export const fishingMethodVideos: Record<string, YouTubeVideo[]> = {
  sabiki: [
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 堤防編 - サビキ・ちょい投げ・ウキ釣り",
    },
    {
      videoId: "QfhgDNh2Yh8",
      title: "DAIWA初心者釣り入門 森川芳郎のやってみよう！堤防サビキ編",
    },
  ],
  lure: [
    {
      videoId: "ZBLXlVcwXrE",
      title: "モアザンブランジーノ実釣解説 - 大野ゆうきのシーバスルアー",
    },
    {
      videoId: "Fc6lIVIuAi8",
      title: "初心者でもすぐにできるショアジギング講座 - 釣りよかでしょう。",
    },
  ],
  eging: [
    {
      videoId: "By9euax0Av4",
      title: "エギング初挑戦！初心者でも釣れるエギングの始め方 - DUEL",
    },
    {
      videoId: "fBKLcF4VvZI",
      title: "エメラルダスドリフトマスク 山田ヒロヒトのエギング実釣 - DAIWA",
    },
  ],
  jigging: [
    {
      videoId: "Fc6lIVIuAi8",
      title: "初心者でもすぐにできるショアジギング講座 - 釣りよかでしょう。",
    },
    {
      videoId: "EgIIdmiVJHw",
      title: "陸からライトショアジギング 巨大ヒラメ - 釣りよかでしょう。",
    },
  ],
  "float-fishing": [
    {
      videoId: "NtnOYMBhef8",
      title: "DAIWA初心者釣り入門 やってみよう！堤防釣り - ウキ・エサ釣り",
    },
    {
      videoId: "5CiB0XtXDVw",
      title: "電気ウキを付けてアジ釣り - 南紀和歌山釣太郎",
    },
  ],
  casting: [
    {
      videoId: "NtnOYMBhef8",
      title: "DAIWA初心者釣り入門 やってみよう！堤防釣り - 投げ方の基本",
    },
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 堤防編 - ちょい投げの基本も解説",
    },
  ],
  knots: [
    {
      videoId: "AxclGqyo-yo",
      title: "素早く簡単最強ノット！堀田式FGノット - DUO公式",
    },
    {
      videoId: "tPRMy4Xlopw",
      title: "堀田光哉さん 簡単FGノット - マルヨシTV",
    },
  ],
  rigs: [
    {
      videoId: "QfhgDNh2Yh8",
      title: "DAIWA初心者釣り入門 サビキ仕掛けのセット方法 - 森川芳郎",
    },
    {
      videoId: "tPRMy4Xlopw",
      title: "堀田光哉さん 簡単FGノット - 仕掛け作りの基本",
    },
  ],
  "night-fishing": [
    {
      videoId: "5CiB0XtXDVw",
      title: "電気ウキを付けてアジ釣り - 南紀和歌山釣太郎",
    },
    {
      videoId: "NbHuGLcr7i4",
      title: "サーフのカゴ半夜釣りで高級魚を狙う - DAIWA磯ちゃんねる",
    },
  ],
};

/**
 * 釣り方名（日本語）からカテゴリキーへのマッピング
 */
const methodNameToCategory: Record<string, string> = {
  サビキ釣り: "sabiki",
  サビキ: "sabiki",
  ルアー: "lure",
  ルアー釣り: "lure",
  アジング: "lure",
  メバリング: "lure",
  ライトゲーム: "lure",
  エギング: "eging",
  ジギング: "jigging",
  ショアジギング: "jigging",
  ライトショアジギング: "jigging",
  ウキ釣り: "float-fishing",
  フカセ釣り: "float-fishing",
  投げ釣り: "casting",
  ちょい投げ: "casting",
  遠投カゴ釣り: "casting",
  穴釣り: "lure",
  ワーム: "lure",
  ブラクリ: "lure",
  泳がせ釣り: "float-fishing",
  ノマセ釣り: "float-fishing",
  落とし込み: "float-fishing",
  フライ: "lure",
  テンカラ: "lure",
};

/**
 * 釣り方名（日本語）に基づいて関連する動画を取得
 * @param methods 釣り方名の配列
 * @param maxVideos 最大表示数
 */
export function getVideosForMethods(
  methods: string[],
  maxVideos = 2
): YouTubeVideo[] {
  const seen = new Set<string>();
  const result: YouTubeVideo[] = [];

  for (const method of methods) {
    const category = methodNameToCategory[method];
    if (!category) continue;
    const videos = fishingMethodVideos[category];
    if (!videos) continue;
    for (const video of videos) {
      if (!seen.has(video.videoId) && result.length < maxVideos) {
        seen.add(video.videoId);
        result.push(video);
      }
    }
  }

  return result;
}

/**
 * スポットタイプに基づいてデフォルトの動画を取得
 */
export function getVideosForSpotType(
  spotType: string,
  maxVideos = 2
): YouTubeVideo[] {
  const spotTypeToCategories: Record<string, string[]> = {
    port: ["sabiki", "float-fishing"],
    beach: ["casting", "lure"],
    rocky: ["eging", "lure"],
    river: ["lure", "float-fishing"],
    pier: ["sabiki", "float-fishing"],
    breakwater: ["sabiki", "casting"],
  };

  const categories = spotTypeToCategories[spotType] || ["sabiki"];
  const seen = new Set<string>();
  const result: YouTubeVideo[] = [];

  for (const cat of categories) {
    const videos = fishingMethodVideos[cat];
    if (!videos) continue;
    for (const video of videos) {
      if (!seen.has(video.videoId) && result.length < maxVideos) {
        seen.add(video.videoId);
        result.push(video);
      }
    }
  }

  return result;
}
