/**
 * 投稿前の禁止チェック: リールに載せるスポットが「釣り禁止・立入禁止」になっていないかを、
 * Claude にウェブ検索させて確かめる（港湾管理者・自治体などの一次情報を優先）。
 *
 * 背景: サイトのデータは古いことがある。2026-11 に Instagram で
 *   「田子の浦も沼津港も釣り禁止では？」「和田防波堤は釣り禁止では？ 須磨の一文字も同じ」
 * と指摘された。どちらも現地は立入禁止だった（神戸の沖堤防は 2022 年に立入禁止化・渡船も廃止）。
 * SNS は拡散されるので、少しでも禁止の疑いがあれば載せない（安全側）。
 *
 * - 判定は Redis にキャッシュする（同じスポットを毎回調べ直さない）。載せて良い=60日、載せない=180日。
 * - API キーが無い・API が失敗した・判定が欠けた、のいずれも「確認できなかった」扱い（呼び出し側は投稿しない）。
 *
 * SDK（@anthropic-ai/sdk）は未導入で、依存追加は手動承認が必要なため fetch で直接呼ぶ（scripts/blog-generator.ts と同じ）。
 */
import { redis } from "./lib.mjs";

const MODEL = process.env.REEL_BANCHECK_MODEL || "claude-opus-5-5";
const CACHE_PREFIX = "sns:bancheck:v1:";
const TTL_OK = 60 * 864e2; // 60日
const TTL_NG = 180 * 864e2; // 180日

/**
 * @param {{ pref: {name: string}, spots: Array<{slug: string, name: string, city?: string, address?: string, access?: string, type?: string}> }} topic
 * @returns {Promise<{ ok: boolean, error?: string, results: Record<string, {postable: boolean, verdict: string, reason: string, sources: string[], cached?: boolean}> }>}
 */
export async function checkBans(topic) {
  const results = {};
  const todo = [];
  for (const s of topic.spots) {
    const hit = await redis(["GET", CACHE_PREFIX + s.slug]).catch(() => null);
    if (hit) {
      try { results[s.slug] = { ...JSON.parse(hit), cached: true }; continue; } catch { /* 壊れていたら調べ直す */ }
    }
    todo.push(s);
  }
  if (todo.length === 0) return { ok: true, results };

  const key = (process.env.ANTHROPIC_API_KEY ?? "").trim();
  if (!key) return { ok: false, error: "ANTHROPIC_API_KEY が未設定のため禁止チェックができない", results };

  let fresh;
  try {
    fresh = await askClaude(key, topic.pref.name, todo);
  } catch (e) {
    return { ok: false, error: `禁止チェックの API 呼び出しに失敗: ${e.message}`, results };
  }
  const missing = [];
  for (const s of todo) {
    const r = fresh.get(s.slug);
    if (!r) { missing.push(s.name); continue; }
    results[s.slug] = r;
    await redis(["SET", CACHE_PREFIX + s.slug, JSON.stringify({ ...r, checkedAt: new Date().toISOString() }),
      "EX", String(r.postable ? TTL_OK : TTL_NG)]).catch(() => {});
  }
  if (missing.length) return { ok: false, error: `判定が返ってこなかったスポットがある: ${missing.join("、")}`, results };
  return { ok: true, results };
}

const SYSTEM = `あなたは釣り場情報の事実確認担当です。SNS に「今釣れる釣り場ランキング」を投稿する直前に、各釣り場が現在「釣り禁止」「立入禁止」になっていないかをウェブ検索で確かめます。

確認の優先順位:
1. 港湾管理者（都道府県・市の港湾局や土木事務所）、漁港管理者、自治体、海上保安部、警察の公式ページや PDF
2. 漁協・渡船業者・釣り施設の公式サイトや公式 SNS（営業終了・渡船廃止の告知など）
3. 新聞・テレビの報道
4. 釣り情報サイト・ブログ（補助。日付の新しいものを重視）

判定の基準（SNS は拡散されるので安全側に倒す）:
- banned: 釣り場の主な場所（その名前で釣り人が指す堤防・岸壁など）が、立入禁止・釣り禁止になっている。渡船でしか行けない沖堤防で、渡船が廃止・禁止された場合も含む。
- restricted: 一部のエリアだけ禁止、または時間・曜日・季節による禁止がある。
- open: 公式の釣り施設・公園の釣り場である、または公式情報や最近の釣果報告から、現在も一般に釣りができると判断できる。
- unknown: 判断材料が見つからない。
- postable は、open のときだけ true にする。banned と restricted は必ず false。unknown は、渡船で渡る沖堤防・一文字、港湾の防波堤や岸壁（関係者以外立入禁止になりやすい場所）なら false、それ以外（海岸・河川・公園など）は true。
- 「立入禁止になった」「釣り禁止になった」という釣り人の報告が複数あれば、公式情報が見つからなくても banned か restricted にする。

各スポットについて実際に検索してから判定すること。推測で埋めないこと。

最後に、次の形の JSON だけを \`\`\`json のコードブロックで出力すること（説明文はその前に書いてよい）:
{"results":[{"slug":"...","verdict":"banned|restricted|open|unknown","postable":true,"reason":"日本語で1〜2文。根拠の発信者と時期を含める","sources":["根拠のURL"]}]}`;

async function askClaude(key, prefName, spots) {
  const list = spots.map((s, i) =>
    `${i + 1}. slug=${s.slug} / 名前: ${s.name} / ${prefName}${s.city ?? ""} / 種別: ${s.type ?? "-"}` +
    (s.address ? ` / 住所: ${s.address}` : "") + (s.access ? ` / アクセス: ${s.access}` : "")).join("\n");
  const messages = [{ role: "user", content: `今日は ${new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10)} です。次の ${prefName} の釣り場を確認してください。\n\n${list}` }];

  // サーバー側の検索ループが上限に達すると pause_turn で返るので、続きを頼む（最大4回）
  for (let round = 0; round < 4; round++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "server-side-fallback-2026-07-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: "medium" },
        fallbacks: "default",
        system: SYSTEM,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: Math.min(30, spots.length * 3), user_location: { type: "approximate", country: "JP", timezone: "Asia/Tokyo" } }],
        messages,
      }),
      signal: AbortSignal.timeout(9 * 60e3),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`HTTP ${res.status} ${json.error?.message ?? ""}`);
    if (json.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: json.content });
      continue;
    }
    if (json.stop_reason === "refusal") throw new Error("モデルが応答を拒否した");
    const text = json.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return parseResults(text, spots);
  }
  throw new Error("検索が終わらなかった（pause_turn が続いた）");
}

/** 出力の最後の ```json ブロックを読む。形が崩れたスポットは判定なし扱い（呼び出し側で投稿を止める） */
export function parseResults(text, spots) {
  const blocks = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
  const raw = blocks.length ? blocks[blocks.length - 1][1] : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error("判定 JSON を読めなかった"); }
  const wanted = new Set(spots.map((s) => s.slug));
  const out = new Map();
  for (const r of parsed.results ?? []) {
    if (!wanted.has(r?.slug) || !["banned", "restricted", "open", "unknown"].includes(r.verdict)) continue;
    // モデルの postable と verdict が食い違ったら、禁止側に寄せる
    const postable = r.postable === true && (r.verdict === "open" || r.verdict === "unknown");
    out.set(r.slug, {
      postable,
      verdict: r.verdict,
      reason: String(r.reason ?? "").slice(0, 300),
      sources: (Array.isArray(r.sources) ? r.sources : []).filter((u) => typeof u === "string" && /^https?:\/\//.test(u)).slice(0, 3),
    });
  }
  return out;
}
