import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { CREDITS_PER_PLAN } from "@/lib/constants/plans";

export type CookieSupabaseClient = Awaited<ReturnType<typeof createClient>>;

/** Load wallet for the signed-in user, bootstrapping via service role if missing. */
export async function getOrCreateVideoWallet(
  supabase: CookieSupabaseClient,
  userId: string
): Promise<{
  monthly_credits: number;
  topup_credits: number;
  plan: string;
}> {
  let { data: wallet } = await supabase
    .schema("video")
    .from("wallets")
    .select("monthly_credits, topup_credits, plan")
    .eq("user_id", userId)
    .single();

  if (!wallet) {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await Promise.all([
      service.schema("video").from("profiles").upsert(
        { id: userId },
        { onConflict: "id", ignoreDuplicates: true }
      ),
      service.schema("video").from("wallets").upsert(
        {
          user_id: userId,
          monthly_credits: CREDITS_PER_PLAN.free,
          topup_credits: 0,
          plan: "free",
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      ),
    ]);
    ({ data: wallet } = await supabase
      .schema("video")
      .from("wallets")
      .select("monthly_credits, topup_credits, plan")
      .eq("user_id", userId)
      .single());

    if (!wallet) {
      return {
        monthly_credits: CREDITS_PER_PLAN.free,
        topup_credits: 0,
        plan: "free",
      };
    }
  }

  return {
    monthly_credits: wallet.monthly_credits ?? 0,
    topup_credits: wallet.topup_credits ?? 0,
    plan: wallet.plan ?? "free",
  };
}
