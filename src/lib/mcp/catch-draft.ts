// AI アシスタントが作る釣果の「下書き」
//
// 下書きはサーバーに保存せず、確認ページ /post/catch の URL クエリにそのまま載せる。
// 投稿を確定するのは、ページを開いた本人が写真を付けて「投稿する」を押したときだけ
// （AI が勝手に公開することはない）。クエリは誰でも書き換えられるので、
// ページ側でも同じ検証を通し、不正な項目は捨ててフォームの初期値にしない。
import {
  COMMENT_MAX,
  FISH_NAME_MAX,
  SIZE_MAX_CM,
  isCatchMethod,
  isCatchWeather,
  type CatchMethod,
  type CatchWeather,
} from "@/lib/catch-report-options";
import { isRealDate, todayJst } from "@/lib/ugc-validation";

export const CATCH_DRAFT_PATH = "/post/catch";

export interface CatchDraft {
  spot: string;
  fishName?: string;
  sizeCm?: number;
  method?: CatchMethod;
  weather?: CatchWeather;
  date?: string;
  comment?: string;
}

function text(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t && t.length <= max ? t : undefined;
}

/** 0〜300cm の数値（小数は1桁に丸める）。それ以外は undefined */
export function draftSize(v: unknown): number | undefined {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0 || n > SIZE_MAX_CM) return undefined;
  return Math.round(n * 10) / 10;
}

/** 実在する過去〜今日（JST）の日付。それ以外は undefined */
export function draftDate(v: unknown): string | undefined {
  return isRealDate(v) && v <= todayJst() ? v : undefined;
}

/** 下書き → 確認ページのクエリ（空の項目は載せない） */
export function buildDraftQuery(d: CatchDraft): string {
  const q = new URLSearchParams();
  q.set("spot", d.spot);
  if (d.fishName) q.set("fish", d.fishName);
  if (d.sizeCm !== undefined) q.set("size", String(d.sizeCm));
  if (d.method) q.set("method", d.method);
  if (d.weather) q.set("weather", d.weather);
  if (d.date) q.set("date", d.date);
  if (d.comment) q.set("comment", d.comment);
  return q.toString();
}

/** 確認ページのクエリ → 下書き（不正な項目は捨てる。spot が無ければ null） */
export function parseDraftQuery(params: Record<string, string | string[] | undefined>): CatchDraft | null {
  const one = (k: string) => {
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const spot = text(one("spot"), 200);
  if (!spot) return null;
  const method = one("method");
  const weather = one("weather");
  return {
    spot,
    fishName: text(one("fish"), FISH_NAME_MAX),
    sizeCm: draftSize(one("size")),
    method: isCatchMethod(method) ? method : undefined,
    weather: isCatchWeather(weather) ? weather : undefined,
    date: draftDate(one("date")),
    comment: text(one("comment"), COMMENT_MAX),
  };
}
