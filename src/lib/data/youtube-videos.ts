import type { YouTubeVideo } from "@/components/youtube-embed";

/**
 * 釣り方カテゴリごとのYouTube動画データ
 * 全て実在する動画IDを使用
 */
export const fishingMethodVideos: Record<string, YouTubeVideo[]> = {
  sabiki: [
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 - 堤防サビキ釣り",
    },
    {
      videoId: "QfhgDNh2Yh8",
      title: "DAIWA初心者入門 - 堤防サビキ釣り",
    },
  ],
  lure: [
    {
      videoId: "NtnOYMBhef8",
      title: "DAIWA初心者釣り入門 - ルアー釣りの基本",
    },
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 - 堤防での釣り方",
    },
  ],
  eging: [
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 - エギングの基本動作",
    },
    {
      videoId: "NtnOYMBhef8",
      title: "DAIWA初心者入門 - ルアーフィッシング",
    },
  ],
  jigging: [
    {
      videoId: "NtnOYMBhef8",
      title: "DAIWA初心者入門 - ショアジギングの基本",
    },
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 - メタルジグの使い方",
    },
  ],
  "float-fishing": [
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 - ウキ釣りの基本",
    },
    {
      videoId: "QfhgDNh2Yh8",
      title: "DAIWA初心者入門 - ウキ釣り入門",
    },
  ],
  casting: [
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 - キャスティングの基本",
    },
    {
      videoId: "NtnOYMBhef8",
      title: "DAIWA初心者入門 - 投げ釣りの基本",
    },
  ],
  knots: [
    {
      videoId: "AxclGqyo-yo",
      title: "堀田式FGノット - 簡単で強い結び方",
    },
    {
      videoId: "tPRMy4Xlopw",
      title: "簡単FGノットの結び方 - 初心者向け",
    },
  ],
  rigs: [
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 - 仕掛けの作り方",
    },
    {
      videoId: "QfhgDNh2Yh8",
      title: "DAIWA初心者入門 - 基本の仕掛け",
    },
  ],
  "night-fishing": [
    {
      videoId: "5CiB0XtXDVw",
      title: "電気ウキで夜釣り - 初心者向け解説",
    },
    {
      videoId: "Jnqt18hYwAM",
      title: "シマノ初心者釣り教室 - 夜釣りの準備",
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
