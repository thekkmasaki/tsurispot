# TsuriSpot システム構成図

**最終更新: 2026-03-24**

---

## 全体アーキテクチャ

```mermaid
graph TB
    subgraph Users[ユーザー]
        Browser[ブラウザ]
        LINE_App[LINE]
    end

    subgraph DNS_CDN[DNS / CDN]
        Route53[Route 53\ntsurispot.com]
        CloudFront[CloudFront CDN]
        ACM[ACM 証明書]
    end

    subgraph Compute[コンピュート]
        AppRunner[App Runner\nNode.js 20]
        Lambda[Lambda\nimage-converter]
    end

    subgraph Storage[ストレージ]
        ECR[ECR\nDocker イメージ]
        S3[S3\n画像ストレージ]
    end

    subgraph External[外部サービス]
        Redis[Upstash Redis]
        microCMS[microCMS\nブログ CMS]
        S3Upload[S3\n釣果・店舗写真]
    end

    subgraph Analytics[分析 / 収益]
        GA4[Google Analytics 4]
        AdSense[Google AdSense]
        Amazon[Amazon Associates]
        Rakuten[楽天アフィリエイト]
    end

    Browser -->|HTTPS| Route53
    Route53 -->|ALIAS| CloudFront
    ACM -.->|SSL| CloudFront
    CloudFront -->|オリジン| AppRunner
    AppRunner -->|pull| ECR
    AppRunner -->|API| Redis
    AppRunner -->|API| microCMS
    AppRunner -->|API| S3Upload
    S3 -->|トリガー| Lambda
    Lambda -->|WebP保存| S3
    CloudFront -->|配信| S3
    LINE_App -->|Webhook| AppRunner
    Browser -.->|トラッキング| GA4
    Browser -.->|広告| AdSense
```

---

## CI/CD パイプライン

```mermaid
graph LR
    subgraph Dev[開発]
        Push[git push origin master]
    end

    subgraph GHA[GitHub Actions]
        TypeCheck[TypeScript 型チェック]
        Lint[ESLint]
        Test[Vitest]
        Docker[Docker ビルド\n3ステージ]
        TypeCheck --> Docker
        Lint --> Docker
        Test --> Docker
    end

    subgraph AWS[AWS]
        ECR2[ECR イメージ push]
        AR[App Runner デプロイ]
    end

    subgraph Notify[通知]
        Discord[Discord Webhook]
    end

    Push --> GHA
    Docker --> ECR2
    ECR2 --> AR
    AR --> Discord
```

---

## 定期実行ワークフロー（GitHub Actions Cron）

```mermaid
graph LR
    subgraph Cron[スケジュール]
        Daily[毎日 07:00 JST]
        TueThu[火木 18:00 JST]
        Monday[月曜 12:00 JST]
    end

    subgraph Scripts[スクリプト]
        Quiz[post-quiz 釣りクイズ]
        Tips[post-fish-tips 魚の豆知識]
        Weekly[post-weekly-digest 週報]
    end

    X[X API v2]

    Daily --> Quiz --> X
    TueThu --> Tips --> X
    Monday --> Weekly --> X
```

---

## Docker 3ステージビルド

```mermaid
graph LR
    subgraph Stage1[Stage 1 - deps]
        D1[node 22-alpine\nnpm install]
    end

    subgraph Stage2[Stage 2 - builder]
        D2[next build\nSSG生成 8GB]
    end

    subgraph Stage3[Stage 3 - runner]
        D3[Alpine 非root\nport 3000]
    end

    D1 --> D2 --> D3
```

---

## データフロー

```mermaid
graph TB
    subgraph Content[コンテンツ配信]
        TS[TypeScript データ\nspots.ts]
        SSG[SSG ビルド\n5000+ページ]
        HTML[静的 HTML]
        TS --> SSG --> HTML
    end

    subgraph Blog[ブログ]
        CMS[microCMS API]
        ISR[ISR revalidate 3600s]
        CMS --> ISR
    end

    subgraph Catch[釣果報告]
        Report[ユーザー投稿]
        CatchAPI[catch-report API]
        RedisC[Upstash Redis]
        Report --> CatchAPI --> RedisC
    end

    subgraph Image[画像処理]
        Upload[アップロード]
        S3I[S3]
        LambdaI[Lambda WebP変換]
        Upload --> S3I --> LambdaI --> S3I
    end

    subgraph SEO[検索エンジン通知]
        IndexNow[IndexNow API]
        Bing[Bing / Yandex]
        IndexNow --> Bing
    end

    CF[CloudFront CDN]
    User[ユーザー]

    HTML --> CF
    ISR --> CF
    S3I --> CF
    CF --> User
    RedisC -.->|リアルタイム表示| User
```

---

## API エンドポイント

```mermaid
graph LR
    subgraph Core[コア機能]
        Search[search\nサイト内検索]
        Ranking[ranking\nランキング]
        Seasonal[fish/seasonal\n季節別]
        OG[og\nOGP画像生成]
    end

    subgraph UGC[ユーザー生成]
        CatchR[catch-report\n釣果報告]
        CatchP[catch-photo\n写真]
        CatchUGC[catch-report-ugc\nUGC]
        Presence[presence\nオンライン]
    end

    subgraph Shop[釣具店]
        Shops[shops\n店舗情報]
        Listing[shop-listing\nリスティング]
        Photos[shop-photos\n写真]
        Bait[bait-stock\n餌在庫]
    end

    subgraph Integration[連携]
        IndexN[indexnow\nSEO通知]
        LineWH[line-webhook\nLINE Bot]
    end
```

---

## セキュリティ

```mermaid
graph TB
    subgraph Headers[セキュリティヘッダー]
        CSP[CSP]
        HSTS[HSTS\nmax-age 63072000]
        XFO[X-Frame-Options\nDENY]
        XCTO[X-Content-Type-Options\nnosniff]
        RP[Referrer-Policy\nstrict-origin]
    end

    subgraph Container[コンテナ]
        NonRoot[非root実行\nnextjs:1001]
        NoPowered[poweredByHeader 無効化]
    end

    subgraph SSL_TLS[暗号化]
        ACMSSL[ACM証明書\nHTTPS強制]
    end
```

---

## キャッシュ戦略

```mermaid
graph LR
    subgraph LongCache[長期キャッシュ 1年]
        Static[_next/static\nimmutable]
        Images[images\nimmutable]
        Fonts[woff2 / ico\nimmutable]
    end

    subgraph MediumCache[中期キャッシュ]
        ISR2[microCMS ISR 1時間]
        CatchTTL[釣果 Redis 24時間]
    end

    subgraph ShortCache[短期キャッシュ]
        PresenceTTL[プレゼンス 120秒]
    end

    CF2[CloudFront] --> LongCache
    CF2 --> MediumCache
    Redis2[Upstash Redis] --> CatchTTL
    Redis2 --> PresenceTTL
```

---

## テックスタック

```mermaid
graph TB
    subgraph Frontend[フロントエンド]
        NextJS[Next.js 16\nApp Router]
        TSLang[TypeScript\nstrict mode]
        TW[Tailwind CSS v4]
        Shadcn[shadcn/ui]
        LeafletMap[Leaflet 地図表示]
    end

    subgraph Backend[バックエンド]
        NodeJS[Node.js 20]
        AppR[App Runner]
        UpRedis[Upstash Redis]
        mCMS[microCMS]
    end

    subgraph Infra[インフラ]
        AWSStack[AWS\nApp Runner / CloudFront\nRoute53 / S3 / Lambda]
        GH[GitHub Actions\nCI/CD]
        DockerI[Docker\n3ステージビルド]
    end

    subgraph TestSuite[テスト]
        Vitest[Vitest]
        PW[Playwright]
        ESL[ESLint]
    end

    NextJS --> NodeJS
    NodeJS --> AppR
    GH --> DockerI --> AppR
```

---

## 環境変数一覧

```mermaid
graph TB
    subgraph AppVars[アプリケーション]
        GA[NEXT_PUBLIC_GA_ID]
        LineURL[NEXT_PUBLIC_LINE_ADD_FRIEND_URL]
        AdsID[NEXT_PUBLIC_ADSENSE_ID]
        CMS1[MICROCMS_SERVICE_DOMAIN]
        CMS2[MICROCMS_API_KEY]
        Redis3[UPSTASH_REDIS]
        Line2[LINE_CHANNEL]
        GAS[GAS_CATCH_REPORT_URL]
        S3Bucket[AWS_S3_BUCKET]
    end

    subgraph SNS[SNS / 通知]
        XKey[X_API_KEY / SECRET]
        XToken[X_ACCESS_TOKEN / SECRET]
        DiscordWH[DISCORD_WEBHOOK_URL]
    end

    subgraph AWSEnv[AWS GitHub Secrets]
        AK[AWS_ACCESS_KEY_ID]
        SK[AWS_SECRET_ACCESS_KEY]
        Region[AWS_REGION\nap-northeast-1]
    end
```

---

## コスト構造

```mermaid
pie title 月額コスト構成
    "App Runner" : 35
    "Route 53" : 5
    "ECR" : 5
    "S3 + Lambda" : 5
    "CloudFront 無料枠" : 0.1
    "Redis 無料枠" : 0.1
    "microCMS 無料枠" : 0.1
```

| サービス | 料金 |
|----------|------|
| App Runner | 従量課金（vCPU + メモリ時間） |
| CloudFront | 無料枠 1TB/月 + 1000万リクエスト |
| Route 53 | $0.50/ホストゾーン/月 |
| ACM | 無料 |
| Lambda | 無料枠 100万リクエスト/月 |
| S3 | 従量課金（ストレージ + リクエスト） |
| ECR | 500MB無料、以降 $0.10/GB/月 |
| Upstash Redis | 無料枠（日次8,000コマンド） |
| microCMS | 無料プラン |
