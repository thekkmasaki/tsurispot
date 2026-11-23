import type { FishingBan } from "@/types";

/**
 * 釣り禁止の監査結果（2026-11）。重複統合後の slug → 禁止情報。spots.ts の applyBanOverrides で適用する。
 *
 * 外部監査で「立入禁止・釣り禁止なのに通常の釣り場として掲載」と指摘された場所を、
 * 港湾管理者・自治体の公式ページで1件ずつ確認したものだけを載せる。
 * 公式で裏が取れなかった指摘（名古屋港・潮見ふ頭、博多埠頭、堺・大浜埠頭、竹芝、館山自衛隊堤防）は載せない
 * （FishingBan の運用ルールと同じ。出典は一次情報のみ）。
 *
 * - description: 本文を丸ごと差し替える（全面禁止で、元の本文が釣行を勧めているとき）
 * - notice: 元の本文の先頭に足す注記（一部禁止で、元の本文を残すとき）
 */
export interface SpotBanOverride {
  fishingBan: FishingBan;
  description?: string;
  notice?: string;
}

const CONFIRMED = "2026-11-21";

// ── 大阪港（大阪港湾局：大阪市港湾施設条例第10条に基づく立入禁止区域） ──
const OSAKA_PORT_BAN_URLS = [
  "https://www.city.osaka.lg.jp/port/page/0000062374.html",
  "https://www.city.osaka.lg.jp/port/cmsfiles/contents/0000062/62374/fuzoku3.pdf",
  "https://www.city.osaka.lg.jp/port/cmsfiles/contents/0000062/62374/R808itizu.pdf",
];
const MAISHIMA: SpotBanOverride = {
  fishingBan: {
    scope: "partial",
    reason:
      "大阪港湾局は、舞洲地区護岸のうち外海側の消波ブロック（表テトラ）部分と北東護岸の大部分を、大阪市港湾施設条例に基づく立入禁止区域に指定しています。釣りができるのは、立入禁止としない区域とされている南護岸と北東護岸の一部だけです。救命胴衣の着用と、一人で釣りをしないことが求められています。",
    sourceUrls: OSAKA_PORT_BAN_URLS,
    confirmedAt: CONFIRMED,
  },
  notice:
    "※舞洲の護岸は、表テトラと北東護岸の大部分が立入禁止区域です（大阪港湾局）。釣りができるのは南護岸と北東護岸の一部の開放区間だけです。",
};

// ── 神戸港（神戸市：港湾管理者） ──
const KOBE_PORT_FISHING_URLS = [
  "https://www.city.kobe.lg.jp/a42810/kannrizimusho.html",
  "https://www.city.kobe.lg.jp/a42810/business/kowanjigyo/kobekukonishiryokuchi-tsuri.html",
];

// ── 南芦屋浜・南護岸（兵庫県・芦屋市のエリア分け） ──
const MINAMI_ASHIYA: SpotBanOverride = {
  fishingBan: {
    scope: "partial",
    reason:
      "兵庫県と芦屋市は、南芦屋浜の南護岸（約1.1km）を、釣りが「できるエリア」（東側）と「できないエリア」（西側）に分けて開放しています。開放は8時〜20時で、20時までに退出が必要です。ごみの不法投棄や釣りエサの悪臭が多い場合は閉鎖することがあるとしています。",
    sourceUrls: [
      "https://www.city.ashiya.lg.jp/gairoju/documents/minamigoganeria.pdf",
      "https://www.city.ashiya.lg.jp/gairoju/documents/kaihouzikannohenkou.pdf",
      "https://web.pref.hyogo.lg.jp/org/amagasakikokanri/documents/keiisaisyuu.pdf",
    ],
    confirmedAt: CONFIRMED,
  },
  notice:
    "※南芦屋浜の南護岸は、釣りができるのは東側の「釣りができるエリア」だけで、西側は釣り禁止です。開放は8時〜20時（兵庫県・芦屋市）。夜釣りはできません。",
};

// ── 小田原漁港（神奈川県西部漁港事務所） ──
const ODAWARA: SpotBanOverride = {
  fishingBan: {
    scope: "partial",
    reason:
      "神奈川県西部漁港事務所は、小田原漁港の消波ブロック（テトラポッド等）の上を全面的に、海面から高さのある防波堤の一部と蓄養生簀の周辺を立入禁止としています。立入禁止の場所に入るのは軽犯罪法違反になるおそれがあります。また本港の1号防波堤付近など図示した場所では投げ釣りが禁止されています（投げ釣り以外の釣りは従来どおり可能）。",
    sourceUrls: [
      "https://www.pref.kanagawa.jp/docs/s3w/2020/00-submenu/03.html",
      "https://www.pref.kanagawa.jp/docs/s3w/index.html",
      "https://www.pref.kanagawa.jp/documents/16616/nagetsurikinnshi_heimenzu.pdf",
    ],
    confirmedAt: CONFIRMED,
  },
  notice:
    "※小田原漁港は消波ブロックの上と防波堤の一部が立入禁止で、1号防波堤付近などでは投げ釣りも禁止されています（神奈川県西部漁港事務所）。釣りは立入禁止でない岸壁で、掲示に従ってください。",
};

// ── 横浜港（横浜市港湾局） ──
const YOKOHAMA_PORT_URLS = [
  "https://www.city.yokohama.lg.jp/city-info/yokohamashi/yokohamako/kkihon/kikikanri/seigen.html",
  "https://www.city.yokohama.lg.jp/city-info/yokohamashi/yokohamako/kkihon/kikikanri/seigen.files/0003_20250410.pdf",
];

// ── 博多港・須崎ふ頭（福岡市港湾空港局） ──
const HAKATA_SUZAKI: SpotBanOverride = {
  fishingBan: {
    scope: "partial",
    reason:
      "福岡市港湾空港局は、須崎ふ頭の一部の岸壁を国際船舶・港湾保安法に基づく制限区域にしており、正当な理由なく立ち入ることはできません。須崎ふ頭は穀物などを扱う物流拠点で、市は釣り場として案内していません。制限区域や立入禁止の表示がある場所には入らず、荷役作業の妨げにならないようにしてください。",
    sourceUrls: [
      "https://www.city.fukuoka.lg.jp/kowan/koei/hakata-port/hoan.html",
      "https://www.city.fukuoka.lg.jp/kowan/somu/hakata-port/futo_goannai.html",
    ],
    confirmedAt: CONFIRMED,
  },
  notice:
    "※須崎ふ頭の一部の岸壁は港湾保安上の制限区域で、立入禁止です（福岡市港湾空港局）。荷役中の物流拠点なので、立入禁止の表示がある場所には入らないでください。",
};

// ── 2026-11-21 一斉監査（全5,610件）の反映分。港湾管理者・県の公式ページで確認できた港だけ ──
// 監査で禁止と判定されたが公式で裏が取れなかったもの（名古屋港ガーデンふ頭）は載せない。
// 福浦岸壁・明石海峡大橋下の舞子側護岸は、運営者の確認（横浜市港湾局・神戸市の公表）を受けて 2026-11-21 に追加した。

/** 全面禁止の港をまとめて登録する。元の本文（釣行を勧める紹介文）は禁止の説明に差し替える */
function fullBanGroup(
  names: Record<string, string>,
  fishingBan: FishingBan,
  body: string
): Record<string, SpotBanOverride> {
  return Object.fromEntries(
    Object.entries(names).map(([slug, name]) => [slug, { fishingBan, description: `${name}。${body}` }])
  );
}

// 仙台塩釜港（宮城県仙台塩釜港湾事務所「仙台塩釜港内における釣りについて」2025-10-20 掲載）
const SENDAI_SHIOGAMA_URLS = ["https://www.pref.miyagi.jp/soshiki/sdsgkown/fishing.html"];
const SENDAI_SHIOGAMA_FULL = fullBanGroup(
  {
    "shiogama-ko": "塩釜港",
    "sendai-shiogama-port": "仙台塩釜港",
    "sendai-nakanosakai-wharf": "仙台港中野栄岸壁",
    "shiogama-marinegate": "塩釜港マリンゲート前",
    "ishinomaki-ko": "石巻港",
    "shiogama-higashi-bouhatei": "塩釜港東防波堤",
    "shiogama-kou": "塩竈港",
    "sendai-takasago-futou6": "仙台港高砂埠頭",
    "shiogama-marinegate-e8": "塩釜港マリンゲート",
    "sendai-nakano-wharf-a10": "仙台港中野埠頭",
    "sendai-takasago-quay-a13": "仙台港高砂岸壁",
  },
  {
    scope: "full",
    reason:
      "港湾管理者の宮城県は、仙台塩釜港の港内を全面釣り禁止としています。ふ頭では大型の重機やトラックが作業しているため関係者以外は立ち入れず、防波堤やテトラポットにも転落の危険があるため立ち入らないよう求めています。港内で釣りができるのは、NX仙台港パーク（仙台港中央公園）の「海の広場」だけです。",
    sourceUrls: SENDAI_SHIOGAMA_URLS,
    confirmedAt: CONFIRMED,
  },
  "港湾管理者の宮城県は、仙台塩釜港の港内を全面釣り禁止としており、岸壁・ふ頭・防波堤のいずれでも釣りはできません（関係者以外の立ち入りも禁止）。港内で釣りができるのは、NX仙台港パーク（仙台港中央公園）の「海の広場」だけです。釣りに行くなら、海の広場の利用ルールを確認してから利用してください。"
);
const SENDAI_PARK: SpotBanOverride = {
  fishingBan: {
    scope: "partial",
    reason:
      "宮城県は仙台塩釜港の港内を全面釣り禁止としていますが、NX仙台港パーク（仙台港中央公園）の「海の広場」だけは釣りができる場所としています。海の広場以外の岸壁・護岸では釣りはできません。",
    sourceUrls: SENDAI_SHIOGAMA_URLS,
    confirmedAt: CONFIRMED,
  },
  notice:
    "※仙台塩釜港は港内全面釣り禁止で、釣りができるのはNX仙台港パーク（仙台港中央公園）の「海の広場」だけです（宮城県）。海の広場の利用ルールに従ってください。",
};

// 山形県の港湾（酒田港・加茂港・鼠ヶ関港。山形県「山形県の港湾」2026-07-10 更新）
const YAMAGATA_FULL = fullBanGroup(
  {
    "sakata-ko": "酒田港",
    "sakata-chuo-wharf": "酒田港中央埠頭",
    "kamo-port-yamagata": "加茂港",
    "nezugaseki-ko": "鼠ヶ関港",
    "sakata-gaikou6": "酒田港外港",
    "sakata-honkou6": "酒田港本港",
    "sakata-kitako-port-a10": "酒田港北港",
    "sakata-south-breakwater-a10": "酒田港南防波堤",
    "nezugaseki-south-breakwater-a11": "鼠ヶ関港南堤防",
    "sakata-gaiko-breakwater-a11": "酒田港外港堤防",
    "tsuruoka-nezugaseki-north-a12": "鶴岡市鼠ヶ関港北堤防",
    "tsuruoka-kamo-south-breakwater-a12": "鶴岡市加茂港南堤防",
  },
  {
    scope: "full",
    reason:
      "港湾管理者の山形県は、酒田港・加茂港・鼠ヶ関港の3港について、船舶や荷役作業の事故を防ぎ利用者の安全を守るため、港内での釣りを禁止しています。",
    sourceUrls: ["https://www.pref.yamagata.jp/180042/kurashi/kendo/kouwan/yamagataport/index.html"],
    confirmedAt: CONFIRMED,
  },
  "港湾管理者の山形県は、酒田港・加茂港・鼠ヶ関港の3港で港内での釣りを禁止しています（船舶・荷役作業の事故防止と安全確保のため）。防波堤・岸壁を含め、現在ここで釣りはできません。"
);

// 新潟港（新潟県新潟港湾事務所「新潟港（西港区・東港区）の防波堤等で魚釣りはできません」2022-07-25 更新）
const NIIGATA_PORT_URLS = ["https://www.pref.niigata.lg.jp/sec/niigata_kouwan/1356894878931.html"];
const NIIGATA_PORT_REASON =
  "新潟県新潟港湾事務所は、新潟港の西港区・東港区で、防波堤や護岸などの港湾管理施設に魚釣り等の目的で立ち入ることを禁止しています（事故防止・船舶の安全・テロ対策のため）。釣りができる場所として、西港区の新潟港海岸（西海岸地区）第1〜第4突堤と、東港区の第2東防波堤管理釣り場を案内しています。";
const NIIGATA_FULL = fullBanGroup(
  {
    "niigata-yamashita-futo": "新潟港山の下埠頭",
    "niigata-higashi-kou-dai3": "新潟東港第3東防波堤",
    "niigata-nishikou-yamanoshita-a12": "新潟西港・山の下埠頭",
  },
  { scope: "full", reason: NIIGATA_PORT_REASON, sourceUrls: NIIGATA_PORT_URLS, confirmedAt: CONFIRMED },
  "新潟県新潟港湾事務所は、新潟港の防波堤・護岸・ふ頭などの港湾管理施設に釣りの目的で立ち入ることを禁止しており、ここで釣りはできません。新潟港で釣りをするなら、県が案内している西海岸地区の第1〜第4突堤か、東港区の第2東防波堤管理釣り場を利用してください。"
);
const NIIGATA_PARTIAL: SpotBanOverride = {
  fishingBan: { scope: "partial", reason: NIIGATA_PORT_REASON, sourceUrls: NIIGATA_PORT_URLS, confirmedAt: CONFIRMED },
  notice:
    "※新潟港の防波堤・護岸などは釣り目的の立ち入りが禁止です（新潟県新潟港湾事務所）。釣りができるのは西海岸地区の第1〜第4突堤と、東港区の第2東防波堤管理釣り場だけです。",
};

// 茨城港大洗港区（茨城県茨城港湾事務所大洗港区事業所。茨城県港湾施設管理条例第4条第7項）
const OARAI_FULL = fullBanGroup(
  { "oarai-port": "大洗港", "oarai-teiho": "大洗・大洗港堤防" },
  {
    scope: "full",
    reason:
      "茨城県茨城港湾事務所大洗港区事業所は、大洗港区内の岸壁・防波堤などでの魚釣りを禁止しています（茨城県港湾施設管理条例第4条第7項）。",
    sourceUrls: ["https://www.pref.ibaraki.jp/doboku/ibako/okoku/index.html"],
    confirmedAt: CONFIRMED,
  },
  "茨城県は、大洗港区内の岸壁・防波堤などでの魚釣りを禁止しています（茨城県港湾施設管理条例第4条第7項）。港の岸壁や堤防では釣りができません。"
);

// 鳥取県の漁港（鳥取県「遊漁者へのお願い」。新型コロナ対策の呼びかけページの中の記載で、条例・規則ではない）
const TOTTORI_GYOKO: SpotBanOverride = {
  fishingBan: {
    scope: "partial",
    reason:
      "鳥取県は、遊漁者へのお願いの中で「県内の漁港は、原則、関係者以外立ち入り禁止」としています。釣りは岩場や砂浜など釣りが認められている場所で行い、釣り禁止・立入禁止の場所には入らないよう求めています。どこが立入禁止かは、漁港ごとに現地の掲示で確認する必要があります。",
    sourceUrls: ["https://www.pref.tottori.lg.jp/299045.htm"],
    confirmedAt: CONFIRMED,
  },
  notice:
    "※鳥取県は「県内の漁港は、原則、関係者以外立ち入り禁止」としています。漁港の岸壁・防波堤で釣りをする前に、現地の掲示で立ち入りが認められているか必ず確認してください。",
};
// 焼津漁港（静岡県焼津漁港管理事務所「焼津漁港に釣り等で来訪される皆様にお願いです」2023-09-14。静岡県漁港管理条例第9条）
// 図面の赤い区域（外側の防波堤）が立入禁止。どの堤防名が赤い区域かは図面の文字が読めず特定できないため partial にとどめる。
const YAIZU_GYOKO: SpotBanOverride = {
  fishingBan: {
    scope: "partial",
    reason:
      "静岡県焼津漁港管理事務所は、高波を防ぐための外側の防波堤を立入禁止区域としています（静岡県漁港管理条例第9条）。水揚げ・せり・荷降ろしの周辺や漁業者の作業場所でも釣りを控えるよう求めており、処罰の対象になる場合があるとしています。釣り用に整備されているのは親水公園「ふぃしゅーな」の釣り護岸です。",
    sourceUrls: [
      "http://doboku.pref.shizuoka.jp/desaki2/yaizu/news/news230914.html",
      "http://doboku.pref.shizuoka.jp/desaki2/yaizu/sisetsu.html",
    ],
    confirmedAt: CONFIRMED,
  },
  notice:
    "※焼津漁港は外側の防波堤が立入禁止で、水揚げ場周辺や漁業者の作業場所での釣りも控えるよう求められています（静岡県焼津漁港管理事務所）。釣りは親水公園「ふぃしゅーな」の釣り護岸など、認められた場所で。",
};

// 玉原湖（利根漁業協同組合遊漁規則 第5条。群馬県が掲載する認可済み規則、2026-03-01 施行）
const TAMBARA: SpotBanOverride = {
  fishingBan: {
    scope: "full",
    reason:
      "利根漁業協同組合の遊漁規則は、発知川の玉原ダム副ダムから上流の玉原ダム調整池内全域を、1月1日から12月31日まで遊漁の禁止区域としています。玉原湖では一年中、釣りができません。",
    sourceUrls: ["https://www.pref.gunma.jp/page/217085.html", "https://www.pref.gunma.jp/uploaded/attachment/691065.pdf"],
    confirmedAt: CONFIRMED,
  },
  description:
    "玉原湖（たんばらダム湖）。群馬県沼田市の玉原ダム調整池。利根漁業協同組合の遊漁規則で、副ダムから上流の調整池全域が一年中遊漁禁止とされており、ここでは釣りができません。",
};

const TOTTORI_GYOKO_SLUGS = [
  "sakaiminato-port", "tottori-port", "karo-port", "sakaiminato-gaiko", "iwami-tago-port", "kotoura-outtsuka-port",
  "daisen-mikuriya-port", "tottori-karo-port", "uradome-ajiro-port", "natsudumari-gyokou-w7", "nakayama-ousaka-port",
  "yodoe-gyokou-w7", "higashihama-port-tottori", "hashizu-port", "aoya-gyokou-w6", "daisen-shiotsu-port",
  "yurihama-tomari-port", "hamamura-port", "iwado-port-tottori", "yonago-kou-w7", "nawa-gyokou-w7", "yura-port-tottori",
  "sakaiminato-suido", "ajiro-gyokou-tottori", "iwami-hao-gyokou", "tottori-sakatsu-gyokou",
  "akasaki-gyokou-tottori", "sakatsu-gyokou-tottori-w6", "sotoe-kou-sakaiminato-w6", "funaiso-kou-w6", "igumi-kou-w7",
  "hamamura-kou-w7", "tottori-iwami-makidani-bulk", "tottori-iwami-kugami-bulk", "tottori-aoya-nagawase-bulk",
  "tottori-kotoura-bessho-bulk", "tottorikou-karo-a9", "kotoura-kou-a11", "tohaku-gyokou-a12", "fukube-gyokou-a13",
  "watari-gyokou-sakaiminato-a13", "daiei-gyokou-a13", "nakayama-gyokou-daisen-a13",
];

// ─────────── 2026-11-23 指示書03（禁止の疑い35件の公式調査、docs/fishing-ban-investigation-03.md）の反映 ───────────
const INVESTIGATION_03 = "2026-11-21";

// 鹿児島港（港湾管理者: 鹿児島県）。県は港湾の岸壁を原則関係者以外立入禁止とし、
// 本港区北ふ頭1号岸壁などは国際船舶・港湾保安法の制限区域（立入に許可証が必要）。
const KAGOSHIMA_PORT_URLS = [
  "https://www.pref.kagoshima.jp/ak13/chiiki/kagoshima/kiban/documents/miokuri.html",
  "https://www.pref.kagoshima.jp/ah09/20130305.html",
  "https://www.city.kagoshima.lg.jp/faq-kankyomachizukuri/kasenkowan/q2.html",
];
const KAGOSHIMA_PORT_REASON =
  "鹿児島港を管理する鹿児島県は、港湾の岸壁について、事故防止などの観点から原則として関係者以外の立入を禁止しています。また本港区北ふ頭1号岸壁などは、国際船舶・港湾保安法に基づく制限区域で、立入には県の許可証が必要です。岸壁で釣りをすることはできないと考えてください。";
const kagoshimaPort = (description: string): SpotBanOverride => ({
  fishingBan: { scope: "partial", reason: KAGOSHIMA_PORT_REASON, sourceUrls: KAGOSHIMA_PORT_URLS, confirmedAt: INVESTIGATION_03 },
  description,
});

// 徳山ダム（岐阜県揖斐川町）。県の内水面漁場管理委員会指示で、上流の支流は全魚種・周年の採捕禁止。
// 湖面の立入禁止は徳山会館の指定管理者の告知でのみ確認でき、ダム管理者（水資源機構）の公式ページは
// 取得できなかったため、fishingBan は公式で確認できた上流の採捕禁止を根拠に partial とする。
const TOKUYAMA_DAM: SpotBanOverride = {
  fishingBan: {
    scope: "partial",
    reason:
      "岐阜県内水面漁場管理委員会の指示により、徳山ダムの上流のうち、揖斐川町塚の才谷合流点から上流の揖斐川とその支派川、門入の黒谷合流点から上流の西谷・黒谷とその支派川では、一年中すべての魚の採捕が禁止されています。ダム湖は漁業権のない自由漁場ですが、湖面は通常立入禁止と案内されており（現地の徳山会館の告知）、湖面開放日でも魚釣りは禁止とされています。",
    sourceUrls: [
      "https://www.pref.gifu.lg.jp/page/8519.html",
      "https://www.pref.gifu.lg.jp/uploaded/attachment/35697.pdf",
      "https://www.pref.gifu.lg.jp/uploaded/attachment/383183.pdf",
    ],
    confirmedAt: INVESTIGATION_03,
  },
  description:
    "岐阜県揖斐川町にある日本最大級の貯水量を持つ徳山ダムと、そのダム湖（徳山湖）。湖面は通常立入禁止と案内されており、湖面開放日でも魚釣りは禁止とされている。上流の才谷合流点・黒谷合流点より上の揖斐川や支流も、岐阜県の指示で一年中すべての魚の採捕が禁止されている。ダム湖周辺で釣りをすることはできないので、ダム見学や紅葉ドライブで訪れてほしい。",
};

export const spotBanOverrides: Record<string, SpotBanOverride> = {
  // ─────────── 指示書03（2026-11-23） ───────────
  "kagoshima-port": kagoshimaPort(
    "鹿児島市本港新町、桜島フェリーターミナルのある鹿児島港本港区。港湾を管理する鹿児島県は、岸壁について事故防止の観点から原則として関係者以外の立入を禁止しており、本港区の一部の岸壁は保安法に基づく制限区域にもなっている。フェリーターミナル周辺の岸壁で釣りをすることはできない。錦江湾で釣りをするなら、釣りが認められた施設や場所を選び、現地の掲示に従ってほしい。"
  ),
  "kagoshima-kita-futo-w6": kagoshimaPort(
    "鹿児島港本港区の北ふ頭。北ふ頭1号岸壁は国際船舶・港湾保安法に基づく制限区域で、立入には鹿児島県の許可証が必要になる。港湾を管理する鹿児島県は、岸壁について原則として関係者以外の立入を禁止しており、北ふ頭で釣りをすることはできない。錦江湾で釣りをするなら、釣りが認められた施設や場所を選び、現地の掲示に従ってほしい。"
  ),
  "kagoshima-shinko": kagoshimaPort(
    "鹿児島市の鹿児島港。港湾を管理する鹿児島県は、岸壁について事故防止の観点から原則として関係者以外の立入を禁止しており、フェリーの見送りでも岸壁には入れないと案内している。港の岸壁で釣りをすることはできない。錦江湾で釣りをするなら、釣りが認められた施設や場所を選び、現地の掲示に従ってほしい。"
  ),
  "tokuyama-dam-gifu": TOKUYAMA_DAM,

  // ─────────── 全面禁止 ───────────
  "nanko-kita-breakwater": {
    fishingBan: {
      scope: "full",
      reason:
        "大阪港湾局は、南港北防波堤（住之江区南港北3丁目地先）を大阪市港湾施設条例第10条に基づく立入禁止区域に指定しています。防波堤の全長（約350m）が対象のため、釣りはできません。近くでは大阪南港魚つり園護岸が、時間を区切って釣りのできる区域とされています。",
      sourceUrls: OSAKA_PORT_BAN_URLS,
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["osaka-nanko-fishing-park"],
    },
    description:
      "大阪市住之江区、南港エリア北側の防波堤。大阪港湾局が大阪市港湾施設条例に基づく立入禁止区域に指定しており、防波堤の全長が対象のため、現在は立ち入りも釣りもできません。南港で釣りをするなら、時間を区切って開放されている大阪南港魚つり園護岸を利用してください（水曜・年末年始は休み）。",
  },
  "kobe-wadabou": {
    fishingBan: {
      scope: "full",
      reason:
        "神戸市は、和田岬防波堤をはじめ神戸港の主要な防波堤を立入禁止区域としています。防波堤は一般の利用を想定した施設ではなく転落の危険があるためで、遊漁船事業者などによる防波堤への瀬渡しも禁止しています。",
      sourceUrls: [
        "https://www.city.kobe.lg.jp/a42810/kouwanshisetu/tachiirikinnshi.html",
        "https://www.city.kobe.lg.jp/documents/37319/20260730154217.pdf",
      ],
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["kobe-airport-gogan"],
    },
    description:
      "神戸港・和田岬の沖にある防波堤（和田防）。港湾管理者の神戸市は、和田岬防波堤を含む神戸港の主要な防波堤を立入禁止区域としており、渡船（瀬渡し）で防波堤に渡ることも禁止しています。現在ここで釣りはできません。神戸港周辺で釣りをするなら、市が港湾施設で唯一釣りを認めている神戸空港島の親水護岸や、垂水区の平磯海づり公園を利用してください。",
  },
  // SNS「タチウオが釣れる兵庫の釣り場TOP10」へのコメント指摘を受けて、掲載10件を公式資料で確認（2026-11-21）
  "suma-ko-hitomoji": {
    fishingBan: {
      scope: "full",
      reason:
        "神戸市は、須磨港南防波堤・須磨港西波除堤など須磨海岸の各防波堤・離岸堤を立入禁止区域に指定しています。防波堤は一般の立ち入りを想定した施設ではなく転落の危険があるためで、遊漁船事業者などによる瀬渡しも禁止しています。",
      sourceUrls: ["https://www.city.kobe.lg.jp/documents/37319/kisei2.pdf", "https://www.city.kobe.lg.jp/a42810/kouwanshisetu/tachiirikinnshi.html"],
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["kobe-airport-gogan"],
    },
    description:
      "須磨港沖の防波堤（一文字）。港湾管理者の神戸市は、須磨港南防波堤・西波除堤など須磨海岸の防波堤・離岸堤を立入禁止区域としており、渡船（瀬渡し）で防波堤に渡ることも禁止しています。現在ここで釣りはできません。神戸周辺で釣りをするなら、市が港湾施設で唯一釣りを認めている神戸空港島の親水護岸や、垂水区の平磯海づり公園を利用してください。",
  },
  "minami-ashiyahama": MINAMI_ASHIYA,
  "minami-ashiyahama-veranda": MINAMI_ASHIYA,

  "port-island-north-park": {
    fishingBan: {
      scope: "full",
      reason:
        "神戸市は、神戸港の岸壁・物揚場・護岸での魚釣りを禁じており、港の緑地（公園）でも魚類の捕獲が禁じられているため、ポートアイランド北公園を含む神戸港内では釣りができません。神戸港の港湾施設で釣りができるのは、神戸空港島の親水護岸だけです。",
      sourceUrls: KOBE_PORT_FISHING_URLS,
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["kobe-airport-gogan"],
    },
    description:
      "神戸ポートアイランドの北端にある公園の護岸。神戸の街並みと海を一望できる夜景スポットだが、神戸市は神戸港の護岸や港の緑地（公園）での魚釣りを禁じており、ここで釣りはできない。神戸港で釣りをするなら、市が港湾施設で唯一釣りを認めている神戸空港島の親水護岸を利用してほしい。",
  },
  "tokyokou-harumi-futou-a13": {
    fishingBan: {
      scope: "full",
      reason:
        "東京都港湾局は、晴海ふ頭公園の「公園内の主なルール」で釣りを禁止しています。隣接する晴海緑道公園（中央区晴海四丁目の海側）は、一部のエリアを除いて釣りができる公園として案内されています。",
      sourceUrls: [
        "https://www.kouwan.metro.tokyo.lg.jp/kanko/harumi_kaien.pdf",
        "https://www.kouwan.metro.tokyo.lg.jp/documents/d/kouwan/guide25_01",
      ],
      confirmedAt: CONFIRMED,
    },
    description:
      "中央区晴海の埠頭に整備された都立の海上公園。東京湾の夜景を望む都心のウォーターフロントだが、東京都港湾局は晴海ふ頭公園での釣りを禁止している。近くで釣りをするなら、一部のエリアを除いて釣りができる晴海緑道公園（晴海四丁目の海側）を利用し、現地の掲示に従ってほしい。",
  },

  // ─────────── 一部禁止・条件付き ───────────
  "maishima-gogan": MAISHIMA,
  "maishima-gogan-a11": MAISHIMA,
  "maishima-seaside-promenade": MAISHIMA,
  "maishima-tsuri": MAISHIMA,

  "rokko-island-marine-park": {
    // 本文はすでに「有料の釣りゾーン内に限られる」と書いているので差し替えない
    fishingBan: {
      scope: "partial",
      reason:
        "神戸市は神戸港の護岸・緑地での魚釣りを禁じています。六甲アイランドマリンパークでは、市が公募した事業者による有料の釣りゾーン「海釣りGO六甲マリンパーク」が実証事業として運営されており、釣りができるのはこのゾーンの中だけです。",
      sourceUrls: ["https://www.city.kobe.lg.jp/a49918/20240301.html", KOBE_PORT_FISHING_URLS[0]],
      confirmedAt: CONFIRMED,
    },
  },

  "odawara-hayakawa-port": ODAWARA,
  "odawara-hayakawa-kou-e8": ODAWARA,
  "odawara-kou-hayakawa-a11": ODAWARA,

  "umikaze-park": {
    fishingBan: {
      scope: "partial",
      reason:
        "横須賀市は、うみかぜ公園での釣りは平日のみ可能で、土日祝日は釣り禁止と案内しています。園内の展望台4か所は終日釣り禁止です。休日に釣りをするなら、隣接する市の「海辺つり公園」を利用できます。",
      sourceUrls: [
        "https://www.city.yokosuka.kanagawa.jp/5820/minato/amenity_kouen/umikaze/index.html",
        "https://www.city.yokosuka.kanagawa.jp/5820/minato/amenity_kouen/umituri/index.html",
      ],
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["umibe-tsuri-park"],
    },
    notice: "※うみかぜ公園の釣りは平日のみ。土日祝日と、展望台4か所（終日）は釣り禁止です（横須賀市）。",
  },

  "yokohama-honmoku-gogan-a12": {
    fishingBan: {
      scope: "partial",
      reason:
        "横浜市港湾局は、市が管理するふ頭の岸壁・防波堤・護岸などの港湾施設について、保安と荷役作業の安全のため一般の立ち入りを制限しており、本牧ふ頭防波堤は立入禁止としています。本牧ふ頭で釣りをするなら、市の「本牧海づり施設」を利用するよう案内しています。",
      sourceUrls: YOKOHAMA_PORT_URLS,
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["honmoku-fishing"],
    },
    description:
      "横浜・本牧ふ頭の護岸。横浜市は、ふ頭の岸壁・防波堤・護岸への一般の立ち入りを制限しており、本牧ふ頭防波堤は立入禁止としている。本牧で釣りをするなら、市が運営する本牧海づり施設（営業中）を利用してほしい。足場が整備され、アジ・サバのサビキやクロダイ、メバルなどが狙える。",
  },
  "daikoku-futo-ryokuchi-kouen": {
    fishingBan: {
      scope: "partial",
      reason:
        "横浜市港湾局は、ふ頭の岸壁・防波堤などへの一般の立ち入りを制限しており、大黒防波堤は立入禁止としています。大黒ふ頭で釣りをするなら、市の「大黒海づり施設」を利用するよう案内しています。",
      sourceUrls: YOKOHAMA_PORT_URLS,
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["daikoku-fishing-facility"],
    },
    description:
      "横浜ベイブリッジの袂、大黒ふ頭の緑地。横浜市は、ふ頭の岸壁・防波堤への一般の立ち入りを制限しており、大黒防波堤は立入禁止としている。大黒ふ頭で釣りをするなら、市が運営する大黒海づり施設を利用してほしい。駐車場・トイレがあり、アジ・イワシのサビキやシーバス、秋のタチウオなどが狙える。",
  },

  "kasai-rinkai-park": {
    fishingBan: {
      scope: "partial",
      reason:
        "東京都港湾局は、葛西臨海公園の前に広がる葛西海浜公園について「砂浜・葛西渚橋での釣りはできません」と案内しています。東なぎさは環境保全のため一般の立ち入りが禁止されています。葛西海浜公園は区域などに制限のある釣りができる公園なので、現地の掲示に従ってください。",
      sourceUrls: [
        "https://www.kouwan.metro.tokyo.lg.jp/kanko/10_kaijokouen_kasai_202404.pdf",
        "https://www.kouwan.metro.tokyo.lg.jp/documents/d/kouwan/guide25_01",
      ],
      confirmedAt: CONFIRMED,
    },
    description:
      "東京湾に面した広大な都立公園。前に広がる葛西海浜公園は、砂浜（西なぎさ）と葛西渚橋での釣りが禁止され、東なぎさは立入禁止になっている（東京都港湾局）。釣りができるのは区域の制限を守れる場所だけなので、現地の掲示を必ず確認してほしい。秋のハゼなどが狙える。水族園や大観覧車もあり、家族連れの一日レジャーにも向く。",
  },

  "hakata-suzaki-futo-a9": HAKATA_SUZAKI,
  "hakata-suzaki-gokan": HAKATA_SUZAKI,

  // ─────────── 2026-11-21 一斉監査の反映 ───────────
  ...SENDAI_SHIOGAMA_FULL,
  "sendai-ko-chuo-koen": SENDAI_PARK,
  "sendai-chuo-park": SENDAI_PARK,
  ...YAMAGATA_FULL,
  ...NIIGATA_FULL,
  "niigata-nishi-port": NIIGATA_PARTIAL,
  "niigata-higashi-kou": NIIGATA_PARTIAL,
  "niigata-higashiko-dai2-bohatei": NIIGATA_PARTIAL,
  "niigata-higashikou-dai2-bouhatei": NIIGATA_PARTIAL,
  "niigata-higashikou-daini-bohatei-a12": NIIGATA_PARTIAL,
  ...OARAI_FULL,
  "yaizu-ko": YAIZU_GYOKO,
  "yaizu-shinko": YAIZU_GYOKO,
  "yaizu-shinko-teibo": YAIZU_GYOKO,
  "tambarako-dam-a12": TAMBARA,
  // スポット自体が消波ブロックの上なので、注記ではなく本文を差し替える（消波ブロックは全面立入禁止）
  "hayakawa-kakou-tetra-e8": {
    fishingBan: { ...ODAWARA.fishingBan, scope: "full" },
    description:
      "小田原市・早川河口の消波ブロック（テトラ）帯。神奈川県西部漁港事務所は、小田原漁港（早川港）の消波ブロックの上を全面的に立入禁止としており、このテトラ帯に乗って釣りをすることはできません。立入禁止の場所に入ると軽犯罪法違反になるおそれがあります。早川周辺で釣りをするなら、立入禁止でない岸壁で、現地の掲示に従ってください。",
  },
  "fukuura-ganpeki": {
    fishingBan: {
      scope: "full",
      reason:
        "横浜市港湾局は、市が管理するふ頭の岸壁・防波堤・護岸などの港湾施設について、保安と荷役作業の安全のため一般の立ち入りを制限しており、海づり施設を除いて立ち入り・釣りはできません。横浜港で釣りをするなら、市の本牧・大黒・磯子の海づり施設を利用するよう案内しています。",
      sourceUrls: YOKOHAMA_PORT_URLS,
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["daikoku-fishing-facility", "honmoku-fishing"],
    },
    description:
      "横浜市金沢区福浦の岸壁。かつては八景島シーパラダイスの対岸でタチウオやアジが狙える釣り場として知られたが、横浜市港湾局は、ふ頭の岸壁・防波堤・護岸への一般の立ち入りを海づり施設を除いて制限しており、現在ここで釣りはできません。横浜港で釣りをするなら、市が運営する本牧・大黒・磯子の海づり施設を利用してください。",
  },
  "akashi-kaikyo-bridge-shita": {
    fishingBan: {
      scope: "full",
      reason:
        "神戸市は、神戸港の岸壁・物揚場・護岸・防波堤での魚釣りを禁じており、港の緑地でも魚類の捕獲が禁じられています。神戸港の港湾施設で釣りができるのは、神戸空港島の親水護岸など市が開放している施設だけです。",
      sourceUrls: KOBE_PORT_FISHING_URLS,
      confirmedAt: CONFIRMED,
      alternativeSpotSlugs: ["kobe-airport-gogan"],
    },
    description:
      "明石海峡大橋の下、舞子側（神戸市垂水区）の護岸。潮通しの良い海峡に面し青物の回遊ルートとして知られてきたが、神戸市は神戸港の岸壁・護岸・防波堤での魚釣りを禁じており、現在ここで釣りはできません。神戸周辺で釣りをするなら、市が港湾施設で釣りを認めている神戸空港島の親水護岸や、垂水区の平磯海づり公園を利用してください。",
  },
  ...Object.fromEntries(TOTTORI_GYOKO_SLUGS.map((slug) => [slug, TOTTORI_GYOKO])),

  // ── 徳山ダム（徳山湖）。調査記録: docs/fishing-ban-investigation-03.md #29/#31（2026-11-21） ──
  // 重複統合で負けた gifu-tokuyama-dam-lake の「ダム湖は立入制限がある」が本番から消えていたため、勝者に付ける。
  // 出典（sourceUrls）は一次情報の岐阜県のみ。湖面の立入禁止は徳山会館の指定管理者（民間）の告知で
  // 一次情報ではないため、出典には入れず、本文で告知元を明記するにとどめる（FishingBan の運用ルール）。
  "tokuyama-dam-gifu": {
    fishingBan: {
      scope: "partial",
      reason:
        "岐阜県内水面漁場管理委員会の指示により、徳山ダムの上流のうち塚・門入地区より上流の支流では、全魚種の採捕が一年を通して禁止されています。ダム湖（徳山湖）の湖面は、徳山会館の運営者の告知では通常全域が立入禁止で、湖面を開放する日も魚釣りは禁止とされています。",
      sourceUrls: [
        "https://www.pref.gifu.lg.jp/page/8519.html",
        "https://www.pref.gifu.lg.jp/uploaded/attachment/35697.pdf",
      ],
      confirmedAt: CONFIRMED,
    },
    description:
      "揖斐川の最上流、揖斐川町開田にある日本最大級の貯水量を誇る徳山ダムと、そのダム湖の徳山湖。湖面は通常全域が立入禁止で、湖面を開放する日も魚釣りは禁止と告知されている（徳山会館の運営者）。さらに岐阜県の指示で、塚・門入地区より上流の支流は全魚種が一年中採捕禁止のため、ダム湖とその上流で釣りはできない。ダムは青く澄んだ湖面と山並みを眺める観光で訪れ、渓流釣りは禁止区域の外で漁協の遊漁規則を確かめてから楽しみたい。",
  },
};
