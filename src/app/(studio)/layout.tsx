import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CREDITS_PER_PLAN } from "@/lib/constants/plans";

export const dynamic = "force-dynamic";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  let { data: wallet } = await supabase
    .schema("video")
    .from("wallets")
    .select("monthly_credits, topup_credits, plan")
    .eq("user_id", user.id)
    .single();

  // Auto-create wallet if missing (handles users who bypassed the DB trigger)
  if (!wallet) {
    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await Promise.all([
      service.schema("video").from("profiles").upsert(
        { id: user.id },
        { onConflict: "id", ignoreDuplicates: true }
      ),
      service.schema("video").from("wallets").upsert(
        { user_id: user.id, monthly_credits: CREDITS_PER_PLAN.free, topup_credits: 0, plan: "free" },
        { onConflict: "user_id", ignoreDuplicates: true }
      ),
    ]);
    wallet = { monthly_credits: CREDITS_PER_PLAN.free, topup_credits: 0, plan: "free" };
  }

  const totalCredits =
    (wallet?.monthly_credits ?? 0) + (wallet?.topup_credits ?? 0);
  const plan = wallet?.plan ?? "free";
  const userName = user.user_metadata?.["full_name"] as string | undefined;

  return (
    <div className="relative min-h-screen bg-[#0A0A0F]">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="animate-orb absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.10]"
          style={{
            background:
              "radial-gradient(circle at center, #4A6CF7 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="animate-orb-delay absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{
            background:
              "radial-gradient(circle at center, #8B5CF6 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div className="studio-grid absolute inset-0" />
      </div>

      {/* Top header */}
      <Header
        userEmail={user.email}
        userName={userName}
        plan={plan}
        credits={totalCredits}
      />

      {/* Page content */}
      <main className="relative z-10 pb-[72px] md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
