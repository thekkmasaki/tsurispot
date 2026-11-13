# 釣果週報カルーセル（Instagram・X）

`/weekly-report` で週報（microCMS の `chouka-shuho-{エリア}-{週}`）を作ると、
最後にその週の釣果まとめを **Instagram カルーセル1本** と **X 1件（画像4枚＋週報記事リンク）** で自動投稿する。

## 流れ

1. **`/weekly-report` の STEP 7（自動）**: `gh workflow run sns-weekly-carousel.yml -f week=<週> -f dry_run=false -f force=true` で即投稿
2. **投稿（GitHub Actions）**: 週報を読む → スライド生成 → Instagram に投稿 → X に投稿 → Discord に媒体ごとの ✅ / ❌
3. **保険**: 毎日 JST 19:00 にも同じ処理が走り、未投稿の週が出揃っていれば投稿（投稿済みの媒体は何もしない）

投稿済みは媒体ごとに Redis で管理する（Instagram=`sns:weekly:posted` / X=`sns:weekly:x:posted`）。
片方が失敗しても、もう片方は投稿され、失敗した媒体だけ次回やり直す。

## 期間の表示

表紙・キャプション・X は、週報が実際に扱っている期間（例: `11/3〜11/9`）を出す（`data.mjs` の `weekPeriod`）。
WEEKTAG の「11月第2週（11/8〜11/14）」は週報を**作った週**で、中身は前の7日間の釣果なので表示には使わない。
期間はタイトルに `M/D〜M/D` があればそれ、無ければ最初の公開日の前日までの7日間。

## 取りこぼし検知

`weekly-report-check.yml`（木・金の朝）が、前回の週報から6日超（＝木曜運用で今週分がまだ）or 最新週に主要10エリアの欠けがあると Discord に ⚠️ を送る（`check-fresh.mjs`）。

## スライド構成（1080×1350 JPEG、最大10枚）

表紙（今週の注目釣果3件）→ エリア別（1枚に2エリア・好調度順・各3件）→ 締め

- X には先頭4枚（表紙＋エリア上位）を載せる（X は1投稿4枚まで）
- 内容は週報の「今週の釣果速報（一覧）」表とタイトルのキャッチコピーだけを使う（創作・誇張なし）
- **写真は週報に載っている魚種の実写だけ**（各釣果の横と表紙に小さく。写真の下に写っている魚種名を表示）。週報と関係のない写真（風景など）は使わない
  - 優先: ①オーナーの実釣写真（`owner-photos.json` → 非公開S3 `photo-pool/`）②図鑑の実釣写真（`userPhotos`）③図鑑の写真（`LICENSES.md` に出典があるもの。イラスト・図版は除外）
  - ③を使ったら出典をキャプションに自動で載せる。写真が見つからない魚は写真なし（別の魚の写真で代用しない）
  - スライドとキャプションに「魚の写真は魚種のイメージです」と明記
  - オーナー写真を増やすときは、写真を `photo-pool/` に置き `owner-photos.json` に魚種slugで追加する（魚種を断定できる写真だけ）

## 本文

- Instagram（`caption-instagram.txt`）: 1行目と「今週釣れてる魚」で検索キーワードを入れ、ハッシュタグは5個まで
- X（`caption-x.txt`）: 280ウェイト以内（日本語は1文字2、URLは23）。週・釣れてる魚・上位エリアの一言・一番釣れていたエリアの週報記事リンク・ハッシュタグ3個（`#釣果情報 #釣り` ＋その週いちばん釣れた魚の `#〇〇釣り`。X はタグが多いと逆効果なので3個まで）

## 費用（X）

X API は従量課金（前払いクレジット）。リンク付き投稿は1件 約$0.20 なので週1件で月$1程度。
クレジットが切れると 402 で失敗し、Discord に「X API のクレジット切れ」と届く → X Developer Portal でチャージする。
（毎日の X 自動投稿 `x-auto-post.yml` はクレジットを使い切ったため 2026-11 に定期実行を停止した）

## 手動実行

```bash
# 公開サイトから読み、描画だけ確認（投稿しない）
node scripts/sns/weekly-carousel/run.mjs --dry-run --week 2026-11-week2 --out /tmp/sns-weekly
```

GitHub Actions では「釣果週報カルーセル（Instagram・X）」を手動実行（`dry_run` の初期値は true）。

## 必要な GitHub Secrets

- Instagram: `INSTAGRAM_USER_ID` / `INSTAGRAM_ACCESS_TOKEN`（ランキング投稿と共通。トークンは `sns-token-refresh.yml` が延長して Redis に保存）
- X: `X_API_KEY` / `X_API_KEY_SECRET` / `X_ACCESS_TOKEN` / `X_ACCESS_TOKEN_SECRET`（`x-auto-post.yml` と共通）
- 既存の `MICROCMS_*`・AWS・Upstash・Discord

**投稿すべき週があるのに認証情報が無い・クレジットが無い場合は失敗（赤）で終わり、Discord に ❌ が届く。**
