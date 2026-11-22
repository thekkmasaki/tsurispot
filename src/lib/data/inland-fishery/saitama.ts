import type { InlandFisheryCoop, InlandFisherySpotLink } from "./types";

/**
 * 埼玉県の内水面漁協（2026-11-21 確認）。
 * 出典: 埼玉県が公開する各漁協の遊漁規則と「漁業権漁場の区域」（令和6年1月1日〜令和15年12月31日の免許）、
 *       漁協の公式サイト。神流川は群馬県知事免許（群馬県共第7号）で、規則は群馬県の公開資料。
 * 埼玉中央・児玉郡市・神流川の3漁協は公式サイトが無く、料金は県が公開している規則（施行年度を seasonYear に記載）による。
 */

const VERIFIED = "2026-11-21";
const SAITAMA_GROUND_1 = "https://www.pref.saitama.lg.jp/documents/20283/fishing_ground_no_1.pdf";
const SAITAMA_GROUND_4 = "https://www.pref.saitama.lg.jp/documents/20283/fishing_ground_no_4.pdf";
const SAITAMA_GROUND_OTHER = "https://www.pref.saitama.lg.jp/documents/20283/fishing_ground_other_prefecture.pdf";

const CHICHIBU_RULES = "https://www.pref.saitama.lg.jp/documents/3345/01chichibu_recreational_fishing_rules.pdf";
const CHICHIBU_AYU_2026 = "https://gyokyou.com/entry/2026/01/21/132715";
const CHICHIBU_KEIRYU_2026 = "https://gyokyou.com/entry/2026/01/21/134113";
const CHICHIBU_WAKASAGI_2026 = "https://gyokyou.com/entry/2026/08/31/163914";
const CHUO_RULES = "https://www.pref.saitama.lg.jp/documents/3345/chuo0712.pdf";
const KODAMA_RULES = "https://www.pref.saitama.lg.jp/documents/3345/07kodama_recreational_fishing_rules.pdf";
const KANNA_RULES = "https://www.pref.gunma.jp/uploaded/attachment/602160.pdf";
const SAITAMA_GROUND_2 = "https://www.pref.saitama.lg.jp/documents/20283/fishing_ground_no_2.pdf";
const SAITAMA_GROUND_5 = "https://www.pref.saitama.lg.jp/documents/20283/fishing_ground_no_5.pdf";
const SAITAMA_GROUND_9 = "https://www.pref.saitama.lg.jp/documents/20283/fishing_ground_no_9.pdf";
const SAITAMA_GROUND_3 = "https://www.pref.saitama.lg.jp/documents/20283/fishing_ground_no_3.pdf";
const IRUMA_RULES = "https://www.pref.saitama.lg.jp/documents/3345/05iruma_recreational_fishing_rules.pdf";
const IRUMA_SITE = "https://sites.google.com/view/irumanosakana/%E3%83%9B%E3%83%BC%E3%83%A0";
const IRUMA_2026 = "https://drive.google.com/file/d/1qJDlqiED_umJqexjrZAb_UZcKvGTpdwx/view";
const SEIBU_RULES = "https://www.pref.saitama.lg.jp/documents/3345/yuugyo_seibu_r080625.pdf";
const NANBU_RULES = "https://www.pref.saitama.lg.jp/documents/3345/06nannbu_recreational_fishing_rules.pdf";
const MUSASHI_RULES = "https://www.pref.saitama.lg.jp/documents/3345/03musasi_recreational_fishing_rules.pdf";
const TOBU_RULES = "https://www.pref.saitama.lg.jp/documents/3345/r8tobugyokyou.pdf";
const HOKUBU_RULES = "https://www.pref.saitama.lg.jp/documents/3345/08hokubu_recreational_fishing_rules.pdf";
const TONE_NO9_RULES = "https://www.pref.saitama.lg.jp/documents/3345/12no9_recreational_fishing_rules.pdf";

const KENNAI = { label: "県内共通券（あゆ・ます類を除く。リール釣りは不可）", price: "年6,000円", note: "埼玉県内の各漁協の区域で使える" };

export const SAITAMA_COOPS: InlandFisheryCoop[] = [
  {
    id: "chichibu",
    name: "秩父漁業協同組合",
    shortName: "秩父漁協",
    prefecture: "埼玉県",
    officialUrl: "https://gyokyou.com/",
    jurisdiction: {
      text: "荒川の上流から、玉淀ダム上流の長瀞町矢那瀬（左岸）と寄居町金尾（右岸）を結ぶ境界まで（秩父市・皆野町・長瀞町）と、浦山川・吉田川・横瀬川・中津川・赤平川など秩父地域の支流（埼玉県共第1号）。",
      source: SAITAMA_GROUND_1,
    },
    fees: [
      { label: "甲種 年券（全魚種）", price: "14,000円", note: "にじますの10月〜2月は別券", source: CHICHIBU_RULES },
      { label: "甲種 日券", price: "3,000円", note: "現場売りは5,000円", source: CHICHIBU_AYU_2026 },
      { label: "渓流券 年券（あゆ・わかさぎを除く）", price: "9,000円", source: CHICHIBU_KEIRYU_2026 },
      { label: "渓流券 日券", price: "2,500円", note: "現場売りは5,000円", source: CHICHIBU_KEIRYU_2026 },
      { label: "特乙種（あゆ・ます類を除く）", price: "年6,500円／日1,000円", note: "日券の現場売りは2,500円", source: CHICHIBU_RULES },
      { label: "乙種（あゆ・ます類・わかさぎを除く。リール釣りは不可）", price: "年4,000円／日400円", note: "日券の現場売りは500円", source: CHICHIBU_RULES },
      { label: "冬季にじます券（10/1〜2月末）", price: "シーズン5,500円／日2,000円", note: "日券の現場売りは3,000円", source: CHICHIBU_RULES },
      { ...KENNAI, source: CHICHIBU_RULES },
      { label: "18歳以下", price: "無料", source: CHICHIBU_RULES },
    ],
    seasons: [
      { fish: "あゆ", period: "2026年は4/25 午前6時解禁〜12/31", source: CHICHIBU_AYU_2026 },
      { fish: "ます類（やまめ・いわな等）", period: "3/1〜9/30。にじますは巴川橋〜埼玉中央漁協との境界の荒川と特設釣区で通年", source: CHICHIBU_RULES },
      { fish: "わかさぎ", period: "2026年度は9/19〜2/28（合角ダム・浦山ダム・滝沢ダム・二瀬ダム）", source: CHICHIBU_WAKASAGI_2026 },
      { fish: "うぐい・おいかわ・こい・ふな・うなぎ・かじか・なまず", period: "通年", source: CHICHIBU_RULES },
    ],
    rules: [
      { text: "釣りは道糸2本以内", source: CHICHIBU_RULES },
      { text: "全長制限: ます類15cm・こい18cm・うなぎ26cm以下は採捕禁止", source: CHICHIBU_RULES },
      { text: "通年の禁止区域: 合角ダム（吉田川）・浦山ダム（浦山川）・二瀬ダム（荒川）の上流200m〜下流300m、滝沢ダム周辺（中津川）、魚道の上下流10m", source: CHICHIBU_RULES },
      { text: "荒川の巴川橋〜埼玉中央漁協との境界では、10/1〜2月末のます類は1人1日3尾まで", source: CHICHIBU_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "saitamachuo",
    name: "埼玉中央漁業協同組合",
    shortName: "埼玉中央漁協",
    prefecture: "埼玉県",
    officialUrl: CHUO_RULES,
    jurisdiction: {
      text: "荒川の、玉淀ダム上流の長瀞町矢那瀬（左岸）・寄居町金尾（右岸）の境界から下流の大芦橋まで（寄居町・深谷市・熊谷市・鴻巣市）と、寄居町の支流（埼玉県共第1号）。",
      source: SAITAMA_GROUND_1,
    },
    fees: [
      { label: "甲種 年券（全魚種）", price: "9,000円", source: CHUO_RULES },
      { label: "甲種 日券（釣り）", price: "2,100円", note: "現場売りは2,600円", source: CHUO_RULES },
      { label: "ます類券（あゆを除く・釣り）", price: "年6,000円／日1,000円", source: CHUO_RULES },
      { label: "乙種（あゆ・ます類を除く。リール釣りは不可）", price: "年3,500円／日500円", source: CHUO_RULES },
      { ...KENNAI, source: CHUO_RULES },
      { label: "中学生以下", price: "無料", source: CHUO_RULES },
    ],
    seasons: [
      { fish: "あゆ", period: "組合が公表する日〜12/31", source: CHUO_RULES },
      { fish: "ます類", period: "3/1〜9/30（にじますは通年）", source: CHUO_RULES },
      { fish: "うぐい・おいかわ・こい・ふな・うなぎ・どじょう・かじか・わかさぎ・なまず", period: "通年", source: CHUO_RULES },
    ],
    rules: [
      { text: "釣りは道糸2本以内", source: CHUO_RULES },
      { text: "全長制限: ます類15cm・こい18cm・うなぎ26cm以下は採捕禁止", source: CHUO_RULES },
      { text: "通年の禁止区域: 荒川の六堰（深谷市永田）上流100m〜下流200m、魚道", source: CHUO_RULES },
      { text: "荒川の玉淀ダム上流端〜正喜橋（寄居町）は保護水面で、釣り以外は通年禁止、あゆは10月禁漁", source: CHUO_RULES },
    ],
    seasonYear: "2024",
    verifiedAt: VERIFIED,
  },
  {
    id: "kodamagunshi",
    name: "児玉郡市漁業協同組合",
    shortName: "児玉郡市漁協",
    prefecture: "埼玉県",
    officialUrl: KODAMA_RULES,
    jurisdiction: {
      text: "小山川・女堀川・志戸川・間瀬川（間瀬湖を含む）など本庄市・児玉郡の河川（埼玉県共第4号）と、利根川・烏川・神流川の一部。",
      source: SAITAMA_GROUND_4,
    },
    fees: [
      { label: "甲種 年券（全魚種）", price: "6,000円", source: KODAMA_RULES },
      { label: "甲種 日券", price: "800円", note: "現場売りは1,000円", source: KODAMA_RULES },
      { label: "乙種 年券（ます類・わかさぎを除く）", price: "3,000円", note: "間瀬湖では使えない", source: KODAMA_RULES },
      { label: "乙種 日券", price: "500円", note: "現場売りは700円", source: KODAMA_RULES },
      { ...KENNAI, source: KODAMA_RULES },
      { label: "小学生以下・中学生の釣り", price: "無料", source: KODAMA_RULES },
    ],
    seasons: [
      { fish: "ます類", period: "3/1〜9/30（にじますは通年）", source: KODAMA_RULES },
      { fish: "わかさぎ", period: "10/1〜3/31", source: KODAMA_RULES },
      { fish: "うぐい・おいかわ・こい・ふな・うなぎ・どじょう・なまず", period: "通年", source: KODAMA_RULES },
    ],
    rules: [
      { text: "釣りは道糸2本以内", source: KODAMA_RULES },
      { text: "間瀬川（間瀬湖を含む）は通年、釣り以外の漁法は禁止", source: KODAMA_RULES },
      { text: "全長制限: ます類15cm・こい18cm・うなぎ26cm以下は採捕禁止", source: KODAMA_RULES },
      { text: "標識のある産卵場と魚道は遊漁禁止", source: KODAMA_RULES },
    ],
    seasonYear: "2024",
    verifiedAt: VERIFIED,
  },
  {
    id: "kannagawa",
    name: "神流川漁業協同組合",
    shortName: "神流川漁協",
    prefecture: "群馬県",
    alsoCovers: ["埼玉県"],
    officialUrl: KANNA_RULES,
    jurisdiction: {
      text: "群馬県共第7号の神流川。埼玉県側では神川町の神流川（渡戸橋まで）と支流が対象で、下久保ダムの湖（神流湖）も漁場に含まれる。",
      source: SAITAMA_GROUND_OTHER,
    },
    fees: [
      { label: "全魚種 年券", price: "5,500円", source: KANNA_RULES },
      { label: "全魚種 日券", price: "1,000円", note: "現場で監視員から買う場合は500円加算", source: KANNA_RULES },
      { label: "中学生 年券", price: "300円", note: "小学生以下は不要", source: KANNA_RULES },
    ],
    seasons: [
      { fish: "アユ", period: "組合が定める日〜10/31", source: KANNA_RULES },
      { fish: "ヤマメ・イワナ", period: "3/1〜9/20", source: KANNA_RULES },
      { fish: "ワカサギ", period: "組合が定める日〜翌3/20", source: KANNA_RULES },
      { fish: "ニジマス・コイ・フナ・ウグイ・オイカワ", period: "通年", source: KANNA_RULES },
    ],
    rules: [
      { text: "竿釣りは1人3本まで", source: KANNA_RULES },
      { text: "通年の禁止区域: 下久保ダムの上流側400m・下流側600m、神水ダム周辺など", source: KANNA_RULES },
      { text: "全長制限: ヤマメ・イワナ・マス15cm、コイ18cm、ウグイ8cm、フナ7cm以下は採捕禁止", source: KANNA_RULES },
      { text: "ヤマメ・イワナは合わせて1人1日20尾まで", source: KANNA_RULES },
    ],
    seasonYear: "2023",
    verifiedAt: VERIFIED,
  },
  {
    id: "saitamananbu",
    name: "埼玉南部漁業協同組合",
    shortName: "埼玉南部漁協",
    prefecture: "埼玉県",
    officialUrl: NANBU_RULES,
    jurisdiction: {
      text: "荒川の太郎右衛門橋（桶川市川田谷）から笹目橋まで（彩湖＝荒川第一調節池を除く）と、新河岸川・柳瀬川・黒目川・芝川・笹目川・びん沼川など（埼玉県共第2号）。市野川合流〜太郎右衛門橋は武蔵漁協と共同。",
      source: SAITAMA_GROUND_2,
    },
    fees: [
      { label: "甲種 年券（全魚種）", price: "6,000円", source: NANBU_RULES },
      { label: "甲種 日券", price: "2,000円", source: NANBU_RULES },
      { label: "乙種（あゆ・ます類を除く・釣り）", price: "年4,000円／日600円", source: NANBU_RULES },
      { ...KENNAI, source: NANBU_RULES },
      { label: "中学生以下", price: "無料", source: NANBU_RULES },
    ],
    seasons: [
      { fish: "あゆ", period: "組合が公表する日〜12/31", source: NANBU_RULES },
      { fish: "ます類", period: "3/1〜9/30（にじますは通年）", source: NANBU_RULES },
      { fish: "うぐい・おいかわ・こい・ふな・うなぎ・どじょう・かじか・わかさぎ・なまず", period: "通年", source: NANBU_RULES },
    ],
    rules: [
      { text: "釣りは道糸3本以内", source: NANBU_RULES },
      { text: "全長制限: ます類15cm・こい18cm・うなぎ26cm以下は採捕禁止", source: NANBU_RULES },
      { text: "釣り専用区（通年）: 荒川の秋ヶ瀬取水堰の上流100m〜下流200m、びん沼川の砂塚橋〜南畑排水機場など", source: NANBU_RULES },
      { text: "通年の禁止区域: 新河岸川の新城下橋〜石原橋（川越市）、魚道の上下流5m", source: NANBU_RULES },
    ],
    seasonYear: "2024",
    verifiedAt: VERIFIED,
  },
  {
    id: "musashi",
    name: "武蔵漁業協同組合",
    shortName: "武蔵漁協",
    prefecture: "埼玉県",
    officialUrl: MUSASHI_RULES,
    jurisdiction: {
      text: "荒川の大芦橋から市野川合流（川島町）まで（鴻巣市・吉見町・北本市・川島町）と市野川・旧荒川など（埼玉県共第2号）、都幾川・槻川・兜川と、越辺川の高坂橋（東松山市）から下流（埼玉県共第3号）。",
      source: SAITAMA_GROUND_3,
    },
    fees: [
      { label: "甲種 年券（全魚種）", price: "7,000円", source: MUSASHI_RULES },
      { label: "甲種 日券（釣り）", price: "1,500円", note: "現場売りは2,000円", source: MUSASHI_RULES },
      { label: "乙種 年券（あゆ・ます類を除く・釣り）", price: "4,000円", source: MUSASHI_RULES },
      { label: "乙種 日券（釣り）", price: "500円", note: "現場売りは1,000円", source: MUSASHI_RULES },
      { ...KENNAI, source: MUSASHI_RULES },
      { label: "中学生以下", price: "無料", source: MUSASHI_RULES },
    ],
    seasons: [
      { fish: "あゆ", period: "組合が公表する日〜12/31", source: MUSASHI_RULES },
      { fish: "ます類（にじますを除く）", period: "3/1〜9/30", source: MUSASHI_RULES },
      { fish: "にじます・うぐい・おいかわ・こい・ふな・うなぎ・どじょう・かじか・わかさぎ・なまず", period: "通年", source: MUSASHI_RULES },
    ],
    rules: [
      { text: "釣りは道糸2本以内", source: MUSASHI_RULES },
      { text: "通年の禁止区域: 荒川の武蔵水路合流点（鴻巣市糠田）の上流100m〜下流100m、魚道", source: MUSASHI_RULES },
      { text: "槻川の大寺橋〜坂田橋下流300m（小川町）は、10/1〜4/30 にじますのキャッチアンドリリース区間（冬季にじます日券1,500円）", source: MUSASHI_RULES },
      { text: "全長制限: ます類15cm・こい18cm・うなぎ26cm以下は採捕禁止", source: MUSASHI_RULES },
    ],
    seasonYear: "2024",
    verifiedAt: VERIFIED,
  },
  {
    id: "saitamatobu",
    name: "埼玉東部漁業協同組合",
    shortName: "埼玉東部漁協",
    prefecture: "埼玉県",
    officialUrl: TOBU_RULES,
    jurisdiction: {
      text: "中川の門樋橋（久喜市八甫）から下流、元荒川の慈恩寺橋から下流、大落古利根川、権現堂川、綾瀬川の一部など（埼玉県共第5号）。江戸川（東京都知事免許 内共第11号）も東京東部漁協などと共有。",
      source: SAITAMA_GROUND_5,
    },
    fees: [
      { label: "特種 年券（全魚種・網など）", price: "8,000円", source: TOBU_RULES },
      { label: "特種 日券", price: "1,000円", source: TOBU_RULES },
      { label: "甲種", price: "年5,000円／日700円", source: TOBU_RULES },
      { label: "乙種（釣り）", price: "年4,000円／日500円", source: TOBU_RULES },
      { label: "県内共通券（リール釣りは不可）", price: "年6,000円", note: "埼玉県内の各漁協の区域で使える", source: TOBU_RULES },
      { label: "中学生以下", price: "無料", source: TOBU_RULES },
    ],
    seasons: [
      { fish: "おいかわ・こい・ふな・うなぎ・どじょう・わかさぎ・なまず", period: "通年", source: TOBU_RULES },
    ],
    rules: [
      { text: "釣りは道糸3本以内", source: TOBU_RULES },
      { text: "全長制限: こい18cm・うなぎ26cm以下は採捕禁止", source: TOBU_RULES },
      { text: "通年の禁止区域: 元荒川の瓦曽根堰（越谷市）上流20m〜下流50m、権現堂川の中川合流点から上流200m、中川の垳川合流点から上流200mなど", source: TOBU_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "saitamahokubu",
    name: "埼玉県北部漁業協同組合",
    shortName: "埼玉県北部漁協",
    prefecture: "埼玉県",
    officialUrl: HOKUBU_RULES,
    jurisdiction: {
      text: "元荒川の榎戸堰（鴻巣市）から慈恩寺橋（さいたま市岩槻区）まで、中川の上流〜門樋橋、星川など（埼玉県共第5号）と、利根川の利根大堰の下流から加須市飯積までの右岸（共第9号、他の漁協と共同）。加須市飯積から下流の利根川は千葉県知事免許（内共第14号）の区域。",
      source: SAITAMA_GROUND_9,
    },
    fees: [
      { label: "甲種 年券（全魚種）", price: "6,000円", note: "利根川の共第9号の区域でも使える", source: TONE_NO9_RULES },
      { label: "甲種 日券", price: "800円", source: HOKUBU_RULES },
      { label: "乙種（釣り）", price: "年4,000円／日500円", source: HOKUBU_RULES },
      { label: "利根川 共第9号共通 日券（全魚種・釣り）", price: "1,000円", note: "現場売りは1,500円", source: TONE_NO9_RULES },
      { label: "利根川 共第9号共通 日券（あゆ・ます類を除く）", price: "500円", note: "現場売りは1,000円", source: TONE_NO9_RULES },
      { label: "利根川 共第9号共通 年券", price: "6,000円", source: TONE_NO9_RULES },
      { label: "県内共通券（リール釣りは不可）", price: "年6,000円", source: HOKUBU_RULES },
      { label: "中学生以下", price: "無料", source: HOKUBU_RULES },
    ],
    seasons: [
      { fish: "おいかわ・こい・ふな・うなぎ・どじょう・なまず", period: "通年", source: HOKUBU_RULES },
      { fish: "わかさぎ", period: "10/1〜3/31", source: HOKUBU_RULES },
      { fish: "あゆ（利根川 共第9号）", period: "6/1以降で組合が公表する日〜12/31", source: TONE_NO9_RULES },
      { fish: "ます類（利根川 共第9号）", period: "3/1〜9/20（にじますは通年）", source: TONE_NO9_RULES },
    ],
    rules: [
      { text: "釣りは道糸2本以内", source: HOKUBU_RULES },
      { text: "全長制限: こい18cm・うなぎ26cm以下は採捕禁止（利根川の共第9号は ます類15cm・うぐい8cm・こい18cm・うなぎ30cm）", source: TONE_NO9_RULES },
      { text: "利根川の利根大堰（行田市須加）上流160m〜下流200m（1〜9月）・下流500m（10〜12月）は全魚種禁止", source: TONE_NO9_RULES },
    ],
    seasonYear: "2024",
    verifiedAt: VERIFIED,
  },
  {
    id: "iruma",
    name: "入間漁業協同組合",
    shortName: "入間漁協",
    prefecture: "埼玉県",
    officialUrl: IRUMA_SITE,
    jurisdiction: {
      text: "入間川（名栗川）の上流から東武東上線鉄橋（川越市小ヶ谷）まで（飯能市・入間市・狭山市・川越市）と、有間川（名栗湖を含む）・成木川・霞川・小畔川上流などの支流（埼玉県共第3号）。",
      source: SAITAMA_GROUND_3,
    },
    fees: [
      { label: "甲種 年券（全魚種）", price: "8,000円", source: IRUMA_RULES },
      { label: "甲種 日券", price: "2,000円", note: "現場売りは3,000円", source: IRUMA_RULES },
      { label: "ます類券 日券（あゆを除く）", price: "1,200円", note: "現場売りは2,000円", source: IRUMA_RULES },
      { label: "特乙券（あゆ・ます類を除く）", price: "年5,000円／日700円", note: "日券の現場売りは1,000円", source: IRUMA_RULES },
      { label: "乙券（あゆ・ます類・わかさぎを除く。リール釣りは不可）", price: "年3,000円／日400円", note: "日券の現場売りは500円", source: IRUMA_RULES },
      { ...KENNAI, source: IRUMA_RULES },
      { label: "中学生以下", price: "無料", source: IRUMA_RULES },
    ],
    seasons: [
      { fish: "あゆ（友釣り・アユイング）", period: "2026年は6/1 午前5時解禁〜12/31", source: IRUMA_2026 },
      { fish: "あゆ（毛針・エサ釣りなど）", period: "2026年は7/1 午前5時解禁", source: IRUMA_2026 },
      { fish: "やまめ（ます類）", period: "3/1〜9/30", source: IRUMA_2026 },
      { fish: "わかさぎ（名栗湖）", period: "2026年は11/1〜翌3月末", source: IRUMA_2026 },
      { fish: "うぐい・おいかわ・こい・ふな・うなぎ・どじょう・なまず", period: "通年（有間橋より上流は10/1〜2月末、アユ以外も禁漁）", source: IRUMA_2026 },
    ],
    rules: [
      { text: "釣りは道糸3本以内", source: IRUMA_RULES },
      { text: "全長制限: ます類15cm・こい18cm・うなぎ26cm以下は採捕禁止", source: IRUMA_RULES },
      { text: "通年の禁止区域: 入間川の扇橋〜小瀬戸頭首工（飯能市）、笹井堰堤の上流100m〜下流200m、有間ダムの流木止め〜堰堤下流300mなど", source: IRUMA_RULES },
      { text: "釣り専用区: 入間川の広瀬橋〜田島屋堰（狭山市）、豊水橋下流堰堤から上流の全区域、霞川、有間川など", source: IRUMA_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
  {
    id: "saitamaseibu",
    name: "埼玉西部漁業協同組合",
    shortName: "埼玉西部漁協",
    prefecture: "埼玉県",
    officialUrl: SEIBU_RULES,
    jurisdiction: {
      text: "高麗川（飯能市・日高市・坂戸市）と、越辺川の高坂橋（東松山市）から上流（越生町・毛呂山町・鳩山町・坂戸市）、その支流（埼玉県共第3号）。",
      source: SAITAMA_GROUND_3,
    },
    fees: [
      { label: "甲種 年券（全魚種）", price: "7,000円", source: SEIBU_RULES },
      { label: "甲種 日券（釣り）", price: "1,500円", note: "現場売りは2,000円", source: SEIBU_RULES },
      { label: "乙種（あゆ・ます類を除く）", price: "年4,000円／日500円", note: "日券の現場売りは1,000円", source: SEIBU_RULES },
      { ...KENNAI, source: SEIBU_RULES },
      { label: "小学生以下・中学生の延べ竿釣り（あゆ・ます類以外）", price: "無料", source: SEIBU_RULES },
    ],
    seasons: [
      { fish: "あゆ", period: "6/15〜12/31", source: SEIBU_RULES },
      { fish: "ます類", period: "3/1〜9/30（にじますは通年）", source: SEIBU_RULES },
      { fish: "うぐい・おいかわ・こい・ふな・うなぎ・どじょう・かじか・わかさぎ・なまず", period: "通年", source: SEIBU_RULES },
    ],
    rules: [
      { text: "釣りは道糸2本以内", source: SEIBU_RULES },
      { text: "全長制限: ます類15cm・こい18cm・うなぎ26cm以下は採捕禁止", source: SEIBU_RULES },
      { text: "釣り専用区: 高麗川の関越道橋〜粟生田堰（坂戸市）、高麗本郷〜鹿台橋下流堰堤（日高市）、越辺川の一部など", source: SEIBU_RULES },
    ],
    seasonYear: "2026",
    verifiedAt: VERIFIED,
  },
];

const ARAKAWA_CHICHIBU = { text: "荒川の玉淀ダム上流の矢那瀬・金尾の境界より上流は秩父漁協の区域（埼玉県共第1号 1-1）", source: SAITAMA_GROUND_1 };
const URAYAMA = { text: "浦山ダムは浦山川（埼玉県共第1号、秩父漁協）。組合が2026年度のわかさぎ釣場として浦山ダムを公表", source: CHICHIBU_WAKASAGI_2026 };
const KAKKAKU = { text: "合角ダムは吉田川（埼玉県共第1号、秩父漁協）。組合が2026年度のわかさぎ釣場として合角ダムを公表", source: CHICHIBU_WAKASAGI_2026 };

const ARAKAWA_NANBU = { text: "荒川の太郎右衛門橋〜笹目橋は埼玉南部漁協の区域（埼玉県共第2号）", source: SAITAMA_GROUND_2 };
const BINNUMA = { text: "びん沼川は埼玉県共第2号 2-18（埼玉南部漁協）。砂塚橋〜南畑排水機場は釣り専用区", source: NANBU_RULES };
const FURUTONE = { text: "大落古利根川は埼玉県共第5号 5-17（埼玉東部漁協）", source: SAITAMA_GROUND_5 };
const NAKAGAWA = { text: "中川の門樋橋（久喜市八甫）〜大場川合流点は埼玉東部漁協の区域（埼玉県共第5号 5-1）", source: SAITAMA_GROUND_5 };
const MOTOARA_HOKUBU = { text: "元荒川の榎戸堰〜慈恩寺橋（蓮田市を含む）は埼玉県北部漁協の区域（埼玉県共第5号 5-9）", source: SAITAMA_GROUND_5 };
const TONE_KAZO = { text: "加須市の利根川右岸は、飯積より上流が共第9号、下流が千葉県知事免許の内共第14号で、どちらも埼玉県北部漁協の区域", source: SAITAMA_GROUND_9 };
const TONE_KAZO_NOTE = "加須市飯積より下流は千葉県知事免許（内共第14号）の漁場で、料金・規則が異なります。";

const IRUMA_LINK = { text: "入間川（名栗川）の上流〜東武東上線鉄橋（川越市小ヶ谷）は入間漁協の区域（埼玉県共第3号）", source: SAITAMA_GROUND_3 };
const NAGURIKO = { text: "名栗湖は有間川（埼玉県共第3号、入間漁協）のダム湖。組合の2026年のお知らせに名栗湖のわかさぎ期間を掲載", source: IRUMA_2026 };
const KOMA = { text: "高麗川は埼玉県共第3号で埼玉西部漁協の区域", source: SAITAMA_GROUND_3 };
const YANASE = { text: "柳瀬川は埼玉県共第2号で埼玉南部漁協の区域（東京都清瀬市の区間を含む）", source: SAITAMA_GROUND_2 };
const TSUKI = { text: "槻川（小川町・嵐山町）は埼玉県共第3号で武蔵漁協の区域", source: SAITAMA_GROUND_3 };

export const SAITAMA_SPOT_LINKS: Record<string, InlandFisherySpotLink> = {
  "arakawa-chichibu": { coopId: "chichibu", evidence: ARAKAWA_CHICHIBU },
  "arakawa-chichibu-nagatoro": { coopId: "chichibu", evidence: ARAKAWA_CHICHIBU },
  "arakawa-chichibu-e8": { coopId: "chichibu", evidence: ARAKAWA_CHICHIBU },
  "arakawa-chichibu-nagatoro-a10": { coopId: "chichibu", evidence: ARAKAWA_CHICHIBU },
  "nagatoro-keikoku6": { coopId: "chichibu", evidence: ARAKAWA_CHICHIBU },
  "chichibu-arakawa-keiryu6": { coopId: "chichibu", evidence: ARAKAWA_CHICHIBU },
  "chichibu-sakurako": { coopId: "chichibu", evidence: URAYAMA },
  "chichibu-urayama-dam": { coopId: "chichibu", evidence: URAYAMA },
  "urayama-dam-sakurako6": { coopId: "chichibu", evidence: URAYAMA },
  "kakkaku-dam": { coopId: "chichibu", evidence: KAKKAKU },
  "kakkaku-dam-chichibu-yoshida-a12": { coopId: "chichibu", evidence: KAKKAKU },
  "yokozegawa-keiryu6": {
    coopId: "chichibu",
    evidence: { text: "横瀬川は埼玉県共第1号 1-104（秩父漁協）", source: SAITAMA_GROUND_1 },
    note: "横瀬町横瀬の滝の枕（秩父用水取水口）から上流は、釣り以外の漁法が禁止の釣り専用区です。",
  },
  "nakatsugawa-chichibu-e8": {
    coopId: "chichibu",
    evidence: { text: "中津川は埼玉県共第1号 1-160（秩父漁協）", source: SAITAMA_GROUND_1 },
  },
  "arakawa-kumagaya6": {
    coopId: "saitamachuo",
    evidence: { text: "荒川の矢那瀬・金尾の境界から下流の大芦橋までは埼玉中央漁協の区域で、熊谷市を含む（埼玉県共第1号 1-1）", source: SAITAMA_GROUND_1 },
  },
  "arakawa-yorii-tamayodo-a12": {
    coopId: "saitamachuo",
    evidence: { text: "寄居町の荒川は埼玉中央漁協の区域（埼玉県共第1号 1-1）", source: SAITAMA_GROUND_1 },
    note: "玉淀ダムの上流端から正喜橋までは保護水面で、釣り以外の漁法は禁止、あゆは10月禁漁です。",
  },
  "mase-lake-saitama-a11": {
    coopId: "kodamagunshi",
    evidence: { text: "児玉郡市漁協の遊漁規則に「間瀬川（間瀬湖を含む）」と明記（埼玉県共第4号 4-14）", source: KODAMA_RULES },
    note: "乙種の年券は間瀬湖では使えません（日券か甲種を買ってください）。",
  },
  // 入間川・名栗湖（入間漁協）
  "iruma-river-upstream": { coopId: "iruma", evidence: IRUMA_LINK },
  "irumagawa-fishing": { coopId: "iruma", evidence: IRUMA_LINK },
  "iruma-river-hosui-bridge": { coopId: "iruma", evidence: IRUMA_LINK },
  "iruma-gawa-sayama": { coopId: "iruma", evidence: IRUMA_LINK },
  "irumagawa-hanno-iruma": { coopId: "iruma", evidence: IRUMA_LINK },
  "irumagawa-hanno6": { coopId: "iruma", evidence: IRUMA_LINK },
  "hanno-naguri-kawaharaa13": { coopId: "iruma", evidence: IRUMA_LINK },
  "nagurigawa-keiryu": { coopId: "iruma", evidence: IRUMA_LINK },
  "naguri-gawa-keikoku": { coopId: "iruma", evidence: IRUMA_LINK },
  "naguri-gawa": { coopId: "iruma", evidence: IRUMA_LINK },
  "naguri-gawa-keiryu6": { coopId: "iruma", evidence: IRUMA_LINK },
  "irumagawa-sayama-hirose-a12": {
    coopId: "iruma",
    evidence: IRUMA_LINK,
    note: "広瀬橋〜田島屋堰は、釣り以外の漁法が禁止の釣り専用区です。",
  },
  "naguriko-arima-dam": { coopId: "iruma", evidence: NAGURIKO, note: "有間ダムの流木止めから堰堤下流300mは通年遊漁禁止です。" },
  "naguri-ko": { coopId: "iruma", evidence: NAGURIKO, note: "有間ダムの流木止めから堰堤下流300mは通年遊漁禁止です。" },
  // 高麗川・越辺川上流（埼玉西部）
  "komagawa-river": { coopId: "saitamaseibu", evidence: KOMA },
  "komagawa-hidaka": { coopId: "saitamaseibu", evidence: KOMA },
  "komagawa-hidaka6": { coopId: "saitamaseibu", evidence: KOMA },
  "oppegawa-river": {
    coopId: "saitamaseibu",
    evidence: { text: "越辺川の高坂橋から上流と高麗川は、どちらも埼玉県共第3号で埼玉西部漁協の区域", source: SAITAMA_GROUND_3 },
  },
  "oppegawa-moroyama6": {
    coopId: "saitamaseibu",
    evidence: { text: "越辺川の高坂橋から上流（毛呂山町を含む）は埼玉県共第3号で埼玉西部漁協の区域", source: SAITAMA_GROUND_3 },
  },
  // 槻川・都幾川（武蔵）
  "tsukigawa-ogawa6": { coopId: "musashi", evidence: TSUKI },
  "tsukigawa-ogawa-sengenyama-a11": { coopId: "musashi", evidence: TSUKI },
  "tsukigawa-ogawa-ranzan-a12": { coopId: "musashi", evidence: TSUKI },
  "tokigawa-ranzan-keikoku-a11": {
    coopId: "musashi",
    evidence: { text: "都幾川・槻川（嵐山町を含む）はどちらも埼玉県共第3号で武蔵漁協の区域", source: SAITAMA_GROUND_3 },
  },
  // 柳瀬川・新河岸川（埼玉南部）
  "yanasegawa-river": { coopId: "saitamananbu", evidence: YANASE },
  "yanase-gawa-kiyose": { coopId: "saitamananbu", evidence: YANASE },
  "yanasegawa-kiyose6": { coopId: "saitamananbu", evidence: YANASE },
  "yanasegawa-shiki-niiza": { coopId: "saitamananbu", evidence: YANASE },
  "tokorozawa-yanasegawa-kanayama-a13": { coopId: "saitamananbu", evidence: YANASE },
  "shingashigawa-fujimino-a11": {
    coopId: "saitamananbu",
    evidence: { text: "新河岸川（ふじみ野市を含む）は埼玉県共第2号で埼玉南部漁協の区域", source: SAITAMA_GROUND_2 },
  },
  "shingashigawa-kawagoe-tojo-a12": {
    coopId: "saitamananbu",
    evidence: { text: "新河岸川（川越市を含む）は埼玉県共第2号で埼玉南部漁協の区域", source: SAITAMA_GROUND_2 },
    note: "新河岸川の新城下橋〜石原橋（川越市）は通年遊漁禁止です。この近くなので、場所を確認してください。",
  },
  // 荒川中下流（埼玉南部・武蔵）
  "arakawa-akigase": {
    coopId: "saitamananbu",
    evidence: { text: "荒川の太郎右衛門橋〜笹目橋は埼玉南部漁協の区域（埼玉県共第2号）", source: SAITAMA_GROUND_2 },
    note: "秋ヶ瀬取水堰の上流100m〜下流200mは、釣り以外の漁法が禁止の釣り専用区です。",
  },
  "arakawa-akigase-tenaga": { coopId: "saitamananbu", evidence: ARAKAWA_NANBU },
  "arakawa-akigase-park6": { coopId: "saitamananbu", evidence: ARAKAWA_NANBU },
  "arakawa-shiki-asaka-e8": { coopId: "saitamananbu", evidence: ARAKAWA_NANBU },
  "binnumagawa-tanago": { coopId: "saitamananbu", evidence: BINNUMA },
  "binnumagawa-raigyo": { coopId: "saitamananbu", evidence: BINNUMA },
  "binnuma-gawa6": { coopId: "saitamananbu", evidence: BINNUMA },
  "toda-sasamegawa-a13": {
    coopId: "saitamananbu",
    evidence: { text: "笹目川は埼玉県共第2号 2-15（埼玉南部漁協）", source: SAITAMA_GROUND_2 },
  },
  "yoshimi-sakura-arakawa-a10": {
    coopId: "musashi",
    evidence: { text: "荒川の大芦橋〜市野川合流（吉見町を含む）は武蔵漁協の区域（埼玉県共第2号）", source: SAITAMA_GROUND_2 },
  },
  // 中川・古利根川・元荒川下流・江戸川（埼玉東部）
  "furutonegawa-unagi": { coopId: "saitamatobu", evidence: FURUTONE },
  "furutone-kitakoshigaya6": { coopId: "saitamatobu", evidence: FURUTONE },
  "furutonego-kasukabe-a12": { coopId: "saitamatobu", evidence: FURUTONE },
  "nakagawa-koshigaya": { coopId: "saitamatobu", evidence: NAKAGAWA },
  "nakagawa-yoshikawa6": { coopId: "saitamatobu", evidence: NAKAGAWA },
  "satte-nakagawa-gongendo-a13": {
    coopId: "saitamatobu",
    evidence: NAKAGAWA,
    note: "権現堂川の中川合流点（越流堤）から上流200mは、通年遊漁禁止です。",
  },
  "koshigaya-motoarakawa-shirakobato-a13": {
    coopId: "saitamatobu",
    evidence: { text: "元荒川の慈恩寺橋から下流（越谷市を含む）は埼玉東部漁協の区域（埼玉県共第5号）", source: SAITAMA_GROUND_5 },
  },
  "edogawa-misato6": {
    coopId: "saitamatobu",
    evidence: { text: "埼玉県内の江戸川は東京都知事免許 内共第11号で、埼玉東部漁協などの区域（埼玉県の他都県免許漁場一覧）", source: SAITAMA_GROUND_OTHER },
    note: "江戸川は東京都知事免許の漁場で、料金・規則は上の表（中川などの共第5号）と異なります。江戸川の遊漁規則を確認してください。",
  },
  // 元荒川上流・利根川（埼玉県北部）
  "motoarakawa-hasuda": { coopId: "saitamahokubu", evidence: MOTOARA_HOKUBU },
  "motoarekawa-hasuda6": { coopId: "saitamahokubu", evidence: MOTOARA_HOKUBU },
  "tonegawa-kazo6": { coopId: "saitamahokubu", evidence: TONE_KAZO, note: TONE_KAZO_NOTE },
  "tonegawa-kazo-kitagawabe-a11": { coopId: "saitamahokubu", evidence: TONE_KAZO, note: TONE_KAZO_NOTE },
  "kazo-tonegawa-miraikan-a13": { coopId: "saitamahokubu", evidence: TONE_KAZO, note: TONE_KAZO_NOTE },
  "tonegawa-kurihashi": {
    coopId: "saitamahokubu",
    evidence: { text: "加須市飯積から茨城県境までの利根川（加須市・久喜市）は千葉県知事免許 内共第14号で、埼玉県北部漁協の区域（埼玉県の他都県免許漁場一覧）", source: SAITAMA_GROUND_OTHER },
    note: "栗橋付近は千葉県知事免許（内共第14号）の漁場で、料金・規則は上の表と異なります。漁協に確認してください。",
  },
  "kannako-lake-a11": {
    coopId: "kannagawa",
    evidence: { text: "埼玉県側の神流川は群馬県共第7号で神流川漁協の区域（埼玉県の他県知事免許漁場一覧 12-1）", source: SAITAMA_GROUND_OTHER },
  },
};
