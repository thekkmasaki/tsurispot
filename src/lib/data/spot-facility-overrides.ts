import type { FishingSpot, SpotRules } from "@/types";

/**
 * 公式サイトのある釣り施設の掲載情報を、公式の値で上書きする表（2026-11 一斉監査の対応）。
 * 重複統合後の slug → 上書きする項目。spots.ts の applyFacilityOverrides で適用する。
 *
 * 外部監査で、海づり公園など公式サイトのある施設の料金・駐車場・レンタル・営業時間が
 * 公式と食い違っていると指摘された（20施設中19施設）。同じ施設が複数ファイルに定義されて
 * いることがあるため、元データを個別に書き換える代わりに、統合後の slug に一括で当てる。
 *
 * - 公式ページで確認できた項目だけを書く。公式に載っていない項目は書き換えず、
 *   managementInfo.notes に「公式に記載なし」と残す（推測で埋めない）
 * - rules は既存のルールに部分的に重ねる（既存の rules が無いスポットには、全項目を書いたときだけ付ける）
 */
export interface SpotFacilityOverride {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  isFree?: boolean;
  feeDetail?: string;
  hasParking?: boolean;
  parkingDetail?: string;
  hasRentalRod?: boolean;
  rentalDetail?: string;
  officialUrl?: string;
  managementInfo?: FishingSpot["managementInfo"];
  rules?: Partial<SpotRules>;
}

const VERIFIED = "2026-11-21";
const CHECK_NOTE = "料金・営業時間は変わることがあります。出かける前に公式サイトで確認してください";

// 指示書03（docs/fishing-ban-investigation-03.md）で公式情報を確認した日
const INVESTIGATION_03 = "2026-11-21";

// 利根川下流（香取市佐原付近〜銚子）。千葉県の内水面遊漁の案内・漁場図・県報の遊漁規則で確認
const TONEGAWA_LOWER: SpotFacilityOverride = {
  isFree: false,
  feeDetail:
    "漁業権の対象魚種を釣るには遊漁承認証（遊漁券）が必要。佐原漁協（内共第10号）1日200円・1年1,000円、北総・笹川・中利根漁協（内共第11号）1日300円・1年2,000円（千葉県の案内）",
  managementInfo: {
    organizationName: "佐原漁業協同組合ほか（利根川 内共第10号・第11号）",
    fishingFee: "内共第10号 1日200円・1年1,000円／内共第11号 1日300円・1年2,000円",
    licensingInfo: "漁場の区域内で遊漁をするには、あらかじめ組合の承認を受け、遊漁料を納める必要がある",
    notes: ["うなぎには採捕できる大きさの制限があります（千葉県）", "区間ごとの漁協と対象魚種は千葉県の漁場図・遊漁規則で確認してください"],
    verifiedAt: INVESTIGATION_03,
    sourceUrl: "https://www.pref.chiba.lg.jp/gyoshigen/naisuimen/yuugyo.html",
  },
};

const KATSUURA_NOTICE =
  "2024年4月以降、漁協の掲示で港内の多くの場所（赤灯の波止・墨名堤防の先端など）が立入禁止になったと報じられている（千葉県・勝浦市の公式の公表は未確認）。釣りができる場所と時間は現地の掲示で必ず確認すること";
const CHOSHI_NOTICE =
  "銚子市漁協の告知で、外港・黒生地区・夫婦ヶ鼻堤防は関係者以外立入禁止とされている（漁港を管理する千葉県の公式の公表は未確認）。現地の掲示に従うこと";
const SHIMONOSEKI_NOTICE =
  "下関漁港（南風泊を含む）は、波止・消波ブロック・外海側の護岸などに立入禁止の場所があると報じられている（管理者の山口県の公式の公表は未確認）。現地の掲示に従うこと";

export const spotFacilityOverrides: Record<string, SpotFacilityOverride> = {
  // 須磨海づり公園: 2024-11-01 に有料施設としてリニューアル開園。掲載は閉鎖中の「跡」の浜のままだった
  "suma-umizuri-koen-ato": {
    name: "須磨海づり公園",
    address: "〒654-0076 兵庫県神戸市須磨区一ノ谷町5丁目地先",
    // 一ノ谷町5丁目の地先（国土地理院の住所検索で5丁目の代表点 34.6375,135.1012 を確認し、その海側）
    latitude: 34.6368,
    longitude: 135.1035,
    description:
      "神戸市須磨区一ノ谷町の沖に延びる、神戸市立の有料の海づり公園。旧施設の閉園後、2024年11月にリニューアル開園した。柵のある釣台から明石海峡寄りの大阪湾を狙え、竿（仕掛け付き）のレンタルもある。釣り料は16歳以上1,200円・6〜15歳700円（4時間まで、以降1時間ごとの延長料金）。毎週火曜が休園（祝日と7/21〜8/31は営業）。竿釣り・手釣り以外の釣り方は禁止で、竿は1人2本まで。",
    isFree: false,
    feeDetail:
      "4時間まで 16歳以上1,200円・6〜15歳700円・神戸市在住の65歳以上600円。延長は1時間ごとに300円・170円・150円。見学 200円・100円",
    hasParking: true,
    parkingDetail: "須磨浦公園駐車場（223台）を利用（料金は公式サイトに記載なし）",
    hasRentalRod: true,
    rentalDetail: "竿（仕掛け付き）1,000円",
    officialUrl: "https://sumasakana-park.com/",
    managementInfo: {
      organizationName: "神戸市立須磨海づり公園（指定管理者: 株式会社ハウスビルシステム）",
      contactPhone: "078-200-6547",
      contactUrl: "https://sumasakana-park.com/",
      openingHours: "11〜3月 7:00〜17:00／4〜10月 6:00開園（閉園は月により異なる。例: 9月は平日19:00・土日20:00、10月は19:00）",
      closedDays: "毎週火曜（祝日と7/21〜8/31は営業）、12/29〜1/3",
      fishingFee: "4時間まで 16歳以上1,200円・6〜15歳700円（以降1時間ごとに延長料金）",
      notes: ["竿釣り・手釣り以外の釣り方は禁止。北釣台では内側に向けた投げ釣り・ルアー釣りは禁止", "竿は1人2本まで", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://sumasakana-park.com/guide/",
    },
    rules: {
      castingAllowed: false,
      lureAllowed: false,
      chumAllowed: true,
      nightFishing: false,
      fishingLicenseRequired: false,
      maxRods: 2,
      otherRules: ["竿釣り・手釣り以外は禁止", "北釣台では内側に向けた投げ釣り・ルアー釣りは禁止", "竿は1人2本まで", "営業時間内のみ利用可（毎週火曜は休園）"],
    },
  },

  // 尼崎市立魚つり公園: 料金・駐車場・レンタルが古く、ルアー可になっていた（公式は投げ・ルアー禁止）
  "amagasaki-fishing-park": {
    isFree: false,
    feeDetail: "大人830円・子ども（6〜16歳未満）410円・6歳未満無料（時間制ではない）。見学 大人200円・子ども100円",
    hasParking: true,
    parkingDetail: "有料（普通車 30分100円、最大800円）。障害者手帳などの提示で半額",
    hasRentalRod: true,
    rentalDetail: "竿（仕掛け付き）1,500円・仕掛けなし1,300円。小学3年生以下はライフジャケット無料",
    officialUrl: "https://amagasaki-uoturikouen.com/",
    managementInfo: {
      organizationName: "尼崎市立魚つり公園",
      contactPhone: "06-6417-3000",
      contactUrl: "https://amagasaki-uoturikouen.com/",
      openingHours: "5・6・11月 6:00〜19:00／7〜10月 5:00〜20:00／12〜4月 7:00〜17:00",
      closedDays: "毎週火曜（祝日の場合は翌日）、12/31〜1/1、悪天候の日",
      fishingFee: "大人830円・子ども410円・6歳未満無料",
      notes: ["投げ釣り・ルアー釣りは禁止（竿釣り・手釣りのみ）", "10歳以下は付き添いが必要。ペット不可", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://amagasaki-uoturikouen.com/guide.html",
    },
    rules: {
      castingAllowed: false,
      lureAllowed: false,
      maxRods: undefined,
      otherRules: ["施設利用料が必要", "投げ釣り・ルアー釣りは禁止（竿釣り・手釣りのみ）", "営業時間内のみ利用可（毎週火曜は休園）"],
    },
  },

  // 大阪南港魚つり園: 入園は無料だが駐車場は有料（掲載は「無料駐車場」）。同じ施設の2ページは統合（spot-merge-map）
  "osaka-nanko-fishing-park": {
    isFree: true,
    feeDetail: "入園無料",
    hasParking: true,
    parkingDetail: "有料（1日料金。0:00〜11:59入庫 2,000円、12:00以降入庫 1,500円）。約100台",
    hasRentalRod: true,
    rentalDetail: "竿1本1,000円（サビキ仕掛け付き）",
    officialUrl: "https://nankou-uotsuri-en.com/",
    managementInfo: {
      organizationName: "大阪南港魚つり園（運営: 株式会社ハウスビルシステム）",
      contactUrl: "https://nankou-uotsuri-en.com/",
      openingHours: "4〜11月 5:00〜19:00／12〜3月 7:00〜17:00",
      closedDays: "毎週水曜、12/28〜1/4",
      fishingFee: "入園無料",
      notes: ["投げ釣りは禁止。ルアーは可", "竿は1人1本まで", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://nankou-uotsuri-en.com/guide/",
    },
    rules: {
      castingAllowed: false,
      lureAllowed: true,
      chumAllowed: true,
      nightFishing: false,
      fishingLicenseRequired: false,
      maxRods: 1,
      otherRules: ["投げ釣りは禁止", "竿は1人1本まで", "営業時間内のみ利用可（毎週水曜は休園）"],
    },
  },

  // 若狭高浜海釣り公園: 料金・駐車場が「要確認」のまま。竿の貸出は中止中
  "wakasa-takahama-umizuri": {
    isFree: false,
    feeDetail: "1人200円",
    hasParking: true,
    parkingDetail: "約40台。清掃協力金として車1台1,000円・バイク500円",
    hasRentalRod: false,
    rentalDetail: "竿・ライフジャケットの貸し出しは当面中止（公式）",
    officialUrl: "https://wakasa-takahama.jp/spot/umizuripark/",
    managementInfo: {
      organizationName: "若狭高浜海釣り公園（運営: 若狭高浜漁業協同組合）",
      contactPhone: "0770-72-1234",
      contactUrl: "https://wakasa-takahama.jp/spot/umizuripark/",
      openingHours: "4〜11月の 8:00〜17:00（2026年は4月4日から営業）",
      closedDays: "毎週水曜、12〜3月、天候による臨時休業",
      fishingFee: "1人200円",
      notes: ["老朽化のため、桟橋と一部のエリアは立入禁止", "係員の指示に従い、指定された場所でのみ釣りをすること", "ライフジャケットの着用が求められている", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://wakasa-takahama.jp/spot/umizuripark/",
    },
  },

  // 新地町海釣り公園: 「無料」と掲載していたが、有料（高校生以上1,500円）で事前予約制。同じ施設の2ページは統合
  "shinchi-umizuri-park-a11": {
    address: "福島県相馬郡新地町今泉（相馬港5号埠頭）",
    isFree: false,
    feeDetail: "高校生以上1,500円・小4〜中学生1,000円（半日または1回の入園ごと）。釣りをしない同伴者は半額",
    hasRentalRod: false,
    rentalDetail: "ライフジャケットは無料で貸出。竿の貸し出しは公式サイトに記載なし",
    officialUrl: "https://www.shinchi-fishing.com/",
    managementInfo: {
      organizationName: "新地町海釣り公園",
      contactPhone: "0244-62-5559",
      contactUrl: "https://www.shinchi-fishing.com/",
      openingHours: "4〜10月 6:00〜12:00・12:00〜18:00の2部制／11〜3月 土日祝 6:30〜11:30・11:30〜16:30の2部制、平日 9:00〜14:00",
      closedDays: "毎週水曜（祝日は営業）、12/29〜1/3、荒天日",
      fishingFee: "高校生以上1,500円・小4〜中学生1,000円（2026年4月改定）",
      notes: [
        "事前予約制（電話または管理棟窓口。1か月先の同日まで）",
        "小学3年生以下は入園不可。小4〜中学生は大人の同伴が必要。誓約書の記入が必要",
        "1人1区画で竿は1本。メタルジグは使用不可",
        CHECK_NOTE,
      ],
      verifiedAt: VERIFIED,
      sourceUrl: "https://www.shinchi-fishing.com/?page_id=12",
    },
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      chumAllowed: true,
      nightFishing: false,
      fishingLicenseRequired: false,
      maxRods: 1,
      otherRules: ["事前予約制", "竿は1人1本まで", "メタルジグは使用不可。危険な投げ釣りは禁止", "小学3年生以下は入園不可"],
    },
  },

  // 浅虫海づり公園: 同じページに「無料」と「大人300円」が併記されていた。公式は有料（釣り台700円）で季節営業
  "asamushi-umizuri-kouen6": {
    isFree: false,
    feeDetail: "釣り台利用料（入園料込み）大人700円・小人500円。入園のみ 大人150円・小人70円",
    hasRentalRod: true,
    rentalDetail: "竿 大人・小人とも500円",
    officialUrl: "https://www.asamushi.com/sightseeing/15/",
    managementInfo: {
      organizationName: "浅虫海づり公園（指定管理者: 一般社団法人浅虫温泉観光協会）",
      contactUrl: "https://www.asamushi.com/sightseeing/15/",
      openingHours: "季節営業（2026年度は4月29日〜10月12日）。4/29〜9/30 9:00〜17:00、10/1〜10/12 9:00〜16:00",
      closedDays: "毎週火曜（祝日の場合は翌平日）、荒天時。営業期間外は休園",
      fishingFee: "釣り台 大人700円・小人500円（入園料込み）",
      notes: ["持ち込み竿は2本まで", "10歳未満は保護者の付き添いが必要", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://www.asamushi.com/sightseeing/15/",
    },
  },

  // 市原市海づり施設: 料金が古い。中学生以下は無料。「跡地」ページは営業中の同じ施設なので統合
  "ichihara-sea-fishing": {
    isFree: false,
    feeDetail: "一般920円・65歳以上460円・中学生以下無料（1回ごと）。見学 一般220円・65歳以上110円",
    hasRentalRod: true,
    rentalDetail: "竿1,000円（売店）。小学生以下はライフジャケット無料",
    officialUrl: "https://ichihara-umizuri.com/",
    managementInfo: {
      organizationName: "市原市海づり施設（オリジナルメーカー海づり公園）",
      contactUrl: "https://ichihara-umizuri.com/",
      openingHours: "4〜10月 6:00〜19:00（桟橋は18:30まで）／11〜3月 7:00〜17:00（桟橋は16:30まで）",
      closedDays: "毎週月曜（祝日の場合は直後の平日。7〜10月は毎日開園）、12/31〜1/3、悪天候の日",
      fishingFee: "一般920円・65歳以上460円・中学生以下無料",
      notes: ["竿は1人2本まで。危険な投げ釣りは禁止", "小学生以下は有料の大人の付き添いが必要", "工事中は入場定員を設けている（2026年11月）", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://ichihara-umizuri.com/guide/",
    },
  },

  // 鹿島港魚釣園: 料金（大人200円→600円）と駐車場台数が古い
  "kashima-port-fishing-park": {
    address: "〒314-0013 茨城県鹿嶋市新浜11",
    isFree: false,
    feeDetail: "大人600円・小中学生300円・小学生未満無料（1回入園ごと・現金のみ）",
    hasParking: true,
    parkingDetail: "無料（30台）",
    hasRentalRod: true,
    rentalDetail: "竿のレンタルあり（別料金。金額は公式サイトに記載なし）。ライフジャケット300円",
    managementInfo: {
      organizationName: "鹿島港魚釣園",
      contactUrl: "https://kashima-fa.com/",
      openingHours: "5〜10月 7:00〜19:00／11〜4月 8:00〜17:00（最終入園は閉園1時間前）",
      closedDays: "毎週火曜（祝日の場合は翌日）、12/29〜1/3、荒天時",
      fishingFee: "大人600円・小中学生300円",
      notes: ["出し竿は1人2本まで。ギャングバリは禁止", "ライフジャケットの着用と誓約書の記入が必要", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://kashima-fa.com/infomation/",
    },
    rules: { maxRods: 2 },
  },

  // 熱海港海釣り施設: 投げ釣り禁止・竿2本と掲載していたが、公式に投げ釣り禁止の記載はない。同じ施設の別ページ（料金1,000円の誤り）は統合
  "atami-fishing-pier": {
    isFree: false,
    feeDetail: "大人500円・小中学生300円・未就学児無料。見学 大人300円・小中学生200円",
    hasParking: true,
    parkingDetail: "有料（普通車1日500円・前払い）。約400台",
    hasRentalRod: true,
    rentalDetail: "竿1本2時間2,500円（エサ・仕掛け・バケツ・初期指導込み、入場料別）、延長1時間1,000円。ライフジャケットは無料貸出",
    officialUrl: "https://www5d.biglobe.ne.jp/~atami/",
    managementInfo: {
      organizationName: "熱海港海釣り施設（熱海市。管理委託: SEA WEB）",
      contactPhone: "0557-85-8600",
      contactUrl: "https://www5d.biglobe.ne.jp/~atami/",
      openingHours: "4〜10月 6:00〜日没／11〜3月 7:00〜日没（11月は16:30まで）",
      closedDays: "第3水曜（花火大会が月2回以上ある月は営業）、荒天時",
      fishingFee: "大人500円・小中学生300円・未就学児無料",
      notes: [
        "ライフジャケットの着用が必要（無料貸出）",
        "釣りは湾内側のみ。ヤエン釣り・生き餌のウキ釣り・アジの泳がせ釣りは禁止。ルアー・エギは可",
        "混雑時は竿1人1本",
        "2026年11月11日から年内は安全柵の工事で、工事区間は順番に釣りができない",
        CHECK_NOTE,
      ],
      verifiedAt: VERIFIED,
      sourceUrl: "https://www5d.biglobe.ne.jp/~atami/",
    },
    rules: {
      castingAllowed: true,
      lureAllowed: true,
      maxRods: undefined,
      otherRules: [
        "釣りは湾内側のみ（フェンスの外は禁止）",
        "ヤエン釣り・生き餌のウキ釣り・アジの泳がせ釣りは禁止",
        "混雑時は竿1人1本",
        "投げ釣りは周囲に配慮して",
        "ライフジャケット着用",
      ],
    },
  },

  // 浜名湖 新居海釣公園: 駐車場を「無料」と掲載していたが有料。「施設利用料が必要」は公式に記載がない
  "hamanako-arai-umizuri-koen": {
    address: "静岡県湖西市新居町新居",
    hasParking: true,
    parkingDetail: "有料（30分以上で1日400円）。釣り場は駐車場内",
    hasRentalRod: true,
    rentalDetail: "公園内の釣具店「今切ショップ」で貸し出しあり（料金は公式に記載なし）",
    managementInfo: {
      organizationName: "新居弁天海釣公園（問い合わせ: 湖西・新居観光協会）",
      contactPhone: "053-596-9255",
      contactUrl: "https://hamanako-kosai.jp/location/2330/",
      notes: ["入場料・営業時間・釣り方のルールは公式に記載なし。現地の掲示に従ってください", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://hamanako-kosai.jp/location/2330/",
    },
    rules: { otherRules: ["釣り場は有料駐車場の中（1日400円）", "ルールは現地の掲示に従う"] },
  },

  // 豊浜釣り桟橋: 無料であることを公式（南知多町観光協会）で確認。駐車場・時間は公式に記載なし
  "toyohama-fishing-pier": {
    isFree: true,
    managementInfo: {
      organizationName: "豊浜漁港つり桟橋（問い合わせ: 南知多町観光協会）",
      contactPhone: "0569-62-3100",
      contactUrl: "http://minamichita-kk.com/spot/%e3%81%a4%e3%82%8a%e6%a1%9f%e6%a9%8b",
      fishingFee: "無料",
      notes: ["営業時間・駐車場・釣り方のルールは公式に記載なし。現地の掲示に従ってください"],
      verifiedAt: VERIFIED,
      sourceUrl: "http://minamichita-kk.com/spot/%e3%81%a4%e3%82%8a%e6%a1%9f%e6%a9%8b",
    },
  },

  // 海辺つり公園（横須賀）: 駐車場を「無料」と掲載していたが有料
  "umibe-tsuri-park": {
    isFree: true,
    feeDetail: "入園無料",
    hasParking: true,
    parkingDetail: "有料（普通車95台。7:00〜22:00は1時間まで320円・以後30分160円・上限640円、22:00〜7:00は1時間100円）",
    hasRentalRod: true,
    rentalDetail: "竿・リールのレンタルあり（料金は公式サイトに記載なし）。サビキ仕掛け・コマセも販売",
    managementInfo: {
      organizationName: "海辺つり公園（神奈川県立）",
      contactPhone: "046-822-4022",
      contactUrl: "https://www.kanagawaparks.com/umibeturi/",
      openingHours: "5:00〜22:00",
      closedDays: "なし（台風などで臨時休園あり）",
      fishingFee: "無料",
      notes: ["遠投と長時間の置き竿は禁止", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://www.kanagawaparks.com/umibeturi/about.html",
    },
  },

  // ─────────── 2026-11-23 指示書03（禁止の疑い35件の公式調査、docs/fishing-ban-investigation-03.md）の反映 ───────────
  // 遊漁券が必要なのに「無料」になっていたもの・料金の根拠がないものを、県が掲載する遊漁規則・遊漁料の値に直す。
  // 位置の誤りは国土地理院の地名検索・逆ジオコーダで確定した点に直す。
  // 公式の公表を確認できなかった立入禁止情報は fishingBan にせず、本文と rules.restrictedAreas の注意喚起にとどめる。
  ...Object.fromEntries(
    ["tonegawa-lower-unagi", "tonegawa-lower-chiba", "tonegawa-sawara"].map((slug) => [slug, TONEGAWA_LOWER]),
  ),
  // 「遊漁券が必要」は根拠なし。岐阜県の資料では、ダム建設で漁業権のない自由漁場になった水域
  "tokuyama-dam-gifu": {
    feeDetail: "ダム湖は漁業権のない自由漁場（岐阜県）。ただし湖面は通常立入禁止で、上流の一部は一年中採捕禁止",
  },
  "choshigawa-river-mie": {
    isFree: false,
    feeDetail: "アユ・アマゴ（あめご）を釣るには銚子川漁協の遊漁承認証（遊漁券）が必要（三重県の案内）。料金は漁協に確認",
    managementInfo: {
      organizationName: "銚子川漁業協同組合（三重内共第16号 あゆ漁業・あめご漁業）",
      licensingInfo: "漁業権の区域で漁業権の対象魚種を釣るには、遊漁料を納めて遊漁承認証を受ける必要がある",
      notes: ["遊漁料と解禁期間は銚子川漁協に確認してください"],
      verifiedAt: INVESTIGATION_03,
      sourceUrl: "https://www.pref.mie.lg.jp/SUISAN/HP/86303033603.htm",
    },
  },
  "miyagi-kamafusa-dam-lake": {
    isFree: false,
    feeDetail:
      "広瀬名取川漁協の遊漁券が必要（いわな・うぐい・うなぎ・おいかわ・こい・にじます・ふな・やまめ・わかさぎ、手釣・竿釣）。一般 1日500円・1年6,000円（宮城県の遊漁料一覧「大倉湖、釜房湖に限る」）",
    managementInfo: {
      organizationName: "釜房ダム管理所（国土交通省）／遊漁は広瀬名取川漁業協同組合",
      fishingFee: "一般 1日500円・1年6,000円（大倉湖・釜房湖に限る区分）",
      notes: [
        "冬期間の氷上での魚釣りは危険なため、絶対にしないよう釜房ダム管理所が呼びかけています",
        "湖面の使用（ボートなど）は、みちのく公園管理センターへの届出が必要。動力船は基本的に使えず、放流施設・取水施設などの通航制限区域には入れません",
        "湖面の利用者はライフジャケットの着用が必要です（2026年6月15日から）",
      ],
      verifiedAt: INVESTIGATION_03,
      sourceUrl: "https://www.thr.mlit.go.jp/kamafusa/download/komen.html",
    },
  },
  "shiobara-dam-ko6": {
    // 元の座標（36.973, 139.783）は約9km西の上塩原を指していた。ダム湖に架かるもみじ谷大吊橋の位置にする
    latitude: 36.9536,
    longitude: 139.8762,
    description:
      "栃木県那須塩原市、箒川をせき止めた塩原ダムのダム湖。湖にはもみじ谷大吊橋が架かる。湖面でボートなどを使うには栃木県への事前の使用届が必要で、6月15日〜10月10日は使用禁止、ダムの堤体から上流約200mは通航禁止水域になっている。箒川は漁業権の区域なので、ヤマメ・ニジマス・イワナなど漁業権の対象魚を釣るには遊漁券が必要。",
    isFree: false,
    feeDetail: "箒川は取水堰堤を境に塩原漁協（上流）と那珂川漁連（下流）の漁業権区域。漁業権の対象魚種を釣るには遊漁券が必要（料金は漁協に確認）",
    managementInfo: {
      organizationName: "栃木県（矢板土木事務所）／遊漁は塩原漁業協同組合・那珂川漁業協同組合連合会",
      notes: [
        "湖面の使用は事前の使用届が必要（当日の届出は受け付けない）。エンジン付きの船は遠慮するよう求められています",
        "使用禁止期間は6月15日〜10月10日。堤体から上流約200mは通航禁止水域です",
      ],
      verifiedAt: INVESTIGATION_03,
      sourceUrl: "https://www.pref.tochigi.lg.jp/h56/hozenkanri/documents/onegai_shiobara.pdf",
    },
  },
  "hakusui-dam-taketa-w6": {
    // 元の座標（32.95, 131.45）は白水ダムから約13km離れていた。国土地理院の「白水ダム」の点にする
    latitude: 32.905,
    longitude: 131.327,
    isFree: false,
    feeDetail: "大野川水系は大野川漁協（大分内共第3号）の漁業権区域。うなぎを除く全魚種 1日2,200円（大分県が掲載する遊漁規則）",
    managementInfo: {
      organizationName: "白水ため池（通称 白水ダム）: 富士緒井路土地改良区／遊漁: 大野川漁業協同組合",
      fishingFee: "うなぎを除く全魚種 1日2,200円",
      notes: [
        "白水溜池堰堤は国の重要文化財。毎年11月下旬〜翌年6月中旬は越流を止めて貯水池内で工事をしています（令和9年まで予定）",
      ],
      verifiedAt: INVESTIGATION_03,
      sourceUrl: "https://www.pref.oita.jp/soshiki/11607/hakusui-info.html",
    },
  },
  "akagawa-dam-yaita-a12": {
    // 赤川ダムは宇都宮市福岡町（栃木県の遊漁規則・国土地理院の地名データ）。元は矢板市長井を指していた
    name: "赤川ダム（宇都宮市）",
    address: "栃木県宇都宮市福岡町",
    latitude: 36.6204,
    longitude: 139.788,
    description:
      "栃木県宇都宮市福岡町、赤川をせき止めた赤川ダムのダム湖。鬼怒川漁協の遊漁規則で、ダムから上流の赤川が「赤川ダム特別漁場」に指定されている。釣りは竿釣・手釣で1人1組まで、組合の設備や組合が指定した船以外の船は使えない。ヘラブナやコイが狙える。",
    feeDetail: "鬼怒川漁協の赤川ダム特別漁場（料金・釣期は漁協に確認）",
    managementInfo: {
      organizationName: "鬼怒川漁業協同組合（赤川ダム特別漁場）",
      notes: ["竿釣・手釣は1人1組まで。それ以外の漁法と、組合の設備・組合指定以外の船の使用は禁止"],
      verifiedAt: INVESTIGATION_03,
      sourceUrl: "https://www.pref.tochigi.lg.jp/g02/suisan/documents/kinugawa323_20241119.pdf",
    },
  },
  "kesennuma-oura-port-a11": {
    // 元の座標（38.888, 141.558）は上田中を指していた。国土地理院の「気仙沼市大浦」の点にする
    latitude: 38.9001,
    longitude: 141.5954,
    description:
      "宮城県気仙沼市大浦、気仙沼湾の内湾に面した港。宮城県が管理する気仙沼漁港の大浦地区にあたる。投げ釣りやちょい投げでカレイやハゼが狙える。漁船の出入りや係留があるので、係留ロープや船の航路に注意し、漁業の作業の邪魔にならない場所で竿を出してほしい。",
  },
  "oshima-uranohama-beach-a11": {
    // 元の座標（38.858, 141.628）は海上を指していた。国土地理院の「気仙沼市浦の浜」の点にする
    latitude: 38.8666,
    longitude: 141.6175,
    description:
      "宮城県気仙沼市の気仙沼大島、浦の浜周辺。浦の浜は大島の玄関口で、宮城県が管理する浦の浜漁港がある。投げ釣りでキスやカレイが狙える。漁港の周辺では漁船の出入りや作業の邪魔にならないようにし、現地の掲示に従ってほしい。",
  },

  // 立入禁止の情報が漁協の掲示・報道にしかないもの（漁港管理者の公式公表は未確認）
  "katsuura-port": { rules: { restrictedAreas: [KATSUURA_NOTICE] } },
  "katsuura-suminawa-breakwater": {
    description:
      "千葉県勝浦市の勝浦漁港にある墨名堤防。白灯台が立つ。2024年4月以降、漁協の掲示により勝浦漁港内の多くの場所（赤灯の波止や墨名堤防の先端など）が立入禁止になったと報じられている。漁港を管理する千葉県や勝浦市の公式の公表は確認できていないため、出かける前と現地で掲示を必ず確認し、立入禁止の場所には入らないでほしい。",
  },
  "katsuura-kou-e8": {
    description:
      "千葉県勝浦市浜勝浦の勝浦漁港。外房を代表する漁港で、カツオやマグロの水揚げで知られる。2024年4月以降、漁協の掲示により港内の多くの場所が立入禁止になり、釣りができる場所と時間が限られたと報じられている（千葉県・勝浦市の公式の公表は未確認）。出かける前と現地で掲示を必ず確認し、立入禁止の場所には入らないでほしい。",
  },
  "choshi-gaiko": { rules: { restrictedAreas: [CHOSHI_NOTICE] } },
  "choshi-kou": {
    description:
      "千葉県銚子市の銚子漁港。全国有数の水揚げ量を誇る漁港で、千葉県が管理している。銚子市漁協の告知で、外港・黒生地区・夫婦ヶ鼻堤防などは関係者以外立入禁止とされている（千葉県の公式の公表は未確認）。漁港では水揚げ作業やトラックの出入りが多いので、出かける前と現地で掲示を必ず確認し、立入禁止の場所には入らないでほしい。",
  },
  "choshi-soto-boutei-e8": {
    description:
      "千葉県銚子市川口町、銚子漁港の外側の堤防。銚子市漁協の告知で、銚子漁港の外港・黒生地区・夫婦ヶ鼻堤防は関係者以外立入禁止とされており、外側の堤防も立入禁止の場所にあたる可能性が高い（漁港を管理する千葉県の公式の公表は未確認）。出かける前と現地で掲示を必ず確認し、立入禁止の場所には入らないでほしい。",
  },
  "choshi-marina-teibo": {
    description:
      "千葉県銚子市潮見町、名洗港の銚子マリーナに隣接する堤防。名洗港は千葉県が港湾管理者の港で、漁港ではない。マリーナから伸びる長い堤防とマリーナ内は立入禁止になっているとの情報がある（千葉県の公式の公表は未確認）。釣りをするなら立入禁止でない場所を選び、現地の掲示に従ってほしい。アジ・イワシのサビキ、イシモチの投げ釣り、ヒラメやシーバスのルアーが狙える。",
  },
  "shimonoseki-port": { rules: { restrictedAreas: [SHIMONOSEKI_NOTICE] } },
  "hikoshima-hayatomari-w6": {
    description:
      "山口県下関市彦島西山町の南風泊港。フグの水揚げで知られ、山口県が管理する下関漁港の一部にあたる。波止や消波ブロック、外海側の護岸などに立入禁止の場所があり、港内の一部でしか釣りができないと報じられている（山口県の公式の公表は未確認）。出かける前と現地で掲示を必ず確認し、立入禁止の場所には入らないでほしい。",
  },
};
