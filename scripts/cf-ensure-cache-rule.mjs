#!/usr/bin/env node
/**
 * Cloudflare Cache Rule「GEO text files」を冪等に作成/更新する。
 *
 * 背景: .txt / .xml は Cloudflare のデフォルトキャッシュ対象拡張子に含まれないため、
 * オリジンが s-maxage を返しても cf-cache-status: DYNAMIC のまま毎回オリジンに届く。
 * llms-full.txt は約900KB あり、AI クローラーの巡回が増えるとオリジン CPU / egress に直撃する。
 * このルールで「Cache-Control を尊重してエッジキャッシュする」対象に昇格させる。
 *
 * 冪等性: 同名ルールがあれば置換、無ければ追加。ruleset 全体を PUT するため、
 * 既存の他ルールは読み出したものをそのまま送り返して保持する。
 *
 * 権限: トークンに Zone > Cache Rules > Edit が必要。無い場合(403)は警告して exit 0
 * （deploy を落とさない。ヘッダー側の設定だけでも ISR により CPU 再生成は防げているため）。
 *
 * 単体実行: CF_API_TOKEN=xxx CF_ZONE_ID=yyy node scripts/cf-ensure-cache-rule.mjs
 */

const TOKEN = process.env.CF_API_TOKEN;
const ZONE = process.env.CF_ZONE_ID;
const RULE_DESCRIPTION = "GEO text files (llms/sitemap/robots) をエッジキャッシュ";
const PHASE_PATH = "rulesets/phases/http_request_cache_settings/entrypoint";

/** キャッシュ対象にするパス（Cloudflare の式言語） */
const EXPRESSION =
  'http.request.uri.path in {"/llms.txt" "/llms-full.txt" "/sitemap.xml" "/image-sitemap.xml" "/robots.txt"}';

const RULE = {
  description: RULE_DESCRIPTION,
  expression: EXPRESSION,
  action: "set_cache_settings",
  action_parameters: {
    cache: true,
    edge_ttl: {
      // オリジンの Cache-Control を尊重し、無い場合のみ 24h
      mode: "respect_origin",
      default: 86400,
    },
  },
};

function warn(message) {
  // GitHub Actions のアノテーションとして出す（ローカル実行時もそのまま読める）
  console.log(`::warning::${message}`);
}

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${ZONE}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

async function main() {
  if (!TOKEN || !ZONE) {
    warn("CF_API_TOKEN / CF_ZONE_ID 未設定のため Cache Rule の適用を skip しました。");
    return;
  }

  const current = await cf(PHASE_PATH);
  if (current.status === 403 || current.status === 401) {
    warn(
      "Cloudflare トークンに Cache Rules の権限がないため skip しました" +
        "（Zone > Cache Rules > Edit を付与すると自動適用されます）。",
    );
    return;
  }
  if (!current.body?.success) {
    warn(`Cache Rules の取得に失敗したため skip しました: HTTP ${current.status}`);
    return;
  }

  const existingRules = current.body.result?.rules ?? [];
  const others = existingRules.filter((r) => r.description !== RULE_DESCRIPTION);
  const mine = existingRules.find((r) => r.description === RULE_DESCRIPTION);

  if (mine && mine.expression === EXPRESSION && mine.enabled !== false) {
    console.log("Cache Rule は最新の内容で既に存在します（変更なし）。");
    return;
  }

  // ruleset 全体を PUT するため、他ルールは取得したものをそのまま送り返して保持する。
  // API が返す読み取り専用フィールド(id/version/last_updated/ref)は送信対象から外す。
  const payload = {
    rules: [
      ...others.map(({ id, version, last_updated, ref, ...rest }) => rest), // eslint-disable-line @typescript-eslint/no-unused-vars
      RULE,
    ],
  };

  const put = await cf(PHASE_PATH, { method: "PUT", body: JSON.stringify(payload) });
  if (put.status === 403 || put.status === 401) {
    warn("Cloudflare トークンに Cache Rules の編集権限がないため skip しました。");
    return;
  }
  if (!put.body?.success) {
    const errors = (put.body?.errors ?? []).map((e) => e.message).join(" / ") || `HTTP ${put.status}`;
    warn(`Cache Rule の適用に失敗しました（deploy は継続します）: ${errors}`);
    return;
  }

  console.log(mine ? "Cache Rule を更新しました。" : "Cache Rule を新規作成しました。");
}

main().catch((err) => {
  // ネットワーク断などでも deploy 自体は落とさない
  warn(`Cache Rule 適用中に例外が発生しました（deploy は継続します）: ${err?.message ?? err}`);
});
