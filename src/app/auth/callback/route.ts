import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { CREDITS_PER_PLAN } from "@/lib/constants/plans";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/projects";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Backfill wallet + profile for OAuth/magic-link users who bypass the DB trigger.
      // ignoreDuplicates: true ensures we never overwrite an existing wallet.
      const service = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await Promise.all([
        service.schema("video").from("profiles").upsert(
          { id: data.user.id },
          { onConflict: "id", ignoreDuplicates: true }
        ),
        service.schema("video").from("wallets").upsert(
          { user_id: data.user.id, monthly_credits: CREDITS_PER_PLAN.free, topup_credits: 0, plan: "free" },
          { onConflict: "user_id", ignoreDuplicates: true }
        ),
      ]);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
