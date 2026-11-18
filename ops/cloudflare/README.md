# reel-trigger（毎日のリールを JST 7:30 と 19:55 に起動する Cloudflare Worker）

GitHub Actions の定時実行は遅れたり実行されなかったりするため、`sns-ranking-reel.yml` の起動を Cloudflare の Cron Trigger に任せる。
Workers 無料プランの範囲で動く（1日2回の起動のみ）。朝の Cron は slot=am、夜の Cron は slot=pm で起動する（Worker が event.cron で判別）。
予備として GitHub 側の毎時起動も残してあり、夜の枠が 20:30 時点で未投稿なら投稿する（朝の枠に予備は無い）。

## 1. GitHub トークンを作る（ユーザー作業）

GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token

- Repository access: **Only select repositories** → `thekkmasaki/tsurispot`
- Permissions → Repository permissions → **Actions: Read and write**（ほかは触らない）
- Expiration: 最長（期限が来たら作り直して 3 の Secret を更新）

## 2. Worker を作る

Cloudflare ダッシュボード → Workers & Pages → Create → Worker（Hello World）→ 名前 `reel-trigger` → Deploy
→ Edit code で中身を `reel-trigger-worker.js` に丸ごと置き換えて Deploy

## 3. 設定

Worker `reel-trigger` → Settings

- **Variables and Secrets** → Add → Type: Secret / Name: `GITHUB_TOKEN` / Value: 1 のトークン（ユーザーが貼る）
- **Trigger Events（Cron Triggers）** → Add → Cron を2本: `30 22 * * *`（UTC。JST 7:30・朝の枠）と `55 10 * * *`（UTC。JST 19:55・夜の枠）
  - 朝の Cron 式を変えるときは `reel-trigger-worker.js` の `AM_CRON` も同じ値にする

## 確認

- 7:30・19:55 以降に GitHub の Actions で `workflow_dispatch` の実行があり、投稿されていれば OK
- その枠が投稿済みのときは gate が「投稿済み → 何もしない」で終わる（正常）
