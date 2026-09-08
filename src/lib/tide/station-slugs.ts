// 潮汐観測地点の URL slug と地域区分（/tides/[station] 用）
//
// 手動管理。slug は一度公開したら変更しないこと（URL資産・被リンクが壊れる）。
// 全239地点の網羅・一意性は __tests__/station-slugs.test.ts で担保する。
// クライアント安全（データのみ）。

export type TideRegion =
  | "hokkaido"
  | "tohoku"
  | "kanto"
  | "tokai"
  | "hokuriku"
  | "kinki"
  | "chugoku"
  | "shikoku"
  | "kyushu"
  | "nansei";

export const TIDE_REGION_LABELS: Record<TideRegion, string> = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東・伊豆諸島・小笠原",
  tokai: "東海",
  hokuriku: "北陸・信越・佐渡",
  kinki: "近畿",
  chugoku: "中国（山陽・山陰）",
  shikoku: "四国",
  kyushu: "九州",
  nansei: "沖縄・奄美",
};

export const TIDE_REGION_ORDER: TideRegion[] = [
  "hokkaido",
  "tohoku",
  "kanto",
  "tokai",
  "hokuriku",
  "kinki",
  "chugoku",
  "shikoku",
  "kyushu",
  "nansei",
];

export interface StationSlugEntry {
  slug: string;
  region: TideRegion;
}

export const STATION_SLUGS: Record<string, StationSlugEntry> = {
  // ── 北海道 ──
  WN: { slug: "wakkanai", region: "hokkaido" }, // 稚内
  KE: { slug: "esashi-okhotsk", region: "hokkaido" }, // 枝幸（江差ESと区別）
  A0: { slug: "monbetsu", region: "hokkaido" }, // 紋別
  AS: { slug: "abashiri", region: "hokkaido" }, // 網走
  A6: { slug: "rausu", region: "hokkaido" }, // 羅臼
  NM: { slug: "nemuro", region: "hokkaido" }, // 根室
  HN: { slug: "hanasaki", region: "hokkaido" }, // 花咲
  KP: { slug: "kiritappu", region: "hokkaido" }, // 霧多布
  KR: { slug: "kushiro", region: "hokkaido" }, // 釧路
  B1: { slug: "tokachi", region: "hokkaido" }, // 十勝
  A9: { slug: "urakawa", region: "hokkaido" }, // 浦河
  C8: { slug: "tomakomai-higashi", region: "hokkaido" }, // 苫小牧東
  TM: { slug: "tomakomai-nishi", region: "hokkaido" }, // 苫小牧西
  SO: { slug: "shiraoi", region: "hokkaido" }, // 白老
  A8: { slug: "muroran", region: "hokkaido" }, // 室蘭
  A3: { slug: "mori", region: "hokkaido" }, // 森
  HK: { slug: "hakodate", region: "hokkaido" }, // 函館
  Q0: { slug: "yoshioka", region: "hokkaido" }, // 吉岡
  A5: { slug: "matsumae", region: "hokkaido" }, // 松前
  ES: { slug: "esashi", region: "hokkaido" }, // 江差
  ZP: { slug: "okushiri", region: "hokkaido" }, // 奥尻
  OR: { slug: "okushiri-ko", region: "hokkaido" }, // 奥尻港
  SE: { slug: "setana", region: "hokkaido" }, // 瀬棚
  B6: { slug: "suttsu", region: "hokkaido" }, // 寿都
  B5: { slug: "iwanai", region: "hokkaido" }, // 岩内
  Z8: { slug: "oshoro", region: "hokkaido" }, // 忍路
  B3: { slug: "otaru", region: "hokkaido" }, // 小樽
  IK: { slug: "ishikari-shinko", region: "hokkaido" }, // 石狩新港
  B2: { slug: "rumoi", region: "hokkaido" }, // 留萌
  F3: { slug: "kutsugata", region: "hokkaido" }, // 沓形（利尻）
  // ── 東北 ──
  Q1: { slug: "tappi", region: "tohoku" }, // 竜飛
  AO: { slug: "aomori", region: "tohoku" }, // 青森
  ZA: { slug: "asamushi", region: "tohoku" }, // 浅虫
  Q2: { slug: "ominato", region: "tohoku" }, // 大湊
  B4: { slug: "oma", region: "tohoku" }, // 大間
  SH: { slug: "shimokita", region: "tohoku" }, // 下北
  XS: { slug: "mutsu-ogawara", region: "tohoku" }, // むつ小川原
  HG: { slug: "hachinohe", region: "tohoku" }, // 八戸港
  XT: { slug: "kuji", region: "tohoku" }, // 久慈
  MY: { slug: "miyako", region: "tohoku" }, // 宮古
  Q6: { slug: "kamaishi", region: "tohoku" }, // 釜石
  OF: { slug: "ofunato", region: "tohoku" }, // 大船渡
  AY: { slug: "ayukawa", region: "tohoku" }, // 鮎川
  E6: { slug: "ishinomaki", region: "tohoku" }, // 石巻
  SG: { slug: "shiogama", region: "tohoku" }, // 塩釜
  SD: { slug: "sendai-shinko", region: "tohoku" }, // 仙台新港
  ZM: { slug: "soma", region: "tohoku" }, // 相馬
  ON: { slug: "onahama", region: "tohoku" }, // 小名浜
  ZB: { slug: "nezugaseki", region: "tohoku" }, // 鼠ヶ関
  S9: { slug: "sakata", region: "tohoku" }, // 酒田
  ZQ: { slug: "tobishima", region: "tohoku" }, // 飛島
  S1: { slug: "akita", region: "tohoku" }, // 秋田
  S2: { slug: "funakawa", region: "tohoku" }, // 船川港
  ZI: { slug: "oga", region: "tohoku" }, // 男鹿
  FK: { slug: "fukaura", region: "tohoku" }, // 深浦
  // ── 関東・伊豆諸島・小笠原 ──
  D1: { slug: "hitachi", region: "kanto" }, // 日立
  D3: { slug: "oarai", region: "kanto" }, // 大洗
  D2: { slug: "kashima", region: "kanto" }, // 鹿島
  CS: { slug: "choshi", region: "kanto" }, // 銚子漁港
  ZF: { slug: "katsuura", region: "kanto" }, // 勝浦
  MR: { slug: "mera", region: "kanto" }, // 布良
  TT: { slug: "tateyama", region: "kanto" }, // 館山
  KZ: { slug: "kisarazu", region: "kanto" }, // 木更津
  QL: { slug: "chiba", region: "kanto" }, // 千葉
  CB: { slug: "chiba-ko", region: "kanto" }, // 千葉港
  TK: { slug: "tokyo", region: "kanto" }, // 東京
  KW: { slug: "kawasaki", region: "kanto" }, // 川崎
  YK: { slug: "keihin", region: "kanto" }, // 京浜港
  QS: { slug: "yokohama", region: "kanto" }, // 横浜
  HM: { slug: "honmoku", region: "kanto" }, // 本牧
  QN: { slug: "yokosuka", region: "kanto" }, // 横須賀
  Z1: { slug: "aburatsubo", region: "kanto" }, // 油壺
  OK: { slug: "okada", region: "kanto" }, // 岡田（大島）
  QO: { slug: "kozushima", region: "kanto" }, // 神津島
  MJ: { slug: "miyakejima-tsubota", region: "kanto" }, // 三宅島（坪田）
  QP: { slug: "miyakejima-ako", region: "kanto" }, // 三宅島（阿古）
  D4: { slug: "hachijojima-yaene", region: "kanto" }, // 八丈島（八重根）
  QQ: { slug: "hachijojima-kaminato", region: "kanto" }, // 八丈島（神湊）
  CC: { slug: "chichijima", region: "kanto" }, // 父島
  MC: { slug: "minamitorishima", region: "kanto" }, // 南鳥島
  D8: { slug: "shonan", region: "kanto" }, // 湘南港
  OD: { slug: "odawara", region: "kanto" }, // 小田原
  // ── 東海 ──
  Z3: { slug: "ito", region: "tokai" }, // 伊東
  D6: { slug: "shimoda", region: "tokai" }, // 下田
  QK: { slug: "minamiizu", region: "tokai" }, // 南伊豆
  G9: { slug: "irozaki", region: "tokai" }, // 石廊崎
  Z4: { slug: "tago", region: "tokai" }, // 田子
  UC: { slug: "uchiura", region: "tokai" }, // 内浦
  SM: { slug: "shimizu", region: "tokai" }, // 清水港
  Z5: { slug: "yaizu", region: "tokai" }, // 焼津
  OM: { slug: "omaezaki", region: "tokai" }, // 御前崎
  MI: { slug: "maisaka", region: "tokai" }, // 舞阪
  I4: { slug: "akabane", region: "tokai" }, // 赤羽根
  G4: { slug: "mikawa", region: "tokai" }, // 三河
  G5: { slug: "katahara", region: "tokai" }, // 形原
  G8: { slug: "kinuura", region: "tokai" }, // 衣浦
  ZD: { slug: "onizaki", region: "tokai" }, // 鬼崎
  NG: { slug: "nagoya", region: "tokai" }, // 名古屋
  G3: { slug: "yokkaichi", region: "tokai" }, // 四日市港
  TB: { slug: "toba", region: "tokai" }, // 鳥羽
  OW: { slug: "owase", region: "tokai" }, // 尾鷲
  KN: { slug: "kumano", region: "tokai" }, // 熊野
  // ── 北陸・信越・佐渡 ──
  XM: { slug: "tsuruga", region: "hokuriku" }, // 敦賀
  ZG: { slug: "mikuni", region: "hokuriku" }, // 三国
  T1: { slug: "kanazawa", region: "hokuriku" }, // 金沢
  Z7: { slug: "wajima", region: "hokuriku" }, // 輪島
  SZ: { slug: "noto", region: "hokuriku" }, // 能登
  XO: { slug: "nanao", region: "hokuriku" }, // 七尾
  XQ: { slug: "fushikitoyama", region: "hokuriku" }, // 伏木富山
  SN: { slug: "shinminato", region: "hokuriku" }, // 新湊
  TY: { slug: "toyama", region: "hokuriku" }, // 富山
  I7: { slug: "ikuji", region: "hokuriku" }, // 生地
  T3: { slug: "naoetsu", region: "hokuriku" }, // 直江津
  ZC: { slug: "kashiwazaki", region: "hokuriku" }, // 柏崎
  S6: { slug: "niigata-nishiko", region: "hokuriku" }, // 新潟西港
  I5: { slug: "niigata-higashiko", region: "hokuriku" }, // 新潟東港
  ZN: { slug: "ogi", region: "hokuriku" }, // 小木
  RZ: { slug: "ryotsu", region: "hokuriku" }, // 両津
  S0: { slug: "sado", region: "hokuriku" }, // 佐渡
  QR: { slug: "awashima", region: "hokuriku" }, // 粟島
  // ── 近畿 ──
  UR: { slug: "uragami", region: "kinki" }, // 浦神
  KS: { slug: "kushimoto", region: "kinki" }, // 串本
  SR: { slug: "shirahama", region: "kinki" }, // 白浜
  GB: { slug: "gobo", region: "kinki" }, // 御坊
  H1: { slug: "shimotsu", region: "kinki" }, // 下津
  Z9: { slug: "kainan", region: "kinki" }, // 海南
  WY: { slug: "wakayama", region: "kinki" }, // 和歌山
  TN: { slug: "tannowa", region: "kinki" }, // 淡輪
  KK: { slug: "kanku", region: "kinki" }, // 関空島
  J2: { slug: "kishiwada", region: "kinki" }, // 岸和田
  IO: { slug: "izumiotsu", region: "kinki" }, // 泉大津
  SI: { slug: "sakai", region: "kinki" }, // 堺
  OS: { slug: "osaka", region: "kinki" }, // 大阪
  AM: { slug: "amagasaki", region: "kinki" }, // 尼崎
  J5: { slug: "nishinomiya", region: "kinki" }, // 西宮
  KB: { slug: "kobe", region: "kinki" }, // 神戸
  AK: { slug: "akashi", region: "kinki" }, // 明石
  ST: { slug: "sumoto", region: "kinki" }, // 洲本
  EI: { slug: "ei", region: "kinki" }, // 江井
  K1: { slug: "himeji-shikama", region: "kinki" }, // 姫路（飾磨）
  T6: { slug: "tsuiyama", region: "kinki" }, // 津居山
  T2: { slug: "miyazu", region: "kinki" }, // 宮津
  MZ: { slug: "maizuru", region: "kinki" }, // 舞鶴
  // ── 中国（山陽・山陰） ──
  SB: { slug: "sanban", region: "chugoku" }, // 三蟠
  UN: { slug: "uno", region: "chugoku" }, // 宇野
  MM: { slug: "mizushima", region: "chugoku" }, // 水島
  LG: { slug: "otoshima", region: "chugoku" }, // 乙島
  IZ: { slug: "itozaki", region: "chugoku" }, // 糸崎
  TH: { slug: "takehara", region: "chugoku" }, // 竹原
  Q9: { slug: "kure", region: "chugoku" }, // 呉
  Q8: { slug: "hiroshima", region: "chugoku" }, // 広島
  QA: { slug: "tokuyama", region: "chugoku" }, // 徳山
  J9: { slug: "mitajiri", region: "chugoku" }, // 三田尻
  WH: { slug: "ube", region: "chugoku" }, // 宇部
  CF: { slug: "chofu", region: "chugoku" }, // 長府
  A1: { slug: "deshimachi", region: "chugoku" }, // 弟子待
  TI: { slug: "tanokubi", region: "chugoku" }, // 田ノ首
  OH: { slug: "oyamanohana", region: "chugoku" }, // 大山の鼻
  HR: { slug: "haedomari", region: "chugoku" }, // 南風泊
  K5: { slug: "hagi", region: "chugoku" }, // 萩
  ZK: { slug: "susa", region: "chugoku" }, // 須佐
  HA: { slug: "hamada", region: "chugoku" }, // 浜田
  SK: { slug: "sakaiminato", region: "chugoku" }, // 境
  SA: { slug: "saigo", region: "chugoku" }, // 西郷（隠岐）
  ZE: { slug: "tajiri", region: "chugoku" }, // 田後
  // ── 四国 ──
  MT: { slug: "matsuyama", region: "shikoku" }, // 松山
  M3: { slug: "hashihama", region: "shikoku" }, // 波止浜
  M0: { slug: "imabari-oshima", region: "shikoku" }, // 今治市小島
  M1: { slug: "kurushima", region: "shikoku" }, // 来島航路
  L0: { slug: "imabari", region: "shikoku" }, // 今治
  NI: { slug: "niihama", region: "shikoku" }, // 新居浜
  L8: { slug: "iyomishima", region: "shikoku" }, // 伊予三島
  TX: { slug: "tadotsu", region: "shikoku" }, // 多度津
  AX: { slug: "aoki", region: "shikoku" }, // 青木
  J8: { slug: "yoshima", region: "shikoku" }, // 与島
  TA: { slug: "takamatsu", region: "shikoku" }, // 高松
  KM: { slug: "komatsushima", region: "shikoku" }, // 小松島
  J6: { slug: "tachibana", region: "shikoku" }, // 橘
  AW: { slug: "awa-yuki", region: "shikoku" }, // 阿波由岐
  HW: { slug: "hiwasa", region: "shikoku" }, // 日和佐
  L7: { slug: "kannoura", region: "shikoku" }, // 甲浦
  MU: { slug: "murotomisaki", region: "shikoku" }, // 室戸岬
  KC: { slug: "kochi", region: "shikoku" }, // 高知
  V7: { slug: "susaki", region: "shikoku" }, // 須崎
  ZH: { slug: "kure-kochi", region: "shikoku" }, // 久礼（呉Q9と区別）
  L6: { slug: "kochi-shimoda", region: "shikoku" }, // 高知下田
  TS: { slug: "tosashimizu", region: "shikoku" }, // 土佐清水
  SU: { slug: "katashima", region: "shikoku" }, // 片島
  UW: { slug: "uwajima", region: "shikoku" }, // 宇和島
  // ── 九州 ──
  N1: { slug: "hiagari", region: "kyushu" }, // 日明
  N0: { slug: "sunatsu", region: "kyushu" }, // 砂津
  MO: { slug: "moji", region: "kyushu" }, // 門司
  AH: { slug: "aohama", region: "kyushu" }, // 青浜
  O3: { slug: "kanda", region: "kyushu" }, // 苅田
  BP: { slug: "beppu", region: "kyushu" }, // 別府
  QC: { slug: "oita", region: "kyushu" }, // 大分
  X5: { slug: "saiki", region: "kyushu" }, // 佐伯
  Z6: { slug: "hososhima", region: "kyushu" }, // 細島
  MG: { slug: "miyazaki", region: "kyushu" }, // 宮崎
  AB: { slug: "aburatsu", region: "kyushu" }, // 油津
  X6: { slug: "shibushi", region: "kyushu" }, // 志布志
  QG: { slug: "odomari", region: "kyushu" }, // 大泊
  KG: { slug: "kagoshima", region: "kyushu" }, // 鹿児島
  MK: { slug: "makurazaki", region: "kyushu" }, // 枕崎
  ZJ: { slug: "akune", region: "kyushu" }, // 阿久根
  QH: { slug: "nishinoomote", region: "kyushu" }, // 西之表
  TJ: { slug: "tanegashima", region: "kyushu" }, // 種子島
  O7: { slug: "minamata", region: "kyushu" }, // 水俣
  O5: { slug: "yatsushiro", region: "kyushu" }, // 八代
  HS: { slug: "hondoseto", region: "kyushu" }, // 本渡瀬戸
  RH: { slug: "reihoku", region: "kyushu" }, // 苓北
  MS: { slug: "misumi", region: "kyushu" }, // 三角
  KU: { slug: "kumamoto", region: "kyushu" }, // 熊本
  O6: { slug: "omuta", region: "kyushu" }, // 大牟田
  OU: { slug: "oura", region: "kyushu" }, // 大浦
  KT: { slug: "kuchinotsu", region: "kyushu" }, // 口之津
  NS: { slug: "nagasaki", region: "kyushu" }, // 長崎
  KO: { slug: "kogo", region: "kyushu" }, // 皇后
  FE: { slug: "fukue", region: "kyushu" }, // 福江
  QD: { slug: "sasebo", region: "kyushu" }, // 佐世保
  X2: { slug: "hiradoseto", region: "kyushu" }, // 平戸瀬戸
  ZL: { slug: "kariya", region: "kyushu" }, // 仮屋
  KA: { slug: "karatsu", region: "kyushu" }, // 唐津
  QF: { slug: "hakata", region: "kyushu" }, // 博多
  X3: { slug: "gonoura", region: "kyushu" }, // 郷ノ浦（壱岐）
  QE: { slug: "izuhara", region: "kyushu" }, // 厳原
  O1: { slug: "tsushima", region: "kyushu" }, // 対馬
  N5: { slug: "hitakatsu", region: "kyushu" }, // 対馬比田勝
  // ── 沖縄・奄美 ──
  QI: { slug: "nakanoshima", region: "nansei" }, // 中之島（トカラ）
  QJ: { slug: "naze", region: "nansei" }, // 名瀬
  O9: { slug: "amami", region: "nansei" }, // 奄美
  NK: { slug: "nakagusuku", region: "nansei" }, // 中城湾港
  ZO: { slug: "okinawa", region: "nansei" }, // 沖縄
  NH: { slug: "naha", region: "nansei" }, // 那覇
  DJ: { slug: "minamidaito", region: "nansei" }, // 南大東
  R1: { slug: "hirara", region: "nansei" }, // 平良（宮古島）
  IS: { slug: "ishigaki", region: "nansei" }, // 石垣
  IJ: { slug: "iriomote", region: "nansei" }, // 西表
  YJ: { slug: "yonaguni", region: "nansei" }, // 与那国
};

/** slug → 地点code の逆引き */
export const CODE_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(STATION_SLUGS).map(([code, e]) => [e.slug, code]),
);

export function getStationSlug(code: string): string | null {
  return STATION_SLUGS[code]?.slug ?? null;
}
