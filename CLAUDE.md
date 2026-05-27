# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 事業目標

**このサイトの売却目標は1億円。** すべての施策はこの目標から逆算して行う。月間収益300〜400万円（24-36x multiple）、月間50万PV以上が必要。収益源はアフィリエイト・広告・B2B（釣具店掲載料）・スポンサード。

## 言語

全てのコミュニケーション・コミットメッセージは日本語で行う。

## コマンド

```bash
# ビルド
npx next build

# 開発サーバー（ポート3000が占有されやすいので注意）
npx next dev

# テスト
npx vitest run                    # 全テスト実行
npx vitest run src/lib/data/__tests__/spots.test.ts  # 単一テスト

# Lint
npx eslint

# デプロイ（AWS App Runner）+ IndexNow自動通知
npm run deploy

# TypeScript型チェック
npx tsc --noEmit
```

## Git ルール

### master 直 push 禁止 (受け入れ検証ゲート)

**`master` ブランチは保護されている。Claude が master に直接 push することは禁止。**
過去の連続障害（Cognito 設定全消し、ログイン壊れ、画像表示崩壊等）を踏まえ、
ユーザの merge ボタン押下が唯一の本番反映トリガー。

### Claude 標準ワークフロー（毎タスク必須）

1. `feature/<task-name>` ブランチを切る
2. 変更を commit + push（feature ブランチ）
3. **手元検証**：
   - `npx tsc --noEmit` PASS
   - `npx eslint src/` PASS（警告は許容、エラーはブロック）
   - `npm run test:smoke` PASS（Playwright smoke test）
4. `gh pr create` で PR 作成
5. PR description は `.github/PULL_REQUEST_TEMPLATE.md` の項目を全て埋める
6. ユーザに「PR #X 作成しました、確認お願いします」と通知
7. ユーザが GitHub UI で merge → master 反映 → 本番 deploy
8. deploy 完了後、Claude が本番 curl 再検証 → 結果通知

### 緊急 hotfix の例外

本番障害（ログイン完全停止、500 連発、課金暴走等）に限り fast-track 可。
1. ユーザに「緊急障害です、hotfix で対応します」と事前通知
2. `hotfix/<issue>` ブランチで PR 作成
3. 直後にユーザに最終結果報告

通常の機能追加・最適化は使用禁止。判断基準は「現在サイトが完全に使えない」レベル。

### その他

- email: `dev@tsurispot.jp`
- **Co-Authored-By は絶対に付けない**
- **5ファイル修正ごと、または大きな修正1件ごとに WIP コミットする**（レート切れ対策）
- WIPコミット: `git commit -m "WIP: [内容]"`、最終コミットで `WIP:` を外す
- push は最後にまとめて行う

## アーキテクチャ

**Next.js 16 App Router / TypeScript / Tailwind CSS (v4, OKLch色空間) / shadcn/ui**

パスエイリアス: `@/*` → `./src/*`

### データ層 (`src/lib/data/`)

全データはTypeScriptファイルにハードコードされ、SSG/ISRでビルド時に静的生成される。

| データ | エントリポイント | 規模 |
|--------|-----------------|------|
| スポット | `spots.ts` → 80+ファイルを統合して `fishingSpots[]` | 2,141+件 |
| 魚種 | `fish.ts` → `fish-sea.ts` + `fish-freshwater.ts` + `fish-brackish.ts` | 100+種 |
| ブログ | `blog.ts` → `blog-articles-*.ts`（5分割）+ microCMS | ハイブリッド |
| 地域 | `regions.ts`（67K行）| 全国市区町村 |
| 都道府県 | `prefectures.ts` + `prefecture-info.ts` | 47件 |
| 月別ガイド | `monthly-guides.ts` | 12ヶ月 |
| アフィリエイト | `affiliate-products.ts` | 25商品 |

**データフロー**: TSファイル定義 → `src/lib/data/*.ts` で統合 → ページコンポーネントでimport → SSG/ISR

### ページ生成戦略

- **スポット詳細** (`/spots/[slug]`): 上位500件 SSG + 残り ISR（`maxDuration=60`）
- **ブログ** (`/blog/[slug]`): 静的記事 SSG + microCMS記事 ISR（`revalidate=3600`）
- **魚種・都道府県・ガイド**: 全件 SSG
- **月別ガイド**: ISR（`revalidate=3600`）

### microCMS（ブログCMS）

- クライアント: `src/lib/microcms.ts`（dynamic import必須、top-level importするとクライアントバンドルにリーク）
- 環境変数: `MICROCMS_SERVICE_DOMAIN`, `MICROCMS_API_KEY`
- `getAllBlogPosts()` は React `cache()` でリクエスト単位メモ化済み
- エンドポイント: `blogs`（複数形）、`categories`

### 主要な型 (`src/types/index.ts`)

- `FishingSpot` — 51フィールド（施設・釣り情報・安全・ルール・混雑予測等）
- `FishSpecies` — 24フィールド（分類・危険情報・釣り方等）
- `SpotRules` — 投げ釣り/ルアー/コマセ可否、遊漁券、竿本数制限
- `CatchableFish` — スポットで釣れる魚のマッピング（月・メソッド・難易度）

### コンポーネント構成 (`src/components/`)

- `ui/` — shadcn/ui ベース（button, card, badge, breadcrumb等）
- `spots/` — スポット詳細の大量コンポーネント（ルール、チェックリスト、混雑予測、アフィリエイト等）
- `fish/` — 魚種図鑑（フィルター、GPS近い順ソート）
- `layout/` — ヘッダー、フッター、モバイルナビ、検索オーバーレイ（Ctrl+K）
- `affiliate/` — 商品カード、季節レコメンド
- `map/` — Leaflet地図

### API (`src/app/api/`)

- `/api/indexnow` — 全URL（5,000件超）をBing/Yandexにバッチ通知
- `/api/catch-report` — 釣果報告（Upstash Redis）
- `/api/presence` — オンラインユーザー検出（Redis、120秒TTL）

### スポットデータファイル規則

- ファイル名: `spots-{地域名}.ts`（例: `spots-hokkaido-tohoku-detail.ts`）
- 80+ファイルを `spots.ts` が統合して `fishingSpots[]` をexport
- 1ファイルあたり最大5MB — 部分読み込み（offset/limit）を推奨

### 画像パス規則

- 魚種写真: `/images/fish/{slug}.jpg`
- スポット写真: `/images/spots/wikimedia/{slug}.jpg` または外部URL
- OGP画像: `/api/og?title=...&emoji=...`（runtime: `nodejs`、`edge`はデータ1MB制限超過）

### Client / Server コンポーネント

- `onClick` 等のイベントハンドラは **Client Component（`"use client"`）のみ** で使用可
- Server Component内でインタラクティブな要素が必要な場合は、別ファイルのClient Componentに分離する
- `img`タグの `onError` もServer Componentでは使えない

## 注意事項

- `.next` キャッシュの問題が出たら `rm -rf .next` してからビルド
- 日本語パスを含むためbash操作時は引用符で囲む
- アフィリエイトリンク一覧: `C:\Users\kk471\OneDrive\デスクトップ\saas\アフィリエイト\リンク一覧.txt`
- スポット紹介文の他サイトからの丸パクリは絶対NG
- デプロイ前に `npx tsc --noEmit` で型チェック必須

## 禁止事項

以下は**いかなる状況でも実行してはならない**:

| 禁止事項 | 理由 |
|---------|------|
| `next build` / `next dev` のローカル実行 | OneDriveパスでEPERMエラー、メモリ5GB超消費 |
| `npm install` / `npm add` | 依存関係変更は手動承認が必要 |
| `npx vercel` | デプロイはGitHub Actions経由のみ |
| スポット紹介文の他サイト丸パクリ | 著作権違反・SEOペナルティ |
| AI生成の魚写真の使用 | 実写またはSVGイラストのみ許可 |
| 「兵庫県在住」の記述 | 虚偽情報 |
| `rm -rf node_modules` | 復旧に時間がかかる |
| Co-Authored-By の付与 | プロジェクトルールで禁止 |

## トラブルシューティング

### ポート3000が占有される
```bash
netstat -ano | grep :3000
# PIDを確認して kill
taskkill /PID <PID> /F
```

### EPERMエラー（.nextディレクトリ）
OneDrive上のプロジェクトで頻発。対処:
1. `.next` を削除: `rm -rf .next`
2. OneDriveの同期を一時停止してからビルド
3. **そもそもローカルビルドはしない** → `npx tsc --noEmit` で型チェックのみ

### 型エラーの確認
```bash
npx tsc --noEmit
```
エラーが出た場合は該当ファイルを修正してから push。

### テスト失敗
```bash
npx vitest run                    # 全テスト
npx vitest run <ファイルパス>       # 特定テスト
```
失敗したテストの原因を特定し、データまたはテストを修正。

### slug重複エラー
スポットや魚種のslugが重複するとビルドエラーになる。
```bash
# slugの重複チェック（テストで検出可能）
npx vitest run src/lib/data/__tests__/spots.test.ts
```

### GitHub Actions 失敗
1. GitHub リポジトリの Actions タブでログを確認
2. 多くの場合、型エラーかテスト失敗が原因
3. ローカルで `npx tsc --noEmit` と `npx vitest run` を実行して再現

### microCMS エラー
- API キーが `.env.local` に正しく設定されているか確認
- `MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` の2つが必要
- dynamic import を使っているか確認（top-level import はNG）

## よくあるタスクのレシピ

### スポット追加手順

1. 対象地域の既存ファイルを確認: `src/lib/data/spots-{地域名}.ts`
2. slug重複チェック: 既存slugを検索
3. 座標をGoogle Mapsで確認
4. FishingSpot型に準拠してデータ追加（紹介文はオリジナルで）
5. `spots.ts` に新ファイルの場合はimport追加
6. 型チェック: `npx tsc --noEmit`
7. WIPコミット（5ファイルごと）

### ブログ記事追加（静的）

1. `src/lib/data/blog-articles-*.ts` の適切なファイルに追加
2. BlogArticle型に準拠
3. slug重複チェック
4. 内部リンク（関連スポット・魚種）を含める
5. アフィリエイトリンクを文脈に合わせて自然に配置
6. 型チェック → コミット

### ブログ記事追加（microCMS）

```bash
curl -X POST "https://tsurispot.microcms.io/api/v1/blogs" \
  -H "X-MICROCMS-API-KEY: ${MICROCMS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"title":"タイトル","slug":"slug","content":"<p>本文</p>"}'
```

### 魚種データ追加

1. 対象: `src/lib/data/fish-sea.ts` / `fish-freshwater.ts` / `fish-brackish.ts`
2. FishSpecies型に準拠（学名、分類、生息域、旬、釣り方）
3. `fish.ts` の統合配列に含まれるか確認
4. 型チェック → コミット

### デプロイ前チェックリスト

```bash
# 1. 型チェック（必須）
npx tsc --noEmit

# 2. Lint
npx eslint src/

# 3. テスト
npx vitest run

# 4. 変更内容の確認
git diff --stat

# 5. コミット & プッシュ
git add <ファイル>
git commit -m "変更内容"
git push origin master
# → GitHub Actions が自動でビルド・デプロイ
```

## カスタムエージェント

`.claude/agents/` に以下の専門エージェントが利用可能:

| エージェント | ファイル | 用途 |
|------------|---------|------|
| スポット追加 | `spot-adder.md` | スポットデータの追加・修正 |
| コンテンツライター | `content-writer.md` | ブログ記事・魚種解説の作成 |
| データ検証 | `data-validator.md` | テスト実行・整合性チェック（Read-only志向） |
| SEO最適化 | `seo-optimizer.md` | メタデータ・構造化データ・内部リンク改善 |

### 推奨並列作業パターン

- **スポット大量追加**: `/spot-generator` skill を使う（後述）
- **コンテンツ拡充**: content-writer ×1 + seo-optimizer ×1 + data-validator ×1
- **品質改善**: data-validator ×1 + seo-optimizer ×2
- **注意**: 並列エージェントは最大3まで（ネットワーク負荷軽減）

## カスタム skill

| skill | パス | 用途 |
|-------|------|------|
| spot-generator | `.claude/skills/spot-generator/SKILL.md` | スポットを LLM/外部API/CSV から大量生成。checkpoint resume、容量チェック、PR自動作成つき |
| weekly-report | `.claude/skills/weekly-report/SKILL.md` | 主要10エリアの釣果週報を生成して microCMS に投稿（ユーザー管理） |

### /spot-generator 運用ルール

- 並列上限 **3**、 1バッチ50件、5ファイル / バッチ完了ごとに WIP コミット
- 紹介文は **オリジナル200-400字**（80字未満は format-spot.mjs が自動拒否）
- 容量上限: 総スポット **8,500件 / TS合計 18MB**（どちらか超えたら停止）
- 必ず `feature/spot-gen-<region>-<date>` ブランチで PR 経由（master 直 push 禁止）
- checkpoint は `.claude/state/spot-generation-progress.json` （マシン固有、gitignored）
- レート切れ中断後は `/spot-generator --resume` で再開
- 詳細手順: `.claude/skills/spot-generator/SKILL.md`
