# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 事業目標

**このサイトの売却目標は1億円。** すべての施策はこの目標から逆算して行う。月間収益300〜400万円（24-36x multiple）、月間50万PV以上が必要。収益源はアフィリエイト・広告・B2B（釣具店掲載料）・スポンサード。

## 言語

全てのコミュニケーション・コミットメッセージは日本語で行う。

## コマンド

```bash
# ビルド（OneDrive上のためEPERMエラー回避で.next削除が必要）
rm -rf .next && npx next build

# 開発サーバー（ポート3000が占有されやすいので注意）
npx next dev

# テスト
npx vitest run                    # 全テスト実行
npx vitest run src/lib/data/__tests__/spots.test.ts  # 単一テスト

# Lint
npx eslint

# デプロイ（Vercel Pro）+ IndexNow自動通知
npm run deploy

# TypeScript型チェック
npx tsc --noEmit
```

## Git ルール

- ブランチ: `master`
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

- OneDrive上のプロジェクト → `.next` の EPERM エラーが頻発。ビルド前に `rm -rf .next`
- 日本語パスを含むためbash操作時は引用符で囲む
- アフィリエイトリンク一覧: `C:\Users\kk471\OneDrive\デスクトップ\saas\アフィリエイト\リンク一覧.txt`
- スポット紹介文の他サイトからの丸パクリは絶対NG
- デプロイ前に `npx tsc --noEmit` で型チェック必須
