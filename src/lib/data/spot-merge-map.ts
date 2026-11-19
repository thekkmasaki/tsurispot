// 同一施設の重複ページ統合表（2026-11 全国重複洗い出し 第1弾）。
//
// 敗者 slug → 勝者 slug。deduplicateSpots（spots.ts）の Pass5 で適用され、
// 敗者は fishingSpots から除外・dedupRedirects 経由で勝者へ 301 される
// （sitemap・llms・関連スポット・ランキング等は fishingSpots 由来なので自動で消える）。
// 勝者には敗者の釣れる魚（勝者に無い魚種のみ）とルールを引き継ぐ。
// 施設情報（トイレ・駐車場等）が食い違う場合は勝者側を維持する。
//
// 判定方法: scripts/spot-dedup-candidates.mjs で「500m以内 かつ 名称の核が一致」を抽出 →
// 人手で「同一施設」と判定したものだけを掲載（同じ港の別堤防・港と海岸など別地物は対象外）。
// 勝者選定: scripts/spot-dedup-pick.mjs（出典付き魚種数 → 内部参照数 → 魚種数 → 名称の一般性）。
// 判定記録: scripts/output/dedup-decisions-1.json
export const spotMergeMap: Readonly<Record<string, string>> = {
  "toyohashi-omotehama-surf-e8": "toyohashi-omotehama-add3", // 豊橋・表浜サーフ → 豊橋表浜海岸：表浜海岸と表浜サーフは同じ浜（334m）
  "yawatahama-kou-ooteibou": "ehime-yawatahama-obato-bulk", // 八幡浜市・八幡浜港大堤防 → 八幡浜港大波止：八幡浜港の大堤防＝大波止（同一構造物の呼び分け）
  "hitachinaka-isozaki-kou-a13": "isozaki-kou", // ひたちなか・磯崎港 → 磯崎港：磯崎港の地名接頭辞違い
  "oarai-ko-add2": "oarai-port", // 大洗港（大洗漁港） → 大洗港：大洗港（大洗漁港）は同一港
  "tamano-uno-port": "uno-kou-tamano-w6", // 玉野・宇野港 → 玉野市・宇野港：宇野港の地名接頭辞違い（同住所 玉野市築港）
  "uno-kou-okayama": "uno-kou-tamano-w6", // 宇野港 → 玉野市・宇野港：宇野港の地名接頭辞違い（同住所 玉野市築港）
  "ou-jima-nanjo-w6": "nanjo-oku-island", // 南城・奥武島 → 南城市奥武島：奥武島（南城市）の地名接頭辞違い
  "yomitan-zanpamisaki-a9": "zanpa-misaki-w6", // 読谷村・残波岬 → 残波岬：残波岬の地名接頭辞違い
  "miegusuku-kou-naha-w6": "naha-miegusuku-port", // 那覇・三重城港 → 那覇市三重城港：三重城港の地名接頭辞違い
  "toya-gyokou-a11": "yomitan-toya-port", // 都屋漁港 → 読谷村都屋漁港：都屋漁港の表記違い
  "toya-gyokou-yomitan-a13": "yomitan-toya-port", // 都屋漁港（読谷） → 読谷村都屋漁港：都屋漁港の表記違い
  "hedo-misaki-iso": "hedo-misaki-s8", // 辺戸岬磯 → 辺戸岬：辺戸岬と辺戸岬磯（同じ岬の磯）
  "iwaizumi-omoto-kou": "iwaizumi-omoto-gyokou6", // 岩泉 小本港 → 岩泉小本漁港：小本港＝小本漁港（座標同一）
  "omoto-gyokou-e8": "iwaizumi-omoto-gyokou6", // 小本漁港 → 岩泉小本漁港：小本港＝小本漁港（座標同一）
  "ofunato-sakarigawa-river-a13": "sakarigawa-kakou6", // 大船渡市盛川河口 → 盛川河口：盛川河口の地名接頭辞違い
  "takayama-miyagawa-miyamaebashi-a13": "miyagawa-takayama-a11", // 高山・宮川（宮前橋付近） → 宮川（高山地区）：宮川の高山市街区間（429m）
  "hidagawa-gero-onsen": "hidagawa-gero-gifu", // 飛騨川・下呂温泉 → 飛騨川・下呂温泉エリア：飛騨川・下呂温泉（エリア表記違い）
  "aoshima-gyokou-w5": "aoshima-port", // 青島漁港 → 青島港：青島港＝青島漁港（同住所）
  "nichinan-aburatsu-port": "aburatsu-kou-nichinan", // 日南油津港 → 油津港：油津港の地名接頭辞違い（座標ほぼ同一）
  "oshika-ayukawa-port-a11": "oshika-ayukawa-kou", // 牡鹿半島鮎川漁港 → 牡鹿半島 鮎川港：鮎川港＝鮎川漁港
  "minamisanriku-shizugawa-wharf-a11": "shizugawa-gyokou6", // 南三陸町志津川港 → 志津川漁港：志津川漁港＝志津川港（座標同一）
  "shobuta-kaigan-e8": "shobutada-beach", // 菖蒲田海水浴場 → 菖蒲田海岸：菖蒲田海岸＝菖蒲田海水浴場（座標同一）
  "yuriage-gyokou6": "yuriage-port", // 閖上漁港 → 閖上港：閖上港＝閖上漁港
  "hondo-gyokou-amakusa": "hondo-kou-a11", // 天草 本渡漁港 → 天草・本渡港：本渡港＝本渡漁港（堤防エントリは別扱い）
  "takasaki-karasugawa-wadabashi-a13": "karasugawa-takasaki", // 高崎・烏川（和田橋付近） → 烏川（高崎周辺）：烏川の高崎区間（291m）
  "usui-river-annaka-a10": "usui-gawa", // 碓氷川（安中地区） → 碓氷川：碓氷川の安中区間
  "jounuma-tatebayashi-a11": "jounouma-tsuri6", // 城沼（館林市） → 城沼：城沼（館林）
  "ujina-hatoba-w6": "ujina-kou-hiroshima", // 広島港・宇品波止場 → 広島港宇品：広島港宇品の表記違い
  "takehara-tadanoumi-gyokou-a9": "takehara-tadanoumi-port", // 竹原・忠海漁港 → 竹原市忠海港：忠海港＝忠海漁港
  "tomonoura-port": "tomonoura-hiroshima-w6", // 鞆の浦港 → 鞆の浦：鞆の浦（港・漁港・総称）の表記違い（護岸エントリは別扱い）
  "tomonoura-gyokou-w5": "tomonoura-hiroshima-w6", // 鞆の浦漁港 → 鞆の浦：鞆の浦（港・漁港・総称）の表記違い（護岸エントリは別扱い）
  "fukuyama-tomonoura-a9": "tomonoura-hiroshima-w6", // 福山・鞆の浦 → 鞆の浦：鞆の浦（港・漁港・総称）の表記違い（護岸エントリは別扱い）
  "takamatsu-sunport": "sunport-takamatsu-kagawa", // 高松・サンポート高松周辺 → サンポート高松：サンポート高松の表記違い（護岸エントリは別扱い）
  "sanuki-shido-port": "shido-gyokou-kagawa", // さぬき市志度漁港 → 志度港：志度漁港＝志度港
  "mitoyo-takuma-port": "takuma-port", // 三豊市詫間港 → 詫間港：詫間港の地名接頭辞違い（6m）
  "urado-bay": "kochi-urado-bay", // 浦戸湾 → 高知浦戸湾：浦戸湾の地名接頭辞違い
  "kure-kou-nakatosa-w6": "nakatosa-kure-port", // 中土佐・久礼港 → 中土佐町・久礼港：久礼港＝久礼漁港（座標同一）
  "shima-daiozaki": "daiozaki-mie", // 志摩大王崎 → 大王崎：大王崎の地名接頭辞違い（県概要が「大王崎」を参照するため一般名側を残す）
  "tobishima-katsuura-e8": "tobishima-katsuura-kou", // 飛島勝浦漁港 → 飛島勝浦港：飛島勝浦港＝勝浦漁港
  "shimonoseki-kanmon-c8": "shimonoseki-kanmon-gogan", // 下関・関門海峡釣り場 → 下関・関門海峡護岸：関門海峡（みもすそ川）の護岸表記違い（唐戸の釣り公園は別扱い）
  "hagi-susa-port": "susa-gyokou-yamaguchi-w6", // 萩市須佐漁港 → 須佐漁港：須佐漁港（座標同一）
  "iwakuni-yuu-port": "yuu-kou-iwakuni-w6", // 岩国市由宇港 → 岩国・由宇港：由宇港の地名接頭辞違い（4m）
  "katsuragawa-otsuki": "katsuragawa-otsuki6", // 桂川（大月〜都留） → 桂川（大月付近）：桂川の大月区間（5件が500m以内）
  "katsuragawa-otsuki-tsuru": "katsuragawa-otsuki6", // 桂川（大月・都留） → 桂川（大月付近）：桂川の大月区間（5件が500m以内）
  "katsuragawa-otsuki-e8": "katsuragawa-otsuki6", // 桂川（大月エリア） → 桂川（大月付近）：桂川の大月区間（5件が500m以内）
  "katsuragawa-otsuki-fishing-a10": "katsuragawa-otsuki6", // 桂川（大月地区） → 桂川（大月付近）：桂川の大月区間（5件が500m以内）
  "fuefukigawa-isawa-kofu": "fuefukigawa-isawa6", // 笛吹川（石和・甲府） → 笛吹川（石和付近）：笛吹川の石和区間
  "fuefukigawa-isawa-onsen-a12": "fuefukigawa-isawa6", // 笛吹川（石和温泉地区） → 笛吹川（石和付近）：笛吹川の石和区間
  "biwako-otsu-ko": "biwako-otsu-port", // 琵琶湖大津港 → 琵琶湖大津港周辺：琵琶湖大津港（同住所）
  "uchinoura-kou-s8": "kagoshima-uchinoura-port-bulk", // 内之浦港 → 肝付・内之浦港：内之浦港（座標同一）
  "ogi-kou-niigata": "sado-ogi-port", // 小木港 → 佐渡小木港：佐渡・小木港
  "kaneda-ko": "kaneda-gyokou", // 金田港 → 金田漁港：金田港＝金田漁港（三浦市）
  "mitohama-kaigan-miura-a12": "mito-hama", // 三戸浜海岸（三浦） → 三戸浜：三戸浜（91m）
  "manazuru-kou-iwabashi-a10": "manazuru-port", // 真鶴港（岩大橋付近） → 真鶴港：真鶴港の位置補足表記違い
  "manazuru-mitsuishi-a10": "manazuru-mitsuishi-e8", // 真鶴半島・三ツ石海岸 → 真鶴半島・三ツ石：真鶴半島・三ツ石
  "katase-port": "fujisawa-katase-gyokou-a13", // 片瀬漁港 → 藤沢・片瀬漁港：片瀬漁港の地名接頭辞違い
  "yanagishima-beach": "yanagishima-kaigan-surf", // 柳島海岸 → 柳島海岸サーフ：柳島海岸とそのサーフ（同一の浜）
  "inatori-gyokou": "inatori-port", // 稲取漁港 → 稲取港：稲取港＝稲取漁港（堤防エントリは別扱い）
  "hamanako-maisaka-kou": "hamanako-maisaka-e8", // 浜名湖・舞阪港 → 浜名湖・舞阪漁港：舞阪港＝舞阪漁港
  "futo-port": "futo-gyokou", // 富戸港 → 富戸漁港：富戸港＝富戸漁港（座標同一）
  "hakui-taki-port": "hakui-taki-kou-ishikawa", // 羽咋市滝港 → 羽咋・滝港：羽咋・滝港（3m）
  "iwaibukuro-kou-e8": "iwaibukuro-gyokou", // 岩井袋港 → 岩井袋漁港：岩井袋漁港＝岩井袋港（座標同一）
  "choshi-tokawa-gyokou-a13": "tokawa-gyokou", // 銚子・外川漁港 → 外川漁港：外川漁港の地名接頭辞違い
  "inubosaki-iso-a10": "inubosaki-todaishita-e8", // 犬吠埼灯台下磯 → 犬吠埼灯台下：犬吠埼灯台下の磯
  "misaki-fuke": "fuke-kou-osaka", // 岬町・深日港 → 深日港：深日港＝深日漁港
  "fuke-port": "fuke-kou-osaka", // 深日漁港 → 深日港：深日港＝深日漁港
  "yamatogawa-estuary-tenaga": "yamatogawa-estuary-sakai", // 大和川河口（堺市） → 大和川河口（堺〜松原）：大和川河口（堺側）
  "tannowa-kou": "tannowa-gyoko", // 淡輪港 → 淡輪漁港：淡輪漁港＝淡輪港
  "shiomi-futou-osaka": "izumiotsu-shiomi", // 汐見埠頭（大阪） → 泉大津・汐見埠頭：汐見埠頭（泉大津）
  "kamae-hatozu-gyokou": "oita-kamae-hatozu-port-bulk", // 蒲江・波当津漁港 → 蒲江・波当津港：波当津漁港＝波当津港（座標同一）
  "hiji-kou-a11": "hiji-kou-w6", // 日出港 → 日出・日出港：日出港
  "yonozu-gyokou-w6": "saiki-yonouzu-kou-s8", // 佐伯・米水津漁港 → 佐伯・米水津港：米水津漁港＝米水津港（座標同一）
  "izuhara-kou-a10": "tsushima-izuhara-w6", // 厳原港 → 対馬・厳原港：対馬・厳原港
  "ikitsuki-tateura-port": "ikitsukijima-tateura-a10", // 生月島・舘浦漁港 → 生月島・舘浦港：生月島・舘浦漁港＝舘浦港
  "suwako-wakasagi": "suwako-nagano-add5", // 諏訪湖（ワカサギ） → 諏訪湖：諏訪湖（同住所）
  "natsudomari-kou-tottori-c8": "natsudumari-gyokou-w7", // 夏泊港 → 夏泊漁港：夏泊漁港＝夏泊港（北栄町）
  "tago-gyokou-tottori": "iwami-tago-port", // 田後漁港 → 岩美・田後港：田後港＝田後漁港（座標同一）
  "inasa-no-hama-w6": "izumo-inasa-beach", // 稲佐の浜 → 出雲大社稲佐の浜：稲佐の浜
  "izumo-jushimanohana": "upurui-hana", // 出雲市・十六島鼻 → 十六島鼻：十六島鼻（座標同一）
  "shin-nakagawa-edogawa-a11": "shin-nakagawa6", // 新中川（江戸川区） → 新中川：新中川（江戸川区）
  "shinkiba-koen-e8": "shinkiba-park", // 新木場公園護岸 → 新木場公園：新木場公園とその護岸（同一施設）
  "shinagawa-tennouzu-boardwalk-a13": "tennouzu-unga-a11", // 品川・天王洲運河（ボードウォーク） → 天王洲運河：天王洲運河
  "muya-kou-w6": "tokushima-naruto-muya-bulk", // 撫養港 → 鳴門市・撫養港：撫養港
  "mugi-port": "tokushima-mugi-port-bulk", // 牟岐港 → 牟岐町・牟岐港：牟岐港
  "omoigawa-oyama-a10": "omoigawa-river", // 思川（小山地区） → 思川：思川（小山）
  "chuzenji-trout": "chuzenji-lake-fishing", // 中禅寺湖（トラウト） → 中禅寺湖：中禅寺湖
  "hasegawa-tsuri": "hatsusegawa-river", // 初瀬川 → 初瀬川（大和川上流）：初瀬川（桜井市、129m）
  "ikuji-gyokou-kurobe-a12": "ikuji-gyokou-a9", // 生地漁港（黒部） → 生地漁港：生地漁港
  "obama-inokuma-kaigan": "obama-inokuma-fukui", // 小浜・犬熊海岸 → 小浜・犬熊海水浴場：犬熊海岸＝犬熊海水浴場（座標同一）
  "okibata-gyokou-a10": "okibata-kou-yanagawa-w6", // 沖端漁港 → 柳川・沖端港：沖端港＝沖端漁港
  "mojikou-retro-gogan-w6": "moji-retro-ganpeki-s8", // 門司港レトロ護岸 → 門司港レトロ波止場：門司港レトロの波止場/護岸/岸壁表記違い（同住所）
  "ainoshima-kou": "ainoshima-gyokou-s8", // 相島港 → 相島漁港：相島港＝相島漁港（島内唯一の港）
  "momochihama-kaigan-s8": "momochihama-w6", // 百道浜海岸 → 福岡・百道浜：百道浜海岸（護岸エントリは別扱い）
  "minamisoma-odaka-port-a13": "minamisoma-odaka-gyokou-e8", // 南相馬市小高漁港 → 南相馬小高漁港：南相馬・小高漁港
  "ena-port-a10": "ena-kou", // 江名漁港 → いわき江名港：江名港＝江名漁港
  "awaji-sumoto-port": "sumoto-kou-add4", // 淡路島洲本港 → 洲本港：洲本港
  "tsuna-kou-a10": "tsuna-port-shizuki", // 津名港 → 津名港（志筑）：津名港（志筑）
  "monbetsu-daisan-futou6": "monbetsu-ko-dai3-futo", // 紋別港第3埠頭 → 紋別港第3ふ頭：紋別港第3ふ頭＝第3埠頭
  "wakkanai-dome-breakwater-a10": "wakkanai-kita-bouhatei-dome", // 稚内港北防波堤ドーム周辺 → 稚内港北防波堤ドーム：稚内港北防波堤ドーム
  "ishikaribay-higashi-futo": "ishikari-east-wharf", // 石狩湾新港東ふ頭 → 石狩湾新港東埠頭：石狩湾新港東埠頭＝東ふ頭（同住所）
  "shionomisaki-iso-a13": "shionomisaki-k8", // 潮岬磯 → 潮岬：潮岬の磯
  "hidaka-kou-k8": "gobo-hidaka-port", // 日高港 → 御坊・日高港：日高港（4m、住所表記違い）
  // ---- 第2弾 (1/3): 同一市区町村・同名施設で500m超離れて重複登録（座標誤り由来）----
  "morozaki-fishing-port": "morozaki-port", // 師崎港 → 師崎漁港：同一市区町村の同名施設（6.67km離れて登録）
  "chita-toyohama-port": "toyohama-gyokou-add5", // 知多半島豊浜漁港 → 豊浜漁港：同一市区町村の同名施設（2.261km離れて登録）
  "iyoshi-gunchu-kou-c8": "gunchu-kou-a12", // 伊予市・郡中港 → 郡中港：同一市区町村の同名施設（3.639km離れて登録）
  "misho-gyokou-ainan": "ainan-misho-kou-w6", // 愛南町御荘漁港 → 愛南町・御荘港：同一市区町村の同名施設（0.755km離れて登録）
  "matsuyama-takahama-kou-c8": "ehime-matsuyama-takahama-bulk", // 松山・高浜港 → 松山市・高浜港：同一市区町村の同名施設（1.414km離れて登録）
  "matsuyama-mitsuhama": "mitsuhama-port", // 松山・三津浜港 → 三津浜港：同一市区町村の同名施設（1.394km離れて登録）
  "komoubuchi-kou-w6": "komobuci-gyokou-a12", // 蒋淵港 → 蒋淵漁港：同一市区町村の同名施設（7.397km離れて登録）
  "ainan-fukaura-kou": "ainan-fukaurako", // 愛南町・深浦港 → 愛南町深浦漁港：同一市区町村の同名施設（2.559km離れて登録）
  "miyakubo-kou-oshima-w6": "imabari-oshima-miyakubo-gyokou", // 大島・宮窪港 → 今治市・大島・宮窪漁港：同一市区町村の同名施設（1.671km離れて登録）
  "nagahama-gyokou-ozu-a9": "nagahama-kou-ehime-w6", // 長浜漁港 → 長浜港：同一市区町村の同名施設（10.583km離れて登録）
  "houjou-kou-ehime-w6": "ehime-matsuyama-hojo-bulk", // 北条港 → 松山市・北条港：同一市区町村の同名施設（5.392km離れて登録）
  "matsuyama-hojo-kou-c8": "ehime-matsuyama-hojo-bulk", // 松山・北条港 → 松山市・北条港：同一市区町村の同名施設（5.392km離れて登録）
  "horie-kou-matsuyama-w6": "ehime-matsuyama-horie-bulk", // 松山・堀江港 → 松山市・堀江港：同一市区町村の同名施設（4.636km離れて登録）
  "hitachi-ose-kou": "ose-kou", // 日立会瀬港 → 会瀬港：同一市区町村の同名施設（4.536km離れて登録）
  "nikkawahama-kaigan-a11": "kamisu-nikkawahama6", // 日川浜海岸 → 神栖市日川浜：同一市区町村の同名施設（6.809km離れて登録）
  "shimotsui-gyokou-w5": "shimotsui-kou-w6", // 下津井漁港 → 下津井港：同一市区町村の同名施設（3.791km離れて登録）
  "kurashiki-shimotsui-kou": "shimotsui-kou-w6", // 倉敷・下津井港 → 下津井港：同一市区町村の同名施設（3.791km離れて登録）
  "kasaoka-port": "kasaoka-kou-w6", // 笠岡市笠岡港 → 笠岡港：同一市区町村の同名施設（5.938km離れて登録）
  "kojima-gyokou-w5": "kojima-kou-okayama-w6", // 児島漁港 → 児島港：同一市区町村の同名施設（1.153km離れて登録）
  "shibukawa-kaigan-w5": "shibukawa-kaigan-okayama-w6", // 渋川海水浴場 → 渋川海岸：同一市区町村の同名施設（6.966km離れて登録）
  "tamano-shibukawa-beach": "shibukawa-kaigan-okayama-w6", // 玉野市渋川海岸 → 渋川海岸：同一市区町村の同名施設（6.966km離れて登録）
  "kasaoka-konoura-port": "koujima-sotoura-w6", // 笠岡市神島外浦漁港 → 神島外浦港：同一市区町村の同名施設（9.332km離れて登録）
  "konoshima-sotoura-a12": "koujima-sotoura-w6", // 神島外浦漁港 → 神島外浦港：同一市区町村の同名施設（9.332km離れて登録）
  "kurashiki-mizushima-port": "mizushima-kou-c8", // 倉敷市水島港 → 水島港：同一市区町村の同名施設（10.692km離れて登録）
  "tamano-tai-port": "tai-kou-tamano-w6", // 玉野市田井漁港 → 田井港：同一市区町村の同名施設（3.17km離れて登録）
  "bizen-katakami-port": "bizen-katakami-kou", // 備前市片上港 → 片上港：同一市区町村の同名施設（0.8km離れて登録）
  "honami-gyokou-a13": "bizen-honami-port", // 穂浪漁港 → 備前市穂浪漁港：同一市区町村の同名施設（3.985km離れて登録）
  "nago-kyoda-gyokou-s8": "kyoda-gyokou-a12", // 名護・許田漁港 → 許田漁港：同一市区町村の同名施設（4.893km離れて登録）
  "yomitan-zanpa-cape": "zanpa-misaki-w6", // 読谷残波岬 → 残波岬：同一市区町村の同名施設（3.58km離れて登録）
  "karimata-gyokou-a12": "miyako-karimata-port", // 狩俣漁港 → 宮古島狩俣漁港：同一市区町村の同名施設（0.517km離れて登録）
  "motobu-toguchi-kou": "toguchi-kou-motobu-w6", // 本部町・渡久地港 → 本部・渡久地港（本部半島）：同一市区町村の同名施設（2.485km離れて登録）
  "toya-gyokou-yomitan-w6": "yomitan-toya-port", // 読谷・都屋漁港 → 読谷村都屋漁港：同一市区町村の同名施設（1.077km離れて登録）
  "tomari-port": "naha-tomari-port", // 泊港 → 那覇泊港：同一市区町村の同名施設（0.538km離れて登録）
  "heshikiya-gyokou-a13": "heshikiya-gyokou-uruma-w6", // 平敷屋漁港 → うるま・平敷屋漁港：同一市区町村の同名施設（5.672km離れて登録）
  "hirara-kou-miyako-a10": "miyakojima-hirara-port", // 平良港 → 宮古島平良港：同一市区町村の同名施設（2.466km離れて登録）
  "kunigami-hentona-port": "hentona-gyokou-kunigami-w6", // 国頭村辺土名漁港 → 国頭・辺土名漁港：同一市区町村の同名施設（1.259km離れて登録）
  "miyako-desaki-futo": "miyako-desaki-futou6", // 宮古港出崎ふ頭 → 宮古港出崎埠頭：同一市区町村の同名施設（0.762km離れて登録）
  "miyako-omoe-gyoko": "omoe-gyokou-a9", // 宮古市重茂漁港 → 重茂漁港：同一市区町村の同名施設（4.34km離れて登録）
  "iwaizumi-omoto-gyoko": "iwaizumi-omoto-gyokou6", // 岩泉町小本漁港 → 岩泉小本漁港：同一市区町村の同名施設（2.284km離れて登録）
  "miyako-taro-port": "taro-gyokou6", // 宮古市田老漁港 → 田老漁港：同一市区町村の同名施設（2.303km離れて登録）
  "shimanokoshi-port-a11": "tanohata-shimakoshi-gyoko", // 島越漁港 → 田野畑村島越漁港：同一市区町村の同名施設（5.699km離れて登録）
  "heita-port-a11": "kamaishi-heita-gyoko", // 平田漁港 → 釜石平田漁港：同一市区町村の同名施設（2.662km離れて登録）
  "iorigawa-kou-a10": "miyazaki-kadogawa-iorigawa-port-bulk", // 庵川港 → 門川・庵川港：同一市区町村の同名施設（2.059km離れて登録）
  "kaguchi-hama-a11": "kaguchihama-takanabe-w6", // 蚊口浜 → 高鍋・蚊口浜：同一市区町村の同名施設（1.509km離れて登録）
  "hososhima-kou-w6": "hyuga-hososhima-kou", // 日向・細島港 → 日向市細島港：同一市区町村の同名施設（1.04km離れて登録）
  "hososhima-kou": "hyuga-hososhima-kou", // 細島港 → 日向市細島港：同一市区町村の同名施設（1.04km離れて登録）
  "odotsu-gyokou-a13": "oodotsu-kou", // 大堂津漁港 → 大堂津港：同一市区町村の同名施設（3.274km離れて登録）
  "kushima-toimisaki-iso": "toimisaki-kushima-w6", // 串間市都井岬磯 → 串間・都井岬：同一市区町村の同名施設（2.467km離れて登録）
  "kushima-toimisaki-iso-s8": "toimisaki-kushima-w6", // 串間・都井岬周辺磯 → 串間・都井岬：同一市区町村の同名施設（2.467km離れて登録）
  "toimisaki-iso-a10": "toimisaki-kushima-w6", // 都井岬磯 → 串間・都井岬：同一市区町村の同名施設（2.467km離れて登録）
  "totoro-kou": "totoro-kou-nobeoka-w6", // 土々呂港 → 延岡・土々呂港：同一市区町村の同名施設（3.379km離れて登録）
  "miyazaki-uchinomi-port": "miyazaki-uchiumi-port-bulk", // 宮崎市内海漁港 → 宮崎・内海漁港：同一市区町村の同名施設（1.216km離れて登録）
  "mimitsu-kou-a13": "mimitsu-kou-w6", // 美々津港 → 日向・美々津港：同一市区町村の同名施設（3.521km離れて登録）
  "arahama-gyokou-miyagi": "watari-arahama-gyokou6", // 荒浜漁港 → 亘理荒浜漁港：同一市区町村の同名施設（2.546km離れて登録）
  "arahama-watari-surf-a11": "arahama-surf-miyagi-e8", // 荒浜サーフ（亘理） → 荒浜海岸サーフ：同一市区町村の同名施設（2.546km離れて登録）
  "shizugawa-kou": "shizugawa-gyokou6", // 志津川港 → 志津川漁港：同一市区町村の同名施設（1.393km離れて登録）
  "kesennuma-koizumi-beach-a12": "koizumi-kaigan6", // 気仙沼市小泉海岸 → 小泉海岸：同一市区町村の同名施設（3.143km離れて登録）
  "shichigahama-yogasaki-port-a11": "shichigahama-yogasaki-e8", // 七ヶ浜町代ヶ崎漁港 → 七ヶ浜代ヶ崎漁港：同一市区町村の同名施設（3.133km離れて登録）
  "kesennuma-oya-beach-a12": "ooya-kaigan6", // 気仙沼市大谷海岸 → 大谷海岸：同一市区町村の同名施設（5.261km離れて登録）
  "watanoha-ko": "watanoha-gyokou6", // 渡波港 → 渡波漁港：同一市区町村の同名施設（3.063km離れて登録）
  "ishinomaki-watanoha-port-a11": "watanoha-gyokou6", // 石巻市渡波漁港 → 渡波漁港：同一市区町村の同名施設（3.063km離れて登録）
  "nobiru-beach-a11": "higashimatsushima-nobiru-e8", // 東松島市野蒜海岸 → 東松島野蒜海岸：同一市区町村の同名施設（5.685km離れて登録）
  "amakusa-shimoda-iso-s8": "shimoda-onsen-iso-w6", // 天草・下田温泉周辺磯 → 天草・下田温泉磯：同一市区町村の同名施設（39.1km離れて登録）
  "amakusa-ushibuka-port": "ushibuka-port", // 天草牛深港 → 牛深港：同一市区町村の同名施設（2.409km離れて登録）
  "goshoura-kou-a12": "goshoura-kou-w6", // 御所浦港 → 天草・御所浦港：同一市区町村の同名施設（9.699km離れて登録）
  "amakusa-takahama-gyokou": "takahama-kou-amakusa-w6", // 天草・高浜漁港 → 天草・高浜港：同一市区町村の同名施設（10.881km離れて登録）
  "sakitsu-gyokou-a10": "sakitsu-gyokou-w6", // 崎津漁港 → 天草・崎津漁港：同一市区町村の同名施設（1.176km離れて登録）
  "amakusa-oe-gyokou": "amakusa-oe-kou-s8", // 天草・大江漁港 → 天草・大江港：同一市区町村の同名施設（42.367km離れて登録）
  "amakusa-matsushima-kou-s8": "matsushima-gyokou-amakusa-w6", // 天草・松島港 → 天草・松島漁港：同一市区町村の同名施設（11.563km離れて登録）
  "amakusa-hondo-port": "hondo-kou-a11", // 天草市本渡港 → 天草・本渡港：同一市区町村の同名施設（1.542km離れて登録）
  "yokoshima-gyokou-a13": "fukuyama-yokoshima-port", // 横島漁港 → 福山市横島漁港：同一市区町村の同名施設（3.732km離れて登録）
  "sunami-kou-a11": "mihara-sunami-port", // 須波港 → 三原市須波漁港：同一市区町村の同名施設（4.459km離れて登録）
  "etajima-kirikushi-teibo": "etajima-kirikushi-port", // 江田島市切串港堤防 → 江田島切串港堤防：同一市区町村の同名施設（10.574km離れて登録）
  "ogaki-gyokou-etajima": "etajima-ogaki-port", // 江田島 大柿漁港 → 江田島・大柿港：同一市区町村の同名施設（0.805km離れて登録）
  "tadanoumi-kou-a12": "takehara-tadanoumi-port", // 忠海港 → 竹原市忠海港：同一市区町村の同名施設（2.053km離れて登録）
  "kure-tennou-gogan": "tenno-shore", // 呉市・天応護岸 → 天応護岸：同一市区町村の同名施設（2.792km離れて登録）
  "osakikamijima-shirami-kou": "osakikamijima-shirouzu-port", // 大崎上島・白水港 → 大崎上島町白水港：同一市区町村の同名施設（1.197km離れて登録）
  "mitoyo-awashima-port": "mitoyo-awashima-kou-c8", // 三豊市粟島漁港 → 三豊・粟島港：同一市区町村の同名施設（6.619km離れて登録）
  "takuma-awashima-gyokou-a9": "mitoyo-awashima-kou-c8", // 詫間・粟島漁港 → 三豊・粟島港：同一市区町村の同名施設（6.619km離れて登録）
  "nio-kou-mitoyo-w6": "nio-kou", // 三豊・仁尾港 → 三豊市・仁尾港：同一市区町村の同名施設（8.484km離れて登録）
  "iburi-gyokou-a10": "tosashimizu-iburi", // 以布利漁港 → 土佐清水市以布利港：同一市区町村の同名施設（6.498km離れて登録）
  "kure-gyokou-a10": "nakatosa-kure-port", // 久礼漁港 → 中土佐町・久礼港：同一市区町村の同名施設（2.878km離れて登録）
  "tosashimizu-ashizuri-c8": "ashizuri-misaki-w6", // 土佐清水・足摺岬 → 足摺岬：同一市区町村の同名施設（1.651km離れて登録）
  "shiina-gyokou-a11": "kochi-muroto-shiina-bulk", // 椎名漁港 → 室戸市・椎名漁港：同一市区町村の同名施設（4.41km離れて登録）
  "irino-gyokou-a11": "kuroshio-irino-port", // 入野漁港 → 黒潮町入野漁港：同一市区町村の同名施設（4.732km離れて登録）
  "sukumo-katashima-kou-a9": "katashima-kou-a10", // 宿毛湾・片島港 → 片島港：同一市区町村の同名施設（2.037km離れて登録）
  "susaki-nomi-gyokou-a9": "nomi-gyokou-a10", // 須崎・野見漁港 → 野見漁港：同一市区町村の同名施設（1.68km離れて登録）
  // ---- 第2弾 (2/3): 同一市区町村・同名施設で500m超離れて重複登録（座標誤り由来）----
  "nanaura-gyokou-a10": "kashima-nanaura-gyokou-saga", // 七浦漁港 → 鹿島市七浦漁港：同一市区町村の同名施設（5.145km離れて登録）
  "ouka-gyokou-a13": "ouka-gyokou-w6", // 相賀漁港 → 唐津・相賀漁港：同一市区町村の同名施設（17.624km離れて登録）
  "tara-takezaki-port": "tara-takezaki-gyokou", // 太良町竹崎港 → 太良・竹崎港：同一市区町村の同名施設（8.488km離れて登録）
  "takesaki-gyokou-tara": "tara-takezaki-gyokou", // 竹崎漁港 → 太良・竹崎港：同一市区町村の同名施設（8.488km離れて登録）
  "takezaki-kou-a10": "tara-takezaki-gyokou", // 竹崎港 → 太良・竹崎港：同一市区町村の同名施設（8.488km離れて登録）
  "hama-gyokou-kashima-a11": "kashima-hama-gyokou-w6", // 浜漁港 → 鹿島・浜漁港：同一市区町村の同名施設（3.247km離れて登録）
  "hama-gyokou-kashima-a13": "kashima-hama-gyokou-w6", // 浜漁港（鹿島） → 鹿島・浜漁港：同一市区町村の同名施設（3.247km離れて登録）
  "minato-gyokou-karatsu-a13": "minato-gyokou-karatsu-w6", // 湊漁港（唐津） → 唐津・湊漁港：同一市区町村の同名施設（12.13km離れて登録）
  "shima-wagu-gyokou": "wagu-gyokou-k8", // 志摩・和具漁港 → 和具漁港：同一市区町村の同名施設（2.914km離れて登録）
  "atsumi-gyokou6": "atsumi-kou", // 温海漁港 → 温海港：同一市区町村の同名施設（3.731km離れて登録）
  "kamo-gyokou-yamagata6": "kamo-port-yamagata", // 加茂漁港 → 加茂港：同一市区町村の同名施設（3.587km離れて登録）
  "tsuruoka-kamo-gyokou-e8": "kamo-port-yamagata", // 鶴岡加茂漁港 → 加茂港：同一市区町村の同名施設（3.587km離れて登録）
  "sakata-miyaumi-surf-a12": "miyaumi-beach-a10", // 酒田市宮海海岸サーフ → 酒田宮海海岸：同一市区町村の同名施設（6.862km離れて登録）
  "tsuruoka-katanosawa-e8": "katatoisawa-gyokou", // 鶴岡堅苔沢漁港 → 堅苔沢漁港：同一市区町村の同名施設（16.7km離れて登録）
  "tsuruoka-katanosawa-port-a12": "katatoisawa-gyokou", // 鶴岡市堅苔沢港 → 堅苔沢漁港：同一市区町村の同名施設（16.7km離れて登録）
  "yuza-mega-port-a12": "yuza-mega-gyokou-e8", // 遊佐町女鹿漁港 → 遊佐女鹿漁港：同一市区町村の同名施設（6.961km離れて登録）
  "tsuruoka-kobanato-e8": "kobato-gyokou", // 鶴岡小波渡漁港 → 小波渡漁港：同一市区町村の同名施設（13.243km離れて登録）
  "yuza-fukura-gyokou-e8": "fukura-gyokou", // 遊佐吹浦漁港 → 吹浦漁港：同一市区町村の同名施設（6.617km離れて登録）
  "nezugaseki-gyokou6": "nezugaseki-ko", // 鼠ヶ関漁港 → 鼠ヶ関港：同一市区町村の同名施設（1.617km離れて登録）
  "tsuruoka-wada-gyokou-e8": "wasada-port-a10", // 鶴岡早田漁港 → 早田漁港：同一市区町村の同名施設（26.206km離れて登録）
  "yura-gyokou-yamagata": "tsuruoka-yura-port", // 由良漁港 → 鶴岡市由良漁港：同一市区町村の同名施設（9.876km離れて登録）
  "tsuruoka-yura-gyokou-e8": "tsuruoka-yura-port", // 鶴岡由良漁港 → 鶴岡市由良漁港：同一市区町村の同名施設（9.876km離れて登録）
  "agematsura-gyokou-suooshima": "akage-kou-suooshima-w6", // 周防大島 安下庄漁港 → 周防大島・安下庄港：同一市区町村の同名施設（5.643km離れて登録）
  "suo-oshima-ihotata-port": "suooshima-ihotada-c8", // 周防大島町伊保田漁港 → 周防大島・伊保田港：同一市区町村の同名施設（12.762km離れて登録）
  "hofu-mitajiri-kou": "mitajiri-kou-w6", // 防府・三田尻港 → 防府市・三田尻港：同一市区町村の同名施設（3.984km離れて登録）
  "mitajiri-kou-a12": "mitajiri-kou-w6", // 三田尻港 → 防府市・三田尻港：同一市区町村の同名施設（3.984km離れて登録）
  "murozumi-gyokou-hikari": "hikari-murozumi-kou", // 光市室積漁港 → 光市・室積港：同一市区町村の同名施設（3.769km離れて登録）
  "murozumi-gyokou-a11": "hikari-murozumi-kou", // 室積漁港 → 光市・室積港：同一市区町村の同名施設（3.769km離れて登録）
  "kaminoseki-murotsu-port": "kaminoseki-murotsu-w6", // 上関町室津港 → 上関・室津港：同一市区町村の同名施設（1.835km離れて登録）
  "yamaguchi-aio-kou-c8": "yamaguchi-aio-port", // 山口・秋穂港 → 秋穂漁港：同一市区町村の同名施設（7.549km離れて登録）
  "kogushi-kou-c8": "kogushi-gyokou-w6", // 小串港 → 小串漁港：同一市区町村の同名施設（7.426km離れて登録）
  "sanyo-onoda-habu-port": "sanyo-onoda-habu-kou", // 山陽小野田市埴生港 → 山陽小野田・埴生港：同一市区町村の同名施設（3.267km離れて登録）
  "senzaki-port": "nagato-senzaki-gyokou", // 仙崎港 → 長門・仙崎港：同一市区町村の同名施設（3.678km離れて登録）
  "senzaki-gyokou-yamaguchi": "nagato-senzaki-gyokou", // 仙崎漁港 → 長門・仙崎港：同一市区町村の同名施設（3.678km離れて登録）
  "hagi-ooi-port": "ooi-gyokou-hagi-a13", // 萩市大井漁港 → 大井漁港：同一市区町村の同名施設（17.041km離れて登録）
  "tokuyama-kou-yamaguchi": "tokuyama-kou-w6", // 周南市徳山港 → 周南・徳山港：同一市区町村の同名施設（2.453km離れて登録）
  "akune-kou-s8": "akune-kou-w6", // 阿久根港 → 阿久根・阿久根港：同一市区町村の同名施設（1.304km離れて登録）
  "kaigata-gyokou-tarumizu-w6": "kinkowan-umigata-port", // 垂水・海潟漁港 → 錦江湾海潟漁港：同一市区町村の同名施設（47.744km離れて登録）
  "tarumizu-kaikata-kou-s8": "kinkowan-umigata-port", // 垂水・海潟港 → 錦江湾海潟漁港：同一市区町村の同名施設（47.744km離れて登録）
  "kagoshima-kamoike-port": "kamoike-kou", // 鹿児島・鴨池港 → 鴨池港：同一市区町村の同名施設（1.066km離れて登録）
  "miyanoura-kou-yakushima-a10": "yakushima-miyanoura", // 宮之浦港 → 鹿児島屋久島宮之浦港：同一市区町村の同名施設（10.101km離れて登録）
  "furue-kou-kanoya-w6": "kanoya-furue-port", // 鹿屋・古江港 → 鹿屋市古江港：同一市区町村の同名施設（5.699km離れて登録）
  "kokubu-kou-a11": "kokubu-kou-kirishima-w6", // 国分港 → 霧島・国分港：同一市区町村の同名施設（1.238km離れて登録）
  "satamisaki-iso-s8": "satamisaki-iso", // 佐多岬周辺磯 → 佐多岬磯：同一市区町村の同名施設（1.256km離れて登録）
  "yamagawa-gyokou-a10": "yamagawa-kou-ibusuki-w6", // 山川漁港 → 指宿・山川港：同一市区町村の同名施設（2.838km離れて登録）
  "ibusuki-yamagawa-gyokou-a9": "yamagawa-kou-ibusuki-w6", // 指宿・山川漁港 → 指宿・山川港：同一市区町村の同名施設（2.838km離れて登録）
  "fukiagehama-s8": "fukiage-hama-hioki-w6", // 吹上浜 → 日置・吹上浜：同一市区町村の同名施設（3.357km離れて登録）
  "nishinoomote-kou-a10": "tanegashima-nishinoomote", // 西之表港 → 種子島西之表港：同一市区町村の同名施設（1.008km離れて登録）
  "taniyama-kou-w6": "taniyama-port", // 鹿児島・谷山港 → 谷山港：同一市区町村の同名施設（2.63km離れて登録）
  "uchinoura-kou-kimotsuki-w6": "kagoshima-uchinoura-port-bulk", // 肝付・内之浦港 → 肝付・内之浦漁港：同一市区町村の同名施設（0.534km離れて登録）
  "shimohama-beach-a10": "akita-shimohama-kaigan-e8", // 下浜海岸 → 秋田下浜海岸：同一市区町村の同名施設（3.366km離れて登録）
  "akita-shimohama-surf-a13": "akita-shimohama-kaigan-e8", // 秋田市下浜海岸サーフ → 秋田下浜海岸：同一市区町村の同名施設（3.366km離れて登録）
  "mitane-kamayahama-surf-a12": "mitane-kamayahama-beach-a11", // 三種町釜谷浜サーフ → 三種町釜谷浜海岸：同一市区町村の同名施設（2.907km離れて登録）
  "iwaki-gyokou-akita-e8": "iwaki-kou-akita6", // 岩城漁港 → 岩城港：同一市区町村の同名施設（6.377km離れて登録）
  "yurihonjo-iwaki-port-a12": "iwaki-kou-akita6", // 由利本荘市岩城港 → 岩城港：同一市区町村の同名施設（6.377km離れて登録）
  "konoura-ko": "konoura-gyokou6", // 金浦港 → 金浦漁港：同一市区町村の同名施設（5.566km離れて登録）
  "nikaho-konoura-port": "konoura-gyokou6", // にかほ市金浦漁港 → 金浦漁港：同一市区町村の同名施設（5.566km離れて登録）
  "toga-gyokou": "oga-toga", // 戸賀漁港 → 男鹿・戸賀漁港：同一市区町村の同名施設（8.928km離れて登録）
  "oga-toga-gyokou-e8": "oga-toga", // 男鹿戸賀漁港 → 男鹿・戸賀漁港：同一市区町村の同名施設（8.928km離れて登録）
  "oga-tsubaki-gyokou-e8": "tsubaki-gyokou", // 男鹿椿漁港 → 椿漁港：同一市区町村の同名施設（6.242km離れて登録）
  "happo-hachimori-gyokou-e8": "hachimori-gyokou6", // 八峰町八森漁港 → 八森漁港：同一市区町村の同名施設（3.859km離れて登録）
  "kitaura-gyokou-akita": "kitaura-ko", // 北浦漁港 → 北浦港：同一市区町村の同名施設（8.204km離れて登録）
  "honjou-kou6": "akita-honjoko", // 本荘港 → 秋田本荘港：同一市区町村の同名施設（3.386km離れて登録）
  "yurihonjo-honjo-kou-e8": "akita-honjoko", // 由利本荘本荘港 → 秋田本荘港：同一市区町村の同名施設（3.386km離れて登録）
  "oga-monzen-gyokou": "oga-monzen-gyokou6", // 男鹿半島・門前漁港 → 男鹿門前漁港：同一市区町村の同名施設（3.811km離れて登録）
  "maze-gyokou": "maze-kou-niigata", // 間瀬漁港 → 間瀬港：同一市区町村の同名施設（4.782km離れて登録）
  "sekiya-hama-surf-e8": "sekiya-hama-niigata", // 関屋浜サーフ → 関屋浜：同一市区町村の同名施設（1.416km離れて登録）
  "sado-akadomari-gyokou-a13": "sado-akadomari-kou", // 佐渡・赤泊漁港 → 佐渡・赤泊港：同一市区町村の同名施設（5.328km離れて登録）
  "nou-kou-niigata": "nou-gyoko", // 能生港 → 能生漁港：同一市区町村の同名施設（3.422km離れて登録）
  "sado-ryotsu-kou-niigata": "sado-ryotsu-kou", // 佐渡 両津港周辺 → 佐渡・両津港：同一市区町村の同名施設（0.835km離れて登録）
  "ryotsu-ko-add2": "sado-ryotsu-kou", // 両津港 → 佐渡・両津港：同一市区町村の同名施設（0.835km離れて登録）
  "miura-miyagawa-kou-a13": "miyagawa-ko", // 三浦・宮川港 → 宮川港：同一市区町村の同名施設（0.906km離れて登録）
  "enoura-port": "enoura-gyokou", // 江之浦港 → 江之浦漁港：同一市区町村の同名施設（0.673km離れて登録）
  "sajima-ko": "sajima-gyokou", // 佐島港 → 佐島漁港：同一市区町村の同名施設（1.729km離れて登録）
  "hashirimizu-gyokou": "hashirimizu-ko", // 走水漁港 → 走水港：同一市区町村の同名施設（0.807km離れて登録）
  "bishamon-gyokou-miura-a12": "bishamon-ko", // 毘沙門漁港（三浦） → 毘沙門港：同一市区町村の同名施設（2.831km離れて登録）
  "fukuura-port": "fukuura-gyokou-kanagawa", // 福浦港 → 福浦漁港：同一市区町村の同名施設（4.298km離れて登録）
  "chigasaki-yanagishima-kaigan-a13": "yanagishima-kaigan-surf", // 茅ヶ崎・柳島海岸 → 柳島海岸サーフ：同一市区町村の同名施設（0.784km離れて登録）
  "aomori-okidate-wharf-a10": "aomori-okidate-futo", // 青森港沖館埠頭 → 青森港沖館ふ頭：同一市区町村の同名施設（1.063km離れて登録）
  "kodomari-kou-aomori": "kodomari-gyokou6", // 小泊港 → 小泊漁港：同一市区町村の同名施設（3.081km離れて登録）
  "mutsu-ominato-port-a12": "mutsu-ominato-kou-e8", // むつ市大湊港 → むつ大湊港：同一市区町村の同名施設（2.695km離れて登録）
  "oirase-momoishi-gyoko": "momoishi-gyokou6", // おいらせ町百石漁港 → 百石漁港：同一市区町村の同名施設（2.152km離れて登録）
  "wakinosawa-kou6": "wakinosawa-gyoko", // 脇野沢港 → 脇野沢漁港：同一市区町村の同名施設（26.627km離れて登録）
  "usami-port": "usami-gyokou", // 宇佐美港 → 宇佐美漁港：同一市区町村の同名施設（3.144km離れて登録）
  "heda-kou-numazu-a13": "heda-gyokou", // 戸田港（沼津市） → 戸田港：同一市区町村の同名施設（2.844km離れて登録）
  "miho-kaigan-surf-a10": "miho-kaigan-e8", // 三保海岸サーフ → 三保海岸：同一市区町村の同名施設（3.901km離れて登録）
  "taga-gyokou": "taga-port", // 多賀漁港 → 多賀港：同一市区町村の同名施設（3.503km離れて登録）
  "tago-port": "tago-gyokou", // 田子港 → 田子漁港：同一市区町村の同名施設（5.5km離れて登録）
  "toi-gyokou": "toi-kou", // 土肥漁港 → 土肥港：同一市区町村の同名施設（0.603km離れて登録）
  "yawatano-gyokou": "yahawano-port", // 八幡野漁港 → 八幡野港：同一市区町村の同名施設（2.061km離れて登録）
  "fukude-gyoko-add3": "fukude-port", // 福田漁港 → 福田港：同一市区町村の同名施設（8.267km離れて登録）
  "iwata-fukude-gyokou-a13": "fukude-port", // 磐田・福田漁港 → 福田港：同一市区町村の同名施設（8.267km離れて登録）
  "yui-kou": "yui-gyokou-shizuoka", // 由比港 → 由比漁港：同一市区町村の同名施設（8.007km離れて登録）
  "ushitsu-kou-a9": "noto-ushitsu-kou", // 宇出津港 → 能登・宇出津港：同一市区町村の同名施設（7.324km離れて登録）
  // ---- 第2弾 (3/3): 同一市区町村・同名施設で500m超離れて重複登録（座標誤り由来）----
  "hashidate-kou-a10": "kaga-hashitate-port", // 橋立港 → 橋立漁港：同一市区町村の同名施設（2.875km離れて登録）
  "hakui-chirihama-ishikawa": "chirihama-tsuri", // 羽咋 千里浜 → 千里浜：同一市区町村の同名施設（8.618km離れて登録）
  "noto-chirihama": "chirihama-tsuri", // 能登千里浜 → 千里浜：同一市区町村の同名施設（8.618km離れて登録）
  "mikawa-gyoko-ishikawa": "hakusan-mikawa-gyokou", // 美川漁港 → 白山市 美川漁港：同一市区町村の同名施設（4.398km離れて登録）
  "shika-togi-gyoko": "togi-gyokou", // 志賀町富来漁港 → 志賀・富来漁港：同一市区町村の同名施設（7.63km離れて登録）
  "otohama-kou": "otohama-gyokou", // 乙浜港 → 乙浜漁港：同一市区町村の同名施設（1.139km離れて登録）
  "kamogawa-ko-add2": "kamogawa-kou", // 鴨川港（鴨川漁港） → 鴨川港：同一市区町村の同名施設（0.563km離れて登録）
  "onjuku-iwawada-port-a10": "onjuku-iwawada-kou-e8", // 御宿岩和田漁港 → 御宿岩和田港：同一市区町村の同名施設（1.922km離れて登録）
  "okitsu-port": "okitsu-kou-chiba", // 興津漁港 → 興津港：同一市区町村の同名施設（7.034km離れて登録）
  "katsuura-ko-add2": "katsuura-kou-e8", // 勝浦港（勝浦漁港） → 勝浦港：同一市区町村の同名施設（0.89km離れて登録）
  "katsuyama-gyokou-a9": "katsurama-port", // 勝山漁港 → 勝山港：同一市区町村の同名施設（2.564km離れて登録）
  "ohara-kou-e8": "ohara-port", // 大原港 → 大原漁港：同一市区町村の同名施設（1.223km離れて登録）
  "takeoka-gyokou": "takeoka-port", // 竹岡漁港 → 竹岡港：同一市区町村の同名施設（3.395km離れて登録）
  "iioka-kou-e8": "iioka-port", // 旭市飯岡港 → 飯岡港：同一市区町村の同名施設（5.691km離れて登録）
  "tanigawa-port": "tanigawa-gyokou-osaka", // 谷川港 → 谷川漁港：同一市区町村の同名施設（4.443km離れて登録）
  "usuki-kou-w6": "usuki-port", // 臼杵・臼杵港 → 臼杵港：同一市区町村の同名施設（1.419km離れて登録）
  "kamae-port": "kamae-gyokou-w6", // 蒲江港 → 佐伯・蒲江漁港：同一市区町村の同名施設（11.641km離れて登録）
  "kamae-gyokou": "kamae-gyokou-w6", // 蒲江漁港 → 佐伯・蒲江漁港：同一市区町村の同名施設（11.641km離れて登録）
  "kunisaki-kunimi-port": "kunimi-kou-kunisaki-w6", // 国東市国見港 → 国東・国見港：同一市区町村の同名施設（12.809km離れて登録）
  "morie-kou": "morie-kou-kitsuki-w6", // 守江港 → 杵築・守江港：同一市区町村の同名施設（9.562km離れて登録）
  "morie-gyokou-a11": "morie-kou-kitsuki-w6", // 守江漁港 → 杵築・守江港：同一市区町村の同名施設（9.562km離れて登録）
  "kitsuki-morie-gyokou-a9": "morie-kou-kitsuki-w6", // 杵築・守江漁港 → 杵築・守江港：同一市区町村の同名施設（9.562km離れて登録）
  "matama-gyokou-a12": "bungotakada-matama-kou-s8", // 真玉漁港 → 豊後高田・真玉港：同一市区町村の同名施設（4.175km離れて登録）
  "takedatsu-kou-kunisaki": "kunisaki-taketazu-kou", // 国東市竹田津港 → 国東・竹田津港：同一市区町村の同名施設（11.526km離れて登録）
  "nakatsu-kou": "nakatsu-kou-w6", // 中津港 → 中津・中津港：同一市区町村の同名施設（1.224km離れて登録）
  "beppu-hamawaki-gogan-a13": "hamawaki-gogan-a12", // 別府浜脇護岸 → 浜脇護岸：同一市区町村の同名施設（0.866km離れて登録）
  "yonozu-gyokou-a11": "saiki-yonouzu-kou-s8", // 米水津漁港 → 佐伯・米水津港：同一市区町村の同名施設（12.974km離れて登録）
  "hiji-toyooka-gyokou": "hiji-toyooka-port", // 日出・豊岡漁港 → 日出町豊岡漁港：同一市区町村の同名施設（0.974km離れて登録）
  "gonoura-kou-a10": "iki-gounoura-w6", // 郷ノ浦港 → 壱岐・郷ノ浦港：同一市区町村の同名施設（1.868km離れて登録）
  "hitakatsu-gyokou-a13": "tsushima-hitakatsu-kou-s8", // 比田勝漁港 → 対馬・比田勝港：同一市区町村の同名施設（5.45km離れて登録）
  "goto-fukue-kou": "fukue-kou-w6", // 五島列島・福江港 → 五島・福江港：同一市区町村の同名施設（1.412km離れて登録）
  "yumigahama-surf-c8": "yumigahama-tottori-w6", // 弓ヶ浜サーフ → 弓ヶ浜：同一市区町村の同名施設（5.613km離れて登録）
  "funaiso-port": "funaiso-kou-w6", // 船磯漁港 → 船磯港：同一市区町村の同名施設（14.138km離れて登録）
  "tago-kou-iwami-w6": "iwami-tago-port", // 岩美・田後港 → 岩美町田後港：同一市区町村の同名施設（2.573km離れて登録）
  "hakuto-kaigan-w6": "tottori-hakuto-coast", // 白兎海岸 → 鳥取市白兎海岸：同一市区町村の同名施設（1.02km離れて登録）
  "ajiro-kou-tottori-w6": "ajiro-gyokou-tottori", // 網代港 → 網代漁港：同一市区町村の同名施設（3.186km離れて登録）
  "iwami-ajiro-gyokou": "ajiro-gyokou-tottori", // 岩美町・網代漁港 → 網代漁港：同一市区町村の同名施設（3.186km離れて登録）
  "etomo-kou-w7": "matsue-etomo-port", // 恵曇港 → 松江市恵曇漁港：同一市区町村の同名施設（3.753km離れて登録）
  "etomo-gyokou-shimane": "matsue-etomo-port", // 恵曇漁港 → 松江市恵曇漁港：同一市区町村の同名施設（3.753km離れて登録）
  "sagiura-gyokou-w6": "sagiura-kou-w7", // 鷺浦漁港 → 鷺浦港：同一市区町村の同名施設（6.911km離れて登録）
  "izumo-sagiura-port": "sagiura-kou-w7", // 出雲市鷺浦漁港 → 鷺浦港：同一市区町村の同名施設（6.911km離れて登録）
  "hamada-misumi-port": "misumi-kou-shimane-w6", // 浜田市三隅漁港 → 三隅港：同一市区町村の同名施設（8.173km離れて登録）
  "oki-saigo-kou-w7": "oki-saigo-port", // 隠岐・西郷港 → 隠岐の島西郷港：同一市区町村の同名施設（1.856km離れて登録）
  "izumo-taisha-kou": "izumo-taisha-port", // 出雲・大社港 → 出雲市大社漁港：同一市区町村の同名施設（3.182km離れて登録）
  "gotsu-tsunozu-port": "gotsu-tsunozu-kou-w7", // 江津市都野津漁港 → 江津・都野津港：同一市区町村の同名施設（4.441km離れて登録）
  "tsunozu-kou-a10": "gotsu-tsunozu-kou-w7", // 都野津港 → 江津・都野津港：同一市区町村の同名施設（4.441km離れて登録）
  "katae-gyokou-a13": "matsue-katae-port", // 片江漁港 → 松江市片江漁港：同一市区町村の同名施設（9.77km離れて登録）
  "naruto-kameura-gyokou": "naruto-kameura-w6", // 鳴門・亀浦漁港 → 鳴門・亀浦港：同一市区町村の同名施設（5.499km離れて登録）
  "hiwasa-port": "tokushima-minami-hiwasa-bulk", // 日和佐港 → 美波町・日和佐港：同一市区町村の同名施設（1.99km離れて登録）
  "hiwasa-gyokou-w5": "tokushima-minami-hiwasa-bulk", // 日和佐漁港 → 美波町・日和佐港：同一市区町村の同名施設（1.99km離れて登録）
  "yuki-gyokou-a9": "yuki-kou-w6", // 由岐漁港 → 由岐港：同一市区町村の同名施設（1.863km離れて登録）
  "imizu-shinminato-kou-a10": "shinminato-gyokou-e8", // 射水・新湊漁港 → 射水市・新湊漁港：同一市区町村の同名施設（0.897km離れて登録）
  "fushiki-manyo-futo": "fushiki-manyou-futo", // 伏木万葉ふ頭 → 伏木万葉埠頭：同一市区町村の同名施設（0.662km離れて登録）
  "otomi-gyoko": "otomi-kou", // 音海漁港 → 音海港：同一市区町村の同名施設（3.897km離れて登録）
  "irohama-kaigan-tsuruga-a12": "tsuruga-irohama-fukui", // 色浜海岸（敦賀） → 敦賀色浜：同一市区町村の同名施設（3.959km離れて登録）
  "ooi-oshima-gyokou-a11": "ooi-oshima-gyoko", // おおい町・大島漁港 → おおい町大島漁港：同一市区町村の同名施設（6.32km離れて登録）
  "umeura-gyokou-echizen-a9": "echizen-umeura-gyokou", // 梅浦漁港 → 越前海岸 梅浦漁港：同一市区町村の同名施設（2.959km離れて登録）
  "kanezaki-gyokou-w6": "kanezaki-gyokou", // 宗像・鐘崎漁港 → 鐘崎漁港：同一市区町村の同名施設（4.954km離れて登録）
  "munakata-kanezaki-port": "kanezaki-gyokou", // 宗像・鐘崎港 → 鐘崎漁港：同一市区町村の同名施設（4.954km離れて登録）
  "nishiura-gyokou-fukuoka": "nishiura-gyokou-itoshima-w6", // 西浦漁港 → 糸島・西浦漁港：同一市区町村の同名施設（5.402km離れて登録）
  "minoshima-gyokou-fukuoka-a10": "minoshima-gyokou-w6", // 蓑島漁港 → 行橋・蓑島漁港：同一市区町村の同名施設（2.224km離れて登録）
  "nokita-gyokou-a10": "nogi-gyokou-itoshima-w6", // 野北漁港 → 糸島野北漁港：同一市区町村の同名施設（5.087km離れて登録）
  "soma-isobe-port-a13": "soma-isobe-gyokou-e8", // 相馬市磯部漁港 → 相馬磯部漁港：同一市区町村の同名施設（2.545km離れて登録）
  "iwaki-nagasaki-beach-a12": "iwaki-nagasaki-kaigan-e8", // いわき市永崎海岸 → いわき永崎海岸：同一市区町村の同名施設（6.474km離れて登録）
  "iwaki-nagasaki-surf-a13": "iwaki-nagasaki-kaigan-e8", // いわき市永崎海岸サーフ → いわき永崎海岸：同一市区町村の同名施設（6.474km離れて登録）
  "harakama-port-a10": "soma-haranokama-e8", // 原釜漁港 → 相馬原釜漁港：同一市区町村の同名施設（1.984km離れて登録）
  "iwaki-ena-kou-e8": "ena-kou", // いわき江名港 → 江名港：同一市区町村の同名施設（7.99km離れて登録）
  "iwaki-ena-port": "ena-kou", // いわき市江名港 → 江名港：同一市区町村の同名施設（7.99km離れて登録）
  "iwaki-onahama-port": "onahama-ko", // いわき小名浜港 → 小名浜港：同一市区町村の同名施設（2.29km離れて登録）
  "onahama-ichigou-futo-e8": "onahama-ichigou-futou6", // 小名浜港1号ふ頭 → 小名浜港1号埠頭：同一市区町村の同名施設（0.706km離れて登録）
  "iwaki-shinmaiko-surf-a12": "iwaki-shinmaiko6", // いわき市新舞子海岸サーフ → いわき新舞子海岸：同一市区町村の同名施設（23.579km離れて登録）
  "iwaki-nakanosaku-kou-e8": "nakanosaku-kou", // いわき中之作港 → 中之作港：同一市区町村の同名施設（6.408km離れて登録）
  "iwaki-nakanosaku-port-a10": "nakanosaku-kou", // いわき市中之作漁港 → 中之作港：同一市区町村の同名施設（6.408km離れて登録）
  "usuiso-beach-a10": "iwaki-usuiso-kaigan-e8", // 薄磯海岸 → いわき薄磯海岸：同一市区町村の同名施設（6.997km離れて登録）
  "iwaki-usuiso-surf-a13": "iwaki-usuiso-kaigan-e8", // いわき市薄磯海岸サーフ → いわき薄磯海岸：同一市区町村の同名施設（6.997km離れて登録）
  "iwaki-toyoma-surf-a12": "iwaki-toyoma-kaigan-e8", // いわき市豊間海岸サーフ → いわき豊間海岸：同一市区町村の同名施設（2.05km離れて登録）
  "nakoso-kou": "iwaki-nakoso-port", // 勿来港 → いわき市勿来港：同一市区町村の同名施設（3.344km離れて登録）
  "iwaki-nakoso-kou-e8": "iwaki-nakoso-port", // いわき勿来港 → いわき市勿来港：同一市区町村の同名施設（3.344km離れて登録）
  "iwaki-nakoso-kaigan-e8": "nakoso-kaigan6", // いわき勿来海岸 → 勿来海岸：同一市区町村の同名施設（3.344km離れて登録）
  "shikama-kou-a13": "himeji-shikama-port", // 飾磨港 → 姫路飾磨港：同一市区町村の同名施設（0.545km離れて登録）
  "awaji-gunge-gyokou-k8": "awaji-gunge-kou-k8", // 淡路島・郡家漁港 → 淡路島・郡家港：同一市区町村の同名施設（1.381km離れて登録）
  "muroran-itanki-surf-a13": "muroran-itanki-hama-e8", // 室蘭イタンキ浜サーフ → 室蘭イタンキ浜：同一市区町村の同名施設（3.996km離れて登録）
  "muroran-sakimori-futo-e8": "muroran-sakimori-futou6", // 室蘭港崎守ふ頭 → 室蘭港崎守埠頭：同一市区町村の同名施設（1.172km離れて登録）
  "hakodate-mandai-wharf-a10": "hakodate-bandai-futo-e8", // 函館港万代埠頭 → 函館港万代ふ頭：同一市区町村の同名施設（1.244km離れて登録）
  "hiroo-tokachi-port-a12": "tokachi-kou6", // 広尾町十勝港 → 十勝港：同一市区町村の同名施設（0.796km離れて登録）
  "kada-gyoko": "kada-port-detail", // 加太漁港 → 加太港：同一市区町村の同名施設（0.692km離れて登録）
  "tenjinzaki-a13": "tanabe-tenjinzaki", // 天神崎 → 田辺・天神崎：同一市区町村の同名施設（1.429km離れて登録）
  "katakami-kou-w6": "bizen-katakami-kou", // GSC直近3か月クリック 3 < 統合元 41 のため勝者を入れ替え（2026-11）
  "aburatsu-port": "aburatsu-kou-nichinan", // GSC直近3か月クリック 11 < 統合元 33 のため勝者を入れ替え（2026-11）
  "hondo-kou-amakusa-w6": "hondo-kou-a11", // GSC直近3か月クリック 0 < 統合元 54 のため勝者を入れ替え（2026-11）
  "tomonoura-sensui-gokan": "tomonoura-sensuijima-c8", // GSC直近3か月クリック 17 < 統合元 38 のため勝者を入れ替え（2026-11）
  "kochi-nakatosa-kure-bulk": "nakatosa-kure-port", // GSC直近3か月クリック 13 < 統合元 69 のため勝者を入れ替え（2026-11）
  "saga-karatsu-kotomo-bulk": "otomo-gyokou", // GSC直近3か月クリック 12 < 統合元 32 のため勝者を入れ替え（2026-11）
  "karatsu-higashinohama-w6": "karatsu-higashinohama", // GSC直近3か月クリック 15 < 統合元 43 のため勝者を入れ替え（2026-11）
  "sakata-honko-quay-a13": "sakata-honko-wharf-a10", // GSC直近3か月クリック 4 < 統合元 48 のため勝者を入れ替え（2026-11）
  "nijigahama-hikari-w6": "hikari-nijigahama-c8", // GSC直近3か月クリック 14 < 統合元 59 のため勝者を入れ替え（2026-11）
  "uchinada-kaigan": "uchinada-kaigan-surf-e8", // GSC直近3か月クリック 3 < 統合元 36 のため勝者を入れ替え（2026-11）
  "akasaki-kou-w6": "akasaki-gyokou-tottori", // GSC直近3か月クリック 27 < 統合元 68 のため勝者を入れ替え（2026-11）
  "moji-retro-wharf": "moji-retro-ganpeki-s8", // GSC直近3か月クリック 13 < 統合元 49 のため勝者を入れ替え（2026-11）
  "hakozaki-futo-s8": "hakozaki-futou-a12", // GSC直近3か月クリック 34 < 統合元 86 のため勝者を入れ替え（2026-11）
  "shakotan-bikuni-port": "bikuni-gyoko", // GSC直近3か月クリック 8 < 統合元 85 のため勝者を入れ替え（2026-11）
  "misaki-gyokou-sadamisaki-a9": "ehime-ikata-misaki-bulk", // GSC直近3か月クリック 5 < 統合元 38 のため勝者を入れ替え（2026-11）
  "okinawa-motobu-toguchi-bulk": "toguchi-kou-motobu-w6", // GSC直近3か月クリック 14 < 統合元 56 のため勝者を入れ替え（2026-11）
  "ofunato-nonoda-wharf-a10": "ofunato-nonoda-futo", // GSC直近3か月クリック 2 < 統合元 42 のため勝者を入れ替え（2026-11）
  "jodogahama-rocky-a10": "miyako-jodogahama", // GSC直近3か月クリック 2 < 統合元 49 のため勝者を入れ替え（2026-11）
  "oura-yamada-port-a11": "yamada-oura-gyoko", // GSC直近3か月クリック 21 < 統合元 86 のため勝者を入れ替え（2026-11）
  "shido-kou-w6": "shido-gyokou-kagawa", // GSC直近3か月クリック 16 < 統合元 49 のため勝者を入れ替え（2026-11）
  "murumoto-kou-w6": "kanonji-muromoto-port", // GSC直近3か月クリック 2 < 統合元 33 のため勝者を入れ替え（2026-11）
  "kagawa-mitoyo-nio-bulk": "nio-kou", // GSC直近3か月クリック 28 < 統合元 105 のため勝者を入れ替え（2026-11）
  "saga-tara-takezaki-bulk": "tara-takezaki-gyokou", // GSC直近3か月クリック 0 < 統合元 39 のため勝者を入れ替え（2026-11）
  "sakata-miyaumi-kaigan-e8": "miyaumi-beach-a10", // GSC直近3か月クリック 7 < 統合元 38 のため勝者を入れ替え（2026-11）
  "sanze-gyokou6": "tsuruoka-sanze-gyokou-e8", // GSC直近3か月クリック 18 < 統合元 40 のため勝者を入れ替え（2026-11）
  "aio-gyokou-w6": "yamaguchi-aio-port", // GSC直近3か月クリック 3 < 統合元 98 のため勝者を入れ替え（2026-11）
  "senzaki-kou-w6": "nagato-senzaki-gyokou", // GSC直近3か月クリック 0 < 統合元 91 のため勝者を入れ替え（2026-11）
  "anbo-kou-a12": "yakushima-anbo-port", // GSC直近3か月クリック 5 < 統合元 44 のため勝者を入れ替え（2026-11）
  "minami-satsuma-kasasa-kou-s8": "minami-satsuma-kasasa-port", // GSC直近3か月クリック 4 < 統合元 37 のため勝者を入れ替え（2026-11）
  "iwadate-port-a10": "happo-iwadate-gyokou-e8", // GSC直近3か月クリック 0 < 統合元 32 のため勝者を入れ替え（2026-11）
  "arahama-kou-niigata": "kashiwazaki-arahama-gyokou-a13", // GSC直近3か月クリック 3 < 統合元 40 のため勝者を入れ替え（2026-11）
  "hachinohe-ferry-futou6": "hachinohe-ferry-futo", // GSC直近3か月クリック 28 < 統合元 58 のため勝者を入れ替え（2026-11）
  "dekishima-beach-a11": "tsugaru-dekishima-surf-a12", // GSC直近3か月クリック 10 < 統合元 46 のため勝者を入れ替え（2026-11）
  "heda-ko": "heda-gyokou", // GSC直近3か月クリック 25 < 統合元 55 のため勝者を入れ替え（2026-11）
  "hashidate-gyoko": "kaga-hashitate-port", // GSC直近3か月クリック 13 < 統合元 80 のため勝者を入れ替え（2026-11）
  "shika-togi-gyokou": "togi-gyokou", // GSC直近3か月クリック 1 < 統合元 69 のため勝者を入れ替え（2026-11）
  "koiwai-gyokou-a11": "nakatsu-koiwai-kou-s8", // GSC直近3か月クリック 9 < 統合元 32 のため勝者を入れ替え（2026-11）
  "ainoura-kou-a12": "sasebo-ainoura-kou-s8", // GSC直近3か月クリック 12 < 統合元 46 のため勝者を入れ替え（2026-11）
  "mochiishi-kaigan-a11": "masuda-mochiishi-kaigan", // GSC直近3か月クリック 5 < 統合元 33 のため勝者を入れ替え（2026-11）
  "nishizu-kou": "nishitsu-gyoko", // GSC直近3か月クリック 27 < 統合元 56 のため勝者を入れ替え（2026-11）
  "hinata-gyokou-mihama-a9": "mihama-higa-gyokou", // GSC直近3か月クリック 20 < 統合元 52 のため勝者を入れ替え（2026-11）
  "takahama-wada-gyokou": "wada-gyoko-takahama", // GSC直近3か月クリック 19 < 統合元 43 のため勝者を入れ替え（2026-11）
  "unoshima-kou-w6": "unoshima-kou-a11", // GSC直近3か月クリック 12 < 統合元 34 のため勝者を入れ替え（2026-11）
  "itoshima-nokita-port": "nogi-gyokou-itoshima-w6", // GSC直近3か月クリック 5 < 統合元 85 のため勝者を入れ替え（2026-11）
  "shibayama-port": "shibayama-gyokou-hyogo", // GSC直近3か月クリック 12 < 統合元 38 のため勝者を入れ替え（2026-11）
  "okura-kaigan": "akashi-okura-coast", // GSC直近3か月クリック 11 < 統合元 41 のため勝者を入れ替え（2026-11）
  "awaji-kariya-gyokou-a13": "awaji-kariya-gyokou-k8", // GSC直近3か月クリック 6 < 統合元 32 のため勝者を入れ替え（2026-11）
  "shizuura-port": "shizuura-gyokou", // GSC直近3か月クリック 11 < 統合元 68 のため勝者を入れ替え（2026-11）
  // 2026-11 UX監査: 兵庫県ページで同じ場所が別名で複数回出ていた（「淡路島・」接頭辞違い）。
  // 名称が5文字未満のため自動判定（isSameSpotName）の対象外。勝者は一般名・魚種数の多い側。
  "awaji-nushima-k8": "nushima", // 淡路島・沼島 → 沼島：同じ島（同住所 南あわじ市沼島）。沼島漁港は港単体のため別扱い
  "awaji-tsubasa-kou-k8": "tsubasa-port", // 淡路島・翼港 → 翼港：淡路交流の翼港（夢舞台）。統合元は住所が岩屋で約3kmずれて登録
  "awaji-fukura-kou-k8": "fukura-kou", // 淡路島・福良港 → 福良港：同一港（南あわじ市福良）。福良港護岸は別扱い
  "amagasaki-tsuuri-park-k8": "amagasaki-fishing-park", // 尼崎魚つり公園 → 尼崎市立魚つり公園：同一施設（尼崎市平左衛門町）。統合元は座標が約2kmずれて登録
  "hekinan-umitsuri-park": "hekinan-fishing-park", // 碧南海釣り公園 → 碧南海釣り広場：「公園」は同じ無料の釣り広場の別称（碧南市公式）。有料（大人500円）・竿レンタルありの記載は実在しない施設の情報だった
};
