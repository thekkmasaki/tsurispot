/**
 * 釣果週報の旧URL形式（/fishing-reports/weekly/2026-11-15 など）。サイト内には存在しないが
 * 外部から参照されて404になっていた（2026-11 監査）。週報の実体はブログ記事なので、週報の一覧へ301する。
 *
 * next.config の redirects で `/blog?tag=%E9%87%A3...` を指定すると、Next がクエリを日本語に
 * デコードしたまま Location ヘッダに入れて Node が拒否し、本番で500になった（#651）。
 * URL オブジェクトで組み立てて、エンコード済みの Location を返す。
 */
const WEEKLY_REPORT_LIST_PATH = `/blog?tag=${encodeURIComponent("釣果週報")}`;

function redirectToWeeklyList(): Response {
  return new Response(null, {
    status: 301,
    headers: {
      Location: WEEKLY_REPORT_LIST_PATH,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

export function GET(): Response {
  return redirectToWeeklyList();
}

export function HEAD(): Response {
  return redirectToWeeklyList();
}
