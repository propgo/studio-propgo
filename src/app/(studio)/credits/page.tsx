import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SUBSCRIPTION_PLANS, TOPUP_PACKS } from "@/lib/constants/plans";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
import { startSubscriptionCheckout, startTopupCheckout, openBillingPortal } from "@/lib/actions/checkout";
import { cn } from "@/lib/utils";
import { Coins, CheckCircle2, Zap, Sparkles, ArrowRight, ExternalLink } from "lucide-react";

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; topup?: string }>;
}) {
  const { upgraded, topup } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: wallet }, { data: sub }] = await Promise.all([
    supabase.schema("video").from("wallets").select("monthly_credits, topup_credits").eq("user_id", user.id).single(),
    supabase.schema("video").from("subscriptions").select("plan, status, stripe_customer_id").eq("user_id", user.id).single(),
  ]);

  let resolvedWallet = wallet;
  if (!resolvedWallet) {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await service
      .schema("video")
      .from("wallets")
      .upsert(
        { user_id: user.id, monthly_credits: SUBSCRIPTION_PLANS[0].credits, topup_credits: 0, plan: "free" },
        { onConflict: "user_id", ignoreDuplicates: true }
      );
    resolvedWallet = { monthly_credits: SUBSCRIPTION_PLANS[0].credits, topup_credits: 0 };
  }

  const monthlyCredits = (resolvedWallet?.monthly_credits as number) ?? 0;
  const topupCredits = (resolvedWallet?.topup_credits as number) ?? 0;
  const totalCredits = monthlyCredits + topupCredits;
  const currentPlan = (sub?.plan as string) ?? "free";
  const planData = SUBSCRIPTION_PLANS.find((p) => p.id === currentPlan) ?? SUBSCRIPTION_PLANS[0]!;

  return (
    <div className="px-4 py-6 md:p-8 max-w-4xl mx-auto space-y-10">
      {upgraded && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-success/10 border border-brand-success/20 text-brand-success text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Plan upgraded successfully! Your credits have been refreshed.
        </div>
      )}
      {topup && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-success/10 border border-brand-success/20 text-brand-success text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Top-up added! Credits are now available in your wallet.
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Credits & Billing</h1>
        <p className="text-white/40 text-sm mt-1">Manage your plan and credit balance.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Balance", value: totalCredits, sub: "credits available" },
          { label: "Monthly", value: monthlyCredits, sub: "resets monthly" },
          { label: "Top-up", value: topupCredits, sub: "never expire" },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] space-y-1" style={{ backdropFilter: "blur(8px)" }}>
            <p className="text-xs text-white/30 uppercase tracking-widest">{item.label}</p>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{item.value}</span>
            </div>
            <p className="text-xs text-white/25">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 rounded-2xl border border-brand-primary/20 bg-brand-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-primary" />
          </div>
          <div>
            <p className="font-semibold text-white">{planData.label} Plan</p>
            <p className="text-xs text-white/40">{planData.credits} credits/month</p>
          </div>
        </div>
        {sub?.stripe_customer_id && (
          <form action={openBillingPortal}>
            <button type="submit" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
              Manage billing <ExternalLink className="w-3 h-3" />
            </button>
          </form>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Top-Up Packs</h2>
        <div className="grid grid-cols-3 gap-3">
          {TOPUP_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={cn(
                "relative p-4 rounded-2xl border bg-white/[0.03] space-y-3",
                "badge" in pack && pack.badge ? "border-brand-primary/30" : "border-white/[0.07]"
              )}
            >
              {"badge" in pack && pack.badge && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary text-white whitespace-nowrap">
                  {pack.badge}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{pack.credits}</span>
                <span className="text-xs text-white/30">credits</span>
              </div>
              <p className="text-lg font-semibold text-white">{pack.priceLabel}</p>
              <p className="text-xs text-white/25">RM{(pack.price / pack.credits).toFixed(2)}/credit</p>
              {pack.stripePriceId ? (
                <form action={startTopupCheckout.bind(null, pack.stripePriceId)}>
                  <button type="submit" className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white/70 border border-white/[0.08] bg-white/[0.04] hover:text-white hover:border-white/20 transition-all">
                    Buy <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-white/20 text-center">Configure Stripe price ID</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">Subscription Plans</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative p-4 rounded-2xl border space-y-4 flex flex-col",
                  isCurrentPlan ? "border-brand-primary/40 bg-brand-primary/5" : "border-white/[0.07] bg-white/[0.03]"
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary text-white whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-white">{plan.label}</p>
                  <p className="text-xl font-bold text-white mt-0.5">{plan.priceLabel}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-sm text-white font-medium">{plan.credits} cr/mo</span>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-white/50">
                      <CheckCircle2 className="w-3 h-3 text-brand-success/50 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <div className="text-center text-xs text-brand-primary font-medium py-2">Current Plan</div>
                ) : plan.stripePriceId ? (
                  <form action={startSubscriptionCheckout.bind(null, plan.stripePriceId)}>
                    <button type="submit" className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg, #4A6CF7 0%, #8B5CF6 100%)" }}>
                      Upgrade <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : plan.id === "free" ? (
                  <div className="text-center text-xs text-white/25 py-2">Default plan</div>
                ) : (
                  <p className="text-xs text-white/20 text-center">Configure Stripe price ID</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
