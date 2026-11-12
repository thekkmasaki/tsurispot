# 釣果週報カルーセル（Instagram）

`/weekly-report` で週報（microCMS の `chouka-shuho-{エリア}-{週}`）を作ると、
最後にその週の釣果まとめを Instagram カルーセルで1本、自動投稿する。

## 流れ

1. **`/weekly-report` の STEP 7（自動）**: `gh workflow run sns-weekly-carousel.yml -f week=<週> -f dry_run=false -f force=true` で即投稿
2. **投稿（GitHub Actions）**: 週報を読む → スライド生成 → Instagram に投稿 → Discord に ✅ / ❌
3. **保険**: 毎日 JST 19:00 にも同じ処理が走り、未投稿の週が出揃っていれば投稿（投稿済みの週は何もしない）

## スライド構成（1080×1350 JPEG、最大10枚）

表紙（今週の注目釣果3件）→ エリア別（1枚に2エリア・好調度順・各3件）→ 締め

- 内容は週報の「今週の釣果速報（一覧）」表とタイトルのキャッチコピーだけを使う（創作・誇張なし）
- **写真は週報に載っている魚種の実写だけ**（各釣果の横と表紙に小さく。写真の下に写っている魚種名を表示）。週報と関係のない写真（風景など）は使わない
  - 優先: ①オーナーの実釣写真（`owner-photos.json` → 非公開S3 `photo-pool/`）②図鑑の実釣写真（`userPhotos`）③図鑑の写真（`LICENSES.md` に出典があるもの。イラスト・図版は除外）
  - ③を使ったら出典をキャプションに自動で載せる。写真が見つからない魚は写真なし（別の魚の写真で代用しない）
  - スライドとキャプションに「魚の写真は魚種のイメージです」と明記
  - オーナー写真を増やすときは、写真を `photo-pool/` に置き `owner-photos.json` に魚種slugで追加する（魚種を断定できる写真だけ）

## 手動実行

```bash
# 公開サイトから読み、描画だけ確認（投稿しない）
node scripts/sns/weekly-carousel/run.mjs --dry-run --week 2026-11-week2 --out /tmp/sns-weekly
```

GitHub Actions では「釣果週報カルーセル（Instagram）」を手動実行（`dry_run` の初期値は true）。

## 必要な GitHub Secrets

`INSTAGRAM_USER_ID` / `INSTAGRAM_ACCESS_TOKEN`（ランキング投稿と共通。トークンは `sns-token-refresh.yml` が延長して Redis に保存）、
既存の `MICROCMS_*`・AWS・Upstash・Discord。

**投稿すべき週があるのに Instagram の認証情報が無い場合は失敗（赤）で終わり、Discord に ❌ が届く。**
