// 釣果投稿の選択肢（投稿API・投稿フォーム・MCP の下書きツールで共通に使う）
export const CATCH_METHODS = ["サビキ", "投げ", "ルアー", "フカセ", "エギング", "ジギング", "穴釣り", "ウキ釣り", "その他"] as const;
export const CATCH_WEATHERS = ["晴れ", "曇り", "雨", "風強い"] as const;

export type CatchMethod = (typeof CATCH_METHODS)[number];
export type CatchWeather = (typeof CATCH_WEATHERS)[number];

export function isCatchMethod(v: unknown): v is CatchMethod {
  return typeof v === "string" && (CATCH_METHODS as readonly string[]).includes(v);
}

export function isCatchWeather(v: unknown): v is CatchWeather {
  return typeof v === "string" && (CATCH_WEATHERS as readonly string[]).includes(v);
}

export const FISH_NAME_MAX = 30;
export const COMMENT_MAX = 100;
export const SIZE_MAX_CM = 300;
