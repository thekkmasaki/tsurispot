import type { FishRegionalAptitude } from "../types";

/**
 * 淡水魚（fish-freshwater.ts の27種）の地域適性。
 * 淡水魚は地形ゲート（海系spotType=0）が主役のため、地域適性は
 * 「本当に分布しない地域」を0にする程度の粗い指定で足りる。
 * 値の意味・解決順は ../types.ts を参照。
 */
export const freshwaterAptitude: Record<string, FishRegionalAptitude> = {
  nijimasu: {
    default: 2,
    regionOverrides: { hokkaido: 4 },
    prefectureOverrides: {
      tochigi: 3, // 中禅寺湖ほか管理釣り場が集中
      gunma: 3,
      nagano: 3,
      okinawa: 1,
    },
    rationale:
      "ニジマスは全国の管理釣り場・放流河川で釣れる導入種で、自然繁殖が広がる北海道は湖沼・河川とも野生個体が狙える特筆フィールド。管理釣り場が集中する北関東・長野も実績が厚い。亜熱帯の沖縄は通年営業のマス釣り場がなく境界域。",
    sources: [
      "管理釣り場・放流河川の釣り実績",
      "北海道の内水面資料（ニジマス自然繁殖）",
    ],
  },
  houraimasu: {
    default: 1,
    prefectureOverrides: { aichi: 3 },
    rationale:
      "ホウライマスは愛知県水産試験場が育成した無斑ニジマスで、発祥地の愛知（豊田・鳳来地区の管理釣り場や放流河川）が本場。県外では一部の管理釣り場に放流されるのみでまれ。",
    sources: [
      "愛知県水産試験場資料（ホウライマス）",
      "管理釣り場の放流情報",
    ],
  },
  yamame: {
    default: 3,
    regionOverrides: { kinki: 2, chugoku: 2, shikoku: 1, kyushu: 2 },
    prefectureOverrides: { okinawa: 0 },
    rationale:
      "ヤマメは東日本と日本海側の渓流釣りの主役で、北海道（ヤマベ）・東北・関東の山地河川に実績が厚い。西日本ではアマゴとすみ分け、近畿以西は日本海側と九州の一部に分布が偏り、四国はアマゴ域のため放流の一部にとどまる。沖縄には生息しない。",
    sources: [
      "内水面漁協の放流・遊漁情報（ヤマメ）",
      "魚類図鑑的分布情報（ヤマメ・アマゴのすみ分け）",
    ],
  },
  tenagaebi: {
    default: 2,
    regionOverrides: { hokkaido: 0, kanto: 3, kinki: 3 },
    rationale:
      "テナガエビは本州以南の河川下流・汽水域に分布し、初夏の小物釣りとして利根川・江戸川・多摩川・淀川など大都市河川と霞ヶ浦・琵琶湖に実績が厚い。沖縄では別種の大型テナガエビ類が釣れる。北海道には分布しない。",
    sources: [
      "内水面漁業生産統計調査（えび類・霞ヶ浦/琵琶湖）",
      "都市河川のテナガエビ釣り実績",
    ],
  },
  blackbass: {
    default: 3,
    regionOverrides: { hokkaido: 1 },
    prefectureOverrides: {
      shiga: 4, // 琵琶湖
      ibaraki: 4, // 霞ヶ浦・北浦
      okinawa: 2,
    },
    rationale:
      "オオクチバスは全国の湖沼・ため池・河川に定着した国内最大級のルアーターゲットで、琵琶湖と霞ヶ浦・北浦が二大メッカ。北海道は防除により定着がほぼなく境界域。沖縄はダム湖に定着している。",
    sources: [
      "バス釣り実績（琵琶湖・霞ヶ浦ほか全国）",
      "国立環境研究所 侵入生物データベース（オオクチバス分布）",
    ],
  },
  bluegill: {
    default: 2,
    regionOverrides: { hokkaido: 0 },
    prefectureOverrides: { shiga: 3, okinawa: 2 },
    rationale:
      "ブルーギルは本州以南のため池・湖沼・平野河川に広く定着し、ウキ釣りの手軽な入門ターゲット。個体数の多い琵琶湖は実績が厚い。北海道では定着が確認されていない。",
    sources: [
      "国立環境研究所 侵入生物データベース（ブルーギル分布）",
      "ため池・湖沼の小物釣り実績",
    ],
  },
  namazu: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    prefectureOverrides: {
      aichi: 3, // ナマズゲーム発祥の濃尾平野
      gifu: 3,
      okinawa: 0,
    },
    rationale:
      "マナマズは本州〜九州の平野河川・用水路に広く分布する夜行性のルアーターゲットで、ナマズゲーム発祥の濃尾平野（愛知・岐阜）が本場。北海道は移入により道南等に定着した境界域で、沖縄には分布しない。",
    sources: [
      "ナマズルアーゲーム実績（濃尾平野ほか）",
      "魚類図鑑的分布情報（マナマズ・分布域）",
    ],
  },
  koi: {
    default: 3,
    regionOverrides: { hokkaido: 2 },
    prefectureOverrides: { okinawa: 2 },
    rationale:
      "コイは全国の河川中下流・湖沼・公園池に広く定着し、吸い込み釣り・パンコイなど身近な大物釣りの代表格。地域差は小さいが、寒冷な北海道と河川の短い沖縄ではやや実績が薄い。",
    sources: [
      "内水面漁業生産統計調査（こい）",
      "河川・湖沼のコイ釣り実績",
    ],
  },
  herabuna: {
    default: 2,
    regionOverrides: { hokkaido: 1, kanto: 3, kinki: 3 },
    prefectureOverrides: {
      shiga: 4, // 原産地・琵琶湖
      saitama: 4, // ヘラ管理池が全国屈指の密度
      ibaraki: 3,
      okinawa: 1,
    },
    rationale:
      "ヘラブナ（ゲンゴロウブナ）は琵琶湖原産で全国の湖沼・釣り堀に放流され、原産地の琵琶湖・淀川水系と、管理池が集中する埼玉や霞ヶ浦周辺など関東が文化的本場。北海道・沖縄は釣り場がごく限られる。",
    sources: [
      "内水面漁業生産統計調査（ふな類）",
      "ヘラブナ管理釣り場情報（埼玉・関東・関西）",
    ],
  },
  wakasagi: {
    default: 2,
    regionOverrides: {
      hokkaido: 4,
      tohoku: 3,
      kanto: 3,
      chubu: 3,
      chugoku: 1,
      shikoku: 1,
      kyushu: 1,
    },
    prefectureOverrides: { okinawa: 0 },
    rationale:
      "ワカサギは結氷湖の氷上穴釣りが名物の北日本と、霞ヶ浦・山中湖・榛名湖・諏訪湖・野尻湖などドーム船・ボート釣り場の集まる関東甲信が本場。西日本は放流湖沼が少なく中国・四国・九州はまれで、温暖な沖縄には生息しない。",
    sources: [
      "内水面漁業生産統計調査（わかさぎ・霞ヶ浦ほか）",
      "氷上・ドーム船ワカサギ釣り場情報",
    ],
  },
  iwana: {
    default: 3,
    regionOverrides: { kinki: 2, chugoku: 1, shikoku: 1, kyushu: 1 },
    prefectureOverrides: { okinawa: 0 },
    rationale:
      "イワナは東日本の渓流最上流の主役で、北海道（エゾイワナ・オショロコマ）・東北・北アルプスなど中部山岳の実績が厚い。西日本では紀伊半島・中国山地の源流に限られ、四国・九州は放流由来がわずかに定着するのみ。沖縄には生息しない。",
    sources: [
      "内水面漁協の放流・遊漁情報（イワナ）",
      "魚類図鑑的分布情報（イワナ属・分布南限）",
    ],
  },
  amago: {
    default: 2,
    regionOverrides: {
      hokkaido: 0,
      tohoku: 0,
      kanto: 1,
      chubu: 3,
      kinki: 3,
      shikoku: 3,
      kyushu: 1,
    },
    prefectureOverrides: { okinawa: 0 },
    rationale:
      "アマゴは西日本の渓流釣りの主役で、静岡・岐阜など東海と紀伊半島・四国の実績が厚い。自然分布は神奈川以西の太平洋側・瀬戸内周辺で、関東は東限の境界域。日本海側と九州の大半はヤマメ域にあたり、東北以北・沖縄には分布しない。",
    sources: [
      "内水面漁協の放流・遊漁情報（アマゴ）",
      "魚類図鑑的分布情報（ヤマメ・アマゴのすみ分け）",
    ],
  },
  ayu: {
    default: 3,
    regionOverrides: { hokkaido: 1 },
    prefectureOverrides: {
      gifu: 4, // 長良川
      tochigi: 4, // 那珂川
      okinawa: 1, // リュウキュウアユは保護対象
    },
    rationale:
      "アユは全国の清流で友釣り・遊漁の中心となる魚で、長良川を擁する岐阜と、遊漁承認数全国屈指の那珂川を擁する栃木が特筆。北海道は道南が分布北限の境界域。沖縄のリュウキュウアユは絶滅危惧で保護されており釣りの対象にならない。",
    sources: [
      "内水面漁業生産統計調査（あゆ）",
      "友釣り実績（長良川・那珂川ほか）",
    ],
  },
  oikawa: {
    default: 2,
    regionOverrides: { hokkaido: 0 },
    prefectureOverrides: { aomori: 1, okinawa: 0 },
    rationale:
      "オイカワは本州・四国・九州の平野河川に広く分布する小物釣りの定番で、毛鉤やピストン釣りで手軽に狙える。東北北部は移入由来で個体数が少ない境界域。北海道・沖縄には分布しない。",
    sources: [
      "河川の小物釣り実績（オイカワ）",
      "魚類図鑑的分布情報（オイカワ・分布域）",
    ],
  },
  dojou: {
    default: 2,
    prefectureOverrides: { okinawa: 1 },
    rationale:
      "ドジョウは全国の水田・用水路・小川に分布し、ミミズ餌の小物釣りで狙える身近な魚。北海道にも広く生息し地域差は小さい。沖縄は生息地が限られ、まれ。",
    sources: [
      "内水面漁業生産統計調査（どじょう）",
      "魚類図鑑的分布情報（ドジョウ・分布域）",
    ],
  },
  tanago: {
    default: 2,
    regionOverrides: { hokkaido: 0, kanto: 3, shikoku: 1 },
    prefectureOverrides: {
      ibaraki: 4, // 霞ヶ浦・北浦・小貝川はタナゴ釣りの聖地
      shiga: 3,
      okinawa: 0,
    },
    rationale:
      "タナゴ類は江戸前の小物釣り文化を受け継ぐターゲットで、霞ヶ浦・北浦や小貝川など茨城を中心とする関東平野の水郷が聖地。琵琶湖水系も種類・実績が豊富。四国は分布種が少なく、北海道・沖縄にはタナゴ類が分布しない。",
    sources: [
      "タナゴ釣り実績（霞ヶ浦・小貝川・琵琶湖）",
      "魚類図鑑的分布情報（タナゴ亜科・分布域）",
    ],
  },
  raigyo: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    prefectureOverrides: {
      saga: 4, // 佐賀平野のクリークは全国区の聖地
      aomori: 1,
      okinawa: 2, // タイワンドジョウ類
    },
    rationale:
      "ライギョ（カムルチー）は本州以南のため池・クリーク・平野河川に定着したフロッグゲームの対象で、水路網が発達した佐賀平野のクリークは全国区の聖地。東北北部・北海道は定着がごく一部の境界域。沖縄では近縁のタイワンドジョウ類が釣れる。",
    sources: [
      "雷魚フロッグゲーム実績（佐賀クリークほか）",
      "国立環境研究所 侵入生物データベース（カムルチー分布）",
    ],
  },
  hasu: {
    default: 1,
    regionOverrides: { hokkaido: 0, tohoku: 0 },
    prefectureOverrides: {
      shiga: 4, // 原産地・琵琶湖
      kyoto: 3, // 瀬田川〜宇治川
      osaka: 2, // 淀川
      fukui: 2, // 三方五湖に移入定着
      ibaraki: 2, // 霞ヶ浦に移入定着
      okinawa: 0,
    },
    rationale:
      "ハスは琵琶湖・淀川水系原産の日本唯一のコイ科純魚食魚で、本場の琵琶湖と流出する宇治川・淀川、移入定着した三方五湖・霞ヶ浦に実績がある。他地域では鮎放流への混入で散発的に釣れる程度で、北海道・東北・沖縄には分布しない。",
    sources: [
      "琵琶湖のハス釣り実績（滋賀県水産資料）",
      "魚類図鑑的分布情報（ハス・移入分布）",
    ],
  },
  itou: {
    default: 0,
    prefectureOverrides: { hokkaido: 3 },
    rationale:
      "イトウは日本では北海道のみに生息する最大級の淡水魚で、猿払川・天塩川など道北の河川・湖沼がルアー釣りの聖地。本州以南には生息しない（青森の記録は過去のもの）。",
    sources: [
      "北海道のイトウ釣り実績（猿払・天塩）",
      "環境省レッドリスト・魚類図鑑的分布情報（イトウ）",
    ],
  },
  "biwako-oonamazu": {
    default: 0,
    prefectureOverrides: { shiga: 4, kyoto: 1 },
    rationale:
      "ビワコオオナマズは琵琶湖・淀川水系固有の日本最大級のナマズで、釣りの実績は琵琶湖本湖と瀬田川に集中する。下流の宇治川でもまれに釣獲記録がある。それ以外の水系には生息しない。",
    sources: [
      "琵琶湖のオオナマズルアー釣り実績",
      "滋賀県水産資料（琵琶湖固有種）",
    ],
  },
  biwamasu: {
    default: 0,
    prefectureOverrides: { shiga: 4 },
    rationale:
      "ビワマスは琵琶湖固有のサケ科魚で、レイクトローリングを中心に琵琶湖本湖のみで狙える。流入河川は産卵保護のため禁漁。他水系には自然分布しない。",
    sources: [
      "滋賀県水産資料（ビワマス・遊漁ルール）",
      "琵琶湖レイクトローリング実績",
    ],
  },
  "brown-trout": {
    default: 1,
    regionOverrides: { hokkaido: 4 },
    prefectureOverrides: {
      tochigi: 3, // 中禅寺湖
      nagano: 3, // 犀川・梓川
      kanagawa: 2, // 芦ノ湖
      yamanashi: 2, // 本栖湖・河口湖
      okinawa: 0,
    },
    rationale:
      "ブラウントラウトは欧州原産の移入マスで、自然繁殖が広がる北海道の河川・湖沼が国内随一のフィールド。本州では中禅寺湖・犀川・芦ノ湖・本栖湖など定着湖沼と一部河川、管理釣り場で狙える程度。沖縄には生息しない。",
    sources: [
      "国立環境研究所 侵入生物データベース（ブラウントラウト）",
      "北海道・中禅寺湖・犀川の釣り実績",
    ],
  },
  ugui: {
    default: 2,
    regionOverrides: { hokkaido: 3 },
    prefectureOverrides: { miyazaki: 1, kagoshima: 1, okinawa: 0 },
    rationale:
      "ウグイは全国の河川に広く分布する定番の小物〜中型魚で、降海型も交じる北海道・東北は魚影がとくに濃い。九州南部は分布の南限域でまれになり、沖縄には分布しない。",
    sources: [
      "内水面漁業生産統計調査（うぐい）",
      "魚類図鑑的分布情報（ウグイ・分布域）",
    ],
  },
  kawamutsu: {
    default: 2,
    regionOverrides: {
      hokkaido: 0,
      tohoku: 1,
      kinki: 3,
      chugoku: 3,
      shikoku: 3,
      kyushu: 3,
    },
    prefectureOverrides: { okinawa: 0 },
    rationale:
      "カワムツは西日本の中小河川で最も身近な小物釣りターゲットで、近畿以西では淵や淀みのウキ釣りで数釣りできる。関東・中部へは移入で定着。東北は記録が少ない境界域で、北海道・沖縄には分布しない。",
    sources: [
      "西日本の小物釣り実績（カワムツ）",
      "魚類図鑑的分布情報（カワムツ・自然分布と移入）",
    ],
  },
  mabuna: {
    default: 2,
    regionOverrides: { kanto: 3 },
    prefectureOverrides: { okinawa: 1 },
    rationale:
      "マブナ（ギンブナ等）は北海道から九州まで全国の小川・水路・湖沼に分布する和の小物釣りの代表格で、手賀沼・霞ヶ浦周辺など小ブナ釣り文化の残る関東の水郷は実績が厚い。沖縄は移入でまれ。",
    sources: [
      "内水面漁業生産統計調査（ふな類）",
      "小ブナ釣り実績（関東水郷）",
    ],
  },
  himemasu: {
    default: 0,
    prefectureOverrides: {
      hokkaido: 3, // 支笏湖・阿寒湖・チミケップ湖
      aomori: 2, // 十和田湖
      akita: 2, // 十和田湖
      tochigi: 2, // 中禅寺湖
      yamanashi: 2, // 西湖・本栖湖
      kanagawa: 1, // 芦ノ湖（放流量が少ない）
    },
    rationale:
      "ヒメマスは支笏湖・阿寒湖など北海道の湖と、移殖された十和田湖（青森・秋田）・中禅寺湖（栃木）・西湖・本栖湖（山梨）などの湖沼でのみ狙える陸封ベニザケ。芦ノ湖にも放流があるがまれ。河川や他の湖には生息しない。",
    sources: [
      "各湖の遊漁規則・ヒメマス釣り実績（支笏湖・十和田湖・中禅寺湖・西湖）",
      "魚類図鑑的分布情報（ヒメマス移殖史）",
    ],
  },
  unagi: {
    default: 2,
    regionOverrides: { hokkaido: 1 },
    prefectureOverrides: {
      ibaraki: 3, // 利根川・霞ヶ浦
      chiba: 3, // 利根川
      shizuoka: 3, // 浜名湖
      aichi: 3, // 三河
      kochi: 3, // 四万十川
      miyazaki: 3,
      kagoshima: 3,
    },
    rationale:
      "ニホンウナギは全国の河川中下流・汽水域でぶっこみ釣りの対象となり、利根川・浜名湖・三河・四万十川・宮崎・鹿児島など太平洋側の実績が厚い。北海道は道南を北限とする境界域。沖縄はオオウナギ交じりで狙える。",
    sources: [
      "内水面漁業生産統計調査（うなぎ・県別）",
      "河川のぶっこみ釣り実績（利根川・浜名湖ほか）",
    ],
  },
};
