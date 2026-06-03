import { dbGet, dbPut, dbBatchGet } from "@/lib/dynamodb";
import { getShopBySlug } from "@/lib/data/shops";
import type { SubscriptionData } from "@/types";

export type EffectivePlan = "free" | "basic" | "pro";

export async function getShopSubscription(slug: string): Promise<SubscriptionData | null> {
  return dbGet<SubscriptionData>(`SHOP#${slug}`, "SUBSCRIPTION");
}

export async function getStripeCustomerId(slug: string): Promise<string | null> {
  return dbGet<string>(`SHOP#${slug}`, "STRIPE_CUSTOMER");
}

export async function setStripeCustomerId(slug: string, customerId: string): Promise<void> {
  await Promise.all([
    dbPut(`SHOP#${slug}`, "STRIPE_CUSTOMER", customerId),
    dbPut(`STRIPE_CUSTOMER#${customerId}`, "SHOP", slug),
  ]);
}

export async function updateSubscription(slug: string, data: SubscriptionData): Promise<void> {
  await dbPut(`SHOP#${slug}`, "SUBSCRIPTION", data);
}

export async function getShopSlugByCustomerId(customerId: string): Promise<string | null> {
  return dbGet<string>(`STRIPE_CUSTOMER#${customerId}`, "SHOP");
}

/** サブスクが有料扱い(active/past_due)か。past_due は支払い遅延だが即停止しない。 */
function isPaidStatus(status: SubscriptionData["status"]): boolean {
  return status === "active" || status === "past_due";
}

/**
 * 課金状態を加味した「実効プラン」。
 * DynamoDB の active/past_due サブスクを優先し、無ければ静的 shop.planLevel に
 * フォールバックする。これにより「課金したら公開ページに反映、解約したら戻る」を実現。
 */
export async function getEffectivePlan(slug: string): Promise<EffectivePlan> {
  let sub: SubscriptionData | null = null;
  try {
    sub = await getShopSubscription(slug);
  } catch (err) {
    // DynamoDB 障害時は静的プランにフォールバック（決済機能は落ちても表示は維持）
    console.error("[getEffectivePlan] サブスク取得失敗、静的プランにフォールバック:", err);
  }
  if (sub && isPaidStatus(sub.status)) return sub.plan;
  return getShopBySlug(slug)?.planLevel ?? "free";
}

/**
 * 複数店舗の実効プランを1回の BatchGet でまとめて取得する（一覧ソート用）。
 * 静的 planLevel をデフォルトに、有料サブスクがある店舗のみ上書きする。
 */
export async function getEffectivePlanMap(
  slugs: string[]
): Promise<Record<string, EffectivePlan>> {
  if (slugs.length === 0) return {};
  let subs: (SubscriptionData | null)[];
  try {
    subs = await dbBatchGet<SubscriptionData>(
      slugs.map((s) => ({ pk: `SHOP#${s}`, sk: "SUBSCRIPTION" }))
    );
  } catch (err) {
    // ビルド時(AWS認証なし)やDynamoDB障害でも一覧生成を止めない＝静的プランにフォールバック
    console.error("[getEffectivePlanMap] BatchGet 失敗、静的プランにフォールバック:", err);
    subs = slugs.map(() => null);
  }
  const map: Record<string, EffectivePlan> = {};
  slugs.forEach((slug, i) => {
    const sub = subs[i];
    map[slug] = sub && isPaidStatus(sub.status)
      ? sub.plan
      : getShopBySlug(slug)?.planLevel ?? "free";
  });
  return map;
}
