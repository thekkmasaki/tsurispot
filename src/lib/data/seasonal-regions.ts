/**
 * seasonal/[month]/[regionGroup] が実際に配信する地域 slug と表示名。
 * seasonalページ内の REGION_GROUP_SLUGS と一致させること（kyushu-okinawa の差異に注意）。
 * テンプレ間の内部リンク（pref-month / pref-month-fish → 月×地域）で使う。
 */
export const SEASONAL_REGIONS: { slug: string; name: string }[] = [
  { slug: "hokkaido", name: "北海道" },
  { slug: "tohoku", name: "東北" },
  { slug: "kanto", name: "関東" },
  { slug: "chubu", name: "中部" },
  { slug: "kinki", name: "近畿" },
  { slug: "chugoku", name: "中国" },
  { slug: "shikoku", name: "四国" },
  { slug: "kyushu-okinawa", name: "九州・沖縄" },
];
