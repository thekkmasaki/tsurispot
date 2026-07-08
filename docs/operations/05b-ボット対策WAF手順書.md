# 05b. ボット対策 WAF 実践マニュアル（初心者向け・自分でできる版）

> **この手順書だけで、あなた一人でボット対策ができます。**
> 2026年7月に実際にやった操作を、そのまま再現できるよう順番に書いています。コピペで使える「ルールの呪文」も用意しました。

最終更新: 2026-07-07
関連：[05 セキュリティとボット対策](./05-セキュリティとボット対策.md)（考え方の解説）

---

## 🎬 全体の流れ（5ステップ）
```
① 気づく    … PVが急増したのに収益が増えてない → ボットを疑う
② 犯人特定  … GA4で「1人で数千PV」の異常ページを探す
③ ブロック  … Cloudflareで、そのページに「人間確認」を出す ← メイン
④ 確認      … ちゃんとブロックできたか確かめる
⑤ 恒久対策  … 数時間後、犯人のIPを突き止めて完全ブロック
```
所要時間：③まで15分くらい。⑤は数時間後にもう一度。

---

## ① 気づく：ボットのサイン
- GA4のPVが急に何倍にも増えた
- なのにAdSenseの収益は増えていない
- 特定の釣り場ページだけアクセスが異常に多い

> 💡 本物の人気なら収益も増えます。**PVだけ増えて収益が増えない＝ほぼボット**。

---

## ② 犯人特定：GA4で異常ページを探す
1. https://analytics.google.com にログイン
2. 「レポート」→「エンゲージメント」→「ページとスクリーン」
3. 期間を「過去7日」等にし、**表示回数（PV）が多い順**に並べる
4. **PVはめちゃ多いのにユーザー数がやたら少ない**ページを探す（例：5ユーザーで9,500PV）＝ボットの標的
5. そのURLの `/spots/` の後ろ（例：`onagawa-port`）をメモ。これを **slug（スラッグ）** と呼びます。複数あれば全部メモ

---

## ③ ブロック：Cloudflareで「人間確認」を出す（メイン）
### 3-1. WAFの画面を開く
1. https://dash.cloudflare.com にログイン
2. サイト一覧から **tsurispot.com** をクリック
3. 左メニュー「**セキュリティ**」→「**WAF**」
4. 「**カスタムルール**」タブ →「**ルールを作成**」

### 3-2. ルールを作る
**ルール名**（自由）：`ボット連打スポット対策 2026-XX-XX`

**条件**（フィールド/演算子/値を選ぶ）— 1ページだけなら：
| 欄 | 選ぶもの |
|---|---|
| フィールド | **URI パス**（URI Path） |
| 演算子 | **ワイルドカードに一致**（wildcard） |
| 値 | `/spots/狙われてるslug*`（例：`/spots/onagawa-port*`）|

「**AND**」でもう1条件（正規の検索ボットを巻き込まないため）：
| 欄 | 選ぶもの |
|---|---|
| フィールド | **既知のボット**（Known Bots） |
| 演算子 | **等しくない**（is not）|

**アクション**：「**Managed Challenge（マネージドチャレンジ）**」を選ぶ（人間確認画面。普通の人は素通り、ボットは止まる）。

「**デプロイ/保存**」を押して完成。

### 3-3. 複数ページをまとめてブロック（コピペで簡単）
条件欄で「**式エディタで編集**（Edit expression）」に切り替え、下のテンプレを貼る。

---

## 📋 コピペ用テンプレ（ルールの式）
### テンプレA：1ページだけ
```
(http.request.uri.path wildcard "/spots/onagawa-port*") and not cf.client.bot
```
### テンプレB：複数ページ
```
(http.request.uri.path wildcard "/spots/ページ1*" or http.request.uri.path wildcard "/spots/ページ2*") and not cf.client.bot
```
→ `ページ1` `ページ2` を狙われたslugに書き換え。ページの数だけ ` or http.request.uri.path wildcard "/spots/xxx*"` を足す。

### 2026-07-06 実際に設置した式（参考。8ページとも稼働実測済み）
```
(http.request.uri.path wildcard "/spots/onagawa-port*" or http.request.uri.path wildcard "/spots/shichigahama-gyokou6*" or http.request.uri.path wildcard "/spots/hachimori-iwadate6*" or http.request.uri.path wildcard "/spots/karatsu-higashi-port*" or http.request.uri.path wildcard "/spots/rumoi-minami-gampeki6*" or http.request.uri.path wildcard "/spots/takamatsu-yashima-hokurei-gogan*" or http.request.uri.path wildcard "/spots/hinumagawa-onuki-a11*" or http.request.uri.path wildcard "/spots/innoshima-habu-kou-soto*") and not cf.client.bot
```

**式の意味**：
- `http.request.uri.path wildcard "/spots/xxx*"` = 「URLが /spots/xxx で始まるアクセス」
- `and not cf.client.bot` = 「かつ、正規の検索ボット（Google等）ではないもの」← Googleを巻き込まない
- `or` = 「または」（複数ページをつなぐ）

---

## ④ 確認：ちゃんとブロックできたか
1. スマホやPCでブロックしたページ（例：`tsurispot.com/spots/onagawa-port`）を開く
2. 一瞬「少しお待ちください」的な確認画面が出るか、普通に開けばOK（人間は通過できる）
3. 心配なら、ブロックしていないトップページも開いて、そちらは確認画面なしで開けることを確認（＝普通のページに影響していない）

---

## ⑤ 恒久対策：数時間後、犯人のIPを完全ブロック
1. https://dash.cloudflare.com → tsurispot.com →「**セキュリティ**」→「**イベント**」
2. さっきのルールで止めたアクセスの記録が出る。**同じIPが何度も出ている**のが犯人。IPをメモ
3. 「**セキュリティ**」→「**ツール**」→「**IPアクセスルール**」
4. そのIPを入力、アクション「**ブロック**」→ 追加

> ⏰ 記録は約24時間で消えます（無料プラン）。ルール設置日の**その日のうち**にイベントを確認。

---

## ⑥ 後片付け（落ち着いたら）
- **GA4にメモ**：管理→データの表示→メモ で「◯月◯日〜 ボット汚染」と付箋
- ボットが完全に去ったら③のルールは削除OK（無料プランはルール5本までなので枠を空けたいとき）

---

## ⚠️ やってはいけないこと
| ダメ | なぜ |
|---|---|
| **/spots/* 全部**に人間確認 | 普通のユーザーやGoogle巡回を巻き込み検索順位が落ちる。**狙われた特定ページだけ**に |
| **Bot Fight Mode**を軽い気持ちでオン | 決済やLINE連携を壊すことがある |
| いきなり国やASNを丸ごとブロック | 普通のユーザーも巻き込む。**IP単位**で |

---

## 🆘 自信がないとき
- 狙われたページが1〜2個ではっきりしている → この手順で自分でできます
- 複雑・大規模でよくわからない → 無理せず開発者/Claudeに「ボットが来た、GA4で◯◯ページが1ユーザー数千PV」と伝えるだけでOK

**焦らなくて大丈夫**。ボットが来てもサイトが壊れるわけではありません。データと収益を守る作業です。

---

## 📌 技術メモの在りか
zoneID・API経由の操作など詳しい技術情報は `memory/cloudflare-waf-rules.md`（開発者/Claude向け）にあります。

---

## 用語ミニ辞典
- **WAF**：怪しいアクセスをルールで防ぐ仕組み。
- **slug**：URLの最後の、ページ名の部分。
- **Managed Challenge（人間確認）**：「人間？」の確認画面。ボットは止まる。
- **ワイルドカード（`*`）**：「なんでも当てはまる」記号。
- **cf.client.bot**：Cloudflareが判定する正規の良いボット（Google等）。`not cf.client.bot`で除外。
- **IPアドレス**：インターネット上の住所。悪いボットのIPを名指しでブロックできる。
