# ツリスポ (TsuriSpot)

日本全国の釣り場情報を網羅した釣りスポット検索サービス。
2,781箇所の釣り場、115魚種、5,000ページ以上のコンテンツを静的サイト生成（SSG/ISR）で配信しています。

**https://tsurispot.com**

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 (OKLch色空間) |
| UIコンポーネント | shadcn/ui |
| CMS | microCMS (ブログ記事) |
| ホスティング | AWS App Runner (コンテナ) |
| CDN | Amazon CloudFront |
| CI/CD | GitHub Actions → ECR → App Runner 自動デプロイ |
| 画像配信 | S3 + CloudFront + Lambda (自動WebP変換) |
| DNS/SSL | Route 53 + ACM |
| 地図 | Leaflet |

## AWSアーキテクチャ

```
ユーザー
  → Route 53 (DNS)
    → CloudFront (CDN / SSL終端)
      → App Runner (Next.js コンテナ)

画像リクエスト
  → CloudFront → S3 (OAC認証)

画像アップロード
  → S3 → Lambda (自動WebP変換) → S3

開発者
  → git push master
    → GitHub Actions
      → Docker Build → ECR push
        → App Runner 自動デプロイ
```

## 主な機能

- **釣り場検索**: 2,781箇所のスポット情報（施設・ルール・混雑予測・安全情報）
- **魚種図鑑**: 115種の詳細情報（釣り方・時期・危険情報）
- **GPS近い順ソート**: 現在地から近い釣り場を自動ソート
- **月別釣りガイド**: 月ごとのおすすめ魚種・釣り方
- **全文検索**: Ctrl+K でインクリメンタル検索
- **構造化データ**: JSON-LD (LocalBusiness, Event, Article, FAQPage, HowTo 等)
- **OGP画像**: スポット別・魚種別の動的OGP生成
- **アフィリエイト**: 釣り方・季節に応じた装備レコメンド
- **ブログ**: 静的記事 + microCMS (ISR) のハイブリッド配信
- **IndexNow**: デプロイ時にBing/Yandexへ全URL自動通知

## データ構成

```
src/lib/data/
├── spots.ts            # 2,781スポット統合 (80+ファイル)
├── spots-*.ts          # 地域別スポットデータ
├── fish.ts             # 魚種データ統合
├── fish-sea.ts         # 海水魚
├── fish-freshwater.ts  # 淡水魚
├── fish-brackish.ts    # 汽水魚
├── blog.ts             # ブログ記事統合
├── regions.ts          # 全国市区町村データ
├── prefectures.ts      # 47都道府県
├── monthly-guides.ts   # 月別ガイド
└── affiliate-products.ts
```

全データはTypeScriptファイルにハードコードされ、ビルド時に静的生成されます。
外部DB不要で高速配信を実現しています。

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# 型チェック
npx tsc --noEmit

# Lint
npx eslint
```

## デプロイ

`master` ブランチにpushすると GitHub Actions が自動デプロイを実行します。

```bash
git push origin master
```

処理フロー:
1. GitHub Actions がトリガー
2. Docker マルチステージビルド (node:22-alpine)
3. ECR にイメージpush
4. App Runner が自動で新バージョンをデプロイ
5. IndexNow で検索エンジンに通知

## ページ生成戦略

| ページ種別 | 戦略 | 件数 |
|-----------|------|------|
| スポット詳細 | 上位500件 SSG + 残り ISR | 2,781 |
| 魚種詳細 | 全件 SSG | 115 |
| 都道府県 | 全件 SSG | 47 |
| ブログ | 静的記事 SSG + microCMS ISR | 60+ |
| 月別ガイド | ISR (revalidate=3600) | 12 |

## コスト

| サービス | 月額 |
|---------|------|
| App Runner | $5〜10 |
| S3 + CloudFront | $1〜3 |
| Lambda | 無料枠内 |
| Route 53 | $0.50 |
| **合計** | **$6.5〜13.5** |

## ライセンス

All rights reserved.
