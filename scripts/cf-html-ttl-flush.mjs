#!/usr/bin/env node
/**
 * HTML の古いエッジキャッシュを Edge TTL の一時短縮で失効させる（URL指定 purge が効かないため）。
 *
 * 背景: 2026-08-12 の実測で、URL指定 purge は静的アセットには効くが
 * Cache Rule「Cache public HTML (respect origin)」の対象 HTML には全く効かないことが判明した
 * （画像は age 732,284→7 秒に対し /partner は age が経過時間ぶん増えるだけ）。
 * その結果、デプロイしても実ユーザーには旧 HTML が配信され続ける
 * （/partner は Next.js 既定の s-maxage=1年 ＋ respect_origin で実質永久）。
 *
 * 手法: 対象ルールの Edge TTL を respect_origin → override_origin(短時間) に一時変更し、
 * 保持済みオブジェクトを失効させてから元に戻す。purge_everything（2026-06 に 502 嵐の前科）を避けた
 * 外科的な代替。失敗しても finally で必ず元の設定に戻す。
 *
 * 使い方: CF_API_TOKEN / CF_ZONE_ID を環境変数に入れて
 *   node scripts/cf-html-ttl-flush.mjs [保持秒数(既定60)] [待機秒数(既定90)]
 * 必要権限: Zone > Cache Rules > Edit
 */

const TOKEN = process.env.CF_API_TOKEN;
const ZONE = process.env.CF_ZONE_ID;
const TARGET_DESCRIPTION = "Cache public HTML (respect origin)";
const PHASE_PATH = `zones/${ZONE}/rulesets/phases/http_request_cache_settings/entrypoint`;
const SHORT_TTL = Number(process.argv[2] || 60);
const WAIT_SECONDS = Number(process.argv[3] || 90);
/** 効果測定に使う代表URL（古いことが実測済みのページ） */
const PROBE_URL = "https://tsurispot.com/partner";

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  return { status: res.status, body };
}

/** API が返す読み取り専用フィールドを落として PUT 可能な形にする */
function toWritable(rule) {
  const { id, version, last_updated, ref, ...rest } = rule; // eslint-disable-line @typescript-eslint/no-unused-vars
  return rest;
}

async function putRules(rules) {
  const res = await cf(PHASE_PATH, { method: "PUT", body: JSON.stringify({ rules }) });
  if (!res.body?.success) {
    const errors = (res.body?.errors ?? []).map((e) => e.message).join(" / ") || `HTTP ${res.status}`;
    throw new Error(`ruleset の更新に失敗: ${errors}`);
  }
}

async function probe(label) {
  const res = await fetch(PROBE_URL, { redirect: "manual" });
  const age = res.headers.get("age");
  const status = res.headers.get("cf-cache-status");
  console.log(`[${label}] age=${age ?? "(なし)"} cf-cache-status=${status}`);
  return Number(age ?? -1);
}

async function main() {
  if (!TOKEN || !ZONE) {
    console.log("::error::CF_API_TOKEN / CF_ZONE_ID が未設定です。");
    process.exit(1);
  }

  const current = await cf(PHASE_PATH);
  if (!current.body?.success) {
    console.log(`::error::Cache Rules の取得に失敗: HTTP ${current.status}（Cache Rules 権限を確認）`);
    process.exit(1);
  }

  const rules = current.body.result?.rules ?? [];
  const targetIndex = rules.findIndex((r) => r.description === TARGET_DESCRIPTION);
  if (targetIndex === -1) {
    console.log(`::error::対象ルール「${TARGET_DESCRIPTION}」が見つかりません。ルール名の変更を確認してください。`);
    process.exit(1);
  }

  const originalEdgeTtl = rules[targetIndex].action_parameters?.edge_ttl;
  console.log(`対象ルール: ${TARGET_DESCRIPTION}`);
  console.log(`元の edge_ttl: ${JSON.stringify(originalEdgeTtl)}`);

  const beforeAge = await probe("変更前");

  let restored = false;
  const restore = async () => {
    if (restored) return;
    const writable = rules.map(toWritable);
    writable[targetIndex] = {
      ...writable[targetIndex],
      action_parameters: { ...writable[targetIndex].action_parameters, edge_ttl: originalEdgeTtl },
    };
    await putRules(writable);
    restored = true;
    console.log("元の edge_ttl に復元しました。");
  };

  // 異常終了でも必ず戻す
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, () => {
      restore().finally(() => process.exit(1));
    });
  }

  try {
    const writable = rules.map(toWritable);
    writable[targetIndex] = {
      ...writable[targetIndex],
      action_parameters: {
        ...writable[targetIndex].action_parameters,
        edge_ttl: { mode: "override_origin", default: SHORT_TTL },
      },
    };
    await putRules(writable);
    console.log(`edge_ttl を override_origin(${SHORT_TTL}秒) に一時変更しました。${WAIT_SECONDS}秒待機します…`);

    await new Promise((r) => setTimeout(r, WAIT_SECONDS * 1000));
    const afterAge = await probe("待機後");

    if (afterAge >= 0 && beforeAge >= 0 && afterAge < beforeAge) {
      console.log(`✅ 古いキャッシュが失効しました（age ${beforeAge} → ${afterAge}）。`);
    } else {
      console.log(
        `⚠️ age が下がりませんでした（${beforeAge} → ${afterAge}）。Edge TTL の変更は保存済みオブジェクトに` +
          "遡及しないと判断できます（この場合は purge_everything など別手段が必要）。",
      );
    }
  } finally {
    await restore();
    await probe("復元後");
  }
}

main().catch(async (e) => {
  console.log(`::error::${e?.message ?? e}`);
  process.exit(1);
});
