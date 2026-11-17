/** 管理釣り場・釣り堀（富山・石川・福井）。値は公式等で 2026-11-17 に確認。候補表: .managed-cache/candidates-hokuriku.md */
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

// 内陸の施設用のローカル region(regions.ts に合う内陸エリアが無いもの)
const R_MIMIGAWA: Region = { id: "rmp-fukui-mihama-mimigawa", prefecture: "福井県", areaName: "耳川（美浜・新庄）", slug: "fukui-mihama-mimigawa-mp" };
const R_NATASHO: Region = { id: "rmp-fukui-natasho", prefecture: "福井県", areaName: "名田庄（南川上流）", slug: "fukui-natasho-mp" };
const R_TAKAOKA_FUKUOKA: Region = { id: "rmp-toyama-takaoka-fukuoka", prefecture: "富山県", areaName: "高岡・福岡（小矢部川流域）", slug: "toyama-takaoka-fukuoka-mp" };
const R_NANTO: Region = { id: "rmp-toyama-nanto", prefecture: "富山県", areaName: "南砺（福光・城端）", slug: "toyama-nanto-mp" };

export const managedHokurikuSpots: FishingSpot[] = [
  // ============================================================
  // 福井県 海上釣り堀(日向湖・若狭湾)
  // ============================================================
  // 座標は国土地理院 住所検索「福井県美浜町日向33番地」(番地まで一致)
  {
    id: "mp-2400",
    name: "フィッシングランド日向",
    slug: "fukui-mihama-fishing-land-hiruga",
    isManagedPond: true,
    facilityKind: "kaijo",
    description:
      "美浜町の日向湖にある海上釣り堀で、マダイのほか大ブリやワラサ、クエ、イシガキダイ、シマアジ、イサキなどが放流される。" +
      "放流量の多い上級コースと、短時間で手軽なマニアコースがあり、朝の抽選で釣り座を決めてから入場する。" +
      "エサ釣りのみでルアーや引っ掛け釣りは禁止、竿は一人一本。釣った魚は持ち帰れ、血抜きは事務所側で行ってくれる。年始は1月2日から営業する。",
    latitude: 35.605797,
    longitude: 135.889786,
    address: "福井県三方郡美浜町日向33-4",
    accessInfo: "日向湖畔。無料駐車場あり。",
    region: region("re8031"),
    spotType: "pier",
    difficulty: "beginner",
    isFree: false,
    feeDetail:
      "上級コース 男性14,000円・女性12,000円・小学生以下7,000円、マニアコース 男性7,000円・女性6,000円・小学生以下4,500円(令和8年10月1日改定・税込)。貸切は上級 最低人数×14,000円〜、マニア 最低人数×7,000円〜",
    hasParking: true,
    parkingDetail: "無料",
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "貸し竿 1本 使用料1,500円+保証金1,500円",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://fl-hiruga.com/",
    catchableFish: [
      { fish: fish("madai"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "入場直後・放流後", method: "エサ釣り", source: "https://fl-hiruga.com/ (公式)" },
      { fish: fish("buri"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "放流後", method: "エサ釣り", source: "https://fl-hiruga.com/ (公式・大ブリ/オリーブハマチ/ブリヒラ)" },
      { fish: fish("kue"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "放流後", method: "エサ釣り", source: "https://fl-hiruga.com/ (公式)" },
      { fish: fish("ishigakidai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り", source: "https://fl-hiruga.com/ (公式)" },
      { fish: fish("shimaaji"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "放流後", method: "エサ釣り", source: "https://fl-hiruga.com/ (公式)" },
      { fish: fish("isaki"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り", source: "https://fl-hiruga.com/ (公式)" },
    ],
    bestTimes: [
      { label: "入場直後", timeRange: "7:00〜9:00", rating: "best" },
      { label: "放流後", timeRange: "9:00〜10:30頃", rating: "good" },
      { label: "上級コース後半", timeRange: "11:00〜14:00", rating: "fair" },
    ],
    tackleRecommendations: [],
    rules: {
      castingAllowed: true,
      lureAllowed: false,
      chumAllowed: false,
      fishingLicenseRequired: false,
      maxRods: 1,
      otherRules: ["竿は一人一本(予備竿は縮めて持ち込み可)", "ルアー釣り・引っ掛け釣り禁止", "タモで魚をすくい取るのは禁止", "黄色い通路からのサビキ釣り禁止"],
    },
    safetyLevel: "safe",
    safetyNotes: ["海上の釣り座で釣るため、子どもは保護者が付き添う", "強風などで臨時休業あり"],
    managementInfo: {
      organizationName: "フィッシングランド日向",
      contactPhone: "0770-45-2929",
      contactUrl: "https://fl-hiruga.com/",
      openingHours: "受付 上級6:30・マニア6:00・貸切5:30まで、6:50頃抽選、7:00入場。終了 マニア11:00・上級14:00(冬季は30分繰り下げ)",
      fishingFee: "上級 男性14,000円、マニア 男性7,000円",
      notes: [
        "確認日 2026-11-17(公式サイト・料金ページ・ご利用案内)",
        "通年営業(新年は1月2日から)。定休日は公式に記載なし",
        "放流 上級9:30〜10:00頃、マニア・貸切9:00頃",
        "予約は電話で3か月先まで。貸切はキャンセル料あり",
        "釣った魚は持ち帰り可。血抜きは事務所で実施、うろこ取りは有料(1匹200〜500円)",
        "トイレの有無は未確認",
      ],
    },
  },

  // 座標は国土地理院 住所検索「福井県美浜町日向2番地」(枝番は当たらず番地レベル)
  {
    id: "mp-2401",
    name: "ひるが海上釣堀",
    slug: "fukui-mihama-hiruga-kaijo-tsuribori",
    isManagedPond: true,
    facilityKind: "kaijo",
    description:
      "美浜町漁業協同組合が日向湖で営む海上釣り堀。狙いはマダイが中心で、シマアジも入る。" +
      "予約はできず当日受付のみ、支払いは現金のみ。竿やエサ、クーラーボックス、氷を借りられるので手ぶらでも行ける。" +
      "シマアジは重さで買い取る形になっている。12月21日から冬季休業に入り、それまでも休業日があるので公式ブログで確かめてから出かけたい。",
    latitude: 35.612076,
    longitude: 135.894058,
    address: "福井県三方郡美浜町日向2-55",
    accessInfo: "日向湖畔。駐車場あり。",
    region: region("re8031"),
    spotType: "pier",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "入場料は未確認。エサ(ささみん)600円、シマアジは1kgあたり4,000円で買い取り(2026年10月19日改定)",
    hasParking: true,
    parkingDetail: "あり(若狭美浜観光協会の案内)",
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿・エサ・クーラーボックス・氷あり(手ぶら可)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://ameblo.jp/hiruga-turibori/",
    catchableFish: [
      { fish: fish("madai"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り", source: "https://ameblo.jp/hiruga-turibori/ (公式ブログ・釣果/放流)" },
      { fish: fish("shimaaji"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り", source: "https://ameblo.jp/hiruga-turibori/entry-12981840454.html (公式ブログ)" },
    ],
    bestTimes: [
      { label: "受付直後", timeRange: "7:00〜9:00", rating: "best" },
      { label: "日中", timeRange: "9:00〜15:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: ["海上の釣り座で釣るため、子どもは保護者が付き添う"],
    managementInfo: {
      organizationName: "美浜町漁業協同組合(ひるが海上釣堀)",
      contactPhone: "0770-32-1127",
      contactUrl: "https://ameblo.jp/hiruga-turibori/",
      openingHours: "受付 7:00〜12:00、営業 7:00〜15:00",
      closedDays: "臨時休業あり(2026年は11/18・11/25・12/2・12/9・12/16)。12月21日以降は冬季休業",
      notes: [
        "確認日 2026-11-17(公式ブログ・若狭美浜観光協会)",
        "営業期間(冬季休業明けの再開時期)は未確認",
        "予約不可・当日受付のみ、現金のみ",
        "電話番号はブログ 0770-32-1127、観光協会ページ 0770-32-1146 と食い違いあり",
        "入場料・子ども料金・施設ルール・トイレの有無は未確認",
      ],
    },
  },

  // 座標は国土地理院 住所検索「福井県美浜町日向」= 大字中心(番地不明)。
  // 公式アクセスページ(http://www.fishing-r.com/access.html)も「美浜町日向」までで番地が無く、
  // 住所検索で取り直せなかったため候補表の値のまま。日向湖岸から西に外れている可能性がある
  // (公式案内は「日向湖沿い約1kmで到着」)。
  {
    id: "mp-2402",
    name: "海上釣堀フィッシングレインボー",
    slug: "fukui-mihama-fishing-rainbow",
    isManagedPond: true,
    facilityKind: "kaijo",
    description:
      "日向湖にある海上釣り堀で、陸から桟橋を渡ってイケスへ行けるので船に乗る必要がない。" +
      "マダイ、ワラサ、ヒラマサ、カンパチ、シマアジ、マハタ、イシガキダイが入り、放流は1日2回。" +
      "午前の1部に加え、土日祝は午後の2部もある。乗合のほか小割・大割の貸切や団体コースがあり、釣った魚はすべて持ち帰れる。子ども用ライフジャケットと車いすは無料で借りられる。",
    latitude: 35.621216,
    longitude: 135.852539,
    address: "福井県三方郡美浜町日向",
    accessInfo: "舞鶴若狭道 若狭三方ICから車で約10分。レインボーライン日向ゲート方面へ進み、日向湖沿いに約1km。",
    region: region("re8031"),
    spotType: "pier",
    difficulty: "beginner",
    isFree: false,
    feeDetail:
      "乗合 男性14,000円・女性11,000円・小学生6,000円。貸切 小割(9m×9m)平日1部 5名〜70,000円、大割(12m×12m)平日1部 8名〜112,000円など。団体コース 10名〜70,000円",
    hasParking: true,
    parkingDetail: "あり",
    hasToilet: true,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "貸し竿 2,000円/本(要予約)、子ども用ライフジャケット・車いす無料",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "http://www.fishing-r.com/",
    catchableFish: [
      { fish: fish("madai"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "釣り開始直後・放流後", method: "エサ釣り", source: "http://www.fishing-r.com/ (公式)" },
      { fish: fish("buri"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "放流後", method: "エサ釣り", source: "http://www.fishing-r.com/ (公式・ワラサ)" },
      { fish: fish("hiramasa"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "放流後", method: "エサ釣り", source: "http://www.fishing-r.com/ (公式)" },
      { fish: fish("kanpachi"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "放流後", method: "エサ釣り", source: "http://www.fishing-r.com/ (公式)" },
      { fish: fish("shimaaji"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "放流後", method: "エサ釣り", source: "http://www.fishing-r.com/ (公式)" },
      { fish: fish("mahata"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "午前", method: "エサ釣り", source: "http://www.fishing-r.com/ (公式)" },
      { fish: fish("ishigakidai"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り", source: "http://www.fishing-r.com/ (公式)" },
    ],
    bestTimes: [
      { label: "1部の釣り開始直後", timeRange: "6:30〜8:30", rating: "best" },
      { label: "1部の放流後", timeRange: "8:30〜12:00", rating: "good" },
      { label: "2部(土日祝)", timeRange: "12:30〜17:00", rating: "fair" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: ["陸続きの桟橋だが水上の釣り座なので、子どもはライフジャケットを着ける(無料貸出)"],
    managementInfo: {
      organizationName: "海上釣堀フィッシングレインボー",
      contactPhone: "090-3293-0427",
      contactUrl: "http://www.fishing-r.com/",
      openingHours: "1部 受付6:00・釣り6:30〜12:00、2部(土日祝のみ)受付12:00・釣り12:30〜17:00。12月1日から30分繰り下げ",
      fishingFee: "乗合 男性14,000円・女性11,000円・小学生6,000円",
      notes: [
        "確認日 2026-11-17(公式サイト・料金ページ)",
        "通年営業かどうか・定休日は公式に記載なし(営業期間は未確認)",
        "予約は予約カレンダーまたは電話(事務所 0770-45-2841)",
        "活きアジの販売なし",
        "施設ルールの詳細は公式のルールとマナーのページで確認を",
        "番地は未確認(公式は「美浜町日向」まで)",
      ],
    },
  },

  // 座標は国土地理院 住所検索「福井県小浜市阿納」= 大字中心(番地不明)
  {
    id: "mp-2403",
    name: "ブルーパーク阿納",
    slug: "fukui-obama-blue-park-ano",
    isManagedPond: true,
    facilityKind: "kaijo",
    description:
      "小浜市阿納の陸続きの海上釣り堀で、阿納で育てたマダイを釣る。" +
      "1時間の小鯛釣り放題と、竿・エサ代に釣った匹数分を払う鯛釣りの2つの形があり、竿とエサは施設のものを使う。" +
      "釣った魚はすべて持ち帰りでリリースはできない。営業は5〜11月で、2026年のシーズンは11月で終わる。低学年の子どもは保護者と一緒に入る。",
    latitude: 35.538383,
    longitude: 135.783966,
    address: "福井県小浜市阿納",
    accessInfo: "小浜市阿納の海沿い。",
    region: region("r84"),
    spotType: "pier",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "小鯛釣り放題 1人1時間 4,000円(竿・エサ込み)。鯛釣り 竿・エサ1,500円+1匹1,300円(25〜30cm)。見学 300円",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿・エサは料金込み(施設の竿・エサのみ使用)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://bluepark-ano.com/",
    catchableFish: [
      { fish: fish("madai"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(施設の竿・エサ)", source: "https://bluepark-ano.com/guide (公式)" },
    ],
    bestTimes: [
      { label: "午前", timeRange: "8:00〜11:00", rating: "best" },
      { label: "午後", timeRange: "11:00〜14:00(最終受付)", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: ["低学年の子どもは保護者同伴", "天候で休業することがある"],
    managementInfo: {
      organizationName: "ブルーパーク阿納",
      contactPhone: "0770-54-3611",
      contactUrl: "https://bluepark-ano.com/",
      openingHours: "5〜11月 8:00〜15:00(最終受付14:00)",
      closedDays: "不定休(天候・地域行事・団体貸切で休みあり)",
      fishingFee: "小鯛釣り放題 1時間 4,000円",
      notes: [
        "確認日 2026-11-17(公式サイト・おばまナビ)",
        "まき餌禁止、引っ掛け禁止",
        "釣った魚は全部持ち帰り(リリース禁止)",
        "子ども料金の区分なし",
        "さばき体験 4,000円は学校・団体のみ(要予約)",
        "予約は電話またはフォーム(団体 0770-54-3610)",
        "トイレ・駐車場の有無は未確認。番地は未確認",
      ],
    },
  },

  // 座標は国土地理院 住所検索「福井県美浜町丹生」= 大字中心(番地不明)
  {
    id: "mp-2404",
    name: "シーパーク丹生",
    slug: "fukui-mihama-sea-park-nyu",
    isManagedPond: true,
    facilityKind: "kaijo",
    description:
      "美浜町の丹生漁港にある釣り施設で、港内の放流イケスと波止の両方で釣れる。" +
      "イケスには地元の大敷網でとれたマダイ、ツバスやハマチ、ワラサ・ブリ、カンパチ、キジハタなどの天然魚と養殖の中マダイが入り、波止ではアジやサヨリが釣れる。" +
      "小物は時間と匹数、タイは1尾、青物は重さで払う形で、釣った魚は全部持ち帰る。2026年の営業は4月25日から11月29日まで。",
    latitude: 35.714523,
    longitude: 135.971161,
    address: "福井県三方郡美浜町丹生(丹生漁港)",
    accessInfo: "丹生漁港内。",
    region: region("re8031"),
    spotType: "pier",
    difficulty: "beginner",
    isFree: false,
    feeDetail:
      "小物釣り 2時間 3,000円/竿(10尾まで)、4時間 5,000円/竿(平日・20尾まで)、ファミリー 2時間 5,000円(竿2本・10尾まで)。中物 タイ 2,500円/尾、青物 200円/100g。波止釣り 4時間 大人1,000円・小学生以下500円",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "貸竿 500円、エサ 400円/個",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "http://www1.kl.mmnet-ai.ne.jp/~nyu/seapark.html",
    catchableFish: [
      { fish: fish("madai"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(イケス)", source: "http://www1.kl.mmnet-ai.ne.jp/~nyu/fish.html (公式)" },
      { fish: fish("buri"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り(イケス)", source: "http://www1.kl.mmnet-ai.ne.jp/~nyu/fish.html (公式・ツバス/ハマチ/ワラサ/ブリ)" },
      { fish: fish("kanpachi"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り(イケス)", source: "http://www1.kl.mmnet-ai.ne.jp/~nyu/fish.html (公式)" },
      { fish: fish("hata"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り(イケス)", source: "http://www1.kl.mmnet-ai.ne.jp/~nyu/fish.html (公式・キジハタ)" },
      { fish: fish("aji"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(波止)", source: "http://www1.kl.mmnet-ai.ne.jp/~nyu/fish.html (公式)" },
      { fish: fish("sayori"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(波止)", source: "http://www1.kl.mmnet-ai.ne.jp/~nyu/fish.html (公式)" },
    ],
    bestTimes: [
      { label: "開場直後", timeRange: "7:00〜9:00", rating: "best" },
      { label: "午前", timeRange: "9:00〜12:00", rating: "good" },
      { label: "午後(土日祝)", timeRange: "12:00〜15:00", rating: "fair" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: ["漁港内の波止とイケスで釣るため、子どもは保護者が付き添う"],
    managementInfo: {
      organizationName: "美浜町丹生漁港環境広場管理組合(シーパーク丹生)",
      contactPhone: "080-6364-8151",
      contactUrl: "http://www1.kl.mmnet-ai.ne.jp/~nyu/seapark.html",
      openingHours: "2026年 4月25日〜11月29日。平日 7:00〜12:00、土日祝 7:00〜15:00(受付13:00まで)",
      closedDays: "木曜(祝日の場合は翌平日)",
      fishingFee: "小物釣り 2時間 3,000円/竿",
      notes: [
        "確認日 2026-11-17(公式サイト・公式ブログ)",
        "リリース禁止(釣った魚は全部持ち帰り)、竿は1人1本",
        "予約の要否・トイレ・駐車場の有無は未確認。番地は未確認",
        "公式サイトは http のみで開ける",
      ],
    },
  },

  // ============================================================
  // 福井県 内陸(渓流型・池)
  // ============================================================
  // 座標は国土地理院 住所検索「福井県美浜町新庄」= 大字中心(番地 286-5-1 は当たらず)
  {
    id: "mp-2405",
    name: "新庄渓流の里",
    slug: "fukui-mihama-shinjo-keiryu-no-sato",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "美浜町新庄の山あいで新庄淡水漁業生産組合が営む渓流型の釣り場。約200mに44の区画を設けた区画釣り場と、約2kmの自然渓流があり、ヤマメ・アマゴ・イワナ・ニジマスを狙える。" +
      "釣り方はエサ・毛バリ・フライで、ルアーは禁止。釣った魚は追加料金なしですべて持ち帰れる。" +
      "日の出から日没まで釣りができ、短時間のちょい釣りや子ども向けのアマゴつかみどり、BBQもある。",
    latitude: 35.545101,
    longitude: 135.987396,
    address: "福井県三方郡美浜町新庄286-5-1",
    accessInfo: "美浜町新庄の山間部。駐車場あり。",
    region: R_MIMIGAWA,
    spotType: "river",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "1日券 一般5,000円/竿、女性・子ども3,000円/竿。ちょい釣り(2時間)2,500円/竿。アマゴつかみどり 800円(2尾まで)",
    hasParking: true,
    parkingDetail: "あり(若狭美浜観光協会の案内)",
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "貸竿(仕掛け付き)300円、イクラ500円、ブドウムシ700円",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://keiryunosato.jimdofree.com/",
    catchableFish: [
      { fish: fish("yamame"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り・毛バリ・フライ", source: "https://keiryunosato.jimdofree.com/ (公式)" },
      { fish: fish("amago"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り・毛バリ・フライ", source: "https://keiryunosato.jimdofree.com/ (公式)" },
      { fish: fish("iwana"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り・毛バリ・フライ", source: "https://keiryunosato.jimdofree.com/ (公式)" },
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(イクラ・ブドウムシ)", source: "https://keiryunosato.jimdofree.com/ (公式)" },
    ],
    bestTimes: [
      { label: "朝", timeRange: "日の出〜9:00", rating: "best" },
      { label: "日中", timeRange: "9:00〜15:00", rating: "good" },
      { label: "夕方", timeRange: "15:00〜18:00", rating: "fair" },
    ],
    tackleRecommendations: [],
    rules: {
      castingAllowed: true,
      lureAllowed: false,
      chumAllowed: false,
      fishingLicenseRequired: false,
      otherRules: ["ルアー禁止(エサ・毛バリ・フライ)", "置き竿での場所取り禁止", "料金は竿単位"],
    },
    safetyLevel: "caution",
    safetyNotes: ["川岸の石は滑りやすい", "増水・濁り・雪で中止になることがある"],
    managementInfo: {
      organizationName: "新庄淡水漁業生産組合(新庄渓流の里)",
      contactPhone: "0770-32-5580",
      contactUrl: "https://keiryunosato.jimdofree.com/",
      openingHours: "日の出〜日没(最終18:00)",
      closedDays: "年末年始(12/31〜1/9)。増水・濁り・雪で中止あり",
      fishingFee: "1日券 一般5,000円/竿",
      notes: [
        "確認日 2026-11-17(公式サイト・若狭美浜観光協会)",
        "釣りの予約は不要。つかみどり団体・BBQ は電話で予約",
        "GW はちょい釣りのみの営業",
        "釣った魚は追加料金なしで全部持ち帰り可",
        "トイレの有無は未確認。座標は大字中心",
      ],
    },
  },

  // 座標は国土地理院 住所検索「福井県おおい町名田庄染ケ谷」= 大字中心(番地不明)
  {
    id: "mp-2406",
    name: "八ヶ峰家族旅行村",
    slug: "fukui-ooi-hachigamine-kazoku-ryokomura",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "おおい町名田庄のキャンプ場に付いた釣り場で、池と村の中を流れる渓流でニジマスやイワナを釣れる。" +
      "入村料のほかに釣った匹数分の代金と、竿・エサ代を払う形で、竿とエサは池用・川用に分かれて用意されている。" +
      "釣った魚は施設内でBBQにして食べられる。釣りの営業期間や定休日は公式に書かれていないので、出かける前に電話で確かめたい。",
    latitude: 35.361984,
    longitude: 135.685898,
    address: "福井県大飯郡おおい町名田庄染ケ谷6-8",
    accessInfo: "おおい町名田庄の山間部にあるキャンプ場内。",
    region: R_NATASHO,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "入村料 400円/人、ニジマス 1匹300円。川の竿200円・エサ300円/人、池の竿150円・エサ200円/人",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿・エサあり(川用・池用)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://hachigamine.jp/",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り", source: "https://www.wakasa-ohi.jp/sakanatsuri (おおい町観光協会)" },
      { fish: fish("iwana"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "午前", method: "エサ釣り", source: "https://www.wakasa-ohi.jp/sakanatsuri (おおい町観光協会)" },
    ],
    bestTimes: [
      { label: "午前", timeRange: "9:00〜12:00", rating: "best" },
      { label: "午後", timeRange: "12:00〜17:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: ["渓流で釣るときは川岸の石が滑りやすい"],
    managementInfo: {
      organizationName: "八ヶ峰家族旅行村",
      contactPhone: "0770-67-2844",
      contactUrl: "https://hachigamine.jp/",
      openingHours: "電話受付 9:00〜17:00",
      fishingFee: "入村料400円+ニジマス1匹300円",
      notes: [
        "確認日 2026-11-17(公式サイト・おおい町観光協会)",
        "営業期間は未確認(観光協会は通年の体験として掲載)。定休日は未確認",
        "キャンプ場の付帯施設。池と村内の渓流の両方で釣れる",
        "釣った魚は施設内でBBQにできる。持ち帰りの可否は未確認",
        "施設ルール・予約の要否・トイレ・駐車場の有無は未確認",
      ],
    },
  },

  // 座標は国土地理院 住所検索「福井県勝山市野向町横倉」= 大字中心(番地不明)
  // 型は公式で確かめられないため river(SKILL §1)
  {
    id: "mp-2407",
    name: "フィッシングよこくら",
    slug: "fukui-katsuyama-fishing-yokokura",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "勝山市野向町横倉にある釣り堀で、施設では卵からアマゴを育てており、そのアマゴを釣ることができる。" +
      "独自の公式サイトはなく、料金や営業期間、釣り場の形は勝山市の観光サイトにも載っていない。" +
      "営業時間は9時から17時と案内されている。情報が少ない施設なので、出かける前に電話で営業日と料金を確かめておきたい。",
    latitude: 36.131088,
    longitude: 136.51123,
    address: "福井県勝山市野向町56",
    accessInfo: "勝山市野向町の山間部。駐車場あり。",
    region: region("r719"),
    spotType: "river",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "料金は未確認",
    hasParking: true,
    parkingDetail: "あり(勝山市観光ナビ)",
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: false,
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://katsuyama-navi.jp/spot/6601.html",
    catchableFish: [
      { fish: fish("amago"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "釣り方は未確認", source: "https://katsuyama-navi.jp/spot/6601.html (勝山市観光ナビ)・福井PRチャンネル紹介動画(2026年11月)" },
    ],
    bestTimes: [
      { label: "午前", timeRange: "9:00〜12:00", rating: "best" },
      { label: "午後", timeRange: "12:00〜17:00", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: [],
    managementInfo: {
      organizationName: "フィッシングよこくら",
      contactPhone: "0779-88-5116",
      contactUrl: "https://katsuyama-navi.jp/spot/6601.html",
      openingHours: "9:00〜17:00",
      notes: [
        "確認日 2026-11-17(勝山市観光ナビ・紹介動画)",
        "独自の公式サイトなし",
        "営業期間は未確認。定休日・料金・釣り場の形(池か渓流か)は未確認",
        "住所は勝山市観光ナビの表記。地図系では「野向町横倉56-39」",
        "レンタル・持ち帰り・トイレの有無は未確認",
      ],
    },
  },

  // ============================================================
  // 富山県
  // ============================================================
  // 座標は国土地理院 住所検索「富山県高岡市福岡町矢部1050番地」(番地まで一致)
  {
    id: "mp-2408",
    name: "ファミリー釣堀 つりぼり〜の(成田養魚園)",
    slug: "toyama-takaoka-tsuribori-no-narita",
    isManagedPond: true,
    facilityKind: "tsuribori",
    description:
      "高岡市福岡町の養魚場・成田養魚園が営む鯉と金魚の釣り堀。約2,000匹の鯉がいる屋外のファミリー釣り堀は1時間単位で、釣った数に応じて景品がもらえる。" +
      "観賞魚ハウス内のミニ釣り堀では金魚や錦鯉を通年で釣れ、釣具一式込みなので手ぶらで行ける。" +
      "約1mの大鯉を自分の竿で狙う大物釣り堀「アドバンス」もある。屋外の釣り堀は土日祝のみの営業。",
    latitude: 36.688038,
    longitude: 136.933578,
    address: "富山県高岡市福岡町矢部1050",
    accessInfo: "高岡市福岡町矢部の成田養魚園内。",
    region: R_TAKAOKA_FUKUOKA,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail:
      "屋外ファミリー釣り堀 1時間1,500円(貸し竿1本)、ミニ釣り堀 20分700円(雨天・冬期600円)、アドバンス 4時間券3,000円・1日券3,500円",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "ファミリー・ミニ釣り堀は釣具一式込み(手ぶら可)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "http://toyama-narita.net/turibori-no",
    catchableFish: [
      { fish: fish("koi"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り", source: "http://toyama-narita.net/turibori-no (公式)" },
    ],
    bestTimes: [
      { label: "開店直後", timeRange: "9:30〜11:30", rating: "best" },
      { label: "午後", timeRange: "13:00〜17:30", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: ["池の縁から釣る。小さな子どもは保護者が付き添う"],
    managementInfo: {
      organizationName: "成田養魚園(ファミリー釣堀 つりぼり〜の)",
      contactPhone: "0766-64-3196",
      contactUrl: "http://toyama-narita.net/turibori-no",
      openingHours: "9:30〜17:30。屋外ファミリー釣り堀・アドバンスは土日祝のみ(2026年は4月18日オープン)、ミニ釣り堀は通年",
      closedDays: "火曜",
      fishingFee: "屋外ファミリー 1時間1,500円",
      notes: [
        "確認日 2026-11-17(公式サイト)",
        "金魚・錦鯉も釣れる(金魚は魚種データ未登録)",
        "ファミリー・ミニは釣具・エサの持ち込み不可。アドバンスは竿持参、スレ針のみ、陸揚げ禁止",
        "撒き餌禁止",
        "2026年シーズンに料金改定の告知あり(上の額は公式掲載値)",
        "冬の屋外営業・持ち帰り・トイレ・駐車場の有無は未確認",
      ],
    },
  },

  // 座標は国土地理院 住所検索「富山県富山市割山」= 大字中心(番地不明)
  {
    id: "mp-2409",
    name: "割山森林公園 天湖森",
    slug: "toyama-toyama-wariyama-tenkomori",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "富山市の割山森林公園にある釣り池で、4月上旬から10月中旬にかけてニジマスが放流される。もともと池にいるコイやフナなども釣れる。" +
      "エサ釣りとルアー・フライで券が分かれ、1か月券もある。券1枚で5尾まで持ち帰れる。" +
      "釣りだけの利用もでき予約は要らない。竿や仕掛け、エサを借りられるので、道具がなくても始められる。",
    latitude: 36.542812,
    longitude: 137.2164,
    address: "富山県富山市割山9-1",
    accessInfo: "割山森林公園内。無料駐車場あり。",
    region: region("r681"),
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "エサ釣り1日券 600円、ルアー・フライ1日券 1,300円、共通1か月券 2,700円(竿の本数分の券が必要)",
    hasParking: true,
    parkingDetail: "無料",
    hasToilet: true,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "エサ釣り竿 260円、仕掛け 260円、バケツ 100円、ミミズ 510円、ねり餌 460円(料金ページの値)",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://tenkomori.info/",
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "開園直後", method: "エサ釣り・ルアー・フライ", source: "https://tenkomori.info/reisure/ (公式・放流)" },
      { fish: fish("koi"), monthStart: 4, monthEnd: 10, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "エサ釣り", source: "https://tenkomori.info/reisure/ (公式・在来魚)" },
    ],
    bestTimes: [
      { label: "開園直後", timeRange: "8:30〜10:30", rating: "best" },
      { label: "日中", timeRange: "10:30〜15:00", rating: "good" },
      { label: "夕方", timeRange: "15:00〜17:30", rating: "fair" },
    ],
    tackleRecommendations: [],
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: false,
      fishingLicenseRequired: false,
      otherRules: ["ルアー・フライは専用の1日券(1,300円)", "釣り券1枚で5尾までキープ", "置き竿などで2本以上を同時に使うのは禁止", "釣り禁止区域あり", "弱った魚のリリース禁止"],
    },
    safetyLevel: "safe",
    safetyNotes: ["池の岸から釣る。子どもは保護者が付き添う"],
    managementInfo: {
      organizationName: "割山森林公園 天湖森",
      contactPhone: "076-485-2777",
      contactUrl: "https://tenkomori.info/",
      openingHours: "釣り 8:30〜17:30。ニジマス放流は4月上旬〜10月中旬",
      fishingFee: "エサ釣り1日券 600円",
      notes: [
        "確認日 2026-11-17(公式サイト・料金ページ・釣りのルール)",
        "受付は通年だが、冬季に釣りができるかは未確認",
        "在来のフナ・ソウギョもいる",
        "釣りのみの利用可・予約不要",
        "レジャーページではレンタル料金が竿+仕掛け520円・バケツ110円と表記されている",
        "子ども料金の記載なし",
      ],
    },
  },

  // 座標は国土地理院 住所検索「富山県南砺市小二又154番地」(番地まで一致)
  {
    id: "mp-2410",
    name: "いわなの里 太谷川",
    slug: "toyama-nanto-iwana-no-sato-otanigawa",
    isManagedPond: true,
    facilityKind: "managed",
    description:
      "南砺市小二又の太谷川養殖場が営むイワナの釣り堀。竿とエサは施設が用意し、1時間単位の料金で5尾まで持ち帰れ、それ以上は1尾ごとに追加料金を払う。" +
      "釣ったイワナは調理もしてもらえる。営業は4〜10月の土日祝で、7〜9月はつかみ取りも行う。" +
      "2026年度の営業は10月31日で終わっており、次は2027年4月に再開する予定。",
    latitude: 36.508675,
    longitude: 136.837219,
    address: "富山県南砺市小二又154",
    accessInfo: "南砺市小二又の山間部。",
    region: R_NANTO,
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "1時間 2,000円(竿・エサ込み、5尾まで持ち帰り、追加1尾400円)。調理 1尾120円",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: true,
    rentalDetail: "竿・エサは料金込み",
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://www.e-muchtoyama.com/play/0763551028/",
    catchableFish: [
      { fish: fish("iwana"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "午前", method: "エサ釣り(施設の竿・エサ)", source: "https://www.e-muchtoyama.com/play/0763551028/ (施設のお知らせ)" },
    ],
    bestTimes: [
      { label: "開場直後", timeRange: "8:00〜10:00", rating: "best" },
      { label: "日中", timeRange: "10:00〜14:30(受付終了)", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: [],
    managementInfo: {
      organizationName: "太谷川養殖場(いわなの里 太谷川)",
      contactPhone: "090-3886-4616",
      contactUrl: "https://www.e-muchtoyama.com/play/0763551028/",
      openingHours: "4〜10月の土日祝 8:00〜16:00(受付14:30まで)",
      closedDays: "平日、11〜3月は休業。2026年度は10月31日で終了、2027年4月再開予定",
      fishingFee: "1時間 2,000円",
      notes: [
        "確認日 2026-11-17(地域情報サイト いいまち富山 の施設ページ・施設のお知らせ)",
        "独自の公式サイトはなく、施設がお知らせを載せている上記ページを公式扱いとした",
        "竿・エサの持ち込み禁止",
        "7〜9月はイワナのつかみ取りも実施",
        "予約の要否・トイレ・駐車場の有無は未確認",
      ],
    },
  },

  // ============================================================
  // 石川県
  // ============================================================
  // 座標は国土地理院 住所検索「石川県能美市粟生町ツ58番地」(番地まで一致)
  {
    id: "mp-2411",
    name: "手取フィッシュランド(つりぼり)",
    slug: "ishikawa-nomi-tedori-fish-land-tsuribori",
    isManagedPond: true,
    facilityKind: "tsuribori",
    description:
      "能美市のレジャーランド手取フィッシュランドの中にある釣り堀コーナー。鯉釣りのほか、金魚釣り、いわな釣り、川魚釣り、子ども向けのわくわく大漁コーナーがあり、それぞれ30分や1時間単位で遊べる。" +
      "金魚すくいもある。遊園地と一緒に楽しめる施設で、2026年は9〜11月の営業案内が出ている。営業時間と定休日は事前に公式で確かめたい。",
    latitude: 36.458672,
    longitude: 136.509567,
    address: "石川県能美市粟生町ツ58",
    accessInfo: "手取フィッシュランド内。",
    region: region("r771"),
    spotType: "pond",
    difficulty: "beginner",
    isFree: false,
    feeDetail: "鯉釣り 1時間800円・1日1,500円、金魚釣り 30分700円、いわな釣り 30分1,000円、川魚釣り 30分700円、わくわく大漁コーナー 30分700円、金魚すくい 1回300円",
    hasParking: false,
    hasToilet: false,
    hasConvenienceStore: false,
    hasFishingShop: false,
    hasRentalRod: false,
    mainImageUrl: "",
    images: [],
    rating: 3.5,
    reviewCount: 0,
    officialUrl: "https://tedori.jp/fishing.html",
    catchableFish: [
      { fish: fish("koi"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "エサ釣り", source: "https://tedori.jp/fishing.html (公式)" },
      { fish: fish("iwana"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "エサ釣り", source: "https://tedori.jp/fishing.html (公式)" },
    ],
    bestTimes: [
      { label: "午前", timeRange: "開園〜12:00", rating: "best" },
      { label: "午後", timeRange: "12:00〜閉園", rating: "good" },
    ],
    tackleRecommendations: [],
    safetyLevel: "safe",
    safetyNotes: ["小さな子どもは保護者が付き添う"],
    managementInfo: {
      organizationName: "手取フィッシュランド",
      contactPhone: "0761-57-2211",
      contactUrl: "https://tedori.jp/",
      fishingFee: "鯉釣り 1時間800円",
      notes: [
        "確認日 2026-11-17(公式サイト)",
        "営業期間は未確認(2026年9〜11月の営業案内あり)。営業時間・定休日は公式ページの画像内で未確認",
        "金魚・川魚も釣れる(金魚は魚種データ未登録)",
        "施設ルール・持ち帰り・レンタル・トイレ・駐車場の有無は未確認",
      ],
    },
  },
];
