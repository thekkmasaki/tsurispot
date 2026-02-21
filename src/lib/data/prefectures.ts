export interface Prefecture {
  slug: string;
  name: string;
  nameShort: string;
  regionGroup: string;
}

export const prefectures: Prefecture[] = [
  // 北海道
  { slug: "hokkaido", name: "北海道", nameShort: "北海道", regionGroup: "北海道" },
  // 東北
  { slug: "aomori", name: "青森県", nameShort: "青森", regionGroup: "東北" },
  { slug: "iwate", name: "岩手県", nameShort: "岩手", regionGroup: "東北" },
  { slug: "miyagi", name: "宮城県", nameShort: "宮城", regionGroup: "東北" },
  { slug: "akita", name: "秋田県", nameShort: "秋田", regionGroup: "東北" },
  { slug: "yamagata", name: "山形県", nameShort: "山形", regionGroup: "東北" },
  { slug: "fukushima", name: "福島県", nameShort: "福島", regionGroup: "東北" },
  // 関東
  { slug: "ibaraki", name: "茨城県", nameShort: "茨城", regionGroup: "関東" },
  { slug: "tochigi", name: "栃木県", nameShort: "栃木", regionGroup: "関東" },
  { slug: "gunma", name: "群馬県", nameShort: "群馬", regionGroup: "関東" },
  { slug: "saitama", name: "埼玉県", nameShort: "埼玉", regionGroup: "関東" },
  { slug: "chiba", name: "千葉県", nameShort: "千葉", regionGroup: "関東" },
  { slug: "tokyo", name: "東京都", nameShort: "東京", regionGroup: "関東" },
  { slug: "kanagawa", name: "神奈川県", nameShort: "神奈川", regionGroup: "関東" },
  // 中部
  { slug: "niigata", name: "新潟県", nameShort: "新潟", regionGroup: "中部" },
  { slug: "toyama", name: "富山県", nameShort: "富山", regionGroup: "中部" },
  { slug: "ishikawa", name: "石川県", nameShort: "石川", regionGroup: "中部" },
  { slug: "fukui", name: "福井県", nameShort: "福井", regionGroup: "中部" },
  { slug: "yamanashi", name: "山梨県", nameShort: "山梨", regionGroup: "中部" },
  { slug: "nagano", name: "長野県", nameShort: "長野", regionGroup: "中部" },
  { slug: "gifu", name: "岐阜県", nameShort: "岐阜", regionGroup: "中部" },
  { slug: "shizuoka", name: "静岡県", nameShort: "静岡", regionGroup: "中部" },
  { slug: "aichi", name: "愛知県", nameShort: "愛知", regionGroup: "中部" },
  // 近畿
  { slug: "mie", name: "三重県", nameShort: "三重", regionGroup: "近畿" },
  { slug: "shiga", name: "滋賀県", nameShort: "滋賀", regionGroup: "近畿" },
  { slug: "kyoto", name: "京都府", nameShort: "京都", regionGroup: "近畿" },
  { slug: "osaka", name: "大阪府", nameShort: "大阪", regionGroup: "近畿" },
  { slug: "hyogo", name: "兵庫県", nameShort: "兵庫", regionGroup: "近畿" },
  { slug: "nara", name: "奈良県", nameShort: "奈良", regionGroup: "近畿" },
  { slug: "wakayama", name: "和歌山県", nameShort: "和歌山", regionGroup: "近畿" },
  // 中国
  { slug: "tottori", name: "鳥取県", nameShort: "鳥取", regionGroup: "中国" },
  { slug: "shimane", name: "島根県", nameShort: "島根", regionGroup: "中国" },
  { slug: "okayama", name: "岡山県", nameShort: "岡山", regionGroup: "中国" },
  { slug: "hiroshima", name: "広島県", nameShort: "広島", regionGroup: "中国" },
  { slug: "yamaguchi", name: "山口県", nameShort: "山口", regionGroup: "中国" },
  // 四国
  { slug: "tokushima", name: "徳島県", nameShort: "徳島", regionGroup: "四国" },
  { slug: "kagawa", name: "香川県", nameShort: "香川", regionGroup: "四国" },
  { slug: "ehime", name: "愛媛県", nameShort: "愛媛", regionGroup: "四国" },
  { slug: "kochi", name: "高知県", nameShort: "高知", regionGroup: "四国" },
  // 九州・沖縄
  { slug: "fukuoka", name: "福岡県", nameShort: "福岡", regionGroup: "九州・沖縄" },
  { slug: "saga", name: "佐賀県", nameShort: "佐賀", regionGroup: "九州・沖縄" },
  { slug: "nagasaki", name: "長崎県", nameShort: "長崎", regionGroup: "九州・沖縄" },
  { slug: "kumamoto", name: "熊本県", nameShort: "熊本", regionGroup: "九州・沖縄" },
  { slug: "oita", name: "大分県", nameShort: "大分", regionGroup: "九州・沖縄" },
  { slug: "miyazaki", name: "宮崎県", nameShort: "宮崎", regionGroup: "九州・沖縄" },
  { slug: "kagoshima", name: "鹿児島県", nameShort: "鹿児島", regionGroup: "九州・沖縄" },
  { slug: "okinawa", name: "沖縄県", nameShort: "沖縄", regionGroup: "九州・沖縄" },
];

// 都道府県名からPrefectureを取得（regions.tsのprefectureフィールドと照合用）
const prefectureNameMap = new Map<string, Prefecture>();
for (const p of prefectures) {
  prefectureNameMap.set(p.name, p);
}

export function getPrefectureByName(name: string): Prefecture | undefined {
  return prefectureNameMap.get(name);
}

export function getPrefectureBySlug(slug: string): Prefecture | undefined {
  return prefectures.find((p) => p.slug === slug);
}

// 地方グループ名の順序
export const regionGroupOrder = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
] as const;

// 地方ごとにグループ化
export function getPrefecturesByRegionGroup(): Map<string, Prefecture[]> {
  const map = new Map<string, Prefecture[]>();
  for (const group of regionGroupOrder) {
    map.set(group, prefectures.filter((p) => p.regionGroup === group));
  }
  return map;
}
