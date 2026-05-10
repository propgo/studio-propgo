"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createCustomerPortalSession } from "@/lib/stripe/client";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://studio.propgo.my";

export async function startSubscriptionCheckout(stripePriceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const url = await createCheckoutSession({
    priceId: stripePriceId,
    userId: user.id,
    email: user.email ?? "",
    mode: "subscription",
    successUrl: `${BASE_URL}/dashboard/credits?upgraded=1`,
    cancelUrl: `${BASE_URL}/dashboard/credits`,
  });

  redirect(url);
}

export async function startTopupCheckout(stripePriceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const url = await createCheckoutSession({
    priceId: stripePriceId,
    userId: user.id,
    email: user.email ?? "",
    mode: "payment",
    successUrl: `${BASE_URL}/dashboard/credits?topup=1`,
    cancelUrl: `${BASE_URL}/dashboard/credits`,
    metadata: { type: "topup" },
  });

  redirect(url);
}

export async function openBillingPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: sub } = await supabase
    .schema("video")
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!sub?.stripe_customer_id) redirect("/dashboard/credits");

  const url = await createCustomerPortalSession(
    sub.stripe_customer_id as string,
    `${BASE_URL}/dashboard/credits`
  );

  redirect(url);
}
