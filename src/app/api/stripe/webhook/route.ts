import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { checkStripeWebhookEnv } from "@/lib/stripe-env";
import { dbGet, dbPut, dbExists } from "@/lib/dynamodb";
import {
  getShopSlugByCustomerId,
  setStripeCustomerId,
  updateSubscription,
} from "@/lib/shop-plan";
import type { SubscriptionData } from "@/types";

export const runtime = "nodejs";

/** Stripe v22+: current_period_end は items.data[0] にある */
function getPeriodEnd(sub: Stripe.Subscription): string {
  const epoch = sub.items?.data?.[0]?.current_period_end;
  return epoch ? new Date(epoch * 1000).toISOString() : new Date().toISOString();
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  // Stripe 環境変数チェック（未設定なら署名検証できないため受け付けない）
  const env = checkStripeWebhookEnv();
  if (!stripe || !env.ok || !env.webhookSecret) {
    console.error("[Stripe webhook] 環境変数が未設定です:", env.missing.join(", "));
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  // 冪等性チェック
  const alreadyProcessed = await dbExists(`WEBHOOK#${event.id}`, "PROCESSED");
  if (alreadyProcessed) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const shopSlug = session.metadata?.shopSlug;
        const plan = session.metadata?.plan as "basic" | "pro" | undefined;
        if (!shopSlug || !plan) break;

        // Customer ID保存
        if (session.customer) {
          const customerId = typeof session.customer === "string"
            ? session.customer
            : session.customer.id;
          await setStripeCustomerId(shopSlug, customerId);
        }

        // サブスクリプション情報保存
        if (session.subscription) {
          const subId = typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subId);
          await updateSubscription(shopSlug, {
            stripeSubscriptionId: subId,
            plan,
            status: "active",
            currentPeriodEnd: getPeriodEnd(subscription),
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
        const shopSlug = await getShopSlugByCustomerId(customerId);
        if (!shopSlug) break;

        const plan = subscription.metadata?.plan as "basic" | "pro" | undefined;
        const currentSub = await dbGet<SubscriptionData>(`SHOP#${shopSlug}`, "SUBSCRIPTION");

        await updateSubscription(shopSlug, {
          stripeSubscriptionId: subscription.id,
          plan: plan || currentSub?.plan || "basic",
          status: subscription.status === "active" ? "active"
            : subscription.status === "past_due" ? "past_due"
            : subscription.status === "canceled" ? "canceled"
            : "unpaid",
          currentPeriodEnd: getPeriodEnd(subscription),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
        const shopSlug = await getShopSlugByCustomerId(customerId);
        if (!shopSlug) break;

        await updateSubscription(shopSlug, {
          stripeSubscriptionId: subscription.id,
          plan: "basic",
          status: "canceled",
          currentPeriodEnd: getPeriodEnd(subscription),
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : (invoice.customer as Stripe.Customer)?.id;
        if (!customerId) break;
        const shopSlug = await getShopSlugByCustomerId(customerId);
        if (!shopSlug) break;

        const currentSub = await dbGet<SubscriptionData>(`SHOP#${shopSlug}`, "SUBSCRIPTION");
        if (currentSub) {
          await updateSubscription(shopSlug, { ...currentSub, status: "past_due" });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : (invoice.customer as Stripe.Customer)?.id;
        if (!customerId) break;
        const shopSlug = await getShopSlugByCustomerId(customerId);
        if (!shopSlug) break;

        const currentSub = await dbGet<SubscriptionData>(`SHOP#${shopSlug}`, "SUBSCRIPTION");
        if (currentSub) {
          await updateSubscription(shopSlug, { ...currentSub, status: "active" });
        }
        break;
      }
    }
  } catch (err) {
    console.error(`Webhook processing error for ${event.type}:`, err);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  // 冪等性マーク（30日TTL）。書き込みに失敗してもイベント自体は処理済みなので、
  // received:true を返して Stripe の不要なリトライ（＝二重処理）を避ける。
  try {
    await dbPut(`WEBHOOK#${event.id}`, "PROCESSED", true, 30 * 86400);
  } catch (err) {
    console.error("[Stripe webhook] 冪等マーク書き込み失敗:", event.id, err);
  }

  return NextResponse.json({ received: true });
}
