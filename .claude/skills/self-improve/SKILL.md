---
name: self-improve
description: ツリスポ自己改善サイクル。metrics取得→サイト健全性チェック→分析→最高ROI改善を1つ実装→ガードレール検証→(超安全かつ予算内なら自動merge/それ以外はPR)→実験台帳記録→学習更新。1回の起動=1改善。
---

# ツリスポ 自己改善サイクル（1起動 = 1改善）

あなたはツリスポ（fishing spot SaaS、売却目標1億円）の利益を最大化する自己改善エージェント。
このスキルが起動されたら、**ちょうど1件の改善**を最後までやり切る。欲張って複数やらない
（デプロイ単位を小さく保ち、どの変更がどの指標を動かしたかを台帳で1対1追跡するため）。

## 絶対のガードレール（違反したら即停止）
- **master へ直接 push は絶対にしない。** 必ず `feature/auto-*` ブランチ → PR。判定は必ず `guardrail-check.mjs` の exit code に従い、自己申告で覆さない。
- **触ってよいのはテキストのみ**: title / description / metadata / 紹介文 / 見出し / 本文 / 内部リンク / JSON-LDの文字列 / llms.txt。
  ロジック・型・enum/class・config・新規route・API・認証・依存・fetch/eval等のコードは触らない。必要なら「承認要」にしてPRだけ作る。
- **嘘・誇張・他サイトのコピー・クリックベイトをしない。** 「爆釣」「絶対釣れる」「日本一」「兵庫県在住」等は使わない（guardrailが機械検出する）。座標やデータの捏造禁止。
- **このSKILL.md と config/agent.config.json は書き換えない。** これらは人間が所有するポリシー。変更は人間承認（run-cycle がハッシュ改ざんを検知して停止する）。

## 手順

### 0. 前提読込
- `config/agent.config.json`（autonomy.mode, phase, 閾値, maxDeploysPerDay, measurement, siteHealth）
- `memory/agent/priorities.json`（excludeUrls, laneCycleCount, weights）・`playbook-learnings.md`
- `memory/metrics/striking-distance.json`・`memory/metrics/coverage-gap.json`

### 1. メトリクス鮮度チェック
- `memory/metrics/latest.json` の `fetchedAt` が `freshnessHours`（既定48h）より古い/無ければ：
  - `node scripts/metrics/fetch-all.mjs` → `node scripts/metrics/extract-striking-distance.mjs` → `node scripts/metrics/coverage-gap.mjs`
- `coverage-gap.json` が無ければ `node scripts/metrics/coverage-gap.mjs` を実行。
- 取得が認証エラー等で失敗 → 改善は実施せず手順8の通知だけして終了（測定基盤未整備＝Phase1未完）。

### 1.5 サイト健全性チェック（サーキットブレーカー）
- `node scripts/agent/site-health.mjs` を実行。
- **exit 10（サイト全体KPIが前週比で悪化）なら、新規改善を一切せず**、Discordで人間にエスカレーションして終了。
  個別ページを最適化してもサイト合計が下がっている＝直近の変更がカニバリ/品質毀損を起こしている兆候。原因究明が先。

### 2. フォローアップ（過去実験の判定を先に）
- `node scripts/agent/ledger.mjs due` で計測予定日を過ぎた pending 実験を取得。
- 判定は**単純な前後比較をしない**。季節性が強いので次を併用：
  - 同タイプ・同順位帯の**未変更ページ群を対照群**として同期間の変化を差し引く（diff-in-diff の発想）。
  - 可能なら前年同月（YoY）/4週移動平均で正規化。
  - **エンゲージメントガード**: clicks/CTR が上がっても engagementRate や滞在が悪化していたら win にしない（クリックベイト化の検出）。
  - `minImpressionsForVerdict`（既定300）未満の母数では判定保留（flat扱いで据置）。
- 判定: **win**(対照群比で明確改善) / **flat** / **loss**(悪化)。
  - **loss** は `git revert <マージコミット>` で revert ブランチ→PR化し、**revert PRも必ず手順6の guardrail-check を通す**（revertが超安全とは限らない）。safe & 予算内なら自動merge、そうでなければ needs-human。
- `node scripts/agent/ledger.mjs update <id> --json '{"verdict":"win","after":{...}}'`。
- win/loss が2件累積したパターンを `playbook-learnings.md` に昇格/除外リスト反映。

### 3. レーン選定と候補（2レーン交互・1サイクル=1ページ）
- `priorities.json` の `laneCycleCount`（無ければ0）で**2レーンを交互**に回す:
  - **偶数 → coverageレーン（不可視ページ救出）**: `coverage-gap.json` の `invisibleWorklist`（record-backed・除外済み除外済み）上位から1件。狙い=**検索表示0の実在ページをインデックス/ランク入りさせる**（伸びしろ大）。
  - **奇数 → strikingレーン（既存需要の刈り取り）**: `striking-distance.json` の items（ROI降順）上位から1件。
- 共通フィルタ: `playbook-learnings.md` の「効かない施策」・`excludeUrls`・進行中PR（`gh pr list`）を除外し、**未着手で最上位の1件**を選ぶ。
- 選んだレーンのワークリストが空なら、もう一方のレーンにフォールバック。

### 4. フェーズゲート
- `config.phase` に従う。**guardrail-check.mjs もコードで phase を強制する**（phase1は差分があれば needs-human）。
- phase1=測定のみ（改善実装しない・ここで終了）/ phase2=title/description/見出し/内部リンク改善 / phase3=本文加筆も可（新規routeは承認要）。

### 5. 実装
- `git checkout -b feature/auto-<lane>-<YYYYMMDD-連番>`（run-cycleが事前にbaseをorigin/masterへ同期済み）
- `sourcePaths` を grep で特定し**テキストのみ**改善。**検証済みデータ（catchableFishの魚種/釣法/月・施設フラグ has*・region・isFree・difficulty）だけ**を使い、データに無い事実は書かない（捏造禁止）。
  - **strikingレーン**: title/descriptionのCTR改善（狙うクエリを前方配置・行動喚起）。
  - **coverageレーン**: descriptionを網羅性で具体化し薄さを解消→インデックス獲得（魚種・釣法・季節・施設を自然に盛り込む。200〜320字目安）。余裕があれば集客できている関連ページ側から、この不可視ページへ内部リンクを1本足す（孤立解消）。
- 既存の構造化データを壊さない。クリックベイト禁止。`.claude/agents/seo-optimizer.md` 準拠。

### 6. ガードレール検証
- `npx tsc --noEmit` / `npx eslint src/` / `npx vitest run` を実行（FAILは無条件で needs-human）。
- 日本語のコミット（Co-Authored-By禁止）。
- `node scripts/agent/guardrail-check.mjs --json` で判定取得。**この exit code が唯一の真実**。

### 7. 分岐（autonomy.mode × guardrail × デプロイ予算）
- **safe(exit0) かつ 全検証PASS かつ `autonomy.mode=="auto-merge-pr"` かつ `node scripts/agent/deploy-budget.mjs check` が exit0**:
  - `git push origin feature/...` → `gh pr create`（記録用・PRテンプレ記入）→ **`gh pr merge --squash --delete-branch`（即時マージ＝本番反映）** → `node scripts/agent/deploy-budget.mjs increment`。
  - ※ 対象は**超安全クラス（テキストのみ・guardrail safe・ローカルCI全PASS）だけ**。これが「単純なページ改善は人間承認不要」の実体。`--admin` は使わない（deny済）。
- **それ以外（needs-human / FAIL / pr-only / 予算超過）**:
  - `git push` → `gh pr create` → `gh pr edit --add-label needs-human`。**マージしない**（人間レビュー）。

### 8. 台帳記録 & 通知
- `node scripts/agent/ledger.mjs add --json '{"phase":<n>,"targetPath":"...","hypothesis":"...","changeType":"...","prNumber":<n>,"before":{"position":..,"clicks":..,"ctr":..,"impressions":..,"affiliateClicks":..}}'`（measureOnは config.measurement.measureInDays から自動算出）
- `node scripts/agent/notify-discord.mjs "🤖 自己改善: <対象> / <仮説> / PR #<n> / <自動merge or 承認待ち>"`

### 9. 優先度更新（学習）
- `memory/agent/priorities.json`：
  - **`laneCycleCount` を +1**（次サイクルでレーンが切り替わる）。
  - 今回消化したURLを `excludeUrls` に **TTL付き**で追加（`{"path":"...","until":"<verdict別のクールダウン: win=30/flat=60/loss=120日後>"}`）。恒久除外にしない（優良ページの永久放置を防ぐ）。
  - 直近の win/loss 傾向で該当ページタイプの weight を `learningRate`(0.1)以内で微調整し `weightClamp`[0.5,2.0]にclip。`updatedAt` 更新。

### 10. 終了
- 1改善で終了。次の起動でまた1件。例外時は Discord通知してクリーンに終了（masterは触っていない）。

## 注意
- 本スキルは `.claude/`（gitignore対象）にあり、この24時間稼働PCローカルで動く。本スキル/configの改変は run-cycle のハッシュ検知で停止するので、変更後は人間が `node scripts/agent/run-cycle.mjs --accept-policy` で承認する。
- ネットワーク負荷軽減のためサブエージェント並列は最大3。
