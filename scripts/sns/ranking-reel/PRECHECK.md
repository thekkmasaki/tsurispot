# SNSランキングリールの事前チェック（週1回・Claude が実行）

2026-11 にリールへ「釣り禁止じゃね？」「何年も前の情報」「聞いたことない」とコメントが続いたため、投稿前に Claude が1件ずつ確認する。
**承認の無い枠は投稿されない**（run.mjs。`SNS_REQUIRE_APPROVAL=false` で従来の自動選定に戻せる）。
承認データが1件も無い間（導入直後）は従来どおり自動選定で投稿し、最初の apply から承認制になる。

## いつ
毎週水曜 13時台（JST、週報の後）。Claude の定期タスクが新しいセッションで起動し、この手順を最後まで行う。
対象は翌日（木曜）から7日間・14枠（朝 am / 夜 pm）。

## 手順

### 1. 予定を作る（セッションから Redis を直接読む）
Claude の GitHub 連携はワークフローを起動できない（2026-11-25 に 403 を確認）ため、予定作成も承認の保存もセッション内で行う。
Upstash の REST トークンは、この環境のネットワークシークレットとして保存されていて、通信の経路で自動付与される（値は見えない）。

```bash
export UPSTASH_REDIS_REST_URL="https://<Upstash の REST ホスト>"   # 環境変数に保存済みなら不要
export UPSTASH_REDIS_REST_TOKEN=dummy   # 実際のトークンは通信経路で差し替わる
node scripts/sns/ranking-reel/plan-week.mjs plan --days 7
```
Redis に届かない（401/403・`no rule allows host`）ときは、何も変えずにその旨を報告して終える（トークンが未設定）。

### 2. 予定を読む
`out/sns-precheck/plan.json`（標準出力の `===PLAN-JSON===` 〜 `===PLAN-JSON-END===` も同じ）を読む。
各枠: `date, slot, pref, fish, prefName, fishName, spots[10], pool[最大20], alternatives`。spots / pool は `slug|名前|市区町村|種別`。

### 3. 確認する（枠ごと）
**a. お題（県×魚）**: 1〜2回検索。`{県} {魚} 岸 釣果 {今年}`、必要なら `{魚} 激減 {県}`。
 - 近年岸から釣れていない・激減・船が主・生息域外 → お題を差し替える（下の 4）。
 - `docs/sns-spot-audit-2026-11-25.md` の追記と select-topic.ts の TOPIC_SKIP も参照。
**b. スポット（上位10件。除外が出たら pool の繰り上がり分も）**: 1件1回 `{スポット名} 釣り禁止`（一般的な名前なら市町村名を足す）。
 結果が「見つからない」でも、`{スポット名} 立入禁止 フェンス 閉鎖 {今年}` でもう1回検索する（2026-11 西浦漁港: 防波堤の立入禁止は釣具店の Instagram と釣りブログにしか出ておらず、1回目の検索で見落とした）。
 住所の市区町村が実在の地名と合っているかも確認する（同: 「糸島市西浦」は存在せず、正しくは福岡市西区西浦）。
 - `scripts/sns/ranking-reel/ban-audit.json` に載っているものはすでに除外済み（選ばれない）。
 - 2026-11-25 の個別調査で `none` だったスポットでも、半年たったら検索し直す。
 - 次のどれかなら `excludeSpots` に入れる: 二次情報でも釣り禁止・立入禁止の指摘がある／その魚がそこで釣れる根拠が乏しい・生息域や地形と合わない／実在や場所が怪しい（内陸の住所など）／被災・工事で使えない。
**c.** 除外後に残りが6件未満になる枠はお題を差し替える。

### 4. お題の差し替え
`alternatives`（`県slug/魚slug`）から選び、ローカルで
`npx --yes tsx@4.23.15 scripts/sns/ranking-reel/select-topic.ts --date {date} --pref {県} --fish {魚}` を実行して上位10件と pool を出し、3 と同じ確認をする。
同じ週に同じ魚・同じ県が続かないようにする（朝夜で同じ魚は避ける）。適当なものが無ければ `"skip": true`（その枠は投稿しない）。

### 5. 承認を保存
次の形の JSON 配列を作り、1 と同じ環境変数で `PRECHECK_DECISIONS="$(cat decisions.json)" node scripts/sns/ranking-reel/plan-week.mjs apply` を実行する。
（GitHub Actions の `sns-reel-precheck.yml` を mode=apply で起動しても同じ。Actions を起動できる人が手動で行う場合用）
```json
[{"date":"2026-12-03","slot":"am","pref":"hyogo","fish":"kasago","excludeSpots":["slug-a"],"note":"slug-aは立入禁止の指摘(釣りサイト)"},
 {"date":"2026-12-03","slot":"pm","skip":true,"note":"代わりのお題なし"}]
```
14枠すべて入れる（入っていない枠は投稿されない）。

### 6. 恒久的な修正
- 新しく見つかった禁止の指摘は `scripts/sns/ranking-reel/ban-audit.json` に追記し、県×魚の問題は `TOPIC_SKIP`、データの誤りは該当スポット（`src/lib/data/`）を直す。
- **master へ直接 push しない。** `feature/sns-precheck-YYYYMMDD` ブランチで commit・push し、PR を作る（merge はユーザー）。`npm run verify` が回らない環境なら CI の結果を確認する。
- 公式（県・市・港湾管理者）の根拠で禁止が確認できたものは `src/lib/data/spot-ban-overrides.ts` に `fishingBan` を付ける。

## 注意
- 投稿そのもの（sns-ranking-reel.yml）は起動しない。
- 検索結果は要約なので、根拠の URL と年を note に残す。推測で除外しない（ただし迷ったら除外側に倒す。投稿は拡散されるため）。
- WebSearch は1ターン200回が上限。足りないときは pool の確認を後回しにし、上位10件を優先する。
