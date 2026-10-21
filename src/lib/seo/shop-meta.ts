/**
 * 釣具店ページ（/shops/area/[prefecture] ・ /shops/[slug]）の title / description ビルダー。
 *
 * 背景（GSC 実測 2026-09-21〜10-18・28日・/shops/ 配下）:
 *  - area 一覧 38,970imp / CTR 0.62%。クエリの 87% は「釣具屋」「近くの釣具屋」「◯◯ 釣具屋」の
 *    汎用・地名系（CTR 0.3〜0.6%）。旧 title が前方で答えていた時間帯系（24時間/営業中）は 7%
 *    （2,890imp・CTR 1.56%）に留まる。
 *  - 店舗詳細 37,881imp / CTR 1.33%。クエリの 74% は店名そのもの（28,004imp・CTR 1.41%）、
 *    「◯◯ 営業時間」系は 14%。旧 title は「店名の営業時間｜…」と営業時間を主語にしていた。
 *
 * 方針: 汎用・店名クエリに title 前方で答え（県名・件数・市区町村名 / 店名・市区町村）、
 * 時間帯・エサの実件数は description と H1 直下リードに残す。載せる数字・地名はすべて
 * shops データから算出した実値のみ（誇張・推定は入れない）。
 *
 * 純関数: ページコンポーネントや Next.js API を import しない（vitest で全件検証する）。
 */
import type { TackleShop } from "@/types";
import { composeMetaDescription, firstSentence } from "@/lib/seo/meta-description";

/** SERP で切れずに表示できる title の目安（全角 32 字。layout の template が「| ツリスポ（つりすぽ）」を後置する）。 */
export const SHOP_TITLE_MAX = 32;

/** コードポイント数（SERP の体感長に一致）。 */
export function cpLength(text: string): number {
  return [...text].length;
}

/** 候補を優先順に試し、最初に SHOP_TITLE_MAX 以内に収まるものを返す（全滅時は最後の候補）。 */
export function pickTitle(
  candidates: Array<string | false | null | undefined>,
  max = SHOP_TITLE_MAX,
): string {
  const list = candidates.filter(
    (c): c is string => typeof c === "string" && c.length > 0,
  );
  return list.find((c) => cpLength(c) <= max) ?? list[list.length - 1] ?? "";
}

/**
 * 住所から市区町村名を取り出す。
 *  - 先頭の郵便番号・都道府県名を除去
 *  - 「◯◯郡」は読み飛ばし、町村名を返す（安芸郡坂町 → 坂町）
 *  - 「四日市市」「廿日市市」のように末尾が市区町村字で続く場合は 1 文字延長する
 * 取れない住所（サンプル店舗など）は "" を返し、呼び出し側で region.areaName に倒す。
 */
export function extractCity(address: string, prefecture?: string): string {
  let rest = address.replace(/^〒?\s*\d{3}-?\d{4}\s*/, "").trim();
  if (prefecture && rest.startsWith(prefecture)) rest = rest.slice(prefecture.length);
  rest = rest.replace(/^(?:東京都|北海道|京都府|大阪府|.{2,3}県)/, "").trim();
  const m = rest.match(/^(?:.{1,6}郡)?(.{1,8}?[市区町村])/);
  if (!m) return "";
  let city = m[1];
  let i = m[0].length;
  while (/[市区町村]/.test(rest[i] ?? "")) {
    city += rest[i];
    i++;
  }
  return city;
}

/** 店舗の市区町村表示名（住所から取れなければエリア名）。 */
export function shopCity(shop: Pick<TackleShop, "address" | "region">): string {
  return extractCity(shop.address, shop.region.prefecture) || shop.region.areaName;
}

export interface CityCount {
  name: string;
  count: number;
}

/** 店舗を市区町村ごとに集計し、件数の多い順に返す（同数は出現順）。 */
export function countShopsByCity(
  shops: Array<Pick<TackleShop, "address" | "region">>,
): CityCount[] {
  const map = new Map<string, number>();
  for (const s of shops) {
    const city = extractCity(s.address, s.region.prefecture);
    if (!city) continue;
    map.set(city, (map.get(city) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 時間帯・エサ取扱の実件数。
 * businessHours は自由記述のため、「24時間営業」単独表記の店だけを 24 時間営業として数える。
 * 「平日3:00〜23:00 / 金・土・祝前日 24時間営業」のような曜日限定営業は常時 24 時間ではないので
 * 除外し（過大表示の回避）、開店時刻が 5 時以前なら早朝営業として数える。
 */
export function countShopUtility(
  shops: Array<
    Pick<TackleShop, "businessHours" | "hasLiveBait" | "hasFrozenBait" | "hasRentalRod">
  >,
) {
  const is24 = (hours: string) => hours.trim() === "24時間営業";
  const isEarly = (hours: string) => {
    if (is24(hours)) return false;
    const m = hours.match(/(\d{1,2}):\d{2}/);
    return m ? Number(m[1]) <= 5 : false;
  };
  return {
    n24: shops.filter((s) => is24(s.businessHours)).length,
    nEarly: shops.filter((s) => isEarly(s.businessHours)).length,
    nLive: shops.filter((s) => s.hasLiveBait).length,
    nFrozen: shops.filter((s) => s.hasFrozenBait).length,
    nRental: shops.filter((s) => s.hasRentalRod).length,
  };
}

/** 「大阪市・堺市など」のような市区町村の短い列挙（limit 件＋残りがあれば「など」）。 */
export function joinCities(cities: CityCount[], limit: number): string {
  if (cities.length === 0) return "";
  const names = cities.slice(0, limit).map((c) => c.name).join("・");
  return cities.length > limit ? `${names}など` : names;
}

// ───────────────────────────── エリア一覧 ─────────────────────────────

export interface ShopAreaMetaInput {
  prefName: string;
  shops: Array<
    Pick<
      TackleShop,
      "name" | "address" | "region" | "businessHours" | "hasLiveBait" | "hasFrozenBait" | "hasRentalRod"
    >
  >;
}

/**
 * エリア一覧 title。「◯◯県の釣具屋」「釣具屋」（ローカル）クエリに県名・件数・市区町村名で答える。
 * 例: 大阪府の釣具屋・釣具店35件｜大阪市・堺市など営業時間掲載
 */
export function buildShopAreaTitle({ prefName, shops }: ShopAreaMetaInput): string {
  const count = shops.length;
  if (count === 0) return `${prefName}の釣具屋・釣具店一覧`;
  const cities = countShopsByCity(shops);
  const base = `${prefName}の釣具屋・釣具店${count}件`;
  return pickTitle([
    cities.length >= 2 && `${base}｜${joinCities(cities, 2)}営業時間掲載`,
    cities.length >= 1 && `${base}｜${joinCities(cities, 1)}営業時間掲載`,
    `${base}｜営業時間・住所掲載`,
  ]);
}

/** エリア一覧 description（120〜158 字・実データのみ）。 */
export function buildShopAreaDescription({ prefName, shops }: ShopAreaMetaInput): string {
  const count = shops.length;
  if (count === 0) {
    return `${prefName}の釣具屋・釣具店は掲載準備中です。近隣県の釣具店一覧や${prefName}の人気釣りスポット情報をご覧いただけます。`;
  }
  const cities = countShopsByCity(shops);
  const { n24, nEarly, nLive, nFrozen, nRental } = countShopUtility(shops);
  const utility = [
    n24 > 0 ? `24時間営業${n24}件` : null,
    nEarly > 0 ? `早朝営業${nEarly}件` : null,
    nLive > 0 ? `活きエサ取扱${nLive}件` : null,
    nFrozen > 0 ? `冷凍エサ取扱${nFrozen}件` : null,
    nRental > 0 ? `レンタルロッド${nRental}件` : null,
  ]
    .filter(Boolean)
    .join("・");
  const timingNote =
    n24 > 0
      ? "深夜・早朝のエサ調達に使える店も含みます。"
      : nEarly > 0
        ? "朝マズメ前に開く店も含みます。"
        : "";
  const cityPhrase =
    cities.length > 1
      ? `${joinCities(cities, 3)}${cities.length}市区町村の店舗`
      : cities.length === 1
        ? `${cities[0].name}の店舗`
        : "各店舗";
  const topShopNames = shops.slice(0, 2).map((s) => s.name).join("・");
  return composeMetaDescription(
    [
      `${prefName}の釣具屋・釣具店${count}件を一覧掲載。`,
      `${cityPhrase}の営業時間・住所・電話番号・エサ取扱をまとめて比較できます。`,
      utility ? `${utility}。` : false,
      timingNote || false,
      topShopNames ? `${topShopNames}などを掲載。` : false,
    ],
    {
      fallbackTail: [
        `${prefName}の人気釣りスポットや近隣県の釣具店にもリンクしています。`,
        "釣行前のエサ・仕掛けの調達にご活用ください。",
      ],
    },
  );
}

/**
 * H1 直下のリード文（本文側でも title/description の主張と同じ実数を示す）。
 * 例: 大阪府の釣具店・釣りエサ店35件を掲載中。大阪市12件・堺市5件・岸和田市3件など13市区町村。24時間営業1件・早朝営業9件。
 */
export function buildShopAreaLead({ prefName, shops }: ShopAreaMetaInput): string {
  const count = shops.length;
  if (count === 0) return "掲載準備中 ― 情報が入り次第追加します";
  const cities = countShopsByCity(shops);
  const { n24, nEarly } = countShopUtility(shops);
  const cityPart =
    cities.length > 1
      ? `${cities
          .slice(0, 3)
          .map((c) => `${c.name}${c.count}件`)
          .join("・")}${cities.length > 3 ? "など" : ""}${cities.length}市区町村。`
      : cities.length === 1
        ? `${cities[0].name}の店舗です。`
        : "";
  const hours = [
    n24 > 0 ? `24時間営業${n24}件` : null,
    nEarly > 0 ? `早朝営業${nEarly}件` : null,
  ]
    .filter(Boolean)
    .join("・");
  return `${prefName}の釣具店・釣りエサ店${count}件を掲載中。${cityPart}${hours ? `${hours}。` : ""}`;
}

// ───────────────────────────── 店舗詳細 ─────────────────────────────

/**
 * SERP のタイトルに載せられる営業時間表記を返す。
 * businessHours は自由記述。"平日 6:00〜21:00 / 土 5:00〜22:00" や
 * "4/16〜12/16: 5:00〜18:00 / …" のように曜日・季節で変わる店は、片方だけを
 * 単独表記にするとタイトルが誤情報になるため実値を出さない（description には全文が載る）。
 * 通年で単一レンジの店と "24時間営業" の店だけを対象にする。
 */
export function shortBusinessHours(businessHours: string): string {
  const value = businessHours.trim();
  if (value === "24時間営業") return "24時間営業";
  const single = value.match(/^\d{1,2}:\d{2}\s*[〜~ー－-]\s*\d{1,2}:\d{2}$/);
  return single ? value.replace(/\s+/g, "") : "";
}

export type ShopDetailMetaInput = Pick<
  TackleShop,
  | "name"
  | "address"
  | "region"
  | "businessHours"
  | "closedDays"
  | "phone"
  | "hasLiveBait"
  | "hasFrozenBait"
  | "hasRentalRod"
  | "hasParking"
  | "description"
>;

/**
 * 店舗詳細 title。店名クエリ（詳細ページ流入の 74%）に店名を先頭で一致させ、
 * 続けて所在地（県＋市区町村）と営業時間の実値を表示幅に収まる範囲で足す。
 * 例: 浜岡釣具店｜静岡県御前崎市の釣具店・営業時間8:00〜18:00
 */
export function buildShopDetailTitle(shop: ShopDetailMetaInput): string {
  const city = shopCity(shop);
  const pref = shop.region.prefecture;
  const hours = shortBusinessHours(shop.businessHours);
  return pickTitle([
    hours && `${shop.name}｜${pref}${city}の釣具店・営業時間${hours}`,
    hours && `${shop.name}｜${city}の釣具店・営業時間${hours}`,
    hours && `${shop.name}｜${city}の釣具店・${hours}`,
    `${shop.name}｜${pref}${city}の釣具店・営業時間`,
    `${shop.name}｜${city}の釣具店・営業時間`,
    `${shop.name}｜${city}の釣具店`,
    `${shop.name}｜釣具店・営業時間`,
    shop.name,
  ]);
}

/**
 * 店舗詳細 description。「店名（県・市区町村）→ 住所・電話 → 営業時間・定休日 → 取扱」の順で、
 * 店名クエリのスニペットに所在地と営業時間が前方で入るようにする。
 */
export function buildShopDetailDescription(shop: ShopDetailMetaInput): string {
  const city = shopCity(shop);
  const pref = shop.region.prefecture;
  const address = shop.address.replace(/^〒?\s*\d{3}-?\d{4}\s*/, "");
  const baitStock = [
    shop.hasLiveBait ? "活きエサ" : "",
    shop.hasFrozenBait ? "冷凍エサ" : "",
    shop.hasRentalRod ? "レンタルロッド" : "",
  ]
    .filter(Boolean)
    .join("・");
  // shop.description が営業時間から書き起こしている店があるので、重複する場合は落とす。
  const shopLead = firstSentence(shop.description, 60);
  const hasClosed = Boolean(shop.closedDays) && shop.closedDays !== "お問い合わせください";
  // "営業時間は店舗にお問い合わせください" のように既に「営業時間は」で始まる値は二重にしない。
  const hoursRaw = shop.businessHours.trim();
  const hoursSentence = !hoursRaw
    ? "営業時間は店舗にお問い合わせください"
    : hoursRaw.startsWith("営業時間は")
      ? hoursRaw
      : hoursRaw === "お問い合わせください"
        ? "営業時間は店舗にお問い合わせください"
        : `営業時間は${hoursRaw}`;
  return composeMetaDescription(
    [
      `${shop.name}は${pref}${city}の釣具店。`,
      `住所は${address}${shop.phone ? `、電話は${shop.phone}` : ""}。`,
      `${hoursSentence}${hasClosed ? `、定休日は${shop.closedDays}` : ""}。`,
      baitStock
        ? `${baitStock}の取扱あり${shop.hasParking ? "、駐車場あり" : ""}。`
        : shop.hasParking
          ? "駐車場あり。"
          : false,
      shopLead && !shopLead.startsWith("営業時間") && !shopLead.startsWith("定休日")
        ? shopLead
        : false,
    ],
    {
      fallbackTail: [
        `${pref}${shop.region.areaName}で釣行前にエサ・仕掛けを揃えられる釣具店です。`,
        "近くの釣りスポット情報もあわせて掲載しています。",
      ],
    },
  );
}
