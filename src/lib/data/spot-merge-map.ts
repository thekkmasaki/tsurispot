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
  "bizen-katakami-kou": "katakami-kou-w6", // 備前・片上港 → 片上港：片上港の地名接頭辞違い
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
  "aburatsu-kou-nichinan": "aburatsu-port", // 日南市油津港 → 油津港：油津港の地名接頭辞違い（座標ほぼ同一）
  "nichinan-aburatsu-port": "aburatsu-port", // 日南油津港 → 油津港：油津港の地名接頭辞違い（座標ほぼ同一）
  "oshika-ayukawa-port-a11": "oshika-ayukawa-kou", // 牡鹿半島鮎川漁港 → 牡鹿半島 鮎川港：鮎川港＝鮎川漁港
  "minamisanriku-shizugawa-wharf-a11": "shizugawa-gyokou6", // 南三陸町志津川港 → 志津川漁港：志津川漁港＝志津川港（座標同一）
  "shobuta-kaigan-e8": "shobutada-beach", // 菖蒲田海水浴場 → 菖蒲田海岸：菖蒲田海岸＝菖蒲田海水浴場（座標同一）
  "yuriage-gyokou6": "yuriage-port", // 閖上漁港 → 閖上港：閖上港＝閖上漁港
  "hondo-gyokou-amakusa": "hondo-kou-amakusa-w6", // 天草 本渡漁港 → 天草・本渡港：本渡港＝本渡漁港（堤防エントリは別扱い）
  "hondo-kou-a11": "hondo-kou-amakusa-w6", // 本渡港 → 天草・本渡港：本渡港＝本渡漁港（堤防エントリは別扱い）
  "takasaki-karasugawa-wadabashi-a13": "karasugawa-takasaki", // 高崎・烏川（和田橋付近） → 烏川（高崎周辺）：烏川の高崎区間（291m）
  "usui-river-annaka-a10": "usui-gawa", // 碓氷川（安中地区） → 碓氷川：碓氷川の安中区間
  "jounuma-tatebayashi-a11": "jounouma-tsuri6", // 城沼（館林市） → 城沼：城沼（館林）
  "ujina-hatoba-w6": "ujina-kou-hiroshima", // 広島港・宇品波止場 → 広島港宇品：広島港宇品の表記違い
  "takehara-tadanoumi-gyokou-a9": "takehara-tadanoumi-port", // 竹原・忠海漁港 → 竹原市忠海港：忠海港＝忠海漁港
  "tomonoura-port": "tomonoura-hiroshima-w6", // 鞆の浦港 → 鞆の浦：鞆の浦（港・漁港・総称）の表記違い（護岸エントリは別扱い）
  "tomonoura-gyokou-w5": "tomonoura-hiroshima-w6", // 鞆の浦漁港 → 鞆の浦：鞆の浦（港・漁港・総称）の表記違い（護岸エントリは別扱い）
  "fukuyama-tomonoura-a9": "tomonoura-hiroshima-w6", // 福山・鞆の浦 → 鞆の浦：鞆の浦（港・漁港・総称）の表記違い（護岸エントリは別扱い）
  "tomonoura-sensuijima-c8": "tomonoura-sensui-gokan", // 鞆の浦・仙酔島渡船場 → 鞆の浦仙酔島渡船場護岸：仙酔島渡船場の護岸表記違い
  "takamatsu-sunport": "sunport-takamatsu-kagawa", // 高松・サンポート高松周辺 → サンポート高松：サンポート高松の表記違い（護岸エントリは別扱い）
  "sanuki-shido-port": "shido-kou-w6", // さぬき市志度漁港 → 志度港：志度漁港＝志度港
  "mitoyo-takuma-port": "takuma-port", // 三豊市詫間港 → 詫間港：詫間港の地名接頭辞違い（6m）
  "urado-bay": "kochi-urado-bay", // 浦戸湾 → 高知浦戸湾：浦戸湾の地名接頭辞違い
  "nakatosa-kure-port": "kochi-nakatosa-kure-bulk", // 中土佐町久礼漁港 → 中土佐町・久礼港：久礼港＝久礼漁港（座標同一）
  "kure-kou-nakatosa-w6": "kochi-nakatosa-kure-bulk", // 中土佐・久礼港 → 中土佐町・久礼港：久礼港＝久礼漁港（座標同一）
  "otomo-gyokou": "saga-karatsu-kotomo-bulk", // 小友漁港 → 唐津・小友漁港：小友漁港（唐津市呼子町）。一方の住所が誤り
  "karatsu-higashinohama": "karatsu-higashinohama-w6", // 唐津東の浜海水浴場 → 唐津・東の浜：唐津・東の浜の表記違い
  "shima-daiozaki": "daiozaki-mie", // 志摩大王崎 → 大王崎：大王崎の地名接頭辞違い（県概要が「大王崎」を参照するため一般名側を残す）
  "tobishima-katsuura-e8": "tobishima-katsuura-kou", // 飛島勝浦漁港 → 飛島勝浦港：飛島勝浦港＝勝浦漁港
  "sakata-honko-wharf-a10": "sakata-honko-quay-a13", // 酒田本港埠頭 → 酒田市本港岸壁：酒田本港の埠頭/岸壁表記違い（同住所）
  "shimonoseki-kanmon-c8": "shimonoseki-kanmon-gogan", // 下関・関門海峡釣り場 → 下関・関門海峡護岸：関門海峡（みもすそ川）の護岸表記違い（唐戸の釣り公園は別扱い）
  "hagi-susa-port": "susa-gyokou-yamaguchi-w6", // 萩市須佐漁港 → 須佐漁港：須佐漁港（座標同一）
  "hikari-nijigahama-c8": "nijigahama-hikari-w6", // 光市・虹ヶ浜海岸 → 光市・虹ヶ浜：虹ヶ浜の表記違い
  "iwakuni-yuu-port": "yuu-kou-iwakuni-w6", // 岩国市由宇港 → 岩国・由宇港：由宇港の地名接頭辞違い（4m）
  "katsuragawa-otsuki": "katsuragawa-otsuki6", // 桂川（大月〜都留） → 桂川（大月付近）：桂川の大月区間（5件が500m以内）
  "katsuragawa-otsuki-tsuru": "katsuragawa-otsuki6", // 桂川（大月・都留） → 桂川（大月付近）：桂川の大月区間（5件が500m以内）
  "katsuragawa-otsuki-e8": "katsuragawa-otsuki6", // 桂川（大月エリア） → 桂川（大月付近）：桂川の大月区間（5件が500m以内）
  "katsuragawa-otsuki-fishing-a10": "katsuragawa-otsuki6", // 桂川（大月地区） → 桂川（大月付近）：桂川の大月区間（5件が500m以内）
  "fuefukigawa-isawa-kofu": "fuefukigawa-isawa6", // 笛吹川（石和・甲府） → 笛吹川（石和付近）：笛吹川の石和区間
  "fuefukigawa-isawa-onsen-a12": "fuefukigawa-isawa6", // 笛吹川（石和温泉地区） → 笛吹川（石和付近）：笛吹川の石和区間
  "biwako-otsu-ko": "biwako-otsu-port", // 琵琶湖大津港 → 琵琶湖大津港周辺：琵琶湖大津港（同住所）
  "uchinoura-kou-s8": "uchinoura-kou-kimotsuki-w6", // 内之浦港 → 肝付・内之浦港：内之浦港（座標同一）
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
  "uchinada-kaigan-surf-e8": "uchinada-kaigan", // 内灘海岸サーフ → 内灘海岸：内灘海岸とそのサーフ
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
  "akasaki-gyokou-tottori": "akasaki-kou-w6", // 赤碕漁港 → 赤碕港：赤碕港＝赤碕漁港
  "tago-gyokou-tottori": "tago-kou-iwami-w6", // 田後漁港 → 岩美・田後港：田後港＝田後漁港（座標同一）
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
  "mojikou-retro-gogan-w6": "moji-retro-wharf", // 門司港レトロ護岸 → 門司港レトロ波止場：門司港レトロの波止場/護岸/岸壁表記違い（同住所）
  "moji-retro-ganpeki-s8": "moji-retro-wharf", // 門司港レトロ岸壁 → 門司港レトロ波止場：門司港レトロの波止場/護岸/岸壁表記違い（同住所）
  "ainoshima-kou": "ainoshima-gyokou-s8", // 相島港 → 相島漁港：相島港＝相島漁港（島内唯一の港）
  "hakozaki-futou-a12": "hakozaki-futo-s8", // 箱崎埠頭 → 箱崎ふ頭：箱崎ふ頭＝箱崎埠頭
  "momochihama-kaigan-s8": "momochihama-w6", // 百道浜海岸 → 福岡・百道浜：百道浜海岸（護岸エントリは別扱い）
  "minamisoma-odaka-port-a13": "minamisoma-odaka-gyokou-e8", // 南相馬市小高漁港 → 南相馬小高漁港：南相馬・小高漁港
  "ena-port-a10": "iwaki-ena-kou-e8", // 江名漁港 → いわき江名港：江名港＝江名漁港
  "awaji-sumoto-port": "sumoto-kou-add4", // 淡路島洲本港 → 洲本港：洲本港
  "tsuna-kou-a10": "tsuna-port-shizuki", // 津名港 → 津名港（志筑）：津名港（志筑）
  "monbetsu-daisan-futou6": "monbetsu-ko-dai3-futo", // 紋別港第3埠頭 → 紋別港第3ふ頭：紋別港第3ふ頭＝第3埠頭
  "wakkanai-dome-breakwater-a10": "wakkanai-kita-bouhatei-dome", // 稚内港北防波堤ドーム周辺 → 稚内港北防波堤ドーム：稚内港北防波堤ドーム
  "bikuni-gyoko": "shakotan-bikuni-port", // 美国漁港 → 積丹美国港：美国港＝美国漁港（41m）
  "ishikaribay-higashi-futo": "ishikari-east-wharf", // 石狩湾新港東ふ頭 → 石狩湾新港東埠頭：石狩湾新港東埠頭＝東ふ頭（同住所）
  "shionomisaki-iso-a13": "shionomisaki-k8", // 潮岬磯 → 潮岬：潮岬の磯
  "hidaka-kou-k8": "gobo-hidaka-port", // 日高港 → 御坊・日高港：日高港（4m、住所表記違い）
};
