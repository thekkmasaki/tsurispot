import { TackleShop } from "@/types";

export const tackleShops: TackleShop[] = [
  {
    id: "shop-1",
    name: "釣具のポイント 横浜本牧店",
    slug: "point-honmoku",
    description:
      "本牧海づり施設のすぐ近く。活きエサの品揃えが豊富で、初心者向けレンタルセットも充実。スタッフが釣り方のアドバイスもしてくれます。",
    latitude: 35.4215,
    longitude: 139.668,
    address: "神奈川県横浜市中区本牧ふ頭1-5",
    phone: "045-623-XXXX",
    website: "https://example.com/point-honmoku",
    businessHours: "4:00〜21:00",
    closedDays: "年中無休",
    region: {
      id: "r6",
      prefecture: "神奈川県",
      areaName: "横浜",
      slug: "kanagawa-yokohama",
    },
    hasLiveBait: true,
    hasFrozenBait: true,
    hasRentalRod: true,
    services: [
      "活きエサ販売",
      "冷凍エサ販売",
      "レンタルロッド",
      "仕掛け作成サービス",
      "釣果情報提供",
    ],
    baitStock: [
      { name: "アオイソメ", available: true, price: "500円/パック", updatedAt: "2026-02-20" },
      { name: "ジャリメ", available: true, price: "600円/パック", updatedAt: "2026-02-20" },
      { name: "オキアミ", available: true, price: "400円/ブロック", updatedAt: "2026-02-20" },
      { name: "コマセ", available: true, price: "300円/袋", updatedAt: "2026-02-20" },
      { name: "活きアジ", available: false, updatedAt: "2026-02-20" },
    ],
    nearbySpotSlugs: ["honmoku-fishing", "daikoku-fishing"],
    imageUrl: "/images/shops/point-honmoku.jpg",
    rating: 4.5,
    isPremium: true,
  },
  {
    id: "shop-2",
    name: "上州屋 江の島店",
    slug: "joshunya-enoshima",
    description:
      "江の島エリアの釣り人御用達。サーフ・堤防・磯と幅広い釣りスタイルに対応した品揃え。地元の釣果情報にも詳しいスタッフが在籍。",
    latitude: 35.3103,
    longitude: 139.4818,
    address: "神奈川県藤沢市片瀬海岸2-10-3",
    phone: "0466-XX-XXXX",
    businessHours: "5:00〜20:00",
    closedDays: "火曜日",
    region: {
      id: "r7",
      prefecture: "神奈川県",
      areaName: "湘南",
      slug: "kanagawa-shonan",
    },
    hasLiveBait: true,
    hasFrozenBait: true,
    hasRentalRod: false,
    services: [
      "活きエサ販売",
      "冷凍エサ販売",
      "ルアー豊富",
      "釣果情報ボード",
      "仕掛け相談",
    ],
    baitStock: [
      { name: "アオイソメ", available: true, price: "500円/パック", updatedAt: "2026-02-20" },
      { name: "オキアミ", available: true, price: "400円/ブロック", updatedAt: "2026-02-20" },
      { name: "コマセ", available: true, price: "300円/袋", updatedAt: "2026-02-20" },
      { name: "サバ切り身", available: true, price: "350円/パック", updatedAt: "2026-02-20" },
    ],
    nearbySpotSlugs: ["enoshima-breakwater"],
    imageUrl: "/images/shops/joshunya-enoshima.jpg",
    rating: 4.2,
    isPremium: false,
  },
  {
    id: "shop-3",
    name: "キャスティング 豊洲店",
    slug: "casting-toyosu",
    description:
      "東京湾岸エリア最大級の品揃え。シーバス・チヌなどの湾奥ルアーフィッシングに特化したコーナーあり。初心者相談会も定期開催。",
    latitude: 35.6476,
    longitude: 139.7927,
    address: "東京都江東区豊洲6-3-1",
    phone: "03-6XXX-XXXX",
    businessHours: "10:00〜21:00",
    closedDays: "年中無休",
    region: {
      id: "r5",
      prefecture: "東京都",
      areaName: "東京湾",
      slug: "tokyo-bay",
    },
    hasLiveBait: false,
    hasFrozenBait: true,
    hasRentalRod: true,
    services: [
      "冷凍エサ販売",
      "レンタルロッド",
      "ルアー専門コーナー",
      "リールメンテナンス",
      "初心者相談会",
      "釣り教室",
    ],
    baitStock: [
      { name: "オキアミ", available: true, price: "400円/ブロック", updatedAt: "2026-02-20" },
      { name: "アミエビ", available: true, price: "350円/袋", updatedAt: "2026-02-20" },
      { name: "コマセ", available: true, price: "300円/袋", updatedAt: "2026-02-20" },
    ],
    nearbySpotSlugs: ["toyosu-gururi-park", "wakasu-seaside-park"],
    imageUrl: "/images/shops/casting-toyosu.jpg",
    rating: 4.3,
    isPremium: true,
  },
  {
    id: "shop-4",
    name: "つり具の上州屋 和歌山インター店",
    slug: "joshunya-wakayama",
    description:
      "南紀エリアへのアクセス拠点。グレ・チヌなどの磯釣りからエギングまで紀州の釣りをフルサポート。活きエサの入荷状況はお電話で確認可能。",
    latitude: 34.2406,
    longitude: 135.1929,
    address: "和歌山県和歌山市小雑賀3-5-10",
    phone: "073-4XX-XXXX",
    businessHours: "4:30〜20:00",
    closedDays: "年中無休",
    region: {
      id: "r12",
      prefecture: "和歌山県",
      areaName: "南紀",
      slug: "wakayama-nanki",
    },
    hasLiveBait: true,
    hasFrozenBait: true,
    hasRentalRod: false,
    services: [
      "活きエサ販売",
      "冷凍エサ販売",
      "磯釣り用品充実",
      "エギング専門コーナー",
      "渡船情報提供",
    ],
    baitStock: [
      { name: "アオイソメ", available: true, price: "500円/パック", updatedAt: "2026-02-20" },
      { name: "オキアミ", available: true, price: "400円/ブロック", updatedAt: "2026-02-20" },
      { name: "ボケ", available: true, price: "800円/パック", updatedAt: "2026-02-20" },
      { name: "活きアジ", available: true, price: "200円/匹", updatedAt: "2026-02-20" },
    ],
    nearbySpotSlugs: ["marina-city-fishing", "shirahama-hiki"],
    imageUrl: "/images/shops/joshunya-wakayama.jpg",
    rating: 4.1,
    isPremium: false,
  },
  {
    id: "shop-5",
    name: "フィッシング遊 大磯店",
    slug: "fishing-yu-oiso",
    description:
      "大磯港目の前の好立地。地元の新鮮な活きエサが自慢。サビキ釣りセットからルアータックルまで幅広く取り揃え。駐車場完備。",
    latitude: 35.3051,
    longitude: 139.3148,
    address: "神奈川県中郡大磯町大磯1398-6",
    phone: "0463-6X-XXXX",
    businessHours: "5:00〜19:00",
    closedDays: "水曜日",
    region: {
      id: "r47",
      prefecture: "神奈川県",
      areaName: "西湘",
      slug: "kanagawa-seisho",
    },
    hasLiveBait: true,
    hasFrozenBait: true,
    hasRentalRod: true,
    services: [
      "活きエサ販売",
      "冷凍エサ販売",
      "レンタルロッド",
      "駐車場完備",
      "釣果情報提供",
    ],
    baitStock: [
      { name: "アオイソメ", available: true, price: "500円/パック", updatedAt: "2026-02-20" },
      { name: "ジャリメ", available: true, price: "600円/パック", updatedAt: "2026-02-20" },
      { name: "オキアミ", available: true, price: "400円/ブロック", updatedAt: "2026-02-20" },
    ],
    nearbySpotSlugs: ["oiso-port"],
    imageUrl: "/images/shops/fishing-yu-oiso.jpg",
    rating: 4.0,
    isPremium: false,
  },
];

export function getShopBySlug(slug: string): TackleShop | undefined {
  return tackleShops.find((shop) => shop.slug === slug);
}

export function getNearbyShops(
  lat: number,
  lng: number,
  limit: number = 3
): TackleShop[] {
  return [...tackleShops]
    .map((shop) => ({
      shop,
      distance: Math.sqrt(
        Math.pow(shop.latitude - lat, 2) + Math.pow(shop.longitude - lng, 2)
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((item) => item.shop);
}

export function getShopsForSpot(spotSlug: string): TackleShop[] {
  return tackleShops.filter((shop) =>
    shop.nearbySpotSlugs.includes(spotSlug)
  );
}
