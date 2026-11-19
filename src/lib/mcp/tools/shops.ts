// 近くの釣具店
import type { TackleShop } from "@/types";
import { getShopsForSpot, getNearbyShopsWithDistance, isSampleShopSlug } from "@/lib/data/shops";
import { shopHoursLabels } from "@/lib/shop-hours";
import {
  type ToolDef,
  ToolInputError,
  int,
  str,
  findSpot,
  requireJapanLatLng,
  haversineKm,
  round1,
  siteUrl,
} from "./shared";

const SHOP_RADIUS_KM = 30;

function shopSummary(shop: TackleShop, distanceKm: number) {
  return {
    name: shop.name,
    distanceKm: round1(distanceKm),
    address: shop.address,
    phone: shop.phone || undefined,
    businessHours: shop.businessHours,
    closedDays: shop.closedDays || undefined,
    hoursTags: shopHoursLabels(shop.businessHours),
    liveBait: shop.hasLiveBait,
    frozenBait: shop.hasFrozenBait,
    rentalRod: shop.hasRentalRod,
    parking: shop.hasParking,
    services: shop.services.slice(0, 6),
    url: siteUrl(`/shops/${shop.slug}`),
  };
}

export function findTackleShops(args: Record<string, unknown>) {
  const limit = int(args.limit, 1, 10) ?? 5;
  const slug = str(args.slug, 200);

  let lat: number;
  let lng: number;
  let spotName: string | undefined;
  let linked: TackleShop[] = [];
  if (slug) {
    const spot = findSpot(slug);
    if (!spot) {
      throw new ToolInputError(`スポット "${slug}" が見つかりません。search_spots で検索してから指定してください`);
    }
    lat = spot.latitude;
    lng = spot.longitude;
    spotName = spot.name;
    linked = getShopsForSpot(spot.slug);
  } else if (args.latitude !== undefined || args.longitude !== undefined) {
    ({ lat, lng } = requireJapanLatLng(args));
  } else {
    throw new ToolInputError("slug（釣り場）か latitude + longitude のどちらかを指定してください");
  }

  // 釣り場に紐づけ済みの店 → 半径内の近い順、で重複なく並べる（サンプル店舗は両関数とも除外済み）
  const seen = new Set<string>();
  const rows: { shop: TackleShop; distanceKm: number }[] = [];
  const push = (shop: TackleShop, d: number) => {
    if (seen.has(shop.slug) || isSampleShopSlug(shop.slug)) return;
    seen.add(shop.slug);
    rows.push({ shop, distanceKm: d });
  };
  for (const s of linked) {
    const d = haversineKm(lat, lng, s.latitude, s.longitude);
    if (d <= SHOP_RADIUS_KM * 2) push(s, d); // 紐づけミスで遠方の店が先頭に来ないよう上限を設ける
  }
  rows.sort((a, b) => a.distanceKm - b.distanceKm);
  for (const n of getNearbyShopsWithDistance(lat, lng, limit + rows.length, SHOP_RADIUS_KM)) {
    push(n.shop, n.distanceKm);
  }

  const shops = rows.slice(0, limit).map((r) => shopSummary(r.shop, r.distanceKm));
  return {
    spot: spotName,
    origin: { latitude: lat, longitude: lng },
    shops,
    note:
      shops.length === 0
        ? `半径${SHOP_RADIUS_KM}km以内にツリスポ掲載の釣具店が見つかりませんでした`
        : "営業時間・エサの在庫は変わることがあります。来店前に店舗へ確認してください。距離は直線距離です",
  };
}

export const SHOP_TOOLS: ToolDef[] = [
  {
    name: "find_tackle_shops",
    title: "近くの釣具店",
    description:
      "釣り場（slug）または緯度経度の近くの釣具店を返します（営業時間・早朝/24時間営業・活きエサ/冷凍エサ・レンタル竿・駐車場）。" +
      "「◯◯の近くで朝早く開いている釣具屋は？」「エサはどこで買える？」に使ってください。" +
      "例: {\"slug\":\"daikoku-futo\",\"limit\":3} または {\"latitude\":35.44,\"longitude\":139.64}",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "釣り場の slug（search_spots の結果）" },
        latitude: { type: "number", description: "緯度（slug を指定しない場合）" },
        longitude: { type: "number", description: "経度（slug を指定しない場合）" },
        limit: { type: "integer", minimum: 1, maximum: 10, description: "最大件数（既定5）" },
      },
    },
    run: findTackleShops,
  },
];
