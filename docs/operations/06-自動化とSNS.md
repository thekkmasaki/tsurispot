# 06. 自動化とSNS

> 勝手に動いている自動化と、SNS投稿の章。何がいつ動いているか、止まったらどう気づくか。

最終更新: 2026-11-23

---

## 自動で動いているもの一覧
すべて GitHub Actions で動作。状況は GitHub リポジトリの「Actions」タブで見られます。

| 名前 | 何をする | いつ | 通知 |
|---|---|---|---|
| Deploy to App Runner | サイトを本番反映 | masterにマージ時 | — |
| X 自動投稿 | Xに毎日投稿 | 毎日（下表） | Discord |
| Push 週次配信 | Push/LINEで週報配信 | 月曜 12:00 | — |
| IndexNow 週次 | 全URLを検索エンジンに通知 | 月曜 15:00 | — |
| SNS ランキング投稿 | 「◯月に△△が釣れる□□県の釣り場TOP10」動画を Instagramリール / Threads / X に投稿 | 毎日 朝7:30ごろ・夜20:00ごろ | Discord |
| 釣果週報カルーセル | 週報の釣果まとめを Instagramカルーセル＋X に投稿 | 週報公開時（保険で毎日19:00ごろ判定） | Discord |
| 単発カルーセル | 作成済みの画像＋キャプションを Instagram に投稿 | 手動のみ | Discord |
| SNS トークン延長 | Instagram / Threads のトークンを延長 | 毎週 月曜 9:00 | 失敗時 Discord |

---

## X（旧Twitter）自動投稿
アカウント：@tsurispot_jp。曜日ごとに内容が変わります：

| 曜日・時刻(JST) | 内容 | スクリプト |
|---|---|---|
| 毎日 7:00 | 釣りクイズ（答えは返信） | post-quiz.mjs |
| 月 12:00 | 週報ダイジェスト | post-weekly-digest.mjs |
| 火・木 18:00 | 魚の豆知識 | post-fish-tips.mjs |
| 水 12:00 | 釣果速報 | post-catch-report.mjs |
| 金 12:00 | 週末おすすめスポット | post-weekend-spot.mjs |
| 土 12:00 | 旬魚ガイド | post-seasonal-fish.mjs |
| 日 18:00 | 今週のベスト釣果 | post-best-catch.mjs |

- 成否はDiscordに通知（成功も失敗も）。Discordを見れば投稿できているか一目でわかる
- 使うキー：X_API_KEY など4つ（GitHub Secretsに登録済み）

### Xの現状（正直な評価）
フォロワー約25人、1投稿の表示は約22回で、まだほとんど届いていません。自動投稿は動いていますが、フォロワーが少ないアカウントは伸びにくいのが現実。伸ばすなら「リール動画」＋「プロフィール整備」が効果的。

---

## Instagram / Threads（自動投稿 稼働中）
アカウント：Instagram @tsurispotjapan

| 何を | いつ(JST) | ワークフロー | 生成スクリプト |
|---|---|---|---|
| ランキングリール（県×月×魚種TOP10。Threads・X にも同じ動画） | 毎日 7:30ごろ（am）・20:00ごろ（pm） | sns-ranking-reel.yml | scripts/sns/ranking-reel/ |
| 釣果週報カルーセル（X にも画像4枚＋記事リンク） | 週報公開時。保険で毎日 18:55 以降に未投稿なら投稿 | sns-weekly-carousel.yml | scripts/sns/weekly-carousel/ |
| 単発カルーセル | 手動のみ（まず dry_run=true で Discord に出して確認） | sns-manual-carousel.yml | scripts/sns/manual-carousel/posts/ |

### 起動のしくみ（GitHub の定時実行は当てにならない）
- GitHub Actions の cron は数時間遅れたり、そもそも実行されなかったりする
- **本命**：Cloudflare Worker の Cron（ops/cloudflare/reel-trigger-worker.js）が毎日 7:30（am）と 19:55（pm）にランキング投稿を起動する
- **予備**：GitHub の毎時 cron。夜の枠が未投稿のときだけ投稿する（Worker が失敗した日の保険）
- 投稿済みかどうかは「日付×枠」ごとに Redis の台帳で判定するので、二重投稿はしない

### トークン（60日で切れる問題は対策済み）
- Instagram / Threads のアクセストークンは約60日で失効する
- 毎週月曜 9:00 に sns-token-refresh.yml が延長し、新しいトークンを Redis に保存する
- 投稿側は Redis のトークンを優先し、無ければ GitHub Secrets の初期値（INSTAGRAM_ACCESS_TOKEN / THREADS_ACCESS_TOKEN）を使う
- 延長に失敗したら Discord に「⚠️ SNSトークン延長 失敗あり」が届く → 放置すると投稿が止まるので、Meta でトークンを再発行して Secrets を更新する

---

## Push通知・LINE配信
- Push 週次配信：毎週月曜12:00に釣果週報ダイジェストをWeb PushとLINEで配信
- LINE公式アカウントへの配信は無料プランで月200通まで（送りすぎ注意）
- LINE配信のオン/オフはリポジトリ変数 LINE_BROADCAST_ENABLED で制御

---

## IndexNow（SEOの自動通知）
毎週月曜15:00に全URLをBing等に「更新したよ」と自動通知。SEOの裏方。失敗しても即問題にはならないが放置は避ける。

---

## 自動投稿が止まったとき
1. GitHub の Actions タブで赤い失敗のワークフローをクリックしてログを見る
2. よくある原因：APIキー/トークンの失効（特にX・Instagram・LINE）→ 各サービスで再発行しSecretsを更新
3. X・Instagram・Threads の投稿成否は Discord にも通知が来る
4. Instagram が止まったら、まず月曜のトークン延長が失敗していないか Discord を確認

---

## 用語ミニ辞典
- GitHub Actions：GitHub上で自動作業を動かす仕組み。
- cron：決まった時刻に自動実行する設定。
- アクセストークン：SNS投稿の「鍵」。期限切れに注意（Instagramは60日）。
- リール：Instagramの短い縦型動画。発見されやすい。
- Discord Webhook：Discordに自動でメッセージを送る仕組み。投稿の成否が届く。
