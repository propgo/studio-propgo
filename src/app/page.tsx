import { LandingPage, type LandingAuth } from "@/components/landing/landing-page";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateVideoWallet } from "@/lib/video-wallet";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let landingAuth: LandingAuth | null = null;
  if (user) {
    const wallet = await getOrCreateVideoWallet(supabase, user.id);
    const userName =
      (user.user_metadata?.["full_name"] as string | undefined) ??
      undefined;
    landingAuth = {
      userEmail: user.email ?? "Account",
      ...(userName ? { userName } : {}),
      plan: wallet.plan,
      credits: wallet.monthly_credits + wallet.topup_credits,
    };
  }

  return <LandingPage landingAuth={landingAuth} />;
}
