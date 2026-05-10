import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@supabase/supabase-js";
import { CREDITS_PER_PLAN, type PlanId } from "@/lib/constants/plans";
import type Stripe from "stripe";

// Use service role for webhook operations
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PRICE_TO_PLAN: Record<string, PlanId> = {
  [process.env.STRIPE_PRICE_STARTER ?? ""]: "starter",
  [process.env.STRIPE_PRICE_PRO ?? ""]: "pro",
  [process.env.STRIPE_PRICE_AGENCY ?? ""]: "agency",
};

const PRICE_TO_TOPUP_CREDITS: Record<string, number> = {
  [process.env.STRIPE_PRICE_TOPUP_SMALL ?? ""]: 50,
  [process.env.STRIPE_PRICE_TOPUP_MEDIUM ?? ""]: 150,
  [process.env.STRIPE_PRICE_TOPUP_LARGE ?? ""]: 500,
};

async function grantSubscriptionCredits(userId: string, planId: PlanId, stripeSubscriptionId: string, stripeCustomerId: string) {
  const supabase = getServiceSupabase();
  const credits = CREDITS_PER_PLAN[planId] ?? 20;

  // Upsert subscription record
  await supabase.schema("video").from("subscriptions").upsert(
    {
      user_id: userId,
      plan: planId,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
      status: "active",
    },
    { onConflict: "user_id" }
  );

  // Reset monthly credits
  await supabase.schema("video").from("wallets").upsert(
    { user_id: userId, monthly_credits: credits },
    { onConflict: "user_id" }
  );

  // Log transaction
  await supabase.schema("video").from("credit_transactions").insert({
    user_id: userId,
    type: "subscription_grant",
    amount: credits,
    description: `${planId} plan — monthly credit grant`,
  });
}

async function addTopupCredits(userId: string, credits: number, paymentIntentId: string) {
  const supabase = getServiceSupabase();

  // Increment topup_credits
  const { data: wallet } = await supabase
    .schema("video")
    .from("wallets")
    .select("topup_credits")
    .eq("user_id", userId)
    .single();

  const current = (wallet?.topup_credits as number) ?? 0;

  await supabase.schema("video").from("wallets").upsert(
    { user_id: userId, topup_credits: current + credits },
    { onConflict: "user_id" }
  );

  await supabase.schema("video").from("credit_transactions").insert({
    user_id: userId,
    type: "topup",
    amount: credits,
    stripe_payment_intent_id: paymentIntentId,
    description: `Top-up: ${credits} credits`,
  });
}

async function handleSubscriptionDeleted(stripeSubscriptionId: string) {
  const supabase = getServiceSupabase();

  const { data: sub } = await supabase
    .schema("video")
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (!sub) return;

  await supabase.schema("video").from("subscriptions").update({ status: "cancelled", plan: "free" }).eq("stripe_subscription_id", stripeSubscriptionId);

  // Reset to free credits
  await supabase.schema("video").from("wallets").update({ monthly_credits: CREDITS_PER_PLAN.free }).eq("user_id", sub.user_id as string);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        if (session.mode === "subscription") {
          const subId = session.subscription as string;
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price.id ?? "";
          const planId = PRICE_TO_PLAN[priceId] ?? "starter";
          await grantSubscriptionCredits(userId, planId, subId, session.customer as string);
        } else if (session.mode === "payment") {
          // Top-up purchase
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          for (const item of lineItems.data) {
            const credits = PRICE_TO_TOPUP_CREDITS[item.price?.id ?? ""];
            if (credits) {
              await addTopupCredits(userId, credits, session.payment_intent as string);
            }
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as { subscription?: string }).subscription;
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const priceId = sub.items.data[0]?.price.id ?? "";
        const planId = PRICE_TO_PLAN[priceId] ?? "starter";
        // Monthly renewal — reset monthly credits
        await grantSubscriptionCredits(userId, planId, subId, sub.customer as string);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub.id);
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
