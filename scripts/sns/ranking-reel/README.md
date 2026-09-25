# SNSランキング投稿（Instagramリール / Threads）

毎日 JST 20:00 に「◯月に△△が釣れる□□県の釣り場TOP10」を1本、自動で生成・投稿する。
マスコットは「ウキまる」（紅白の玉ウキ。`mascot.js` の SVG）。

## 流れ

1. `select-topic.ts` がお題を選ぶ。条件は旬・魚種人気・県の需要・掲載数。直近の投稿と重複しないようにする。
   - スポットの抽出はサイトの `/prefecture/[県]/[月]/[魚]` と同じ基準（釣れる度ゲート＋月範囲）
   - 釣り禁止情報（`fishingBan`）のあるスポットは一部禁止でも載せない
   - 写真はクレジットのあるものだけ使う。無いスポットは種別イラスト（`scenes.js`）で表示する
2. `render.mjs` が 1080×1920 の画像とキャプション（Instagram / Threads）を作る
3. `make-video.sh` が12秒のリール動画を作る（ffmpeg）
4. `run.mjs` が以下を順に行う
   - `tsurispot-uploads` の `sns/ranking/` に一時アップロードする
   - Instagramリールと Threads 画像を投稿する
   - S3 の一時ファイルを削除する
   - Redis の台帳に記録し、Discord に通知する

## 手動実行

```bash
# 投稿せず Discord に画像プレビューだけ送る
node scripts/sns/ranking-reel/run.mjs --dry-run
# お題を固定
node scripts/sns/ranking-reel/run.mjs --dry-run --pref hyogo --fish tachiuo
```

GitHub Actions では「SNS ランキング投稿」を手動で実行する（`dry_run` の初期値は true）。

## 必要な GitHub Secrets

| 名前 | 内容 |
|---|---|
| `INSTAGRAM_USER_ID` | Instagram ビジネスアカウントID |
| `INSTAGRAM_ACCESS_TOKEN` | 長期トークン（初期値。以後は週1で自動延長し Redis に保存） |
| `META_APP_ID` / `META_APP_SECRET` | Facebook Login 経由トークンの延長用 |
| `THREADS_USER_ID` / `THREADS_ACCESS_TOKEN` | Threads 用（未設定なら Threads はスキップ） |

既存の AWS・Upstash・Discord の Secrets も使う。

### Threads トークンの取り方

1. Meta 開発者アプリにユースケース「Threads API にアクセス」を追加する。権限は `threads_basic` と `threads_content_publish`。
2. 「役割」で自分の Threads アカウントをテスターに追加し、Threads アプリ側で招待を承認する。
3. Graph API エクスプローラーで Threads を選んで短期トークンを取り、長期トークンに交換する。

```
https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret={APP_SECRET}&access_token={短期トークン}
```

4. ユーザーIDは次で確認する。

```
https://graph.threads.net/v1.0/me?fields=id,username&access_token={長期トークン}
```

## トークン延長

`sns-token-refresh.yml` が毎週月曜に延長し、Redis の `sns:token:instagram` と `sns:token:threads` に保存する。
失敗すると Discord に通知が来る。放置すると60日で投稿が止まる。
