// コンテンツの実更新日（git のデータファイル最終コミット日）を引くヘルパ。
// sitemap の lastmod と JSON-LD の dateModified を「ビルド日」ではなく実データ更新日にするために使う。
// データは scripts/gen-content-dates.mjs が生成する（prebuild で自動更新。git 履歴が無い環境では
// コミット済みの JSON を使う）。サーバー専用（JSON が大きいのでクライアントから import しない）。
import contentDates from "@/lib/data/generated/content-dates.json";

type ContentDates = {
  latest: string | null;
  files: Record<string, string>;
  spots: Record<string, string>;
  fish: Record<string, string>;
};

const data = contentDates as ContentDates;

/** 生成時点で最も新しいデータ更新日（どれにも当たらない時のフォールバック。ビルド日ではない） */
export const LATEST_CONTENT_DATE: string = data.latest ?? "2026-11-15";

type DateInput = string | Date | null | undefined;

function toYmd(d: DateInput): string | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return Number.isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
  return d.slice(0, 10);
}

/** 複数候補のうち最も新しい日付（YYYY-MM-DD）。全て未知なら LATEST_CONTENT_DATE */
export function latestYmd(...dates: DateInput[]): string {
  let best: string | undefined;
  for (const d of dates) {
    const ymd = toYmd(d);
    if (ymd && (!best || ymd > best)) best = ymd;
  }
  return best ?? LATEST_CONTENT_DATE;
}

/** リポジトリ相対パスのファイル最終更新日（例: "src/lib/data/monthly-guides.ts"） */
export function fileYmd(relPath: string): string | undefined {
  return data.files[relPath];
}

/** パターンに一致するファイル群のうち最新の更新日（例: /^src\/lib\/data\/shops/） */
export function filesLatestYmd(pattern: RegExp): string | undefined {
  let best: string | undefined;
  for (const [f, d] of Object.entries(data.files)) {
    if (pattern.test(f) && (!best || d > best)) best = d;
  }
  return best;
}

/** 静的ルートのページファイル（src/app{route}/page.tsx）の最終更新日 */
export function routeYmd(route: string): string | undefined {
  const clean = route.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");
  return data.files[`src/app${clean}/page.tsx`];
}

/** スポットを定義しているデータファイルの最終更新日 */
export function spotYmd(slug: string): string | undefined {
  return data.spots[slug];
}

/** 魚種を定義しているデータファイルの最終更新日 */
export function fishYmd(slug: string): string | undefined {
  return data.fish[slug];
}

/** スポット群（一覧ページ）の最終更新日 = 掲載スポットの最新更新日と追加ファイルの最大 */
export function spotsLatestYmd(
  spots: readonly { slug: string }[],
  ...extra: DateInput[]
): string {
  let best: string | undefined;
  for (const s of spots) {
    const d = data.spots[s.slug];
    if (d && (!best || d > best)) best = d;
  }
  return latestYmd(best, ...extra);
}
