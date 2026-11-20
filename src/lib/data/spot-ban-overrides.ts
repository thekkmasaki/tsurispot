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

export const spotBanOverrides: Record<string, SpotBanOverride> = {
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
  "hayakawa-kou": ODAWARA,

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
};
