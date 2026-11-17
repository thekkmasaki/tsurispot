import { FishingSpot, FishSpecies, Region } from "@/types";
import { getFishBySlug } from "./fish";
import { regions } from "./regions";

function fish(slug: string): FishSpecies {
  const f = getFishBySlug(slug);
  if (!f) throw new Error(`Fish not found: ${slug}`);
  return f;
}

function region(id: string) {
  const r = regions.find((r) => r.id === id);
  if (!r) throw new Error(`Region not found: ${id}`);
  return r;
}

const fwAdd2Regions: Region[] = [
  // === 管理釣り場 ===
  // 2026-11-17: r5010 の都道府県を千葉県→神奈川県に修正(王禅寺は川崎市麻生区)。s266 は川崎の region へ移したので現在このファイル内で未使用
  { id: "r5000", prefecture: "埼玉県", areaName: "朝霞ガーデン", slug: "saitama-asaka-garden" },
  { id: "r5001", prefecture: "栃木県", areaName: "キングフィッシャー", slug: "tochigi-kingfisher" },
  { id: "r5002", prefecture: "群馬県", areaName: "赤久縄", slug: "gunma-akaguna" },
  { id: "r5003", prefecture: "神奈川県", areaName: "リヴァスポット早戸", slug: "kanagawa-revaspot-hayato" },
  { id: "r5004", prefecture: "山梨県", areaName: "FISH ON! 鹿留", slug: "yamanashi-fishon-shishidome" },
  { id: "r5005", prefecture: "静岡県", areaName: "すそのフィッシングパーク", slug: "shizuoka-susono-fp" },
  { id: "r5006", prefecture: "長野県", areaName: "白馬八方ニレ池フィッシングセンター", slug: "nagano-hakuba-fa" },
  { id: "r5007", prefecture: "栃木県", areaName: "大芦川F&Cフィールドビレッジ", slug: "tochigi-oashigawa-fc" },
  { id: "r5008", prefecture: "群馬県", areaName: "川場フィッシングプラザ", slug: "gunma-kawaba-fp" },
  { id: "r5009", prefecture: "埼玉県", areaName: "プールフィッシング", slug: "saitama-pool-fishing" },
  { id: "r5010", prefecture: "神奈川県", areaName: "フィッシュオン王禅寺", slug: "kanagawa-ozenji" },
  { id: "r5011", prefecture: "東京都", areaName: "奥多摩フィッシングセンター", slug: "tokyo-okutama-fc" },
  { id: "r5012", prefecture: "愛知県", areaName: "北方マス釣り場", slug: "aichi-kitakata-masu" },
  { id: "r5013", prefecture: "岐阜県", areaName: "美濃フィッシングエリア", slug: "gifu-mino-fa" },
  { id: "r5014", prefecture: "長野県", areaName: "平谷湖フィッシングスポット", slug: "nagano-hirayako-fs" },
  { id: "r5015", prefecture: "福島県", areaName: "フォレストパークあだたら", slug: "fukushima-fp-adatara" },
  { id: "r5016", prefecture: "栃木県", areaName: "加賀フィッシングエリア", slug: "tochigi-kaga-fa" },
  // r5017「上野村フィッシングリゾート」は実在しない施設名の region だったため、唯一の利用元 fw-512 の削除に合わせて 2026-11-17 に削除
  { id: "r5018", prefecture: "山梨県", areaName: "忍野フィッシングエリア", slug: "yamanashi-oshino-fa" },
  { id: "r5019", prefecture: "静岡県", areaName: "東山湖フィッシングエリア", slug: "shizuoka-higashiyamako-fa" },
  // === 湖・ダム（未カバー） ===
  { id: "r5020", prefecture: "群馬県", areaName: "奥利根（ならまた湖）", slug: "gunma-okutonegawa-naramata" },
  { id: "r5021", prefecture: "福島県", areaName: "秋元湖", slug: "fukushima-akimotoko" },
  { id: "r5022", prefecture: "山形県", areaName: "月山湖（寒河江ダム）", slug: "yamagata-gassan-dam" },
  { id: "r5023", prefecture: "新潟県", areaName: "奥只見湖", slug: "niigata-okutadami" },
  { id: "r5024", prefecture: "秋田県", areaName: "太平湖", slug: "akita-taiheiko" },
  { id: "r5025", prefecture: "岩手県", areaName: "岩洞湖", slug: "iwate-gandoko" },
  { id: "r5026", prefecture: "長野県", areaName: "白樺湖", slug: "nagano-shirakabako" },
  { id: "r5027", prefecture: "栃木県", areaName: "川治ダム（八汐湖）", slug: "tochigi-kawaji-dam" },
  { id: "r5028", prefecture: "埼玉県", areaName: "狭山湖", slug: "saitama-sayamako" },
  { id: "r5029", prefecture: "奈良県", areaName: "津風呂湖（詳細）", slug: "nara-tsufuroko-detail" },
  { id: "r5030", prefecture: "三重県", areaName: "青蓮寺湖（詳細）", slug: "mie-shorenji-detail" },
  { id: "r5031", prefecture: "岐阜県", areaName: "徳山ダム", slug: "gifu-tokuyama-dam" },
  { id: "r5032", prefecture: "富山県", areaName: "有峰湖", slug: "toyama-arimine" },
  { id: "r5033", prefecture: "北海道", areaName: "朱鞠内湖（追加）", slug: "hokkaido-shumarinai-add" },
  { id: "r5034", prefecture: "北海道", areaName: "屈斜路湖（追加）", slug: "hokkaido-kussharoko-add" },
  // === 河川（未カバー） ===
  { id: "r5040", prefecture: "岩手県", areaName: "閉伊川", slug: "iwate-heigawa-fw" },
  { id: "r5041", prefecture: "山形県", areaName: "赤川", slug: "yamagata-akagawa" },
  { id: "r5042", prefecture: "宮城県", areaName: "鳴瀬川上流", slug: "miyagi-narusegawa-upper" },
  { id: "r5043", prefecture: "福島県", areaName: "阿武隈川上流", slug: "fukushima-abukumagawa-upper" },
  { id: "r5044", prefecture: "茨城県", areaName: "那珂川上流（大子）", slug: "ibaraki-nakagawa-daigo" },
  { id: "r5045", prefecture: "群馬県", areaName: "片品川上流", slug: "gunma-katashina-upper" },
  { id: "r5046", prefecture: "東京都", areaName: "多摩川上流（御岳渓谷）", slug: "tokyo-tamagawa-mitake-detail" },
  { id: "r5047", prefecture: "静岡県", areaName: "天竜川上流（佐久間）", slug: "shizuoka-tenryugawa-sakuma" },
  { id: "r5048", prefecture: "愛知県", areaName: "矢作川上流（足助）", slug: "aichi-yahagigawa-asuke" },
  { id: "r5049", prefecture: "三重県", areaName: "櫛田川上流（飯高）", slug: "mie-kushidagawa-iitaka" },
  { id: "r5050", prefecture: "滋賀県", areaName: "愛知川上流（永源寺）", slug: "shiga-echigawa-eigenji-detail" },
  { id: "r5051", prefecture: "京都府", areaName: "由良川上流（美山）", slug: "kyoto-yuragawa-miyama" },
  { id: "r5052", prefecture: "和歌山県", areaName: "日高川", slug: "wakayama-hidakagawa" },
  { id: "r5053", prefecture: "広島県", areaName: "西城川", slug: "hiroshima-saijogawa" },
  { id: "r5054", prefecture: "島根県", areaName: "斐伊川", slug: "shimane-hiigawa" },
  { id: "r5055", prefecture: "徳島県", areaName: "穴吹川（詳細）", slug: "tokushima-anabukigawa-detail" },
  { id: "r5056", prefecture: "高知県", areaName: "仁淀川上流（名野川）", slug: "kochi-niyodogawa-upper" },
  { id: "r5057", prefecture: "大分県", areaName: "大野川上流（竹田）", slug: "oita-onogawa-taketa" },
  { id: "r5058", prefecture: "宮崎県", areaName: "耳川上流（椎葉）", slug: "miyazaki-mimikawa-shiiba" },
  { id: "r5059", prefecture: "熊本県", areaName: "菊池川上流", slug: "kumamoto-kikuchigawa-upper" },
];

function lr(id: string) {
  return fwAdd2Regions.find((r) => r.id === id) || region(id);
}

const tideFresh = { bestTide: "関係なし", bestTidePhase: "関係なし", description: "淡水のため潮汐の影響はありません。水位・水温の変動が釣果を左右します。" };

export const freshwaterSpotsAdd2: FishingSpot[] = [
  // ===== 管理釣り場（トラウト） =====
  {
    id: "fw-500", name: "朝霞ガーデン", slug: "saitama-asaka-garden",
    description: "埼玉県朝霞市田島にある池型の管理釣り場。ニジマスやブラウントラウトをルアー・フライで狙え、エサ釣りもできる。料金は1日・6時間・3時間の時間券制で、ルアー・フライはメンバーズカードの提示で割引がある。2026年11月からは券ごとに持ち帰り尾数の上限が設けられた。冬は17時まで営業し、金曜が定休日なので出かける前に営業日を確かめたい。都心から近く、仕事の前後や半日だけの釣行にも使いやすい。",
    // 2026-11-17 修正: 住所 朝霞市根岸台5-8-65 → 公式の「〒351-0032 埼玉県朝霞市田島2-8-1」(http://www.a-garden.com/top.html )。
    // 座標は国土地理院 住所検索「朝霞市田島二丁目8番」(号までは当たらず)で取り直し(旧 35.7972,139.5876)
    latitude: 35.8181, longitude: 139.608139, address: "〒351-0032 埼玉県朝霞市田島2-8-1",
    accessInfo: "東武東上線朝霞駅からバス約10分。外環道和光ICから約15分。",
    region: lr("r5000"), spotType: "pond", isManagedPond: true, facilityKind: "managed", difficulty: "beginner",
    officialUrl: "http://www.a-garden.com/top.html",
    isFree: false, feeDetail: "1日 6,300円(ルアー・フライはメンバーズカード提示で5,800円)、6時間 4,600円、3時間 3,600円(2025年11月改定)",
    hasParking: true, parkingDetail: "専用駐車場あり（無料・約30台）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタルタックル一式あり（有料）",
    mainImageUrl: "", images: [],
    rating: 4.1, reviewCount: 230,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝一番", method: "ルアー（スプーン）" },
      { fish: fish("brown-trout"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ルアー（クランク）" },
      { fish: fish("iwana"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: [{ label: "朝一番", timeRange: "06:30〜08:30", rating: "best" }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" }, { label: "夕方", timeRange: "15:00〜17:00", rating: "good" }],
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["バーブレスフック（カエシなし）限定", "キャッチ&リリース区画あり", "遊漁券が必要な場合はsafetyNotesに記載"],
    managementInfo: { organizationName: "朝霞ガーデン", openingHours: "4〜10月 6:30〜17:30、11〜3月 6:30〜17:00(エサ釣りは16:30まで)", closedDays: "金曜日(祝日は営業)", fishingFee: "1日6,300円・6時間4,600円・3時間3,600円", notes: ["確認日 2026-11-17(公式サイト http://www.a-garden.com/top.html 、/time.html。公式サイトは証明書エラーのためブラウザで閲覧)", "2026年11月から持ち帰り尾数の制限あり(3時間6匹・6時間10匹・1日15匹、50cm超は1匹)", "バーブレスフック限定"] },
  },
  {
    id: "fw-501", name: "キングフィッシャー", slug: "tochigi-kingfisher",
    description: "栃木県大田原市乙連沢にあるルアー専用の池型管理釣り場。複数のポンドにニジマスが放流され、冬場はブラックバスも狙える。料金は1日券・半日券・3時間券があり、女性・中学生や小学生の料金、男女ペア券も用意されている。夏はナイター営業もある。持ち帰りは券ごとに匹数が決まり、40〜59cmの魚は1匹まで、60cm以上は持ち帰れない。ロッドとリールのレンタルがあるので道具がなくても始められる。木曜定休(祝日は営業)。",
    // 2026-11-17 修正: 住所 大田原市蛭田550 → 公式アクセスの「〒324-0001 栃木県大田原市乙連沢593」(https://kingfisher-tochigi.com/access/ )。
    // 座標は国土地理院 住所検索「大田原市乙連沢593番地」(番地精度)で取り直し(旧 36.8641,140.0262)。
    // 種別: 公式に「トラウトエリア5号池」「全池」とある池型なので river → pond + isManagedPond
    latitude: 36.908428, longitude: 140.076721, address: "〒324-0001 栃木県大田原市乙連沢593",
    accessInfo: "東北自動車道矢板ICから約30分。JR西那須野駅から車約20分。",
    region: lr("r5001"), spotType: "pond", isManagedPond: true, facilityKind: "managed", difficulty: "beginner",
    officialUrl: "https://kingfisher-tochigi.com/",
    isFree: false, feeDetail: "1日券(7:00〜17:00)大人6,300円・女性/中学生5,300円・小学生3,800円・男女ペア10,400円、半日券(7:00〜12:00 または10:00以降の5時間)5,300円・4,800円・3,300円・9,400円、3時間券 4,600円・4,300円・2,900円。延長1時間 1,000円・700円・600円。夏はナイター券あり",
    hasParking: true, parkingDetail: "広い無料駐車場あり（約100台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "ロッド・リールセット700円(片方のみ400円)",
    mainImageUrl: "", images: [],
    rating: 4.3, reviewCount: 195,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "開場直後", method: "ルアー（スプーン）", source: "https://kingfisher-tochigi.com/" },
      { fish: fish("blackbass"), monthStart: 11, monthEnd: 3, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ルアー", source: "https://kingfisher-tochigi.com/" },
    ],
    bestTimes: [{ label: "開場直後", timeRange: "07:00〜09:00", rating: "best" }, { label: "夕方", timeRange: "15:00〜17:00", rating: "good" }],
    tackleRecommendations: [],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: false, fishingLicenseRequired: false,
      otherRules: ["ルアー専用(エサ釣り不可)", "持ち帰り 1日券10匹・半日券7匹・3時間券5匹(40〜59cmはそのうち1匹、60cm以上は不可)"],
    },
    safetyLevel: "safe", safetyNotes: ["バーブレスフック限定", "ランディングネット必携"],
    managementInfo: { organizationName: "キングフィッシャー", openingHours: "7:00〜17:00(夏はナイター 18:00〜21:00 あり)", closedDays: "木曜日(祝日は営業)", fishingFee: "1日券6,300円・半日券5,300円・3時間券4,600円(大人)", notes: ["確認日 2026-11-17(公式サイト https://kingfisher-tochigi.com/price/ )", "ルアー専用。冬はブラックバスも対象", "持ち帰り 1日券10匹・半日券7匹・3時間券5匹(40〜59cmは1匹まで、60cm以上は不可)"] },
  },
  {
    id: "fw-502", name: "加賀フィッシングエリア", slug: "tochigi-kaga-fishing-area",
    description: "栃木県佐野市にある本格的なエリアトラウト場。クリアウォーターの大型ポンドが特徴で、サイトフィッシングが楽しめる。大物トラウトの放流量が多く、50cmオーバーのニジマスも珍しくない。都心から車で約1時間半のアクセスの良さも魅力。",
    // 住所は栃ナビ(tochinavi.net/spot/home/?id=9559)・TSURI HACK記載の「佐野市山形町48」、座標は国土地理院の住所検索による
    latitude: 36.3745, longitude: 139.5469, address: "栃木県佐野市山形町48",
    accessInfo: "北関東自動車道佐野田沼ICから約10分。東武佐野線田沼駅から車約10分。",
    region: lr("r5016"), spotType: "pond", isManagedPond: true, facilityKind: "managed", difficulty: "beginner",
    officialUrl: "https://kaga-fishingarea.jp/",
    // 2026-11-17 修正: 料金・営業時間を公式 https://kaga-fishingarea.jp/guide/ の値に更新(住所・座標は公式・国土地理院と一致のため据え置き)
    isFree: false, feeDetail: "男性 1日5,500円・午後4,500円、女性 1日4,500円・午後3,500円、中学生まで 1日3,000円・午後2,000円",
    hasParking: true, parkingDetail: "無料駐車場あり（約50台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタルタックルあり",
    mainImageUrl: "", images: [],
    rating: 4.4, reviewCount: 210,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝一番", method: "ルアー（スプーン）" },
      { fish: fish("brown-trout"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ルアー（ミノー）" },
    ],
    bestTimes: [{ label: "朝一番", timeRange: "07:00〜09:00", rating: "best" }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" }],
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["バーブレスフック限定", "キャッチ&リリースのルールあり"],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: false, fishingLicenseRequired: false,
      otherRules: ["ルアー・フライ専用", "持ち帰り 1日券10匹(40cm以上は1匹)・半日券5匹"],
    },
    managementInfo: { organizationName: "加賀フィッシングエリア", openingHours: "10〜4月 6:00〜17:00、5〜9月 6:00〜18:00", closedDays: "年中無休", fishingFee: "男性 1日5,500円・午後4,500円", notes: ["確認日 2026-11-17(公式サイト https://kaga-fishingarea.jp/ 、/concept/ 、/guide/)", "ポンドは3つ", "ルアー・フライ専用。持ち帰り 1日券10匹(40cm以上は1匹)・半日券5匹"] },
  },
  {
    id: "fw-503", name: "リヴァスポット早戸", slug: "kanagawa-revaspot-hayato",
    description: "相模原市緑区鳥屋、宮ヶ瀬湖の上流を流れる早戸川沿いの渓流型管理釣り場。相模漁業が運営し、ルアー・フライ・テンカラで釣るリヴァスポット早戸と、渓流竿のエサ釣りと釣り堀ができる早戸川国際マス釣場の2つの区画が同じ場所にある。ニジマスを毎日放流し、毎週土曜はサクラマスなどの特別放流がある。年中無休で、リヴァスポットは夏は19:30まで釣りができる。料金は現金のみで、ルアー竿やテンカラ竿のレンタルもある。川の中に入っての釣りは禁止。",
    // 2026-11-17 修正: 住所 緑区澤井254(公式に記載なし。国土地理院で「緑区澤井」は相模湖南の別地域)→ 公式アクセスの
    // 「〒252-0155 神奈川県相模原市緑区鳥屋3627」(https://www.hayatogawa.com/access.php )。
    // 座標は国土地理院 住所検索「相模原市緑区鳥屋」(大字中心。番地は当たらず)で取り直し(旧 35.5014,139.2136)。
    // 早戸川国際マス釣場(エサ釣場)は同じ公式サイト・住所・運営の別区画なので、新規に立てずこのスポットに統合した
    latitude: 35.516121, longitude: 139.175766, address: "〒252-0155 神奈川県相模原市緑区鳥屋3627",
    accessInfo: "圏央道相模原ICから約40分。本厚木駅からバスで宮ヶ瀬方面、徒歩約10分。",
    // 2026-11-17 修正: 施設名の region r5003 → 既存の r614 早戸川
    region: region("r614"), spotType: "river", isManagedPond: true, facilityKind: "managed", difficulty: "intermediate",
    officialUrl: "https://www.hayatogawa.com/",
    isFree: false, feeDetail: "リヴァスポット早戸(ルアー・フライ・テンカラ): 1日券(6:00〜17:00)大人5,500円・小学生以下4,300円、半日券(12:00〜17:00)4,300円、アフタヌーン券(12:00〜19:30)5,500円・4,300円とイブニング券(15:00〜19:30)4,300円は3/16〜10/15。早戸川国際マス釣場(エサ釣り): 入漁料1日4,000円、釣り堀は入漁料不要で1匹500円。現金のみ(2026年10月1日改定)",
    hasParking: true, parkingDetail: "駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "リヴァスポット: ルアー竿・リール・テンカラ竿・テンカラ糸 各500円(フライの貸竿なし)。エサ釣場: 貸竿(仕掛け付)300円",
    mainImageUrl: "", images: [],
    // 2026-11-17: 旧 rating 4.2 / reviewCount 178 は根拠不明のため慣習値に戻した
    rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "放流後", method: "ルアー・フライ・テンカラ(エサは別区画)", source: "https://www.hayatogawa.com/" },
      { fish: fish("sakuramasu"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "hard", recommendedTime: "土曜の特別放流後", method: "ルアー・フライ・テンカラ", source: "https://www.hayatogawa.com/information.php" },
    ],
    bestTimes: [{ label: "開場直後", timeRange: "06:00〜08:00", rating: "best" }, { label: "土曜の特別放流後", timeRange: "09:30〜11:00", rating: "best" }, { label: "午後の放流後", timeRange: "13:00〜15:00", rating: "good" }],
    tackleRecommendations: [],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: false, fishingLicenseRequired: false,
      otherRules: ["リヴァスポットはルアー・フライ・テンカラのみ(エサ・ワーム・ソフトルアー・ラバージグ・パワーベイト・ジグヘッド・集魚材は禁止)", "ルアー・テンカラでオモリ・目印・ウキは禁止", "入水・橋の上からの釣りは禁止", "リリースはバーブレスで水中で外す。ビクに入れた魚のリリースは禁止", "エサ釣場は渓流竿のエサ釣りのみ"],
    },
    safetyLevel: "caution", safetyNotes: ["渓流エリアは足元が滑りやすい", "入水しての釣りは禁止"],
    managementInfo: { organizationName: "相模漁業株式会社(早戸川国際マス釣場・リヴァスポット早戸)", contactPhone: "042-785-0774(リヴァスポット)/042-785-0704(エサ釣場)", openingHours: "リヴァスポット 6:00〜19:30(冬季は17:00まで)、エサ釣場 6:00〜17:00", closedDays: "なし(年中無休)", fishingFee: "リヴァスポット1日券5,500円・エサ釣場入漁料1日4,000円", notes: ["確認日 2026-11-17(公式サイト https://www.hayatogawa.com/ 、/charge.php 、/guide.php 、/access.php 、/information.php)", "支払いは現金のみ", "持ち帰りの匹数制限なし。予約不要(エサ釣場の団体貸切は電話予約)", "エサ釣場の放流 9:30・13:30(11〜2月は13:00)"] },
  },
  {
    id: "fw-504", name: "すそのフィッシングパーク", slug: "shizuoka-susono-fishing-park",
    description: "富士山の裾野に広がる静岡県裾野市の管理釣り場。富士山の伏流水を利用した透明度の高い水質が特徴。ルアー・フライ専用ポンドとエサ釣りポンドが分かれており、幅広い層が楽しめる。冬季でも水温が安定しているため通年営業。",
    latitude: 35.1733, longitude: 138.9061, address: "〒410-1231 静岡県裾野市須山2255-3139",
    accessInfo: "東名高速裾野ICから約20分。JR御殿場線裾野駅から車約25分。",
    region: lr("r5005"), spotType: "pond", isManagedPond: true, difficulty: "beginner",
    isFree: false, feeDetail: "1日券 大人4,600円、半日券3,300円",
    hasParking: true, parkingDetail: "無料駐車場あり（約80台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタルタックルセット1,500円",
    mainImageUrl: "", images: [],
    rating: 4.0, reviewCount: 165,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝一番", method: "ルアー（スプーン）" },
      { fish: fish("brown-trout"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ルアー（クランク）" },
    ],
    bestTimes: [{ label: "朝一番", timeRange: "07:00〜09:00", rating: "best" }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" }],
    tackleRecommendations: [],
    tideAdvice: tideFresh,
    mazumeInfo: { springSunrise: "05:25", springSunset: "18:10", summerSunrise: "04:35", summerSunset: "19:00", autumnSunrise: "05:35", autumnSunset: "17:05", winterSunrise: "06:50", winterSunset: "16:30", tip: "富士山の伏流水で水温が安定。冬でも活性が落ちにくい。" },
    safetyLevel: "safe", safetyNotes: ["バーブレスフック限定（ルアーエリア）"],
    managementInfo: { organizationName: "すそのフィッシングパーク", openingHours: "7:00〜17:00", closedDays: "なし（年中無休）", fishingFee: "1日券4,600円" },
  },
  {
    id: "fw-505", name: "大芦川F&Cフィールドビレッジ", slug: "tochigi-oashigawa-fc-village",
    description: "栃木県鹿沼市下沢、大芦川のそばにある池型の管理釣り場。大芦川の伏流水をくみ上げた100m×52mのルアー・フライ池があり、ニジマスを中心に放流している。料金は1日券のほか12時まで・15時まで・午後・15〜17時の時間券があり、女性・高校生未満の料金や男女ペア券、親子券も用意されている。営業は7:00〜17:00で、水洗トイレと温水シャワーを備える。持ち帰りは1日券15匹まで(ヤシオマスは1匹)。",
    // 2026-11-17 修正: 住所 鹿沼市草久3832 → 公式アクセスページの「栃木県鹿沼市下沢1037」(http://park10.wakwak.com/~field-village/ map.html)。
    // 座標は国土地理院 住所検索「鹿沼市下沢」(大字中心。番地は当たらず)で取り直し(旧 36.5722,139.6517)。
    // 種別: 公式の施設案内に「ルアー＆フライ池 100m×52m×3m」とある池型なので river → pond
    latitude: 36.586449, longitude: 139.694199, address: "〒322-02 栃木県鹿沼市下沢1037",
    accessInfo: "東北自動車道鹿沼ICから約30分。東武日光線新鹿沼駅から車約30分。",
    region: lr("r5007"), spotType: "pond", isManagedPond: true, facilityKind: "managed", difficulty: "beginner",
    officialUrl: "http://park10.wakwak.com/~field-village/",
    isFree: false, feeDetail: "大人 1日5,500円・12時まで4,600円・15時まで5,000円・午後4,300円・15〜17時3,100円、女性・高校生未満 4,300円・4,000円・4,100円・3,900円・3,000円、男女ペア8,000円、親子券7,800円(2026年10月10日から)",
    hasParking: true, parkingDetail: "無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタルロッドあり",
    mainImageUrl: "", images: [],
    rating: 3.9, reviewCount: 120,
    catchableFish: [
      // 2026-11-17: 公式の注意事項に出るヤシオマス(ニジマスの改良品種)を含めニジマスのみに。ヤマメ・イワナ(エサ釣り)は公式で確認できず削除
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "開場直後", method: "ルアー・フライ", source: "http://park10.wakwak.com/~field-village/" },
    ],
    bestTimes: [{ label: "開場直後", timeRange: "07:00〜09:00", rating: "best" }, { label: "日中", timeRange: "10:00〜15:00", rating: "good" }],
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["池の岸から釣る施設"],
    managementInfo: { organizationName: "大芦川F&Cフィールドビレッジ", openingHours: "7:00〜17:00", closedDays: "公式に記載なし", fishingFee: "大人1日5,500円", notes: ["確認日 2026-11-17(公式サイト http://park10.wakwak.com/~field-village/ の料金・施設・注意事項・地図ページ)", "持ち帰り 1日券15匹(ヤシオマスは1匹)、午後券5匹", "水洗トイレ・温水シャワーあり"] },
  },
  {
    id: "fw-506", name: "川場フィッシングプラザ", slug: "gunma-kawaba-fishing-plaza",
    description: "群馬県利根郡川場村の萩室にある池型の管理釣り場。ルアー・フライ用の大小2つの池と、エサ釣り用の5つの池があり、ニジマス・イワナ・ヤマメを狙える。エサ釣りの池は家族連れや初めての人でも始めやすく、ルアー・フライの池ではじっくりトラウトゲームが楽しめる。関越道沼田ICから近く、川場村の観光と合わせて立ち寄りやすい。",
    // 2026-11-17 修正: 住所 川場村谷地2419 → 公式の「群馬県利根郡川場村大字萩室63」(https://www.kawaba-fp.jp )。
    // 座標は国土地理院 住所検索「川場村萩室」(大字中心。番地は当たらず)で取り直し(旧 36.7217,139.1092)
    latitude: 36.689865, longitude: 139.12085, address: "群馬県利根郡川場村大字萩室63",
    accessInfo: "関越自動車道沼田ICから約15分。",
    region: lr("r5008"), spotType: "pond", isManagedPond: true, facilityKind: "managed", difficulty: "beginner",
    officialUrl: "https://www.kawaba-fp.jp/",
    isFree: false, feeDetail: "1日券 大人4,000円、半日券3,000円",
    hasParking: true, parkingDetail: "無料駐車場あり（約40台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタルタックルあり",
    mainImageUrl: "", images: [],
    rating: 4.0, reviewCount: 135,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "easy", recommendedTime: "開場直後", method: "ルアー・フライ・エサ釣り", source: "https://www.kawaba-fp.jp/" },
      { fish: fish("iwana"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ルアー・フライ・エサ釣り", source: "https://www.kawaba-fp.jp/" },
      { fish: fish("yamame"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ルアー・フライ・エサ釣り", source: "https://www.kawaba-fp.jp/" },
    ],
    bestTimes: [{ label: "開場直後", timeRange: "07:00〜09:00", rating: "best" }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" }],
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["バーブレスフック推奨"],
    managementInfo: { organizationName: "川場フィッシングプラザ", openingHours: "7:00〜17:00", closedDays: "水曜日", fishingFee: "1日券4,000円", notes: ["確認日 2026-11-17(公式サイト https://www.kawaba-fp.jp 、/price/)。住所・魚種・池の構成を確認。料金・営業時間・定休日は旧データのままで未確認", "ルアー・フライ用の大小2池、エサ釣り用の5池"] },
  },
  {
    id: "fw-507", name: "奥多摩フィッシングセンター", slug: "tokyo-okutama-fishing-center",
    description: "奥多摩漁業協同組合が青梅市御岳で運営する、多摩川沿いのマス釣り場。名前に奥多摩とあるが所在地は青梅市で、川の流れを使った釣り場のほかポンドのエリアもある。エサ釣りとルアー・フライ・テンカラで料金が分かれ、どちらも1日券。持ち帰りは10匹までで、超過分は1匹ごとに料金がかかる。ルアー・フライはシングルバーブレスフックで、ワームは使えない。都心から電車でも行ける近さが魅力。",
    // 2026-11-17 修正: 住所 奥多摩町氷川1100 → 公式の「東京都青梅市御岳2丁目333」(http://www.okutama-fc.co.jp/okutama_fc_esa.html 。証明書切れのためブラウザで閲覧)。
    // 座標は国土地理院 住所検索「青梅市御岳二丁目333番地」(番地精度)で取り直し(旧 35.8092,139.0953 は奥多摩町氷川)
    latitude: 35.804878, longitude: 139.175064, address: "東京都青梅市御岳2丁目333",
    accessInfo: "青梅市御岳の多摩川沿い。JR青梅線御嶽駅が最寄り。",
    region: lr("r5011"), spotType: "river", isManagedPond: true, facilityKind: "managed", difficulty: "beginner",
    officialUrl: "http://www.okutama-fc.co.jp/",
    isFree: false, feeDetail: "一般エサ釣り 1日3,600円、ルアー・フライ・テンカラ 1日4,000円。持ち帰り10匹まで(超過1匹360円)",
    hasParking: true, parkingDetail: "有料駐車場あり（1台1,000円/日）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタル竿・エサセットあり",
    mainImageUrl: "", images: [],
    rating: 3.8, reviewCount: 225,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "エサ釣り" },
      { fish: fish("yamame"), monthStart: 3, monthEnd: 9, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー" },
    ],
    bestTimes: [{ label: "開場直後", timeRange: "07:00〜09:00", rating: "best" }, { label: "日中", timeRange: "09:00〜15:00", rating: "good" }],
    tackleRecommendations: [],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: false, fishingLicenseRequired: false,
      otherRules: ["ルアー・フライはシングルバーブレスフック", "ワーム禁止", "持ち帰り10匹まで(超過1匹360円)"],
    },
    safetyLevel: "safe", safetyNotes: ["川の中に入る場合は滑りにくい靴を"],
    managementInfo: { organizationName: "奥多摩漁業協同組合(奥多摩フィッシングセンター)", openingHours: "7:00〜16:30", closedDays: "なし（3〜11月営業）", fishingFee: "エサ1日3,600円・ルアー/フライ/テンカラ1日4,000円", notes: ["確認日 2026-11-17(公式サイト http://www.okutama-fc.co.jp/okutama_fc_esa.html 。証明書切れのためブラウザで閲覧)。営業時間・期間は旧データのままで未確認", "ポンドエリアあり"] },
  },
  {
    id: "fw-508", name: "赤久縄（あかぐな）", slug: "gunma-akaguna-fa",
    description: "群馬県藤岡市上日野の山あいにある管理釣り場。渓流・ポンド・ダム湖の3つの区画があり、主体は渓流の釣り場。ルアー・フライの1日券・午後券のほか、エサの時間釣りや、釣った魚を重さで買い取る目方釣り(イワナ・ニジマス)もあるので、家族連れから渓流好きまで楽しみ方を選べる。木曜定休で、年末年始と毎年2月は休み。無料駐車場とトイレがある。",
    // 2026-11-17 修正: 住所 神流町大字塩沢(別の町)→ 公式お知らせページのフッター「〒375-0047 群馬県藤岡市上日野2-27」(https://www.akaguna.net/blog )。
    // 座標は国土地理院 住所検索「藤岡市上日野」(大字中心。番地は当たらず)で取り直し(旧 36.0722,138.8961)
    latitude: 36.173019, longitude: 138.938126, address: "〒375-0047 群馬県藤岡市上日野2-27",
    accessInfo: "藤岡市上日野の山間部。上信越自動車道藤岡ICから車でアクセス。",
    region: lr("r5002"), spotType: "river", isManagedPond: true, facilityKind: "managed", difficulty: "intermediate",
    officialUrl: "https://www.akaguna.net/",
    isFree: false, feeDetail: "エサ時間釣り 1時間1,500円、渓流 1日5,000円・午後4,000円、ルアー・フライ 1日5,000円・午後4,000円、目方釣り イワナ100g 370円・ニジマス100g 230円",
    hasParking: true, parkingDetail: "無料駐車場あり(50台)",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [],
    rating: 4.1, reviewCount: 98,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー・フライ" },
      { fish: fish("iwana"), monthStart: 4, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "フライ" },
    ],
    bestTimes: [{ label: "開場直後", timeRange: "06:00〜08:00", rating: "best" }, { label: "夕方", timeRange: "15:00〜17:00", rating: "good" }],
    tackleRecommendations: [],
    safetyLevel: "caution", safetyNotes: ["山間部のため天候急変に注意", "渓流エリアは足場に注意"],
    managementInfo: { organizationName: "赤久縄", contactPhone: "0274-28-0680", openingHours: "6:00〜17:00", closedDays: "木曜日(祝日は営業し前日の水曜が休み)、12/28〜1/2、毎年2月は全休", fishingFee: "渓流・ルアーフライ 1日5,000円・午後4,000円", notes: ["確認日 2026-11-17(公式サイト https://www.akaguna.net/ 、お知らせ 2026-11-13)", "渓流・ポンド・ダム湖の3区画", "トイレあり"] },
  },
  {
    id: "fw-509", name: "忍野フィッシングエリア", slug: "yamanashi-oshino-fishing-area",
    description: "山梨県忍野村、富士山の湧水を引き込んだクリアウォーターの管理釣り場。忍野八海の近くに位置し、透明度の高い水面でのサイトフィッシングが楽しめる。ニジマスは通年ルアー・フライで狙え、10〜5月はブラウントラウト、3〜11月はイワナも交じる。魚の警戒心が強いため極細ラインと小型ルアーが有効だ。1日券5,000円で、約30台分の無料駐車場・トイレ・釣具販売を備える。初〜中級者向けで、富士山の眺望とともに一日じっくり竿を出せる。",
    // 2026-11-17 修正: 住所に番地 1660-80 を追加(山梨県漁連の管理釣り場一覧PDF・公式 https://www.mfi.or.jp/~bass/oshino_info.html )。
    // 座標は国土地理院 住所検索「忍野村忍草1660番地」で取り直し(旧 35.4586,138.8361 は大字のみ)。
    // 旧 s282「忍野八海管理釣り場」(oshino-hakkai-trout)は同じ住所の重複なので削除し、このスポットへ転送
    latitude: 35.462105, longitude: 138.847031, address: "〒401-0511 山梨県南都留郡忍野村忍草1660-80",
    accessInfo: "東富士五湖道路山中湖ICから約10分。富士急行線富士山駅から車約20分。",
    region: lr("r5018"), spotType: "pond", isManagedPond: true, facilityKind: "managed", difficulty: "intermediate",
    officialUrl: "https://www.mfi.or.jp/~bass/oshino_info.html",
    isFree: false, feeDetail: "1日券 大人5,000円",
    hasParking: true, parkingDetail: "無料駐車場あり（約30台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "", images: [],
    rating: 4.3, reviewCount: 145,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 1, monthEnd: 12, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝一番", method: "ルアー・フライ" },
      { fish: fish("brown-trout"), monthStart: 10, monthEnd: 5, peakSeason: false, catchDifficulty: "hard", recommendedTime: "日中", method: "ルアー（ミノー）" },
      { fish: fish("iwana"), monthStart: 3, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フライ" },
    ],
    bestTimes: [{ label: "朝一番", timeRange: "06:30〜08:30", rating: "best" }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" }],
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["バーブレスフック限定"],
    managementInfo: { organizationName: "忍野フィッシングエリア", contactPhone: "0555-84-2511", openingHours: "11〜3月 7:00〜16:00、4〜10月 7:00〜17:00", closedDays: "不定休", fishingFee: "1日券5,000円", notes: ["確認日 2026-11-17(山梨県漁連の管理釣り場一覧PDF・公式 https://www.mfi.or.jp/~bass/oshino_info.html 。公式ページは文字化けがあり営業時間は要再確認)。料金は旧データのままで未確認"] },
  },
  {
    id: "fw-510", name: "東山湖フィッシングエリア", slug: "shizuoka-higashiyamako-fa",
    description: "静岡県御殿場市にある富士山を望む管理釣り場。大型ポンドが特徴で、放流量が多くコンスタントに釣果が出やすい。冬季のワカサギ釣りも好評。御殿場プレミアムアウトレットの近くにあり、家族での釣行にも便利。",
    latitude: 35.2847, longitude: 138.9192, address: "〒412-0024 静岡県御殿場市東山1077",
    accessInfo: "東名高速御殿場ICから約5分。JR御殿場線御殿場駅からバス約10分。",
    region: lr("r5019"), spotType: "pond", isManagedPond: true, difficulty: "beginner",
    isFree: false, feeDetail: "1日券 大人4,700円、半日券3,500円",
    hasParking: true, parkingDetail: "無料駐車場あり（約100台）",
    hasToilet: true, hasConvenienceStore: true, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタルタックルセットあり",
    mainImageUrl: "", images: [],
    rating: 4.0, reviewCount: 188,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝一番", method: "ルアー（スプーン）" },
      { fish: fish("wakasagi"), monthStart: 11, monthEnd: 3, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "ワカサギ仕掛け" },
    ],
    bestTimes: [{ label: "朝一番", timeRange: "06:30〜08:30", rating: "best" }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" }],
    tackleRecommendations: [],
    tideAdvice: tideFresh,
    mazumeInfo: { springSunrise: "05:25", springSunset: "18:10", summerSunrise: "04:35", summerSunset: "19:00", autumnSunrise: "05:35", autumnSunset: "17:05", winterSunrise: "06:50", winterSunset: "16:30", tip: "富士山を目の前に釣りが楽しめる贅沢なロケーション。冬ワカサギも人気。" },
    safetyLevel: "safe", safetyNotes: ["バーブレスフック限定（ルアーエリア）"],
    managementInfo: { organizationName: "東山湖フィッシングエリア", openingHours: "6:30〜17:00", closedDays: "なし（年中無休）", fishingFee: "1日券4,700円" },
  },
  {
    // 2026-11-17 修正: 旧名「白馬フィッシングエリア」は実在が確認できず(検索でツリスポ自身のページのみ)。白馬村北城で営業する
    // 管理釣り場「白馬八方ニレ池フィッシングセンター」(公式 https://www.nireike.com/ )に名称・住所・種別を合わせた。slug は据え置き。
    // 座標は国土地理院 住所検索「白馬村北城」(大字中心。番地は当たらず)で取り直し(旧 36.6981,137.8617)
    id: "fw-511", name: "白馬八方ニレ池フィッシングセンター", slug: "nagano-hakuba-fishing-area",
    description: "長野県白馬村北城、八方尾根のふもとにある池の管理釣り場。ルアー・フライのエリアとエサ釣りのエリアがあり、ニジマスやサクラマスを狙える。釣った魚はすべて100g単位の買い取りになるので、釣った分だけ持ち帰って味わえる。営業はおおむね朝7時から夕方まで。北アルプスを望む白馬の観光と合わせて、家族連れでも気軽に立ち寄れる。営業日は公式サイトのスケジュールで確かめたい。",
    latitude: 36.708416, longitude: 137.838608, address: "長野県北安曇郡白馬村北城9338-13",
    accessInfo: "長野自動車道安曇野ICから約60分。JR大糸線白馬駅から車約10分。",
    region: lr("r5006"), spotType: "pond", isManagedPond: true, facilityKind: "managed", difficulty: "beginner",
    officialUrl: "https://www.nireike.com/",
    isFree: false, feeDetail: "釣った魚はすべて買い取り 100gあたり200円",
    hasParking: true, parkingDetail: "駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [],
    rating: 3.5, reviewCount: 0,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "開場直後", method: "ルアー・フライ・エサ釣り", source: "https://www.nireike.com/eigyouannai.htm" },
      { fish: fish("sakuramasu"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ルアー・フライ・エサ釣り", source: "https://www.nireike.com/eigyouannai.htm" },
    ],
    bestTimes: [{ label: "開場直後", timeRange: "07:00〜09:00", rating: "best" }, { label: "夕方", timeRange: "15:00〜17:00", rating: "good" }],
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["標高が高いため朝晩は冷え込む"],
    managementInfo: { organizationName: "白馬八方ニレ池フィッシングセンター", contactPhone: "0261-72-3708", openingHours: "7:00〜17:00頃", fishingFee: "買い取り 100g 200円", notes: ["確認日 2026-11-17(公式サイト https://www.nireike.com/ 、営業案内 https://www.nireike.com/eigyouannai.htm)", "釣った魚は全て買い取り", "営業日は公式の営業スケジュールを参照", "旧データの1日券4,500円・冬季休業・レンタル・売店は公式で確認できなかったため削除"] },
  },
  // 2026-11-17 削除: fw-512「上野村フィッシングリゾート」(gunma-uenomura-fishing-resort)は公式・一覧サイト・上野村・上野村漁協のどこにも無く、
  // 実在しない疑い(検索はツリスポ自身のページのみ)。spot-redirects.json で上野村漁協の uenomura-kannagawa-winter-hakosuchi へ転送
  {
    id: "fw-513", name: "平谷湖フィッシングスポット", slug: "nagano-hirayako-fishing-spot",
    description: "長野県下伊那郡平谷村にある標高920mの高原管理釣り場。湧水を利用した透明度の高い池でニジマスを中心に様々なトラウトが楽しめる。エサ釣り・ルアー・フライと幅広い釣り方に対応。名古屋方面からのアクセスが良い。",
    latitude: 35.2247, longitude: 137.5953, address: "〒395-0601 長野県下伊那郡平谷村靭",
    accessInfo: "中央自動車道飯田ICから約35分。国道153号沿い。",
    region: lr("r5014"), spotType: "pond", isManagedPond: true, facilityKind: "managed", difficulty: "beginner",
    officialUrl: "https://hirayako.com/",
    isFree: false, feeDetail: "1日券 大人4,000円、半日券2,800円",
    hasParking: true, parkingDetail: "無料駐車場あり（約60台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタルタックルあり",
    mainImageUrl: "", images: [],
    rating: 4.0, reviewCount: 110,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝一番", method: "ルアー（スプーン）" },
      { fish: fish("amago"), monthStart: 3, monthEnd: 9, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "フライ" },
    ],
    bestTimes: [{ label: "朝一番", timeRange: "07:00〜09:00", rating: "best" }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" }],
    tackleRecommendations: [],
    safetyLevel: "safe", safetyNotes: ["山間部のため天候変化に注意"],
    managementInfo: { organizationName: "平谷湖フィッシングスポット", contactPhone: "0265-48-1127", openingHours: "7:00〜17:00", closedDays: "火曜日（冬季休業）", fishingFee: "1日券4,000円", notes: ["確認日 2026-11-17(公式サイト https://hirayako.com/)。2026年シーズンは4月4日開業。電話・公式URLを確認。料金・営業時間・定休日は旧データのままで未確認(番地は公式トップに記載なし)"] },
  },
  {
    id: "fw-514", name: "フォレストパークあだたら", slug: "fukushima-forest-park-adatara",
    description: "福島県安達太良山の麓に位置する管理釣り場。ポンドタイプとストリームタイプの2つのフィールドがあり、安達太良山の清流を利用した水質の良さが自慢。東北エリアトラウトの人気スポットで、大型のニジマスやイワナが狙える。",
    latitude: 37.6447, longitude: 140.3153, address: "〒964-0075 福島県二本松市田沢蟹沢口",
    accessInfo: "東北自動車道二本松ICから約20分。JR東北本線二本松駅から車約25分。",
    region: lr("r5015"), spotType: "pond", isManagedPond: true, difficulty: "beginner",
    isFree: false, feeDetail: "1日券 大人4,000円",
    hasParking: true, parkingDetail: "無料駐車場あり（約40台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタルロッドあり",
    mainImageUrl: "", images: [],
    rating: 4.2, reviewCount: 82,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝一番", method: "ルアー（スプーン）" },
      { fish: fish("iwana"), monthStart: 4, monthEnd: 10, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "ルアー" },
      { fish: fish("yamame"), monthStart: 4, monthEnd: 9, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "フライ" },
    ],
    bestTimes: [{ label: "朝一番", timeRange: "06:30〜08:30", rating: "best" }, { label: "夕方", timeRange: "15:00〜17:00", rating: "good" }],
    tackleRecommendations: [],
    tideAdvice: tideFresh,
    mazumeInfo: { springSunrise: "05:05", springSunset: "18:20", summerSunrise: "04:20", summerSunset: "19:05", autumnSunrise: "05:15", autumnSunset: "17:15", winterSunrise: "06:40", winterSunset: "16:30", tip: "安達太良山の雪解け水で水温が安定。ストリームエリアは本格渓流の趣。" },
    safetyLevel: "safe", safetyNotes: ["バーブレスフック限定", "熊注意（山麓エリア）"],
    managementInfo: { organizationName: "フォレストパークあだたら", openingHours: "6:30〜17:00", closedDays: "不定休（冬季休業）", fishingFee: "1日券4,000円" },
  },
  {
    id: "fw-515", name: "北方マス釣り場", slug: "aichi-kitakata-masu-fishing",
    description: "愛知県北設楽郡にある豊川上流の管理釣り場。三河山間部の豊かな自然の中で、ニジマスやアマゴを手軽に楽しめる。エサ釣りがメインで、釣った魚は塩焼きにして食べられる。名古屋からの日帰り渓流釣りに最適な施設。",
    latitude: 35.0567, longitude: 137.6178, address: "〒441-2513 愛知県北設楽郡設楽町田峯字小林",
    accessInfo: "新東名高速新城ICから約40分。",
    region: lr("r5012"), spotType: "river", isManagedPond: true, difficulty: "beginner",
    isFree: false, feeDetail: "1日券 大人3,300円（持ち帰り含む）",
    hasParking: true, parkingDetail: "無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true, rentalDetail: "レンタル竿セットあり",
    mainImageUrl: "", images: [],
    rating: 3.8, reviewCount: 72,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 3, monthEnd: 11, peakSeason: true, catchDifficulty: "easy", recommendedTime: "日中", method: "エサ釣り" },
      { fish: fish("amago"), monthStart: 3, monthEnd: 9, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "エサ釣り" },
    ],
    bestTimes: [{ label: "朝マヅメ", timeRange: "06:30〜08:30", rating: "best" }, { label: "日中", timeRange: "09:00〜15:00", rating: "good" }],
    tackleRecommendations: [],
    tideAdvice: tideFresh,
    mazumeInfo: { springSunrise: "05:25", springSunset: "18:15", summerSunrise: "04:40", summerSunset: "19:05", autumnSunrise: "05:35", autumnSunset: "17:10", winterSunrise: "06:50", winterSunset: "16:40", tip: "エサはイクラかブドウ虫が定番。浅瀬のポイントを狙うと数が出る。" },
    safetyLevel: "safe", safetyNotes: ["子ども連れでも楽しめる浅い釣り場"],
    managementInfo: { organizationName: "北方マス釣り場", openingHours: "7:30〜16:00", closedDays: "月曜日（祝日の場合翌日）", fishingFee: "1日券3,300円" },
  },
  {
    id: "fw-516", name: "美濃フィッシングエリア", slug: "gifu-mino-fishing-area",
    description: "岐阜県美濃市にある長良川水系の湧水を利用した管理釣り場。クリアな水質で魚体のコンディションが良いと評判のルアー・フライ専用エリア。主力のニジマスは10〜5月がシーズンで朝一番のスプーンが定番。大型のブラウントラウトは10〜4月にミノーで、3〜9月はアマゴのフライフィッシングも楽しめる。料金は1日券大人4,500円、営業時間は7:00〜17:00で木曜定休。バーブレスフック限定のルールがある。無料駐車場約50台とトイレ、釣具店を備え、東海北陸道美濃ICから約10分とアクセスも良い。透明度の高い湧水ゆえ魚から見切られやすく、繊細なアプローチが求められる点も上達の好材料になる。",
    latitude: 35.5461, longitude: 136.8989, address: "〒501-3714 岐阜県美濃市蕨生",
    accessInfo: "東海北陸自動車道美濃ICから約10分。",
    region: lr("r5013"), spotType: "river", isManagedPond: true, difficulty: "intermediate",
    isFree: false, feeDetail: "1日券 大人4,500円",
    hasParking: true, parkingDetail: "無料駐車場あり（約50台）",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: false,
    mainImageUrl: "", images: [],
    rating: 4.2, reviewCount: 125,
    catchableFish: [
      { fish: fish("nijimasu"), monthStart: 10, monthEnd: 5, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝一番", method: "ルアー（スプーン）" },
      { fish: fish("brown-trout"), monthStart: 10, monthEnd: 4, peakSeason: false, catchDifficulty: "hard", recommendedTime: "夕方", method: "ルアー（ミノー）" },
      { fish: fish("amago"), monthStart: 3, monthEnd: 9, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "フライ" },
    ],
    bestTimes: [{ label: "朝一番", timeRange: "07:00〜09:00", rating: "best" }, { label: "夕方", timeRange: "15:00〜17:00", rating: "good" }],
    tackleRecommendations: [],
    tideAdvice: tideFresh,
    mazumeInfo: { springSunrise: "05:25", springSunset: "18:15", summerSunrise: "04:40", summerSunset: "19:05", autumnSunrise: "05:35", autumnSunset: "17:10", winterSunrise: "06:55", winterSunset: "16:40", tip: "長良川の伏流水を使ったクリアウォーター。繊細なアプローチが求められる。" },
    safetyLevel: "safe", safetyNotes: ["バーブレスフック限定", "ルアー・フライ専用"],
    managementInfo: { organizationName: "美濃フィッシングエリア", openingHours: "7:00〜17:00", closedDays: "木曜日", fishingFee: "1日券4,500円" },
  },
];
