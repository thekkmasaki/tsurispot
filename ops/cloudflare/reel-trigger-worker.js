/**
 * 毎日のランキングリール（.github/workflows/sns-ranking-reel.yml）を朝・夜の2回、定時に起動する Cloudflare Worker。
 *
 * GitHub Actions の schedule は数時間遅れたり、そもそも実行されなかったりするので、
 * 起動だけを Cloudflare の Cron Trigger に任せる（Workers 無料プランの範囲・PC 不要）。
 * 投稿済みなら workflow 側の gate が何もしない（only_if_not_posted）ので、二重投稿にはならない。
 *
 * 設定（Cloudflare ダッシュボード）:
 *   - Cron Trigger: 30 22 * * *   （UTC 22:30 = JST 7:30 → 朝の枠 am）
 *   - Cron Trigger: 55 10 * * *   （UTC 10:55 = JST 19:55 → 夜の枠 pm）
 *   - Secret: GITHUB_TOKEN  … Fine-grained PAT。対象リポジトリはこの1つだけ、権限は Actions: Read and write のみ
 * 手順の詳細: ops/cloudflare/README.md
 */
const REPO = "thekkmasaki/tsurispot";
const WORKFLOW = "sns-ranking-reel.yml";
const AM_CRON = "30 22 * * *"; // ダッシュボードの朝の Cron 式と一致させる（違うと夜の枠として起動される）

async function dispatch(env, slot) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "reel-trigger-worker",
    },
    body: JSON.stringify({ ref: "master", inputs: { dry_run: "false", only_if_not_posted: "true", slot } }),
  });
  // 成功は 204。失敗は Worker のログに残る。夜の枠は投稿されなくても予備の毎時起動が 20:30 以降に拾う（朝の枠に予備は無い）
  if (res.status !== 204) throw new Error(`workflow_dispatch 失敗: ${res.status} ${await res.text()}`);
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(dispatch(env, event.cron === AM_CRON ? "am" : "pm"));
  },
};
