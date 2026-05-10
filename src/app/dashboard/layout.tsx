import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch wallet data (video schema)
  const { data: wallet } = await supabase
    .schema("video")
    .from("wallets")
    .select("monthly_credits, topup_credits, plan")
    .eq("user_id", user.id)
    .single();

  const totalCredits =
    (wallet?.monthly_credits ?? 0) + (wallet?.topup_credits ?? 0);
  const plan = wallet?.plan ?? "free";
  const userName = user.user_metadata?.["full_name"] as string | undefined;

  return (
    <div className="flex min-h-screen bg-studio-bg">
      <Sidebar
        userEmail={user.email}
        userName={userName}
        plan={plan}
        credits={totalCredits}
      />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
