#!/usr/bin/env node
/**
 * Cloudflare の single-file purge が silent failure する原因を切り分ける読み取り専用の診断。
 *
 * 症状(2026-08-08〜、2026-08-12 に手動 purge でも再現):
 *   purge_cache API は success:true / purged N/N を返し、ゾーン名も tsurispot.com なのに、
 *   対象 URL の cf-cache-status は HIT のまま age が時計どおり増え続ける（＝実際には消えていない）。
 *   その結果 deploy しても実ユーザーには旧HTMLが配信され続ける（/partner は s-maxage=1年）。
 *
 * Cloudflare の仕様上、次のいずれかがあると URL 指定 purge が効かない/対象を取り違える:
 *   - Cache Rules でカスタムキャッシュキーを設定している（single-file purge 非対応）
 *   - Cache Reserve にオブジェクトが残っている
 *   - Tiered Cache の上位ティアに残る
 *   - トークンに Cache Purge 権限が無い（ただし通常は 403 になる）
 * これらを API から読み出して表示するだけで、設定変更は一切行わない。
 */

const TOKEN = process.env.CF_API_TOKEN;
const ZONE = process.env.CF_ZONE_ID;

async function cf(path) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, body };
}

function head(title) {
  console.log(`\n===== ${title} =====`);
}

async function main() {
  if (!TOKEN || !ZONE) {
    console.log("CF_API_TOKEN / CF_ZONE_ID が未設定です。");
    process.exit(1);
  }

  head("トークン権限");
  const verify = await cf("user/tokens/verify");
  console.log(`verify: HTTP ${verify.status} status=${verify.body?.result?.status ?? "?"}`);
  // どのトークンが CF_API_TOKEN に入っているかの特定用（ダッシュボードで各トークンを開いた
  // URL 末尾の ID と突き合わせる）。権限プローブで名前も推定する。
  console.log(`token_id=${verify.body?.result?.id ?? "(取得不可)"}`);
  const wafProbe = await cf(`zones/${ZONE}/rulesets/phases/http_request_firewall_custom/entrypoint`);
  console.log(`WAFルール読み取り: HTTP ${wafProbe.status}（200なら WAF 権限あり＝tsurispot-waf-bot-defense 系、403なら Cache Purge 専用＝tsurispot-app-purge 系）`);

  head("ゾーン基本情報");
  const zone = await cf(`zones/${ZONE}`);
  const z = zone.body?.result;
  console.log(`name=${z?.name} plan=${z?.plan?.name} status=${z?.status}`);
  console.log(`development_mode=${z?.development_mode}`);

  head("キャッシュ関連のゾーン設定");
  for (const setting of ["cache_level", "browser_cache_ttl", "always_online", "development_mode", "sort_query_string_for_cache"]) {
    const s = await cf(`zones/${ZONE}/settings/${setting}`);
    console.log(`${setting}: ${JSON.stringify(s.body?.result?.value ?? `(HTTP ${s.status})`)}`);
  }

  head("Cache Reserve / Tiered Cache");
  for (const [label, path] of [
    ["cache_reserve", `zones/${ZONE}/cache/cache_reserve`],
    ["tiered_cache_smart_topology", `zones/${ZONE}/argo/tiered_caching`],
    ["regional_tiered_cache", `zones/${ZONE}/cache/regional_tiered_cache`],
  ]) {
    const r = await cf(path);
    console.log(`${label}: HTTP ${r.status} value=${JSON.stringify(r.body?.result?.value ?? r.body?.result ?? null)}`);
  }

  head("Cache Rules（http_request_cache_settings phase）※カスタムキャッシュキーの有無が本命");
  const cacheRules = await cf(`zones/${ZONE}/rulesets/phases/http_request_cache_settings/entrypoint`);
  if (cacheRules.body?.success) {
    const rules = cacheRules.body.result?.rules ?? [];
    if (rules.length === 0) console.log("(ルールなし)");
    for (const r of rules) {
      console.log(`- [${r.enabled === false ? "無効" : "有効"}] ${r.description || "(説明なし)"}`);
      console.log(`  expression: ${r.expression}`);
      const ap = r.action_parameters ?? {};
      console.log(`  cache=${ap.cache} edge_ttl=${JSON.stringify(ap.edge_ttl ?? null)}`);
      if (ap.cache_key) {
        console.log(`  ★ cache_key(カスタムキャッシュキー)=${JSON.stringify(ap.cache_key)}`);
      }
    }
  } else {
    console.log(`取得失敗: HTTP ${cacheRules.status} ${JSON.stringify(cacheRules.body?.errors ?? null)}`);
  }

  head("その他の ruleset phase（キャッシュに影響しうるもの）");
  const rulesets = await cf(`zones/${ZONE}/rulesets`);
  for (const rs of rulesets.body?.result ?? []) {
    if (/cache|transform|origin/i.test(rs.phase)) {
      console.log(`- phase=${rs.phase} name=${rs.name} kind=${rs.kind}`);
    }
  }

  head("Page Rules（旧仕様。キャッシュ everything 等が残っていないか）");
  const pageRules = await cf(`zones/${ZONE}/pagerules`);
  for (const pr of pageRules.body?.result ?? []) {
    const targets = (pr.targets ?? []).map((t) => t.constraint?.value).join(", ");
    const actions = (pr.actions ?? []).map((a) => `${a.id}=${JSON.stringify(a.value)}`).join(", ");
    console.log(`- [${pr.status}] ${targets} → ${actions}`);
  }
}

main().catch((e) => {
  console.log(`診断中に例外: ${e?.message ?? e}`);
  process.exit(1);
});
