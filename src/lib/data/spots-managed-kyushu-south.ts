/** 管理釣り場・釣り堀（鹿児島・沖縄）。値は公式等で 2026-11-17 に確認。候補表: .managed-cache/candidates-kyushu-south.md */
import type { FishingSpot, FishSpecies, Region } from "@/types";
import { getFishBySlug } from "./fish";
import { regions } from "./regions";

function fish(slug: string): FishSpecies {
  const f = getFishBySlug(slug);
  if (!f) throw new Error(`Fish not found: ${slug}`);
  return f;
}
function region(id: string): Region {
  const r = regions.find((r) => r.id === id);
  if (!r) throw new Error(`Region not found: ${id}`);
  return r;
}

// 内陸の施設用ローカル region(regions.ts の鹿児島県の既存エリアは海・河川が中心のため)
const R_OSUMI: Region = { id: "rmp-kagoshima-osumi", prefecture: "鹿児島県", areaName: "大隅（錦江・肝付）", slug: "kagoshima-osumi-mp" };
const R_SENDAIGAWA_UPPER: Region = { id: "rmp-kagoshima-sendaigawa-upper", prefecture: "鹿児島県", areaName: "川内川上流（伊佐・祁答院）", slug: "kagoshima-sendaigawa-upper-mp" };
const R_AIRA_YAMA: Region = { id: "rmp-kagoshima-aira-yama", prefecture: "鹿児島県", areaName: "姶良の山あい", slug: "kagoshima-aira-yama-mp" };

export const managedKyushuSouthSpots: FishingSpot[] = [
  // ============================================================
  // 鹿児島県
  // ============================================================
  // 座標は大字中心(国土地理院「錦江町田代麓」止まり。田代麓は広く、釣り場の位置とずれる可能性大。要調整)
  {
    id: "mp-5400",
    name: "奥花瀬ニジマス釣場",
    slug: "kagoshima-kinkocho-okuhanaze-nijimasu",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "錦江町の山あい、花瀬川の上流にあるニジマスの渓流釣り場。4月1日から11月3日までの季節営業で、今季の営業はすでに終わっている。" +
      "料金は貸竿1本・エサ・釣った魚1kgまでを含む定額制で、1kgを超えた分は重さで加算される。営業時間内なら釣りの時間制限はない。" +
      "竿の持ち込みはできず、場内の貸竿で釣る。休憩棟とトイレがあり、悪天候の日は期間中でも臨時休業することがある。",
    latitude: 31.169882,
    longitude: 130.898605,
    address: "鹿児島県肝属郡錦江町田代麓5138-529",
    accessInfo: "錦江町田代麓、花瀬川上流。駐車場あり。道順は公式サイトで確認を。",
    region: R_OSUMI,
    spotType: "river",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "2,500円(貸竿1本・エサ・釣った魚1kgまで込み)。1kg超は100gごとに250円",
    hasParking: true,
    hasToilet: true,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "貸竿1本は料金に含む(竿の持ち込み不可)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://okuhanaze.com",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "開場直後", method: "エサ釣り(貸竿)", source: "https://okuhanaze.com (公式)" },
    ],
    bestTimes: [
      { label: "開場直後", timeRange: "9:00〜11:00(平日は10:00〜)", rating: "best" },
      { label: "日中", timeRange: "11:00〜16:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "caution",
    safetyNotes: ["渓流の岸は滑りやすい", "悪天候時は臨時休業あり"],
    managementInfo: {
      organizationName: "奥花瀬ニジマス釣場",
      contactPhone: "0994-25-3376",
      contactUrl: "https://okuhanaze.com",
      openingHours: "4月1日〜11月3日。平日 10:00〜16:00、土日祝 9:00〜16:00、夏休み(7/21〜8/31) 9:00〜17:00",
      closedDays: "不定休(期間中も悪天候等で臨時休業あり)",
      fishingFee: "2,500円(1kgまで込み)、超過100gごと250円",
      notes: [
        "確認日 2026-11-17(公式サイト・鹿児島県観光サイト https://www.kagoshima-kankou.com/guide/10401)",
        "4月〜11月3日の季節営業。2026年の営業は11月3日で終了",
        "釣竿の持ち込み不可(グループ内での竿の貸し借りは可)。営業時間内は釣りの時間制限なし",
        "県観光サイトが「渓流釣り場」と記載。池か川区間かの図面は未確認",
        "子ども料金の区分・予約の要否は未確認",
      ],
    },
  },
  {
    id: "mp-5401",
    name: "マス釣り浜ちゃんパーク",
    slug: "kagoshima-kimotsuki-masutsuri-hamachan-park",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "肝付町富山にあるマス(ニジマス)釣りの施設。敷地内に清流が流れ、BBQプランや10名部屋2室の簡易宿泊施設も併設している。" +
      "予約はじゃらん・アソビューのネット予約か電話で受け付け、ナイトプランもある。" +
      "釣り料金・釣り方・持ち帰りの条件は公式に記載がなく、訪問前に電話で確かめたい。",
    latitude: 31.39246,
    longitude: 130.900894,
    address: "鹿児島県肝属郡肝付町富山407-1",
    accessInfo: "肝付町富山。駐車場の有無は未確認のため事前に問い合わせを。",
    region: R_OSUMI,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "釣り料金は公式に記載なし。BBQプラン 1人1,100円・未就学児550円、炭代1組200円",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: false,
    rentalDetail: "BBQ器材の準備可。貸竿の有無は未確認",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://www.instagram.com/masuturihamachan7/",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "釣り方は公式に記載なし", source: "https://www.instagram.com/masuturihamachan7/ (公式Instagram)" },
    ],
    bestTimes: [
      { label: "開場直後", timeRange: "11:00〜13:00", rating: "best" },
      { label: "午後", timeRange: "13:00〜17:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "マス釣り浜ちゃんパーク",
      contactPhone: "090-1871-0257",
      contactUrl: "https://www.jalan.net/kankou/spt_guide000000189153/activity/l00001A6D3/",
      openingHours: "11:00〜17:00(じゃらん掲載プラン)。ナイトプランあり",
      notes: [
        "確認日 2026-11-17(公式Instagram・じゃらん掲載)",
        "釣り場の型(池か水路か)は公式に記載がない。地図サービスの分類「釣り堀」から池型として扱っている",
        "住所はじゃらん掲載の「富山407-1」。公式Instagramは「冨山407」。座標は「富山407番地」で取得",
        "営業期間は未確認(じゃらんの掲載プラン開催期間は2027-08-31まで)",
        "釣り料金・定休日・持ち帰り条件・トイレ・駐車場は未確認",
        "じゃらん・アソビューでネット予約可",
      ],
    },
  },
  // 座標は大字中心(国土地理院「祁答院町黒木」止まり。番地まで当たらず。要調整)
  {
    id: "mp-5402",
    name: "矢立農村公園「せせらぎの里」ニジマス釣り",
    slug: "kagoshima-satsumasendai-yatate-seseraginosato-nijimasu",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "薩摩川内市祁答院町の矢立農村公園にあるニジマスの釣堀池。竿とエサを100円で借り、釣れたニジマスを1匹300円で買い取る仕組みで、ウロコと内臓の処理もしてもらえる。" +
      "入園と駐車は無料で、釣りは予約不要。園内では予約制のBBQもできる。" +
      "釣り堀は公園の休園日(火曜)に加えて月曜も休みなので、日程に注意したい。",
    latitude: 31.88018,
    longitude: 130.550079,
    address: "鹿児島県薩摩川内市祁答院町黒木2193",
    accessInfo: "祁答院町黒木。無料駐車場あり(約30台)。混雑日は乗り合わせ推奨。",
    region: R_SENDAIGAWA_UPPER,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "竿とエサ1組100円、ニジマス1匹300円(ウロコ・内臓処理込み)。入園・駐車無料",
    hasParking: true,
    parkingDetail: "無料 約30台",
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿とエサ 1組100円(園の竿を使用)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://www.city.satsumasendai.lg.jp/soshiki/1038/2/2/2695.html",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(園の竿)", source: "https://www.city.satsumasendai.lg.jp/soshiki/1038/2/2/2695.html (薩摩川内市)" },
    ],
    bestTimes: [
      { label: "開始直後", timeRange: "9:30〜11:00", rating: "best" },
      { label: "午後", timeRange: "13:00〜15:30(受付終了)", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "矢立農村公園「せせらぎの里」",
      contactPhone: "0996-55-1665",
      contactUrl: "https://www.city.satsumasendai.lg.jp/soshiki/1038/2/2/2695.html",
      openingHours: "開園 8:30〜17:00。ニジマス釣り 9:30〜16:00(受付15:30まで。2026年10月1日から)",
      closedDays: "毎週火曜(祝日も休み)。釣り堀は月曜も休業。GW・お盆・9/19〜23は無休、年末年始は臨時休園",
      fishingFee: "竿とエサ100円+1匹300円",
      notes: [
        "確認日 2026-11-17(薩摩川内市ページ・薩摩川内市観光物産協会 https://satsumasendai.gr.jp/spotlist/1697 ・県バリアフリーページ)",
        "電話は 0996-55-1665 のほか 080-2744-7530",
        "エサの持ち込み制限あり。釣った魚は買い取りで持ち帰り",
        "BBQ 1,500円(炭2kg込・要予約・コンロ持込不可・食材と食器は持参)",
        "季節営業の記載はなく通年営業とみられるが、営業期間は未確認",
        "トイレの有無は未確認",
      ],
    },
  },
  // 座標は大字中心(国土地理院「伊佐市大口小木原」止まり。番地不明で、十曽池奥の釣り場とは数km離れている可能性あり。要調整)
  {
    id: "mp-5403",
    name: "十曽釣り堀センター",
    slug: "kagoshima-isa-jisso-tsuribori-center",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "川内川上流漁業協同組合が伊佐市の後援で開く、夏休み期間だけのニジマス釣り堀。十曽池の奥にある大口養魚場跡の池を使い、2026年で3年目になる。" +
      "基本料金に貸竿・エサ・2匹分が含まれ、3匹目からは1匹ごとの追加料金。予約不要で手ぶらで参加できる。" +
      "2026年は7月18日〜8月30日の土日祝とお盆の3日間のみの営業で、毎年夏の告知を確認してから出かけたい。",
    latitude: 32.116795,
    longitude: 130.620285,
    address: "鹿児島県伊佐市大口小木原 十曽池奥(大口養魚場跡)",
    accessInfo: "伊佐市大口小木原、十曽池の奥。番地不明のため、開催告知の地図で場所を確認を。",
    region: R_SENDAIGAWA_UPPER,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "基本 1,000円(貸竿・エサ・2匹まで)、3匹目から1匹400円",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "貸竿1本・エサ付き(料金込み)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://www.facebook.com/senjougyo/",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 7, monthEnd: 8, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(貸竿)", source: "https://www.facebook.com/senjougyo/posts/1506348871525706/ (漁協公式Facebook)" },
    ],
    bestTimes: [
      { label: "開場直後", timeRange: "9:00〜11:00", rating: "best" },
      { label: "午後", timeRange: "11:00〜15:00(最終受付)", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "川内川上流漁業協同組合",
      contactUrl: "https://www.facebook.com/senjougyo/",
      openingHours: "夏季のみ。2026年は7月18日〜8月30日の土日祝+8月13〜15日、9:00〜15:30(最終受付15:00)",
      closedDays: "上記以外の日。悪天候時は休業",
      fishingFee: "基本1,000円(2匹まで)、追加1匹400円",
      notes: [
        "確認日 2026-11-17(漁協公式Facebook・伊佐市 https://www.city.isa.kagoshima.jp/blog/info-residency/info-event/73787/ ・伊佐市観光 https://isa-kanko.com/tour/jisso-tsuribori-2026/)",
        "年1回・約6週間の季節営業(夏休み期間の土日祝のみ)。2026年の営業は終了。2027年の開催は毎年夏の告知を確認",
        "釣った魚は持ち帰り可。クーラーボックス・氷は各自持参",
        "近くの十曽青少年旅行村でニジマス用BBQコンロの貸出あり",
        "番地・トイレ・駐車場は未確認",
      ],
    },
  },
  {
    id: "mp-5404",
    name: "渓谷苑 ニジマス釣り",
    slug: "kagoshima-aira-keikokuen-nijimasu",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "姶良市平松の山あいにある渓谷苑の釣り堀で、女山滝の清流を引き込んだ池でニジマスを釣る。貸竿とエサはそれぞれ100円、釣れた魚はすべて1匹400円で買い取る決まり。" +
      "その場で焼いてもらうこともでき、温泉と食事処も併設している。クーラーボックスの持ち込みは禁止で、必要な分だけ釣るのがここのルール。雨の日は釣りが休止になる。",
    latitude: 31.716782,
    longitude: 130.57077,
    address: "鹿児島県姶良市平松1773",
    accessInfo: "姶良市平松の山あい。駐車場の有無は公式に記載なし。",
    region: R_AIRA_YAMA,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "貸竿100円、エサ100円、ニジマス1匹400円(釣れた魚はすべて購入)、焼き1匹100円",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "貸竿100円、バケツ無料",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://keikokuen888.com/",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り", source: "https://keikokuen888.com/menu (公式)" },
    ],
    bestTimes: [
      { label: "開始直後", timeRange: "10:00〜12:00", rating: "best" },
      { label: "午後", timeRange: "12:00〜14:00(受付終了)", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "渓谷苑",
      contactPhone: "099-295-2044",
      contactUrl: "https://keikokuen888.com/menu",
      openingHours: "ニジマス釣り 10:00〜14:30(受付14:00まで、夏休みは15:00まで)。施設全体 9:30〜21:00",
      closedDays: "月曜(祝日は翌日)。雨天は釣り休止",
      fishingFee: "竿・エサ各100円+1匹400円",
      notes: [
        "確認日 2026-11-17(公式サイト・公式Facebook https://www.facebook.com/ueyamaonsen/)",
        "クーラーボックス等の持ち込み禁止。釣れた魚はすべて買い取りで、必要な分だけ釣る",
        "焼き・はらわた抜きは14:30まで対応",
        "季節営業の記載はなく通年営業とみられるが、営業期間は未確認",
        "トイレ・駐車場は公式に記載がなく未確認",
      ],
    },
  },

  // ============================================================
  // 沖縄県
  // ============================================================
  {
    id: "mp-5405",
    name: "つり堀 南山(なんざん)",
    slug: "okinawa-itoman-tsuribori-nanzan",
    isManagedPond: true,
    facilityKind: "tsuribori",
    description:
      "糸満市大里の集落にある、民家を改装した屋内の釣り堀。竿とエサ込みの時間制料金で、手ぶらで行けて雨や強い日差しを気にせず遊べる。" +
      "料金は50分・100分・150分の3コースで、小学生以下は割安。釣った魚は持ち帰れない。" +
      "2021年の紹介記事では大池に錦鯉とフナ、小池に金魚がいるとされる。",
    latitude: 26.127398,
    longitude: 127.69268,
    address: "沖縄県糸満市大里111",
    accessInfo: "糸満市大里。店の駐車場は未確認で、約100m先の大里公民館敷地に停められるとの訪問記あり。",
    region: region("r185"),
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "50分 中学生以上800円・小学生以下500円、100分 1,500円・900円、150分 2,100円・1,200円(竿・エサ込み)",
    hasParking: false,
    parkingDetail: "店の駐車場は未確認。約100m先の大里公民館敷地(訪問記ブログ)",
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿・エサは料金に含む(手ぶら可)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    catchableFish: [
      { fish: fish("koi"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "エサ釣り(貸竿)", source: "https://www.dee-okinawa.com/topics/2021/12/nanzan.html (2021年の紹介記事)" },
      { fish: fish("mabuna"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "エサ釣り(貸竿)", source: "https://www.dee-okinawa.com/topics/2021/12/nanzan.html (2021年の紹介記事)" },
    ],
    bestTimes: [
      { label: "開店直後", timeRange: "10:00〜12:00(土日祝)", rating: "good" },
      { label: "午後", timeRange: "12:00〜18:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "つり堀 南山",
      contactPhone: "090-2480-1363",
      openingHours: "平日 12:00〜18:00、土日祝 10:00〜18:00",
      closedDays: "金曜(祝日は営業)",
      fishingFee: "50分 800円(小学生以下500円)〜",
      notes: [
        "確認日 2026-11-17(訪問記ブログ https://soranbo-blog.com/okinawa-nanzan-tsuribori/ 2026-10-06更新・Instagram 2026-03-29投稿。公式サイトなし)",
        "魚種(錦鯉・フナ・金魚)の出典は2021年12月の DEE okinawa の記事のみで、2026年の情報源では魚種を確認できていない",
        "小池には金魚がいる(2021年の記事。金魚はデータ上の魚種に未登録のため本文のみ)",
        "釣った魚の持ち帰り不可。屋内施設",
        "営業時間・料金・電話はブログの訪問時の店内掲示より。通年営業とみられるが営業期間は未確認",
        "予約の要否・トイレは未確認",
      ],
    },
  },
];
