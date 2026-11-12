# 釣果週報カルーセル（Instagram）

`/weekly-report` で週報（microCMS の `chouka-shuho-{エリア}-{週}`）を作ると、
最後にその週の釣果まとめを Instagram カルーセルで1本、自動投稿する。

## 流れ

1. **`/weekly-report` の STEP 7（自動）**
   - `~/saas-backup/SNS/週報写真/` に新しい写真があれば写真プールに追加（無くてもよい）
   - `gh workflow run sns-weekly-carousel.yml -f week=<週> -f dry_run=false -f force=true` で即投稿
2. **投稿（GitHub Actions）**: 週報を読む → スライド生成 → Instagram に投稿 → Discord に ✅ / ❌
3. **保険**: 毎日 JST 19:00 にも同じ処理が走り、未投稿の週が出揃っていれば投稿（投稿済みの週は何もしない）

## 写真プール

- 置き場所: `s3://tsurispot-sns-assets/photo-pool/`（非公開。向き補正・長辺2160px・**EXIF/GPS削除済み**）
- 毎週4枚（表紙1＋写真スライド3）を**最近使っていない順**に選ぶ。表紙は縦長の写真を優先。使った日時は Redis `sns:weekly:photo-used`
- 追加: `node scripts/sns/weekly-carousel/add-photos.mjs <ファイル or フォルダ>...`（同じ写真は二重登録しない。フォルダの元ファイルは `追加済み/` へ移動）
- 削除: `aws s3 rm s3://tsurispot-sns-assets/photo-pool/<ID>.jpg`
- 写真スライドには「ツリスポ編集部の釣行より」と表示する（その週の釣果とは書かない）

## スライド構成（1080×1350 JPEG、最大10枚）

表紙（写真）→ エリア別（1枚に2エリア・好調度順・各3件）→ 編集部の写真 → 締め

内容は週報の「今週の釣果速報（一覧）」表とタイトルのキャッチコピーだけを使う（創作・誇張なし）。

## 手動実行

```bash
# 公開サイトから読み、ローカル写真で描画だけ確認（投稿しない）
node scripts/sns/weekly-carousel/run.mjs --dry-run --week 2026-11-week2 --photos-dir <dir> --out /tmp/sns-weekly
```

GitHub Actions では「釣果週報カルーセル（Instagram）」を手動実行（`dry_run` の初期値は true）。

## 必要な GitHub Secrets

`INSTAGRAM_USER_ID` / `INSTAGRAM_ACCESS_TOKEN`（ランキング投稿と共通。トークンは `sns-token-refresh.yml` が延長して Redis に保存）、
既存の `MICROCMS_*`・AWS・Upstash・Discord。

**投稿すべき週があるのに Instagram の認証情報が無い場合は失敗（赤）で終わり、Discord に ❌ が届く。**
