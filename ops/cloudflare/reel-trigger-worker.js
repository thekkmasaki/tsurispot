/**
 * 毎日のランキングリール（.github/workflows/sns-ranking-reel.yml）を定時に起動する Cloudflare Worker。
 *
 * GitHub Actions の schedule は数時間遅れたり、そもそも実行されなかったりするので、
 * 起動だけを Cloudflare の Cron Trigger に任せる（Workers 無料プランの範囲・PC 不要）。
 * 投稿済みなら workflow 側の gate が何もしない（only_if_not_posted）ので、二重投稿にはならない。
 *
 * 設定（Cloudflare ダッシュボード）:
 *   - Cron Trigger: 55 10 * * *   （UTC 10:55 = JST 19:55）
 *   - Secret: GITHUB_TOKEN  … Fine-grained PAT。対象リポジトリはこの1つだけ、権限は Actions: Read and write のみ
 * 手順の詳細: ops/cloudflare/README.md
 */
const REPO = "thekkmasaki/tsurispot";
const WORKFLOW = "sns-ranking-reel.yml";

async function dispatch(env) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "reel-trigger-worker",
    },
    body: JSON.stringify({ ref: "master", inputs: { dry_run: "false", only_if_not_posted: "true" } }),
  });
  // 成功は 204。失敗は Worker のログに残る。投稿されなくても予備の毎時起動が 20:30 以降に拾う
  if (res.status !== 204) throw new Error(`workflow_dispatch 失敗: ${res.status} ${await res.text()}`);
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(dispatch(env));
  },
};
