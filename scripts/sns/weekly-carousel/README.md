# 釣果週報カルーセル（Instagram）

週報（`/weekly-report` が microCMS に投稿する `chouka-shuho-{エリア}-{週}`）が出揃ったら、
その週の釣果まとめを Instagram カルーセルで1本投稿する。

## 流れ

1. **写真（人）**: Mac の `~/saas-backup/SNS/週報写真/` に写真を入れておく（1枚目=表紙、最大4枚。HEIC可）
2. **`/weekly-report` の最後（自動）**: `prep-photos.mjs` が写真を整えて非公開バケットに置く
   - 向き補正・長辺2160px・**EXIF/GPS位置情報は全削除**
   - `s3://tsurispot-sns-assets/weekly-photos/<週>/01.jpg …`
   - 元ファイルは `SNS/週報写真/投稿済み/<週>/` に移動
   - あわせて dry-run を起動し、Discord にプレビューが届く
3. **投稿（自動）**: `sns-weekly-carousel.yml` が毎日 JST 19:00 に確認し、未投稿の最新週が出揃っていれば投稿
   - 出揃い = 8エリア以上、または最初の記事の公開から24時間
   - 写真が無い週は写真なしの表紙で投稿する（止めない）
   - 投稿済みの週は Redis `sns:weekly:posted` に記録し二重投稿しない

## スライド構成（1080×1350 JPEG、最大10枚）

表紙（写真1枚目）→ エリア別（1枚に2エリア・好調度順・各3件）→ 今週の一枚（写真2枚目以降）→ 締め

内容は週報の「今週の釣果速報（一覧）」表とタイトルのキャッチコピーだけを使う（創作・誇張なし）。

## 手動実行

```bash
# 公開サイトから読み、ローカル写真で描画だけ確認（投稿しない）
node scripts/sns/weekly-carousel/run.mjs --dry-run --week 2026-11-week2 --photos-dir <dir> --out /tmp/sns-weekly
# 写真の準備だけ（アップロードしない）
node scripts/sns/weekly-carousel/prep-photos.mjs <受け箱> 2026-11-week2 --no-upload --out /tmp/photos
```

GitHub Actions では「釣果週報カルーセル（Instagram）」を手動実行（`dry_run` の初期値は true）。

## 必要な GitHub Secrets

`INSTAGRAM_USER_ID` / `INSTAGRAM_ACCESS_TOKEN`（ランキング投稿と共通。トークンは `sns-token-refresh.yml` が延長して Redis に保存）、
既存の `MICROCMS_*`・AWS・Upstash・Discord。

**投稿すべき週があるのに Instagram の認証情報が無い場合は失敗（赤）で終わり、Discord に ❌ が届く。**
