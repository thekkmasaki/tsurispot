# SNSランキングリールの事前チェック（週1回・Claude が実行）

2026-11 にリールへ「釣り禁止じゃね？」「何年も前の情報」「聞いたことない」とコメントが続いたため、投稿前に Claude が1件ずつ確認する。
**承認の無い枠は投稿されない**（run.mjs。`SNS_REQUIRE_APPROVAL=false` で従来の自動選定に戻せる）。
承認データが1件も無い間（導入直後）は従来どおり自動選定で投稿し、最初の apply から承認制になる。

## いつ
毎週水曜 13時台（JST、週報の後）。Claude の定期タスクが新しいセッションで起動し、この手順を最後まで行う。
対象は翌日（木曜）から7日間・14枠（朝 am / 夜 pm）。

## 手順

### 1. 予定を作る
GitHub MCP の `actions_run_trigger` で `thekkmasaki/tsurispot` のワークフロー `sns-reel-precheck.yml` を
`ref: master`, inputs `{ "mode": "plan", "days": "7" }` で起動する。
完了まで5〜10分。`actions_list`（list_workflow_runs）で状態を見て待つ（ポーリングは数分おき。Monitor ツールが使えるなら使う）。

### 2. 予定を読む
完了した run のジョブログ（`get_job_logs`）から `===PLAN-JSON===` と `===PLAN-JSON-END===` の間の JSON を取り出す。
各枠: `date, slot, pref, fish, prefName, fishName, spots[10], pool[最大20], alternatives`。spots / pool は `slug|名前|市区町村|種別`。

### 3. 確認する（枠ごと）
**a. お題（県×魚）**: 1〜2回検索。`{県} {魚} 岸 釣果 {今年}`、必要なら `{魚} 激減 {県}`。
 - 近年岸から釣れていない・激減・船が主・生息域外 → お題を差し替える（下の 4）。
 - `docs/sns-spot-audit-2026-11-25.md` の追記と select-topic.ts の TOPIC_SKIP も参照。
**b. スポット（上位10件。除外が出たら pool の繰り上がり分も）**: 1件1回 `{スポット名} 釣り禁止`（一般的な名前なら市町村名を足す）。
 - `scripts/sns/ranking-reel/ban-audit.json` に載っているものはすでに除外済み（選ばれない）。
 - 2026-11-25 の個別調査で `none` だったスポットでも、半年たったら検索し直す。
 - 次のどれかなら `excludeSpots` に入れる: 二次情報でも釣り禁止・立入禁止の指摘がある／その魚がそこで釣れる根拠が乏しい・生息域や地形と合わない／実在や場所が怪しい（内陸の住所など）／被災・工事で使えない。
**c.** 除外後に残りが6件未満になる枠はお題を差し替える。

### 4. お題の差し替え
`alternatives`（`県slug/魚slug`）から選び、ローカルで
`npx --yes tsx@4.23.15 scripts/sns/ranking-reel/select-topic.ts --date {date} --pref {県} --fish {魚}` を実行して上位10件と pool を出し、3 と同じ確認をする。
同じ週に同じ魚・同じ県が続かないようにする（朝夜で同じ魚は避ける）。適当なものが無ければ `"skip": true`（その枠は投稿しない）。

### 5. 承認を保存
次の形の JSON 配列を作り、`actions_run_trigger` で `sns-reel-precheck.yml` を inputs `{ "mode": "apply", "decisions": "<JSON文字列>" }` で起動する。
```json
[{"date":"2026-12-03","slot":"am","pref":"hyogo","fish":"kasago","excludeSpots":["slug-a"],"note":"slug-aは立入禁止の指摘(釣りサイト)"},
 {"date":"2026-12-03","slot":"pm","skip":true,"note":"代わりのお題なし"}]
```
14枠すべて入れる（入っていない枠は投稿されない）。完了すると Discord に要約が届く。

### 6. 恒久的な修正
- 新しく見つかった禁止の指摘は `scripts/sns/ranking-reel/ban-audit.json` に追記し、県×魚の問題は `TOPIC_SKIP`、データの誤りは該当スポット（`src/lib/data/`）を直す。
- **master へ直接 push しない。** `feature/sns-precheck-YYYYMMDD` ブランチで commit・push し、PR を作る（merge はユーザー）。`npm run verify` が回らない環境なら CI の結果を確認する。
- 公式（県・市・港湾管理者）の根拠で禁止が確認できたものは `src/lib/data/spot-ban-overrides.ts` に `fishingBan` を付ける。

## 注意
- 投稿そのもの（sns-ranking-reel.yml）は起動しない。
- 検索結果は要約なので、根拠の URL と年を note に残す。推測で除外しない（ただし迷ったら除外側に倒す。投稿は拡散されるため）。
- WebSearch は1ターン200回が上限。足りないときは pool の確認を後回しにし、上位10件を優先する。
