export const SUBSCRIPTION_PLANS = [
  {
    id: "free",
    label: "Free Trial",
    price: 0,
    priceLabel: "RM0/mo",
    credits: 20,
    stripePriceId: null,
    features: ["20 credits/month", "Kling 2.6 only", "720p export", "PropGo Studio watermark"],
    badge: null,
  },
  {
    id: "starter",
    label: "Starter",
    price: 49,
    priceLabel: "RM49/mo",
    credits: 100,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER ?? "",
    features: ["100 credits/month", "Kling 2.6 + Seedance 2.0", "1080p export", "No watermark", "Brand kit"],
    badge: null,
  },
  {
    id: "pro",
    label: "Pro",
    price: 99,
    priceLabel: "RM99/mo",
    credits: 300,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
    features: ["300 credits/month", "All AI models", "1080p export", "No watermark", "Brand kit", "Priority rendering"],
    badge: "Most Popular",
  },
  {
    id: "agency",
    label: "Agency",
    price: 199,
    priceLabel: "RM199/mo",
    credits: 800,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY ?? "",
    features: ["800 credits/month", "All AI models", "1080p export", "No watermark", "Brand kit", "Priority rendering", "Team access (coming soon)"],
    badge: null,
  },
] as const;

export type PlanId = (typeof SUBSCRIPTION_PLANS)[number]["id"];

export const CREDITS_PER_PLAN: Record<PlanId, number> = {
  free: 20,
  starter: 100,
  pro: 300,
  agency: 800,
};

export const TOPUP_PACKS = [
  {
    id: "small",
    label: "Small Pack",
    credits: 50,
    price: 25,
    priceLabel: "RM25",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_SMALL ?? "",
  },
  {
    id: "medium",
    label: "Medium Pack",
    credits: 150,
    price: 60,
    priceLabel: "RM60",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_MEDIUM ?? "",
    badge: "Best Value",
  },
  {
    id: "large",
    label: "Large Pack",
    credits: 500,
    price: 150,
    priceLabel: "RM150",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_LARGE ?? "",
  },
] as const;

export type TopupPackId = (typeof TOPUP_PACKS)[number]["id"];
