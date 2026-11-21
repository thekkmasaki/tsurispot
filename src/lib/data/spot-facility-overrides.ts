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
  safetyNotes?: string[];
  managementInfo?: FishingSpot["managementInfo"];
  rules?: Partial<SpotRules>;
}

const VERIFIED = "2026-11-21";
const CHECK_NOTE = "料金・営業時間は変わることがあります。出かける前に公式サイトで確認してください";

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
    description:
      "高浜町塩土にある海釣り公園で、釣り桟橋からの釣りが楽しめる整備された施設。サビキでアジやマダイ、投げ釣りでキス、クロダイも狙える。足場が良く、釣り初心者やお子様連れにも向く。竿とライフジャケットの貸し出しは当面中止されているため、道具とライフジャケットは持参すること。入場料は1人200円、駐車場は清掃協力金として車1台1,000円。",
    safetyNotes: ["整備された海釣り公園", "ライフジャケットは持参（貸し出しは当面中止）", "初心者・ファミリー向け", "釣り桟橋で安全"],
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

  // 本牧海づり施設: 本文に古い料金（子供450円・竿600円/日・300台・駐車500円/日）が残っていた。駐車場は段階制
  "honmoku-fishing": {
    description:
      "横浜の本牧ふ頭にある広々とした有料の海釣り施設。護岸と桟橋の2つのエリアがあり、5〜11月はサビキ釣りのアジやイワシ、秋はウキ釣りのサヨリ、10月〜4月は穴釣りのカサゴや足元の探り釣りで狙うカレイと、一年を通して多彩な魚種が狙える。夏〜秋はぶっこみ釣りのアナゴ、夕マヅメのルアーで狙うスズキも実績あり（タコ釣りは施設ルールで禁止、投げ釣りやルアーは区間・混雑状況による制限あり）。釣り料金は大人900円・中学生450円・小学生300円。管理棟の売店で竿とリールのセットをレンタルでき（有料）、釣具・エサも買える。駐車場は230台で、3時間以内250円・5時間以内350円・5時間以上500円。JR根岸線根岸駅からバス約15分、首都高本牧ふ頭出口すぐ。",
    feeDetail: "大人900円・中学生450円・小学生300円（見学: 大人100円・中学生以下50円）",
    hasParking: true,
    parkingDetail: "230台。3時間以内250円・5時間以内350円・5時間以上500円",
    hasRentalRod: true,
    rentalDetail: "管理棟の売店で竿とリールのセットをレンタル（有料。エサ・仕掛けは別途購入。料金は売店 045-623-0028 に確認）",
    officialUrl: "https://yokohama-fishingpiers.jp/honmoku/",
  },

  // 大黒海づり施設: 駐車場（3時間250円・以降30分100円）と営業時間（通年6:00〜19:00）が公式と違った
  "daikoku-fishing-facility": {
    feeDetail: "大人900円・中学生450円・小学生300円",
    hasParking: true,
    parkingDetail: "200台（福祉車両専用5台）。3時間以内250円・5時間以内350円・5時間以上500円",
    hasRentalRod: true,
    rentalDetail: "管理棟の売店で竿とリールのセットをレンタル（有料。エサ・仕掛けは別途購入。料金は売店に確認）",
    officialUrl: "https://yokohama-fishingpiers.jp/daikoku/",
    managementInfo: {
      organizationName: "大黒海づり施設（横浜フィッシングピアーズ）",
      contactUrl: "https://yokohama-fishingpiers.jp/daikoku/",
      openingHours: "季節により変わる（4〜10月は6:00開場）。月ごとの時間は公式サイトで確認",
      closedDays: "施設点検日、年末年始（公式サイトで確認）",
      fishingFee: "大人900円・中学生450円・小学生300円",
      notes: ["隣接の大黒緑地公園は工事のため閉鎖中", CHECK_NOTE],
      verifiedAt: VERIFIED,
      sourceUrl: "https://yokohama-fishingpiers.jp/daikoku/",
    },
  },

  // とっとパーク小島: 駐車場は無料（100台以上）。掲載は「道の駅の駐車場（67台）」だった
  "tottopark-kojima": {
    hasParking: true,
    parkingDetail: "無料駐車場あり（100台以上）",
    hasRentalRod: false,
    rentalDetail: "釣具の貸し出しはありません（公式）。竿・仕掛けは持参してください",
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
};
