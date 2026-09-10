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

// regions.ts に該当エリアが無い場合のみ定義するローカルregion
const localRegions: Region[] = [
  { id: "rsmcE01", prefecture: "青森県", areaName: "三沢・六ヶ所", slug: "aomori-misawa-rokkasho-mecca" },
];

function localRegion(id: string) {
  return localRegions.find((r) => r.id === id) || region(id);
}

// === マヅメ情報テンプレ（緯度帯別） ===
const mazumeHokkaido = { springSunrise: "5:00頃", springSunset: "18:00頃", summerSunrise: "4:00頃", summerSunset: "19:10頃", autumnSunrise: "5:20頃", autumnSunset: "17:10頃", winterSunrise: "6:50頃", winterSunset: "16:00頃", tip: "海サクラマス・海アメマスは夜明け直後の1時間が最大のチャンス。暗いうちにポイントへ入りましょう。" };
const mazumeTohoku = { springSunrise: "5:10頃", springSunset: "18:10頃", summerSunrise: "4:10頃", summerSunset: "19:00頃", autumnSunrise: "5:20頃", autumnSunset: "17:20頃", winterSunrise: "6:40頃", winterSunset: "16:20頃", tip: "サーフのヒラメは朝マヅメの上げ潮が最有力。日の出前後1時間を集中して撃ちましょう。" };
const mazumeKanto = { springSunrise: "5:20頃", springSunset: "18:00頃", summerSunrise: "4:30頃", summerSunset: "19:00頃", autumnSunrise: "5:30頃", autumnSunset: "17:20頃", winterSunrise: "6:40頃", winterSunset: "16:30頃", tip: "渡船の始発便で朝マヅメに間に合います。日の出前後1時間が最も活性が上がります。" };
const mazumeChubu = { springSunrise: "5:20頃", springSunset: "18:10頃", summerSunrise: "4:30頃", summerSunset: "19:00頃", autumnSunrise: "5:30頃", autumnSunset: "17:20頃", winterSunrise: "6:40頃", winterSunset: "16:40頃", tip: "営業は日の出〜日没。開場直後の朝マヅメが回遊魚の最大のチャンスです。" };

// === ベストタイム・潮テンプレ ===
const btMorning = [
  { label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "good" as const },
  { label: "夕マヅメ", timeRange: "16:00〜18:00", rating: "good" as const },
  { label: "夜", timeRange: "19:00〜22:00", rating: "fair" as const },
];
// 日の出〜日没営業の管理堤防用（夜間は営業時間外）
const btDaytimeOnly = [
  { label: "朝マヅメ（開場直後）", timeRange: "開場〜8:00", rating: "best" as const },
  { label: "日中", timeRange: "10:00〜15:00", rating: "good" as const },
  { label: "夕マヅメ（閉場前）", timeRange: "16:00〜閉場", rating: "good" as const },
];
const tideStandard = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮〜満潮前後", description: "潮が動く時間帯に回遊魚の活性が上がります。" };
const tideSurf = { bestTide: "大潮・中潮", bestTidePhase: "下げ始め", description: "下げ潮で払い出しにベイトが集まり、フラットフィッシュのチャンスが広がります。" };

// === 装備ガイドテンプレ ===
const gearOtoshikomi = { targetFish: "クロダイ", method: "落とし込み・ヘチ釣り", difficulty: "intermediate" as const, rod: "落とし込み竿 2.7〜3.6m", reel: "太鼓リール", line: "ナイロン2〜3号", hook: "チヌ針2〜3号", otherItems: ["イガイ・カニ・フジツボ", "ガン玉", "タモ網（柄5m以上）"], tip: "壁際ギリギリにエサを落とし、ラインの変化でアタリを取る。貝殻の付いた壁際が最重要ポイント。" };
const gearSurfFlat = { targetFish: "ヒラメ・シーバス", method: "サーフルアー", difficulty: "intermediate" as const, rod: "サーフロッド 9.6〜10.6ft M", reel: "スピニングリール 4000番", line: "PE 1〜1.2号", hook: "メタルジグ 30〜40g・シンキングミノー", otherItems: ["リーダー フロロ20lb", "ウェーダーまたはヒップウェーダー", "フィッシュグリップ"], tip: "払い出し（離岸流）の両脇を重点的に。ボトムから1m以内をゆっくり引くのが基本。" };
const gearShorejig = { targetFish: "ブリ・イナダ・サワラ", method: "ショアジギング", difficulty: "intermediate" as const, rod: "ショアジギングロッド 9.6ft M〜MH", reel: "スピニングリール 4000〜5000番", line: "PE 1.5〜2号", hook: "メタルジグ 40〜60g", otherItems: ["リーダー フロロ8〜10号", "アシストフック", "プライヤー"], tip: "朝イチはフルキャストして表層〜中層を速巻き。ナブラが出たら即座に撃ち込む。" };
const gearSakuramasu = { targetFish: "サクラマス", method: "ショアキャスティング", difficulty: "intermediate" as const, rod: "サーモンロッド 9.6〜11ft M", reel: "スピニングリール 4000番", line: "PE 1〜1.5号", hook: "ジグミノー 28〜40g・メタルジグ", otherItems: ["リーダー ナイロン20lb", "ウェーダー", "ランディングネット"], tip: "遠投して回遊コースを横切らせる。ただ巻きにストップを混ぜると口を使いやすい。" };
const gearKago = { targetFish: "マダイ・大アジ", method: "カゴ釣り", difficulty: "intermediate" as const, rod: "磯竿3〜4号 遠投 4.5m", reel: "スピニングリール 4000番（遠投用）", line: "ナイロン5号", hook: "真鯛針8〜10号", otherItems: ["遠投カゴ・ウキ10〜12号", "アミエビ+オキアミ", "タモ網"], tip: "水深15mの中層〜底付近をカゴで直撃。マヅメ時の回遊に合わせてコマセを切らさない。" };
const gearSabiki = { targetFish: "アジ・サバ・イワシ", method: "サビキ釣り", difficulty: "beginner" as const, rod: "磯竿3号 3.6〜4.5m", reel: "スピニングリール 2500番", line: "ナイロン3号", hook: "サビキ仕掛け 5〜7号", otherItems: ["コマセカゴ", "アミエビ", "バケツ"], tip: "コマセを撒きすぎず、少しずつ出すのがコツ。" };
const gearNage = { targetFish: "キス・カレイ", method: "投げ釣り", difficulty: "beginner" as const, rod: "投げ竿 3.9〜4.25m", reel: "スピニングリール 3000〜4000番", line: "ナイロン4号", hook: "流線針 7〜9号", otherItems: ["天秤オモリ 20〜25号", "青イソメ", "竿立て"], tip: "エサはイソメを房掛けにすると大型が食ってきます。" };

// ============================================================
// 全国区の有名釣り場（東日本）: 木更津沖堤防 / 高瀬川河口 /
// 直江津港第3東防波堤 / 島牧・江ノ島海岸
// ============================================================
export const meccaEastSpots: FishingSpot[] = [
  {
    id: "smcE01", name: "木更津沖堤防", slug: "kisarazu-oki-teibo",
    description: "東京湾のほぼ中央、木更津港の沖合約500mに横たわる全長約3kmの巨大な一文字堤。沖からA・B・C・D堤の4基に分かれ、落とし込み（ヘチ釣り）でクロダイを狙う釣りの聖地として全国にその名を知られる。堤防へ渡るには木更津港の渡船「宮川丸」の利用が必須で、往復は大人4,000円（2026年4月改定）。夏はマダコのテンヤ釣り、朝夕はシーバスや回遊のアジも面白く、一年を通じて多彩な魚が狙える。水深2〜6mと浅めながら潮通しは抜群で、貝殻の付いた壁際を丹念に探るとクロダイの強烈なアタリが出る。海に囲まれた沖堤で船が来るまで戻れないため、飲み物・装備は万全にして渡ろう。",
    latitude: 35.3828, longitude: 139.8872,
    address: "千葉県木更津市 木更津港沖合（渡船乗り場: 木更津港 宮川丸）",
    accessInfo: "木更津港の渡船「宮川丸」を利用（往復大人4,000円・乗船約5〜10分）。出船は5時台〜、受付は出船10分前まで。JR木更津駅から渡船乗り場まで徒歩約15分。",
    region: region("r77"), spotType: "breakwater", difficulty: "intermediate",
    isFree: false, feeDetail: "渡船往復: 大人4,000円・中学生2,500円・小学生以下2,000円（2026年4月改定）。堤防間の移動は1回500円。",
    hasParking: true, parkingDetail: "渡船利用者向け駐車場あり（宮川丸の案内に従う）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: true, hasRentalRod: true,
    rentalDetail: "貸し竿（仕掛け付）1,000円＋保証金1,000円。ライフジャケット無料レンタルあり。",
    mainImageUrl: "", images: [], rating: 4.5, reviewCount: 128,
    catchableFish: [
      { fish: fish("kurodai"), monthStart: 5, monthEnd: 10, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "落とし込み・ヘチ釣り", source: "アングラーズ 木更津沖堤防" },
      { fish: fish("suzuki"), monthStart: 4, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー釣り", source: "アングラーズ 木更津沖堤防" },
      { fish: fish("madako"), monthStart: 6, monthEnd: 9, peakSeason: true, catchDifficulty: "medium", recommendedTime: "日中", method: "タコエギ・テンヤ", source: "宮川丸 釣果情報" },
      { fish: fish("aji"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ釣り", source: "アングラーズ 木更津沖堤防" },
      { fish: fish("kisu"), monthStart: 5, monthEnd: 9, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "ちょい投げ", source: "アングラーズ 木更津沖堤防" },
      { fish: fish("kasago"), monthStart: 1, monthEnd: 12, peakSeason: false, catchDifficulty: "easy", recommendedTime: "夕マヅメ", method: "ヘチ釣り・穴釣り" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeKanto,
    gearGuides: [gearOtoshikomi, gearSabiki],
    safetyLevel: "caution",
    safetyNotes: [
      "渡船でのみ渡れる沖堤防。迎えの船が来るまで戻れないため、天候急変時に備え装備と飲食物は多めに",
      "ライフジャケット必着（国交省認定TYPE A推奨、無料レンタルあり）",
      "堤防上にトイレ・日陰なし。夏場は熱中症対策必須",
      "堤防幅は約6mだが外海側はテトラ・消波ブロックあり、足元注意",
    ],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true,
      nightFishing: false, fishingLicenseRequired: false,
      otherRules: ["渡船の営業時間内（おおむね5時〜18時）のみ釣り可能", "乗船前に名簿記入が必要", "ゴミは必ず持ち帰り"],
    },
    officialUrl: "https://www.miyagawamaru.co.jp/",
    youtubeLinks: [{ label: "木更津沖堤防の落とし込み", searchQuery: "木更津沖堤防 落とし込み クロダイ", description: "東京湾クロダイの聖地でヘチ釣りに挑む" }],
  },
  {
    id: "smcE02", name: "高瀬川河口", slug: "takasegawa-kakou-misawa",
    description: "小川原湖の湖水を太平洋へと流す高瀬川の河口部で、三沢市と六ヶ所村の境に位置する。湖で育ったベイトが流れ出す流心周りには魚が付きやすく、70cm超のいわゆる「座布団ヒラメ」の実績が全国のサーフアングラーに知られる青森屈指のフラットフィッシュ場だ。春から初冬まではヒラメとシーバスが本命で、秋はイナダなど青物の回遊、投げ釣りではカレイも狙える。河口の両岸には広大な砂浜が続き、遠浅サーフをランガンしながら払い出しを撃っていくスタイルが基本となる。周辺に売店やトイレはなく、最寄りのコンビニまでも車で距離があるため準備は事前に済ませたい。波が上がりやすい外洋サーフのため、ウネリの入る日は無理をしないこと。",
    latitude: 40.886, longitude: 141.3925,
    address: "青森県上北郡六ヶ所村・三沢市境 高瀬川河口",
    accessInfo: "第二みちのく有料道路・下田百石ICから車で約25分。河口周辺の砂利道を進んだ先に駐車スペースあり（悪路のため車高の低い車は注意）。",
    region: localRegion("rsmcE01"), spotType: "surf", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "河口付近に駐車スペースあり（未舗装）",
    hasToilet: false, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 4.3, reviewCount: 86,
    catchableFish: [
      { fish: fish("hirame"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "サーフルアー", source: "アングラーズ 高瀬川河口（三沢）" },
      { fish: fish("suzuki"), monthStart: 5, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ルアー釣り", source: "アングラーズ 高瀬川河口（三沢）" },
      { fish: fish("buri"), monthStart: 8, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ショアジギング", source: "魚速報 三沢市の釣り場" },
      { fish: fish("sakuramasu"), monthStart: 3, monthEnd: 6, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ジグ・ミノー", source: "魚速報 三沢市の釣り場" },
      { fish: fish("karei"), monthStart: 4, monthEnd: 11, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "アングラーズ 高瀬川河口（三沢）" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideSurf, mazumeInfo: mazumeTohoku,
    gearGuides: [gearSurfFlat, gearShorejig, gearNage],
    safetyLevel: "caution",
    safetyNotes: [
      "外洋に面したサーフで波が高くなりやすい。ウネリの強い日は立ち込まない",
      "河口の流心付近は流れが速く水深もある。ウェーディング時は特に注意",
      "周辺にトイレ・売店なし。飲料・防寒具は事前に準備",
      "冬季は強い西風と低温に注意",
    ],
    youtubeLinks: [{ label: "高瀬川河口のヒラメゲーム", searchQuery: "高瀬川河口 三沢 ヒラメ サーフ", description: "座布団ヒラメで知られる青森の名サーフ" }],
  },
  {
    id: "smcE03", name: "直江津港第3東防波堤", slug: "naoetsu-daisan-higashi-teibo",
    description: "直江津港の東側、上越火力発電所の沖に伸びる防波堤の先端約460mを開放した有料の管理釣り場。NPO法人ハッピーフィッシングが運営し、営業期間は3月1日〜10月31日の日の出から日没まで、料金は大人・中高生1,500円・小学生750円（小学生未満は入場不可）。周囲の水深は約15mと深く、ゴールデンウィーク前後の乗っ込み期には50〜70cm級のマダイが連発する「堤防マダイの聖地」として全国から釣り人が集まる。春の尺超え大アジ、初夏のサゴシ、秋のワラサ・イナダとシーズンごとに主役が入れ替わり、クロダイや根魚の魚影も濃い。ライフジャケットの着用が義務（レンタルあり）で管理スタッフも常駐しており、本格的な沖堤クラスの釣りを安全に楽しめる貴重な存在だ。",
    latitude: 37.207, longitude: 138.289,
    address: "新潟県上越市大字夷浜 直江津港第3東防波堤（受付: 上越市八千浦4番地）",
    accessInfo: "北陸自動車道・上越ICから車で約15分。受付で入場料を払い防波堤へ入場する。営業は3月1日〜10月31日、日の出〜日没（荒天時は閉場）。",
    region: region("re8021"), spotType: "breakwater", difficulty: "all",
    isFree: false, feeDetail: "大人・高校生・中学生1,500円、小学生750円。小学生未満は入場不可。年間パス・シルバーパスあり。",
    hasParking: true, parkingDetail: "利用者用の無料駐車場あり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    rentalDetail: "ライフジャケットのレンタルあり",
    mainImageUrl: "", images: [], rating: 4.4, reviewCount: 152,
    catchableFish: [
      { fish: fish("madai"), monthStart: 4, monthEnd: 6, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "カゴ釣り・ショアジギング", source: "ハッピーフィッシング釣果情報" },
      { fish: fish("aji"), monthStart: 4, monthEnd: 10, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "サビキ・カゴ釣り", source: "ハッピーフィッシング釣果情報" },
      { fish: fish("buri"), monthStart: 9, monthEnd: 11, peakSeason: true, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ショアジギング", source: "ハッピーフィッシング釣果情報" },
      { fish: fish("sawara"), monthStart: 5, monthEnd: 10, peakSeason: false, catchDifficulty: "medium", recommendedTime: "朝マヅメ", method: "ショアジギング", source: "TSURINEWS 直江津港第3東防波堤" },
      { fish: fish("kurodai"), monthStart: 4, monthEnd: 10, peakSeason: false, catchDifficulty: "medium", recommendedTime: "日中", method: "落とし込み・フカセ", source: "アングラーズ ハッピーフィッシング直江津港第3東防波堤管理釣り場" },
      { fish: fish("kasago"), monthStart: 3, monthEnd: 10, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "胴突き・ワーム" },
    ],
    bestTimes: btDaytimeOnly, tackleRecommendations: [],
    tideAdvice: tideStandard, mazumeInfo: mazumeChubu,
    gearGuides: [gearKago, gearShorejig, gearSabiki],
    safetyLevel: "caution",
    safetyNotes: [
      "ライフジャケット着用義務（未着用は入場不可、レンタルあり）",
      "外海に面した防波堤のため荒天時は閉場。事前に営業状況を公式サイトで確認",
      "水深約15mと深く、落水すると自力で這い上がれない。柵のない場所ではふちに近づきすぎない",
    ],
    rules: {
      castingAllowed: true, lureAllowed: true, chumAllowed: true,
      nightFishing: false, fishingLicenseRequired: false,
      otherRules: ["営業期間は3月1日〜10月31日（11月〜2月は閉鎖）、日の出〜日没", "小学生未満は保護者同伴でも入場不可", "全面禁煙・禁酒、傘・パラソル類の持ち込み不可", "ゴミは必ず持ち帰り"],
    },
    officialUrl: "https://happyfishing-n.jp/",
    youtubeLinks: [{ label: "直江津第3東防波堤のマダイ", searchQuery: "直江津 第3東防波堤 マダイ ハッピーフィッシング", description: "乗っ込みマダイの聖地・直江津の管理堤防" }],
  },
  {
    id: "smcE04", name: "島牧・江ノ島海岸", slug: "shimamaki-enoshima-kaigan",
    description: "北海道南西部・島牧村の日本海に面した小石混じりのサーフ。1980年代に海アメマス釣り発祥の地として全国に名を馳せ、現在は海サクラマスの最重要フィールドとして、雪代の残る春に全国から遠征アングラーが集結する。狩場山系の急峻な山を背にした海岸線は岸近くから水深があり、ジグミノーやメタルジグを遠投して回遊を待ち受ける釣りが基本スタイル。3〜6月のサクラマスを筆頭に、春のホッケの接岸、夏以降はヒラメや良型アイナメと、季節ごとに主役が入れ替わる。国道229号沿いからエントリーしやすく駐車スペースも確保されているが、冬から春の日本海はウネリが強く海水温も低いため、装備と天候判断は慎重に行いたい。",
    latitude: 42.6913, longitude: 140.0407,
    address: "北海道島牧郡島牧村江ノ島 江ノ島海岸",
    accessInfo: "札幌から国道230号・276号・229号経由で車で約3時間。寿都町中心部から国道229号を南下して約30分。国道沿いに駐車スペースあり。",
    region: region("r1083"), spotType: "surf", difficulty: "intermediate",
    isFree: true, hasParking: true, parkingDetail: "海岸沿いに無料駐車スペースあり",
    hasToilet: true, hasConvenienceStore: false, hasFishingShop: false, hasRentalRod: false,
    mainImageUrl: "", images: [], rating: 4.5, reviewCount: 104,
    catchableFish: [
      { fish: fish("sakuramasu"), monthStart: 3, monthEnd: 6, peakSeason: true, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "ジグミノー・メタルジグ", source: "魚速報 北海道サクラマス釣り場まとめ" },
      { fish: fish("hokke"), monthStart: 4, monthEnd: 6, peakSeason: true, catchDifficulty: "easy", recommendedTime: "朝マヅメ", method: "ジグ・投げ釣り", source: "魚速報 島牧村の釣り場" },
      { fish: fish("hirame"), monthStart: 6, monthEnd: 10, peakSeason: false, catchDifficulty: "hard", recommendedTime: "朝マヅメ", method: "サーフルアー", source: "魚速報 島牧村の釣り場" },
      { fish: fish("karei"), monthStart: 4, monthEnd: 6, peakSeason: false, catchDifficulty: "easy", recommendedTime: "日中", method: "投げ釣り", source: "魚速報 島牧村の釣り場" },
      { fish: fish("ainame"), monthStart: 5, monthEnd: 11, peakSeason: false, catchDifficulty: "medium", recommendedTime: "夕マヅメ", method: "ワーム・ブラクリ" },
    ],
    bestTimes: btMorning, tackleRecommendations: [],
    tideAdvice: tideSurf, mazumeInfo: mazumeHokkaido,
    gearGuides: [gearSakuramasu, gearSurfFlat, gearNage],
    safetyLevel: "caution",
    safetyNotes: [
      "冬〜春の日本海はウネリが強く、高波にさらわれる事故が起きやすい。波の高い日は絶対に入らない",
      "春先でも海水温は低く、落水時の低体温症リスクが高い。ウェーダー着用時はライフジャケット必着",
      "遠征前に河口規制（サケ・マス採捕禁止区域）の最新情報を必ず確認",
      "携帯電話の電波が弱いエリアあり。単独釣行は避けるのが無難",
    ],
    youtubeLinks: [{ label: "島牧の海サクラマス", searchQuery: "島牧 江ノ島海岸 サクラマス", description: "海サクラマスの聖地・島牧のサーフゲーム" }],
  },
];
