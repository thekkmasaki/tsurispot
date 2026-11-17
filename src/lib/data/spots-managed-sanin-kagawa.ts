/** 管理釣り場・釣り堀（鳥取・島根・香川）。値は公式等で 2026-11-17 に確認。候補表: .managed-cache/candidates-sanin-kagawa.md */
import type { FishingSpot, FishSpecies, Region } from "@/types";
import { getFishBySlug } from "./fish";

function fish(slug: string): FishSpecies {
  const f = getFishBySlug(slug);
  if (!f) throw new Error(`Fish not found: ${slug}`);
  return f;
}

// 内陸の施設用ローカル region(regions.ts に合う内陸エリアが無いため)
const R_TOTTORI_KURAYOSHI: Region = { id: "rmp-tottori-kurayoshi", prefecture: "鳥取県", areaName: "倉吉・関金（大山東麓）", slug: "tottori-kurayoshi-mp" };
const R_TOTTORI_YAZU: Region = { id: "rmp-tottori-yazu", prefecture: "鳥取県", areaName: "八頭・智頭（八東川流域）", slug: "tottori-yazu-mp" };
const R_TOTTORI_KOKUFU: Region = { id: "rmp-tottori-kokufu", prefecture: "鳥取県", areaName: "鳥取市東部（国府）", slug: "tottori-kokufu-mp" };
const R_SHIMANE_UNNAN: Region = { id: "rmp-shimane-unnan", prefecture: "島根県", areaName: "雲南・飯南（斐伊川上流）", slug: "shimane-unnan-mp" };
// 東かがわの海エリア。regions.ts には東讃のエリアが無いため、
// 既存スポット(spots-chugoku-shikoku-kyushu-add2.ts)のローカル定義 r2822 と同じ値をそのまま使う
const R_KAGAWA_HIGASHIKAGAWA: Region = { id: "r2822", prefecture: "香川県", areaName: "さぬき・東かがわ", slug: "kagawa-sanuki-higashi" };

export const managedSaninKagawaSpots: FishingSpot[] = [
  // ============================================================
  // 鳥取県
  // ============================================================
  // 座標は大字中心(国土地理院 住所検索「関金町小泉」。番地不明)
  {
    id: "mp-4200",
    name: "清流遊YOU村フィッシングセンター(小泉川養魚場)",
    slug: "tottori-kurayoshi-seiryu-youyoumura",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "倉吉市関金町の小鴨川源流に設けられた渓流型の釣り場で、流れを24の区画に分け、一人で一区画を使ってニジマス・ヤマメ・イワナを狙う。" +
      "釣り方はエサ釣りのみで、竿とエサは現地で借りられる。養魚場の運営で年中営業しているが、大雪の時期は休むことがある。" +
      "釣りのほかに重量制のつかみどりもあり、家族連れでも楽しめる。",
    latitude: 35.3517,
    longitude: 133.6335,
    address: "鳥取県倉吉市関金町小泉639",
    accessInfo: "倉吉市関金町小泉、小鴨川の上流。駐車場あり。",
    region: R_TOTTORI_KURAYOSHI,
    spotType: "river",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "エサ釣り1日 大人4,000円・小学生以下2,000円。竿500円、エサ500円。つかみどり ニジマス1kg 1,600円、ヤマメ・イワナ1kg 2,700円",
    hasParking: true,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿 500円、エサ 500円",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://koizumigawa.com/tsuriba.html",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "開場直後", method: "エサ釣り", source: "https://koizumigawa.com/tsuriba.html (公式)" },
      { fish: fish("yamame"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り", source: "https://koizumigawa.com/tsuriba.html (公式)" },
      { fish: fish("iwana"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り", source: "https://koizumigawa.com/tsuriba.html (公式)" },
    ],
    bestTimes: [
      { label: "開場直後", timeRange: "7:00〜9:00(10〜2月は8:00〜)", rating: "best" },
      { label: "日中", timeRange: "9:00〜15:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "caution",
    safetyNotes: ["川の中の岩は滑りやすい", "冬は大雪で休業することがある"],
    managementInfo: {
      organizationName: "株式会社小泉川養魚場",
      contactPhone: "0858-45-2900",
      contactUrl: "https://koizumigawa.com/tsuriba.html",
      openingHours: "3〜9月 7:00〜18:00、10〜2月 8:00〜16:30",
      closedDays: "年中無休(大雪等で冬季休業の場合あり)",
      fishingFee: "エサ釣り1日 大人4,000円・小学生以下2,000円",
      notes: [
        "確認日 2026-11-17(運営会社の公式サイト・倉吉観光情報)",
        "エサ釣り専用(公式に明記)",
        "24区画に分かれ、一人一区画を使う",
        "2025-10-19 に GFG ファミリー渓流釣り大会の会場",
        "持ち帰り条件・予約の要否は未確認",
        "トイレの有無は未確認",
      ],
    },
  },

  // 座標は大字中心(国土地理院 住所検索「関金町野添」。番地不明。東大山大橋付近の実位置とずれる可能性)
  {
    id: "mp-4201",
    name: "東大山養魚場 にじます釣り堀(渓流料理いわなや)",
    slug: "tottori-kurayoshi-higashidaisen-nijimasu-tsuribori",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "関金町野添の東大山養魚場にあるニジマスの釣り堀で、同じ運営会社の渓流料理店「いわなや」に隣接している。" +
      "釣った魚は重さで料金が決まり、別料金で店に調理を頼むこともできる。料理店の営業は4月から11月末まで。" +
      "日曜・祝日は釣り堀の魚が足りないことがあるため、出かける前に電話で確かめておくと安心。",
    latitude: 35.3635,
    longitude: 133.6058,
    address: "鳥取県倉吉市関金町野添467-204",
    accessInfo: "倉吉市関金町野添(笹ヶ平)、東大山大橋付近。駐車場あり。",
    region: R_TOTTORI_KURAYOSHI,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "ニジマス 1kg 1,600円(重量制)。調理は別料金",
    hasParking: true,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: false,
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://koizumigawa.com/restaurant.html",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "昼前後", method: "釣り堀(釣り方は未確認)", source: "https://koizumigawa.com/restaurant.html (公式)" },
    ],
    bestTimes: [
      { label: "料理店の営業時間", timeRange: "11:00〜13:30", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "株式会社小泉川養魚場(東大山養魚場・渓流料理いわなや)",
      contactPhone: "0858-45-3890",
      contactUrl: "https://koizumigawa.com/restaurant.html",
      openingHours: "料理店 4月1日〜11月30日 11:00〜13:30(LO)。釣り堀単体の営業時間は未確認",
      closedDays: "料理店は第2・4木曜",
      fishingFee: "ニジマス 1kg 1,600円",
      notes: [
        "確認日 2026-11-17(運営会社の公式サイト・鳥取中部観光ページ)",
        "営業期間は未確認(料理店は4〜11月営業)",
        "日祝は釣り堀の魚がない場合があるため事前に問い合わせ(公式)",
        "釣り方・子ども料金・貸し竿・持ち帰り条件は未確認",
        "トイレの有無は未確認",
      ],
    },
  },

  // 座標は大字中心(国土地理院 住所検索「八頭町福地」。番地不明)
  {
    id: "mp-4202",
    name: "私都やまめ養殖場(私都養殖漁業生産組合)",
    slug: "tottori-yazu-kisaichi-yamame",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "八頭町福地にあるヤマメとイワナの養殖場で、いけすの一部を釣り堀として開放している。" +
      "2026年は夏の高水温のため7月から9月末まで釣り堀を休み、10月に再開する予定と案内されていたが、再開日は決まっていなかった。" +
      "活魚の販売は休止中も続けている。料金や営業時間は公表されていないので、出かける前に組合へ電話で確かめたい。",
    latitude: 35.4149,
    longitude: 134.3387,
    address: "鳥取県八頭郡八頭町福地156",
    accessInfo: "八頭町福地(私都地区)。",
    region: R_TOTTORI_YAZU,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "料金は未確認(組合へ問い合わせ)",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: false,
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://yazukanko.jp/seeing_play/onsen-park/kisaichiyoushoku/",
    catchableFish: [
      { fish: fish("yamame"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "釣り堀(釣り方は未確認)", source: "https://yazukanko.jp/seeing_play/onsen-park/kisaichiyoushoku/ (八頭町観光協会)" },
      { fish: fish("iwana"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "釣り堀(釣り方は未確認)", source: "https://yazukanko.jp/seeing_play/onsen-park/kisaichiyoushoku/ (八頭町観光協会)" },
    ],
    bestTimes: [
      { label: "午前", timeRange: "営業開始〜12:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "私都養殖漁業生産組合",
      contactPhone: "0858-74-0250",
      contactUrl: "https://yazukanko.jp/seeing_play/onsen-park/kisaichiyoushoku/",
      notes: [
        "確認日 2026-11-17(八頭町観光協会のお知らせ)",
        "令和8年7月付: 高水温のため9月末まで釣り堀を休止、10月の再開日は未定(電話かウェブで確認を)。活魚販売は継続",
        "営業期間は未確認",
        "料金・営業時間・定休日・釣り方は未確認",
        "トイレ・駐車場の有無は未確認",
      ],
    },
  },

  // 座標は大字中心(国土地理院 住所検索「国府町広西」。番地不明)
  {
    id: "mp-4203",
    name: "屋内釣り堀 フィッシュパーク ちいさな海賊",
    slug: "tottori-tottori-kokufu-chiisana-kaizoku",
    isManagedPond: true,
    facilityKind: "tsuribori",
    description:
      "鳥取市国府町広西にある屋内の釣り堀で、天気に左右されずにエサ釣りを楽しめる。公式の Instagram ではタナゴの釣り堀として紹介されている。" +
      "火・木・土日・祝日は11時から営業し、予約は電話で受け付けている。料金や他の曜日の営業、終了時刻は公表情報から読み取れないため、事前に問い合わせたい。",
    latitude: 35.4611,
    longitude: 134.2812,
    address: "鳥取県鳥取市国府町広西274-2",
    accessInfo: "鳥取市国府町広西。",
    region: R_TOTTORI_KOKUFU,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "料金は未確認(電話で問い合わせ)",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: false,
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://www.instagram.com/c.pir.ate07/",
    catchableFish: [
      { fish: fish("tanago"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "開店直後", method: "エサ釣り", source: "https://www.instagram.com/c.pir.ate07/ (公式Instagram)" },
    ],
    bestTimes: [
      { label: "開店直後", timeRange: "11:00〜13:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "フィッシュパーク ちいさな海賊",
      contactPhone: "090-6834-2411",
      contactUrl: "https://www.instagram.com/c.pir.ate07/",
      openingHours: "火・木・土日・祝日 11:00〜(終了時刻は未確認)",
      notes: [
        "確認日 2026-11-17(公式Instagram。最終投稿 2026-11-09 頃)",
        "営業期間は未確認。月・水・金の営業は未確認",
        "錦鯉・フナ・金魚は施設紹介文(地図サイト転載)にのみ記載があり未確認",
        "料金・貸し竿・持ち帰り条件は未確認",
        "トイレ・駐車場の有無は未確認",
      ],
    },
  },

  // ============================================================
  // 島根県
  // ============================================================
  // 座標は大字中心(国土地理院 住所検索「吉田町吉田」)。公式住所の「芦谷」は住所検索に無く、
  // 芦谷峡(深野川上流)は大字中心から数kmずれているおそれがある。要調整
  {
    id: "mp-4204",
    name: "芦谷峡やまめの里",
    slug: "shimane-unnan-ashidanikyo-yamame-no-sato",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "雲南市吉田町の芦谷峡で、清流を引き込んだ釣り堀でヤマメやニジマスを釣る施設。貸し竿のエサ釣りで、竿代に釣った魚の重さ分の料金を足す仕組み。" +
      "釣った魚は持ち帰れるほか、その場で調理してもらい座敷で食べることもできる。つかみ取りもある。" +
      "例年4月から10月(11月は土日のみ)の営業で、雲南市観光協会では2026年度の営業は終了と案内されている。",
    latitude: 35.1545,
    longitude: 132.8546,
    address: "島根県雲南市吉田町芦谷37-1",
    accessInfo: "雲南市吉田町、深野川上流の芦谷峡。",
    region: R_SHIMANE_UNNAN,
    spotType: "river",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "竿500円+釣った魚1kg 4,500円。つかみ取り 6匹3,300円・10匹5,500円(1時間)。繁忙期(4/29〜5/5・8/11〜16)は別料金区分あり",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿 500円(エサ釣り)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://yamamenosato.net/",
    catchableFish: [
      { fish: fish("yamame"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(貸し竿)", source: "https://yamamenosato.net/fishing (公式)" },
      { fish: fish("nijimasu"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(貸し竿)", source: "https://yamamenosato.net/fishing (公式)" },
      { fish: fish("iwana"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り(貸し竿)", source: "https://yamamenosato.net/ (公式・紹介文)" },
    ],
    bestTimes: [
      { label: "開場直後", timeRange: "9:00〜11:00", rating: "best" },
      { label: "午後", timeRange: "11:00〜最終受付", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "芦谷峡やまめの里",
      contactPhone: "0854-74-0025",
      contactUrl: "https://yamamenosato.net/",
      openingHours: "4月1日〜10月31日 9:00〜16:00(最終受付 平日14:30・土日祝と夏休み15:30)、11月は土日のみ 9:00〜15:00",
      closedDays: "火曜(7・8月は無休)。雨天は早仕舞いあり",
      fishingFee: "竿500円+釣った魚1kg 4,500円",
      notes: [
        "確認日 2026-11-17(公式サイト・雲南市観光協会)",
        "雲南市観光協会は「2026年度の営業は終了」と案内(11月の土日営業の有無は公式と食い違い)",
        "針外しは自分で行い、計量して終了",
        "持ち帰り可(クーラー持参を推奨)。その場で調理・座敷で食事可",
        "公式の予約ページあり",
        "公式の住所は「吉田町芦谷37-1」、県・市の観光サイトは「吉田町吉田37-1」",
        "池か川かは公式に明記なし(清流を利用した釣堀)",
        "トイレ・駐車場の有無は未確認",
      ],
    },
  },

  // 座標は大字中心(国土地理院 住所検索「飯南町志津見」。番地不明)
  {
    id: "mp-4205",
    name: "志都の里 やまめの渓",
    slug: "shimane-iinan-shizunosato-yamame-no-tani",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "飯南町志津見のうぐいす茶屋の隣にあるヤマメの釣り堀で、つかみ取り用の池も備える。入場料に竿と練りエサが含まれ、釣ったヤマメは1匹ずつ買い取る形なので、道具を持たずに気軽に試せる。" +
      "塩焼きにしてもらうこともできる。営業は4月から10月末までの日曜・祝日で、2026年のシーズンはすでに終わっている。",
    latitude: 35.1373,
    longitude: 132.694,
    address: "島根県飯石郡飯南町志津見351-1",
    accessInfo: "飯南町志津見、うぐいす茶屋の隣。",
    region: R_SHIMANE_UNNAN,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "1日500円(竿・練りエサ込)、ヤマメ1匹250円、つかみ取り1人200円、塩焼き+150円/匹(掲載時期不明のため要再確認)",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿・練りエサは入場料に込み",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://flowervalley.jp/%e3%82%84%e3%81%be%e3%82%81%e3%81%ae%e6%b8%93%ef%bc%88%e9%87%a3%e3%82%8a%e5%a0%80%ef%bc%89/",
    catchableFish: [
      { fish: fish("yamame"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(貸し竿・練りエサ)", source: "https://flowervalley.jp/%e3%82%84%e3%81%be%e3%82%81%e3%81%ae%e6%b8%93%ef%bc%88%e9%87%a3%e3%82%8a%e5%a0%80%ef%bc%89/ (公式)" },
    ],
    bestTimes: [
      { label: "開場直後", timeRange: "9:00〜11:00", rating: "best" },
      { label: "日中", timeRange: "11:00〜15:00(最終受付)", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    managementInfo: {
      organizationName: "有限会社志都の里",
      contactPhone: "0854-73-0088",
      contactUrl: "https://flowervalley.jp/%e3%82%84%e3%81%be%e3%82%81%e3%81%ae%e6%b8%93%ef%bc%88%e9%87%a3%e3%82%8a%e5%a0%80%ef%bc%89/",
      openingHours: "4月〜10月末の日曜・祝日 9:00〜16:00(最終受付15:00)",
      closedDays: "平日(団体貸切のみ相談可)、11〜3月は休業",
      fishingFee: "1日500円+ヤマメ1匹250円",
      notes: [
        "確認日 2026-11-17(グループ会社フラワーバレーの公式ページ・公式Instagram・飯南町観光協会)",
        "2026年は4月12日オープン(公式Instagram 2026-03-23)",
        "釣った魚はすべて買い取り",
        "予約不要(平日の団体貸切は要問い合わせ)。うぐいす茶屋 0854-73-0002",
        "料金はフラワーバレー掲載の値で、更新日は未確認",
        "トイレ・駐車場の有無は未確認",
      ],
    },
  },

  // ============================================================
  // 香川県
  // ============================================================
  // 座標は大字中心(国土地理院 住所検索「東かがわ市引田」。番地不明。安戸池の位置へ要調整)
  {
    id: "mp-4206",
    name: "ソルトレイクひけた 安戸池(フィッシュフック)",
    slug: "kagawa-higashikagawa-hiketa-yasudoike-fishhook",
    isManagedPond: true,
    facilityKind: "kaijo",
    description:
      "海とつながる海水池・安戸池に設けられた生簀の釣り堀で、ハマチ・カンパチ・ヒラマサ・タイなどを狙える。生簀ではエサもルアーも使え、池の岸にはプラグやメタルジグで青物を狙うルアー専用のコーナーもある。" +
      "釣った魚は持ち帰れ、下処理や三枚おろしも頼める。同じ敷地の体験学習館マーレリッコでは、子ども向けのいけす鯛釣り体験もできる。",
    latitude: 34.2256,
    longitude: 134.3952,
    address: "香川県東かがわ市引田4373番地",
    accessInfo: "東かがわ市引田、安戸池。駐車場あり。",
    region: R_KAGAWA_HIGASHIKAGAWA,
    spotType: "pier",
    difficulty: "beginner",
    isFree: false,
    feeDetail:
      "生簀 中学生以上12,000円・女性と小学生8,000円・1時間ショート4,000円。ルアー(4/1〜1/14) 男性 1日7,000円・半日5,000円、女性・中学生以下 1日3,500円・半日2,500円(1/15〜2月末は割引)",
    hasParking: true,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿セット 2,000円",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://saltlake-hiketa.co.jp/fishhook",
    catchableFish: [
      { fish: fish("buri"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "釣り開始直後", method: "エサ釣り・ルアー", source: "https://saltlake-hiketa.co.jp/fishhook (公式・ハマチ)" },
      { fish: fish("kanpachi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り・ルアー", source: "https://saltlake-hiketa.co.jp/fishhook (公式)" },
      { fish: fish("hiramasa"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り・ルアー", source: "https://saltlake-hiketa.co.jp/fishhook (公式)" },
      { fish: fish("madai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り", source: "https://saltlake-hiketa.co.jp/fishhook (公式・タイ)" },
    ],
    bestTimes: [
      { label: "朝の部の開始直後", timeRange: "7:00〜9:00", rating: "best" },
      { label: "朝の部後半", timeRange: "9:00〜11:00", rating: "good" },
      { label: "午後の部", timeRange: "12:00〜16:00", rating: "fair" },
    ],
    tackleRecommendations: [],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: false,
      fishingLicenseRequired: false,
      maxRods: 1,
      otherRules: [
        "生簀は竿1本、サビキ禁止",
        "ルアーコーナーはルアー専用(プラグ・メタルジグ・バイブ・ワーム)、ジグサビキ不可",
        "中学生以下は保護者同伴",
      ],
    },
    safetyLevel: "safe",
    safetyNotes: ["生簀の上で釣るため、子どもは保護者が付き添う"],
    managementInfo: {
      organizationName: "ソルトレイクひけた",
      contactPhone: "0879-33-2800",
      contactUrl: "https://saltlake-hiketa.co.jp/fishhook",
      openingHours: "生簀 7:00〜11:00・12:00〜16:00、ルアー 7:00〜16:00(半日 7:00〜12:00 または 11:00〜16:00)",
      closedDays: "1月1日・2日",
      fishingFee: "生簀 中学生以上12,000円、ルアー 1日7,000円(男性)",
      notes: [
        "確認日 2026-11-17(公式サイト 2026-10-20 付の料金表・うどん県旅ネット)",
        "生簀は予約優先(空きがあれば当日可)、貸切可",
        "持ち帰り可。下処理200円/匹、三枚おろし400円/匹",
        "同じ敷地の体験学習館マーレリッコでいけす鯛釣り(1,000円・鯛1匹込み)あり",
        "撒き餌の可否は未確認",
        "トイレの有無は未確認",
      ],
    },
  },
];
