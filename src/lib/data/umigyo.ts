/**
 * 水産庁 海業推進地区データ（令和6年54地区 + 令和7年32地区 = 全86地区）
 * 参考: 水産庁「海業振興についての取組」
 * https://www.jfa.maff.go.jp/j/keikaku/230718.html
 */

export interface UmigyoDistrict {
  /** 一意なID */
  id: string;
  /** 漁港名 */
  portName: string;
  /** 都道府県 */
  prefecture: string;
  /** 市区町村 */
  city: string;
  /** 海業振興モデル地区かどうか */
  isModelDistrict: boolean;
  /** 取組内容 */
  activities: string[];
  /** 概要説明 */
  description: string;
}

export const umigyoDistricts: UmigyoDistrict[] = [
  // ===== 北海道 =====
  {
    id: "hokkaido-habomai",
    portName: "歯舞漁港",
    prefecture: "北海道",
    city: "根室市",
    isModelDistrict: false,
    activities: ["水産物直売", "漁業体験", "食文化発信"],
    description: "北海道最東端の漁港。花咲ガニや秋サケなど豊かな水産資源を活かした直売・体験型の海業を推進。",
  },
  {
    id: "hokkaido-suttsu",
    portName: "寿都漁港",
    prefecture: "北海道",
    city: "寿都町",
    isModelDistrict: true,
    activities: ["釣り体験", "水産加工体験", "観光拠点化"],
    description: "日本海に面した歴史ある漁港。モデル地区として釣り体験や水産加工見学を通じた観光連携を先導。",
  },
  {
    id: "hokkaido-sakazuki",
    portName: "盃漁港",
    prefecture: "北海道",
    city: "泊村",
    isModelDistrict: false,
    activities: ["釣り観光", "海水浴", "キャンプ連携"],
    description: "積丹半島南部の漁港。美しい海岸線を活かし、釣り・海水浴・キャンプ等のアウトドア観光と漁業の共存を図る。",
  },
  {
    id: "hokkaido-kamoenai",
    portName: "神恵内漁港",
    prefecture: "北海道",
    city: "神恵内村",
    isModelDistrict: false,
    activities: ["漁業体験", "水産物直売", "地域交流"],
    description: "積丹半島西部の小規模漁港。ウニやアワビの豊かな資源を活かした体験型観光で地域の活性化を目指す。",
  },
  {
    id: "hokkaido-furubira",
    portName: "古平漁港",
    prefecture: "北海道",
    city: "古平町",
    isModelDistrict: false,
    activities: ["水産物直売", "漁業見学", "食文化体験"],
    description: "タラコ・甘エビの産地として知られる漁港。水産加工品の直売や漁業見学を通じた海業に取り組む。",
  },
  {
    id: "hokkaido-tomamae",
    portName: "苫前漁港",
    prefecture: "北海道",
    city: "苫前町",
    isModelDistrict: false,
    activities: ["水産物直売", "漁業体験", "エビまつり"],
    description: "甘エビの水揚げ日本一を誇る漁港。エビまつり等のイベントや直売所を活用した海業を展開。",
  },
  {
    id: "hokkaido-shiraoi",
    portName: "白老港",
    prefecture: "北海道",
    city: "白老町",
    isModelDistrict: false,
    activities: ["釣り観光", "水産物直売", "アイヌ文化連携"],
    description: "ウポポイ（民族共生象徴空間）近隣の港。釣り観光とアイヌ文化体験を組み合わせた複合観光を推進。",
  },
  {
    id: "hokkaido-rausu",
    portName: "羅臼漁港",
    prefecture: "北海道",
    city: "羅臼町",
    isModelDistrict: false,
    activities: ["ホエールウォッチング", "水産物直売", "漁業体験"],
    description: "世界自然遺産・知床の玄関口。ホエールウォッチングや鮮魚直売など自然と漁業を融合した海業を推進。",
  },
  {
    id: "hokkaido-bikuni",
    portName: "美国漁港",
    prefecture: "北海道",
    city: "積丹町",
    isModelDistrict: false,
    activities: ["グラスボート", "釣り体験", "ウニ直売"],
    description: "積丹ブルーの透明な海が魅力。グラスボートやウニ直売など観光と漁業の一体的な振興を進める。",
  },
  {
    id: "hokkaido-shukutsu",
    portName: "祝津漁港",
    prefecture: "北海道",
    city: "小樽市",
    isModelDistrict: false,
    activities: ["水族館連携", "水産物直売", "クルーズ"],
    description: "おたる水族館に隣接する漁港。水族館・クルーズ・水産物直売を組み合わせた観光型海業を展開。",
  },
  {
    id: "hokkaido-shiranuka",
    portName: "白糠漁港",
    prefecture: "北海道",
    city: "白糠町",
    isModelDistrict: false,
    activities: ["水産物直売", "シシャモ文化発信", "漁業体験"],
    description: "本ししゃもの産地として知られる漁港。ブランド水産物を核とした食文化発信型の海業に取り組む。",
  },

  // ===== 青森県 =====
  {
    id: "aomori-ohata",
    portName: "大畑漁港",
    prefecture: "青森県",
    city: "むつ市",
    isModelDistrict: false,
    activities: ["イカ釣り体験", "水産物直売", "漁火観光"],
    description: "下北半島のイカ漁で有名な漁港。イカ釣り体験や漁火観光など、漁業文化を活かした海業を推進。",
  },
  {
    id: "aomori-wakinosawa",
    portName: "脇野沢漁港",
    prefecture: "青森県",
    city: "むつ市",
    isModelDistrict: false,
    activities: ["北限のニホンザル観光", "漁業体験", "自然体験"],
    description: "北限のニホンザルで知られる地域の漁港。自然観光と漁業体験を組み合わせたエコツーリズム型海業。",
  },

  // ===== 岩手県 =====
  {
    id: "iwate-hakozaki",
    portName: "箱崎漁港",
    prefecture: "岩手県",
    city: "釜石市",
    isModelDistrict: false,
    activities: ["復興観光", "漁業体験", "水産物直売"],
    description: "東日本大震災からの復興のシンボル的漁港。震災伝承と漁業体験を通じた交流人口拡大に取り組む。",
  },
  {
    id: "iwate-kirikiri",
    portName: "吉里吉里漁港",
    prefecture: "岩手県",
    city: "大槌町",
    isModelDistrict: true,
    activities: ["漁業体験", "復興ツーリズム", "防災教育"],
    description: "震災復興のモデル地区。漁業体験と防災教育を組み合わせた学びの観光を先導的に推進。",
  },
  {
    id: "iwate-ryori",
    portName: "綾里漁港",
    prefecture: "岩手県",
    city: "大船渡市",
    isModelDistrict: false,
    activities: ["漁業体験", "水産加工体験", "地域交流"],
    description: "三陸リアス海岸に位置する漁港。ワカメ・ホタテ等の養殖体験を通じた交流型海業を推進。",
  },

  // ===== 秋田県 =====
  {
    id: "akita-hachimori",
    portName: "八森漁港",
    prefecture: "秋田県",
    city: "八峰町",
    isModelDistrict: false,
    activities: ["ハタハタ文化発信", "釣り体験", "水産物直売"],
    description: "ハタハタ漁で有名な漁港。伝統的な漁業文化の発信と釣り体験を通じた海業を推進。",
  },
  {
    id: "akita-toga",
    portName: "戸賀漁港",
    prefecture: "秋田県",
    city: "男鹿市",
    isModelDistrict: false,
    activities: ["なまはげ文化連携", "釣り観光", "水産物直売"],
    description: "男鹿半島の漁港。ユネスコ無形文化遺産「なまはげ」と連携した観光型海業を展開。",
  },

  // ===== 宮城県 =====
  {
    id: "miyagi-onagawa",
    portName: "女川漁港",
    prefecture: "宮城県",
    city: "女川町",
    isModelDistrict: false,
    activities: ["復興まちづくり", "水産物直売", "漁業体験"],
    description: "東日本大震災からの復興を遂げた漁港。シーパルピア女川を中心に、水産業と観光が融合した賑わい創出。",
  },

  // ===== 山形県 =====
  {
    id: "yamagata-yura",
    portName: "由良漁港",
    prefecture: "山形県",
    city: "鶴岡市",
    isModelDistrict: false,
    activities: ["釣り観光", "海水浴", "加茂水族館連携"],
    description: "庄内浜の美しい海岸に位置する漁港。クラゲ水族館で有名な加茂水族館との連携で観光型海業を推進。",
  },

  // ===== 福島県 =====
  {
    id: "fukushima-onahama",
    portName: "小名浜漁港",
    prefecture: "福島県",
    city: "いわき市",
    isModelDistrict: false,
    activities: ["アクアマリンふくしま連携", "水産物直売", "釣り観光"],
    description: "いわき市の中核的漁港。アクアマリンふくしまや「ら・ら・ミュウ」との連携で集客力の高い海業を展開。",
  },

  // ===== 千葉県 =====
  {
    id: "chiba-funakata",
    portName: "船形漁港",
    prefecture: "千葉県",
    city: "館山市",
    isModelDistrict: false,
    activities: ["釣り観光", "水産物直売", "マリンスポーツ"],
    description: "南房総を代表する漁港。釣り船やマリンスポーツ、水産物直売を通じた多角的な海業を推進。",
  },
  {
    id: "chiba-futtsu",
    portName: "富津漁港",
    prefecture: "千葉県",
    city: "富津市",
    isModelDistrict: false,
    activities: ["潮干狩り", "釣り観光", "水産物直売"],
    description: "東京湾に面した漁港。潮干狩りや釣りなど手軽なレジャーと水産業の共存で多くの来訪者を集める。",
  },
  {
    id: "chiba-tomiura",
    portName: "富浦漁港",
    prefecture: "千葉県",
    city: "南房総市",
    isModelDistrict: false,
    activities: ["定置網体験", "水産物直売", "漁師料理体験"],
    description: "内房の穏やかな海に位置する漁港。定置網漁の見学や漁師料理体験など、漁業文化に触れる海業を展開。",
  },
  {
    id: "chiba-iioka",
    portName: "飯岡漁港",
    prefecture: "千葉県",
    city: "旭市",
    isModelDistrict: false,
    activities: ["釣り観光", "水産物直売", "サーフィン連携"],
    description: "九十九里浜北端の漁港。釣りやサーフィンなどマリンレジャーと水産業を融合した海業を推進。",
  },

  // ===== 神奈川県 =====
  {
    id: "kanagawa-kotsubo",
    portName: "小坪漁港",
    prefecture: "神奈川県",
    city: "逗子市",
    isModelDistrict: true,
    activities: ["朝市", "漁業体験", "地産地消レストラン"],
    description: "湘南エリアのモデル地区。朝市や漁業体験、地元レストランとの連携による都市近郊型海業の先進事例。",
  },
  {
    id: "kanagawa-misaki",
    portName: "三崎漁港",
    prefecture: "神奈川県",
    city: "三浦市",
    isModelDistrict: false,
    activities: ["マグロ食文化", "水産物直売", "観光船"],
    description: "三崎マグロで全国的に有名な漁港。マグロの食文化を核にした観光まちづくり型海業を推進。",
  },

  // ===== 富山県 =====
  {
    id: "toyama-kyoden",
    portName: "経田漁港",
    prefecture: "富山県",
    city: "魚津市",
    isModelDistrict: false,
    activities: ["ホタルイカ観光", "水産物直売", "漁業体験"],
    description: "ホタルイカの名産地。春のホタルイカ漁観光や蜃気楼見学と連携した季節型海業を展開。",
  },
  {
    id: "toyama-kurobe",
    portName: "黒部漁港",
    prefecture: "富山県",
    city: "黒部市",
    isModelDistrict: false,
    activities: ["水産物直売", "釣り体験", "トロッコ連携"],
    description: "黒部峡谷トロッコ電車の観光客を呼び込み、富山湾の新鮮な魚介と釣り体験を提供する海業を推進。",
  },

  // ===== 福井県 =====
  {
    id: "fukui-takahama",
    portName: "高浜漁港",
    prefecture: "福井県",
    city: "高浜町",
    isModelDistrict: true,
    activities: ["ビーチリゾート連携", "釣り体験", "水産物直売"],
    description: "若狭湾のモデル地区。「若狭和田ビーチ」のブルーフラッグ認証と連携し、ビーチ・釣り・地魚グルメの複合型海業を先導。",
  },

  // ===== 静岡県 =====
  {
    id: "shizuoka-heda",
    portName: "戸田漁港",
    prefecture: "静岡県",
    city: "沼津市",
    isModelDistrict: true,
    activities: ["深海魚グルメ", "漁業体験", "ダイビング"],
    description: "駿河湾の深海魚で有名なモデル地区。タカアシガニなど深海魚グルメやダイビング体験で先進的な海業を実践。",
  },
  {
    id: "shizuoka-yaizu",
    portName: "焼津漁港",
    prefecture: "静岡県",
    city: "焼津市",
    isModelDistrict: false,
    activities: ["水産物直売", "マグロ食文化", "漁業見学"],
    description: "カツオ・マグロの水揚げで日本有数の漁港。「焼津さかなセンター」を核にした水産観光型海業を展開。",
  },
  {
    id: "shizuoka-jitokata",
    portName: "地頭方漁港",
    prefecture: "静岡県",
    city: "牧之原市",
    isModelDistrict: true,
    activities: ["釣り体験", "漁師体験", "地産地消"],
    description: "御前崎近くのモデル地区。漁師と一緒に釣り体験ができるプログラムなど、参加型海業の先進モデルを推進。",
  },
  {
    id: "shizuoka-nishiizu",
    portName: "西伊豆漁港",
    prefecture: "静岡県",
    city: "西伊豆町",
    isModelDistrict: false,
    activities: ["夕陽観光", "釣り体験", "ダイビング"],
    description: "日本一の夕陽と称される西伊豆の漁港。夕陽観光と釣り・ダイビングを組み合わせた海業を推進。",
  },
  {
    id: "shizuoka-yoshida",
    portName: "吉田漁港",
    prefecture: "静岡県",
    city: "吉田町",
    isModelDistrict: false,
    activities: ["シラス直売", "漁業体験", "食文化発信"],
    description: "しらすの名産地。しらす漁体験や直売所を活用した食文化発信型の海業に取り組む。",
  },
  {
    id: "shizuoka-futo",
    portName: "富戸漁港",
    prefecture: "静岡県",
    city: "伊東市",
    isModelDistrict: false,
    activities: ["ダイビング", "釣り体験", "漁村散策"],
    description: "伊豆半島東岸のダイビングスポットとして人気の漁港。マリンスポーツと漁業の共存型海業を推進。",
  },
  {
    id: "shizuoka-ajiro",
    portName: "網代漁港",
    prefecture: "静岡県",
    city: "熱海市",
    isModelDistrict: false,
    activities: ["干物文化", "釣り体験", "温泉連携"],
    description: "熱海の温泉観光と連携した漁港。干物づくり体験や朝市など、温泉客を取り込む海業を展開。",
  },
  {
    id: "shizuoka-kawazu",
    portName: "河津漁港",
    prefecture: "静岡県",
    city: "河津町",
    isModelDistrict: false,
    activities: ["河津桜連携", "水産物直売", "釣り体験"],
    description: "河津桜で有名な地域の漁港。春の花見シーズンと連携した季節型海業で集客を図る。",
  },
  {
    id: "shizuoka-shizuura",
    portName: "静浦漁港",
    prefecture: "静岡県",
    city: "沼津市",
    isModelDistrict: false,
    activities: ["釣り公園", "水産物直売", "漁業体験"],
    description: "駿河湾に面した人気釣りスポット。釣り公園の整備や水産物直売を通じた海業を推進。",
  },
  {
    id: "shizuoka-uchiura",
    portName: "内浦漁港",
    prefecture: "静岡県",
    city: "沼津市",
    isModelDistrict: false,
    activities: ["養殖体験", "水産物直売", "アニメ聖地"],
    description: "アニメ「ラブライブ！サンシャイン!!」の聖地としても知られる漁港。コンテンツツーリズムと水産業の融合型海業。",
  },

  // ===== 愛知県 =====
  {
    id: "aichi-toyohama",
    portName: "豊浜漁港",
    prefecture: "愛知県",
    city: "南知多町",
    isModelDistrict: false,
    activities: ["鯛まつり", "水産物直売", "釣り体験"],
    description: "知多半島先端の漁港。日本一の鯛まつりや「豊浜魚ひろば」を核にした水産観光型海業を展開。",
  },

  // ===== 三重県 =====
  {
    id: "mie-sugari",
    portName: "須賀利漁港",
    prefecture: "三重県",
    city: "尾鷲市",
    isModelDistrict: false,
    activities: ["漁村景観", "釣り体験", "漁業体験"],
    description: "リアス海岸の入り江に位置する風情ある漁港。漁村景観を活かした滞在型海業を推進。",
  },
  {
    id: "mie-kohama",
    portName: "小浜漁港",
    prefecture: "三重県",
    city: "鳥羽市",
    isModelDistrict: false,
    activities: ["海女文化体験", "水産物直売", "離島観光連携"],
    description: "鳥羽の海女文化を体験できる漁港。答志島など離島観光と連携した海業を展開。",
  },
  {
    id: "mie-nikijima",
    portName: "二木島漁港",
    prefecture: "三重県",
    city: "熊野市",
    isModelDistrict: false,
    activities: ["漁業体験", "世界遺産連携", "釣り体験"],
    description: "世界遺産・熊野古道の近隣漁港。巡礼観光と漁業体験を組み合わせたユニークな海業を推進。",
  },
  {
    id: "mie-shimomioito",
    portName: "下御糸漁港",
    prefecture: "三重県",
    city: "明和町",
    isModelDistrict: true,
    activities: ["体験漁業", "水産物直売", "地域交流"],
    description: "伊勢湾に面したモデル地区。斎宮跡などの歴史資源と漁業体験を組み合わせた交流型海業を先導。",
  },

  // ===== 京都府 =====
  {
    id: "kyoto-maizuru",
    portName: "舞鶴漁港",
    prefecture: "京都府",
    city: "舞鶴市",
    isModelDistrict: false,
    activities: ["とれとれセンター", "水産物直売", "クルーズ"],
    description: "若狭湾に面した日本海側有数の漁港。舞鶴港とれとれセンターを核にした水産観光型海業を展開。",
  },
  {
    id: "kyoto-maizuru-nishioura",
    portName: "西大浦漁港",
    prefecture: "京都府",
    city: "舞鶴市",
    isModelDistrict: false,
    activities: ["漁業体験", "海水浴", "民宿連携"],
    description: "舞鶴市西部の漁港。海水浴場と民宿が隣接し、夏の滞在型海業を推進。",
  },
  {
    id: "kyoto-ine-honjo",
    portName: "本庄漁港",
    prefecture: "京都府",
    city: "伊根町",
    isModelDistrict: false,
    activities: ["舟屋観光", "漁業体験", "伝統文化体験"],
    description: "重要伝統的建造物群保存地区「伊根の舟屋」に隣接。舟屋見学と漁業体験を組み合わせた文化型海業。",
  },
  {
    id: "kyoto-asamogawa",
    portName: "浅茂川漁港",
    prefecture: "京都府",
    city: "京丹後市",
    isModelDistrict: false,
    activities: ["間人ガニ", "水産物直売", "釣り体験"],
    description: "幻のカニ「間人ガニ」の水揚げで知られる漁港。冬のカニシーズンを核にした季節型海業を推進。",
  },
  {
    id: "kyoto-kumihama",
    portName: "久美浜漁港",
    prefecture: "京都府",
    city: "京丹後市",
    isModelDistrict: false,
    activities: ["カキ養殖体験", "水産物直売", "温泉連携"],
    description: "久美浜湾のカキ養殖で有名な漁港。養殖体験と温泉を組み合わせた滞在型海業を展開。",
  },

  // ===== 兵庫県 =====
  {
    id: "hyogo-aboshi",
    portName: "網干漁港",
    prefecture: "兵庫県",
    city: "姫路市",
    isModelDistrict: false,
    activities: ["水産物直売", "漁業体験", "世界遺産連携"],
    description: "播磨灘に面した漁港。世界遺産・姫路城への観光客を取り込む水産観光型海業を推進。",
  },
  {
    id: "hyogo-maruyama",
    portName: "丸山漁港",
    prefecture: "兵庫県",
    city: "南あわじ市",
    isModelDistrict: false,
    activities: ["鳴門海峡観光", "水産物直売", "釣り体験"],
    description: "淡路島南端の漁港。鳴門海峡の渦潮観光と連携した海業に取り組む。",
  },
  {
    id: "hyogo-igumi",
    portName: "居組漁港",
    prefecture: "兵庫県",
    city: "新温泉町",
    isModelDistrict: true,
    activities: ["ジオパーク連携", "漁業体験", "温泉連携"],
    description: "山陰海岸ジオパーク内のモデル地区。ジオパーク観光・温泉・漁業体験を組み合わせた先進的な海業モデル。",
  },

  // ===== 和歌山県 =====
  {
    id: "wakayama-taiji",
    portName: "太地漁港",
    prefecture: "和歌山県",
    city: "太地町",
    isModelDistrict: true,
    activities: ["くじらの博物館", "漁業文化発信", "体験プログラム"],
    description: "捕鯨の歴史で知られるモデル地区。くじらの博物館を核に漁業文化の発信と体験型観光を先導。",
  },
  {
    id: "wakayama-susami",
    portName: "周参見漁港",
    prefecture: "和歌山県",
    city: "すさみ町",
    isModelDistrict: false,
    activities: ["海中ポスト", "ダイビング", "釣り体験"],
    description: "海中ポストやエビとカニの水族館で知られる漁港。ユニークな観光資源を活かした海業を推進。",
  },

  // ===== 島根県 =====
  {
    id: "shimane-urago",
    portName: "浦郷漁港",
    prefecture: "島根県",
    city: "西ノ島町",
    isModelDistrict: false,
    activities: ["隠岐ジオパーク", "漁業体験", "離島観光"],
    description: "隠岐諸島・西ノ島の漁港。ユネスコ世界ジオパークに認定された自然景観と漁業文化を融合した海業。",
  },
  {
    id: "shimane-inazumi",
    portName: "稲積漁港",
    prefecture: "島根県",
    city: "松江市",
    isModelDistrict: false,
    activities: ["釣り体験", "水産物直売", "宍道湖連携"],
    description: "日本海と宍道湖に近い漁港。しじみで有名な宍道湖観光と連携した海業を推進。",
  },

  // ===== 広島県 =====
  {
    id: "hiroshima-hishio",
    portName: "干汐漁港",
    prefecture: "広島県",
    city: "尾道市",
    isModelDistrict: false,
    activities: ["しまなみ海道連携", "漁業体験", "サイクリング"],
    description: "しまなみ海道の起点・尾道に位置する漁港。サイクリング観光と漁業体験を組み合わせた海業を展開。",
  },

  // ===== 山口県 =====
  {
    id: "yamaguchi-morino",
    portName: "森野漁港",
    prefecture: "山口県",
    city: "周防大島町",
    isModelDistrict: false,
    activities: ["みかん鯛", "水産物直売", "離島体験"],
    description: "瀬戸内海の周防大島に位置する漁港。みかん鯛やみかん鰤など特色ある養殖水産物による海業を推進。",
  },

  // ===== 徳島県 =====
  {
    id: "tokushima-musa",
    portName: "撫佐漁港",
    prefecture: "徳島県",
    city: "鳴門市",
    isModelDistrict: false,
    activities: ["渦潮観光連携", "ワカメ養殖体験", "水産物直売"],
    description: "鳴門海峡の渦潮に近い漁港。渦潮観光とワカメ養殖体験を組み合わせた海業を推進。",
  },
  {
    id: "tokushima-ijima",
    portName: "伊島漁港",
    prefecture: "徳島県",
    city: "阿南市",
    isModelDistrict: false,
    activities: ["離島体験", "釣り体験", "自然観察"],
    description: "紀伊水道に浮かぶ離島の漁港。豊かな自然と釣り体験を活かした離島型海業に取り組む。",
  },

  // ===== 愛媛県 =====
  {
    id: "ehime-shinozuka",
    portName: "篠塚漁港",
    prefecture: "愛媛県",
    city: "上島町",
    isModelDistrict: false,
    activities: ["しまなみ海道連携", "漁業体験", "島暮らし体験"],
    description: "芸予諸島の上島町にある漁港。しまなみ海道と連携した島暮らし体験型海業を推進。",
  },
  {
    id: "ehime-iwagi",
    portName: "岩城漁港",
    prefecture: "愛媛県",
    city: "上島町",
    isModelDistrict: false,
    activities: ["レモン産業連携", "漁業体験", "サイクリング"],
    description: "レモンの島として知られる岩城島の漁港。柑橘と水産業を組み合わせた6次産業化型海業を展開。",
  },
  {
    id: "ehime-ainan",
    portName: "愛南漁港",
    prefecture: "愛媛県",
    city: "愛南町",
    isModelDistrict: true,
    activities: ["真珠養殖体験", "ダイビング", "水産物直売"],
    description: "四国最南端のモデル地区。真珠養殖体験やサンゴ礁ダイビングなど、南国型海業の先進モデルを推進。",
  },

  // ===== 高知県 =====
  {
    id: "kochi-muroto",
    portName: "室戸漁港",
    prefecture: "高知県",
    city: "室戸市",
    isModelDistrict: false,
    activities: ["ジオパーク連携", "深海魚グルメ", "漁業体験"],
    description: "室戸ユネスコ世界ジオパーク内の漁港。深海魚や金目鯛を活かしたジオ・グルメ型海業を展開。",
  },
  {
    id: "kochi-aki",
    portName: "安芸漁港",
    prefecture: "高知県",
    city: "安芸市",
    isModelDistrict: false,
    activities: ["じゃこ天文化", "釣り体験", "水産物直売"],
    description: "シラス・ちりめんの産地。じゃこ天づくり体験や水産物直売を通じた食文化発信型海業を推進。",
  },
  {
    id: "kochi-usa",
    portName: "宇佐漁港",
    prefecture: "高知県",
    city: "土佐市",
    isModelDistrict: false,
    activities: ["ホエールウォッチング", "釣り体験", "漁業体験"],
    description: "土佐湾のホエールウォッチングの拠点港。鯨やイルカの観光と漁業体験を組み合わせた海業を展開。",
  },

  // ===== 福岡県 =====
  {
    id: "fukuoka-kaburi",
    portName: "加布里漁港",
    prefecture: "福岡県",
    city: "糸島市",
    isModelDistrict: false,
    activities: ["カキ小屋", "水産物直売", "釣り体験"],
    description: "糸島のカキ小屋で大人気の漁港。冬のカキシーズンを核にした季節型海業で大きな集客を実現。",
  },
  {
    id: "fukuoka-shikanoshima",
    portName: "志賀島漁港",
    prefecture: "福岡県",
    city: "福岡市",
    isModelDistrict: false,
    activities: ["歴史観光連携", "水産物直売", "釣り体験"],
    description: "金印で有名な志賀島の漁港。歴史観光と海の幸を組み合わせた都市近郊型海業を推進。",
  },
  {
    id: "fukuoka-karadomari",
    portName: "唐泊漁港",
    prefecture: "福岡県",
    city: "福岡市",
    isModelDistrict: false,
    activities: ["恵比須かき", "カキ小屋", "水産物直売"],
    description: "博多湾に面した漁港。ブランド牡蠣「唐泊恵比須かき」のカキ小屋で人気の海業を展開。",
  },

  // ===== 佐賀県 =====
  {
    id: "saga-yobuko",
    portName: "呼子港",
    prefecture: "佐賀県",
    city: "唐津市",
    isModelDistrict: false,
    activities: ["イカの活き造り", "朝市", "観光船"],
    description: "呼子のイカで全国的に有名な港。朝市やイカの活き造り、七ツ釜遊覧船など観光型海業の先進地。",
  },

  // ===== 長崎県 =====
  {
    id: "nagasaki-hitakatsu",
    portName: "比田勝漁港",
    prefecture: "長崎県",
    city: "対馬市",
    isModelDistrict: true,
    activities: ["国境の島観光", "釣り体験", "漁業文化発信"],
    description: "対馬北部のモデル地区。韓国との国際航路の玄関口として、国境の島ならではの漁業文化発信型海業を先導。",
  },
  {
    id: "nagasaki-miurawan",
    portName: "三浦湾漁港",
    prefecture: "長崎県",
    city: "対馬市",
    isModelDistrict: false,
    activities: ["真珠養殖体験", "釣り体験", "自然体験"],
    description: "対馬西岸の入り江にある漁港。真珠養殖の見学体験や豊かな自然を活かした体験型海業を推進。",
  },
  {
    id: "nagasaki-ashibe",
    portName: "芦辺漁港",
    prefecture: "長崎県",
    city: "壱岐市",
    isModelDistrict: false,
    activities: ["壱岐焼酎文化", "水産物直売", "釣り体験"],
    description: "壱岐島の主要漁港。壱岐焼酎や海産物のグルメ観光と釣り体験を組み合わせた島嶼型海業を展開。",
  },
  {
    id: "nagasaki-narao",
    portName: "奈良尾漁港",
    prefecture: "長崎県",
    city: "新上五島町",
    isModelDistrict: false,
    activities: ["五島うどん", "教会群観光連携", "漁業体験"],
    description: "五島列島の玄関口。世界遺産の教会群観光と五島うどん・水産物グルメを融合した海業を推進。",
  },
  {
    id: "nagasaki-tateura",
    portName: "館浦漁港",
    prefecture: "長崎県",
    city: "平戸市",
    isModelDistrict: false,
    activities: ["平戸観光連携", "水産物直売", "漁業体験"],
    description: "平戸島の漁港。歴史的な平戸の観光資源と新鮮な水産物を組み合わせた海業を推進。",
  },

  // ===== 熊本県 =====
  {
    id: "kumamoto-ushibuka",
    portName: "牛深漁港",
    prefecture: "熊本県",
    city: "天草市",
    isModelDistrict: true,
    activities: ["ハイヤ祭り", "水産物直売", "イルカウォッチング"],
    description: "天草南端のモデル地区。ハイヤ祭りやイルカウォッチング、水産物直売など多角的な海業の先進モデル。",
  },
  {
    id: "kumamoto-nishikawauchi",
    portName: "西川内漁港",
    prefecture: "熊本県",
    city: "苓北町",
    isModelDistrict: false,
    activities: ["天草観光連携", "漁業体験", "水産物直売"],
    description: "天草下島西岸の漁港。天草の観光資源と連携した漁業体験型海業に取り組む。",
  },

  // ===== 宮崎県 =====
  {
    id: "miyazaki-aoshima",
    portName: "青島漁港",
    prefecture: "宮崎県",
    city: "宮崎市",
    isModelDistrict: false,
    activities: ["青島観光連携", "サーフィン", "水産物直売"],
    description: "宮崎のシンボル・青島に隣接する漁港。サーフィンや青島観光と連携したマリンレジャー型海業を展開。",
  },

  // ===== 鹿児島県 =====
  {
    id: "kagoshima-yamagawa",
    portName: "山川漁港",
    prefecture: "鹿児島県",
    city: "指宿市",
    isModelDistrict: false,
    activities: ["カツオ節文化", "温泉連携", "水産物直売"],
    description: "本枯れ節の名産地。砂むし温泉で有名な指宿の温泉観光とカツオ節文化を融合した海業を推進。",
  },
  {
    id: "kagoshima-eguchi",
    portName: "江口漁港",
    prefecture: "鹿児島県",
    city: "日置市",
    isModelDistrict: false,
    activities: ["水産物直売", "釣り体験", "海鮮レストラン"],
    description: "東シナ海に面した漁港。「江口蓬莱館」の海鮮レストランと直売所を核にした水産観光型海業で人気。",
  },
  {
    id: "kagoshima-kushikino",
    portName: "串木野漁港",
    prefecture: "鹿児島県",
    city: "いちき串木野市",
    isModelDistrict: false,
    activities: ["マグロ食文化", "水産物直売", "漁業体験"],
    description: "遠洋マグロ漁の基地港。マグロの食文化を核にした水産観光型海業を推進。",
  },
  {
    id: "kagoshima-makurazaki",
    portName: "枕崎漁港",
    prefecture: "鹿児島県",
    city: "枕崎市",
    isModelDistrict: false,
    activities: ["カツオ食文化", "水産物直売", "枯節体験"],
    description: "カツオ節の生産量日本一を誇る漁港。カツオ節削り体験や水産物直売を通じた食文化発信型海業を展開。",
  },

  // ===== 大分県 =====
  {
    id: "oita-kakaji",
    portName: "香々地漁港",
    prefecture: "大分県",
    city: "豊後高田市",
    isModelDistrict: false,
    activities: ["昭和の町観光連携", "水産物直売", "漁業体験"],
    description: "国東半島の漁港。「昭和の町」の観光資源と連携し、レトロ観光と漁業体験を組み合わせた海業を推進。",
  },

  // ===== 沖縄県 =====
  {
    id: "okinawa-yagaji",
    portName: "屋我地漁港",
    prefecture: "沖縄県",
    city: "名護市",
    isModelDistrict: false,
    activities: ["マングローブ体験", "釣り体験", "沖縄料理体験"],
    description: "屋我地島の漁港。マングローブカヤックやグルクン釣り体験など沖縄ならではの海業を推進。",
  },
  {
    id: "okinawa-ikema",
    portName: "池間漁港",
    prefecture: "沖縄県",
    city: "宮古島市",
    isModelDistrict: false,
    activities: ["サンゴ礁観光", "漁業体験", "エコツーリズム"],
    description: "宮古島北部の池間島にある漁港。美しいサンゴ礁と伝統的な漁業文化を活かしたエコツーリズム型海業。",
  },
];

/**
 * 都道府県名で海業推進地区を絞り込む
 */
export function getUmigyoByPrefecture(prefecture: string): UmigyoDistrict[] {
  return umigyoDistricts.filter((d) => d.prefecture === prefecture);
}

/**
 * モデル地区のみ取得
 */
export function getModelDistricts(): UmigyoDistrict[] {
  return umigyoDistricts.filter((d) => d.isModelDistrict);
}

/**
 * 都道府県名一覧（重複除去、地区が存在するもののみ）
 */
export function getUmigyoPrefectures(): string[] {
  const prefSet = new Set(umigyoDistricts.map((d) => d.prefecture));
  return Array.from(prefSet);
}
