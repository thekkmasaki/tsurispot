// Cloudflare ゾーンキャッシュの「URL単位」purge。
//
// 用途: UGC（釣果・スポット投稿）が保存された直後に、該当スポット1ページだけをエッジから無効化し、
// s-maxage=86400(24h) でも投稿を即時反映させる。
//
// 安全性（重要）: 2026-06-23 に purge_everything で全HTML+全エッジを消し、オリジンが約7,600ページを
// 一斉コールド再生成 → 1vCPU CPU100% → 502 嵐の本番障害を起こした。本関数は必ず "files"（特定URL）
// のみを purge し、purge_everything は使わない（1投稿=1ページ無効化なので同期冷生成の殺到は起きない）。
//
// 設定: CF_API_TOKEN / CF_ZONE_ID（App Runner ランタイム env）が未設定なら no-op（段階導入・非致命）。
//   ※ deploy.yml(CI) と同じ secret 名。CI と App Runner ランタイムは別ストアなので両方に設定が必要。

const SITE_ORIGIN = "https://tsurispot.com";

/**
 * 指定パス/URL のエッジキャッシュを purge する（fire-and-forget 推奨だが失敗は握りつぶす）。
 * @param paths 例: ["/spots/ibaraki-oarai-kashimanada-s11"]。絶対URLでも可。
 */
export async function purgeCloudflareUrls(paths: string[]): Promise<void> {
  const token = process.env.CF_API_TOKEN;
  const zone = process.env.CF_ZONE_ID;
  if (!token || !zone || paths.length === 0) return; // 未設定 = no-op（安全側）

  const files = paths.map((p) =>
    p.startsWith("http") ? p : `${SITE_ORIGIN}${p.startsWith("/") ? "" : "/"}${p}`,
  );

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files }),
        // 投稿レスポンスを長く待たせない。CFが遅延/不調でも投稿自体は成功させる。
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!res.ok) {
      console.error(`[cloudflare] purge failed: HTTP ${res.status}`);
    }
  } catch (err) {
    // タイムアウト/ネットワーク失敗は非致命（最悪 s-maxage 経過で反映）。
    console.error("[cloudflare] purge error:", err);
  }
}
