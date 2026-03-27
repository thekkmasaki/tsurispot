# Gemini クイズ動画プロンプト集（自動生成用）

毎日3本のクイズ動画をGeminiで自動生成するためのプロンプト集。
**動画は問題パートのみ。答えはサイト（tsurispot.com/quiz）に誘導。**

## 使い方

1. Geminiの予約生成に以下のプロンプトをセット（英語プロンプト推奨）
2. 生成された動画をダウンロード
3. ffmpegでテロップ追加 + 縦型変換
4. `inbox/` に配置して `npm run post` で投稿
5. ストーリーズでリールをシェア + リンクスティッカーで `tsurispot.com/quiz` へ

## 戦略

- **動画内に答えを出さない** → 「答えはプロフィールのリンクから！」でサイトに誘導
- サイトのクイズページでPV獲得 + 滞在時間UP
- 動画制作は1本のみ（問題シーンだけ）でコスト半減



## 重要ルール

- **英語プロンプト**でGeminiに指示（映像品質が高い）
- **日本語テロップはffmpegで後付け**（Gemini内の日本語は文字化け）
- **テキスト用の余白を確保**する指示を必ず含める
- 各動画は **8秒以内**（Geminiの制約）

---

## Quiz 01: イワシの漢字「鰯」の意味
**Q:** イワシの漢字「鰯」に含まれる意味は？
**選択肢:** A.強い魚 B.弱い魚 C.速い魚 D.光る魚

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A school of sardines swimming in crystal-clear blue ocean water. Morning sunlight filtering through the surface creates shimmering patterns on the silver fish. Slow-motion capture of the sardines moving in unison. Camera starts wide then slowly zooms in. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Documentary, National Geographic quality, serene and beautiful.
```

### キャプション
```
🐟 イワシの漢字「鰯」に含まれる意味、知ってる？

A.強い魚 B.弱い魚 C.速い魚 D.光る魚

答えが気になる人は👇
🔗 ストーリーズのリンクからクイズに挑戦！

#釣り #fishing #魚クイズ #イワシ #鰯 #漢字クイズ
#ツリスポ #釣り好きと繋がりたい #釣りスタグラム
```

---

## Quiz 02: カレイとヒラメの見分け方
**Q:** カレイとヒラメの見分け方で正しいのは？
**選択肢:** A.カレイは左向き B.カレイは右向き C.大きい方がヒラメ D.色が濃い方がカレイ

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A flatfish resting on sandy ocean floor, half-buried in sand. Clear tropical-blue water. The camera slowly descends toward the fish. Sunlight creates dancing patterns on the seabed. The fish's camouflage blends perfectly with the sand. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Underwater documentary, mysterious and curious mood.
```

### キャプション
```
🐟 カレイとヒラメ、見分けられる？

A.カレイは左向き B.カレイは右向き
C.大きい方がヒラメ D.色が濃い方がカレイ

答えが気になる人は👇
🔗 ストーリーズのリンクからクイズに挑戦！

#釣り #カレイ #ヒラメ #魚クイズ #釣り知識
#ツリスポ #釣り好きと繋がりたい #釣りスタグラム
```

---

## Quiz 03: クロダイの別名
**Q:** クロダイの別名として最も一般的なのは？
**選択肢:** A.グレ B.チヌ C.セイゴ D.ハネ

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A dark-colored sea bream swimming near rocky reef underwater. Dramatic lighting from above. The fish moves gracefully between rocks and seaweed. Deep blue water with particles floating. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Dramatic underwater cinematography, moody blue tones.
```

---

## Quiz 04: メバルの名前の由来
**Q:** メバルの「メバル」という名前の由来は？
**選択肢:** A.目が張り出している B.群れて泳ぐ C.海面すれすれを泳ぐ D.漁獲量が多い

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A rockfish with large prominent eyes hovering near rocky crevice underwater. Dark rocky reef environment with ambient blue-green light filtering from above. The fish's big eyes are clearly visible and reflect the light. Slow, gentle camera movement. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Intimate underwater portrait, focus on the fish's eyes.
```

---

## Quiz 05: タチウオの体の特徴
**Q:** タチウオの体の特徴として正しいのは？
**選択肢:** A.丸く太い B.平たく銀色 C.赤い斑点 D.体が透明

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A long, silver, ribbon-like fish swimming vertically in dark deep water. Bioluminescent shimmer on its metallic body. The fish moves elegantly, catching light like a sword blade. Dark background emphasizes the silver glow. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Dark, dramatic, sword-like metallic beauty.
```

---

## Quiz 06: スズキの出世名
**Q:** スズキの出世名で正しい順番は？
**選択肢:** A.セイゴ→フッコ→スズキ B.フッコ→セイゴ→スズキ C.スズキ→セイゴ→フッコ D.ハネ→スズキ→セイゴ

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A large sea bass leaping out of moonlit water at night. Splash and water droplets frozen in slow motion. Urban harbor background with city lights reflecting on the water. Dramatic, powerful fish jump. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Epic slow-motion, nighttime drama, powerful.
```

---

## Quiz 07: アオリイカの釣り方
**Q:** アオリイカの釣り方として最もポピュラーなのは？
**選択肢:** A.サビキ釣り B.投げ釣り C.エギング D.フライフィッシング

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A bigfin reef squid hovering in crystal clear water. Iridescent skin changing colors. Tentacles gently flowing. Tropical blue-green water with rocky reef below. Beautiful, alien-like creature. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Ethereal, mesmerizing underwater beauty, vibrant colors.
```

---

## Quiz 08: ゴンズイに刺された時の応急処置
**Q:** ゴンズイに刺された場合の正しい応急処置は？
**選択肢:** A.冷水で冷やす B.患部を吸う C.お湯に浸ける D.アルコール消毒

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A group of small dark catfish-like fish with yellow stripes swimming in a tight ball formation near a rocky pier underwater. Murky green water. Ominous, warning mood. Camera slowly approaches the cluster. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Slightly ominous, warning tone, dark underwater.
```

---

## Quiz 09: サバの特徴的な模様
**Q:** サバの体表に見られる特徴的な模様は？
**選択肢:** A.縦縞 B.水玉 C.波状の横縞 D.無地で光沢

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A school of mackerel swimming rapidly through blue open water. Their backs show distinctive blue-green patterns. Silver flashes as they turn. Dynamic, energetic movement. Sunlight filtering from above. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Dynamic, energetic, nature documentary action.
```

---

## Quiz 10: ブリの出世名（関東）
**Q:** ブリの出世名の正しい順番は？（関東）
**選択肢:** A.ワカシ→イナダ→ワラサ→ブリ B.ツバス→ハマチ→メジロ→ブリ C.イナダ→ワカシ→ブリ→ワラサ D.コブリ→チュウブリ→オオブリ

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A massive yellowtail powerfully swimming through deep blue water. Muscular body, sleek silver-gold coloring. Camera follows the fish as it accelerates. Deep ocean blue background. Epic, powerful feeling. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Epic, powerful, National Geographic deep ocean.
```

---

## Quiz 11: マダイが「おめでたい魚」の理由
**Q:** マダイが「おめでたい魚」とされる理由は？
**選択肢:** A.味が甘い B.赤い体色と語呂合わせ C.産卵数が多い D.寿命が長い

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A beautiful red sea bream swimming majestically in clear blue water. Vibrant red-pink scales catching sunlight. The fish turns slowly, displaying its full beauty. Coral reef and blue water background. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Majestic, regal, beautiful color emphasis.
```

---

## Quiz 12: カワハギが「エサ取り名人」の理由
**Q:** カワハギが「エサ取り名人」と呼ばれる理由は？
**選択肢:** A.大量に食べる B.器用にエサだけ取る C.横取りする D.エサを吐き出す

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A filefish with its distinctive diamond-shaped body swimming near a fishing hook with bait. The fish approaches cautiously, nibbling delicately. Clear water, rocky bottom. Humorous, sneaky feeling. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Playful, close-up documentary, humorous undertone.
```

---

## Quiz 13: サヨリの口の特徴
**Q:** サヨリの口の特徴は？
**選択肢:** A.上顎が長い B.下顎が長い C.口が丸く大きい D.口がない

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: Elegant, slender needlefish swimming near the ocean surface. Crystal clear water with sunlight streaming through. The fish's long, delicate body glides gracefully. School of needlefish visible in the background. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Elegant, graceful, surface-level beauty.
```

---

## Quiz 14: キスが好む海底
**Q:** キスが好む海底の環境は？
**選択肢:** A.岩礁帯 B.砂地 C.海藻の磯場 D.深海の泥底

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A whiting fish half-buried in clean white sandy ocean floor. Clear shallow water with sunlight creating ripple patterns on the sand. The fish emerges and glides along the sandy bottom. Peaceful, bright atmosphere. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Peaceful, bright, sandy beach underwater vibes.
```

---

## Quiz 15: アカエイに刺される事故が多い場所
**Q:** アカエイに刺される事故が多い場所は？
**選択肢:** A.深海 B.岩場の上 C.砂浜の浅瀬 D.河川の上流

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A stingray partially buried in shallow sandy water near a beach. Only its outline visible in the sand. Ominous music mood. Camera slowly reveals the hidden ray. Shallow clear water with sunlight. Warning atmosphere. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Suspenseful, warning, hidden danger revealed.
```

---

## Quiz 16: カサゴの生息場所
**Q:** カサゴはどのような場所に生息する？
**選択肢:** A.外洋の表層 B.砂泥底 C.岩礁やテトラの隙間 D.河川の上流

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A red-brown scorpionfish perfectly camouflaged among rocks and tetrapod structures underwater. Dark, moody reef environment. The fish sits motionless, blending with its surroundings. Camera slowly approaches, revealing the hidden fish. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Hide-and-seek, discovery moment, dark reef atmosphere.
```

---

## Quiz 17: ハゼ釣りの代表的な餌
**Q:** ハゼ釣りの代表的な餌は？
**選択肢:** A.オキアミ B.青イソメ C.練り餌 D.ルアー

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A cute small goby fish sitting on sandy bottom in a calm river mouth. Clear shallow water. The fish has big eyes and looks around curiously. Warm afternoon sunlight. Peaceful, friendly atmosphere. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Cute, peaceful, warm afternoon vibes.
```

---

## Quiz 18: アジの稜鱗（ぜいご）
**Q:** アジの体側にある特徴的な構造は？
**選択肢:** A.鱗板 B.稜鱗（ぜいご） C.側線鱗 D.尾柄鱗

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A school of horse mackerel swimming through a bait ball in blue open water. Silver flashes as they turn in unison. Dynamic, active movement. Sunlight filtering through from above. Energy and abundance. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Dynamic school movement, silver flash, abundant ocean.
```

---

## Quiz 19: メジナの関西での別名
**Q:** メジナの関西での別名は？
**選択肢:** A.チヌ B.グレ C.クエ D.ハネ

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A dark blue-green opaleye fish swimming near a wave-beaten rocky shore. White foam and bubbles from crashing waves. Raw, wild ocean power. The fish navigates expertly through the turbulent water. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Wild, powerful, rocky shore drama.
```

---

## Quiz 20: 潮が動く時間が釣れる理由
**Q:** 釣りで「潮が動く時間」が良いとされる理由は？
**選択肢:** A.魚が寝ている B.水温が上がる C.プランクトンが流れる D.波が穏やか

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: Timelapse of ocean tides - water level rising and falling against a seawall or pier. Strong tidal currents visible. Swirling water patterns. Dramatic sky with clouds moving. The power of tidal movement. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Timelapse, dramatic natural forces, educational.
```

---

## Quiz 21: アイゴの毒棘の場所
**Q:** アイゴ（バリ）の毒棘がある場所は？
**選択肢:** A.背びれ・腹びれ・臀びれ B.尾びれのみ C.口の中 D.体表全体

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A rabbitfish with its fins extended, swimming near coral reef. All fins spread wide showing the spiny rays. Warning-colored fish with mottled brown-green pattern. Camera circles the fish slowly. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Warning, detailed fin display, educational danger.
```

---

## Quiz 22: 毒魚を釣った時の対処法
**Q:** 毒魚を釣ってしまった時の正しい対処法は？
**選択肢:** A.素手で外す B.魚つかみ・プライヤー使用 C.放置 D.足で踏む

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A fishing line being reeled in, and an unfamiliar, spiny, dangerous-looking fish appears at the surface. Dramatic reveal moment. The fish has visible spines and looks threatening. Suspenseful mood. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Suspenseful reveal, "what is this?" moment.
```

---

## Quiz 23: ハオコゼの毒棘の位置
**Q:** ハオコゼの毒棘はどこにある？
**選択肢:** A.尾びれ B.背びれ C.口の中 D.腹部

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A tiny scorpionfish sitting on rocky bottom, camouflaged among stones. Very small but with prominent spiny dorsal fin. Camera slowly zooms in to reveal the hidden danger. Dark, moody underwater. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Hidden danger, small but deadly, close-up reveal.
```

---

## Quiz 24: ゴンズイの見た目の特徴
**Q:** ゴンズイの見た目の特徴は？
**選択肢:** A.赤い体に白い斑点 B.黒褐色に黄色い縦線 C.銀色に光る D.緑色に横縞

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A cluster of small catfish-like fish forming a dense ball near a pier at night. Underwater lights illuminate the group. The fish have distinctive stripe patterns. Eerie nighttime underwater scene. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Eerie night, cluster formation, distinctive appearance.
```

---

## Quiz 25: クラゲに刺された時の応急処置
**Q:** クラゲに刺された場合の応急処置は？
**選択肢:** A.真水で洗う B.酢をかける C.砂で擦る D.温める

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: Translucent jellyfish drifting in blue water near a fishing pier. Beautiful but dangerous. Long trailing tentacles visible. Sunlight illuminating the transparent bell. Ethereal, beautiful but ominous. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Beautiful but dangerous, ethereal, warning undertone.
```

---

## Quiz 26: サビキ釣りで使う寄せ餌
**Q:** サビキ釣りで一般的に使う寄せ餌は？
**選択肢:** A.ミミズ B.アミエビ C.練り餌 D.ルアー

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A sabiki fishing rig splashing into clear harbor water. Multiple small hooks visible underwater with a bait cage. Small fish gathering around, attracted by the chum. Active, exciting feeding frenzy. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Exciting, active, fish gathering, anticipation.
```

---

## Quiz 27: 朝マヅメとは
**Q:** 釣りで「朝マヅメ」とはいつのこと？
**選択肢:** A.正午 B.夜明け前後 C.日没後 D.真夜中

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: Time-lapse of dawn breaking over a Japanese fishing pier. Sky transitions from deep blue to orange-pink. First rays of sunlight hitting the ocean surface. Fishermen silhouetted against the pre-dawn sky. Magical, golden hour beginning. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Magical dawn, timelapse, golden hour beauty.
```

---

## Quiz 28: PEラインの最大の特徴
**Q:** PEラインの最大の特徴は？
**選択肢:** A.安い B.伸びがなく高感度 C.目立たない D.結びやすい

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: Close-up of two different fishing lines side by side - one braided colorful PE and one clear monofilament nylon. Camera slowly moves between them showing texture differences. Clean, studio-like background. Educational product comparison. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Product comparison, clean studio, educational.
```

---

## Quiz 29: フグを釣った時
**Q:** フグを釣ってしまったら食べてもいい？
**選択肢:** A.焼けば大丈夫 B.内臓を取れば安全 C.絶対ダメ D.種類による

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A cute-looking pufferfish inflating itself after being caught on a line. Round, spiky body. The fish looks almost comical as it puffs up. Clear water at a fishing pier. Humorous but slightly ominous. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Initially cute and funny, underlying danger message.
```

---

## Quiz 30: 「ボウズ」の意味
**Q:** 釣り用語「ボウズ」の意味は？
**選択肢:** A.大漁 B.1匹も釣れない C.記録更新 D.新しい釣り場

```
Generate a cinematic 8-second vertical video (9:16 aspect ratio).

Scene: A lonely fisherman sitting at the edge of a pier, staring at a motionless rod. Empty bucket beside them. Sunset casting long shadows. Melancholy but peaceful atmosphere. No fish, no action. Keep the top 20% and bottom 30% of the frame clear for text overlay. No text in the video.

Style: Melancholy, relatable, peaceful emptiness.
```

---

## ffmpeg テロップ追加コマンド（共通テンプレ）

### 問題テロップ + 選択肢 + 誘導テロップ
```bash
FONT="C\\\\:/Windows/Fonts/YuGothB.ttc"

# 縦型変換
ffmpeg -y -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" -c:a copy vertical.mp4

# テロップ追加
ffmpeg -y -i vertical.mp4 -vf "\
  drawtext=fontfile=$FONT:text='Q':fontsize=72:fontcolor=yellow:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h*0.10:enable='between(t,0,8)',\
  drawtext=fontfile=$FONT:text='[問題文]':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h*0.18:enable='between(t,0.5,8)',\
  drawtext=fontfile=$FONT:text='A.[選択肢A]  B.[選択肢B]':fontsize=34:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.73:enable='between(t,2,8)',\
  drawtext=fontfile=$FONT:text='C.[選択肢C]  D.[選択肢D]':fontsize=34:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.78:enable='between(t,2,8)',\
  drawtext=fontfile=$FONT:text='⏱ 答えは...？':fontsize=40:fontcolor=yellow:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.50:enable='between(t,5,8)',\
  drawtext=fontfile=$FONT:text='👇 答えはストーリーズのリンクから':fontsize=32:fontcolor=cyan:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.86:enable='between(t,6,8)',\
  drawtext=fontfile=$FONT:text='ツリスポ tsurispot.com':fontsize=28:fontcolor=white@0.8:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.92:enable='between(t,5,8)'\
" -c:a copy output.mp4
```

### Quiz 01 の具体例
```bash
FONT="C\\\\:/Windows/Fonts/YuGothB.ttc"

ffmpeg -y -i quiz01_vertical.mp4 -vf "\
  drawtext=fontfile=$FONT:text='Q':fontsize=72:fontcolor=yellow:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h*0.10:enable='between(t,0,8)',\
  drawtext=fontfile=$FONT:text='イワシの漢字「鰯」の意味は？':fontsize=48:fontcolor=white:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h*0.18:enable='between(t,0.5,8)',\
  drawtext=fontfile=$FONT:text='A.強い魚  B.弱い魚':fontsize=34:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.73:enable='between(t,2,8)',\
  drawtext=fontfile=$FONT:text='C.速い魚  D.光る魚':fontsize=34:fontcolor=white:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.78:enable='between(t,2,8)',\
  drawtext=fontfile=$FONT:text='⏱ 答えは...？':fontsize=40:fontcolor=yellow:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.50:enable='between(t,5,8)',\
  drawtext=fontfile=$FONT:text='👇 答えはストーリーズのリンクから':fontsize=32:fontcolor=cyan:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h*0.92:enable='between(t,6,8)'\
" -c:a copy quiz01_final.mp4
```

---

## キャプション共通テンプレート
```
🐟 [問題文]

[選択肢を改行で表示]

答えが気になる人は👇
🔗 ストーリーズのリンクからクイズに挑戦！

#釣り #fishing #魚クイズ #[魚種タグ] #[関連タグ]
#ツリスポ #釣りスポット #釣り好きと繋がりたい #釣りスタグラム
```

---

## 投稿スケジュール（30問 = 10日分）

| 日 | Quiz | テーマ |
|----|------|--------|
| Day 1 | 01, 02, 03 | イワシ漢字・カレイヒラメ・クロダイ別名 |
| Day 2 | 04, 05, 06 | メバル由来・タチウオ特徴・スズキ出世名 |
| Day 3 | 07, 08, 09 | アオリイカ釣法・ゴンズイ応急・サバ模様 |
| Day 4 | 10, 11, 12 | ブリ出世名・マダイ祝い・カワハギ名人 |
| Day 5 | 13, 14, 15 | サヨリ口・キス砂地・アカエイ浅瀬 |
| Day 6 | 16, 17, 18 | カサゴ生息・ハゼ餌・アジぜいご |
| Day 7 | 19, 20, 21 | メジナ別名・潮読み・アイゴ毒棘 |
| Day 8 | 22, 23, 24 | 毒魚対処・ハオコゼ・ゴンズイ見た目 |
| Day 9 | 25, 26, 27 | クラゲ対処・サビキ餌・朝マヅメ |
| Day 10 | 28, 29, 30 | PEライン・フグ・ボウズ |
