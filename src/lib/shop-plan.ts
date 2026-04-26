import { dbGet, dbPut } from "@/lib/dynamodb";
import type { SubscriptionData } from "@/types";

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
