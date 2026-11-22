# 指示書03 調査結果：釣り禁止が未確認の35件

- 調査日: 2026-11-21
- 範囲: 公式（一次）情報の確認のみ。**スポットデータ・コードは変更していない**
- 方法: WebSearch で候補を探し、県・市・ダム管理者・漁協関連の公式ページ/PDFを curl で取得して本文を確認した
- 分類の定義
  - **禁止（公式根拠あり）**: 管理者等の公式文書で、当該スポットでの釣り禁止（または立入禁止）が明示されている
  - **部分禁止・条件付き**: 公式文書で、一部区域の立入禁止、期間制限、遊漁券の要否などの条件が確認できる
  - **禁止の根拠なし**: 管理者の公式情報を確認したうえで、禁止の記載が見つからない（＝「釣り可と公式に保証された」意味ではない。現地看板など Web 外の規制は対象外）
  - **確認できず**: 公式情報が見つからない、または本文を取得できず判断できない（推測で分類しない）
- 「本文確認」の列: ✅ 本文を取得して確認した / ⚠️ 検索結果の存在のみで、本文は取得できていない
- **二次資料**（釣りメディア、ブログ等）は参考として併記するにとどめ、分類の根拠にはしていない

## サマリー

| 分類 | 件数 |
|---|---|
| 禁止（公式根拠あり） | **0** |
| 部分禁止・条件付き | **12** |
| 禁止の根拠なし | **13** |
| 確認できず | **10** |
| 合計 | 35 |

公式文書で「釣り禁止」を確定できたスポットは0件だった。勝浦・銚子漁港・下関では、釣りメディアが報じる禁止の出どころは漁協の掲示とされる。しかし漁港管理者（県）の公表は見つからず、漁協サイトは今回取得できなかった。

## 一覧

| # | slug | 名称 | 分類 | 要点 |
|---|---|---|---|---|
| 1 | katsuura-port | 勝浦漁港 | 確認できず | 管理者は千葉県（南部漁港事務所）。県・市の公式に禁止の公表なし。禁止情報は二次資料のみ |
| 2 | katsuura-suminawa-breakwater | 勝浦漁港墨名堤防 | 確認できず | 同上 |
| 3 | kagoshima-port | 鹿児島港 | 部分禁止・条件付き | 県が「港湾の岸壁は原則関係者以外立入禁止」と表明 |
| 4 | kagoshima-kita-futo-w6 | 鹿児島港・北ふ頭 | 部分禁止・条件付き | 北ふ頭1号岸壁はSOLAS法に基づく制限区域（立入に許可証が必要）。加えて上記の岸壁原則立入禁止 |
| 5 | kesennuma-ko | 気仙沼港 | 禁止の根拠なし | 県の気仙沼漁港の利用案内は船の係留区分のみ。釣り・立入禁止の記載なし |
| 6 | kesennuma-oshima-seto | 気仙沼港大島瀬戸 | 禁止の根拠なし | 県の海釣りルールに場所指定の禁止なし（スポットの所属漁港区域は特定できず） |
| 7 | kesennuma-oshima-e8 | 気仙沼大島漁港 | 禁止の根拠なし | 浦の浜漁港（県管理）。禁止の記載なし |
| 8 | kesennuma-oshima-rocky-a10 | 気仙沼大島亀山磯 | 禁止の根拠なし | 漁港区域外の磯。県の海釣りルールに場所指定の禁止なし |
| 9 | kesennuma-oura-port-a11 | 気仙沼港大浦漁港 | 禁止の根拠なし | 大浦は県管理の気仙沼漁港の一地区。禁止の記載なし |
| 10 | oshima-uranohama-beach-a11 | 気仙沼大島浦の浜 | 禁止の根拠なし | 浦の浜漁港（県管理）周辺。禁止の記載なし |
| 11 | kesennuma-iwaizaki-rocky-a12 | 気仙沼市岩井崎磯 | 禁止の根拠なし | 公式の釣り規制は見当たらない |
| 12 | kesennuma-oshima-odanohama-a12 | 気仙沼市大島小田の浜 | 部分禁止・条件付き | 海水浴場の開設期間中、遊泳区域とその隣接区域で海産物の採捕禁止（利用規則第10条） |
| 13 | kesennuma-shishiori-port-a13 | 気仙沼市鹿折漁港 | 禁止の根拠なし | 「鹿折漁港」は県・市どちらの管理漁港一覧にもない。実態は気仙沼漁港（魚市場付近）。禁止の記載なし |
| 14 | kesennuma-karakuwa-kosaba-port-a13 | 気仙沼市唐桑半島小鯖漁港 | 禁止の根拠なし | 県管理漁港。禁止の記載なし |
| 15 | kesennuma-motoyoshi-oya-port-a13 | 気仙沼市本吉町大谷漁港 | 禁止の根拠なし | 市管理漁港。県・市に禁止の記載なし（市サイトの検索は不十分） |
| 16 | kesennuma-oshima-kameyama-rocky-a13 | 気仙沼市大島亀山展望台下磯 | 禁止の根拠なし | #8 と同じ |
| 17 | choshi-gaiko | 銚子外港 | 確認できず | 管理者は千葉県（銚子漁港事務所）。県の公式に禁止の公表なし。禁止情報は漁協掲示とされる二次資料のみ |
| 18 | choshi-marina-teibo | 銚子マリーナ堤防 | 確認できず | 漁港ではなく、千葉県が港湾管理者の名洗港。公式に釣り・立入の記載なし |
| 19 | choshigawa-river-mie | 銚子川（三重県紀北町） | 部分禁止・条件付き | 銚子川漁協の第五種共同漁業権（アユ・アマゴ）があり、遊漁承認証と遊漁料が必要。禁止の根拠なし |
| 20 | tonegawa-lower-unagi | 利根川下流（銚子〜佐原） | 部分禁止・条件付き | 内共第10号・11号の漁場で、漁業権魚種を釣るには遊漁承認と遊漁料が必要。禁止の根拠なし |
| 21 | choshi-kou | 銚子港 | 確認できず | #17 と同じ |
| 22 | tonegawa-lower-chiba | 利根川下流（千葉県側） | 部分禁止・条件付き | #20 と同じ |
| 23 | choshi-marina6 | 銚子マリーナ | 確認できず | #18 と同じ |
| 24 | choshi-soto-boutei-e8 | 銚子港外堤防 | 確認できず | #17 と同じ |
| 25 | shimonoseki-port | 下関漁港 | 確認できず | 管理者は山口県と確定。漁港管理条例の本文を入手できず、禁止告知も見つからない |
| 26 | tahara-kou | 田原港 | 禁止の根拠なし | 愛知県の規制概要表で、三河港・田原市は「放置等禁止区域」「立入制限区域」ともに「―」。SOLAS制限区域にも田原地区は含まれない |
| 27 | hase-dam-mahoroba | 初瀬ダム（まほろば湖） | 確認できず | 奈良県のページがエラーを返し、本文を取得できなかった |
| 28 | miyagi-kamafusa-dam-lake | 釜房ダム（釜房湖） | 部分禁止・条件付き | 釣りは可能。条件は、遊漁券が必要（広瀬名取川漁協「釜房湖に限る」区分）、氷上釣りは禁止、湖面使用は届出制、通航制限区域への立入不可 |
| 29 | gifu-tokuyama-dam-lake | 徳山ダム（徳山湖） | 部分禁止・条件付き | 湖面全域立入禁止・開放日も釣り厳禁と、徳山会館の指定管理者が告知（準公式）。流入する上流支流の一部は県の指示で全魚種・周年採捕禁止。ダム管理者（水資源機構）の文書は取得できず |
| 30 | shiobara-dam-ko6 | 塩原ダム湖 | 部分禁止・条件付き | 県の告知で、湖面使用は届出制、6/15〜10/10は使用禁止、堤体から上流約200mは通航禁止。箒川は漁業権区域（遊漁券が必要）。釣り自体の禁止記載なし |
| 31 | tokuyama-dam-gifu | 徳山ダム | 部分禁止・条件付き | #29 と同じダム湖（重複） |
| 32 | arakawa-dam-nosen6 | 荒川ダム（能泉湖） | 確認できず | 漁場図で「荒川の本流及びダムたん水域」が漁業権区域から除外されていることは確認した。ただし管理者が釣りを認めるか禁じるかの記載は見つからない |
| 33 | hakusui-dam-taketa-w6 | 竹田・白水ダム周辺 | 部分禁止・条件付き | 大野川漁協の内共第3号区域で遊漁券が必要。11月下旬〜翌6月中旬は越流を停止し、貯水池内で工事（令和9年まで予定） |
| 34 | akagawa-dam-yaita-a12 | 赤川ダム湖（矢板市） | 禁止の根拠なし | 鬼怒川漁協の遊漁規則に「赤川ダム特別漁場」として竿釣・手釣（1組）が規定されている。ただし所在地は宇都宮市福岡町で、データの「矢板市」は誤り |
| 35 | shiobara-damuko-momiji-a13 | 塩原ダム湖（もみじ谷大吊橋付近） | 部分禁止・条件付き | #30 と同じダム湖。吊橋のすぐ下流側は通航禁止水域 |

## 根拠詳細

### 勝浦（#1, #2）— 確認できず
| URL | 本文確認 | 内容 |
|---|---|---|
| https://www.pref.chiba.lg.jp/gyokou/kakugyokou/index.html | ✅ | 県管理の第3種漁港一覧に「勝浦漁港」がある（2025/12/5更新） |
| https://www.pref.chiba.lg.jp/gj-nanbu/kannaigaiyou.html | ✅ | 南部漁港事務所の所管区域に勝浦市が含まれる |
| https://www.city.katsuura.lg.jp/page/1581.html | ✅ | 市管理の漁港は勝浦東部・串浜・松部・鵜原・守谷・浜行川・大沢。勝浦漁港は含まれない |
| https://www.pref.chiba.lg.jp/gj-nanbu/oshirase-02.html | ✅ | 立入禁止の告知は小湊漁港（寄浦地区）のみ（2026/2/18更新）。勝浦漁港への言及なし |
| https://www.pref.chiba.lg.jp/gyokou/keihatu.html | ✅ | 「立入禁止区域などの危険と思われる箇所では釣りをしないよう」という一般的な啓発のみ（2026/6/5更新） |
| https://www.pref.chiba.lg.jp/kaiku/giji/documents/k22-20giji.pdf | ✅ | 千葉海区漁業調整委員会（2023/5/26）で、県は「漁港内での釣りのルールは各漁港管理者のルールの中での対応」と発言 |

- 二次資料（未開封）: tsuritasu.com/diary_katsuuragyokou_ban_20240320/、tsuribaannai.com/katsuurafishingport/、anahazetaro.com/entry/2024/12/20/000000
  - 内容: 2024年4月から、港内で釣りができるのは船揚げ場の護岸のみで、赤灯波止と墨名堤防の先端は常時立入禁止。出どころは勝浦漁協の掲示とされる。漁協サイトは未確認

### 鹿児島港（#3, #4）— 部分禁止・条件付き
| URL | 本文確認 | 内容 |
|---|---|---|
| https://www.city.kagoshima.lg.jp/faq-kankyomachizukuri/kasenkowan/q2.html | ✅ | 鹿児島港（本港区・新港区など）は鹿児島県の管理 |
| https://www.pref.kagoshima.jp/ak13/chiiki/kagoshima/kiban/documents/miokuri.html | ✅ | 「港湾の岸壁については、事故防止等の観点から、原則関係者以外の立入を禁止しています」（2026/3/10更新。新港区フェリーの見送りに関する告知の中の記述） |
| https://www.pref.kagoshima.jp/ah09/20130305.html | ✅ | 鹿児島港・川内港・志布志港に制限区域を設定。立入には許可証が必要（2026/4/3更新） |
| https://www.pref.kagoshima.jp/ah09/documents/30382_20260403151530-1.pdf | ✅ | 制限区域立入許可証の申請書。区域の選択肢に「本港区北ふ頭１号岸壁」がある（国際船舶・港湾保安法第29条第1項に基づく） |
| https://www.city.kagoshima.lg.jp/faq-kankyomachizukuri/kasenkowan/q3.html | ✅ | 市管理の避難港（桜島港の各地区）では釣りができない。鹿児島港には直接該当しない |
| https://373news.com/news/local/detail/181991/ | ✅（報道） | 南日本新聞（2023/9/19）。県と市が立入を禁止し、自由に釣りができるのは鴨池・桜島の海づり公園のみと報道。県港湾空港課のコメントも掲載 |

- 区域を指定して「釣り禁止」とする県の告示は見つからなかったため、「禁止」ではなく「部分禁止・条件付き」とした。

### 銚子漁港（#17, #21, #24）— 確認できず
| URL | 本文確認 | 内容 |
|---|---|---|
| https://www.pref.chiba.lg.jp/gyokou/kakugyokou/index.html | ✅ | 銚子漁港は県管理の特定第3種漁港 |
| https://www.pref.chiba.lg.jp/gj-choushi/index.html | ✅ | 銚子漁港事務所のページ。お知らせは撮影手続きのみ |
| https://www.pref.chiba.lg.jp/gj-choushi/oshirase.html | ✅ | 運送業者向けの「たれ流し走行の禁止」のみ |
| https://www.pref.chiba.lg.jp/gj-choushi/todokede.html | ✅ | 撮影など一時利用の届出。釣りの規定ではない |
| https://www.pref.chiba.lg.jp/kaiku/giji/documents/k22-20giji.pdf | ✅ | 銚子の釣りについては「地元の銚子の漁港事務所と相談を」と回答。禁止区域の明示なし |

- 二次資料（未開封）: tsuriyoho.com/port/choshi-gyokou、tsuricast.jp/chiba/kujukuri/choshi/choshi-ko
  - 内容: 銚子市漁協の告知として、外港・黒生・夫婦ヶ鼻堤防が関係者以外立入禁止。漁協サイトは今回取得できなかった

### 銚子マリーナ（#18, #23）— 確認できず
| URL | 本文確認 | 内容 |
|---|---|---|
| https://www.pref.chiba.lg.jp/kouwan/futou/naarai.html | ✅ | 名洗港は千葉県が港湾管理者の地方港（避難港）。運用状況は銚子土木事務所へ問い合わせるよう案内。釣り・立入の記載なし（2026/11/16更新） |
| https://www.pref.chiba.lg.jp/kouwan/shiteikanri/2024/naarai.html | ✅ | 釣り・立入の記載なし |

- 二次資料（未開封）: tsurimap.net/chiba/choshi-marina-teibou
  - 内容: マリーナから伸びる長い堤防とマリーナ内は立入禁止

### 銚子川・利根川（#19, #20, #22）— 部分禁止・条件付き（遊漁券）
| URL | 本文確認 | 内容 |
|---|---|---|
| https://www.pref.mie.lg.jp/SUISAN/HP/86303033603.htm | ✅ | 三重内共第16号「銚子川 あゆ漁業、あめご漁業 銚子川漁協」。漁業権区域での遊漁には遊漁料の納付と遊漁承認証の取得が必要 |
| https://www.pref.chiba.lg.jp/gyoshigen/naisuimen/yuugyo.html | ✅ | 利根川の遊漁料。内共第10号（佐原漁協）は1日200円・1年1,000円、内共第11号は1日300円・1年2,000円（2024/7/25更新） |
| https://www.pref.chiba.lg.jp/suisan/gyogyou/kawazuri/kawazuri.html | ✅ | 漁業権の対象魚種を釣る場合は遊漁承認証（遊漁券）が必要 |
| https://www.pref.chiba.lg.jp/suisan/gyogyou/kawazuri/documents/naisuimengyozyouzu.pdf | ✅ | 利根川の内共第10〜12号の区域は神崎〜銚子大橋 |
| https://www.pref.chiba.lg.jp/suisan/gyogyou/kawazuri/documents/yuugyokisoku.pdf | ✅（スキャン画像を目視） | 佐原漁協の遊漁規則。漁場区域内で遊漁する者は組合の承認を受け、遊漁料を納付する |

- 銚子川は三重県紀北町の河川で、千葉県銚子とは無関係。
- 利根川の2件はいずれも香取市佐原付近の座標で、銚子漁港の規制とは無関係。

### 気仙沼（#5〜#16）
| URL | 本文確認 | 内容 |
|---|---|---|
| https://www.pref.miyagi.jp/soshiki/ks-tihouken-sg/toku3kesennuma.html | ✅ | 特定第3種気仙沼漁港の利用について（2026/11/18更新）。管理者は宮城県と気仙沼市。内容は係留区分とプレジャーボートのみで、釣り・立入禁止の記載なし |
| https://www.pref.miyagi.jp/soshiki/suishin/umiduri.html | ✅ | 海釣りのルール（2026/9/28）。漁業施設周辺の釣り自粛、漁業権対象物（アワビ・ウニ等）の採捕禁止、体長制限。場所を指定した釣り禁止はなし |
| https://www.pref.miyagi.jp/soshiki/ks-tihouken-sg/fukkyuusukeju-ru.html | ✅ | 県管理の11漁港（気仙沼・小鯖・浦の浜・波路上など）。市管理の漁港一覧（大谷・小田浜など）は画像で確認 |
| https://www.pref.miyagi.jp/soshiki/ks-tihouken-sg/kesennumagyokou-fukkyuu.html | ✅ | 大浦の物揚場・防波堤は気仙沼漁港の一部 |
| https://www.pref.miyagi.jp/soshiki/ks-tihouken-sg/genbatatiiri.html | ✅ | 工事中の現場への立入自粛のお願い（2012/9/10）。一時的なもので、恒久的な禁止ではない |
| https://kesennuma-kanko.jp/en/wp-content/uploads/2022/04/【小田の浜海水浴場】海水浴場利用規則（7月15日）.pdf | ✅ | 小田の浜海水浴場の利用規則（2023年版）。第10条で、遊泳区域内と隣接区域での海産物の採捕を禁止。開設期間は 7/15〜9/3 |

- 気仙沼市サイトでは釣り関連のページが見つからなかった（サイト内検索は JavaScript 必須のため未使用）。
- 二次資料（uosoku.com 等）: 魚市場は関係者以外立入禁止。

### 下関漁港（#25）— 確認できず
| URL | 本文確認 | 内容 |
|---|---|---|
| https://www.pref.yamaguchi.lg.jp/uploaded/life/156201_681983_misc.pdf | ✅ | 下関漁港統計年報（令和7年版）。管理者は山口県、特定第3種漁港（南風泊を含む）。釣り・立入の記載なし |
| 山口県の漁港管理条例・規則のPDF（uploaded/attachment/220519.pdf ほか） | ⚠️ | 404 で取得できなかった |

- 二次資料: turi-search.jp、kazetoge.com/22888/
  - 内容: 南風泊は波止・テトラ・外海側の護岸が立入禁止で、港内の一部のみ釣り可

### 田原港（#26）— 禁止の根拠なし
| URL | 本文確認 | 内容 |
|---|---|---|
| https://www.pref.aichi.jp/soshiki/kowan/kowan-kisei.html | ✅ | 愛知県管理港湾の規制概要表（2026年1月現在）。三河港・田原市の行は「放置等禁止区域 ―」「立入制限区域 ―」。条例の禁止行為に釣りは含まれない |
| https://www.pref.aichi.jp/soshiki/mikawa-komu/0000036199.html | ✅ | SOLAS制限区域は神野・船渡・蒲郡地区の岸壁で、田原地区は含まれない。ただし外航船が着岸中の民間埠頭前面30mは制限される |

- 二次資料: uosoku.com
  - 内容: 白谷・片浜の埋立地は立入禁止。私有地やフェンスによる制限の可能性があり、公式の裏付けは見つからなかった

### ダム湖（#27〜#35）
| スポット | URL | 本文確認 | 内容 |
|---|---|---|---|
| 初瀬 | https://www.pref.nara.lg.jp/n144/12718.html ほか | ⚠️ | エラーページが返り、取得できなかった |
| 釜房 | https://www.thr.mlit.go.jp/kamafusa/download/komen.html | ✅ | 湖面は自己責任での自由使用で、届出制。2026/6/15からライフジャケット着用が義務。「冬期間の氷上での魚釣りは…絶対にやらないで下さい」 |
| 釜房 | https://www.thr.mlit.go.jp/kamafusa/img/202606_komenriyou3.pdf | ✅ | 動力船は基本不可。放流施設・取水設備などの通航制限区域には立入不可 |
| 釜房 | https://www.pref.miyagi.jp/soshiki/suishin/yugyoryo.html | ✅ | 広瀬名取川漁協「大倉湖、釜房湖に限る」区分。わかさぎ等が対象で、1日500円 |
| 徳山 | https://fujihashi.info/post-862/ 、/post-891/ 、/post-796/ | ✅ | 「通常は、ダム湖面全域が立ち入り禁止」「魚釣りは厳禁とする」（2026年の開放日ルール）。運営は徳山会館の指定管理者である民間会社で、町や水資源機構の文書ではない |
| 徳山 | https://www.pref.gifu.lg.jp/page/8519.html 、/uploaded/attachment/35697.pdf | ✅ | 県の委員会指示で、塚・門入より上流の支流は全魚種・周年の採捕禁止。湖面は含まれない |
| 徳山 | https://www.pref.gifu.lg.jp/uploaded/attachment/383183.pdf | ✅ | ダム建設で自由漁場（漁業権なし）になった水域への指示である旨と、禁漁区の看板設置の記録 |
| 徳山 | https://www.water.go.jp/chubu/tokuyama/kengaku/index.html | ⚠️ | 接続できなかった |
| 塩原 | https://www.pref.tochigi.lg.jp/h56/hozenkanri/documents/onegai_shiobara.pdf | ✅ | 湖面使用は届出制。6/15〜10/10は使用禁止。堤体から上流約200mは通航禁止。違反は河川法で処罰。釣りそのものの記載なし |
| 塩原 | https://www.pref.tochigi.lg.jp/g02/suisan/documents/r604gyogyouken.pdf 、shiobara240101.pdf | ✅ | 箒川は塩原漁協または那珂川漁連の漁業権区域。遊漁承認と遊漁料が必要 |
| 荒川 | https://www.pref.yamanashi.jp/documents/57627/naiky02_1.pdf | ✅ | 内共第2号の漁場から「荒川の本流及びダムたん水域」（甲府市高成町の基点九〜十二号の間）を除外 |
| 荒川 | https://www.pref.yamanashi.jp/damu-arkw/damu_annai.html | ✅ | ダム周辺施設の案内。釣りの記載なし |
| 白水 | https://www.pref.oita.jp/soshiki/11607/hakusui-info.html | ✅ | 富士緒井路土地改良区が管理する重要文化財。11月下旬〜6月中旬は越流を停止して貯水池内で工事（令和9年まで予定） |
| 白水 | https://www.pref.oita.jp/uploaded/attachment/2275642.pdf | ✅ | 大野川漁協の内共第3号遊漁規則。1日2,200円。禁止区域の表に白水ため池はない |
| 赤川 | https://www.pref.tochigi.lg.jp/g02/suisan/documents/kinugawa323_20241119.pdf | ✅ | 「赤川ダム特別漁場」（宇都宮市福岡町字細野地先）。竿釣・手釣1組まで、組合指定以外の船は使用不可 |

- 二次資料: bunbun.hatenablog.com（初瀬・荒川）
  - 内容: アクセス路に「釣りはしないでください」の看板があった（2015・2017年）

## 調査の過程で見つかったデータとの食い違い（参考・今回は未修正）

指示書のとおり、データは変更していない。別タスクで対応を検討するための材料として記録する。

| slug | 食い違い |
|---|---|
| katsuura-suminawa-breakwater | 白灯台の先端を推奨しているが、二次資料では常時立入禁止とされる場所 |
| choshi-marina-teibo | 二次資料で立入禁止とされる「長い堤防」を釣り場として紹介 |
| tonegawa-lower-unagi | 「無料（遊漁券不要区間）」は、県の遊漁料規定と矛盾する可能性 |
| kagoshima-port | 「フェリーターミナル周辺の岸壁から釣り」は、県の「岸壁は原則立入禁止」と矛盾 |
| tokuyama-dam-gifu / gifu-tokuyama-dam-lake | 「ヘラブナ・コイが釣れる」「遊漁券2,000円」は、湖面立入禁止の告知や自由漁場（漁業権なし）と矛盾。2件は重複の可能性 |
| miyagi-kamafusa-dam-lake / shiobara-* / hakusui-dam-taketa-w6 | `isFree: true` だが遊漁券が必要 |
| shiobara-dam-ko6 | 「日券800円」「ワカサギ」は塩原漁協の規則と合わない。住所の「関谷」はダム所在地の「金沢」とずれている |
| akagawa-dam-yaita-a12 | 所在地は宇都宮市福岡町。「矢板市」、住所、座標が誤り |
| hase-dam-mahoroba | 「遊漁券が必要」「ヘラブナ人気」は、公式資料・二次資料とも裏付けなし |
| kesennuma-shishiori-port-a13 | 「鹿折漁港」という管理漁港は存在しない（実態は気仙沼漁港の区域） |
| oshima-uranohama-beach-a11 | 「大島東側の砂浜」と説明しているが、浦の浜は大島西側の港 |
| kesennuma-oshima-rocky-a10 / -kameyama-rocky-a13 | 同一地点の重複の可能性 |
| shimonoseki-port | 住所・座標（彦島本村町）が、本港（大和町）とも南風泊（彦島西山町）とも一致しない |

## 元データCSV（prohibition_classification_all.csv）との照合

CSVの総数は5,611件。内訳は ok_checked 5,364件、partial 97件、prohibited 90件、unconfirmed 35件、page_note 24件。

### 1. 対象件数の一致
CSVで `category=unconfirmed` の35件は、本調査の対象35件と slug が完全に一致する（過不足なし）。

### 2. CSVの根拠文の誤った割り当て
CSVは地名のキーワードで根拠文をまとめて付けているとみられ、別の場所のスポットに同じ根拠文が付いている。
- **「銚子漁港（外港・黒生・夫婦ヶ鼻）」の根拠文が付いた8件のうち5件は、銚子漁港ではない**
  - choshigawa-river-mie: 三重県紀北町の銚子川
  - tonegawa-lower-unagi / tonegawa-lower-chiba: 香取市佐原付近の利根川
  - choshi-marina-teibo / choshi-marina6: 名洗港（港湾）
  - 銚子漁港の規制とは無関係なので、別々に分類した。
- **「気仙沼漁港の施設エリア」の根拠文が付いた12件のうち、気仙沼漁港の区域は3件だけ**
  - 気仙沼漁港の区域: kesennuma-ko、kesennuma-oura-port-a11、kesennuma-shishiori-port-a13
  - 残り9件: 大島の浦の浜漁港・磯・浜、岩井崎、小鯖漁港、大谷漁港など

### 3. 同じ場所なのに分類が食い違う別スポット（unconfirmed 以外）
本調査の結果を当てはめると、次のスポットも再分類の対象になりうる（今回は調査範囲外のため未変更）。

| slug | 名称 | CSVの分類 | 食い違い |
|---|---|---|---|
| katsuura-kou-e8 | 勝浦港（千葉県勝浦市浜勝浦、35.143, 140.319） | ok_checked | katsuura-port と同じ勝浦漁港。#1・#2 と同様に「確認できず」とするのが整合的 |
| choshi-port | 銚子漁港（銚子市竹町） | page_note | #17・#21・#24 と同じ漁港 |
| kagoshima-shinko | 鹿児島新港 | ok_checked | 県の「港湾の岸壁は原則関係者以外立入禁止」は新港区（奄美・沖縄フェリーターミナル）についての告知の中の記述。#3 と同様に「部分禁止・条件付き」とするのが整合的 |
| hikoshima-hayatomari-w6 | 彦島・南風泊港 | ok_checked | 下関漁港の分港。#25 と同じく「確認できず」とするのが整合的 |
| tonegawa-sawara | 利根川下流（佐原） | ok_checked | #20・#22 と同じ区間で、遊漁券が必要（禁止ではない） |

## 未確認事項と再調査の方法

- **漁協サイト**（勝浦漁協、銚子市漁協、塩原漁協、鬼怒川漁協）、**www.water.go.jp**、**奈良県サイト**、**みちのく公園**は今回本文を取得できなかった。
  - 特に、勝浦・銚子漁港の禁止情報の出どころとされる漁協の掲示を確認できれば、「確認できず」の7件が「部分禁止」以上に確定する可能性がある。
- 下関漁港は、山口県の漁港管理条例・規則の本文の確認が必要。
- 初瀬ダムは奈良県（県土マネジメント部）、荒川ダムは山梨県の荒川ダム管理事務所への問い合わせが確実。
