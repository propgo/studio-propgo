import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia", typescript: true });
  }
  return _stripe;
}

// Convenience alias — lazily resolved
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export async function createCheckoutSession({
  priceId,
  userId,
  email,
  mode,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  priceId: string;
  userId: string;
  email: string;
  mode: "subscription" | "payment";
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      ...metadata,
    },
    payment_method_types: ["card"],
    ...(mode === "subscription" && {
      subscription_data: { metadata: { userId } },
    }),
  });

  return session.url!;
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
