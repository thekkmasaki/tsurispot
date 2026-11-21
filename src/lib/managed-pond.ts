/**
 * 管理釣り場・釣り堀（isManagedPond）向けの SEO / GEO ヘルパー。
 *
 * 方針: データにある事実だけを文章にする。未確認・未登録の項目は「ない」と書かず、黙って省く。
 * （海の堤防向け自動生成文が「現地にトイレはない」等と断定していた問題への対策）
 * 純関数のみ。Next.js API やデータ層は import しない（テスト・クライアントからも使える）。
 */
import type { FishingSpot } from "@/types";
import { getSpotCategory, getSpotCategoryDetail, SPOT_CATEGORY_LABELS } from "./spot-category";
import { composeMetaDescription } from "./seo/meta-description";
import { TITLE_MAX } from "./utils/seo";

type ManagedInput = Pick<
  FishingSpot,
  | "name"
  | "slug"
  | "address"
  | "accessInfo"
  | "region"
  | "spotType"
  | "isManagedPond"
  | "facilityKind"
  | "feeDetail"
  | "isFree"
  | "hasRentalRod"
  | "rentalDetail"
  | "hasParking"
  | "parkingDetail"
  | "officialUrl"
  | "managementInfo"
  | "rules"
  | "catchableFish"
>;

const UNKNOWN_RE = /未確認|記載なし|不明/;

/** 「管理釣り場」「釣り堀」「海上釣り堀」のいずれか */
export function facilityLabel(spot: Pick<FishingSpot, "spotType" | "isManagedPond" | "facilityKind">): string {
  return getSpotCategoryDetail(spot) === "海上釣り堀"
    ? "海上釣り堀"
    : SPOT_CATEGORY_LABELS[getSpotCategory(spot)];
}

/** 末尾の句点を除く（文を連結するときの「。。」防止） */
function trimStop(t: string): string {
  return t.trim().replace(/[。.]+$/, "");
}

/**
 * 「未確認」「記載なし」を含む括弧書き・読点区切りの断片を取り除く。
 * 取り除いて何も残らなければ undefined（＝その項目は載せない）。
 */
function clean(text: string | undefined): string | undefined {
  let t = text?.trim();
  if (!t) return undefined;
  t = t.replace(/[（(][^）)]*(?:未確認|記載なし|不明)[^）)]*[）)]/g, "");
  if (UNKNOWN_RE.test(t)) {
    t = t
      .split("、")
      .filter((seg) => !UNKNOWN_RE.test(seg))
      .join("、");
  }
  t = trimStop(t);
  return t || undefined;
}

/** 営業時間（未確認表記は除外） */
export function openingHoursText(spot: ManagedInput): string | undefined {
  return clean(spot.managementInfo?.openingHours);
}

/** 定休日（「なし」は「定休日なし」に整形、未確認は除外） */
export function closedDaysText(spot: ManagedInput): string | undefined {
  const t = clean(spot.managementInfo?.closedDays);
  if (!t) return undefined;
  if (t === "なし") return "定休日なし";
  return t;
}

/** 詳しい料金文（feeDetail 優先） */
export function feeFullText(spot: ManagedInput): string | undefined {
  return clean(spot.feeDetail) ?? clean(spot.managementInfo?.fishingFee);
}

/** タイトル・description 用の短い料金（先頭の1項目だけ） */
export function feeShortText(spot: ManagedInput): string | undefined {
  const src = clean(spot.managementInfo?.fishingFee) ?? clean(spot.feeDetail);
  if (!src) return undefined;
  const first = src.split(/\s*[/／、]\s*/)[0]?.trim();
  if (!first || first.length > 30 || !/円/.test(first)) return undefined;
  return first;
}

export function phoneText(spot: ManagedInput): string | undefined {
  return clean(spot.managementInfo?.contactPhone);
}

/** 確認日（managementInfo.notes の「確認日 YYYY-MM-DD」から） */
export function verifiedDate(spot: ManagedInput): string | undefined {
  for (const n of spot.managementInfo?.notes ?? []) {
    const m = n.match(/確認日\s*(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return undefined;
}

function uniqueFishNames(spot: ManagedInput, limit = 6): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const cf of spot.catchableFish) {
    if (!seen.has(cf.fish.name)) {
      seen.add(cf.fish.name);
      out.push(cf.fish.name);
    }
  }
  return out.slice(0, limit);
}

function uniqueMethods(spot: ManagedInput, limit = 3): string[] {
  const seen = new Set<string>();
  for (const cf of spot.catchableFish) {
    const m = clean(cf.method);
    if (m) seen.add(m);
  }
  return [...seen].slice(0, limit);
}

/** 住所（「番地は未確認」等の注記は除く） */
export function addressText(spot: Pick<FishingSpot, "address">): string {
  return clean(spot.address) ?? spot.address;
}

/** 市区町村（住所から）。取れなければ areaName */
export function municipality(spot: Pick<FishingSpot, "address" | "region">): string {
  const addr = spot.address.replace(spot.region.prefecture, "");
  const m = addr.match(/^(.+?[市区町村])/);
  return m ? m[1] : spot.region.areaName;
}

// ───────────────────────── title / description ─────────────────────────

/** 実データがある項目だけ並べた title。 例: 〇〇の料金・営業時間・釣れる魚｜埼玉県の管理釣り場 */
export function buildManagedTitle(spot: ManagedInput): string {
  const tokens: string[] = [];
  if (feeFullText(spot)) tokens.push("料金");
  if (openingHoursText(spot)) tokens.push("営業時間");
  tokens.push("釣れる魚");
  const body = `${spot.name}の${tokens.join("・")}`;
  const label = facilityLabel(spot);
  const candidates = [
    `${body}｜${spot.region.prefecture}の${label}`,
    `${body}｜${label}`,
    body,
    `${spot.name}の釣り情報`,
  ];
  return candidates.find((c) => c.length <= TITLE_MAX) ?? candidates[candidates.length - 1];
}

export function buildManagedMetaDescription(
  spot: ManagedInput & { description: string },
  opts: { latestSentence?: string | false } = {},
): string {
  const label = facilityLabel(spot);
  const fee = feeShortText(spot);
  const hours = openingHoursText(spot);
  const closed = closedDaysText(spot);
  const fish = uniqueFishNames(spot, 3);
  const methods = uniqueMethods(spot, 2);
  const rental = spot.hasRentalRod;

  const facts = [
    fee ? `料金は${trimStop(fee)}` : false,
    hours ? `営業時間は${trimStop(hours)}` : false,
    closed ? `定休日は${trimStop(closed)}` : false,
  ].filter(Boolean) as string[];

  return composeMetaDescription(
    [
      opts.latestSentence || false,
      `${spot.name}は${municipality(spot) === spot.region.areaName ? spot.region.prefecture : spot.region.prefecture + municipality(spot)}の${label}。`,
      facts.length > 0 ? `${facts.join("、")}。` : false,
      fish.length > 0
        ? `釣れる魚は${fish.join("・")}${methods.length > 0 ? `、釣り方は${methods.join("・")}` : ""}。`
        : false,
      rental ? "レンタルタックルあり。" : false,
      "料金・営業時間・定休日・アクセスを、確認日つきで掲載しています。",
    ],
    {
      fallbackTail: [
        "最新の料金や営業日は公式サイトでご確認ください。",
        `${spot.region.prefecture}の${label}選びにご活用ください。`,
      ],
    },
  );
}

// ───────────────────────── 冒頭の要約（GEO） ─────────────────────────

/** AI・音声が引用しやすい「事実だけ」の要約文。データがある項目のみ。 */
export function buildManagedLead(spot: ManagedInput): string {
  const label = facilityLabel(spot);
  const parts: string[] = [`${spot.name}は、${addressText(spot)}にある${label}です。`];
  const fee = feeFullText(spot);
  if (fee) parts.push(`料金: ${trimStop(fee)}。`);
  const hours = openingHoursText(spot);
  if (hours) parts.push(`営業時間: ${trimStop(hours)}。`);
  const closed = closedDaysText(spot);
  if (closed) parts.push(`定休日: ${trimStop(closed)}。`);
  const fish = uniqueFishNames(spot, 6);
  if (fish.length > 0) parts.push(`釣れる魚: ${fish.join("・")}。`);
  if (spot.hasRentalRod) parts.push("レンタルタックルあり。");
  const v = verifiedDate(spot);
  if (v) {
    const [y, mo, d] = v.split("-").map(Number);
    parts.push(`（${y}年${mo}月${d}日時点の公式情報より）`);
  }
  return parts.join("");
}

// ───────────────────────── 箇条書き要約 ─────────────────────────

export function buildManagedSummary(spot: ManagedInput): {
  oneLineFeature: string;
  topFishAndSeason: string;
  recommendedMethod: string;
  facilityOverview: string;
  difficultyComment: string;
} {
  const label = facilityLabel(spot);
  const fish = uniqueFishNames(spot, 3);
  // 「ほかN種」= 重複除去後の総種数 − 実際に表示した種数
  const remainingFish = uniqueFishNames(spot, Infinity).length - fish.length;
  const methods = uniqueMethods(spot, 3);
  const hours = openingHoursText(spot);
  const closed = closedDaysText(spot);
  const fee = feeShortText(spot);
  const facility: string[] = [];
  if (spot.hasParking) facility.push("駐車場あり");
  if (spot.hasRentalRod) facility.push("レンタルあり");
  if (hours) facility.push(`営業 ${trimStop(hours)}`);
  if (closed) facility.push(`定休日 ${trimStop(closed)}`);
  return {
    oneLineFeature: `${spot.region.areaName}エリアの${label}。${fee ? `料金は${fee}。` : "料金・ルールは施設ごとに異なります。"}`,
    topFishAndSeason: `狙える魚: ${fish.join("・") || "—"}${remainingFish > 0 ? `ほか${remainingFish}種` : ""}`,
    recommendedMethod: methods.length > 0 ? `釣り方: ${methods.join("・")}` : "釣り方は公式サイトで確認",
    facilityOverview: facility.length > 0 ? facility.join(" / ") : "設備・営業時間は公式サイトで確認",
    difficultyComment: `${spot.name}のレギュレーション（釣法・持ち帰り・時間券）は施設ごとに決まっています。釣行前に公式サイトで最新情報をご確認ください。`,
  };
}

// ───────────────────────── FAQ ─────────────────────────

export function buildManagedFaqs(spot: ManagedInput): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  const fish = uniqueFishNames(spot, 6);
  const methods = uniqueMethods(spot, 3);
  const official = spot.officialUrl ? "最新情報は公式サイトでご確認ください。" : "";

  if (fish.length > 0) {
    faqs.push({
      question: `${spot.name}ではどんな魚が釣れますか？`,
      answer: `${spot.name}で釣れる魚は${fish.join("・")}です。${methods.length > 0 ? `釣り方は${methods.join("・")}。` : ""}`,
    });
  }
  const fee = feeFullText(spot);
  if (fee) {
    faqs.push({
      question: `${spot.name}の料金はいくらですか？`,
      answer: `${trimStop(fee)}。料金は改定されることがあります。${official}`,
    });
  }
  const hours = openingHoursText(spot);
  const closed = closedDaysText(spot);
  if (hours || closed) {
    faqs.push({
      question: `${spot.name}の営業時間と定休日は？`,
      answer: `${hours ? `営業時間は${trimStop(hours)}。` : ""}${closed ? `定休日は${trimStop(closed)}。` : ""}${official}`,
    });
  }
  if (spot.hasRentalRod) {
    faqs.push({
      question: `${spot.name}でレンタルタックルは借りられますか？`,
      answer: `はい。${clean(spot.rentalDetail) ? `${trimStop(clean(spot.rentalDetail)!)}。` : "レンタルタックルがあります。"}${official}`,
    });
  }
  const accessInfo = clean(spot.accessInfo);
  const parkingDetail = clean(spot.parkingDetail);
  const access = [
    accessInfo ? trimStop(accessInfo) : undefined,
    spot.hasParking && !(accessInfo && parkingDetail && accessInfo.includes(trimStop(parkingDetail)))
      ? `駐車場あり${parkingDetail ? `（${trimStop(parkingDetail)}）` : ""}`
      : undefined,
  ]
    .filter(Boolean)
    .join("。");
  faqs.push({
    question: `${spot.name}へのアクセスは？`,
    answer: `所在地は${addressText(spot)}です。${access ? `${access}。` : ""}`,
  });
  const rules = (spot.rules?.otherRules ?? []).map((r) => clean(r)).filter((r): r is string => Boolean(r));
  if (rules.length > 0) {
    faqs.push({
      question: `${spot.name}の釣りのルールは？`,
      answer: `${rules.slice(0, 4).map(trimStop).join("、")}。${official}`,
    });
  }
  const phone = phoneText(spot);
  if (phone) {
    faqs.push({
      question: `${spot.name}に予約は必要ですか？`,
      answer: `予約の要否は時期や施設の運用により異なります。お問い合わせは電話 ${phone} へ。${official}`,
    });
  }
  return faqs.slice(0, 7);
}

// ───────────────────────── 構造化データ ─────────────────────────

const JP_DAYS: Record<string, string> = {
  月: "Monday",
  火: "Tuesday",
  水: "Wednesday",
  木: "Thursday",
  金: "Friday",
  土: "Saturday",
  日: "Sunday",
};
const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * 機械可読な営業時間。「9:00〜17:00」のような単純な1区間 ＋ 単純な定休日だけ変換する。
 * 平日/土日で違う・季節限定・祝日例外などは変換せず undefined（文章では掲載済み）。
 */
export function openingHoursSpec(spot: ManagedInput): object[] | undefined {
  const hours = openingHoursText(spot);
  const m = hours?.match(/^(\d{1,2}):(\d{2})〜(\d{1,2}):(\d{2})$/);
  if (!m) return undefined;
  const pad = (h: string, mm: string) => `${h.padStart(2, "0")}:${mm}`;
  const opens = pad(m[1], m[2]);
  const closes = pad(m[3], m[4]);

  const closedRaw = clean(spot.managementInfo?.closedDays);
  let days = ALL_DAYS;
  if (closedRaw && closedRaw !== "年中無休" && closedRaw !== "なし") {
    const cm = closedRaw.match(/^(?:毎週)?([月火水木金土日])(?:曜日?)?(?:[・、]([月火水木金土日])(?:曜日?)?)?$/);
    if (!cm) return undefined;
    const closed = new Set([cm[1], cm[2]].filter(Boolean).map((d) => JP_DAYS[d]));
    days = ALL_DAYS.filter((d) => !closed.has(d));
  }
  return [{ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes }];
}

/** 施設型の JSON-LD 追加フィールド（TouristAttraction に足す） */
export function managedJsonLdExtras(spot: ManagedInput): Record<string, unknown> {
  const extras: Record<string, unknown> = {};
  const phone = phoneText(spot);
  if (phone) extras.telephone = phone;
  const spec = openingHoursSpec(spot);
  if (spec) extras.openingHoursSpecification = spec;
  const fee = feeShortText(spot);
  if (fee) extras.priceRange = fee;
  return extras;
}
