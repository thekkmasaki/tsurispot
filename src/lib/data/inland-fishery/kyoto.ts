import type { InlandFisheryCoop, InlandFisherySpotLink } from "./types";

/**
 * 京都府の内水面漁協（2026-11-21 確認）。
 * 出典: 京都府が公開する各漁協の遊漁規則（令和6年1月1日施行ほか）、
 *       京都府内水面漁連「令和8年 京都府内河川あゆ遊漁一覧」、
 *       水産庁「漁業権に関する情報」、京都府「内水面漁場計画（素案）」、漁協の公式サイト。
 * 渓流魚（あまご）の2026年の解禁日は、賀茂川以外は一次資料で確認できていないため、規則上の枠だけを書く。
 */

const VERIFIED = "2026-11-21";
const AYU_LIST_2026 = "https://www.pref.kyoto.jp/suisan/news/documents/r8ayuyuugyoitiran.pdf";
const JFA_RIGHTS = "https://www.jfa.maff.go.jp/j/enoki/attach/pdf/gyogyouken_jouhou3-217.pdf";
const KYOTO_PLAN = "https://www.pref.kyoto.jp/suisan/documents/naisuimen15soan_1.pdf";

const HOZU_RULES = "https://www.pref.kyoto.jp/suisan/documents/03hozugawa.pdf";
const KAMIKATSURA_RULES = "https://www.pref.kyoto.jp/suisan/documents/01kamikatura.pdf";
const OOI_RULES = "https://www.pref.kyoto.jp/suisan/documents/ooigawar6-2.pdf";
const KAMO_RULES = "https://www.pref.kyoto.jp/suisan/documents/05kamogawa.pdf";
const KAMO_VOUCHER = "https://www.kyotokamogawagyokyo.jp/voucher/";
const KAMO_INFO = "https://www.kyotokamogawagyokyo.jp/economy_information/";
const UJI_RULES = "https://www.pref.kyoto.jp/suisan/documents/06ujigawa.pdf";
const KIZU_RULES = "https://www.pref.kyoto.jp/suisan/documents/07kizugawa.pdf";

const MIYAMA_PAGE = "https://miyama-gyokyou.jp/?page_id=83";
const MIYAMA_RULES = "https://www.pref.kyoto.jp/suisan/documents/miyamar7-2.pdf";
const YURA_RULES = "https://www.pref.kyoto.jp/suisan/documents/yuragawar6-2.pdf";
const KYOTO_SEA_RIGHTS = "https://www.pref.kyoto.jp/suisan/documents/kyodo.pdf";

const ONSITE ="現場で監視員に払う場合は加算あり";

export const KYOTO_COOPS: InlandFisheryCoop[] = [
  {
    id: "hozugawa",
    name: "保津川漁業協同組合",
    shortName: "保津川漁協",
    prefecture: "京都府",
    officialUrl: "http://www.hozugawagyokyo.com/",
    jurisdiction: {
      text: "寅天堰（亀岡市千代川町・南丹市八木町西田）から下流、JR東海道線の桂川鉄橋から上流の桂川と、その支流（清滝川・犬飼川など）。",
      source: JFA_RIGHTS,
    },
    fees: [
      { label: "アユ 年券", price: "13,000円", note: ONSITE, source: HOZU_RULES },
      { label: "アユ 日券（竿釣）", price: "3,000円", note: "解禁日から7日間は発売なし", source: HOZU_RULES },
      { label: "ます類 年券", price: "5,000円", source: HOZU_RULES },
      { label: "ます類 日券", price: "3,000円", source: HOZU_RULES },
      { label: "こい・ふな・うなぎ・はえ 年券", price: "3,000円", source: HOZU_RULES },
      { label: "こい・ふな・うなぎ・はえ 日券", price: "500円", source: HOZU_RULES },
    ],
    seasons: [
      { fish: "アユ（桂川本流）", period: "2026年は釣・ルアー 6/27 午前5時解禁、網 7/19", source: AYU_LIST_2026 },
      { fish: "アユ（清滝川）", period: "2026年は釣・ルアー 7/4 午前5時解禁、網 8/15", source: AYU_LIST_2026 },
      { fish: "あまご・にじます", period: "3/1〜9/30", source: HOZU_RULES },
      { fish: "こい", period: "1/1〜4/30、6/1〜12/31", source: HOZU_RULES },
      { fish: "ふな", period: "1/1〜4/19、5/21〜12/31", source: HOZU_RULES },
    ],
    rules: [
      { text: "アユの友釣専用区あり: 一ノ井堰〜上野橋（嵐山〜松尾付近）と、清滝川・犬飼川の全域", source: HOZU_RULES },
      { text: "通年の禁止区域: 寅天堰の上流端から下流100m、曽我谷川の合流点から上流300m、西芳寺川の合流点から下流200m", source: HOZU_RULES },
      { text: "全長制限: こい15cm・ふな6cm・うなぎ30cm・あまご12cm・にじます15cm（以下は採捕禁止）", source: HOZU_RULES },
      { text: "アユの竿は1人1本まで。そのほかの竿釣りは2本以内", source: HOZU_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "kamikatsuragawa",
    name: "上桂川漁業協同組合",
    shortName: "上桂川漁協",
    prefecture: "京都府",
    officialUrl: "http://上桂川.jp/",
    jurisdiction: {
      text: "世木ダム（南丹市日吉町天若）から上流の桂川と、その支流。京都市右京区京北を主な流域とする。",
      source: JFA_RIGHTS,
    },
    fees: [
      { label: "アユ 年券", price: "15,000円", note: ONSITE, source: AYU_LIST_2026 },
      { label: "アユ 日券", price: "4,500円", note: "2026年は7/4から発売", source: AYU_LIST_2026 },
      { label: "ます類（あまご・にじます） 年券", price: "7,000円", source: KAMIKATSURA_RULES },
      { label: "ます類（あまご・にじます） 日券", price: "3,500円", source: KAMIKATSURA_RULES },
      { label: "はえ・こい 年券", price: "3,000円", source: KAMIKATSURA_RULES },
      { label: "うなぎ・はえ・こい等 日券", price: "1,000円", source: KAMIKATSURA_RULES },
    ],
    seasons: [
      { fish: "アユ", period: "2026年は友釣 6/20 午前5時解禁（毛バリ・エサ釣りは禁止）、網 9/12", source: AYU_LIST_2026 },
      { fish: "あまご", period: "3/1〜9/30のうち漁協が公表する期間", source: KAMIKATSURA_RULES },
      { fish: "こい", period: "1/1〜4/30、6/1〜12/31", source: KAMIKATSURA_RULES },
    ],
    rules: [
      { text: "キャッチ＆リリース区間あり（早稲谷川の合流点より上流の最初の堰から上流、早稲谷川の第一砂防堰堤より上流）。釣った魚はその場で放流", source: KAMIKATSURA_RULES },
      { text: "夜間に照明が必要な時間帯の釣りは禁止", source: KAMIKATSURA_RULES },
      { text: "世木ダムの上流端から上流200mは通年禁止", source: KAMIKATSURA_RULES },
      { text: "竿は1人1本まで。全長制限: こい15cm・あまご12cm・にじます15cm・うなぎ30cm", source: KAMIKATSURA_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "ooigawa",
    name: "大堰川漁業協同組合",
    shortName: "大堰川漁協",
    prefecture: "京都府",
    // 公式サイトが見つからないため、府が公開する遊漁規則を案内先にする
    officialUrl: OOI_RULES,
    jurisdiction: {
      text: "世木ダムから寅天堰までの桂川（大堰川）と、その支流。南丹市日吉町・八木町・園部町を主な流域とする。",
      source: JFA_RIGHTS,
    },
    fees: [
      { label: "アユなど（ます類を除く） 年券", price: "11,000円", note: ONSITE, source: OOI_RULES },
      { label: "アユなど（ます類を除く） 日券", price: "3,000円", note: "アユは解禁後10日間は発売なし", source: OOI_RULES },
      { label: "アユ・うなぎ以外 年券", price: "3,000円", source: OOI_RULES },
      { label: "アユ・うなぎ以外 日券", price: "400円", source: OOI_RULES },
    ],
    seasons: [
      { fish: "アユ", period: "2026年は釣 6/21 午前5時解禁（8/1以降ルアー禁止）、網 8/1", source: AYU_LIST_2026 },
      { fish: "あまご", period: "3/1〜9/30", source: OOI_RULES },
      { fish: "こい", period: "1/1〜4/30、6/1〜12/31", source: OOI_RULES },
      { fish: "ふな", period: "1/1〜4/19、5/21〜12/31", source: OOI_RULES },
    ],
    rules: [
      { text: "通年の禁止区域: 世木ダムの上流端から下流100m、日吉ダムの中央部から上流500m・下流200m", source: OOI_RULES },
      { text: "全長制限: こい15cm・ふな10cm・うなぎ30cm・あまご12cm・にじます15cm", source: OOI_RULES },
      { text: "アユの竿は1人1本まで", source: OOI_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "kamogawa",
    name: "賀茂川漁業協同組合",
    shortName: "賀茂川漁協",
    prefecture: "京都府",
    officialUrl: "https://www.kyotokamogawagyokyo.jp/",
    jurisdiction: {
      text: "小枝橋（京都市南区・伏見区）から上流の鴨川（賀茂川）と高野川、その支流（鞍馬川・貴船川・静原川・中津川など）。白川・高瀬川は除く。",
      source: KYOTO_PLAN,
    },
    fees: [
      { label: "アユ 年券", price: "11,000円", note: "現場購入は13,200円", source: KAMO_VOUCHER },
      { label: "アユ 日券", price: "3,300円", note: "現場購入は4,950円", source: KAMO_VOUCHER },
      { label: "あまご 年券", price: "6,600円", note: "現地購入は7,900円", source: KAMO_VOUCHER },
      { label: "あまご 日券", price: "2,750円", note: "現地購入は4,100円", source: KAMO_VOUCHER },
      { label: "雑魚 年券", price: "2,200円", note: "現地購入は2,600円", source: KAMO_VOUCHER },
      { label: "雑魚 日券", price: "1,100円", note: "現地購入は1,650円", source: KAMO_VOUCHER },
    ],
    seasons: [
      { fish: "アユ", period: "2026年は友釣・ルアー 5/31 解禁（網は8/23〜8/30、区間で異なる）", source: AYU_LIST_2026 },
      { fish: "アマゴ", period: "2026年は3/1 解禁（賀茂川の志久呂橋より上流、高野川の花園橋より上流。竿釣のみ）", source: KAMO_INFO },
      { fish: "イワナ", period: "2026年は3/22 解禁", source: KAMO_INFO },
      { fish: "こい", period: "1/1〜4/30、6/1〜12/31", source: KAMO_RULES },
      { fish: "ふな", period: "1/1〜4/19、5/21〜12/31", source: KAMO_RULES },
    ],
    rules: [
      { text: "毛針釣りは4/1〜6/30のうち漁協が公表する期間は禁止", source: KAMO_RULES },
      { text: "今井堰、四条・三条・丸太町・荒神口の各落差工の上流50mは5/1〜8/31全面禁止", source: KAMO_RULES },
      { text: "全長制限: こい15cm・ふな10cm・うなぎ30cm・あまご12cm・いわな15cm・にじます15cm", source: KAMO_RULES },
      { text: "釣りができるのは日の出から日没まで", source: "https://www.kyotokamogawagyokyo.jp/rule/" },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "ujigawa",
    name: "宇治川漁業協同組合",
    shortName: "宇治川漁協",
    prefecture: "京都府",
    officialUrl: "https://kyotoujigawa.jp",
    jurisdiction: {
      text: "隠元橋（宇治市槇島）から上流、滋賀県境までの宇治川と、その支流（志津川・田原川など）。",
      source: KYOTO_PLAN,
    },
    fees: [
      { label: "全魚種（アユ含む） 年券", price: "8,000円", note: ONSITE, source: AYU_LIST_2026 },
      { label: "全魚種（アユ含む） 日券", price: "2,000円", note: "アユは2026年は6/24から発売", source: AYU_LIST_2026 },
      { label: "こい・ふな・はえ・うなぎ 年券", price: "3,000円", source: UJI_RULES },
      { label: "こい・ふな・はえ・うなぎ 日券", price: "1,000円", source: UJI_RULES },
    ],
    seasons: [
      { fish: "アユ", period: "2026年は友釣・ルアー 6/14 午前5時解禁、網 8/1（専用区域外）", source: AYU_LIST_2026 },
      { fish: "あまご", period: "3/1〜9/30のうち漁協が公表する期間", source: UJI_RULES },
      { fish: "こい", period: "1/1〜4/30、6/1〜12/31", source: UJI_RULES },
      { fish: "ふな", period: "1/1〜4/19、5/21〜12/31", source: UJI_RULES },
    ],
    rules: [
      { text: "宇治橋・朝霧橋・喜撰橋・橘橋・観流橋・白虹橋の橋の上からは通年禁止", source: UJI_RULES },
      { text: "天ケ瀬ダムの上流500m・下流300mは通年禁止", source: UJI_RULES },
      { text: "アユの友釣専用区あり（白川橋〜天ケ瀬吊り橋、志津川の全域など）", source: UJI_RULES },
      { text: "こい・ふな・はえ釣りで赤土や粘土を混ぜたまき餌は禁止。竿は2本以内（ます類は1本）", source: UJI_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "kizugawa",
    name: "木津川漁業協同組合",
    shortName: "木津川漁協",
    prefecture: "京都府",
    officialUrl: "https://kizugawagyokyo.com/",
    jurisdiction: {
      text: "上津屋橋（八幡市）から上流、府県境までの木津川と、その支流。",
      source: KYOTO_PLAN,
    },
    fees: [
      { label: "アユなど（あまごを除く） 年券", price: "9,500円", note: "監視員に払う場合は11,400円", source: AYU_LIST_2026 },
      { label: "アユなど（あまごを除く） 日券", price: "3,100円", note: "監視員に払う場合は4,650円", source: AYU_LIST_2026 },
      { label: "あまご 年券", price: "5,200円", source: KIZU_RULES },
      { label: "あまご 日券", price: "2,100円", source: KIZU_RULES },
      { label: "アユ・あまご以外 日券", price: "700円", source: KIZU_RULES },
    ],
    seasons: [
      { fish: "アユ", period: "2026年は友釣 6/1 解禁（笠置大橋より上流は友釣専用区）、網 8/16 正午（専用区外）", source: AYU_LIST_2026 },
      { fish: "あまご", period: "3/1〜9/30", source: KIZU_RULES },
      { fish: "こい", period: "1/1〜4/30、6/1〜12/31", source: KIZU_RULES },
      { fish: "ふな", period: "1/1〜4/19、5/21〜12/31", source: KIZU_RULES },
    ],
    rules: [
      { text: "アユの友釣専用区: 笠置大橋〜笠置発電所堰堤など", source: KIZU_RULES },
      { text: "通年の禁止区域: 高山ダムの上流・下流300m、大河原発電所堰堤の上流・下流150m、笠置発電所堰堤の上流150m", source: KIZU_RULES },
      { text: "全長制限: こい15cm・ふな6cm・うなぎ30cm・あまご12cm・にじます15cm。竿は2本以内", source: KIZU_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "miyama",
    name: "美山漁業協同組合",
    shortName: "美山漁協",
    prefecture: "京都府",
    officialUrl: "https://www.miyama-gyokyou.jp/",
    jurisdiction: {
      text: "大野ダム（南丹市美山町樫原）から上流の由良川と、その支流（棚野川など）。南丹市美山町を主な流域とする。",
      source: JFA_RIGHTS,
    },
    fees: [
      { label: "アユ 年券", price: "14,500円", note: "現場料金は17,400円", source: MIYAMA_PAGE },
      { label: "アユ 日券", price: "4,000円", note: "現場料金は6,000円。2026年は6/27から発売", source: MIYAMA_PAGE },
      { label: "アマゴ（ます類） 年券", price: "7,500円", note: "現場料金は9,000円", source: MIYAMA_PAGE },
      { label: "アマゴ（ます類） 日券", price: "3,000円", note: "現場料金は4,500円", source: MIYAMA_PAGE },
      { label: "佐々里・芦生・杉波谷 特別区 日券", price: "3,000円", source: MIYAMA_PAGE },
    ],
    seasons: [
      { fish: "アユ", period: "2026年は友釣 5/30 午前5時解禁（毛バリ禁止）、網・メガネ 8/23", source: MIYAMA_PAGE },
      { fish: "アマゴ・ヤマメ", period: "3/1〜9/30のうち漁協が公表する期間", source: MIYAMA_RULES },
      { fish: "イワナ", period: "3/16〜9/30のうち漁協が公表する期間", source: MIYAMA_RULES },
      { fish: "特別区", period: "2026年は佐々里 3/15〜9/30、芦生 4/5〜9/30、杉波谷 3/22〜5/10", source: MIYAMA_PAGE },
    ],
    rules: [
      { text: "アユのルアー釣りは棚野川の全域と、本流の松ヶ丘大橋より下流に限る", source: MIYAMA_PAGE },
      { text: "特別区: 芦生（エサ釣りのみ）、佐々里（ルアー・毛針のみ）、杉波谷", source: MIYAMA_RULES },
      { text: "釣りができるのは夜明けから日没まで（大野ダムの貯水区域を除く）", source: MIYAMA_RULES },
      { text: "全長制限: こい15cm・ふな6cm・うなぎ30cm・あまご/やまめ12cm・いわな/にじます15cm", source: MIYAMA_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "yuragawa",
    name: "由良川漁業協同組合",
    shortName: "由良川漁協",
    prefecture: "京都府",
    officialUrl: "https://yuragawa.org/",
    jurisdiction: {
      text: "綾部市の山家発電所えん堤・由良川ダムから下流、舞鶴市蒲江付近までの由良川と、その支流。綾部市から下流を主な流域とする。",
      source: JFA_RIGHTS,
    },
    fees: [
      { label: "全魚種（アユ券） 年券", price: "11,000円", note: ONSITE, source: AYU_LIST_2026 },
      { label: "全魚種（アユ券） 日券", price: "3,500円", note: "2026年は7/5から発売", source: AYU_LIST_2026 },
      { label: "アユ以外（アマゴ券） 年券", price: "5,000円", source: YURA_RULES },
      { label: "アユ以外（アマゴ券） 日券", price: "2,000円", source: YURA_RULES },
      { label: "はえ・てながえび 日券", price: "500円", source: YURA_RULES },
    ],
    seasons: [
      { fish: "アユ", period: "2026年は釣 6/1 午前6時解禁、網 7/1、友釣専用区 8/1", source: AYU_LIST_2026 },
      { fish: "アマゴ・ヤマメ・イワナ", period: "3/16〜9/30", source: "https://yuragawa.org/" },
      { fish: "コイ", period: "1/1〜4/30、6/1〜12/31", source: YURA_RULES },
      { fish: "フナ", period: "1/1〜4/19、5/21〜12/31", source: YURA_RULES },
    ],
    rules: [
      { text: "全長制限: こい15cm・ふな6cm・うなぎ30cm・あまご/やまめ12cm・いわな/にじます15cm", source: YURA_RULES },
      { text: "通年の禁止区域: 由良川ダムの下流230m、山家発電所堰堤の下流360m、河守堰堤の上下流100mなど", source: YURA_RULES },
      { text: "網漁は区間ごとに禁止期間あり。アユ解禁から7/1午前6時までは全区域で網漁禁止", source: YURA_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
];

export const KYOTO_SPOT_LINKS: Record<string, InlandFisherySpotLink> = {
  "katsuragawa-hozu-river": {
    coopId: "hozugawa",
    evidence: { text: "嵯峨亀ノ尾町は寅天堰〜JR桂川鉄橋の区間（京内共第3号）", source: JFA_RIGHTS },
  },
  "katsuragawa-arashiyama-matsuo-a9": {
    coopId: "hozugawa",
    evidence: { text: "嵐山〜松尾橋はJR桂川鉄橋より上流で、アユ友釣専用区1区（一ノ井堰〜上野橋）にあたる", source: HOZU_RULES },
    note: "嵐山〜松尾橋はアユの友釣専用区です。",
  },
  "kiyotakigawa-river-kyoto": {
    coopId: "hozugawa",
    evidence: { text: "清滝川は保津川漁協の管轄（あゆ遊漁一覧・遊漁規則の友釣専用区2区）", source: AYU_LIST_2026 },
    note: "清滝川は全域がアユの友釣専用区です。",
  },
  "kamikatsura-river-keihoku": {
    coopId: "kamikatsuragawa",
    evidence: { text: "京北周山町は世木ダムより上流の桂川（京内共第1号）", source: JFA_RIGHTS },
  },
  "ooigawa-nantan-river": {
    coopId: "ooigawa",
    evidence: { text: "南丹市八木町八木は世木ダム〜寅天堰の区間（京内共第2号）", source: JFA_RIGHTS },
    note: "寅天堰より下流は保津川漁協の管轄です。",
  },
  "kamogawa-river-kyoto": {
    coopId: "kamogawa",
    evidence: { text: "下鴨宮河町は小枝橋より上流の鴨川（京内共第5号）", source: KYOTO_PLAN },
  },
  "takanogawa-river-kyoto": {
    coopId: "kamogawa",
    evidence: { text: "高野川は賀茂川漁協の区域（京内共第5号）", source: KYOTO_PLAN },
  },
  "kibune-kurama-river": {
    coopId: "kamogawa",
    evidence: { text: "貴船川・鞍馬川は賀茂川漁協の遊漁規則の区域", source: KAMO_RULES },
  },
  "ujigawa-river-kyoto": {
    coopId: "ujigawa",
    evidence: { text: "宇治蓮華は隠元橋より上流の宇治川（京内共第6号）", source: KYOTO_PLAN },
  },
  "kizugawa-kasagi-river": {
    coopId: "kizugawa",
    evidence: { text: "笠置町は上津屋橋より上流の木津川（京内共第7号）", source: KYOTO_PLAN },
    note: "笠置大橋より上流はアユの友釣専用区です。",
  },
  "miyamagawa-river-kyoto": {
    coopId: "miyama",
    evidence: { text: "南丹市美山町は大野ダムより上流の由良川（京内共第8号）", source: JFA_RIGHTS },
  },
  "kyoto-yuragawa-miyama-stream": {
    coopId: "miyama",
    evidence: { text: "南丹市美山町北は大野ダムより上流の由良川（京内共第8号）", source: JFA_RIGHTS },
  },
  "fukuchiyama-yuragawa-k8": {
    coopId: "yuragawa",
    evidence: { text: "福知山市猪崎は山家・由良川ダムより下流の由良川（京内共第11号）", source: JFA_RIGHTS },
  },
  "yuragawa-river": {
    coopId: "yuragawa",
    evidence: { text: "福知山市・綾部市街の由良川本流は京内共第11号の区域", source: JFA_RIGHTS },
  },
  "yuragawa-kakou": {
    outside: true,
    reason: {
      text: "由良川漁協の区域は舞鶴市蒲江付近の線まで。そこから河口までは海面で、内水面の遊漁券はいりません。ただし河口部は海の共同漁業権（はまぐり・しじみ、網・かご漁など）の区域なので、貝類の採取や網は漁業権の侵害になることがあります。",
      source: KYOTO_SEA_RIGHTS,
    },
  },
};
